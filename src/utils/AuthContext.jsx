import { createContext, useContext, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'

// Create auth context
const AuthContext = createContext(null)

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('rtu_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Login function
  const login = (email, role) => {
    const userData = { email, role }
    setUser(userData)
    localStorage.setItem('rtu_user', JSON.stringify(userData))
  }

  // Logout function
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

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected Route component
export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  // Show loading while checking auth state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E0E7FF',
          borderTopColor: '#0033A0',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role - redirect to unauthorized
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  // Authorized - render children
  return children
}

// Unauthorized page component
export function Unauthorized() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      padding: '20px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <span style={{ fontSize: '40px', color: '#DC2626' }}>⚠</span>
      </div>
      <h1 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: '12px'
      }}>
        Access Denied
      </h1>
      <p style={{
        fontSize: '16px',
        color: '#6c757d',
        marginBottom: '24px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        You do not have permission to access this page. Please log in with the appropriate credentials.
      </p>
      <a
        href="/login"
        style={{
          padding: '12px 24px',
          backgroundColor: '#0033A0',
          color: '#FFFFFF',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600'
        }}
      >
        Go to Login
      </a>
    </div>
  )
}

