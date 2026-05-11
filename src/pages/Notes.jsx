import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { problemApi } from '../api'
import { PageTitle, Badge, DiffBadge, Empty, Spinner } from '../components/UI'
import { Pencil } from 'lucide-react'

export default function Notes() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const navigate = useNavigate()

  useEffect(() => {
    problemApi.getAll()
      .then(r => setProblems(r.data.filter(p => p.triggerNote || p.mistakeNote || p.solutionCode)))
      .finally(() => setLoading(false))
  }, [])

  const patterns = ['All', ...new Set(problems.map(p => p.pattern).filter(Boolean))]
  const filtered = filter === 'All' ? problems : problems.filter(p => p.pattern === filter)

  if (loading) return <Spinner />

  return (
    <div>
      <PageTitle sub="Problems where you wrote notes — your revision material">Notes</PageTitle>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {patterns.map(p => (
          <button key={p} onClick={() => setFilter(p)} style={{
            padding: '5px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
            border: `1px solid ${filter === p ? 'var(--green)' : 'var(--border)'}`,
            background: filter === p ? 'var(--green-glow)' : 'none',
            color: filter === p ? 'var(--green)' : 'var(--muted)',
            fontFamily: 'var(--font-body)', transition: 'all .15s',
          }}>{p}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty icon="📝" message="No notes yet. Add trigger + mistake when logging problems." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(p => (
            <div key={p.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '18px 20px', transition: 'border-color .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                {p.lcNumber && <span style={{ color: 'var(--dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>#{p.lcNumber}</span>}
                <Badge>{p.pattern}</Badge>
                <DiffBadge diff={p.difficulty} />
                {p.timeTaken && <span style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>{p.timeTaken} min</span>}
                <button onClick={() => navigate(`/log/${p.id}`)} style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                  <Pencil size={12} /> Edit
                </button>
              </div>

              {/* Trigger */}
              {p.triggerNote && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Trigger → Approach</div>
                  <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, background: 'var(--surface2)', padding: '10px 12px', borderRadius: 8 }}>{p.triggerNote}</div>
                </div>
              )}

              {/* Mistake */}
              {p.mistakeNote && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Mistake made</div>
                  <div style={{ fontSize: 13, color: 'var(--red)', opacity: .85, lineHeight: 1.8, background: 'var(--red-dim)', padding: '10px 12px', borderRadius: 8 }}>{p.mistakeNote}</div>
                </div>
              )}

              {/* Solution code */}
              {p.solutionCode && (
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Solution</div>
                  <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--surface2)', padding: 14, borderRadius: 8, overflowX: 'auto', lineHeight: 1.7, color: 'var(--text)', border: '1px solid var(--border)', maxHeight: 300 }}>
                    {p.solutionCode}
                  </pre>
                </div>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>{p.date}</span>
                {p.revisionStatus && p.revisionStatus !== 'no' && (
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--blue-dim)', color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>
                    {p.revisionStatus === 'hard' ? 'Needs revision' : 'Revisit in 3 days'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
