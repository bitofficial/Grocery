import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import SuccessPopup from '../components/SuccessPopup.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [showPassword, setShowPassword] = useState(false)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const validatePassword = (password) => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    return ''
  }

  const validate = () => {
    const newErrors = {}
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    
    setLoading(true)
    try {
      const data = await login(email, password)
      setOk(true)
      setTimeout(() => {
        if (data.role === 'admin') navigate('/admin/products')
        else navigate('/products')
      }, 1500)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
    if (field === 'email') {
      const error = validateEmail(email)
      setErrors({ ...errors, email: error })
    } else if (field === 'password') {
      const error = validatePassword(password)
      setErrors({ ...errors, password: error })
    }
  }

  const handleChange = (field, value) => {
    if (field === 'email') {
      setEmail(value)
      if (touched.email) {
        const error = validateEmail(value)
        setErrors({ ...errors, email: error })
      }
    } else if (field === 'password') {
      setPassword(value)
      if (touched.password) {
        const error = validatePassword(value)
        setErrors({ ...errors, password: error })
      }
    }
  }

  return (
    <div className="auth-page" style={{
      backgroundImage: `url('https://t3.ftcdn.net/jpg/07/13/17/28/360_F_713172805_UU6uthdE0JF7et4ZUowOy4Zje6z5iF23.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      paddingTop: '60px'
    }}>
      <div className="form-container">
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back! 👋</h2>
          <p className="muted">Sign in to shop your favorite groceries</p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="you@example.com"
              style={{
                borderColor: touched.email && errors.email ? 'var(--error)' : 'var(--border)'
              }}
            />
            {touched.email && errors.email && (
              <div className="form-error">
                ⚠️ {errors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              style={{
                borderColor: touched.password && errors.password ? 'var(--error)' : 'var(--border)'
              }}
            />
            {/* <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: '10px', top: '34px', background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Toggle password visibility">
              {showPassword ? '🙈' : '👁️'}
            </button> */}
            {touched.password && errors.password && (
              <div className="form-error">
                ⚠️ {errors.password}
              </div>
            )}
            <div className="form-hint">
              💡 Password must be at least 8 characters
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{
              background: 'var(--error)',
              color: 'white',
              padding: '0.875rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ❌ {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !email || !password}
            style={{
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: '600',
              width: '100%'
            }}
          >
            {loading ? '🔄 Signing in...' : '✓ Sign In'}
          </button>

          {/* Register Link */}
          <div style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.95rem'
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: '600', color: 'var(--primary)' }}>
              Create account
            </Link>
          </div>
        </form>
      </div>

      {ok && <SuccessPopup message="✓ Logged in successfully!" onClose={() => setOk(false)} />}
    </div>
  )
}

