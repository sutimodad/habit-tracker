import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function ProfileSelector() {
  const { members, currentMember, selectMember, addMember } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAvatar, setNewAvatar] = useState('👤')

  const avatars = ['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👶']

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    await addMember({ name: newName, avatar: newAvatar })
    setNewName('')
    setNewAvatar('👤')
    setShowAdd(false)
  }

  if (!currentMember && members.length === 0) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-600 mb-3 text-sm">Chào mừng! Hãy thêm thành viên đầu tiên:</p>
          <form onSubmit={handleAdd} className="flex gap-2 items-center">
            <select
              value={newAvatar}
              onChange={e => setNewAvatar(e.target.value)}
              className="text-2xl bg-gray-100 rounded-lg p-1 cursor-pointer"
            >
              {avatars.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Tên thành viên..."
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
            >
              Thêm
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="max-w-2xl mx-auto flex items-center gap-2">
        <span className="text-xs text-gray-500 mr-1">Thành viên:</span>
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => selectMember(m)}
            title={m.name}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all
              ${currentMember?.id === m.id
                ? 'ring-2 ring-purple-600 ring-offset-2 scale-110'
                : 'hover:scale-110 opacity-70 hover:opacity-100'
              }`}
            style={{ backgroundColor: m.color + '20' }}
          >
            {m.avatar}
          </button>
        ))}

        {/* Add member button */}
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-400 transition text-sm"
          >
            +
          </button>
        ) : (
          <form onSubmit={handleAdd} className="flex gap-1 items-center ml-2">
            <select
              value={newAvatar}
              onChange={e => setNewAvatar(e.target.value)}
              className="text-lg bg-gray-100 rounded p-0.5"
            >
              {avatars.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Tên..."
              className="border border-gray-300 rounded px-2 py-1 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-purple-500"
              autoFocus
            />
            <button type="submit" className="text-purple-600 text-xs font-medium">OK</button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400 text-xs">✕</button>
          </form>
        )}

        {currentMember && (
          <span className="ml-auto text-sm font-medium text-gray-700">
            {currentMember.avatar} {currentMember.name}
          </span>
        )}
      </div>
    </div>
  )
}
