import { useState, useEffect } from 'react'
import { streakApi, problemApi } from '../api'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isFuture, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { Modal, Btn } from './UI'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Calendar() {
  const [calendarDays, setCalendarDays] = useState([])
  const [problems, setProblems] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayProblems, setDayProblems] = useState([])

  useEffect(() => {
    streakApi.getCalendar().then(r => setCalendarDays(r.data)).catch(() => {})
    problemApi.getAll().then(r => setProblems(r.data)).catch(() => {})
  }, [])

  // rebuild map every render so UI is always in sync
  const dayStatusMap = {}
  calendarDays.forEach(d => { dayStatusMap[d.date] = d.status })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startWd = (getDay(monthStart) + 6) % 7
  const blanks = Array(startWd).fill(null)

  const markDay = async (dateStr, status) => {
    const existing = dayStatusMap[dateStr]
    const newStatus = existing === status ? 'clear' : status
    
    // 1. Update calendar UI instantly
    setCalendarDays(prev => {
      const filtered = prev.filter(d => d.date !== dateStr)
      if (newStatus !== 'clear') return [...filtered, { date: dateStr, status: newStatus }]
      return filtered
    })
  
    // 2. Fire event instantly so sidebar + dashboard update immediately
    window.dispatchEvent(new CustomEvent('streak-updated', { detail: { date: dateStr, status: newStatus } }))
    
    // 3. Sync with backend silently in background
    try {
      await streakApi.markDay({ date: dateStr, status: newStatus })
      toast.success(newStatus === 'clear' ? 'Day cleared' : `Marked as ${newStatus}`)
    } catch {
      // Revert on failure
      setCalendarDays(prev => {
        const filtered = prev.filter(d => d.date !== dateStr)
        if (existing) return [...filtered, { date: dateStr, status: existing }]
        return filtered
      })
      toast.error('Failed to update day')
    }
  }

  const openDay = (dateStr) => {
    setSelectedDay(dateStr)
    setDayProblems(problems.filter(p => p.date === dateStr))
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayStatus = dayStatusMap[todayStr]
  const DIFF_COLOR = { Easy: 'var(--green)', Medium: 'var(--amber)', Hard: 'var(--red)' }

  return (
    <>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>

        {/* Month nav */}
        <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Calendar
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)', minWidth: 100, textAlign: 'center' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: 14 }}>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 4 }}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--font-mono)', padding: '2px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {blanks.map((_, i) => <div key={`b${i}`} />)}
            {days.map(day => {
              const ds = format(day, 'yyyy-MM-dd')
              const status = dayStatusMap[ds]
              const future = isFuture(day) && !isToday(day)
              const probCount = problems.filter(p => p.date === ds).length

              let bg = 'transparent', border = '1px solid var(--border)', color = 'var(--dim)'
              if (status === 'done') { bg = 'var(--green-dim)'; border = '1px solid var(--green)'; color = 'var(--green)' }
              if (status === 'skip') { bg = 'var(--red-dim)'; border = '1px solid var(--red)'; color = 'var(--red)' }
              if (isToday(day)) border = '1.5px solid var(--blue)'

              return (
                <div key={ds} onClick={() => !future && openDay(ds)}
                  style={{
                    aspectRatio: 1, borderRadius: 8, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: future ? 'default' : 'pointer',
                    background: bg, border, color, fontSize: 11,
                    fontFamily: 'var(--font-mono)', transition: 'all .15s',
                    opacity: future ? .35 : 1,
                  }}
                >
                  <span>{day.getDate()}</span>
                  {probCount > 0 && (
                    <span style={{ fontSize: 8, background: 'var(--green)', color: '#000', borderRadius: 99, padding: '0 3px', marginTop: 1, fontWeight: 700 }}>
                      {probCount}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center' }}>
            {[['var(--green-dim)', 'var(--green)', 'Done'],
              ['var(--red-dim)', 'var(--red)', 'Skipped'],
              ['var(--blue-dim)', 'var(--blue)', 'Today']].map(([bg, c, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: `1px solid ${c}` }} />
                {label}
              </div>
            ))}
          </div>

          {/* Smart today buttons — changes based on current status */}
          <div style={{ marginTop: 12, display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
            {todayStatus === 'done' ? (
              <>
                <span style={{ fontSize: 12, color: 'var(--green)' }}>✅ Today marked as done</span>
                <button onClick={() => markDay(todayStr, 'done')} style={{
                  padding: '5px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
                  background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red)',
                }}>✕ Clear</button>
              </>
            ) : todayStatus === 'skip' ? (
              <>
                <span style={{ fontSize: 12, color: 'var(--red)' }}>✕ Today marked as skipped</span>
                <button onClick={() => markDay(todayStr, 'done')} style={{
                  padding: '5px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
                  background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green)',
                }}>Mark done instead</button>
                <button onClick={() => markDay(todayStr, 'skip')} style={{
                  padding: '5px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
                  background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red)',
                }}>Clear</button>
              </>
            ) : (
              <>
                <button onClick={() => markDay(todayStr, 'done')} style={{
                  padding: '5px 14px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
                  background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green)',
                }}>✓ Mark today done</button>
                <button onClick={() => markDay(todayStr, 'skip')} style={{
                  padding: '5px 14px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
                  background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red)',
                }}>✕ Mark skipped</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Day detail modal */}
      <Modal open={!!selectedDay} onClose={() => setSelectedDay(null)}
        title={selectedDay ? format(parseISO(selectedDay), 'EEEE, MMMM d yyyy') : ''}>

        {dayProblems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: 13 }}>
            No problems logged on this day.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {dayProblems.map(p => (
              <div key={p.id} style={{ padding: 14, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                  {p.lcNumber && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--dim)' }}>#{p.lcNumber}</span>}
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'var(--purple-dim)', color: 'var(--purple)', fontFamily: 'var(--font-mono)' }}>{p.pattern}</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, color: DIFF_COLOR[p.difficulty] || 'var(--green)', background: 'rgba(0,0,0,.2)' }}>{p.difficulty}</span>
                </div>
                {p.triggerNote && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}><b style={{ color: 'var(--text)' }}>Trigger:</b> {p.triggerNote}</div>}
                {p.mistakeNote && <div style={{ fontSize: 12, color: 'var(--red)', opacity: .85 }}><b>Mistake:</b> {p.mistakeNote}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Smart modal mark buttons */}
        {selectedDay && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {dayStatusMap[selectedDay] === 'done' ? (
              <>
                <div style={{ fontSize: 13, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  ✅ Already marked done
                </div>
                <Btn size="sm" variant="danger" onClick={() => { markDay(selectedDay, 'done'); setSelectedDay(null) }}>
                  Clear
                </Btn>
              </>
            ) : dayStatusMap[selectedDay] === 'skip' ? (
              <>
                <Btn size="sm" onClick={() => { markDay(selectedDay, 'done'); setSelectedDay(null) }}>
                  Mark done instead
                </Btn>
                <Btn size="sm" variant="danger" onClick={() => { markDay(selectedDay, 'skip'); setSelectedDay(null) }}>
                  Clear
                </Btn>
              </>
            ) : (
              <>
                <Btn size="sm" onClick={() => { markDay(selectedDay, 'done'); setSelectedDay(null) }}>
                  Mark done
                </Btn>
                <Btn size="sm" variant="secondary" onClick={() => { markDay(selectedDay, 'skip'); setSelectedDay(null) }}>
                  Mark skipped
                </Btn>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
