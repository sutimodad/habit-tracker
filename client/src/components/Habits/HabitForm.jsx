import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const defaultIcons = ['✅', '📖', '💧', '🏃', '🧘', '🛏️', '💊', '🎯', '💻', '🎵', '🌱', '🍎']

export default function HabitForm({ onClose, editHabit }) {
  const { addHabit, updateHabit, categories } = useApp()
  const [name, setName] = useState(editHabit?.name || '')
  const [description, setDescription] = useState(editHabit?.description || '')
  const [icon, setIcon] = useState(editHabit?.icon || '✅')
  const [frequency, setFrequency] = useState(editHabit?.frequency || 'daily')
  const [daysOfWeek, setDaysOfWeek] = useState(editHabit?.days_of_week || '')
  const [reminderTime, setReminderTime] = useState(editHabit?.reminder_time || '')
  const [categoryId, setCategoryId] = useState(editHabit?.category_id || '')

  const dayOptions = [
    { value: '1', label: 'T2' },
    { value: '2', label: 'T3' },
    { value: '3', label: 'T4' },
    { value: '4', label: 'T5' },
    { value: '5', label: 'T6' },
    { value: '6', label: 'T7' },
    { value: '0', label: 'CN' },
  ]

  const selectedDays = daysOfWeek ? daysOfWeek.split(',') : []

  const toggleDay = (day) => {
    const current = new Set(selectedDays)
    if (current.has(day)) current.delete(day)
    else current.add(day)
    setDaysOfWeek([...current].join(','))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const data = {
      name, description, icon, frequency,
      daysOfWeek: frequency === 'custom' ? daysOfWeek : null,
      reminderTime: reminderTime || null,
      categoryId: categoryId || null,
    }

    if (editHabit) {
      await updateHabit(editHabit.id, data)
    } else {
      await addHabit(data)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h3 className="text-lg font-bold mb-4">
          {editHabit ? 'Sửa thói quen' : 'Thêm thói quen mới'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon picker */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {defaultIcons.map(i => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition ${
                    icon === i ? 'bg-purple-100 ring-2 ring-purple-500' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Tên thói quen *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ví dụ: Đọc sách 30 phút"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Mô tả</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả ngắn (tùy chọn)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Danh mục</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Chung</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Tần suất</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  frequency === 'daily' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Hàng ngày
              </button>
              <button
                type="button"
                onClick={() => setFrequency('custom')}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  frequency === 'custom' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Tùy chỉnh
              </button>
            </div>
          </div>

          {/* Day picker */}
          {frequency === 'custom' && (
            <div className="flex gap-1.5">
              {dayOptions.map(d => (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => toggleDay(d.value)}
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition ${
                    selectedDays.includes(d.value)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}

          {/* Reminder */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Giờ nhắc nhở</label>
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition"
            >
              {editHabit ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
