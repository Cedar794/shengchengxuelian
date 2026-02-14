const express = require('express');
const router = express.Router();
const db = require('../database');
const { auth, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all listings with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, category, school, status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT l.*, u.nickname as seller_name, u.avatar as seller_avatar, u.school as seller_school
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Only filter by status if explicitly provided
    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    } else {
      // Default: exclude deleted listings
      query += ' AND l.status != ?';
      params.push('deleted');
    }

    if (type) {
      query += ' AND l.type = ?';
      params.push(type);
    }
    if (category) {
      query += ' AND l.category = ?';
      params.push(category);
    }
    if (school) {
      query += ' AND l.school = ?';
      params.push(school);
    }
    if (search) {
      query += ' AND (l.title LIKE ? OR l.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const listings = await db.prepare(query).all(...params);

    // Status mapping: convert lowercase database values to uppercase frontend values
    const statusToUpperCase = {
      'active': 'AVAILABLE',
      'inactive': 'RESERVED',
      'sold': 'SOLD',
      'completed': 'REMOVED',
    };

    // Parse JSON fields
    listings.forEach(listing => {
      // Convert status to uppercase for frontend
      if (listing.status && statusToUpperCase[listing.status]) {
        listing.status = statusToUpperCase[listing.status];
      }
      if (listing.images) listing.images = JSON.parse(listing.images);
      if (listing.tags) listing.tags = JSON.parse(listing.tags);
      // Parse description if it's a JSON string (for delivery, creative, lost-found, part-time types)
      if (listing.description) {
        try {
          const parsed = JSON.parse(listing.description);
          if (typeof parsed === 'object') {
            // Merge parsed fields into listing
            Object.assign(listing, parsed);
          }
        } catch (e) {
          // Not JSON, keep as-is
        }
      }
    });

    res.json({ listings, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

// Get single listing
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const listing = await db.prepare(`
      SELECT l.*, u.nickname as seller_name, u.avatar as seller_avatar, u.school as seller_school, u.major as seller_major
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      WHERE l.id = ?
    `).get(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Status mapping: convert lowercase database values to uppercase frontend values
    const statusToUpperCase = {
      'active': 'AVAILABLE',
      'inactive': 'RESERVED',
      'sold': 'SOLD',
      'completed': 'REMOVED',
    };

    // Parse JSON fields
    // Convert status to uppercase for frontend
    if (listing.status && statusToUpperCase[listing.status]) {
      listing.status = statusToUpperCase[listing.status];
    }
    if (listing.images) listing.images = JSON.parse(listing.images);
    if (listing.tags) listing.tags = JSON.parse(listing.tags);
    // Parse description if it's a JSON string (for delivery, creative, lost-found, part-time types)
    if (listing.description) {
      try {
        const parsed = JSON.parse(listing.description);
        if (typeof parsed === 'object') {
          // Merge parsed fields into listing
          Object.assign(listing, parsed);
        }
      } catch (e) {
        // Not JSON, keep as-is
      }
    }

    // Increment view count
    await db.prepare('UPDATE listings SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);

    res.json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Failed to get listing' });
  }
});

// Create listing
router.post('/', auth, [
  body('type').notEmpty().withMessage('Type is required').isIn(['second-hand', 'delivery', 'creative', 'lost-found', 'part-time']),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('status').optional().isIn(['active', 'inactive', 'sold', 'completed', 'AVAILABLE', 'RESERVED', 'SOLD', 'REMOVED']).withMessage('Invalid status value'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, title, description, status, item_name } = req.body;
    const user = await db.prepare('SELECT school FROM users WHERE id = ?').get(req.user.id);

    // 转换前端大写状态值为数据库小写状态值
    const statusMapping = {
      'AVAILABLE': 'active',
      'RESERVED': 'inactive',
      'SOLD': 'sold',
      'REMOVED': 'completed'
    };
    // 如果没有提供状态，默认为 active
    const finalStatus = status ? statusMapping[status] || status : 'active';
    const normalizedStatus = finalStatus;

    // 根据类型验证必填字段
    let validationErrors = [];
    let insertFields = {
      type,
      seller_id: req.user.id,
      school: user.school,
      status: normalizedStatus,
      description: description || ''
    };

    // 处理 title 字段：对于 delivery 和 lost-found，使用其他字段生成 title
    switch (type) {
      case 'second-hand':
        if (!title) validationErrors.push({ msg: 'Title is required for second-hand items' });
        if (!req.body.price) validationErrors.push({ msg: 'Price is required for second-hand items' });
        insertFields.title = title;
        insertFields.price = req.body.price;
        if (req.body.condition) insertFields.condition = req.body.condition;
        if (req.body.location) insertFields.location = req.body.location;
        break;

      case 'delivery':
        if (!req.body.pickup_location) validationErrors.push({ msg: 'Pickup location is required for delivery items' });
        if (!req.body.delivery_address) validationErrors.push({ msg: 'Delivery address is required for delivery items' });
        if (!req.body.reward) validationErrors.push({ msg: 'Reward is required for delivery items' });

        // 使用 pickup_location 作为 title
        insertFields.title = `代取: ${req.body.pickup_location}`;
        // 将delivery特有的字段存储在JSON格式中
        insertFields.description = JSON.stringify({
          description: description || '',
          pickup_location: req.body.pickup_location,
          delivery_address: req.body.delivery_address,
          reward: req.body.reward
        });
        break;

      case 'creative':
        if (!title) validationErrors.push({ msg: 'Title is required for creative items' });
        if (!req.body.price) validationErrors.push({ msg: 'Price is required for creative items' });
        insertFields.title = title;
        insertFields.price = req.body.price;
        insertFields.description = JSON.stringify({
          description: description || '',
          stock: req.body.stock || 0
        });
        break;

      case 'lost-found':
        if (!item_name) validationErrors.push({ msg: 'Item name is required for lost-found items' });
        if (!req.body.location) validationErrors.push({ msg: 'Location is required for lost-found items' });

        // 使用 item_name 作为 title
        insertFields.title = item_name;
        insertFields.location = req.body.location;
        insertFields.description = JSON.stringify({
          description: description || '',
          time_found: req.body.time_found || ''
        });
        break;

      case 'part-time':
        if (!title) validationErrors.push({ msg: 'Title is required for part-time jobs' });
        if (!req.body.salary) validationErrors.push({ msg: 'Salary is required for part-time jobs' });
        if (!req.body.requirements) validationErrors.push({ msg: 'Requirements is required for part-time jobs' });

        insertFields.title = title;
        insertFields.price = req.body.salary;
        insertFields.description = JSON.stringify({
          description: description || '',
          requirements: req.body.requirements
        });
        break;
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // 处理可选字段
    if (req.body.category) insertFields.category = req.body.category;
    if (req.body.images) insertFields.images = JSON.stringify(req.body.images);
    if (req.body.tags) insertFields.tags = JSON.stringify(req.body.tags);

    const result = await db.prepare(`
      INSERT INTO listings (type, title, description, price, category, condition, images, seller_id, school, location, tags, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      insertFields.type,
      insertFields.title,
      insertFields.description,
      insertFields.price,
      insertFields.category,
      insertFields.condition,
      insertFields.images,
      insertFields.seller_id,
      insertFields.school,
      insertFields.location,
      insertFields.tags,
      insertFields.status
    );

    const listing = await db.prepare('SELECT * FROM listings WHERE id = ?').get(result.lastInsertRowid);

    // Status mapping: convert lowercase database values to uppercase frontend values
    const statusToUpperCase = {
      'active': 'AVAILABLE',
      'inactive': 'RESERVED',
      'sold': 'SOLD',
      'completed': 'REMOVED',
    };

    // 解析JSON字段以便返回
    // 确保返回的状态是大写
    listing.status = statusToUpperCase[listing.status] || listing.status;
    if (listing.images) listing.images = JSON.parse(listing.images);
    if (listing.tags) listing.tags = JSON.parse(listing.tags);

    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Update listing
router.put('/:id', auth, async (req, res) => {
  try {
    const listing = await db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    const { title, description, price, status, condition, images, location } = req.body;

    // Convert uppercase status to lowercase for database
    const statusMapping = {
      'AVAILABLE': 'active',
      'RESERVED': 'inactive',
      'SOLD': 'sold',
      'REMOVED': 'completed'
    };
    const normalizedStatus = statusMapping[status] || status;

    await db.prepare(`
      UPDATE listings
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          status = COALESCE(?, status),
          condition = COALESCE(?, condition),
          images = COALESCE(?, images),
          location = COALESCE(?, location),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description, price, normalizedStatus, condition, images ? JSON.stringify(images) : null, location, req.params.id);

    const updatedListing = await db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);

    // Status mapping: convert lowercase database values to uppercase frontend values
    const statusToUpperCase = {
      'active': 'AVAILABLE',
      'inactive': 'RESERVED',
      'sold': 'SOLD',
      'completed': 'REMOVED',
    };

    // Convert status to uppercase for frontend
    if (updatedListing.status && statusToUpperCase[updatedListing.status]) {
      updatedListing.status = statusToUpperCase[updatedListing.status];
    }

    res.json({ message: 'Listing updated successfully', listing: updatedListing });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    await db.prepare('UPDATE listings SET status = "deleted" WHERE id = ?').run(req.params.id);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Get my listings
router.get('/my/listings', auth, async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM listings WHERE seller_id = ?';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const listings = await db.prepare(query).all(...params);

    // Status mapping: convert lowercase database values to uppercase frontend values
    const statusToUpperCase = {
      'active': 'AVAILABLE',
      'inactive': 'RESERVED',
      'sold': 'SOLD',
      'completed': 'REMOVED',
    };

    // Parse JSON fields
    listings.forEach(listing => {
      // Convert status to uppercase for frontend
      if (listing.status && statusToUpperCase[listing.status]) {
        listing.status = statusToUpperCase[listing.status];
      }
      if (listing.images) listing.images = JSON.parse(listing.images);
      if (listing.tags) listing.tags = JSON.parse(listing.tags);
      // Parse description if it's a JSON string (for delivery, creative, lost-found, part-time types)
      if (listing.description) {
        try {
          const parsed = JSON.parse(listing.description);
          if (typeof parsed === 'object') {
            // Merge parsed fields into listing
            Object.assign(listing, parsed);
          }
        } catch (e) {
          // Not JSON, keep as-is
        }
      }
    });

    res.json({ listings });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

module.exports = router;
