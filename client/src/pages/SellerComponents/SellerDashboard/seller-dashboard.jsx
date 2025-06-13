import React, { useEffect, useState , useRef} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import './seller-dashboard.css';
import Swal from 'sweetalert2';
import { logo } from '../../../assets';
import { MessageSquare, Gavel, List, BarChart3, Settings, User, LogOut, Eye, Hammer, TrendingUp } from "lucide-react";
import LoaderScreen from '../../../components/LoaderScreen';

function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().role === "seller") {
            const userData = docSnap.data();
            setUser({ ...user, name: userData.name, role: userData.role });
            setLoading(false);
          } else {
            navigate("/unauthorized", { replace: true });
          }
        } catch (error) {
          console.error("Error fetching user doc:", error);
          navigate("/unauthorized", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  if (loading) {
    return <LoaderScreen />;
  }

  return(
    <div className="seller-dashboard">
      <aside className="sidebar">
        <div className="logo">
          <Link to="/seller-dashboard">
            <img src={logo} alt="Logo" style={{ cursor: 'pointer' }} />
          </Link>
        </div>

        <div className="dashboard-title">
          <hr />
          <span>Seller Dashboard</span>
          <hr />
        </div>

        <nav className="nav-buttons">
          <Link to="/create-auction">
            <button className="nav-btn">
              <Gavel className="nav-icon" />
              <span>Create Auction</span>
            </button>
          </Link>

          <Link to="/seller-auctions">
            <button className="nav-btn">
              <List className="nav-icon" />
              <span>View Listing</span>
            </button>
          </Link>

          <Link to="/seller-analytics">
            <button className="nav-btn">
              <BarChart3 className="nav-icon" />
              <span>Analytics</span>
            </button>
          </Link>

          <Link to="/chats">
            <button className="nav-btn">
              <MessageSquare className="nav-icon" />
              <span>Chat</span>
            </button>
          </Link>
        </nav>
      </aside>
<main className="dashboard-content">
  <div className="dashboard-topbar">
    <div className="welcome-section">
      <h2>Hey {user?.name},</h2>
      <p>Welcome back to Auctania — your auction HQ </p>
    </div>

    <div className="topbar-icons" ref={dropdownRef}>
      <div className="profile-toggle" onClick={() => setShowProfile(!showProfile)}>
        <img src={`https://ui-avatars.com/api/?name=${user?.name || "User"}`} alt="User Avatar" />
        {showProfile && (
          <div className="profile-dropdown">
            <div className="profile-info">
              <p className="profile-name">{user?.name || "No Name"}</p>
              <p className="profile-email">{user?.email}</p>
            </div>
            <button className="dropdown-btn"><Settings size={16} /> Settings</button>
            <button className="dropdown-btn"><User size={16} /> Profile</button>
            <button className="dropdown-btn" onClick={handleLogout}><LogOut size={16} /> Sign Out</button>
          </div>
        )}
      </div>
    </div>
  </div>
      
        <div className="kpi-container">
          <div className="kpi-card">
            <Gavel size={24} />
            <div>
              <h4>Live Auctions</h4>
              <p>2</p>
            </div>
          </div>
          <div className="kpi-card">
            <Eye size={24} />
            <div>
              <h4>Total Views</h4>
              <p>100</p>
            </div>
          </div>
          <div className="kpi-card">
            <Hammer size={24} />
            <div>
              <h4>Bids Received</h4>
              <p>0</p>
            </div>
          </div>
          <div className="kpi-card">
            <TrendingUp size={24} />
            <div>
              <h4>Top Product</h4>
              <p>iPhone 14 Pro</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SellerDashboard;