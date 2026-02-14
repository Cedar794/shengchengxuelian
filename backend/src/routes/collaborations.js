const express = require('express');
const router = express.Router();
const db = require('../database');
const { auth, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all collaborations
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, department } = req.query;

    let query = `
      SELECT c.*, u.nickname as creator_name,
             (c.completed_tasks * 100.0 / NULLIF(c.total_tasks, 0)) as progress
      FROM collaborations c
      JOIN users u ON c.creator_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    if (department) {
      query += ' AND c.department = ?';
      params.push(department);
    }

    query += ' ORDER BY c.created_at DESC';

    const collaborations = await db.prepare(query).all(...params);

    res.json({ collaborations });
  } catch (error) {
    console.error('Get collaborations error:', error);
    res.status(500).json({ error: 'Failed to get collaborations' });
  }
});

// Get single collaboration with tasks
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const collaboration = await db.prepare(`
      SELECT c.*, u.nickname as creator_name
      FROM collaborations c
      JOIN users u ON c.creator_id = u.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    // Get tasks
    const tasks = await db.prepare(`
      SELECT ct.*, u.nickname as assignee_name, u.avatar as assignee_avatar
      FROM collaboration_tasks ct
      LEFT JOIN users u ON ct.assignee_id = u.id
      WHERE ct.collaboration_id = ?
      ORDER BY ct.order_index, ct.created_at
    `).all(req.params.id);

    res.json({ collaboration, tasks });
  } catch (error) {
    console.error('Get collaboration error:', error);
    res.status(500).json({ error: 'Failed to get collaboration' });
  }
});

// Create collaboration
router.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, department, priority } = req.body;

    const result = db.prepare(`
      INSERT INTO collaborations (title, description, department, priority, creator_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, description, department, priority || 'medium', req.user.id);

    const collaboration = db.prepare('SELECT * FROM collaborations WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Collaboration created successfully', collaboration });
  } catch (error) {
    console.error('Create collaboration error:', error);
    res.status(500).json({ error: 'Failed to create collaboration' });
  }
});

// Add task to collaboration
router.post('/:id/tasks', auth, [
  body('title').notEmpty().withMessage('Task title is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, assignee_id, priority, due_date, order_index } = req.body;

    const result = db.prepare(`
      INSERT INTO collaboration_tasks (collaboration_id, title, description, assignee_id, priority, due_date, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, title, description, assignee_id, priority || 'medium', due_date, order_index || 0);

    // Update task count
    db.prepare('UPDATE collaborations SET total_tasks = total_tasks + 1 WHERE id = ?').run(req.params.id);

    const task = db.prepare('SELECT * FROM collaboration_tasks WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Task added successfully', task });
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Update task status
router.put('/:collaborationId/tasks/:taskId', auth, (req, res) => {
  try {
    const { status, assignee_id } = req.body;

    const task = db.prepare('SELECT * FROM collaboration_tasks WHERE id = ? AND collaboration_id = ?').get(req.params.taskId, req.params.collaborationId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // If status changed to completed, update collaboration
    if (status === 'completed' && task.status !== 'completed') {
      db.prepare('UPDATE collaborations SET completed_tasks = completed_tasks + 1 WHERE id = ?').run(req.params.collaborationId);
    }

    db.prepare(`
      UPDATE collaboration_tasks
      SET status = COALESCE(?, status),
          assignee_id = COALESCE(?, assignee_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, assignee_id, req.params.taskId);

    const updatedTask = db.prepare('SELECT * FROM collaboration_tasks WHERE id = ?').get(req.params.taskId);

    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Get my tasks
router.get('/my-tasks', auth, (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT ct.*, c.title as collaboration_title,
             (SELECT nickname FROM users WHERE id = c.creator_id) as creator_name
      FROM collaboration_tasks ct
      JOIN collaborations c ON ct.collaboration_id = c.id
      WHERE ct.assignee_id = ? AND ct.status != 'completed'
      ORDER BY ct.due_date, ct.created_at
    `).all(req.user.id);

    res.json({ tasks });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

module.exports = router;
