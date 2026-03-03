const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Helper: get today's date as YYYY-MM-DD
function today() {
  return new Date().toISOString().split('T')[0];
}

// Helper: calculate streak for a member
function calculateStreak(memberId) {
  // Get all distinct dates where the member completed ALL their habits for that day
  const habits = db.prepare(
    'SELECT id, frequency, days_of_week FROM habits WHERE member_id = ? AND is_active = 1'
  ).all(memberId);

  if (habits.length === 0) return { current: 0, best: 0 };

  // Get all check-in dates for this member (last 365 days)
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const startDate = yearAgo.toISOString().split('T')[0];

  const checkins = db.prepare(`
    SELECT date, COUNT(DISTINCT habit_id) as completed_count
    FROM checkins
    WHERE member_id = ? AND date >= ?
    GROUP BY date
    ORDER BY date DESC
  `).all(memberId, startDate);

  // For simplicity: streak = consecutive days where at least 1 habit was completed
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const todayStr = today();
  const dateSet = new Set(checkins.map(c => c.date));

  // Calculate current streak (going backwards from today)
  let d = new Date(todayStr);
  while (true) {
    const dateStr = d.toISOString().split('T')[0];
    if (dateSet.has(dateStr)) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate best streak
  const allDates = checkins.map(c => c.date).sort();
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(allDates[i - 1]);
      const curr = new Date(allDates[i]);
      const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
      tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak;
  }

  return { current: currentStreak, best: Math.max(bestStreak, currentStreak) };
}

// GET /api/stats/:memberId - Get stats for a member
router.get('/:memberId', (req, res) => {
  const { memberId } = req.params;
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const streak = calculateStreak(memberId);

  // Weekly completion rate
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const todayStr = today();

  const totalHabits = db.prepare(
    'SELECT COUNT(*) as count FROM habits WHERE member_id = ? AND is_active = 1'
  ).get(memberId).count;

  const daysSoFar = Math.min(7, Math.floor((new Date(todayStr) - weekStart) / (1000 * 60 * 60 * 24)) + 1);
  const weeklyExpected = totalHabits * daysSoFar;

  const weeklyCompleted = db.prepare(`
    SELECT COUNT(*) as count FROM checkins
    WHERE member_id = ? AND date BETWEEN ? AND ?
  `).get(memberId, weekStartStr, todayStr).count;

  const weeklyRate = weeklyExpected > 0 ? Math.round((weeklyCompleted / weeklyExpected) * 100) : 0;

  // Monthly completion rate
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];
  const daysInMonth = Math.floor((new Date(todayStr) - monthStart) / (1000 * 60 * 60 * 24)) + 1;
  const monthlyExpected = totalHabits * daysInMonth;

  const monthlyCompleted = db.prepare(`
    SELECT COUNT(*) as count FROM checkins
    WHERE member_id = ? AND date BETWEEN ? AND ?
  `).get(memberId, monthStartStr, todayStr).count;

  const monthlyRate = monthlyExpected > 0 ? Math.round((monthlyCompleted / monthlyExpected) * 100) : 0;

  // Daily breakdown for current week
  const dailyStats = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    if (dateStr > todayStr) break;

    const completed = db.prepare(
      'SELECT COUNT(*) as count FROM checkins WHERE member_id = ? AND date = ?'
    ).get(memberId, dateStr).count;

    dailyStats.push({
      date: dateStr,
      day: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()],
      completed,
      total: totalHabits,
      rate: totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0
    });
  }

  // Heatmap data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const heatmapStart = thirtyDaysAgo.toISOString().split('T')[0];

  const heatmapData = db.prepare(`
    SELECT date, COUNT(*) as count
    FROM checkins
    WHERE member_id = ? AND date >= ?
    GROUP BY date
    ORDER BY date
  `).all(memberId, heatmapStart);

  res.json({
    member,
    streak,
    weeklyRate,
    monthlyRate,
    dailyStats,
    heatmapData,
    totalHabits
  });
});

// GET /api/stats/family - Family leaderboard
router.get('/family/leaderboard', (req, res) => {
  const members = db.prepare('SELECT * FROM members ORDER BY created_at').all();
  const todayStr = today();

  // This week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const leaderboard = members.map(member => {
    const streak = calculateStreak(member.id);
    const totalHabits = db.prepare(
      'SELECT COUNT(*) as count FROM habits WHERE member_id = ? AND is_active = 1'
    ).get(member.id).count;

    const daysSoFar = Math.min(7, Math.floor((new Date(todayStr) - weekStart) / (1000 * 60 * 60 * 24)) + 1);
    const expected = totalHabits * daysSoFar;

    const completed = db.prepare(`
      SELECT COUNT(*) as count FROM checkins
      WHERE member_id = ? AND date BETWEEN ? AND ?
    `).get(member.id, weekStartStr, todayStr).count;

    return {
      ...member,
      streak: streak.current,
      bestStreak: streak.best,
      weeklyRate: expected > 0 ? Math.round((completed / expected) * 100) : 0,
      totalHabits
    };
  });

  // Sort by weekly rate descending
  leaderboard.sort((a, b) => b.weeklyRate - a.weeklyRate);

  res.json(leaderboard);
});

module.exports = router;
