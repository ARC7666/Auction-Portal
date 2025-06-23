// SellerDashboard.jsx (Updated with dynamic KPIs)
import React, { useEffect, useState , useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import SellerAnalyticsSection from '../../../components/SellerAnalyticsSection/SellerAnalyticsSection';
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
  const [kpis, setKpis] = useState({
    liveCount: 0,
    totalViews: 0,
    bidCount: 0,
    topProduct: '—'
  });
  const dropdownRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().role === "seller") {
            const userData = docSnap.data();
            setUser({ ...user, name: userData.name, role: userData.role });
            await fetchKpis(user.uid);
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

  const fetchKpis = async (sellerId) => {
    try {
      const q = query(collection(db, 'auctions'), where('sellerId', '==', sellerId));
      const snapshot = await getDocs(q);

      let liveCount = 0;
      let totalViews = 0;
      let bidCount = 0;
      let topProduct = '';
      let maxBids = 0;

      snapshot.forEach(doc => {
        const data = doc.data();

        if (data.status === 'live') liveCount++;
        if (data.views) totalViews += data.views;
        if (data.bids?.length) {
          bidCount += data.bids.length;
          if (data.bids.length > maxBids) {
            maxBids = data.bids.length;
            topProduct = data.title;
          }
        }
      });

      setKpis({
        liveCount,
        totalViews,
        bidCount,
        topProduct: topProduct || '—'
      });
    } catch (err) {
      console.error("Failed to fetch KPIs:", err);
    }
  };

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

  if (loading) return <LoaderScreen />;

  return (
    <div className="seller-dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo-seller">
          <Link to="/seller-dashboard">
            <img src={logo} alt="Logo" style={{ cursor: 'pointer' }} />
          </Link>
        </div>

        <div className="dashboard-title">
          <hr />
          <span>Seller Dashboard</span>
          <hr />
        </div>

        <nav className="nav-buttons-seller">
          <Link to="/create-auction">
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
        </nav>
      </aside>

      <main className="dashboard-content">
        <div className="dashboard-topbar">

    <div className="hamburger-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
         <List />
          <div className="welcome-section-mobile">
            <h2>Hey {user?.name},</h2>
            <p>Welcome back to Auctania — your auction HQ </p>
          </div>
    </div>
          <div className="welcome-section">
            <h2>Hey {user?.name},</h2>
            <p>Welcome back to Auctania — your auction HQ </p>
          </div>

          <div className="topbar-icons" ref={dropdownRef}>
            <div className="profile-toggle" onClick={() => setShowProfile(!showProfile)}>
              <img src={`https://ui-avatars.com/api/?name=${user?.name || "User"}`} alt="User Avatar" />
              {showProfile && (
                <div className="profile-dropdown-seller">
                  <div className="profile-info">
                    <p className="profile-name">{user?.name || "No Name"}</p>
                    <p className="profile-email">{user?.email}</p>
                  </div>
                  <button className="dropdown-btn"><Settings size={16} /> Settings</button>
                  <Link to="/seller-dashboard-layout/profile">
                        <button className="dropdown-btn">
                           <User size={16} /> Profile
                         </button>
                  </Link>
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
              <p>{kpis.liveCount}</p>
            </div>
          </div>
          <div className="kpi-card">
            <Hammer size={24} />
            <div>
              <h4>Bids Received</h4>
              <p>{kpis.bidCount}</p>
            </div>
          </div>
          <div className="kpi-card">
            <TrendingUp size={24} />
            <div>
              <h4>Top Product</h4>
              <p>{kpis.topProduct}</p>
            </div>
          </div>
        </div>

<SellerAnalyticsSection />
      </main>
    </div>
  );
}

export default SellerDashboard;