const express = require('express');
const router = express.Router();
const db = require('../database');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all venues
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    let query = 'SELECT * FROM venues WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY name';

    const venues = await db.prepare(query).all(...params);

    // Parse JSON fields (handle encoding issues)
    venues.forEach(venue => {
      if (venue.facilities) {
        try {
          venue.facilities = JSON.parse(venue.facilities);
        } catch (e) {
          // If JSON parse fails, treat as comma-separated string
          venue.facilities = venue.facilities.split(',').map(s => s.trim());
        }
      }
    });

    res.json({ venues });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ error: 'Failed to get venues' });
  }
});

// Get venue availability for a specific date
router.get('/:id/availability', (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Get existing reservations for this date
    const reservations = db.prepare(`
      SELECT * FROM reservations
      WHERE venue_id = ? AND reservation_date = ? AND status != 'cancelled'
      ORDER BY start_time
    `).all(req.params.id, date);

    // Parse facilities
    if (venue.facilities) venue.facilities = JSON.parse(venue.facilities);

    res.json({
      venue,
      reservations,
      available_time_start: venue.available_time_start,
      available_time_end: venue.available_time_end
    });
  } catch (error) {
    console.error('Get venue availability error:', error);
    res.status(500).json({ error: 'Failed to get venue availability' });
  }
});

// Create reservation
router.post('/reservations', auth, [
  body('venue_id').notEmpty().withMessage('Venue ID is required'),
  body('reservation_date').notEmpty().withMessage('Date is required'),
  body('start_time').notEmpty().withMessage('Start time is required'),
  body('end_time').notEmpty().withMessage('End time is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { venue_id, reservation_date, start_time, end_time, purpose, participants } = req.body;

    // Check for time conflicts
    const conflicts = db.prepare(`
      SELECT * FROM reservations
      WHERE venue_id = ? AND reservation_date = ? AND status != 'cancelled'
      AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))
    `).get(venue_id, reservation_date, end_time, start_time, start_time, end_time, start_time, end_time);

    if (conflicts) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }

    const result = db.prepare(`
      INSERT INTO reservations (venue_id, user_id, reservation_date, start_time, end_time, purpose, participants)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(venue_id, req.user.id, reservation_date, start_time, end_time, purpose, participants);

    const reservation = db.prepare(`
      SELECT r.*, v.name as venue_name, v.location as venue_location
      FROM reservations r
      JOIN venues v ON r.venue_id = v.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ message: 'Reservation created successfully', reservation });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Get my reservations
router.get('/reservations/my', auth, (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT r.*, v.name as venue_name, v.type as venue_type, v.location as venue_location
      FROM reservations r
      JOIN venues v ON r.venue_id = v.id
      WHERE r.user_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    query += ' AND r.reservation_date >= DATE("now") ORDER BY r.reservation_date, r.start_time';

    const reservations = db.prepare(query).all(...params);

    res.json({ reservations });
  } catch (error) {
    console.error('Get my reservations error:', error);
    res.status(500).json({ error: 'Failed to get reservations' });
  }
});

// Cancel reservation
router.delete('/reservations/:id', auth, (req, res) => {
  try {
    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    db.prepare('UPDATE reservations SET status = "cancelled" WHERE id = ?').run(req.params.id);

    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

module.exports = router;
