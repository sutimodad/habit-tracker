const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/habits?memberId= - List habits (optionally filtered by member)
router.get('/', (req, res) => {
  const { memberId } = req.query;
  let habits;

  if (memberId) {
    habits = db.prepare(`
      SELECT h.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM habits h
      LEFT JOIN categories c ON h.category_id = c.id
      WHERE h.member_id = ? AND h.is_active = 1
      ORDER BY h.created_at
    `).all(memberId);
  } else {
    habits = db.prepare(`
      SELECT h.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM habits h
      LEFT JOIN categories c ON h.category_id = c.id
      WHERE h.is_active = 1
      ORDER BY h.created_at
    `).all();
  }

  res.json(habits);
});

// GET /api/habits/categories - List all categories
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY id').all();
  res.json(categories);
});

// POST /api/habits - Create habit
router.post('/', (req, res) => {
  const { name, description, icon, frequency, daysOfWeek, reminderTime, memberId, categoryId } = req.body;
  if (!name || !memberId) return res.status(400).json({ error: 'Name and memberId are required' });

  const result = db.prepare(`
    INSERT INTO habits (name, description, icon, frequency, days_of_week, reminder_time, member_id, category_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, description, icon || '✅', frequency || 'daily', daysOfWeek, reminderTime, memberId, categoryId);

  const habit = db.prepare(`
    SELECT h.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM habits h
    LEFT JOIN categories c ON h.category_id = c.id
    WHERE h.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(habit);
});

// PUT /api/habits/:id - Update habit
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Habit not found' });

  const { name, description, icon, frequency, daysOfWeek, reminderTime, categoryId, isActive } = req.body;

  db.prepare(`
    UPDATE habits SET name = ?, description = ?, icon = ?, frequency = ?,
    days_of_week = ?, reminder_time = ?, category_id = ?, is_active = ?,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name ?? existing.name,
    description ?? existing.description,
    icon ?? existing.icon,
    frequency ?? existing.frequency,
    daysOfWeek ?? existing.days_of_week,
    reminderTime ?? existing.reminder_time,
    categoryId ?? existing.category_id,
    isActive ?? existing.is_active,
    req.params.id
  );

  const habit = db.prepare(`
    SELECT h.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM habits h
    LEFT JOIN categories c ON h.category_id = c.id
    WHERE h.id = ?
  `).get(req.params.id);

  res.json(habit);
});

// DELETE /api/habits/:id - Delete habit
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Habit not found' });

  db.prepare('DELETE FROM habits WHERE id = ?').run(req.params.id);
  res.json({ message: 'Habit deleted' });
});

module.exports = router;
