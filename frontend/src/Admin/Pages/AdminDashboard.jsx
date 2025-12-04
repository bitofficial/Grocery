import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/AdminDashboard.css";
import AdminSidebar from "../Components/AdminSidebar";
import AdminHeader from "../Components/AdminHeader";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");

    if (!token || !user) {
      navigate("/admin/login");
      return;
    }

    setAdminUser(JSON.parse(user));
  }, [navigate]);

  if (!adminUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-main-content">
        <AdminHeader adminUser={adminUser} />
        <div className="admin-content-area">
          {activeTab === "overview" && (
            <div className="dashboard-overview">
              <h2>Welcome, {adminUser.name || "Admin"}!</h2>
              <p>Manage your store from here.</p>
              <div className="dashboard-stats">
                <div className="stat-card">
                  <h3>Products</h3>
                  <p className="stat-number">0</p>
                </div>
                <div className="stat-card">
                  <h3>Orders</h3>
                  <p className="stat-number">0</p>
                </div>
                <div className="stat-card">
                  <h3>Users</h3>
                  <p className="stat-number">0</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
