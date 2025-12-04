import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/AdminDashboard.css";

const AdminSidebar = ({ activeTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Admin Panel</h2>
      </div>

      <nav className="sidebar-menu">
        <Link
          to="/admin/dashboard"
          className={`menu-item ${activeTab === "overview" ? "active" : ""}`}
        >
          <span className="menu-icon">📊</span>
          Dashboard
        </Link>

        <Link
          to="/admin/products-management"
          className={`menu-item ${activeTab === "products" ? "active" : ""}`}
        >
          <span className="menu-icon">📦</span>
          Products
        </Link>

        <Link
          to="/admin/orders-management"
          className={`menu-item ${activeTab === "orders" ? "active" : ""}`}
        >
          <span className="menu-icon">📋</span>
          Orders
        </Link>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;
