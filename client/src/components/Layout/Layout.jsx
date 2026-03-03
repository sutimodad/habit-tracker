import { NavLink } from 'react-router-dom'
import ProfileSelector from '../Family/ProfileSelector'

const navItems = [
  { to: '/', label: 'Hôm nay', icon: '📅' },
  { to: '/habits', label: 'Thói quen', icon: '✏️' },
  { to: '/stats', label: 'Thống kê', icon: '📊' },
  { to: '/family', label: 'Gia đình', icon: '👨‍👩‍👧‍👦' },
]

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="text-xl font-bold">
            <span className="text-purple-600">Habit</span>
            <span className="text-amber-500">Flow</span>
          </div>
          <div className="flex gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-500 hover:text-purple-600'
                  }`
                }
              >
                <span className="mr-1">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Profile Selector Bar */}
      <ProfileSelector />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
