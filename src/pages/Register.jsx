import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.email, form.password)
      toast.success('Account created! Let\'s grind.')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
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
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>Create your account</div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Email</div>
            <input type="email" placeholder="eren@gmail.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Password</div>
            <input type="password" placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Confirm Password</div>
            <input type="password" placeholder="Repeat password" value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
          </div>
          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: '11px', borderRadius: 8, border: 'none',
            background: 'var(--green)', color: '#000', fontWeight: 600, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1,
          }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--green)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
