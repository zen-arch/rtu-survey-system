import { createContext, useContext, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('rtu_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (email, role, office = null) => {
    const userData = { email, role, office }
    setUser(userData)
    localStorage.setItem('rtu_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('rtu_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: '#FFFFFF'
      }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid #E0E7FF',
          borderTopColor: '#0033A0', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/unauthorized" replace />
  return children
}

export function Unauthorized() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#FFFFFF', padding: '20px'
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        backgroundColor: 'rgba(220, 38, 38, 0.1)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
      }}>
        <span style={{ fontSize: '40px', color: '#DC2626' }}>⚠</span>
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1A2E', marginBottom: '12px' }}>
        Access Denied
      </h1>
      <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '24px', textAlign: 'center', maxWidth: '400px' }}>
        You do not have permission to access this page.
      </p>
      <a href="/login" style={{
        padding: '12px 24px', backgroundColor: '#0033A0', color: '#FFFFFF',
        borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
      }}>
        Go to Login
      </a>
    </div>
  )
}