import { PageTitle, Card } from '../components/UI'

const rules = [
  { num: '01', title: '2 problems every single day. No exceptions.', desc: 'Not 5 on Sunday to compensate. Not "I\'ll do 3 tomorrow." 2 today. That is the contract. Even on your worst day — open LeetCode, do 2 problems, close it. Done. The chain is the system.', color: 'var(--green)' },
  { num: '02', title: 'Never move topic until 8 problems in it.', desc: 'You left Two Sum → Sliding Window because you never finished either. 8 problems minimum per pattern before you touch the next one. Not 3. Not "I get the idea." 8. That is the point where recognition becomes instinct.', color: 'var(--blue)', highlight: '8 problems minimum per pattern' },
  { num: '03', title: '20-minute stuck rule.', desc: 'Set a timer. Zero idea after 20 min → read only the hint. Try again for 15 min. Still stuck → read the approach in words only. Code it yourself. Never copy-paste a solution. That is the reason you forget.', color: 'var(--purple)', highlight: 'Never copy-paste a solution.' },
  { num: '04', title: 'Never memorize. Internalize the trigger.', desc: 'After every problem write: trigger → approach → mistake. 2 sentences. That is what you revise from in 10 days — not the solution. Ask yourself: if this problem had a different story, would I recognize it?', color: 'var(--amber)', highlight: 'would I recognize it?' },
  { num: '05', title: 'Never restart from Two Sum.', desc: 'Feeling rusty is not a reason to restart. It is a reason to revise 2 problems and keep going. Pick up exactly where you left off. Even after 3 months. The restart is the trap, not the problem list.', color: 'var(--teal)', highlight: 'The restart is the trap.' },
  { num: '06', title: 'Revise on day 3, 7, and 15.', desc: 'Every problem gets 3 revision passes. If you can\'t solve it cold from your 2-sentence note → the pattern is not internalized yet. Reset the timer. Consistency beats intensity every single time.', color: 'var(--red)', highlight: 'Consistency beats intensity every single time.' },
]

export default function Rules() {
  return (
    <div style={{ maxWidth: 760 }}>
      <PageTitle sub="Read these every week. Not for motivation — for calibration.">The rules.</PageTitle>
      <Card>
        <div style={{ padding: '0 24px' }}>
          {rules.map((r, i) => (
            <div key={r.num} style={{
              display: 'flex', gap: 20, padding: '24px 0',
              borderBottom: i < rules.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 40, fontWeight: 800, color: 'var(--border2)', lineHeight: 1, flexShrink: 0, width: 52 }}>{r.num}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{r.title}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.9 }}>
                  {r.highlight ? r.desc.split(r.highlight).map((part, j, arr) => (
                    <span key={j}>{part}{j < arr.length - 1 && <b style={{ color: r.color, fontWeight: 500 }}>{r.highlight}</b>}</span>
                  )) : r.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
