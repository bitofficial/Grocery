import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../state/CartContext.jsx'

export default function Cart() {
  const { items, removeItem, clear, total, increment, decrement, updateQty } = useCart()
  const navigate = useNavigate()

  // 1. State to hold real-time stock limits
  const [stockLimits, setStockLimits] = useState({})
  const [loadingStock, setLoadingStock] = useState(true)

  // 2. Fetch latest stock data when Cart loads
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/products');
        const products = await res.json();
        
        // Create a lookup object: { 'product_id': qty }
        const limits = {};
        products.forEach(p => {
          limits[p.id] = p.qty;
        });
        setStockLimits(limits);
      } catch (err) {
        console.error("Error fetching stock limits:", err);
      } finally {
        setLoadingStock(false);
      }
    };

    fetchStock();
  }, []);

  // 3. Helper to detect if a specific item has an error
  const getStockError = (item) => {
    if (loadingStock) return null;
    const maxStock = stockLimits[item.id] || 0;

    if (item.qty > maxStock) {
      if (maxStock === 0) return "Out of Stock";
      return "Can't add more than present stock"; 
    }
    return null;
  };

  // 4. Global check: Disable checkout if ANY item has an error
  const hasStockIssues = items.some(item => {
    const maxStock = stockLimits[item.id] || 0;
    return !loadingStock && item.qty > maxStock;
  });

  // --- NEW: DISCOUNT LOGIC ---
  let discountPercent = 0;
  if (total > 2000) {
    // Base 1000 (5%) + Extra 1000 (3%) = 8%
    discountPercent = 8;
  } else if (total > 1000) {
    // Base 1000 = 5%
    discountPercent = 5;
  }

  const discountAmount = (total * discountPercent) / 100;
  const priceAfterDiscount = total - discountAmount;
  const taxAmount = priceAfterDiscount * 0.05;
  const finalTotal = priceAfterDiscount + taxAmount;
  // ---------------------------

  const handleCheckout = () => {
    // Pass the calculated discount state to the checkout page
    navigate('/checkout', { 
      state: { 
        discountPercent, 
        discountAmount, 
        finalTotal 
      } 
    });
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className="empty-state">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Your cart is empty</h2>
          <p className="muted" style={{ marginBottom: '2rem' }}>Time to add some fresh groceries!</p>
          <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '0.875rem 2rem', borderRadius: '8px' }}>
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '2rem 0' }}>
      <div className="container">
        <h2 style={{ marginBottom: '2rem' }}>🛍 Shopping Cart ({items.length})</h2>
        
        <div className="cart-container">
          {/* Cart Items */}
          <div className="cart-items">
            {items.map(item => {
              const errorMsg = getStockError(item);
              const maxStock = stockLimits[item.id] || 0;

              return (
                <div 
                  key={item.id} 
                  className="cart-item" 
                  style={{ 
                    border: errorMsg ? '1px solid #e53e3e' : undefined,
                    backgroundColor: errorMsg ? '#fff5f5' : undefined 
                  }}
                >
                  <img
                    src={item.image_url || 'https://via.placeholder.com/80?text=No+Image'}
                    alt={item.product_name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.product_name}</div>
                    <div className="cart-item-price">₹{item.product_price}</div>
                    
                    {errorMsg && (
                      <div style={{ color: '#e53e3e', fontSize: '0.85rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                        ⚠️ {errorMsg}
                      </div>
                    )}

                    <div className="qty-control">
                      <button onClick={() => decrement(item.id)}>−</button>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateQty(item.id, Number(e.target.value) || 1)}
                        min="1"
                        style={{ color: errorMsg ? '#e53e3e' : 'inherit' }}
                      />
                      <button 
                        onClick={() => increment(item.id)}
                        disabled={!loadingStock && item.qty >= maxStock}
                        style={{ 
                          opacity: (!loadingStock && item.qty >= maxStock) ? 0.5 : 1,
                          cursor: (!loadingStock && item.qty >= maxStock) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--primary)' }}>
                      ₹{(item.product_price * item.qty).toFixed(2)}
                    </div>
                    <button
                      className="btn-danger"
                      onClick={() => removeItem(item.id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            {/* --- NEW: DISCOUNT ROW --- */}
            {discountPercent > 0 && (
              <div className="summary-row" style={{ color: 'var(--success)', fontWeight: '500' }}>
                <span>Discount ({discountPercent}%)</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span className="success" style={{ color: 'var(--success)' }}>FREE</span>
            </div>
            
            <div className="summary-row">
              <span>Tax (5%)</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            
            <div className="summary-total">
              Total: ₹{finalTotal.toFixed(2)}
            </div>

            {/* Error Message in Summary */}
            {hasStockIssues && (
              <div style={{ 
                color: '#e53e3e', 
                backgroundColor: '#fff5f5', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                marginBottom: '1rem', 
                fontSize: '0.9rem',
                border: '1px solid #feb2b2',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                Can't add more than present stock
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleCheckout} 
              disabled={loadingStock || hasStockIssues}
              style={{ 
                width: '100%', 
                padding: '0.875rem', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                opacity: (loadingStock || hasStockIssues) ? 0.6 : 1,
                cursor: (loadingStock || hasStockIssues) ? 'not-allowed' : 'pointer',
                backgroundColor: hasStockIssues ? '#a0aec0' : undefined 
              }}
            >
              {hasStockIssues ? '⚠️ Stock Issue' : '✓ Proceed to Checkout'}
            </button>

            <button
              className="btn-ghost"
              onClick={clear}
              style={{ width: '100%', padding: '0.875rem' }}
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}