const { getDb, initDb } = require('./db');

module.exports = async function handler(req, res) {
  const sql = getDb();
  await initDb();

  const { method, query } = req;
  const id = query.id;

  try {
    if (method === 'GET' && query.categories === 'true') {
      const rows = await sql`SELECT * FROM categories ORDER BY id`;
      return res.json(rows);
    }

    if (method === 'GET' && !id) {
      const memberId = query.memberId;
      let rows;
      if (memberId) {
        rows = await sql`
          SELECT h.*, c.name as category_name, c.icon as category_icon, c.color as category_color
          FROM habits h LEFT JOIN categories c ON h.category_id = c.id
          WHERE h.member_id = ${memberId} AND h.is_active = true
          ORDER BY h.created_at
        `;
      } else {
        rows = await sql`
          SELECT h.*, c.name as category_name, c.icon as category_icon, c.color as category_color
          FROM habits h LEFT JOIN categories c ON h.category_id = c.id
          WHERE h.is_active = true ORDER BY h.created_at
        `;
      }
      return res.json(rows);
    }

    if (method === 'POST') {
      const { name, description, icon, frequency, daysOfWeek, reminderTime, memberId, categoryId } = req.body;
      if (!name || !memberId) return res.status(400).json({ error: 'Name and memberId are required' });

      const rows = await sql`
        INSERT INTO habits (name, description, icon, frequency, days_of_week, reminder_time, member_id, category_id)
        VALUES (${name}, ${description || null}, ${icon || '✅'}, ${frequency || 'daily'}, ${daysOfWeek || null}, ${reminderTime || null}, ${memberId}, ${categoryId || null})
        RETURNING *
      `;
      const habit = rows[0];
      // Fetch with category info
      const full = await sql`
        SELECT h.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM habits h LEFT JOIN categories c ON h.category_id = c.id
        WHERE h.id = ${habit.id}
      `;
      return res.status(201).json(full[0]);
    }

    if (method === 'PUT' && id) {
      const { name, description, icon, frequency, daysOfWeek, reminderTime, categoryId, isActive } = req.body;
      const rows = await sql`
        UPDATE habits SET
          name = COALESCE(${name ?? null}, name),
          description = COALESCE(${description ?? null}, description),
          icon = COALESCE(${icon ?? null}, icon),
          frequency = COALESCE(${frequency ?? null}, frequency),
          days_of_week = COALESCE(${daysOfWeek ?? null}, days_of_week),
          reminder_time = COALESCE(${reminderTime ?? null}, reminder_time),
          category_id = COALESCE(${categoryId ?? null}, category_id),
          is_active = COALESCE(${isActive ?? null}, is_active),
          updated_at = NOW()
        WHERE id = ${id} RETURNING *
      `;
      if (rows.length === 0) return res.status(404).json({ error: 'Habit not found' });
      const full = await sql`
        SELECT h.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM habits h LEFT JOIN categories c ON h.category_id = c.id
        WHERE h.id = ${id}
      `;
      return res.json(full[0]);
    }

    if (method === 'DELETE' && id) {
      const rows = await sql`DELETE FROM habits WHERE id = ${id} RETURNING *`;
      if (rows.length === 0) return res.status(404).json({ error: 'Habit not found' });
      return res.json({ message: 'Habit deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
