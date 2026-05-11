import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import LogProblem from './pages/LogProblem'
import Problems from './pages/Problems'
import Notes from './pages/Notes'
import Summary from './pages/Summary'
import Reminders from './pages/Reminders'
import Rules from './pages/Rules'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1a26',
              color: '#e8e8f0',
              border: '1px solid #2a2a3e',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#14532d' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#450a0a' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="log" element={<LogProblem />} />
            <Route path="log/:id" element={<LogProblem />} />
            <Route path="problems" element={<Problems />} />
            <Route path="notes" element={<Notes />} />
            <Route path="summary" element={<Summary />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="rules" element={<Rules />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
