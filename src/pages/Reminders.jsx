import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { problemApi } from '../api'
import { PageTitle, Badge, DiffBadge, Empty, Spinner, Btn } from '../components/UI'
import { differenceInDays, parseISO } from 'date-fns'
import { Bell, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Reminders() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    problemApi.getAll()
      .then(r => setProblems(r.data))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const today = new Date()

  // Compute revision due date based on flag
  const getDueIn = (p) => {
    if (!p.revisionStatus || p.revisionStatus === 'no') return null
    const daysAfter = p.revisionStatus === 'hard' ? 1 : 3
    const logged = parseISO(p.date)
    const due = new Date(logged)
    due.setDate(due.getDate() + daysAfter)
    return differenceInDays(due, today)
  }

  const overdue = problems.filter(p => { const d = getDueIn(p); return d !== null && d < 0 })
  const dueToday = problems.filter(p => { const d = getDueIn(p); return d === 0 })
  const upcoming = problems.filter(p => { const d = getDueIn(p); return d !== null && d > 0 && d <= 7 })

  const markDone = async (p) => {
    try {
      await problemApi.update(p.id, { revisionStatus: 'no' })
      toast.success(`"${p.name}" marked as revised!`)
      load()
    } catch { toast.error('Failed to update') }
  }

  if (loading) return <Spinner />

  const total = overdue.length + dueToday.length + upcoming.length

  return (
    <div>
      <PageTitle sub="Problems flagged for revision — sorted by urgency">Reminders</PageTitle>

      {total === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <Bell size={36} color="var(--green)" style={{ marginBottom: 12 }} />
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>You're all caught up!</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>No revisions pending. Keep logging problems and flag hard ones.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Overdue */}
          {overdue.length > 0 && (
            <Section title="Overdue" color="var(--red)" count={overdue.length}
              sub="These should have been revised already">
              {overdue.map(p => <ReminderCard key={p.id} p={p} dueIn={getDueIn(p)} onRevised={markDone} onEdit={() => navigate(`/log/${p.id}`)} />)}
            </Section>
          )}

          {/* Due today */}
          {dueToday.length > 0 && (
            <Section title="Due today" color="var(--amber)" count={dueToday.length}
              sub="Revise these before you sleep tonight">
              {dueToday.map(p => <ReminderCard key={p.id} p={p} dueIn={0} onRevised={markDone} onEdit={() => navigate(`/log/${p.id}`)} />)}
            </Section>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <Section title="Upcoming (next 7 days)" color="var(--blue)" count={upcoming.length}
              sub="Coming up — plan ahead">
              {upcoming.map(p => <ReminderCard key={p.id} p={p} dueIn={getDueIn(p)} onRevised={markDone} onEdit={() => navigate(`/log/${p.id}`)} />)}
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, color, count, sub, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color }}>{title}</div>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: color + '22', color, fontFamily: 'var(--font-mono)' }}>{count}</span>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function ReminderCard({ p, dueIn, onRevised, onEdit }) {
  const urgency = dueIn < 0 ? 'var(--red)' : dueIn === 0 ? 'var(--amber)' : 'var(--blue)'
  const dueLabel = dueIn < 0 ? `${Math.abs(dueIn)}d overdue` : dueIn === 0 ? 'Due today' : `In ${dueIn}d`

  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid var(--border)`,
      borderLeft: `3px solid ${urgency}`,
      borderRadius: '0 12px 12px 0', padding: '14px 18px',
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
          {p.lcNumber && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--dim)' }}>#{p.lcNumber}</span>}
          <Badge>{p.pattern}</Badge>
          <DiffBadge diff={p.difficulty} />
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: urgency, fontWeight: 600 }}>{dueLabel}</span>
        </div>
        {p.triggerNote && (
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 6 }}>
            <b style={{ color: 'var(--text)' }}>Trigger:</b> {p.triggerNote.slice(0, 120)}{p.triggerNote.length > 120 ? '…' : ''}
          </div>
        )}
        {p.mistakeNote && (
          <div style={{ fontSize: 12, color: 'var(--red)', opacity: .8, lineHeight: 1.7 }}>
            <b>Mistake:</b> {p.mistakeNote.slice(0, 100)}{p.mistakeNote.length > 100 ? '…' : ''}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <Btn size="sm" onClick={() => onRevised(p)} style={{ gap: 4 }}>
          <CheckCircle size={12} /> Revised
        </Btn>
        <Btn size="sm" variant="secondary" onClick={onEdit}>View</Btn>
      </div>
    </div>
  )
}
