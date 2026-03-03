import { useEffect, useCallback } from 'react'

export function useNotification() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const notify = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '🔔' })
    }
  }, [])

  return { notify }
}

// Check and fire reminders based on habit reminder_time
export function useHabitReminders(habits) {
  const { notify } = useNotification()

  useEffect(() => {
    if (!habits || habits.length === 0) return

    const checkReminders = () => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      habits.forEach(habit => {
        if (habit.reminder_time === currentTime) {
          notify(`${habit.icon} ${habit.name}`, 'Đã đến giờ thực hiện thói quen!')
        }
      })
    }

    // Check every minute
    const interval = setInterval(checkReminders, 60000)
    return () => clearInterval(interval)
  }, [habits, notify])
}
