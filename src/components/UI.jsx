// ── Button ──────────────────────────────────────────────────────────────────
export function Btn({ children, variant = 'primary', size = 'md', style = {}, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, border: 'none', borderRadius: 8, fontWeight: 500,
    cursor: 'pointer', transition: 'all .2s', fontFamily: 'var(--font-body)',
  }
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '9px 18px', fontSize: 13 },
    lg: { padding: '12px 24px', fontSize: 14 },
  }
  const variants = {
    primary: { background: 'var(--green)', color: '#000' },
    secondary: { background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' },
    danger: { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red-dim)' },
    ghost: { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' },
  }
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, ...props }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, ...style
    }} {...props}>
      {children}
    </div>
  )
}

// ── SectionHead ──────────────────────────────────────────────────────────────
export function SectionHead({ children, right }) {
  return (
    <div style={{
      padding: '13px 18px', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {children}
      </div>
      {right && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{right}</div>}
    </div>
  )
}

// ── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = 'var(--text)' }) {
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </Card>
  )
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'purple' }) {
  const colors = {
    purple: { bg: 'var(--purple-dim)', text: 'var(--purple)' },
    green: { bg: 'var(--green-dim)', text: 'var(--green)' },
    amber: { bg: 'var(--amber-dim)', text: 'var(--amber)' },
    red: { bg: 'var(--red-dim)', text: 'var(--red)' },
    blue: { bg: 'var(--blue-dim)', text: 'var(--blue)' },
  }
  const c = colors[color] || colors.purple
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 99,
      background: c.bg, color: c.text,
      fontFamily: 'var(--font-mono)', fontWeight: 500,
    }}>{children}</span>
  )
}

// ── DiffBadge ────────────────────────────────────────────────────────────────
export function DiffBadge({ diff }) {
  const map = { Easy: 'green', Medium: 'amber', Hard: 'red' }
  return <Badge color={map[diff] || 'green'}>{diff || 'Easy'}</Badge>
}

// ── PageTitle ────────────────────────────────────────────────────────────────
export function PageTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>{children}</div>
      {sub && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

// ── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  )
}

// ── Empty ────────────────────────────────────────────────────────────────────
export function Empty({ icon = '📭', message }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--dim)' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13 }}>{message}</div>
    </div>
  )
}

// ── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--green)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: 16, width, maxWidth: '96vw', maxHeight: '90vh',
        overflowY: 'auto', padding: 24,
        animation: 'modalIn .2s ease',
      }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(10px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 800 }}>{title}</div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)',
            border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 16,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
