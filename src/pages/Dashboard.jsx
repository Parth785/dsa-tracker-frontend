import { useEffect, useState } from 'react'
import { streakApi, problemApi } from '../api'
import { StatCard, Card, SectionHead, Badge, DiffBadge, Spinner } from '../components/UI'
import Calendar from '../components/Calendar'
import { format } from 'date-fns'
import { Zap, Target, Calendar as CalIcon, TrendingUp } from 'lucide-react'

const PATTERN_COLORS = ['#22c55e','#3b82f6','#a855f7','#f59e0b','#14b8a6','#ef4444','#ec4899','#8b5cf6','#06b6d4','#84cc16']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => {
      Promise.all([streakApi.getStats(), problemApi.getAll()])
        .then(([s, p]) => { setStats(s.data); setProblems(p.data) })
    }
    load()
    window.addEventListener('streak-updated', load)
    return () => window.removeEventListener('streak-updated', load)
  }, [])

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const recent = problems.slice(0, 5)

  if (loading) return <Spinner />

  return (
    <div>
      {/* Hero */}
      <div style={{
        marginBottom: '1.5rem', padding: '1.5rem 2rem',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
          {format(new Date(), 'EEEE, MMMM d yyyy')}
        </div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
          {greet}. {stats?.currentStreak > 0 ? `${stats.currentStreak} days strong.` : 'Start your streak today.'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.2rem' }}>
          {stats?.currentStreak >= 7 ? "Don't break the chain now." : stats?.currentStreak > 0 ? 'Keep the chain going.' : 'First problem first.'}
        </div>
        <div style={{ padding: '10px 14px', background: 'var(--surface2)', borderLeft: '3px solid var(--amber)', borderRadius: '0 8px 8px 0', fontSize: 13, color: 'var(--muted)' }}>
          <b style={{ color: 'var(--amber)' }}>Today's contract:</b> 1 new problem + 1 revision. Even on a bad day.
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.5rem' }}>
        <StatCard label="Current streak" value={stats?.currentStreak || 0} sub="days in a row" color="var(--green)" />
        <StatCard label="Total solved" value={stats?.totalProblems || 0} sub="problems logged" color="var(--amber)" />
        <StatCard label="Days done" value={stats?.totalDoneDays || 0} sub="active days" color="var(--purple)" />
        <StatCard label="Patterns" value={stats?.patternCounts?.length || 0} sub="topics touched" color="var(--blue)" />
      </div>

      {/* Calendar + Pattern progress */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Calendar />

        <Card>
          <SectionHead right="8 = mastered">Pattern progress</SectionHead>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(!stats?.patternCounts || stats.patternCounts.length === 0) ? (
              <div style={{ color: 'var(--dim)', fontSize: 13, padding: '1rem 0' }}>No problems logged yet.</div>
            ) : stats.patternCounts.map((pc, i) => {
              const pct = Math.min((pc.count / 8) * 100, 100)
              return (
                <div key={pc.pattern} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 130, fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{pc.pattern}</div>
                  <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: PATTERN_COLORS[i % PATTERN_COLORS.length], transition: 'width .4s ease' }} />
                  </div>
                  <div style={{ width: 36, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--dim)', textAlign: 'right' }}>{pc.count}/8</div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Recent problems */}
      <Card>
        <SectionHead>Recent problems</SectionHead>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--dim)', fontSize: 13 }}>No problems logged yet. Go log your first one.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Problem','Pattern','Difficulty','Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 500 }}>{p.name} {p.lcNumber && <span style={{ color: 'var(--dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>#{p.lcNumber}</span>}</div>
                    {p.triggerNote && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.triggerNote.slice(0, 70)}{p.triggerNote.length > 70 ? '…' : ''}</div>}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><Badge>{p.pattern}</Badge></td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><DiffBadge diff={p.difficulty} /></td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--dim)' }}>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
