import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import SuccessPopup from '../components/SuccessPopup.jsx'

export default function MyAccount() {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', email: user.email || '' })
  }, [user])

  // Use same validations as Register page
  const validateName = (name) => {
    if (!name) return 'Name is required'
    if (name.length < 2) return 'Name must be at least 2 characters'
    if (name.length > 50) return 'Name must not exceed 50 characters'
    const nameRegex = /^(?! )(?!.* {2})[A-Za-z]+(?: [A-Za-z]+)*$/
    if (!nameRegex.test(name)) return 'Name can only contain letters, no leading or double spaces'
    return ''
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const validate = () => {
    const errs = {}
    const n = validateName(profile.name)
    const e = validateEmail(profile.email)
    if (n) errs.name = n
    if (e) errs.email = e
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleProfileSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/auth/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(profile)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error updating profile')
      setOk('Profile updated')
      setUser(data.user)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally { setLoading(false) }
  }

  if (!user) return <div style={{ padding: '2rem' }}>Please login to view account</div>

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '1rem' }}>
      <h2>My Account</h2>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Profile</h3>
          <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
            <label>Name</label>
            <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} onBlur={() => { setTouched(t => ({ ...t, name: true })); setErrors(prev => ({ ...prev, name: validateName(profile.name) })) }} />
            {touched.name && errors.name && <div style={{ color: 'var(--error)' }}>⚠️ {errors.name}</div>}

            <label>Email</label>
            <input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} onBlur={() => { setTouched(t => ({ ...t, email: true })); setErrors(prev => ({ ...prev, email: validateEmail(profile.email) })) }} />
            {touched.email && errors.email && <div style={{ color: 'var(--error)' }}>⚠️ {errors.email}</div>}

            {errors.submit && <div style={{ color: 'var(--error)', padding: '0.5rem' }}>❌ {errors.submit}</div>}

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.75rem', width: '180px' }}>Save Profile</button>
              <Link to="/change_password" className="btn-secondary" style={{ padding: '0.6rem 0.9rem', textDecoration: 'none' }}>Change Password</Link>
            </div>
          </form>
        </div>
      </div>

      {ok && <SuccessPopup message={ok} onClose={() => setOk('')} />}
    </div>
  )
}
