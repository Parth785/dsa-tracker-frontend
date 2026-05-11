import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { problemApi } from '../api'
import { Btn, Field, PageTitle, Card } from '../components/UI'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const PATTERNS = ['Arrays','Two pointers','Sliding window','Binary search','Hashing','Stack / Queue','Linked list','Recursion','Backtracking','Tree traversal','BST','Graph BFS','Graph DFS','Topological sort','Shortest path','Dynamic programming','Greedy','Bit manipulation','Math','Other']

const empty = {
  name: '', lcNumber: '', pattern: '', difficulty: 'Easy',
  type: 'new', timeTaken: '', triggerNote: '', mistakeNote: '',
  solutionCode: '', revisionStatus: 'no', date: format(new Date(), 'yyyy-MM-dd'),
}

export default function LogProblem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const isEdit = !!id

  useEffect(() => {
    if (id) {
      setFetching(true)
      problemApi.getOne(id)
        .then(r => setForm({
          name: r.data.name || '',
          lcNumber: r.data.lcNumber || '',
          pattern: r.data.pattern || '',
          difficulty: r.data.difficulty || 'Easy',
          type: r.data.type || 'new',
          timeTaken: r.data.timeTaken || '',
          triggerNote: r.data.triggerNote || '',
          mistakeNote: r.data.mistakeNote || '',
          solutionCode: r.data.solutionCode || '',
          revisionStatus: r.data.revisionStatus || 'no',
          date: r.data.date || format(new Date(), 'yyyy-MM-dd'),
        }))
        .catch(() => { toast.error('Problem not found'); navigate('/problems') })
        .finally(() => setFetching(false))
    }
  }, [id])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Problem name is required'); return }
    if (!form.pattern) { toast.error('Select a pattern'); return }
    setLoading(true)
    try {
      const payload = { ...form, timeTaken: form.timeTaken ? parseInt(form.timeTaken) : null }
      if (isEdit) { await problemApi.update(id, payload); toast.success('Problem updated!') }
      else { await problemApi.create(payload); toast.success('Problem logged!') }
      navigate('/problems')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setLoading(false) }
  }

  if (fetching) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Loading...</div>

  const inputStyle = { marginTop: 0 }

  return (
    <div style={{ maxWidth: 720 }}>
      <PageTitle sub={isEdit ? 'Edit problem details' : 'Add a new problem to your log'}>
        {isEdit ? 'Edit problem' : 'Log a problem'}
      </PageTitle>

      <Card style={{ padding: 24 }}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Problem name *">
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Two Sum" />
            </Field>
            <Field label="LeetCode #">
              <input value={form.lcNumber} onChange={e => set('lcNumber', e.target.value)} placeholder="e.g. 1" />
            </Field>
            <Field label="Date">
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </Field>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <Field label="Pattern *">
              <select value={form.pattern} onChange={e => set('pattern', e.target.value)}>
                <option value="">Select</option>
                {PATTERNS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Difficulty">
              <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="new">New</option><option value="revision">Revision</option>
              </select>
            </Field>
            <Field label="Time (min)">
              <input type="number" value={form.timeTaken} onChange={e => set('timeTaken', e.target.value)} placeholder="e.g. 25" />
            </Field>
          </div>

          {/* Trigger */}
          <Field label="Trigger → approach">
            <textarea rows={3} value={form.triggerNote}
              onChange={e => set('triggerNote', e.target.value)}
              placeholder="e.g. Saw target sum → HashMap complement lookup. Recognized because unsorted array." />
          </Field>

          {/* Mistake */}
          <Field label="Mistake I made">
            <textarea rows={2} value={form.mistakeNote}
              onChange={e => set('mistakeNote', e.target.value)}
              placeholder="e.g. Tried brute force O(n²) first. Forgot to handle duplicate edge case." />
          </Field>

          {/* Solution code */}
          <Field label="Solution (Java)">
            <textarea rows={8} value={form.solutionCode}
              onChange={e => set('solutionCode', e.target.value)}
              placeholder="Paste your Java solution here for revision..."
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7 }} />
          </Field>

          {/* Revision */}
          <Field label="Revision flag">
            <select value={form.revisionStatus} onChange={e => set('revisionStatus', e.target.value)}>
              <option value="no">No — solid</option>
              <option value="yes">Revisit in 3 days</option>
              <option value="hard">Struggled — revisit in 1 day</option>
            </select>
          </Field>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Btn type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update problem' : 'Save problem'}
            </Btn>
            <Btn type="button" variant="secondary" onClick={() => navigate('/problems')}>Cancel</Btn>
          </div>
        </form>
      </Card>
    </div>
  )
}
