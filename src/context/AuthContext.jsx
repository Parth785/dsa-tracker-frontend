import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dsa_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    const { token, email: userEmail, userId } = res.data
    localStorage.setItem('dsa_token', token)
    localStorage.setItem('dsa_user', JSON.stringify({ email: userEmail, userId }))
    setUser({ email: userEmail, userId })
    return res.data
  }

  const register = async (email, password) => {
    const res = await authApi.register({ email, password })
    const { token, email: userEmail, userId } = res.data
    localStorage.setItem('dsa_token', token)
    localStorage.setItem('dsa_user', JSON.stringify({ email: userEmail, userId }))
    setUser({ email: userEmail, userId })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('dsa_token')
    localStorage.removeItem('dsa_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
