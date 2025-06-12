import React, { useEffect, useState, useRef } from 'react';
import { Outlet } from "react-router-dom";
import { logo } from "../../../assets";
import "./buyer-layout.css";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";
import Swal from "sweetalert2";
import { MessageSquare, Gavel, Radio, Settings, User, LogOut, BellRing } from "lucide-react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import dayjs from "dayjs";


function BuyerLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === "buyer") {
          setUser(user);
          setLoading(false);
        } else {
          navigate("/unauthorized", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAuctions(fetched);
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

  // Prevent render until user is verified
  if (loading) return null;

  return (
    <div className="buyer-dashboard">
      <aside className="sidebard">
        <div className="logo1">
           <Link to="/buyer-dashboard">
               <img src={logo} alt="Logo" style={{ cursor: 'pointer' }} />
            </Link>
        </div>
        <div className="dashboard-title">
          <hr />
          <span>Buyer Dashboard</span>
          <hr />
        </div>
        <nav className="nav-buttons">
          <button className="nav-btn">
            <MessageSquare className="nav-icon" />
            <span>Chat</span>
          </button>
          <button className="nav-btn">
            <Gavel className="nav-icon" />
            <span>My Bids</span>
          </button>
          <button className="nav-btn">
            <Radio className="nav-icon" />
            <span>Live Auctions</span>
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <Outlet />

        <div className="topbar-icons" ref={dropdownRef}>
          <div className="notification-toggle" onClick={() => setShowNotifications(!showNotifications)}>
            <BellRing color="#333070" size={26} />
            {showNotifications && (
              <div className="notification-dropdown">
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

          <div className="profile-toggle" onClick={() => setShowProfile(!showProfile)}>
            <img src={`https://ui-avatars.com/api/?name=${user?.displayName || "User"}`} alt="User Avatar" />
            {showProfile && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <p className="profile-name">{user?.displayName || "No Name"}</p>
                  <p className="profile-email">{user?.email}</p>
                </div>
                <button className="dropdown-btn"><Settings size={16} /> Settings</button>
                <button className="dropdown-btn"><User size={16} /> Profile</button>
                <button className="dropdown-btn" onClick={handleLogout}><LogOut size={16} /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default BuyerLayout;