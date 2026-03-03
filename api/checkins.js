const { getDb, initDb } = require('./db');

module.exports = async function handler(req, res) {
  const sql = getDb();
  await initDb();

  const { method, query } = req;
  const id = query.id;

  try {
    if (method === 'GET') {
      const { memberId, date, startDate, endDate } = query;

      if (memberId && date) {
        const rows = await sql`
          SELECT * FROM checkins WHERE member_id = ${memberId} AND date = ${date}
        `;
        return res.json(rows);
      }

      if (memberId && startDate && endDate) {
        const rows = await sql`
          SELECT * FROM checkins WHERE member_id = ${memberId} AND date BETWEEN ${startDate} AND ${endDate}
        `;
        return res.json(rows);
      }

      if (memberId) {
        const rows = await sql`
          SELECT * FROM checkins WHERE member_id = ${memberId} ORDER BY date DESC LIMIT 100
        `;
        return res.json(rows);
      }

      return res.status(400).json({ error: 'memberId is required' });
    }

    if (method === 'POST') {
      const { memberId, habitId, date } = req.body;
      if (!memberId || !habitId || !date) {
        return res.status(400).json({ error: 'memberId, habitId, and date are required' });
      }

      // Check if already exists (toggle)
      const existing = await sql`
        SELECT * FROM checkins WHERE member_id = ${memberId} AND habit_id = ${habitId} AND date = ${date}
      `;

      if (existing.length > 0) {
        await sql`DELETE FROM checkins WHERE id = ${existing[0].id}`;
        return res.json({ action: 'unchecked', checkin: null });
      }

      const rows = await sql`
        INSERT INTO checkins (member_id, habit_id, date) VALUES (${memberId}, ${habitId}, ${date})
        RETURNING *
      `;
      return res.status(201).json({ action: 'checked', checkin: rows[0] });
    }

    if (method === 'DELETE' && id) {
      const rows = await sql`DELETE FROM checkins WHERE id = ${id} RETURNING *`;
      if (rows.length === 0) return res.status(404).json({ error: 'Check-in not found' });
      return res.json({ message: 'Check-in deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
