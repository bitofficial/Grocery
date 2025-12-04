import { useEffect, useState } from 'react'
import SuccessPopup from '../components/SuccessPopup.jsx'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [sortOrder, setSortOrder] = useState('latest')
  const [filterStatus, setFilterStatus] = useState('all')

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
      if (ures.ok) setCustomers(udata.filter(u => u.role !== 'admin'))
      const ores = await fetch('http://localhost:4000/api/admin/orders', { credentials: 'include' })
      const odata = await ores.json()
      if (ores.ok) setOrders(odata)
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => { load(); loadAdminData() }, [])

  // derived list applying sort & filter
  const getDisplayedOrders = () => {
    let list = [...orders]
    if (filterStatus && filterStatus !== 'all') list = list.filter(o => (o.status || '').toLowerCase() === filterStatus.toLowerCase())
    switch (sortOrder) {
      case 'latest': list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)); break
      case 'oldest': list.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)); break
      case 'amount_desc': list.sort((a,b) => b.total - a.total); break
      case 'amount_asc': list.sort((a,b) => a.total - b.total); break
      default: break
    }
    return list
  }

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/orders/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error updating status')
      setOk('Order status updated')
      // reload list
      await loadAdminData()
    } catch (e) {
      setError(e.message)
    }
  }

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
    setForm({ product_name: '', product_description: '', product_price: '', qty: '', image_url: '', category: 'General' })
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

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'add-product', label: '➕ Add Product', icon: '➕' },
    { id: 'inventory', label: '📦 Inventory', icon: '📦' },
    { id: 'customers', label: '👥 Customers', icon: '👥' },
    { id: 'orders', label: '🧾 Orders', icon: '🧾' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', paddingTop: '60px' }}>
      {/* Sidebar */}
      <div style={{
        width: '220px',
        background: 'white',
        borderRight: '1px solid var(--border)',
        padding: '1.5rem 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        top: '60px'
      }}>
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>⚙️ Admin Panel</h3>
        </div>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary)15' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text)',
              borderLeft: activeTab === tab.id ? '4px solid var(--primary)' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '220px', flex: 1, padding: '2rem' }}>
        {error && <div style={{ background: 'var(--error)', color: 'white', padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px' }}>❌ {error}</div>}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>📊 Dashboard</h2>
            
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Products</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{products.length}</div>
              </div>
              
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Customers</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{customers.length}</div>
              </div>
              
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧾</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Orders</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{orders.length}</div>
              </div>
              
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💰</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Revenue</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>₹{orders.reduce((s, o) => s + o.total, 0).toFixed(0)}</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ marginTop: 0 }}>🛒 Recent Orders</h3>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {orders.slice(-5).reverse().map(o => (
                    <div key={o.id} style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 0', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 600 }}>Order #{o.id}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>₹{o.total} • {new Date(o.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                  {orders.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No orders yet</div>}
                </div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ marginTop: 0 }}>👤 New Customers</h3>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {customers.slice(-5).reverse().map(c => (
                    <div key={c.id} style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 0', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.email}</div>
                    </div>
                  ))}
                  {customers.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No customers yet</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Tab */}
        {activeTab === 'add-product' && (
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>➕ Add New Product</h2>
            <form onSubmit={create} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', maxWidth: '600px' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Product Name</label>
                <input placeholder="e.g., Fresh Apples" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem' }} />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
                <input placeholder="e.g., Organic red apples from Himachal" value={form.product_description} onChange={e => setForm({ ...form, product_description: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Price (₹)</label>
                  <input placeholder="0.00" type="number" min="1" step="0.01" value={form.product_price} onChange={e => setForm({ ...form, product_price: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Stock (Qty)</label>
                  <input placeholder="0" type="number" min="1" max="5000" step="1" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem' }} />
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Image URL</label>
                <input placeholder="https://..." value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem' }} />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.95rem', background: 'white', cursor: 'pointer' }}>
                  <option>General</option>
                  <option>Fruits</option>
                  <option>Vegetables</option>
                  <option>Dairy</option>
                  <option>Bakery</option>
                  <option>Beverages</option>
                  <option>Snacks</option>
                </select>
              </div>
              
              <button type="submit" style={{ width: '100%', background: 'var(--primary)', color: 'white', padding: '0.875rem', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}>➕ Add Product</button>
            </form>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>📦 Inventory</h2>
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-md)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Price</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Stock</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Category</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'white' : 'var(--bg-secondary)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600' }}>{p.product_name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.product_description}</div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>₹{p.product_price}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: p.qty > 5 ? 'var(--primary)15' : 'var(--error)15', color: p.qty > 5 ? 'var(--primary)' : 'var(--error)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: '600' }}>
                          {p.qty} items
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: 'var(--secondary)', color: 'var(--text-primary)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                          {p.category || 'General'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {editingId === p.id ? (
                          <div style={{ display: 'grid', gap: '0.5rem', minWidth: '300px' }}>
                            <input value={editForm.product_name} onChange={e => setEditForm({ ...editForm, product_name: e.target.value })} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }} />
                            <input value={editForm.product_description} onChange={e => setEditForm({ ...editForm, product_description: e.target.value })} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }} />
                            <input type="number" min="1" step="0.01" value={editForm.product_price} onChange={e => setEditForm({ ...editForm, product_price: e.target.value })} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }} />
                            <input type="number" min="1" step="1" value={editForm.qty} onChange={e => setEditForm({ ...editForm, qty: e.target.value })} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }} />
                            <input value={editForm.image_url} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }} />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => update(p.id)} style={{ flex: 1, background: 'var(--success)', color: 'white', padding: '0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>✓ Save</button>
                              <button onClick={() => setEditingId(null)} style={{ flex: 1, background: 'var(--text-muted)', color: 'white', padding: '0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>✕ Cancel</button>
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
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>👥 Customers</h2>
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary)', color: 'white' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, idx) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'white' : 'var(--bg-secondary)' }}>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{c.name}</td>
                        <td style={{ padding: '1rem' }}>{c.email}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ background: 'var(--success)15', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem' }}>Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {customers.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customers yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>🧾 Orders</h2>
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'center' }}>
                <div>
                  <label style={{ fontWeight: 600, marginRight: '0.5rem' }}>Sort</label>
                  <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px' }}>
                    <option value="latest">Latest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="amount_desc">Amount (high → low)</option>
                    <option value="amount_asc">Amount (low → high)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, marginRight: '0.5rem' }}>Filter</label>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px' }}>
                    <option value="all">All</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary)', color: 'white' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Items</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDisplayedOrders().map((o, idx) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'white' : 'var(--bg-secondary)' }}>
                        <td style={{ padding: '1rem', fontWeight: '700' }}>#{o.id}</td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary)' }}>₹{Number(o.total).toFixed(2)}</td>
                        <td style={{ padding: '1rem' }}>{o.items.length} items</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <select value={o.status || 'paid'} onChange={e => updateOrderStatus(o.id, e.target.value)} style={{ padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {ok && <SuccessPopup message={ok} onClose={() => setOk('')} />}
    </div>
  )
}
