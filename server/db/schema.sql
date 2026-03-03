CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '👤',
  color TEXT DEFAULT '#5B4FCF',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT DEFAULT '#5B4FCF'
);

CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '✅',
  frequency TEXT DEFAULT 'daily',
  days_of_week TEXT,
  reminder_time TEXT,
  is_active INTEGER DEFAULT 1,
  member_id INTEGER NOT NULL,
  category_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  member_id INTEGER NOT NULL,
  habit_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(member_id, habit_id, date),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

-- Default categories
INSERT OR IGNORE INTO categories (name, icon, color) VALUES
  ('Sức khỏe', '💪', '#22C55E'),
  ('Học tập', '📖', '#3B82F6'),
  ('Thể chất', '🏃', '#F59E0B'),
  ('Sinh hoạt', '🏠', '#8B5CF6');
