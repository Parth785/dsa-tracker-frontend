import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 400, padding: 32, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          DSA<span style={{ color: 'var(--green)' }}>.</span>GRIND
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>Sign in to your tracker</div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Email</div>
            <input type="email" placeholder="eren@gmail.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Password</div>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: '11px', borderRadius: 8, border: 'none',
            background: 'var(--green)', color: '#000', fontWeight: 600, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1,
          }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
          No account? <Link to="/register" style={{ color: 'var(--green)' }}>Register</Link>
        </div>
      </div>
    </div>
  )
}
