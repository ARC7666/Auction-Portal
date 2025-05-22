import React from 'react';
import './buyer-dashboard.css'; // optional shared styles

function BuyerDashboard() {
  return (
    <div className="dashboard-container">
      <h1>Buyer Dashboard</h1>
      <p>Welcome to your buyer portal.</p>
      
      <section className="dashboard-section">
        <h3>Your Recent Bids</h3>
        <p>[Placeholder for bidding activity]</p>
      </section>

      <section className="dashboard-section">
        <h3>Recommended Products</h3>
        <p>[Placeholder for product recommendations]</p>
      </section>
    </div>
  );
}

export default BuyerDashboard;