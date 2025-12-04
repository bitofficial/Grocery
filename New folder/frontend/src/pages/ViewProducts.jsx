import { useEffect, useMemo, useState } from 'react'
import { useCart } from '../state/CartContext.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

const ALL_CATEGORIES = [
  { name: 'All', icon: '🛒', color: '#0a6e5d', rating: 4.8 },
  { name: 'Fruits', icon: '🍎', color: '#e74c3c', rating: 4.9 },
  { name: 'Vegetables', icon: '🥬', color: '#27ae60', rating: 4.7 },
  { name: 'Dairy', icon: '🥛', color: '#f39c12', rating: 4.6 },
  { name: 'Bakery', icon: '🍞', color: '#d4a574', rating: 4.8 },
  { name: 'Beverages', icon: '🥤', color: '#3498db', rating: 4.5 },
  { name: 'Snacks', icon: '🍿', color: '#e67e22', rating: 4.6 }
]

export default function ViewProducts() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const { addItem, items } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('http://localhost:4000/api/products', {
          credentials: 'include',
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Error fetching products')
        setProducts(data.sort((a,b)=>{return -1}))
      } catch (err) {
        setError(err.message)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    let result = products
    
    if (category !== 'All') {
      result = result.filter(p => (p.category || 'General') === category)
    }
    
    if (searchTerm) {
      result = result.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return result
  }, [products, category, searchTerm])

  const currentCategory = ALL_CATEGORIES.find(c => c.name === category)
  const categoryRating = currentCategory?.rating || 4.8

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)'}}>
      {/* Stunning Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #0a6e5d 0%, #0d9488 50%, #14b8a6 100%)',
        color: 'white',
        padding: '3rem 1rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'relative',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '100px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🛒 Fresh & Fast</div>
          <div style={{ fontSize: '1.3rem', marginBottom: '1.5rem', opacity: 0.95 }}>
            Premium groceries delivered in minutes • 100% Fresh Guarantee
          </div>
          
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <input
              type="text"
              placeholder="🔍 Search by name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '50px',
                border: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            />
            <button style={{
              padding: '1rem 2rem',
              background: '#ffb800',
              color: '#0a6e5d',
              border: 'none',
              borderRadius: '50px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'transform 0.3s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>🔎 Search</button>
          </div>
        </div>
      </div>

      {/* Category Chips with Icons and Ratings */}
      <div style={{ background: 'white', padding: '2rem 1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            alignItems: 'start'
          }}>
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                style={{
                  padding: '1rem',
                  border: category === cat.name ? `3px solid ${cat.color}` : '2px solid var(--border)',
                  background: category === cat.name ? `${cat.color}15` : 'white',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  transform: category === cat.name ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: category === cat.name ? `0 4px 12px ${cat.color}30` : 'none'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: cat.color, marginBottom: '0.25rem' }}>{cat.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⭐ {cat.rating}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Rating & Info Bar */}
      <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.1rem' }}>⭐ {category} Category - {categoryRating} Rating</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>✓ Verified & Fresh • 🚚 Quick Delivery • 💯 Quality Guaranteed</p>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '600' }}>📦 {filtered.length} Products Available</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="container">
          <div style={{
            background: 'var(--error)',
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            marginTop: '1rem'
          }}>
            ❌ {error}
          </div>
        </div>
      )}

      {/* Products Grid or Empty State */}
      <div className="container" style={{ flex: 1, paddingTop: '2rem', paddingBottom: '2rem' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏪</div>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No products found</p>
            <small className="muted">Try searching for different products or adjust your filters</small>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {filtered.map(p => {
                const inCart = items.find(item => item.id === p.id)
                return (
                  <div key={p.id} className="product-card" style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    transform: 'translateY(0)',
                    ':hover': { transform: 'translateY(-8px)', boxShadow: 'var(--shadow-lg)' }
                  }}>
                    <div style={{ position: 'relative', overflow: 'hidden', height: '200px', background: 'var(--bg-secondary)' }}>
                      <img
                        src={p.image_url || 'https://via.placeholder.com/220?text=No+Image'}
                        alt={p.product_name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s'
                        }}
                      />
                      {p.qty === 0 && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: '700'
                        }}>OUT OF STOCK</div>
                      )}
                      {p.qty > 0 && p.qty <= 5 && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: '#e74c3c',
                          color: 'white',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>🔥 Limited</div>
                      )}
                    </div>
                    
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '600', marginBottom: '0.25rem' }}>
                        {p.category || 'General'}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem', minHeight: '2.2rem' }}>
                        {p.product_name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', minHeight: '2.2rem' }}>
                        {p.product_description}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary)' }}>₹{p.product_price}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {p.qty > 0 ? `📦 ${p.qty} left` : '❌ Out'}
                        </div>
                      </div>
                      
                      {user?.role === 'admin' ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '0.5rem', fontWeight: 600 }}>Admin view</div>
                      ) : user ? (
                        <button
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: inCart ? 'var(--success)' : 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: p.qty === 0 ? 'not-allowed' : 'pointer',
                          opacity: p.qty === 0 ? 0.5 : 1,
                          transition: 'all 0.3s'
                        }}
                        onClick={() => addItem(p, 1)}
                        disabled={p.qty === 0}
                      >
                        {inCart ? '✓ In Cart' : '+ Add to Cart'}
                      </button>
                      ) : (
                        <button
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onClick={() => navigate('/login')}
                      >
                        🔑 Login to Buy
                      </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
