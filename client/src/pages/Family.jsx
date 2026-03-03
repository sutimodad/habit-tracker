import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function Family() {
  const { members, fetchMembers } = useApp()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats?family=leaderboard')
      .then(r => r.json())
      .then(data => {
        setLeaderboard(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [members])

  if (members.length === 0) {
    return (
      <div className="text-center text-gray-400 py-20">
        <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
        <p>Thêm thành viên để xem bảng xếp hạng gia đình.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-5">
        Gia đình 👨‍👩‍👧‍👦
      </h2>

      {/* Leaderboard */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Bảng xếp hạng tuần này</h3>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Đang tải...</div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((member, index) => (
              <div key={member.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                {/* Rank */}
                <div className="w-7 text-center font-bold text-lg shrink-0">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                </div>

                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: member.color + '20' }}
                >
                  {member.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{member.name}</div>
                  <div className="text-xs text-gray-400">
                    🔥 {member.streak} ngày streak • {member.totalHabits} thói quen
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${member.weeklyRate}%`,
                      backgroundColor: member.color
                    }}
                  />
                </div>

                {/* Rate */}
                <div className="font-bold text-sm w-12 text-right shrink-0" style={{ color: member.color }}>
                  {member.weeklyRate}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {members.map(member => {
          const lb = leaderboard.find(l => l.id === member.id) || {}
          return (
            <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-2"
                style={{ backgroundColor: member.color + '20' }}
              >
                {member.avatar}
              </div>
              <div className="font-semibold text-sm">{member.name}</div>
              <div className="text-xs text-gray-400 mt-1">
                🔥 {lb.streak || 0} ngày • 🏆 {lb.bestStreak || 0} kỷ lục
              </div>
              <div className="text-lg font-bold mt-2" style={{ color: member.color }}>
                {lb.weeklyRate || 0}%
              </div>
              <div className="text-xs text-gray-400">hoàn thành tuần</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
