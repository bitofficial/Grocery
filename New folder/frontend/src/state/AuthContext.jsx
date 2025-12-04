import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('http://localhost:4000/api/auth/session', {
          credentials: 'include',
        })
        const data = await res.json()
        if (data.authenticated) setUser(data.user)
      } catch (_) {}
      setLoading(false)
    })()
  }, [])

  const login = async (email, password) => {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')
    setUser({ ...data.user, role: data.role })
    return data
  }

  const logout = async () => {
    await fetch('http://localhost:4000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

