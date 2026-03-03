import { useEffect } from 'react'
import { useApp } from '../../context/AppContext'

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

const dayNames = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export default function DailyCheckIn({ date, onDateChange }) {
  const { habits, checkins, fetchCheckins, toggleCheckin, currentMember } = useApp()

  const dateStr = formatDate(date)
  const isToday = dateStr === formatDate(new Date())

  useEffect(() => {
    if (currentMember) fetchCheckins(dateStr)
  }, [currentMember, dateStr, fetchCheckins])

  const checkedHabitIds = new Set(checkins.map(c => c.habit_id))
  const todayHabits = habits.filter(h => {
    if (h.frequency === 'daily') return true
    if (h.frequency === 'custom' && h.days_of_week) {
      const dayNum = date.getDay() // 0=Sun, 1=Mon...
      return h.days_of_week.split(',').map(Number).includes(dayNum)
    }
    return true
  })

  const completedCount = todayHabits.filter(h => checkedHabitIds.has(h.id)).length
  const totalCount = todayHabits.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleToggle = async (habitId) => {
    await toggleCheckin(habitId, dateStr)
  }

  const goDay = (offset) => {
    const d = new Date(date)
    d.setDate(d.getDate() + offset)
    onDateChange(d)
  }

  const unchecked = todayHabits.filter(h => !checkedHabitIds.has(h.id))
  const checked = todayHabits.filter(h => checkedHabitIds.has(h.id))

  return (
    <div>
      {/* Date Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isToday ? 'Hôm nay' : dayNames[date.getDay()]}
          </h2>
          <p className="text-sm text-gray-500">
            {date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => goDay(-1)}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
          >
            ‹
          </button>
          {!isToday && (
            <button
              onClick={() => onDateChange(new Date())}
              className="px-2 h-8 rounded-lg border border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-50 transition"
            >
              Hôm nay
            </button>
          )}
          <button
            onClick={() => goDay(1)}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
          >
            ›
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl p-5 text-white mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-3xl font-bold">{completedCount} / {totalCount}</div>
            <div className="text-sm opacity-90">thói quen hoàn thành</div>
          </div>
          <div className="text-4xl">{progressPct === 100 ? '🎉' : '🔥'}</div>
        </div>
        <div className="bg-white/25 rounded-full h-2.5 mt-4 overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Habit Lists */}
      {totalCount === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-4xl mb-3">📝</p>
          <p>Chưa có thói quen nào.</p>
          <p className="text-sm">Hãy thêm thói quen trong tab "Thói quen".</p>
        </div>
      ) : (
        <>
          {unchecked.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Chưa hoàn thành
              </p>
              {unchecked.map(habit => (
                <HabitCheckItem key={habit.id} habit={habit} done={false} onToggle={handleToggle} />
              ))}
            </>
          )}

          {checked.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-5">
                Đã hoàn thành ✓
              </p>
              {checked.map(habit => (
                <HabitCheckItem key={habit.id} habit={habit} done={true} onToggle={handleToggle} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}

function HabitCheckItem({ habit, done, onToggle }) {
  const categoryColors = {
    'Sức khỏe': 'bg-green-100',
    'Học tập': 'bg-blue-100',
    'Thể chất': 'bg-pink-100',
    'Sinh hoạt': 'bg-yellow-100',
  }
  const bgColor = categoryColors[habit.category_name] || 'bg-gray-100'

  return (
    <div
      className={`flex items-center gap-4 rounded-xl p-4 mb-2.5 border cursor-pointer transition-all hover:shadow-sm ${
        done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:-translate-y-0.5'
      }`}
      onClick={() => onToggle(habit.id)}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${bgColor}`}>
        {habit.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {habit.name}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {habit.category_name || 'Chung'} • {habit.frequency === 'daily' ? 'Hàng ngày' : 'Tùy chỉnh'}
        </div>
      </div>
      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
        done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-purple-500'
      }`}>
        {done && '✓'}
      </div>
    </div>
  )
}
