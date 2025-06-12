import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import './seller-dashboard.css';
import Swal from 'sweetalert2';
import { logo } from '../../../assets';

function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const role = docSnap.data().role;

            if (role !== "seller") {
              return navigate("/unauthorized", { replace: true });
            } else {
              setUser(user);
              setLoading(false);
            }
          } else {
            return navigate("/unauthorized", { replace: true });
          }
        } catch (err) {
          console.error("Error checking role:", err);
          navigate("/unauthorized", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return null; // Ensures nothing flashes until role is confirmed

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
        navigate("/");
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
          <img src={logo} alt="Logo" />
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