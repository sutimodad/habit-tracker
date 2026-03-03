import { useState } from 'react'
import { useApp } from '../context/AppContext'
import HabitForm from '../components/Habits/HabitForm'

export default function Habits() {
  const { habits, deleteHabit, currentMember } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editHabit, setEditHabit] = useState(null)

  if (!currentMember) {
    return <div className="text-center text-gray-400 py-20">Chọn một thành viên trước.</div>
  }

  const handleEdit = (habit) => {
    setEditHabit(habit)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa thói quen này?')) {
      await deleteHabit(id)
    }
  }

  const handleClose = () => {
    setShowForm(false)
    setEditHabit(null)
  }

  const categoryColors = {
    'Sức khỏe': 'bg-green-100',
    'Học tập': 'bg-blue-100',
    'Thể chất': 'bg-pink-100',
    'Sinh hoạt': 'bg-yellow-100',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-900">Thói quen</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
        >
          + Thêm mới
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-3">📝</p>
          <p>Chưa có thói quen nào.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-purple-600 text-sm font-medium hover:underline"
          >
            Thêm thói quen đầu tiên →
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {habits.map(habit => (
            <div key={habit.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                categoryColors[habit.category_name] || 'bg-gray-100'
              }`}>
                {habit.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">{habit.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {habit.category_name || 'Chung'} • {habit.frequency === 'daily' ? 'Hàng ngày' : `Ngày: ${habit.days_of_week}`}
                  {habit.reminder_time && ` • ⏰ ${habit.reminder_time}`}
                </div>
                {habit.description && (
                  <div className="text-xs text-gray-500 mt-1">{habit.description}</div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => handleEdit(habit)}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200 transition"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm hover:bg-red-100 transition"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <HabitForm onClose={handleClose} editHabit={editHabit} />}
    </div>
  )
}
