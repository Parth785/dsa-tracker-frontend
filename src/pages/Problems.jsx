import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { problemApi } from '../api'
import { PageTitle, Badge, DiffBadge, Empty, Spinner, Modal, Btn } from '../components/UI'
import toast from 'react-hot-toast'
import { Pencil, Trash2, Eye } from 'lucide-react'

export default function Problems() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [view, setView] = useState(null)
  const navigate = useNavigate()

  const load = () => {
    problemApi.getAll()
      .then(r => setProblems(r.data))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return
    try {
      await problemApi.delete(p.id)
      setProblems(prev => prev.filter(x => x.id !== p.id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const patterns = ['All', ...new Set(problems.map(p => p.pattern).filter(Boolean))]
  const filtered = filter === 'All' ? problems : problems.filter(p => p.pattern === filter)

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <PageTitle sub={`${filtered.length} problem${filtered.length !== 1 ? 's' : ''}`}>All problems</PageTitle>
        <Btn onClick={() => navigate('/log')}>+ Log problem</Btn>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
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

      {filtered.length === 0 ? <Empty icon="📭" message="No problems found." /> : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Problem','Pattern','Difficulty','Type','Date',''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 500 }}>
                      {p.name} {p.lcNumber && <span style={{ color: 'var(--dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>#{p.lcNumber}</span>}
                    </div>
                    {p.triggerNote && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.triggerNote.slice(0,80)}{p.triggerNote.length>80?'…':''}</div>}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><Badge>{p.pattern}</Badge></td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><DiffBadge diff={p.difficulty} /></td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
                    {p.type === 'revision' ? 'Revision' : 'New'}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--dim)' }}>{p.date}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setView(p)} title="View" style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px 6px', borderRadius: 6 }}><Eye size={14} /></button>
                      <button onClick={() => navigate(`/log/${p.id}`)} title="Edit" style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px 6px', borderRadius: 6 }}><Pencil size={14} /></button>
                      <button onClick={() => del(p)} title="Delete" style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px 6px', borderRadius: 6 }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View modal */}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.name || ''} width={680}>
        {view && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge>{view.pattern}</Badge>
              <DiffBadge diff={view.difficulty} />
              {view.lcNumber && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--dim)' }}>LC #{view.lcNumber}</span>}
              {view.timeTaken && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--dim)' }}>{view.timeTaken} min</span>}
            </div>
            {view.triggerNote && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Trigger → Approach</div>
                <div style={{ fontSize: 13, color: 'var(--text)', background: 'var(--surface2)', padding: 12, borderRadius: 8, lineHeight: 1.8 }}>{view.triggerNote}</div>
              </div>
            )}
            {view.mistakeNote && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Mistake</div>
                <div style={{ fontSize: 13, color: 'var(--red)', opacity: .85, background: 'var(--red-dim)', padding: 12, borderRadius: 8, lineHeight: 1.8 }}>{view.mistakeNote}</div>
              </div>
            )}
            {view.solutionCode && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Solution</div>
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--surface2)', padding: 14, borderRadius: 8, overflowX: 'auto', lineHeight: 1.7, color: 'var(--text)', border: '1px solid var(--border)' }}>
                  {view.solutionCode}
                </pre>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Btn onClick={() => { navigate(`/log/${view.id}`); setView(null) }} size="sm">Edit</Btn>
              <Btn variant="secondary" onClick={() => setView(null)} size="sm">Close</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
