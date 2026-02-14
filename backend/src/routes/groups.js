const express = require('express');
const router = express.Router();
const db = require('../database');
const { auth, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all groups
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, school, tags, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT g.*, u.nickname as creator_name, u.avatar as creator_avatar
      FROM groups g
      JOIN users u ON g.creator_id = u.id
      WHERE g.status = 'active'
    `;
    const params = [];

    if (type) {
      query += ' AND g.type = ?';
      params.push(type);
    }
    if (school) {
      query += ' AND g.school = ?';
      params.push(school);
    }
    if (search) {
      query += ' AND (g.name LIKE ? OR g.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY g.member_count DESC, g.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const groups = await db.prepare(query).all(...params);

    // Parse JSON fields
    groups.forEach(group => {
      if (group.tags) group.tags = JSON.parse(group.tags);
    });

    res.json({ groups, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
});

// Get single group with posts
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const group = await db.prepare(`
      SELECT g.*, u.nickname as creator_name, u.avatar as creator_avatar, u.school as creator_school
      FROM groups g
      JOIN users u ON g.creator_id = u.id
      WHERE g.id = ?
    `).get(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Parse tags
    if (group.tags) group.tags = JSON.parse(group.tags);

    // Get members
    const members = await db.prepare(`
      SELECT gm.*, u.nickname, u.avatar, u.school, u.major
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ? AND gm.status = 'active'
      ORDER BY gm.joined_at
      LIMIT 20
    `).all(req.params.id);

    // Get posts
    const posts = await db.prepare(`
      SELECT gp.*, u.nickname, u.avatar, u.school
      FROM group_posts gp
      JOIN users u ON gp.user_id = u.id
      WHERE gp.group_id = ?
      ORDER BY gp.created_at DESC
      LIMIT 20
    `).all(req.params.id);

    // Parse post images
    posts.forEach(post => {
      if (post.images) post.images = JSON.parse(post.images);
    });

    // Check if user is member
    let isMember = false;
    let memberRole = null;
    if (req.user) {
      const membership = await db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?').get(req.params.id, req.user.id);
      if (membership) {
        isMember = true;
        memberRole = membership.role;
      }
    }

    res.json({ group, members, posts, isMember, memberRole });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to get group' });
  }
});

// Create group
router.post('/', auth, [
  body('name').notEmpty().withMessage('Group name is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, tags, type, max_members } = req.body;

    const user = await db.prepare('SELECT school FROM users WHERE id = ?').get(req.user.id);

    const result = await db.prepare(`
      INSERT INTO groups (name, description, tags, creator_id, type, school, max_members)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, description, tags ? JSON.stringify(tags) : null, req.user.id, type || 'public', user.school, max_members);

    // Add creator as member
    await db.prepare(`
      INSERT INTO group_members (group_id, user_id, role, status)
      VALUES (?, ?, 'owner', 'active')
    `).run(result.lastInsertRowid, req.user.id);

    const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Group created successfully', group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Join group
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if already member
    const existing = await db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (existing) {
      return res.status(400).json({ error: 'Already a member' });
    }

    // Check if group is full
    if (group.max_members && group.member_count >= group.max_members) {
      return res.status(400).json({ error: 'Group is full' });
    }

    // Add member
    await db.prepare(`
      INSERT INTO group_members (group_id, user_id, role, status)
      VALUES (?, ?, 'member', 'active')
    `).run(req.params.id, req.user.id);

    // Update member count
    await db.prepare('UPDATE groups SET member_count = member_count + 1 WHERE id = ?').run(req.params.id);

    res.json({ message: 'Successfully joined group' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave group
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Owner cannot leave
    if (group.creator_id === req.user.id) {
      return res.status(400).json({ error: 'Owner cannot leave group' });
    }

    const result = await db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?').run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Not a member of this group' });
    }

    // Update member count
    await db.prepare('UPDATE groups SET member_count = member_count - 1 WHERE id = ?').run(req.params.id);

    res.json({ message: 'Successfully left group' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Create post in group
router.post('/:id/posts', auth, [
  body('content').notEmpty().withMessage('Content is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if member
    const membership = await db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const { title, content, images } = req.body;

    const result = await db.prepare(`
      INSERT INTO group_posts (group_id, user_id, title, content, images)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.id, req.user.id, title, content, images ? JSON.stringify(images) : null);

    const post = await db.prepare('SELECT * FROM group_posts WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get recommended groups (based on user tags)
router.get('/recommended/list', auth, async (req, res) => {
  try {
    const user = await db.prepare('SELECT tags, school FROM users WHERE id = ?').get(req.user.id);
    if (!user || !user.tags) {
      return res.json({ groups: [] });
    }

    const userTags = JSON.parse(user.tags);

    const groups = await db.prepare(`
      SELECT g.*, u.nickname as creator_name
      FROM groups g
      JOIN users u ON g.creator_id = u.id
      WHERE g.status = 'active' AND g.type = 'public'
      ORDER BY g.member_count DESC
      LIMIT 20
    `).all();

    // Filter and sort by tag matching
    const recommended = groups
      .map(group => {
        if (!group.tags) return { ...group, matchScore: 0 };
        const groupTags = JSON.parse(group.tags);
        const matchCount = groupTags.filter(tag => userTags.includes(tag)).length;
        return { ...group, matchScore: matchCount };
      })
      .filter(group => group.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json({ groups: recommended });
  } catch (error) {
    console.error('Get recommended groups error:', error);
    res.status(500).json({ error: 'Failed to get recommended groups' });
  }
});

// Update group
router.put('/:id', auth, async (req, res) => {
  try {
    const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check permission: only owner or admin can update
    const owner = await db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = "owner"')
      .get(req.params.id, req.user.id);

    if (!owner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied. Only the group owner or admin can update this group.' });
    }

    const { name, description, tags, type, max_members, status } = req.body;

    await db.prepare(`
      UPDATE groups
      SET name = ?, description = ?, tags = ?, type = ?, max_members = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name || group.name,
      description || group.description,
      tags ? JSON.stringify(tags) : group.tags,
      type || group.type,
      max_members || group.max_members,
      status || group.status,
      req.params.id
    );

    const updatedGroup = await db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);

    res.json({ message: 'Group updated successfully', group: updatedGroup });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group
router.delete('/:id', auth, async (req, res) => {
  try {
    const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check permission: only owner or admin can delete
    const owner = await db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = "owner"')
      .get(req.params.id, req.user.id);

    if (!owner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied. Only the group owner or admin can delete this group.' });
    }

    // Delete group members first
    await db.prepare('DELETE FROM group_members WHERE group_id = ?').run(req.params.id);

    // Delete group posts
    await db.prepare('DELETE FROM group_posts WHERE group_id = ?').run(req.params.id);

    // Delete group
    await db.prepare('DELETE FROM groups WHERE id = ?').run(req.params.id);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Remove member from group
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check permission: only owner or admin can remove members
    const owner = await db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = "owner"')
      .get(req.params.id, req.user.id);

    if (!owner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied. Only the group owner or admin can remove members.' });
    }

    const result = await db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?')
      .run(req.params.id, req.params.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Update member count
    await db.prepare('UPDATE groups SET member_count = member_count - 1 WHERE id = ?').run(req.params.id);

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
