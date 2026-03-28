import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

/**
 * Login Page Component
 * Authentication page for RTU Client Satisfaction Survey System
 * Path: /login
 */
function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Mock credentials
  const mockCredentials = {
    'admin@rtu.edu.ph': { password: 'admin123', role: 'admin' },
    'staff@rtu.edu.ph': { password: 'staff123', role: 'staff' }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Reset errors
    setError('')
    setEmailError('')
    setPasswordError('')

    // Validation
    let hasError = false
    
    if (!email.trim()) {
      setEmailError('Email is required')
      hasError = true
    }
    
    if (!password.trim()) {
      setPasswordError('Password is required')
      hasError = true
    }

    if (hasError) return

    // Check credentials
    const credential = mockCredentials[email.toLowerCase()]
    
    if (!credential) {
      setError('Invalid email or password')
      return
    }

    if (credential.password !== password) {
      setError('Invalid email or password')
      return
    }

    // Check if role matches
    if (credential.role !== role) {
      setError('Invalid email or password')
      return
    }

    // Call login from auth context
    login(email, role)

    // Successful login - redirect based on role
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
    } else {
      navigate('/staff/dashboard', { replace: true })
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* RTU Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logoCircle}>
            <span style={styles.logoText}>RTU</span>
          </div>
        </div>

        {/* Title */}
        <h1 style={styles.title}>RTU Client Satisfaction Survey System</h1>
        <p style={styles.subtitle}>Administrator Login</p>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email Input */}
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                borderColor: emailError ? '#DC2626' : '#E0E7FF'
              }}
            />
            {emailError && <span style={styles.fieldError}>{emailError}</span>}
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: passwordError ? '#DC2626' : '#E0E7FF',
                  paddingRight: '40px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {passwordError && <span style={styles.fieldError}>{passwordError}</span>}
          </div>

          {/* Remember Me */}
          <div style={styles.rememberRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Role Selection */}
          <div style={styles.roleSection}>
            <p style={styles.roleLabel}>Select Role:</p>
            <div style={styles.rolePills}>
              <label style={styles.rolePill}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={(e) => setRole(e.target.value)}
                  style={styles.radioInput}
                />
                <span style={role === 'admin' ? styles.rolePillActive : styles.rolePillText}>
                  Admin
                </span>
              </label>
              <label style={styles.rolePill}>
                <input
                  type="radio"
                  name="role"
                  value="staff"
                  checked={role === 'staff'}
                  onChange={(e) => setRole(e.target.value)}
                  style={styles.radioInput}
                />
                <span style={role === 'staff' ? styles.rolePillActive : styles.rolePillText}>
                  Office Staff
                </span>
              </label>
            </div>
          </div>

          {/* Login Button */}
          <button type="submit" style={styles.loginButton}>
            Login
          </button>
        </form>

        {/* Bottom Note */}
        <p style={styles.bottomNote}>For authorized RTU personnel only.</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  },
  logoContainer: {
    marginBottom: '24px'
  },
  logoCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#0033A0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto'
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FFD700'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: '8px',
    lineHeight: '1.3'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '24px'
  },
  errorBox: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    color: '#DC2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    textAlign: 'left'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '2px solid #E0E7FF',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    color: '#1A1A2E',
    backgroundColor: '#F5F7FA'
  },
  passwordContainer: {
    position: 'relative'
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#0033A0',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  fieldError: {
    display: 'block',
    color: '#DC2626',
    fontSize: '12px',
    marginTop: '4px'
  },
  rememberRow: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6c757d',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#0033A0'
  },
  roleSection: {
    marginTop: '8px'
  },
  roleLabel: {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '12px',
    textAlign: 'left'
  },
  rolePills: {
    display: 'flex',
    gap: '12px'
  },
  rolePill: {
    flex: 1
  },
  radioInput: {
    display: 'none'
  },
  rolePillText: {
    display: 'block',
    padding: '10px 16px',
    borderRadius: '24px',
    border: '2px solid #E0E7FF',
    backgroundColor: '#F5F7FA',
    color: '#6c757d',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  rolePillActive: {
    display: 'block',
    padding: '10px 16px',
    borderRadius: '24px',
    border: '2px solid #FFD700',
    backgroundColor: '#0033A0',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  loginButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#0033A0',
    color: '#FFFFFF',
    border: '2px solid #0033A0',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.2s ease'
  },
  bottomNote: {
    fontSize: '12px',
    color: '#adb5bd',
    marginTop: '24px'
  }
}

export default Login

