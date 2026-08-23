import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  MessageSquare, Gavel, List, Settings, User, LogOut, Home
} from "lucide-react";
import { logo, logoblack } from "../../../assets";
import LoaderScreen from "../../../components/LoaderScreen";
import { Outlet } from "react-router-dom";
import Footer from '../../../components/Footer/Footer';
import "./SellerLayout.css";

const SellerLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === "seller") {
          const userData = docSnap.data();
          setUser({ ...user, name: userData.name, role: userData.role });
        } else {
          navigate("/unauthorized", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.sidebar') && !e.target.closest('.hamburger-icon')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => alert("Logout failed: " + error.message));
  };

  if (loading) return <LoaderScreen />;

  return (
    <div className="seller-dashboard-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo-seller">
          <Link to="/seller-dashboard">
            <img src={logoblack} alt="Logo" style={{ cursor: 'pointer' }} />
          </Link>
        </div>

        <div className="dashboard-title">
          <hr />
              <Link to="/seller-dashboard">
          <span>Seller Dashboard</span>
          </Link>
          <hr />
        </div>

        <nav className="nav-buttons-seller">
       

          <Link to="/seller-dashboard-layout/create-auction">
            <button className="nav-btn-seller">
              <Gavel className="nav-icon" />
              <span>Create Auction</span>
            </button>
          </Link>

          <Link to="/seller-dashboard-layout/seller-auctions">
            <button className="nav-btn-seller">
              <List className="nav-icon" />
              <span>View Listings</span>
            </button>
          </Link>

          <Link to="/seller-dashboard-layout/chat">
            <button className="nav-btn-seller">
              <MessageSquare className="nav-icon" />
              <span>Chat</span>
            </button>
          </Link>

          <Link to="/buyer-dashboard">
            <button className="nav-btn-seller" style={{ marginTop: 'auto' }}>
              <User className="nav-icon" />
              <span>Buyer Dashboard</span>
            </button>
          </Link>
        </nav>
      </aside>




      <main className="dashboard-content-seller">
        <div className="hamburger-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <List />
        </div>

        {/* <div className="dashboard-topbar-seller">
          <div className="topbar-icons-seller" ref={dropdownRef}>
            <div className="profile-toggle-seller" onClick={() => setShowProfile(!showProfile)}>
              <img src={`https://ui-avatars.com/api/?name=${user?.name}`} alt="User Avatar" />
              {showProfile && (
                <div className="profile-dropdown-seller">
                  <div className="profile-info">
                    <p className="profile-name">{user?.name}</p>
                    <p className="profile-email">{user?.email}</p>
                  </div>
                  <button className="dropdown-btn"><Settings size={16} /> Settings</button>
                  <button className="dropdown-btn"><User size={16} /> Profile</button>
                  <button className="dropdown-btn" onClick={handleLogout}><LogOut size={16} /> Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </div>*/}
        <Outlet />
        
        <div style={{ marginTop: 'auto', padding: '2rem 0', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', borderTop: '1px solid #e5e7eb' }}>
          &copy; {new Date().getFullYear()} Auctania. All rights reserved.
        </div>
      </main>
    </div>
  );
};

export default SellerLayout;