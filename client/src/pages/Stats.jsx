import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function Stats() {
  const { currentMember } = useApp()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentMember) return
    setLoading(true)
    fetch(`/api/stats?memberId=${currentMember.id}`)
      .then(r => r.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [currentMember])

  if (!currentMember) {
    return <div className="text-center text-gray-400 py-20">Chọn một thành viên trước.</div>
  }

  if (loading || !stats) {
    return <div className="text-center text-gray-400 py-20">Đang tải thống kê...</div>
  }

  const statCards = [
    { icon: '🔥', value: stats.streak.current, label: 'Streak hiện tại', color: 'text-purple-600' },
    { icon: '🏆', value: stats.streak.best, label: 'Streak tốt nhất', color: 'text-green-600' },
    { icon: '✅', value: `${stats.weeklyRate}%`, label: 'Hoàn thành tuần', color: 'text-amber-500' },
    { icon: '📅', value: `${stats.monthlyRate}%`, label: 'Hoàn thành tháng', color: 'text-blue-600' },
  ]

  // Heatmap: assign level based on count
  const maxCount = Math.max(1, ...stats.heatmapData.map(d => d.count))
  const heatmapMap = Object.fromEntries(stats.heatmapData.map(d => [d.date, d.count]))

  const heatmapCells = []
  const d = new Date()
  d.setDate(d.getDate() - 29)
  for (let i = 0; i < 30; i++) {
    const dateStr = d.toISOString().split('T')[0]
    const count = heatmapMap[dateStr] || 0
    const level = count === 0 ? 0 : Math.ceil((count / maxCount) * 4)
    heatmapCells.push({ date: dateStr, count, level })
    d.setDate(d.getDate() + 1)
  }

  const levelColors = ['bg-gray-100', 'bg-green-200', 'bg-green-300', 'bg-green-500', 'bg-green-700']

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-5">
        Thống kê - {currentMember.name} 📊
      </h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Lịch hoạt động (30 ngày)</h3>
        <div className="flex flex-wrap gap-1">
          {heatmapCells.map((cell, i) => (
            <div
              key={i}
              title={`${cell.date}: ${cell.count} check-in`}
              className={`w-5 h-5 rounded-sm ${levelColors[cell.level]}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 mt-3 justify-end text-xs text-gray-400">
          Ít
          {levelColors.map((c, i) => (
            <div key={i} className={`w-3.5 h-3.5 rounded-sm ${c}`} />
          ))}
          Nhiều
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tỷ lệ hoàn thành trong tuần</h3>
        <div className="flex items-end gap-3 h-40">
          {stats.dailyStats.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-purple-600 font-semibold">{day.rate}%</span>
              <div className="w-full rounded-t-md bg-purple-500 transition-all duration-300"
                style={{ height: `${Math.max(4, day.rate)}%` }}
              />
              <span className="text-xs text-gray-500">{day.day}</span>
            </div>
          ))}
          {stats.dailyStats.length === 0 && (
            <div className="flex-1 text-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  )
}
