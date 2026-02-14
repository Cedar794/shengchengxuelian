const express = require('express');
const router = express.Router();
const db = require('../database');
const { auth } = require('../middleware/auth');

// Get user profile
router.get('/:id', auth, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, student_id, nickname, avatar, school, major, grade, tags, role, bio, created_at
      FROM users WHERE id = ?
    `).get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
router.put('/profile', auth, (req, res) => {
  try {
    const { nickname, avatar, major, grade, bio, tags } = req.body;

    db.prepare(`
      UPDATE users
      SET nickname = COALESCE(?, nickname),
          avatar = COALESCE(?, avatar),
          major = COALESCE(?, major),
          grade = COALESCE(?, grade),
          bio = COALESCE(?, bio),
          tags = COALESCE(?, tags),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nickname, avatar, major, grade, bio, tags ? JSON.stringify(tags) : null, req.user.id);

    const user = db.prepare(`
      SELECT id, student_id, nickname, avatar, school, major, grade, tags, role, bio
      FROM users WHERE id = ?
    `).get(req.user.id);

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Record user behavior (for recommendation system)
router.post('/behavior', auth, (req, res) => {
  try {
    const { page, action, target_id, target_type } = req.body;

    db.prepare(`
      INSERT INTO user_behaviors (user_id, page, action, target_id, target_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, page, action, target_id, target_type);

    res.json({ message: 'Behavior recorded' });
  } catch (error) {
    console.error('Record behavior error:', error);
    res.status(500).json({ error: 'Failed to record behavior' });
  }
});

// Get user statistics
router.get('/:id/stats', auth, (req, res) => {
  try {
    const userId = req.params.id;

    // Get activity participation count
    const activityCount = db.prepare('SELECT COUNT(*) as count FROM activity_registrations WHERE user_id = ?').get(userId).count;

    // Get listings count
    const listingCount = db.prepare('SELECT COUNT(*) as count FROM listings WHERE seller_id = ?').get(userId).count;

    // Get group memberships count
    const groupCount = db.prepare('SELECT COUNT(*) as count FROM group_members WHERE user_id = ? AND status = "active"').get(userId).count;

    // Get project participations count
    const projectCount = db.prepare('SELECT COUNT(*) as count FROM project_members WHERE user_id = ?').get(userId).count;

    res.json({
      activities: activityCount,
      listings: listingCount,
      groups: groupCount,
      projects: projectCount
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user statistics' });
  }
});

module.exports = router;
