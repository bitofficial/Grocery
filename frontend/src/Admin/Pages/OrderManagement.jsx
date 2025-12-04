import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/OrderManagement.css";
import AdminSidebar from "../Components/AdminSidebar";
import AdminHeader from "../Components/AdminHeader";

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");

    if (!token || !user) {
      navigate("/admin/login");
      return;
    }

    setAdminUser(JSON.parse(user));
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // This endpoint needs to be created on the backend
      const response = await fetch("http://localhost:8000/api/order/getAllOrders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const data = await response.json();
      // backend returns AllOrders (see controller), fall back to orders
      const ordersList = data.AllOrders || data.orders || [];
      setOrders(ordersList);

      // Initialize status selections
      const statusMap = {};
      (ordersList || []).forEach((order) => {
        const orderId = order._id || order.id;
        const status = order.status || order.orderStatus || "pending";
        if (orderId) statusMap[orderId] = status;
      });
      setSelectedOrderStatus(statusMap);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setSelectedOrderStatus((prev) => ({
        ...prev,
        [orderId]: newStatus,
      }));

      const token = localStorage.getItem("adminToken");
      const response = await fetch(`http://localhost:8000/api/order/updateStatus/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert("Order status updated successfully");
        fetchOrders();
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status");
    }
  };

  if (!adminUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar activeTab="orders" />
      <div className="admin-main-content">
        <AdminHeader adminUser={adminUser} />
        <div className="admin-content-area">
          <div className="orders-management">
            <h2>Order Management</h2>

            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="6">Loading...</td></tr>}
                  {orders.length === 0 && !loading && (
                    <tr><td colSpan="6">No orders found</td></tr>
                  )}
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id?.substring(0, 8)}...</td>
                      <td>{order.user?.name || order.user || "N/A"}</td>
                      <td>₹{order.total || order.totalPrice || 0}</td>
                      <td>
                        {new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td>
                        {(() => {
                          const status = order.status || order.orderStatus || "pending";
                          return (
                            <span className={`status-badge status-${status}`}>
                              {status}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        <select
                          value={selectedOrderStatus[order._id] || selectedOrderStatus[order.id] || order.status || order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(order._id || order.id, e.target.value)
                          }
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
