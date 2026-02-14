const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const aiService = require('../services/aiService');
const db = require('../database');

/**
 * POST /api/chat
 * Main chat endpoint for AI conversations
 * Supports both regular and streaming responses
 */
router.post('/', auth, async (req, res) => {
  try {
    const { message, conversation_id, stream = false } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation
    let conversation;
    if (conversation_id) {
      conversation = await db.prepare(
        'SELECT * FROM chats WHERE id = ? AND user_id = ?'
      ).get(conversation_id, req.user.id);

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      // Create new conversation
      const result = await db.prepare(
        'INSERT INTO chats (user_id, title) VALUES (?, ?)'
      ).run(req.user.id, message.substring(0, 50) + (message.length > 50 ? '...' : ''));

      conversation = await db.prepare('SELECT * FROM chats WHERE id = ?').get(result.lastInsertRowid);
    }

    // Save user message
    await db.prepare(
      'INSERT INTO chat_messages (chat_id, role, content) VALUES (?, ?, ?)'
    ).run(conversation.id, 'user', message);

    // Get conversation history
    const history = await db.prepare(
      'SELECT role, content FROM chat_messages WHERE chat_id = ? ORDER BY created_at ASC'
    ).all(conversation.id);

    // Generate AI response
    const response = await aiService.generateResponse(history, {});

    // Save AI response
    await db.prepare(
      'INSERT INTO chat_messages (chat_id, role, content) VALUES (?, ?, ?)'
    ).run(conversation.id, 'assistant', response.content);

    // Update conversation timestamp
    await db.prepare(
      'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(conversation.id);

    res.json({
      id: conversation.id,
      message: response.content,
      role: 'assistant',
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * POST /api/chat/stream
 * Streaming chat endpoint using Server-Sent Events
 */
router.post('/stream', auth, async (req, res) => {
  try {
    const { message, conversation_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Get or create conversation
    let conversation;
    if (conversation_id) {
      conversation = await db.prepare(
        'SELECT * FROM chats WHERE id = ? AND user_id = ?'
      ).get(conversation_id, req.user.id);

      if (!conversation) {
        res.write(`data: ${JSON.stringify({ error: 'Conversation not found' })}\n\n`);
        return res.end();
      }
    } else {
      // Create new conversation
      const result = await db.prepare(
        'INSERT INTO chats (user_id, title) VALUES (?, ?)'
      ).run(req.user.id, message.substring(0, 50) + (message.length > 50 ? '...' : ''));

      conversation = await db.prepare('SELECT * FROM chats WHERE id = ?').get(result.lastInsertRowid);
    }

    // Send conversation ID
    res.write(`data: ${JSON.stringify({ type: 'conversation_id', id: conversation.id })}\n\n`);

    // Save user message
    await db.prepare(
      'INSERT INTO chat_messages (chat_id, role, content) VALUES (?, ?, ?)'
    ).run(conversation.id, 'user', message);

    // Get conversation history
    const history = await db.prepare(
      'SELECT role, content FROM chat_messages WHERE chat_id = ? ORDER BY created_at ASC'
    ).all(conversation.id);

    // Get streaming response
    const stream = await aiService.generateStreamingResponse(history, {});

    let fullResponse = '';

    stream.on('data', (chunk) => {
      res.write(chunk);

      const match = chunk.toString().match(/data: ({.*})\n\n/);
      if (match) {
        try {
          const data = JSON.parse(match[1]);
          if (data.content && !data.done) {
            fullResponse += data.content;
          }
        } catch (e) {}
      }
    });

    stream.on('end', async () => {
      // Save complete AI response
      if (fullResponse) {
        await db.prepare(
          'INSERT INTO chat_messages (chat_id, role, content) VALUES (?, ?, ?)'
        ).run(conversation.id, 'assistant', fullResponse);

        // Update conversation timestamp
        await db.prepare(
          'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(conversation.id);
      }
      res.end();
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Chat stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process message' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Failed to process message' })}\n\n`);
      res.end();
    }
  }
});

/**
 * GET /api/chat/conversations
 * Get all conversations for current user
 */
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await db.prepare(`
      SELECT c.*,
             (SELECT content FROM chat_messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM chats c
      WHERE c.user_id = ?
      ORDER BY c.updated_at DESC
    `).all(req.user.id);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

/**
 * GET /api/chat/conversations/:id
 * Get a specific conversation with messages
 */
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await db.prepare(
      'SELECT * FROM chats WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await db.prepare(
      'SELECT * FROM chat_messages WHERE chat_id = ? ORDER BY created_at ASC'
    ).all(id);

    res.json({ conversation, messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

/**
 * DELETE /api/chat/conversations/:id
 * Delete a conversation
 */
router.delete('/conversations/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const conversation = await db.prepare(
      'SELECT * FROM chats WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete messages first (foreign key)
    await db.prepare('DELETE FROM chat_messages WHERE chat_id = ?').run(id);

    // Delete conversation
    await db.prepare('DELETE FROM chats WHERE id = ?').run(id);

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

/**
 * DELETE /api/chat/conversations/:id/messages
 * Clear all messages in a conversation
 */
router.delete('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const conversation = await db.prepare(
      'SELECT * FROM chats WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await db.prepare('DELETE FROM chat_messages WHERE chat_id = ?').run(id);

    res.json({ message: 'Messages cleared' });
  } catch (error) {
    console.error('Clear messages error:', error);
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

module.exports = router;
