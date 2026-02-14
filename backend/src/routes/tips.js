const express = require('express');
const router = express.Router();
const db = require('../database');
const { auth, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Admin check function
const checkAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: '需要管理员权限' });
  }
};

// Get all tips
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, u.nickname as editor_name, u.avatar as editor_avatar, u.school as editor_school
      FROM tips t
      JOIN users u ON t.editor_id = u.id
      WHERE t.status = 'published'
    `;
    const params = [];

    if (category) {
      query += ' AND t.category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (t.title LIKE ? OR t.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY t.updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const tips = await db.prepare(query).all(...params);

    res.json({ tips, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({ error: 'Failed to get tips' });
  }
});

// Get single tip with edit history
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const tip = await db.prepare(`
      SELECT t.*, u.nickname as editor_name, u.avatar as editor_avatar, u.school as editor_school
      FROM tips t
      JOIN users u ON t.editor_id = u.id
      WHERE t.id = ?
    `).get(req.params.id);

    if (!tip) {
      return res.status(404).json({ error: 'Tip not found' });
    }

    // Get edit history
    const editHistory = await db.prepare(`
      SELECT te.*, u.nickname as editor_name
      FROM tip_edits te
      JOIN users u ON te.editor_id = u.id
      WHERE te.tip_id = ?
      ORDER BY te.version DESC
      LIMIT 10
    `).all(req.params.id);

    res.json({ tip, editHistory });
  } catch (error) {
    console.error('Get tip error:', error);
    res.status(500).json({ error: 'Failed to get tip' });
  }
});

// Create tip
router.post('/', auth, checkAdmin, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category } = req.body;

    const result = db.prepare(`
      INSERT INTO tips (title, content, category, editor_id, last_edit_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content, category || 'general', req.user.id, req.user.id);

    // Create initial edit history
    db.prepare(`
      INSERT INTO tip_edits (tip_id, editor_id, content, version)
      VALUES (?, ?, ?, 1)
    `).run(result.lastInsertRowid, req.user.id, content);

    const tip = db.prepare('SELECT * FROM tips WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Tip created successfully', tip });
  } catch (error) {
    console.error('Create tip error:', error);
    res.status(500).json({ error: 'Failed to create tip' });
  }
});

// Update tip (wiki-style editing)
router.put('/:id', auth, checkAdmin, [
  body('content').notEmpty().withMessage('Content is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tip = db.prepare('SELECT * FROM tips WHERE id = ?').get(req.params.id);

    if (!tip) {
      return res.status(404).json({ error: 'Tip not found' });
    }

    const { content } = req.body;

    // Increment version
    const newVersion = tip.version + 1;

    // Update tip
    db.prepare(`
      UPDATE tips
      SET content = ?, last_edit_id = ?, version = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(content, req.user.id, newVersion, req.params.id);

    // Add to edit history
    db.prepare(`
      INSERT INTO tip_edits (tip_id, editor_id, content, version)
      VALUES (?, ?, ?, ?)
    `).run(req.params.id, req.user.id, content, newVersion);

    const updatedTip = db.prepare('SELECT * FROM tips WHERE id = ?').get(req.params.id);

    res.json({ message: 'Tip updated successfully', tip: updatedTip });
  } catch (error) {
    console.error('Update tip error:', error);
    res.status(500).json({ error: 'Failed to update tip' });
  }
});

// Delete tip (admin only)
router.delete('/:id', auth, checkAdmin, (req, res) => {
  try {
    // Admin check already performed by checkAdmin middleware
    // This check is redundant but kept for clarity

    db.prepare('UPDATE tips SET status = "deleted" WHERE id = ?').run(req.params.id);

    res.json({ message: 'Tip deleted successfully' });
  } catch (error) {
    console.error('Delete tip error:', error);
    res.status(500).json({ error: 'Failed to delete tip' });
  }
});

// Get tip categories
router.get('/categories/list', (req, res) => {
  try {
    const categories = [
      { id: 'study', name: '学习指南', icon: 'book' },
      { id: 'life', name: '生活贴士', icon: 'heart' },
      { id: 'course', name: '选课攻略', icon: 'list' },
      { id: 'facility', name: '设施使用', icon: 'building' },
      { id: 'activity', name: '活动指南', icon: 'calendar' },
      { id: 'other', name: '其他', icon: 'more' }
    ];

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

module.exports = router;
