import React, { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";
import { logo } from "../../../assets";
import "./buyer-layout.css";
import {Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";
import Swal from "sweetalert2";


function BuyerLayout() {
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
    <div className="buyer-dashboard">
      <aside className="sidebard">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="dashboard-title">
          <hr />
          <span>Buyer Dashboard</span>
          <hr />
        </div>
        <nav className="nav-buttons">
          <button>Chat</button>
          <button>My Bids</button>
          <button>Live Auctions</button>
        </nav>

        <div className="logout-button">
          <button onClick={handleLogout}>LOGOUT</button>
        </div>
      </aside>
      

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};


export default BuyerLayout;