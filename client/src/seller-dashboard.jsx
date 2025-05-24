import React from 'react';
import './seller-dashboard.css';
import { Link } from 'react-router-dom';

function SellerDashboard() {
  return (
    <div className="dashboard-container">
      <h1>Seller Dashboard</h1>
      <p>Welcome to your seller portal.</p>

      <div className="dashboard-buttons">
        <Link to="/create-auction">
          <button>Create New Auction</button>
        </Link>
        <Link to="/seller-auctions">
          <button>My Listings</button>
        </Link>
        <Link to="/seller-analytics">
          <button>Sales Analytics</button>
        </Link>
      </div>
    </div>
  );
}

export default SellerDashboard;