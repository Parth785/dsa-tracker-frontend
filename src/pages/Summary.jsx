import { useEffect, useState } from 'react'
import { problemApi, streakApi } from '../api'
import { PageTitle, Card, SectionHead, Badge, DiffBadge, Spinner } from '../components/UI'

const PATTERN_COLORS = ['#22c55e','#3b82f6','#a855f7','#f59e0b','#14b8a6','#ef4444','#ec4899','#8b5cf6','#06b6d4','#84cc16','#f97316','#22c55e']

export default function Summary() {
  const [problems, setProblems] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([problemApi.getAll(), streakApi.getStats()])
      .then(([p, s]) => { setProblems(p.data); setStats(s.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const patternMap = {}
  problems.forEach(p => {
    if (!patternMap[p.pattern]) patternMap[p.pattern] = []
    patternMap[p.pattern].push(p)
  })

  const revisionNeeded = problems.filter(p => p.revisionStatus && p.revisionStatus !== 'no')
  const totalTime = problems.reduce((sum, p) => sum + (p.timeTaken || 0), 0)
  const easy = problems.filter(p => p.difficulty === 'Easy').length
  const medium = problems.filter(p => p.difficulty === 'Medium').length
  const hard = problems.filter(p => p.difficulty === 'Hard').length

  return (
    <div>
      <PageTitle sub="Your DSA mastery overview">Summary</PageTitle>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total solved', val: problems.length, color: 'var(--green)' },
          { label: 'Time spent', val: totalTime > 60 ? `${Math.round(totalTime/60)}h` : `${totalTime}m`, color: 'var(--amber)' },
          { label: 'Streak', val: `${stats?.currentStreak || 0}d`, color: 'var(--purple)' },
          { label: 'Need revision', val: revisionNeeded.length, color: 'var(--red)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 30, fontWeight: 800, color: s.color }}>{s.val}</div>
          </Card>
        ))}
      </div>

      {/* Difficulty breakdown */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <SectionHead>Difficulty breakdown</SectionHead>
        <div style={{ padding: 16, display: 'flex', gap: 12 }}>
          {[['Easy', easy, 'var(--green)', 'var(--green-dim)'],
            ['Medium', medium, 'var(--amber)', 'var(--amber-dim)'],
            ['Hard', hard, 'var(--red)', 'var(--red-dim)']].map(([label, count, color, bg]) => (
            <div key={label} style={{ flex: 1, background: bg, border: `1px solid ${color}33`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color }}>{count}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pattern mastery */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <SectionHead right="8 problems = mastered">Pattern mastery</SectionHead>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {Object.entries(patternMap).map(([pattern, probs], i) => {
            const count = probs.length
            const pct = Math.min((count / 8) * 100, 100)
            const color = PATTERN_COLORS[i % PATTERN_COLORS.length]
            const mastery = count >= 8 ? 'Mastered' : count >= 5 ? 'Learning' : 'Started'
            const masteryColor = count >= 8 ? 'var(--green)' : count >= 5 ? 'var(--amber)' : 'var(--red)'
            return (
              <div key={pattern} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>{pattern}</div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color, marginBottom: 4 }}>{count}</div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 6 }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: color, transition: 'width .4s ease' }} />
                </div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: masteryColor }}>{mastery}</div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Needs revision */}
      {revisionNeeded.length > 0 && (
        <Card>
          <SectionHead>Needs revision</SectionHead>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Problem','Pattern','Status','Date'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {revisionNeeded.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><Badge>{p.pattern}</Badge></td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--blue-dim)', color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>
                      {p.revisionStatus === 'hard' ? 'Struggled' : 'Revisit in 3 days'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--dim)' }}>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
