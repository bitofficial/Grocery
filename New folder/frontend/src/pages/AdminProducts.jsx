import { useEffect, useMemo, useState } from 'react'
import SuccessPopup from '../components/SuccessPopup.jsx'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])

  const [form, setForm] = useState({ product_name: '', product_description: '', product_price: '', qty: '', image_url: '', category: 'General' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ product_name: '', product_description: '', product_price: '', qty: '', image_url: '' })

  const load = async () => {
    setError('')
    const res = await fetch('http://localhost:4000/api/products', { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) { setError(data.message || 'Error fetching products'); return }
    setProducts(data.sort((a,b)=>{return -1}))
  }

  const loadAdminData = async () => {
    try {
      const ures = await fetch('http://localhost:4000/api/admin/users', { credentials: 'include' })
      const udata = await ures.json()
      if (ures.ok) setCustomers(udata)
      const ores = await fetch('http://localhost:4000/api/admin/orders', { credentials: 'include' })
      const odata = await ores.json()
      if (ores.ok) setOrders(odata.sort((a,b)=>{return -1}))
    } catch (e) {
      // ignore for now
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { loadAdminData() }, [])

  const validate = body => {
    if (!body.product_name?.trim() || !body.product_description?.trim()) return 'Product name and description cannot be empty'
    if (!/^[A-Za-z\s]+$/.test(body.product_name)) return 'Product name can only contain letters and spaces'
    const price = Number(body.product_price)
    if (!Number.isFinite(price) || price < 1) return 'Price must be 1 or greater'
    if (price > 10000) return 'Price cannot exceed 10000'
    const qty = Number(body.qty)
    if (!Number.isFinite(qty) || qty < 1) return 'Stock quantity must be 1 or greater'
    return ''
  }

  const create = async e => {
    e.preventDefault()
    const v = validate(form)
    if (v) { setError(v); return }
    const res = await fetch('http://localhost:4000/api/admin/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) { setError(data.message || 'Error creating'); return }
    setOk('Product created')
    setForm({ product_name: '', product_description: '', product_price: '', qty: '', image_url: '' })
    await load()
  }

  const startEdit = p => {
    setEditingId(p.id)
    setEditForm({
      product_name: p.product_name,
      product_description: p.product_description,
      product_price: p.product_price,
      qty: p.qty,
      image_url: p.image_url,
      category: p.category || 'General',
    })
  }

  const update = async id => {
    const v = validate(editForm)
    if (v) { setError(v); return }
    const res = await fetch(`http://localhost:4000/api/admin/products/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(editForm)
    })
    const data = await res.json()
    if (!res.ok) { setError(data.message || 'Error updating'); return }
    setOk('Product updated')
    setEditingId(null)
    await load()
  }

  const del = async id => {
    const res = await fetch(`http://localhost:4000/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' })
    const data = await res.json()
    if (!res.ok) { setError(data.message || 'Error deleting'); return }
    setOk('Product deleted')
    await load()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '80px auto', width: '100%', background: 'var(--bg-secondary)' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>📦 Manage Products</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Add, edit, or remove products from inventory</p>
      {/* Admin Dashboard quick stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', minWidth: '160px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Products</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700' }}>{products.length}</div>
        </div>
        <div style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', minWidth: '160px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customers</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700' }}>{customers.length}</div>
        </div>
        <div style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', minWidth: '160px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Orders</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700' }}>{orders.length}</div>
        </div>
      </div>
      
      {error && <div style={{ background: 'var(--error)', color: 'white', padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', fontWeight: '500' }}>❌ {error}</div>}
      
      <form onSubmit={create} style={{ display: 'grid', gap: '1rem', maxWidth: '600px', marginBottom: '3rem', background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>➕ Add New Product</h3>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Product Name</label>
          <input placeholder="e.g., Fresh Apples" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Description</label>
          <input placeholder="e.g., Organic red apples from Himachal" value={form.product_description} onChange={e => setForm({ ...form, product_description: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem' }} />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Price (₹)</label>
            <input placeholder="0.00" type="number" min="1" step="0.01" value={form.product_price} onChange={e => setForm({ ...form, product_price: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Stock (Qty)</label>
            <input placeholder="0" type="number" min="1" max="5000" step="1" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem' }} />
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Image URL</label>
          <input placeholder="https://..." value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Category</label>
          <select className="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem', background: 'white', cursor: 'pointer' }}>
            <option>General</option>
            <option>Fruits</option>
            <option>Vegetables</option>
            <option>Dairy</option>
            <option>Bakery</option>
            <option>Beverages</option>
            <option>Snacks</option>
          </select>
        </div>
        
        <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '0.875rem 1.5rem', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' }}>➕ Add Product</button>
      </form>

      <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>📋 Products Inventory</h3>
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'white' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Product ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Product Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Details</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'white' : 'var(--bg-secondary)' }}>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: 'var(--secondary)', color: 'var(--text-primary)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>#{p.product_id}</span>
                </td>
                <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>{p.product_name}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div>📦 Stock: <strong>{p.qty}</strong></div>
                  <div>💰 Price: <strong>₹{p.product_price}</strong></div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{p.product_description}</div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  {editingId === p.id ? (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <input value={editForm.product_name} onChange={e => setEditForm({ ...editForm, product_name: e.target.value })} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }} />
                      <input value={editForm.product_description} onChange={e => setEditForm({ ...editForm, product_description: e.target.value })} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }} />
                      <input type="number" min="1" step="0.01" value={editForm.product_price} onChange={e => setEditForm({ ...editForm, product_price: e.target.value })} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }} />
                      <input type="number" min="1" step="1" value={editForm.qty} onChange={e => setEditForm({ ...editForm, qty: e.target.value })} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }} />
                      <input value={editForm.image_url} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }} />
                      <select className="select" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem', background: 'white', cursor: 'pointer' }}>
                        <option>General</option>
                        <option>Fruits</option>
                        <option>Vegetables</option>
                        <option>Dairy</option>
                        <option>Bakery</option>
                        <option>Beverages</option>
                        <option>Snacks</option>
                      </select>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => update(p.id)} style={{ flex: 1, background: 'var(--success)', color: 'white', padding: '0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' }}>✓ Save</button>
                        <button onClick={() => setEditingId(null)} style={{ flex: 1, background: 'var(--text-muted)', color: 'white', padding: '0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' }}>✕ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button onClick={() => startEdit(p)} style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' }}>✏️ Edit</button>
                      <button onClick={() => del(p.id)} style={{ background: 'var(--error)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' }}>🗑️ Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Customers & Orders */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ marginTop: 0 }}>👥 Customers</h4>
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {customers.map(c => (
              <div key={c.id} style={{ borderBottom: '1px solid var(--border)', padding: '0.5rem 0' }}>
                <div style={{ fontWeight: 600 }}>{c.name} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({c.email})</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role: {c.role}</div>
              </div>
            ))}
            {customers.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No customers yet.</div>}
          </div>
        </div>

        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ marginTop: 0 }}>🧾 Recent Orders</h4>
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {orders.map(o => (
              <div key={o.id} style={{ borderBottom: '1px solid var(--border)', padding: '0.5rem 0' }}>
                <div style={{ fontWeight: 700 }}>Order #{o.id} • ₹{o.total}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>By: {o.user_id} • {new Date(o.created_at).toLocaleString()}</div>
              </div>
            ))}
            {orders.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No orders yet.</div>}
          </div>
        </div>
      </div>
      {ok && <SuccessPopup message={ok} onClose={() => setOk('')} />}
    </div>
  )
}
