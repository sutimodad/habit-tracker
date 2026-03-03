const { getDb, initDb } = require('./db');

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

module.exports = async function handler(req, res) {
  const sql = getDb();
  await initDb();

  const { method, query } = req;

  if (method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Family leaderboard
    if (query.family === 'leaderboard') {
      const members = await sql`SELECT * FROM members ORDER BY created_at`;
      const today = todayStr();

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const daysSoFar = Math.min(7, Math.floor((new Date(today) - weekStart) / 86400000) + 1);

      const leaderboard = [];
      for (const member of members) {
        const streak = await calculateStreak(sql, member.id);
        const habitCount = await sql`SELECT COUNT(*) as count FROM habits WHERE member_id = ${member.id} AND is_active = true`;
        const totalHabits = Number(habitCount[0].count);
        const expected = totalHabits * daysSoFar;

        const weeklyCheckins = await sql`
          SELECT COUNT(*) as count FROM checkins
          WHERE member_id = ${member.id} AND date BETWEEN ${weekStartStr} AND ${today}
        `;
        const completed = Number(weeklyCheckins[0].count);

        leaderboard.push({
          ...member,
          streak: streak.current,
          bestStreak: streak.best,
          weeklyRate: expected > 0 ? Math.round((completed / expected) * 100) : 0,
          totalHabits
        });
      }

      leaderboard.sort((a, b) => b.weeklyRate - a.weeklyRate);
      return res.json(leaderboard);
    }

    // Individual member stats
    const memberId = query.memberId;
    if (!memberId) return res.status(400).json({ error: 'memberId is required' });

    const memberRows = await sql`SELECT * FROM members WHERE id = ${memberId}`;
    if (memberRows.length === 0) return res.status(404).json({ error: 'Member not found' });

    const member = memberRows[0];
    const today = todayStr();
    const streak = await calculateStreak(sql, memberId);

    // Weekly
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const habitCount = await sql`SELECT COUNT(*) as count FROM habits WHERE member_id = ${memberId} AND is_active = true`;
    const totalHabits = Number(habitCount[0].count);

    const daysSoFar = Math.min(7, Math.floor((new Date(today) - weekStart) / 86400000) + 1);
    const weeklyExpected = totalHabits * daysSoFar;

    const weeklyCheckins = await sql`
      SELECT COUNT(*) as count FROM checkins WHERE member_id = ${memberId} AND date BETWEEN ${weekStartStr} AND ${today}
    `;
    const weeklyRate = weeklyExpected > 0 ? Math.round((Number(weeklyCheckins[0].count) / weeklyExpected) * 100) : 0;

    // Monthly
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const daysInMonth = Math.floor((new Date(today) - monthStart) / 86400000) + 1;
    const monthlyExpected = totalHabits * daysInMonth;

    const monthlyCheckins = await sql`
      SELECT COUNT(*) as count FROM checkins WHERE member_id = ${memberId} AND date BETWEEN ${monthStartStr} AND ${today}
    `;
    const monthlyRate = monthlyExpected > 0 ? Math.round((Number(monthlyCheckins[0].count) / monthlyExpected) * 100) : 0;

    // Daily stats for current week
    const dailyStats = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      if (dateStr > today) break;

      const checkins = await sql`
        SELECT COUNT(*) as count FROM checkins WHERE member_id = ${memberId} AND date = ${dateStr}
      `;
      const completed = Number(checkins[0].count);
      dailyStats.push({
        date: dateStr,
        day: dayNames[d.getDay()],
        completed,
        total: totalHabits,
        rate: totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0
      });
    }

    // Heatmap (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const heatmapStart = thirtyDaysAgo.toISOString().split('T')[0];

    const heatmapData = await sql`
      SELECT date, COUNT(*) as count FROM checkins
      WHERE member_id = ${memberId} AND date >= ${heatmapStart}
      GROUP BY date ORDER BY date
    `;

    return res.json({
      member,
      streak,
      weeklyRate,
      monthlyRate,
      dailyStats,
      heatmapData,
      totalHabits
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function calculateStreak(sql, memberId) {
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const startDate = yearAgo.toISOString().split('T')[0];

  const checkins = await sql`
    SELECT date, COUNT(DISTINCT habit_id) as completed_count
    FROM checkins WHERE member_id = ${memberId} AND date >= ${startDate}
    GROUP BY date ORDER BY date DESC
  `;

  const today = todayStr();
  const dateSet = new Set(checkins.map(c => c.date));

  let currentStreak = 0;
  let d = new Date(today);
  while (true) {
    const dateStr = d.toISOString().split('T')[0];
    if (dateSet.has(dateStr)) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  let bestStreak = 0;
  let tempStreak = 0;
  const allDates = checkins.map(c => c.date).sort();
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(allDates[i - 1]);
      const curr = new Date(allDates[i]);
      tempStreak = (curr - prev) / 86400000 === 1 ? tempStreak + 1 : 1;
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak;
  }

  return { current: currentStreak, best: Math.max(bestStreak, currentStreak) };
}
