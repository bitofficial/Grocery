import React, { useEffect, useState } from 'react';
import { useAuth } from '../state/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/orders', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  // --- HELPER FOR STATUS COLORS ---
  const getStatusStyle = (status) => {
    const base = styles.statusBadge;
    if (status === 'paid') return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
    if (status === 'pending') return { ...base, backgroundColor: '#fffbeb', color: '#92400e' };
    return { ...base, backgroundColor: '#edf2f7', color: '#4a5568' }; // Default gray
  };

  if (loading) return <div style={styles.container}>Loading history...</div>;
  if (error) return <div style={{ ...styles.container, ...styles.errorMsg }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Order History</h2>

      {orders.length === 0 ? (
        <div style={styles.noOrders}>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Paid</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={styles.row}>
                  {/* ID */}
                  <td style={styles.td}>
                    <span style={styles.orderId}>#{order.id}</span>
                  </td>

                  {/* Date */}
                  <td style={styles.td}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>

                  {/* Items */}
                  <td style={styles.td}>
                    <ul style={styles.itemList}>
                      {order.items.map((item, idx) => (
                        <li key={idx} style={styles.itemLi}>
                          <span style={styles.itemQty}>{item.qty}x</span>
                          {item.product_name}
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Total */}
                  <td style={styles.td}>
                    <span style={styles.total}>₹{order.total.toFixed(2)}</span>
                  </td>

                  {/* Paid (after discount + tax) */}
                  <td style={styles.td}>
                    {(() => {
                      // Prefer server-stored paid_amount when available
                      if (order.paid_amount != null) {
                        const paid = Number(order.paid_amount).toFixed(2);
                        const discounted = Number(order.paid_amount) < Number(order.total);
                        return (
                          <div>
                            <div style={styles.paid}>₹{paid}</div>
                            {discounted && <div style={styles.paidNote}>(discount applied)</div>}
                          </div>
                        );
                      }

                      // Fallback: compute using same rules as checkout
                      const total = Number(order.total) || 0;
                      let discountPercent = 0;
                      if (total > 2000) discountPercent = 8;
                      else if (total > 1000) discountPercent = 5;
                      const discountAmount = (total * discountPercent) / 100;
                      const priceAfterDiscount = total - discountAmount;
                      const tax = priceAfterDiscount * 0.05;
                      const finalTotal = (priceAfterDiscount + tax).toFixed(2);

                      return (
                        <div>
                          <div style={styles.paid}>₹{Number(finalTotal).toFixed(2)}</div>
                          {discountPercent > 0 && (
                            <div style={styles.paidNote}>({discountPercent}% off applied)</div>
                          )}
                        </div>
                      )
                    })()}
                  </td>

                  {/* Status */}
                  <td style={styles.td}>
                    <span style={getStatusStyle(order.status)}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- INLINE STYLES OBJECT ---
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '2rem auto',
    padding: '0 1.5rem',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    color: '#333',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    color: '#2c3e50',
    borderBottom: '2px solid #eee',
    paddingBottom: '0.5rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e1e4e8',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px',
  },
  headerRow: {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e9ecef',
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
    letterSpacing: '0.5px',
  },
  row: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '1.2rem 1rem',
    verticalAlign: 'top',
    fontSize: '0.95rem',
  },
  orderId: {
    fontFamily: 'monospace',
    color: '#718096',
    background: '#f7fafc',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  itemList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  itemLi: {
    marginBottom: '0.4rem',
    display: 'flex',
    alignItems: 'center',
    color: '#4a5568',
  },
  itemQty: {
    background: '#edf2f7',
    color: '#2d3748',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    marginRight: '8px',
  },
  total: {
    fontWeight: '700',
    color: '#2d3748',
  },
  paid: {
    fontWeight: '700',
    color: '#1a202c',
  },
  paidNote: {
    fontSize: '0.8rem',
    color: '#718096',
    marginTop: '4px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '50px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  noOrders: {
    textAlign: 'center',
    padding: '3rem',
    color: '#a0aec0',
    fontSize: '1.1rem',
    background: '#f7fafc',
    borderRadius: '8px',
    border: '2px dashed #e2e8f0',
  },
  errorMsg: {
    color: '#e53e3e',
    background: '#fff5f5',
    border: '1px solid #feb2b2',
    padding: '1rem',
    borderRadius: '6px',
  },
};

export default OrderHistory;