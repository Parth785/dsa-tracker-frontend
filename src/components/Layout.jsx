import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { streakApi } from '../api'
import {
  LayoutDashboard, PlusCircle, List, BookOpen,
  BarChart2, Bell, Shield, LogOut, Zap
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/log', icon: PlusCircle, label: 'Log Problem' },
  { to: '/problems', icon: List, label: 'Problems' },
  { to: '/notes', icon: BookOpen, label: 'Notes' },
  { to: '/summary', icon: BarChart2, label: 'Summary' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/rules', icon: Shield, label: 'Rules' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [streak, setStreak] = useState(0)

  const location = useLocation()

  useEffect(() => {
    streakApi.getStats().then(r => setStreak(r.data.currentStreak)).catch(() => {})
  }, [location.pathname])
  
  useEffect(() => {
    const handleStreakUpdate = (e) => {
      const { status } = e.detail || {}
      if (status === 'done') setStreak(s => s + 1)
      else if (status === 'clear') setStreak(s => Math.max(0, s - 1))
    }
    window.addEventListener('streak-updated', handleStreakUpdate)
    return () => window.removeEventListener('streak-updated', handleStreakUpdate)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>
            DSA<span style={{ color: 'var(--green)' }}>.</span>GRIND
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Zap size={13} color="var(--green)" fill="var(--green)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>
              {streak} day streak
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                color: isActive ? 'var(--green)' : 'var(--muted)',
                background: isActive ? 'var(--green-glow)' : 'transparent',
                transition: 'all .15s', textDecoration: 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} color={isActive ? 'var(--green)' : 'var(--muted)'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--muted)', marginBottom: 4, wordBreak: 'break-all' }}>
            {user?.email}
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '9px 12px', borderRadius: 8,
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'none' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', padding: '2rem', maxWidth: 'calc(100vw - 220px)' }}>
        <Outlet />
      </main>
    </div>
  )
}
