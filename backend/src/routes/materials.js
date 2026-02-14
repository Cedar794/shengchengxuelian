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

// Get all materials with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, type, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT m.*, u.nickname as uploader_name, u.school as uploader_school
      FROM materials m
      JOIN users u ON m.uploader_id = u.id
      WHERE m.status = 'active'
    `;
    const params = [];

    if (category) {
      query += ' AND m.category = ?';
      params.push(category);
    }
    if (type) {
      query += ' AND m.type = ?';
      params.push(type);
    }
    if (search) {
      query += ' AND (m.title LIKE ? OR m.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY m.download_count DESC, m.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const materials = await db.prepare(query).all(...params);

    // Parse JSON fields
    materials.forEach(material => {
      if (material.tags) material.tags = JSON.parse(material.tags);
    });

    res.json({ materials, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Failed to get materials' });
  }
});

// Get single material
router.get('/:id', async (req, res) => {
  try {
    const material = await db.prepare(`
      SELECT m.*, u.nickname as uploader_name, u.avatar as uploader_avatar, u.school as uploader_school
      FROM materials m
      JOIN users u ON m.uploader_id = u.id
      WHERE m.id = ?
    `).get(req.params.id);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Parse tags
    if (material.tags) material.tags = JSON.parse(material.tags);

    res.json({ material });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ error: 'Failed to get material' });
  }
});

// Create material
router.post('/', auth, checkAdmin, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').notEmpty().withMessage('Type is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, type, file_url, file_size, category, tags } = req.body;

    const result = await db.prepare(`
      INSERT INTO materials (title, description, type, file_url, file_size, uploader_id, category, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, type, file_url, file_size, req.user.id, category, tags ? JSON.stringify(tags) : null);

    const material = await db.prepare('SELECT * FROM materials WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Material uploaded successfully', material });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// Record download
router.post('/:id/download', auth, async (req, res) => {
  try {
    await db.prepare('UPDATE materials SET download_count = download_count + 1 WHERE id = ?').run(req.params.id);

    const material = await db.prepare('SELECT file_url FROM materials WHERE id = ?').get(req.params.id);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: 'Download recorded', file_url: material.file_url });
  } catch (error) {
    console.error('Record download error:', error);
    res.status(500).json({ error: 'Failed to record download' });
  }
});

// Update material
router.put('/:id', auth, checkAdmin, async (req, res) => {
  try {
    const material = await db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Check permission: only admin can update (already checked by checkAdmin middleware)
    // This check is redundant but kept for clarity

    const { title, description, category, tags, download_count } = req.body;

    await db.prepare(`
      UPDATE materials
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          tags = COALESCE(?, tags),
          download_count = COALESCE(?, download_count),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description, category, tags ? JSON.stringify(tags) : null, download_count, req.params.id);

    const updatedMaterial = await db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);

    res.json({ message: 'Material updated successfully', material: updatedMaterial });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

// Delete material
router.delete('/:id', auth, checkAdmin, async (req, res) => {
  try {
    const material = await db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Check permission: only admin can delete (already checked by checkAdmin middleware)
    // This check is redundant but kept for clarity

    await db.prepare('UPDATE materials SET status = "deleted" WHERE id = ?').run(req.params.id);

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

module.exports = router;
