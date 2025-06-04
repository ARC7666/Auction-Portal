import React from 'react';
import './buyer-dashboard.css'; 

function BuyerDashboard() {
  return (
    

    <div className="seller-dashboard">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo"><img src={logo} alt="Logo" /></div>
        </div>

        <div className="dashboard-title">
          <hr />
          <span>Seller Dashboard</span>
          <hr />
        </div>

        <nav className="nav-buttons">
          <Link to="/create-auction"><button>Create Auction</button></Link>
          <Link to="/seller-auctions"><button>View Listing</button></Link>
          <Link to="/seller-analytics"><button>Sale Analytics</button></Link>
          <Link to="/chats"><button>Chat</button></Link>
        </nav>

        <div className="logout-button">
          <button onClick={handleLogout}>LOGOUT</button>
        </div>
      </aside>

      <main className="dashboard-content">
        <h1>Welcome Back {user?.displayName ? `“${user.displayName}”` : "!"}</h1>
      </main>
    </div>


  );
}

export default BuyerDashboard;