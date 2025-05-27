// SellerDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './seller-dashboard.css';
import { signOut } from "firebase/auth";
import { auth } from "./firebase"; // adjust this path if needed
import { useNavigate } from "react-router-dom";

function SellerDashboard() {
  const userName = "USER-NAME"; // name fetch karna hai.
  const navigate = useNavigate();
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert("Logout successful!");
        navigate("/"); /* see now it is redirecting to signup page but jab mai 
                          landing page banaunga tab ye change hoga !
                      */
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Logout failed. Try again.");
      });
  };

  return (
    <div className="seller-dashboard">
      <aside className="sidebar">
        <div className="logo"><img src="/logo.png" alt="Logo" /></div>
         <div className="dashboard-title">
            <hr />
            <span>Seller Dashboard</span>
            <hr />
          </div>

        
        <nav className="nav-buttons">
          <Link to="/create-auction"><button>Create Auction</button></Link>
          <Link to="/seller-auctions"><button>View Listing</button></Link>
          <Link to="/seller-analytics"><button>Sale Analytics</button></Link>
        </nav>

        <div className="logout-button">
             <button onClick={handleLogout}>LOGOUT</button>
        </div>
      </aside>

      <main className="dashboard-content">
        <h1>Welcome Back “{userName}”</h1>
      </main>
    </div>
  );
}

export default SellerDashboard;