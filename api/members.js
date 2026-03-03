const { getDb, initDb } = require('./db');

module.exports = async function handler(req, res) {
  const sql = getDb();
  await initDb();

  const { method, query } = req;
  const id = query.id;

  try {
    if (method === 'GET' && !id) {
      const rows = await sql`SELECT * FROM members ORDER BY created_at`;
      return res.json(rows);
    }

    if (method === 'GET' && id) {
      const rows = await sql`SELECT * FROM members WHERE id = ${id}`;
      if (rows.length === 0) return res.status(404).json({ error: 'Member not found' });
      return res.json(rows[0]);
    }

    if (method === 'POST') {
      const { name, avatar, color } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });
      const rows = await sql`
        INSERT INTO members (name, avatar, color) VALUES (${name}, ${avatar || '👤'}, ${color || '#5B4FCF'})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    if (method === 'PUT' && id) {
      const { name, avatar, color } = req.body;
      const rows = await sql`
        UPDATE members SET
          name = COALESCE(${name}, name),
          avatar = COALESCE(${avatar}, avatar),
          color = COALESCE(${color}, color)
        WHERE id = ${id} RETURNING *
      `;
      if (rows.length === 0) return res.status(404).json({ error: 'Member not found' });
      return res.json(rows[0]);
    }

    if (method === 'DELETE' && id) {
      const rows = await sql`DELETE FROM members WHERE id = ${id} RETURNING *`;
      if (rows.length === 0) return res.status(404).json({ error: 'Member not found' });
      return res.json({ message: 'Member deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
