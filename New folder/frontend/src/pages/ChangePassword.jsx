import { useState } from 'react'
import { useAuth } from '../state/AuthContext.jsx'
import SuccessPopup from '../components/SuccessPopup.jsx'

export default function ChangePassword() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateOldPassword = (pwd) => {
    if (!pwd) return 'Current password is required'
    if (pwd.length < 8) return 'Password must be at least 8 characters'
    return ''
  }

  const validateNewPassword = (pwd) => {
    if (!pwd) return 'New password is required'
    if (pwd.length < 8) return 'Password must be at least 8 characters'
    if (pwd.length > 13) return 'Password must not exceed 13 characters'
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number'
    return ''
  }

  const validateConfirmPassword = (confirm, newPwd) => {
    if (!confirm) return 'Please confirm your new password'
    if (confirm !== newPwd) return 'Passwords do not match'
    return ''
  }

  const validate = () => {
    const newErrors = {}
    
    const oldError = validateOldPassword(formData.old_password)
    const newError = validateNewPassword(formData.new_password)
    const confirmError = validateConfirmPassword(formData.confirm_password, formData.new_password)
    
    if (oldError) newErrors.old_password = oldError
    if (newError) newErrors.new_password = newError
    if (confirmError) newErrors.confirm_password = confirmError
    
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
      case 'old_password':
        error = validateOldPassword(value)
        break
      case 'new_password':
        error = validateNewPassword(value)
        if (formData.confirm_password) {
          const confirmError = validateConfirmPassword(formData.confirm_password, value)
          setErrors(prev => ({ ...prev, confirm_password: confirmError }))
        }
        break
      case 'confirm_password':
        error = validateConfirmPassword(value, formData.new_password)
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
      const res = await fetch('http://localhost:4000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error changing password')
      setOk(true)
      setFormData({ old_password: '', new_password: '', confirm_password: '' })
      setTouched({})
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="form-container">
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Change Password 🔐</h2>
          <p className="muted">Update your password to keep your account secure</p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
          {/* Current Password */}
          <div className="form-group">
            <label htmlFor="old_password">Current Password</label>
            <input
              id="old_password"
              type="password"
              value={formData.old_password}
              onChange={(e) => handleChange('old_password', e.target.value)}
              onBlur={() => handleBlur('old_password')}
              placeholder="••••••••"
              style={{
                borderColor: touched.old_password && errors.old_password ? 'var(--error)' : 'var(--border)'
              }}
            />
            {touched.old_password && errors.old_password && (
              <div className="form-error">⚠️ {errors.old_password}</div>
            )}
          </div>

          {/* New Password */}
          <div className="form-group">
            <label htmlFor="new_password">New Password</label>
            <input
              id="new_password"
              type="password"
              value={formData.new_password}
              onChange={(e) => handleChange('new_password', e.target.value)}
              onBlur={() => handleBlur('new_password')}
              placeholder="••••••••"
              style={{
                borderColor: touched.new_password && errors.new_password ? 'var(--error)' : 'var(--border)'
              }}
            />
            {touched.new_password && errors.new_password && (
              <div className="form-error">⚠️ {errors.new_password}</div>
            )}
            <div className="form-hint">
              💡 8-13 chars, 1 uppercase, 1 lowercase, 1 number
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirm_password">Confirm New Password</label>
            <input
              id="confirm_password"
              type="password"
              value={formData.confirm_password}
              onChange={(e) => handleChange('confirm_password', e.target.value)}
              onBlur={() => handleBlur('confirm_password')}
              placeholder="••••••••"
              style={{
                borderColor: touched.confirm_password && errors.confirm_password ? 'var(--error)' : 'var(--border)'
              }}
            />
            {touched.confirm_password && errors.confirm_password && (
              <div className="form-error">⚠️ {errors.confirm_password}</div>
            )}
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
            disabled={loading || Object.entries(errors).some(([key, e]) => key !== 'submit' && e) || !formData.old_password || !formData.new_password || !formData.confirm_password}
            style={{
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: '600',
              width: '100%'
            }}
          >
            {loading ? '🔄 Updating...' : '✓ Update Password'}
          </button>
        </form>
      </div>

      {ok && <SuccessPopup message="✓ Password changed successfully!" onClose={() => setOk(false)} />}
    </div>
  )
}