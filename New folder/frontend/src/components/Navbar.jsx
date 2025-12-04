import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { useCart } from '../state/CartContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      <nav className="nav" style={{ position: "fixed", width: "100vw", top: 0, left: 0, zIndex: 1000 }}>
        <div className="container nav-inner">
          {/* BRAND LOGO */}
          <Link to={'/home'} className="brand">
            🛒 GroCart
          </Link>

          {/* CENTER LINKS */}
          {user && (
            <div style={{ display: 'flex', gap: '20px', marginLeft: '20px' }}>
              
              {/* Customer Links */}
              {user.role === 'customer' && (
                <>
                  <Link to="/products" style={{ fontWeight: 500 }}>
                    Shop
                  </Link>
                  <Link to="/orders" style={{ fontWeight: 500 }}>
                    Order History
                  </Link>
                </>
              )}

              {/* Admin Links */}
              {user.role === 'admin' && (
                <Link to="/admin/products" style={{ fontWeight: 500 }}>
                  Manage Products
                </Link>
              )}

              {/* Common Links */}
              {user.role === 'customer' ? (
                <Link to="/my_account" style={{ fontWeight: 500 }}>
                  My Account
                </Link>
              ) : (
                <Link to="/change_password" style={{ fontWeight: 500 }}>
                  Settings
                </Link>
              )}
            </div>
          )}

          <div className="spacer" />

          {/* RIGHT SIDE: CART & PROFILE */}
          {user ? (
            <>
              {user.role === 'customer' && (
                <Link to="/cart" style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.2rem', marginRight: '15px' }}>
                  🛍 Cart
                  {items.length > 0 && (
                    <span style={{
                      backgroundColor: 'var(--secondary)',
                      color: 'var(--text-primary)',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}>
                      {items.length}
                    </span>
                  )}
                </Link>
              )}
              
              <span className="muted" style={{ marginRight: '10px' }}>👤 {user.name}</span>
              
              <button
                className="btn-primary"
                onClick={handleLogout}
                style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            // NOT LOGGED IN
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          )}
        </div>
      </nav>
      
      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div style={{ height: "80px" }}></div>
    </>
  )
}