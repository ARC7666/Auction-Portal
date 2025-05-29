import React from 'react';
import './admin-dashboard.css';

function AdminDashboard() {
  return (
  <div className="dashboard-container">
    <h1>Admin Dashboard</h1>
  <p>Welcome, Admin. Manage the platform here.</p>

  <section className="dashboard-section">
    <h3>User Management</h3>
    <p>[]</p>
  </section>

  <section className="dashboard-section">
    <h3>Reports & System Logs</h3>
    <p>[]</p>
  </section>
 </div>
);
}

export default AdminDashboard;