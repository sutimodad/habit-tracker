import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function ProfileSelector() {
  const { members, currentMember, selectMember, addMember, updateMember, deleteMember } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAvatar, setNewAvatar] = useState('👤')
  const [editingMember, setEditingMember] = useState(null)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')

  const avatars = ['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👶']

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    await addMember({ name: newName, avatar: newAvatar })
    setNewName('')
    setNewAvatar('👤')
    setShowAdd(false)
  }

  const startEdit = (member) => {
    setEditingMember(member)
    setEditName(member.name)
    setEditAvatar(member.avatar)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!editName.trim()) return
    await updateMember(editingMember.id, { name: editName, avatar: editAvatar })
    setEditingMember(null)
  }

  const handleDelete = async (member) => {
    if (confirm(`Bạn có chắc muốn xóa "${member.name}"? Tất cả thói quen và dữ liệu check-in sẽ bị xóa.`)) {
      await deleteMember(member.id)
      setEditingMember(null)
    }
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
    <>
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">Thành viên:</span>
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => selectMember(m)}
              onContextMenu={(e) => { e.preventDefault(); startEdit(m) }}
              title={`${m.name} (chuột phải để sửa)`}
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
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {currentMember.avatar} {currentMember.name}
              </span>
              <button
                onClick={() => startEdit(currentMember)}
                className="text-gray-400 hover:text-purple-600 transition text-xs"
                title="Sửa thành viên"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Sửa thành viên</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Avatar</label>
                <div className="flex flex-wrap gap-1.5">
                  {avatars.map(a => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => setEditAvatar(a)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition ${
                        editAvatar === a ? 'bg-purple-100 ring-2 ring-purple-500' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Tên</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDelete(editingMember)}
                  className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition"
                >
                  🗑️ Xóa
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
