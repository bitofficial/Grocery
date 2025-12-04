import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SuccessPopup from '../components/SuccessPopup.jsx'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // const validateName = (name) => {
  //   if (!name) return 'Name is required'
  //   if (name.length < 2) return 'Name must be at least 2 characters'
  //   if (name.length > 50) return 'Name must not exceed 50 characters'
  //   if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces'
  //   return ''
  // }
const validateName = (name) => {
  if (!name) return 'Name is required'
  if (name.length < 2) return 'Name must be at least 2 characters'
  if (name.length > 50) return 'Name must not exceed 50 characters'
  const nameRegex = /^(?! )(?!.* {2})[A-Za-z]+(?: [A-Za-z]+)*$/;

  if (!nameRegex.test(name)) {
    return 'Name can only contain letters, with no leading or double spaces'
  }
  return ''
}
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const validatePassword = (password) => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (password.length > 13) return 'Password must not exceed 13 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
    return ''
  }

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password'
    if (confirmPassword !== password) return 'Passwords do not match'
    return ''
  }

  const validate = () => {
    const newErrors = {}
    
    const nameError = validateName(formData.name)
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)
    
    if (nameError) newErrors.name = nameError
    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    if (touched[field]) {
      validateField(field, value)
    }
  }

  const validateField = (field, value) => {
    let error = ''
    switch (field) {
      case 'name':
        error = validateName(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'password':
        error = validatePassword(value)
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value)
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }))
        }
        break
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password)
        break
      default:
        break
    }
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
    validateField(field, formData[field])
  }

  const onSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
      setOk(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{
      marginTop: "50px",
      backgroundImage: `url('https://t3.ftcdn.net/jpg/07/13/17/28/360_F_713172805_UU6uthdE0JF7et4ZUowOy4Zje6z5iF23.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      paddingTop: '40px'
    }}>
      <div className="form-container">
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Create Account 🎉</h2>
          <p className="muted">Join GroCart and shop fresh groceries instantly</p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
          {/* Name Field */}
          <div className="form-group">
  <label htmlFor="name">Full Name</label>
  <input
    id="name"
    type="text"
    value={formData.name}
    onChange={(e) => handleChange('name', e.target.value)}
    onBlur={() => handleBlur('name')}
    placeholder="John Doe"
    // pattern="^(?!.* {2})(?! )[A-Za-z]+(?: [A-Za-z]+)*$"
    // title="Only letters, no leading or double spaces allowed"
    style={{
      borderColor: touched.name && errors.name ? 'var(--error)' : 'var(--border)'
    }}
  />
  
  {touched.name && errors.name && (
    <div className="form-error">⚠️ {errors.name}</div>
  )}
  {!touched.name && (
    <div className="form-hint">💡 Letters and spaces only (no leading or double spaces)</div>
  )}
</div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="you@example.com"
              style={{
                borderColor: touched.email && errors.email ? 'var(--error)' : 'var(--border)'
              }}
            />
            {touched.email && errors.email && (
              <div className="form-error">⚠️ {errors.email}</div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
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
              <div className="form-error">⚠️ {errors.password}</div>
            )}
            <div className="form-hint">
              💡 8-13 chars, 1 uppercase, 1 lowercase, 1 number
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="••••••••"
              style={{
                borderColor: touched.confirmPassword && errors.confirmPassword ? 'var(--error)' : 'var(--border)'
              }}
            />
            {/* <button type="button" onClick={() => setShowConfirmPassword(s => !s)} style={{ position: 'absolute', right: '10px', top: '34px', background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Toggle confirm password visibility">
              {showConfirmPassword ? '🙈' : '👁️'}
            </button> */}
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="form-error">⚠️ {errors.confirmPassword}</div>
            )}
          </div>

          {/* Note: Role is assigned server-side. Admin account is managed separately. */}

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
            disabled={loading || Object.entries(errors).some(([key, e]) => key !== 'submit' && e) || !formData.name || !formData.email || !formData.password || !formData.confirmPassword}
            style={{
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: '600',
              width: '100%'
            }}
          >
            {loading ? '🔄 Creating account...' : '✓ Create Account'}
          </button>

          {/* Login Link */}
          <div style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.95rem'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: '600', color: 'var(--primary)' }}>
              Sign in
            </Link>
          </div>
        </form>
      </div>

      {ok && <SuccessPopup message="✓ Account created successfully! Redirecting to login..." onClose={() => setOk(false)} />}
    </div>
  )
}

