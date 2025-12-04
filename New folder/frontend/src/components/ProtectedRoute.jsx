import { Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/view-products" replace />
  return children
}

