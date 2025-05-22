import React from 'react';
import './seller-dashboard.css';

function SellerDashboard() {
  return (
    <div className="dashboard-container">
      <h1>Seller Dashboard</h1>
      <p>Welcome to your seller portal.</p>

      <section className="dashboard-section">
        <h3>Your Listings</h3>
        <p>[Placeholder for product listings]</p>
      </section>

      <section className="dashboard-section">
        <h3>Sales Analytics</h3>
        <p>[Placeholder for sales data]</p>
      </section>
    </div>
  );
}

export default SellerDashboard;