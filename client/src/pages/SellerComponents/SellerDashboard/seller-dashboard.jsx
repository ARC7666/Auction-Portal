// SellerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from '../../../firebase/firebaseConfig'; 
import './seller-dashboard.css';
import Swal from 'sweetalert2';
import { logo } from '../../../assets';

function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); 
      } else {
        navigate("/",{ replace: true }); 
      }
    });

    return () => unsubscribe(); 
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
         Swal.fire({
        icon: 'success',
        title: 'Logout Successful',
        text: 'You have been logged out.',
        showConfirmButton: false,
        timer: 1200, 
        timerProgressBar: true,
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
        }
      });
        navigate("/");// remember to change this location once landing is created 
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Logout failed. Try again.");
      });
  };

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

export default SellerDashboard;