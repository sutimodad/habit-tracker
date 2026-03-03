import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext()

const API = '/api'

export function AppProvider({ children }) {
  const [members, setMembers] = useState([])
  const [currentMember, setCurrentMember] = useState(null)
  const [habits, setHabits] = useState([])
  const [checkins, setCheckins] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch members on mount
  useEffect(() => {
    fetch(`${API}/members`)
      .then(r => r.json())
      .then(data => {
        setMembers(data)
        if (data.length > 0) {
          const savedId = localStorage.getItem('currentMemberId')
          const saved = data.find(m => m.id === Number(savedId))
          setCurrentMember(saved || data[0])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch(`${API}/habits/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  // Fetch habits when member changes
  useEffect(() => {
    if (!currentMember) return
    localStorage.setItem('currentMemberId', currentMember.id)

    fetch(`${API}/habits?memberId=${currentMember.id}`)
      .then(r => r.json())
      .then(setHabits)
  }, [currentMember])

  const selectMember = useCallback((member) => {
    setCurrentMember(member)
  }, [])

  const fetchMembers = useCallback(async () => {
    const res = await fetch(`${API}/members`)
    const data = await res.json()
    setMembers(data)
    return data
  }, [])

  const addMember = useCallback(async (member) => {
    const res = await fetch(`${API}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    })
    const newMember = await res.json()
    setMembers(prev => [...prev, newMember])
    if (!currentMember) setCurrentMember(newMember)
    return newMember
  }, [currentMember])

  const fetchHabits = useCallback(async () => {
    if (!currentMember) return
    const res = await fetch(`${API}/habits?memberId=${currentMember.id}`)
    const data = await res.json()
    setHabits(data)
    return data
  }, [currentMember])

  const addHabit = useCallback(async (habit) => {
    const res = await fetch(`${API}/habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...habit, memberId: currentMember.id })
    })
    const newHabit = await res.json()
    setHabits(prev => [...prev, newHabit])
    return newHabit
  }, [currentMember])

  const updateHabit = useCallback(async (id, data) => {
    const res = await fetch(`${API}/habits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const updated = await res.json()
    setHabits(prev => prev.map(h => h.id === id ? updated : h))
    return updated
  }, [])

  const deleteHabit = useCallback(async (id) => {
    await fetch(`${API}/habits/${id}`, { method: 'DELETE' })
    setHabits(prev => prev.filter(h => h.id !== id))
  }, [])

  const fetchCheckins = useCallback(async (date) => {
    if (!currentMember) return []
    const res = await fetch(`${API}/checkins?memberId=${currentMember.id}&date=${date}`)
    const data = await res.json()
    setCheckins(data)
    return data
  }, [currentMember])

  const toggleCheckin = useCallback(async (habitId, date) => {
    const res = await fetch(`${API}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: currentMember.id, habitId, date })
    })
    const result = await res.json()

    if (result.action === 'checked') {
      setCheckins(prev => [...prev, result.checkin])
    } else {
      setCheckins(prev => prev.filter(c => !(c.habit_id === habitId && c.date === date)))
    }
    return result
  }, [currentMember])

  return (
    <AppContext.Provider value={{
      members, currentMember, selectMember, addMember, fetchMembers,
      habits, fetchHabits, addHabit, updateHabit, deleteHabit,
      checkins, fetchCheckins, toggleCheckin,
      categories, loading
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
