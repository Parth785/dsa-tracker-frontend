import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8085',
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dsa_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dsa_token')
      localStorage.removeItem('dsa_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
}

// ── Problems ──────────────────────────────────────────────────────
export const problemApi = {
  getAll: () => api.get('/api/problems'),
  getOne: (id) => api.get(`/api/problems/${id}`),
  create: (data) => api.post('/api/problems', data),
  update: (id, data) => api.put(`/api/problems/${id}`, data),
  delete: (id) => api.delete(`/api/problems/${id}`),
  getPatterns: () => api.get('/api/problems/patterns'),
  getRevision: () => api.get('/api/problems/revision'),
}

// ── Streak ────────────────────────────────────────────────────────
export const streakApi = {
  getCalendar: () => api.get('/api/streak/calendar'),
  markDay: (data) => api.post('/api/streak/mark', data),
  getStats: () => api.get('/api/streak/stats'),
}

export default api
