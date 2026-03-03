const { neon } = require('@neondatabase/serverless');

function getDb() {
  const sql = neon(process.env.DATABASE_URL);
  return sql;
}

async function initDb() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT DEFAULT '👤',
      color TEXT DEFAULT '#5B4FCF',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      color TEXT DEFAULT '#5B4FCF'
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS habits (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '✅',
      frequency TEXT DEFAULT 'daily',
      days_of_week TEXT,
      reminder_time TEXT,
      is_active BOOLEAN DEFAULT true,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS checkins (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(member_id, habit_id, date)
    )
  `;

  // Default categories
  await sql`
    INSERT INTO categories (name, icon, color) VALUES
      ('Sức khỏe', '💪', '#22C55E'),
      ('Học tập', '📖', '#3B82F6'),
      ('Thể chất', '🏃', '#F59E0B'),
      ('Sinh hoạt', '🏠', '#8B5CF6')
    ON CONFLICT (name) DO NOTHING
  `;
}

module.exports = { getDb, initDb };
