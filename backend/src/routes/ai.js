const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const aiService = require('../services/aiService');
const chatService = require('../services/chatService');

/**
 * POST /api/ai/chat
 * Send a message to AI and get a response
 */
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create session
    let session;
    if (sessionId) {
      session = await chatService.getAISession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
    } else {
      session = await chatService.getOrCreateAISession(req.user.id, context);
    }

    // Save user message
    await chatService.saveMessage(session.id, 'user', message);

    // Get chat history for context
    const messages = await chatService.getMessagesForAI(session.id);

    // Generate AI response
    const response = await aiService.generateResponse(messages, { context });

    // Save AI response
    await chatService.saveMessage(session.id, 'assistant', response.content);

    res.json({
      response: response.content,
      sessionId: session.id,
      model: response.model,
      usage: response.usage
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message', details: error.message });
  }
});

/**
 * POST /api/ai/chat/stream
 * Send a message to AI and get a streaming response (SSE)
 */
router.post('/chat/stream', auth, async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Get or create session
    let session;
    if (sessionId) {
      session = await chatService.getAISession(sessionId);
      if (!session) {
        res.write(`data: ${JSON.stringify({ error: 'Session not found' })}\n\n`);
        return res.end();
      }
    } else {
      session = await chatService.getOrCreateAISession(req.user.id, context);
    }

    // Send session ID
    res.write(`data: ${JSON.stringify({ type: 'session', sessionId: session.id })}\n\n`);

    // Save user message
    await chatService.saveMessage(session.id, 'user', message);

    // Get chat history for context
    const messages = await chatService.getMessagesForAI(session.id);

    // Get streaming response
    const stream = await aiService.generateStreamingResponse(messages, { context });

    let fullResponse = '';

    // Pipe stream to response
    stream.on('data', (chunk) => {
      res.write(chunk);

      // Extract content for saving
      const match = chunk.toString().match(/data: ({.*})\n\n/);
      if (match) {
        try {
          const data = JSON.parse(match[1]);
          if (data.content && !data.done) {
            fullResponse += data.content;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });

    stream.on('end', async () => {
      // Save complete AI response
      if (fullResponse) {
        await chatService.saveMessage(session.id, 'assistant', fullResponse);
      }
      res.end();
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('AI chat stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat message', details: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Failed to process chat message' })}\n\n`);
      res.end();
    }
  }
});

/**
 * GET /api/ai/chat/history
 * Get chat history for current user
 */
router.get('/chat/history', auth, async (req, res) => {
  try {
    const { sessionId, limit = 50 } = req.query;

    let messages;

    if (sessionId) {
      messages = await chatService.getChatHistory(sessionId, parseInt(limit));
    } else {
      const session = await chatService.getOrCreateAISession(req.user.id);
      messages = await chatService.getChatHistory(session.id, parseInt(limit));
    }

    res.json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

/**
 * GET /api/ai/chat/sessions
 * Get all chat sessions for current user
 */
router.get('/chat/sessions', auth, async (req, res) => {
  try {
    const sessions = await chatService.getUserSessions(req.user.id);
    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

/**
 * POST /api/ai/chat/sessions
 * Create a new chat session
 */
router.post('/chat/sessions', auth, async (req, res) => {
  try {
    const { context } = req.body;
    const session = await chatService.createSession(req.user.id, context);
    res.status(201).json({ session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * DELETE /api/ai/chat/history
 * Clear chat history for current session
 */
router.delete('/chat/history', auth, async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (sessionId) {
      await chatService.clearChatHistory(sessionId);
    } else {
      const session = await chatService.getOrCreateAISession(req.user.id);
      await chatService.clearChatHistory(session.id);
    }

    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

/**
 * DELETE /api/ai/chat/sessions/:sessionId
 * Delete a chat session
 */
router.delete('/chat/sessions/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    await chatService.deleteSession(sessionId);
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

/**
 * GET /api/ai/recommendations
 * Get personalized recommendations based on user profile
 */
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { type } = req.query; // activities, groups, projects
    const db = require('../database');

    const user = await db.prepare('SELECT tags, school FROM users WHERE id = ?').get(req.user.id);

    if (!user || !user.tags) {
      return res.json({ recommendations: [] });
    }

    let recommendations = [];

    if (type === 'activities') {
      recommendations = await db.prepare(`
        SELECT a.*, 'activity' as type
        FROM activities a
        WHERE a.status = 'open'
        ORDER BY a.created_at DESC
        LIMIT 5
      `).all();
    } else if (type === 'groups') {
      recommendations = await db.prepare(`
        SELECT g.*, 'group' as type
        FROM groups g
        WHERE g.status = 'active' AND g.type = 'public'
        ORDER BY g.member_count DESC
        LIMIT 5
      `).all();
    } else if (type === 'projects') {
      recommendations = await db.prepare(`
        SELECT p.*, 'project' as type
        FROM projects p
        WHERE p.status = 'recruiting'
        ORDER BY p.created_at DESC
        LIMIT 5
      `).all();
    } else {
      // Mixed recommendations
      const activities = await db.prepare(`
        SELECT a.*, 'activity' as type
        FROM activities a
        WHERE a.status = 'open'
        ORDER BY a.created_at DESC
        LIMIT 3
      `).all();

      const groups = await db.prepare(`
        SELECT g.*, 'group' as type
        FROM groups g
        WHERE g.status = 'active' AND g.type = 'public'
        ORDER BY g.member_count DESC
        LIMIT 3
      `).all();

      const projects = await db.prepare(`
        SELECT p.*, 'project' as type
        FROM projects p
        WHERE p.status = 'recruiting'
        ORDER BY p.created_at DESC
        LIMIT 3
      `).all();

      recommendations = [...activities, ...groups, ...projects];
    }

    // Parse JSON fields
    recommendations.forEach(item => {
      if (item.tags) item.tags = JSON.parse(item.tags);
      if (item.target_tags) item.target_tags = JSON.parse(item.target_tags);
      if (item.required_skills) item.required_skills = JSON.parse(item.required_skills);
    });

    res.json({ recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * GET /api/ai/status
 * Check AI service status
 */
router.get('/status', auth, async (req, res) => {
  try {
    res.json({
      configured: aiService.isConfigured(),
      provider: process.env.AI_PROVIDER || 'zhipu',
      model: process.env.AI_MODEL || 'glm-4-flash'
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

module.exports = router;
