const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/checkins?memberId=&date= - Get check-ins
router.get('/', (req, res) => {
  const { memberId, date, startDate, endDate } = req.query;

  if (memberId && date) {
    // Single day check-ins for a member
    const checkins = db.prepare(
      'SELECT * FROM checkins WHERE member_id = ? AND date = ?'
    ).all(memberId, date);
    return res.json(checkins);
  }

  if (memberId && startDate && endDate) {
    // Date range check-ins for a member
    const checkins = db.prepare(
      'SELECT * FROM checkins WHERE member_id = ? AND date BETWEEN ? AND ?'
    ).all(memberId, startDate, endDate);
    return res.json(checkins);
  }

  if (memberId) {
    const checkins = db.prepare(
      'SELECT * FROM checkins WHERE member_id = ? ORDER BY date DESC LIMIT 100'
    ).all(memberId);
    return res.json(checkins);
  }

  res.status(400).json({ error: 'memberId is required' });
});

// POST /api/checkins - Toggle check-in (create or delete)
router.post('/', (req, res) => {
  const { memberId, habitId, date } = req.body;
  if (!memberId || !habitId || !date) {
    return res.status(400).json({ error: 'memberId, habitId, and date are required' });
  }

  // Check if already checked in
  const existing = db.prepare(
    'SELECT * FROM checkins WHERE member_id = ? AND habit_id = ? AND date = ?'
  ).get(memberId, habitId, date);

  if (existing) {
    // Toggle off - delete
    db.prepare('DELETE FROM checkins WHERE id = ?').run(existing.id);
    return res.json({ action: 'unchecked', checkin: null });
  }

  // Toggle on - create
  const result = db.prepare(
    'INSERT INTO checkins (member_id, habit_id, date) VALUES (?, ?, ?)'
  ).run(memberId, habitId, date);

  const checkin = db.prepare('SELECT * FROM checkins WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ action: 'checked', checkin });
});

// DELETE /api/checkins/:id - Delete specific check-in
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM checkins WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Check-in not found' });

  db.prepare('DELETE FROM checkins WHERE id = ?').run(req.params.id);
  res.json({ message: 'Check-in deleted' });
});

module.exports = router;
