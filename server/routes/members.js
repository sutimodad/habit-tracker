const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/members - List all members
router.get('/', (req, res) => {
  const members = db.prepare('SELECT * FROM members ORDER BY created_at').all();
  res.json(members);
});

// GET /api/members/:id - Get single member
router.get('/:id', (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json(member);
});

// POST /api/members - Create member
router.post('/', (req, res) => {
  const { name, avatar, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const result = db.prepare(
    'INSERT INTO members (name, avatar, color) VALUES (?, ?, ?)'
  ).run(name, avatar || '👤', color || '#5B4FCF');

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(member);
});

// PUT /api/members/:id - Update member
router.put('/:id', (req, res) => {
  const { name, avatar, color } = req.body;
  const existing = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Member not found' });

  db.prepare(
    'UPDATE members SET name = ?, avatar = ?, color = ? WHERE id = ?'
  ).run(
    name || existing.name,
    avatar || existing.avatar,
    color || existing.color,
    req.params.id
  );

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  res.json(member);
});

// DELETE /api/members/:id - Delete member
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Member not found' });

  db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
  res.json({ message: 'Member deleted' });
});

module.exports = router;
