import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { logo } from "../../../assets";
import "./buyer-layout.css";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";
import Swal from "sweetalert2";
import { Home, Gavel, Radio, Settings, User, LogOut, BellRing ,CalendarDays } from "lucide-react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import dayjs from "dayjs";
import LoaderScreen from '../../../components/LoaderScreen';

function BuyerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === "buyer") {
          const userData = docSnap.data();
          setUser({ ...user, name: userData.name, role: userData.role, profileImageUrl: userData.profileImageUrl || "" });
          setLoading(false);
        } else {
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
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "auctions"));
        const now = dayjs();
        const filtered = [];

        for (const docSnap of querySnapshot.docs) {
          const auction = { id: docSnap.id, ...docSnap.data() };
          const endTime = dayjs(auction.endTime);

          if (auction.status === "ended" && now.diff(endTime, "hour") > 12) {
            continue;
          }

          filtered.push(auction);
        }

        setAuctions(filtered);
      } catch (err) {
        console.error("Error fetching auctions:", err);
      }
    };

    fetchAuctions();
  }, []);

  const upcomingAuctions = auctions
    .filter((auction) => {
      const today = dayjs();
      const startTime = dayjs(auction.startTime);
      const diffInDays = startTime.diff(today, 'day');
      return diffInDays >= 0 && diffInDays <= 5 && auction.status === "scheduled";
    })
    .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));

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

  return (
    <div className="buyer-dashboard upgraded-layout">
      <header className="header-bar-buyer" ref={dropdownRef}>
        <div className="logo-section">
          <Link to="/buyer-dashboard">
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        <nav className="nav-buttons-header">
          {/* Visible only on desktop */}
          <div className="desktop-nav">
            <button
              className={location.pathname === "/buyer-dashboard" ? "active" : ""}
              onClick={() => navigate("/buyer-dashboard")}
            >
              <Home size={18} />
              <span>Home</span>
            </button>
            <button
              className={location.pathname === "/buyer-dashboard/my-bids" ? "active" : ""}
              onClick={() => navigate("/buyer-dashboard/my-bids")}
            >
              <Gavel size={18} />
              <span>My Bids</span>
            </button>
            <button
              className={location.pathname === "/buyer-dashboard/live-auctions" ? "active" : ""}
              onClick={() => navigate("/buyer-dashboard/live-auctions")}
            >
              <Radio size={18} />
              <span>Live</span>
            </button>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="mobile-nav">
            <button className="hamburger-icon" onClick={() => setShowMenu(prev => !prev)}>
              <svg width="24" height="24" fill="#fff" viewBox="0 0 24 24">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {showMenu && (
              <div className="hamburger-menu-dropdown">
                <button onClick={() => navigate("/buyer-dashboard")}><Home size={16} /> Home</button>
                <button onClick={() => navigate("/buyer-dashboard/my-bids")}><Gavel size={16} /> My Bids</button>
                <button onClick={() => navigate("/buyer-dashboard/live-auctions")}><Radio size={16} /> Live</button>
              </div>
            )}
          </div>
        </nav>


        <div className="right-section-header">
          <div className="notification-toggle" onClick={() => setShowNotifications(!showNotifications)}>
            <BellRing size={24} color="white" />
            {showNotifications && (
              <div className="notification-dropdown-buyer">
                <p className="dropdown-title">Upcoming Auctions</p>
                {upcomingAuctions.length === 0 ? (
                  <p className="no-auction">No auctions in next 5 days</p>
                ) : (
                  upcomingAuctions.map((item, index) => (
                    <p key={index} className="auction-item">
                      {item.title} – {dayjs(item.startTime).format("MMM D, h:mm A")}
                    </p>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="profile-toggle-buyer" onClick={() => setShowProfile(!showProfile)}>
            <img
              src={
                user?.profileImageUrl ? user.profileImageUrl : `https://ui-avatars.com/api/?name=${user?.name || "User"}`} alt="User Avatar" />
            {showProfile && (
              <div className="profile-dropdown-buyer">
                <div className="profile-info-buyer">
                  <p className="profile-name-buyer">{user?.name || "No Name"}</p>
                  <p className="profile-email-buyer">{user?.email}</p>
                </div>
               {/*<button className="dropdown-btn"><Settings size={16} /> Settings</button>*/}
                <Link to="/buyer-dashboard/profile">
                  <button className="dropdown-btn">
                    <User size={16} /> Profile
                  </button>
                </Link>
                <Link to="/buyer-dashboard/calender">
                  <button className="dropdown-btn">
                    <CalendarDays size={16} /> Calender/Reminder
                  </button>
                </Link>
                <button className="dropdown-btn" onClick={handleLogout}><LogOut size={16} /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

export default BuyerLayout;