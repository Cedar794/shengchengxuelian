const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { auth, JWT_SECRET } = require('../middleware/auth');

// Register
router.post('/register', [
  body('student_id').notEmpty().withMessage('Student ID is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('school').notEmpty().withMessage('School is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student_id, password, nickname, school, major, grade, tags } = req.body;

    // Check if user exists
    const existingUser = await db.prepare('SELECT id FROM users WHERE student_id = ?').get(student_id);
    if (existingUser) {
      return res.status(400).json({ error: 'Student ID already registered' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const result = await db.prepare(`
      INSERT INTO users (student_id, password, nickname, school, major, grade, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(student_id, hashedPassword, nickname || student_id, school, major, grade, tags ? JSON.stringify(tags) : null);

    const user = await db.prepare('SELECT id, student_id, nickname, avatar, school, major, grade, tags, role FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('student_id').notEmpty().withMessage('Student ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student_id, password } = req.body;

    // Find user
    const user = await db.prepare('SELECT * FROM users WHERE student_id = ?').get(student_id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db.prepare(`
      SELECT id, student_id, nickname, avatar, school, major, grade, tags, role, bio, status, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
