import { useState } from 'react'
import { useApp } from '../context/AppContext'
import DailyCheckIn from '../components/CheckIn/DailyCheckIn'
import { useHabitReminders } from '../hooks/useNotification'

export default function Home() {
  const { currentMember, habits, loading } = useApp()
  useHabitReminders(habits)
  const [date, setDate] = useState(new Date())

  if (loading) {
    return <div className="text-center text-gray-400 py-20">Đang tải...</div>
  }

  if (!currentMember) {
    return (
      <div className="text-center text-gray-400 py-20">
        <p className="text-5xl mb-4">👆</p>
        <p className="text-lg">Hãy thêm thành viên đầu tiên ở phía trên.</p>
      </div>
    )
  }

  return <DailyCheckIn date={date} onDateChange={setDate} />
}
