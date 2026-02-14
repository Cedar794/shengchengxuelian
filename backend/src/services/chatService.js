const db = require('../database');

/**
 * Chat Service for managing chat sessions and messages
 */

class ChatService {
  /**
   * Get or create AI chat session for user
   */
  async getOrCreateAISession(userId, context = null) {
    let session = await db.prepare(
      'SELECT * FROM ai_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1'
    ).get(userId);

    if (!session) {
      const result = await db.prepare(
        'INSERT INTO ai_sessions (user_id, context) VALUES (?, ?)'
      ).run(userId, context ? JSON.stringify(context) : null);
      session = await db.prepare('SELECT * FROM ai_sessions WHERE id = ?').get(result.lastInsertRowid);
    }

    return session;
  }

  /**
   * Get AI session by ID
   */
  async getAISession(sessionId) {
    return await db.prepare('SELECT * FROM ai_sessions WHERE id = ?').get(sessionId);
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId, limit = 50) {
    const messages = await db.prepare(
      'SELECT * FROM ai_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?'
    ).all(sessionId, limit);

    // Parse any JSON fields if needed
    return messages.map(msg => ({
      ...msg,
      content: msg.content
    }));
  }

  /**
   * Save a message to the session
   */
  async saveMessage(sessionId, role, content) {
    const result = await db.prepare(
      'INSERT INTO ai_messages (session_id, role, content) VALUES (?, ?, ?)'
    ).run(sessionId, role, content);

    // Update session message count and updated_at
    await db.prepare(
      'UPDATE ai_sessions SET message_count = message_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(sessionId);

    return await db.prepare('SELECT * FROM ai_messages WHERE id = ?').get(result.lastInsertRowid);
  }

  /**
   * Clear chat history for a session
   */
  async clearChatHistory(sessionId) {
    await db.prepare('DELETE FROM ai_messages WHERE session_id = ?').run(sessionId);
    await db.prepare('UPDATE ai_sessions SET message_count = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(sessionId);
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId) {
    await db.prepare('DELETE FROM ai_messages WHERE session_id = ?').run(sessionId);
    await db.prepare('DELETE FROM ai_sessions WHERE id = ?').run(sessionId);
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId) {
    const sessions = await db.prepare(
      'SELECT * FROM ai_sessions WHERE user_id = ? ORDER BY updated_at DESC'
    ).all(userId);

    return sessions.map(session => ({
      ...session,
      context: session.context ? JSON.parse(session.context) : null
    }));
  }

  /**
   * Update session context
   */
  async updateSessionContext(sessionId, context) {
    await db.prepare(
      'UPDATE ai_sessions SET context = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(JSON.stringify(context), sessionId);
  }

  /**
   * Get formatted messages for AI API
   */
  async getMessagesForAI(sessionId) {
    const messages = await this.getChatHistory(sessionId);
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Create a new chat session
   */
  async createSession(userId, context = null) {
    const result = await db.prepare(
      'INSERT INTO ai_sessions (user_id, context) VALUES (?, ?)'
    ).run(userId, context ? JSON.stringify(context) : null);

    return await db.prepare('SELECT * FROM ai_sessions WHERE id = ?').get(result.lastInsertRowid);
  }
}

module.exports = new ChatService();
