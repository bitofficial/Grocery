import React from "react";
import "../Styles/AdminHeader.css";

const AdminHeader = ({ adminUser }) => {
  return (
    <header className="admin-header">
      <div className="header-content">
        <h1 className="page-title">Grocery Admin</h1>
        <div className="header-user">
          <span className="user-name">{adminUser?.name || "Admin"}</span>
          <div className="user-avatar">
            {adminUser?.name?.charAt(0).toUpperCase() || "A"}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
