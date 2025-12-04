import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom' // Added useLocation
import { useCart } from '../state/CartContext.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import SuccessPopup from '../components/SuccessPopup.jsx'

export default function Checkout() {
  const { items, clear, total } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() // Initialize location

  // --- NEW: RECALCULATE DISCOUNT LOGIC ---
  // We recalculate here to ensure consistency if page is refreshed
  let discountPercent = 0;
  if (total > 2000) {
    discountPercent = 8;
  } else if (total > 1000) {
    discountPercent = 5;
  }
  
  const discountAmount = (total * discountPercent) / 100;
  const priceAfterDiscount = total - discountAmount;
  const tax = (priceAfterDiscount * 0.05).toFixed(2);
  const finalTotal = (priceAfterDiscount * 1.05).toFixed(2);
  // ---------------------------------------

  const [address, setAddress] = useState('')
  const [payment, setPayment] = useState('cod')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [upi, setUpi] = useState('')
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orderInfo, setOrderInfo] = useState(null)

  const validateAddress = (addr) => {
  if (!addr) 
    return 'Delivery address is required'

  // ❌ Reject if starts with spaces
  if (/^\s+/.test(addr))
    return 'Address cannot start with spaces'

  // Remove surrounding spaces
  const trimmed = addr.trim()

  // ❌ Reject empty/only spaces
  if (!trimmed)
    return 'Delivery address is required'

  if (trimmed.length < 10)
    return 'Address must be at least 10 characters'

  if (trimmed.length > 200)
    return 'Address must not exceed 200 characters'

  // ❌ Reject if all numbers
  if (/^\d+$/.test(trimmed))
    return 'Address cannot be only numbers'

  // ❌ Reject if no letters at all
  if (!/[a-zA-Z]/.test(trimmed))
    return 'Address must contain letters'

  return ''
}


  // ... [Existing Validation Functions: validateCardNumber, validateCardName, etc. remain unchanged] ...
  const validateCardNumber = (number) => {
  const cleaned = number.replace(/\s/g, '');

  if (!cleaned) return 'Card number is required';

  // Only digits + must be 16 digits
  if (!/^\d{16}$/.test(cleaned)) 
    return 'Card number must be 16 digits';

  // Prevent all zeros
  if (/^0+$/.test(cleaned)) 
    return 'Card number cannot be all zeros';

  return '';
};

  const validateCardName = (name) => {
    if (!name) return 'Name on card is required'
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces'
    if (name.replace(/\s+/g, '').length < 4) return 'Name must be at least 4 letters'
    return ''
  }
  const validateExpiry = (expiry) => {
    if (!expiry) return 'Expiry date is required'
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Format should be MM/YY'
    const [month, year] = expiry.split('/')
    const m = parseInt(month, 10)
    const y = parseInt(year, 10)
    if (m < 1 || m > 12) return 'Invalid month'
    const now = new Date()
    const currentYear = Number(String(now.getFullYear()).slice(-2))
    const currentMonth = now.getMonth() + 1
    if (y < currentYear || (y === currentYear && m < currentMonth)) return 'Card is expired'
    return ''
  }
  const validateCVV = (cvv) => {
    if (!cvv) return 'CVV is required'
    if (!/^\d{3,4}$/.test(cvv)) return 'CVV must be 3-4 digits'
    if (/^0+$/.test(cvv)) {
  return 'CVV cannot be all zeros';
}

    const seqAsc = '0123456789'
    const seqDesc = seqAsc.split('').reverse().join('')
    for (let i = 0; i < seqAsc.length - 2; i++) {
      const asc = seqAsc.substr(i, cvv.length)
      const desc = seqDesc.substr(i, cvv.length)
      if (asc === cvv || desc === cvv) return 'CVV cannot be a consecutive sequence'
    }
    return ''
  }
  const validateUPI = (upiId) => {
    if (!upiId) return 'UPI ID is required'
    if (!/^[a-zA-Z0-9._-]+@upi$/.test(upiId)) return 'UPI must end with @upi (e.g., john@upi)'
    return ''
  }

  const validate = () => {
    const newErrors = {}
    const addressError = validateAddress(address)
    if (addressError) newErrors.address = addressError
    if (payment === 'card') {
      const cardNumberError = validateCardNumber(card.number)
      const cardNameError = validateCardName(card.name)
      const expiryError = validateExpiry(card.expiry)
      const cvvError = validateCVV(card.cvv)
      if (cardNumberError) newErrors.cardNumber = cardNumberError
      if (cardNameError) newErrors.cardName = cardNameError
      if (expiryError) newErrors.expiry = expiryError
      if (cvvError) newErrors.cvv = cvvError
    } else if (payment === 'upi') {
      const upiError = validateUPI(upi)
      if (upiError) newErrors.upi = upiError
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
    validateField(field)
  }

  const validateField = (field) => {
    let error = ''
    switch (field) {
      case 'address': error = validateAddress(address); break
      case 'cardNumber': error = validateCardNumber(card.number); break
      case 'cardName': error = validateCardName(card.name); break
      case 'expiry': error = validateExpiry(card.expiry); break
      case 'cvv': error = validateCVV(card.cvv); break
      case 'upi': error = validateUPI(upi); break
      default: break
    }
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleCardChange = (field, value) => {
    let formattedValue = value
    if (field === 'number') {
      formattedValue = value.replace(/\D/g, '').slice(0, 16)
    } else if (field === 'expiry') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2)
      }
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }
    const updatedCard = { ...card, [field]: formattedValue }
    setCard(updatedCard)
    if (touched[field]) {
      validateField(field)
    }
  }

  const placeOrder = async e => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: items.map(i => ({ product_id: i.id, qty: i.qty })),
          address,
          payment_method: payment,
          // You might want to send total_amount to backend if your API expects it
          // total_amount: finalTotal, 
          card: payment === 'card' ? { last4: card.number.slice(-4) } : undefined,
          vpa: payment === 'upi' ? upi : undefined
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Order failed')
      
      const orderId = 'ORD' + Date.now().toString().slice(-8)
      const estimatedTime = Math.floor(Math.random() * (30 - 15 + 1)) + 15
      const deliveryTime = new Date(Date.now() + estimatedTime * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      
      setOrderInfo({
        orderId,
        estimatedTime,
        deliveryTime,
        totalItems: items.length,
        amount: finalTotal // Uses the discounted total
      })
      
      setOk(true)
      clear()
      setTimeout(() => navigate('/products'), 10000)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (ok && orderInfo) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--success) 0%, #27ae60 100%)', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '3rem 2rem', maxWidth: '500px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'slideIn 0.5s ease-out' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'bounce 0.6s ease-in-out' }}>✅</div>
          <h2 style={{ fontSize: '2rem', color: 'var(--success)', marginBottom: '0.5rem' }}>Order Confirmed!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>Thank you {user?.name}! Your order is being prepared.</p>
          
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid var(--success)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '1rem' }}>📦 Order #{orderInfo.orderId}</div>
            
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--success)' }}>🚚 On the Way</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Est. Delivery</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>⏱️ {orderInfo.estimatedTime} min</div>
                </div>
                
                <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Arrival Time</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>🕐 {orderInfo.deliveryTime}</div>
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Amount</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>₹{orderInfo.amount}</div>
              </div>
            </div>

            <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', lineHeight: '1.6' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>📍 Delivery Address</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{address}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left' }}>
              <div>✓ {orderInfo.totalItems} items ordered</div>
              <div>✓ Payment: {payment === 'cod' ? 'COD' : payment === 'card' ? 'Card' : 'UPI'}</div>
              <div>✓ Fresh & quality verified</div>
              <div>✓ Live tracking enabled</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/products')}
            style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            Continue Shopping
          </button>

          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Redirecting to products in 10 seconds...
          </div>
        </div>
        <style>{`@keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '2rem 0' }}>
      <div className="container">
        <h2 style={{ marginBottom: '2rem' }}>✓ Checkout</h2>

        <div className="checkout-container">
          {/* Checkout Form */}
          <div className="checkout-form">
            <form onSubmit={placeOrder} style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Delivery Address */}
              <div className="form-section">
                <h3 className="form-section-title">📍 Delivery Address</h3>
                <textarea
                  placeholder="Enter your complete delivery address (Flat/House no., Building name, Road name, Area, City, Pin code)"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    if (touched.address) validateField('address')
                  }}
                  onBlur={() => handleBlur('address')}
                  style={{ minHeight: '120px', borderColor: touched.address && errors.address ? 'var(--error)' : 'var(--border)', resize: 'vertical' }}
                />
                {touched.address && errors.address && <div className="form-error">⚠️ {errors.address}</div>}
                {!touched.address && <div className="form-hint">💡 Include all details for faster delivery</div>}
              </div>

              {/* Payment Method */}
              <div className="form-section">
                <h3 className="form-section-title">💳 Payment Method</h3>
                <div className="payment-options">
                  {[
                    { value: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when you receive' },
                    { value: 'card', label: '💳 Debit/Credit Card', desc: 'Secure card payment' },
                    { value: 'upi', label: '📱 UPI', desc: 'Instant UPI payment' }
                  ].map(option => (
                    <label key={option.value} className={`payment-option ${payment === option.value ? 'active' : ''}`}>
                      <input type="radio" value={option.value} checked={payment === option.value} onChange={(e) => setPayment(e.target.value)} />
                      <div>
                        <div style={{ fontWeight: '500' }}>{option.label}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Card Payment Fields */}
              {payment === 'card' && (
                <div className="form-section">
                  <h3 className="form-section-title">Card Details</h3>
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text" placeholder="1234 5678 9012 3456" value={card.number}
                      onChange={(e) => handleCardChange('number', e.target.value)} onBlur={() => handleBlur('cardNumber')}
                      style={{ borderColor: touched.cardNumber && errors.cardNumber ? 'var(--error)' : 'var(--border)', fontFamily: 'monospace' }}
                    />
                    {touched.cardNumber && errors.cardNumber && <div className="form-error">⚠️ {errors.cardNumber}</div>}
                  </div>
                  <div className="form-group">
                    <label>Name on Card</label>
                    <input
                      type="text" placeholder="John Doe" value={card.name}
                      onChange={(e) => { setCard({ ...card, name: e.target.value }); if (touched.cardName) validateField('cardName') }}
                      onBlur={() => handleBlur('cardName')}
                      style={{ borderColor: touched.cardName && errors.cardName ? 'var(--error)' : 'var(--border)' }}
                    />
                    {touched.cardName && errors.cardName && <div className="form-error">⚠️ {errors.cardName}</div>}
                  </div>
                  <div className="card-inputs">
                    <div className="form-group">
                      <label>Expiry (MM/YY)</label>
                      <input
                        type="text" placeholder="12/25" value={card.expiry}
                        onChange={(e) => handleCardChange('expiry', e.target.value)} onBlur={() => handleBlur('expiry')}
                        style={{ borderColor: touched.expiry && errors.expiry ? 'var(--error)' : 'var(--border)', fontFamily: 'monospace' }}
                      />
                      {touched.expiry && errors.expiry && <div className="form-error">⚠️ {errors.expiry}</div>}
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text" placeholder="123" value={card.cvv}
                        onChange={(e) => handleCardChange('cvv', e.target.value)} onBlur={() => handleBlur('cvv')}
                        style={{ borderColor: touched.cvv && errors.cvv ? 'var(--error)' : 'var(--border)', fontFamily: 'monospace' }}
                      />
                      {touched.cvv && errors.cvv && <div className="form-error">⚠️ {errors.cvv}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment Field */}
              {payment === 'upi' && (
                <div className="form-section">
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text" placeholder="yourname@bankname" value={upi}
                      onChange={(e) => { setUpi(e.target.value); if (touched.upi) validateField('upi') }}
                      onBlur={() => handleBlur('upi')}
                      style={{ borderColor: touched.upi && errors.upi ? 'var(--error)' : 'var(--border)' }}
                    />
                    {touched.upi && errors.upi && <div className="form-error">⚠️ {errors.upi}</div>}
                    <div className="form-hint">💡 Format: yourname@bankname (e.g., john@upi)</div>
                  </div>
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div style={{ background: 'var(--error)', color: 'white', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                  ❌ {errors.submit}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ padding: '1rem', fontSize: '1rem', fontWeight: '600', width: '100%' }}
              >
                {loading ? '🔄 Processing...' : '✓ Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Order Summary</h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              {items.map(item => (
                <div key={item.id} style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>{item.product_name} × {item.qty}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>₹{item.product_price * item.qty}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Delivery</span>
              <span style={{ color: 'var(--success)' }}>FREE</span>
            </div>

            {/* --- NEW: DISCOUNT ROW --- */}
            {discountPercent > 0 && (
              <div className="summary-row" style={{ color: 'var(--success)', fontWeight: '500' }}>
                <span>Discount ({discountPercent}%)</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Tax (5%)</span>
              <span>₹{tax}</span>
            </div>
            
            <div className="summary-total">
              Total: ₹{finalTotal}
            </div>

            <div style={{ background: 'var(--success)', color: 'white', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '500' }}>
              ✓ Free delivery on all orders!
            </div>
          </div>
        </div>
      </div>

      {ok && <SuccessPopup message="✓ Order placed successfully!" onClose={() => setOk(false)} />}
    </div>
  )
}

