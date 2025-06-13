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
import { ClipLoader } from 'react-spinners';
import LoaderScreen from '../../../components/LoaderScreen';



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
        const userData = docSnap.data();
        setUser({ ...user, name: userData.name, role: userData.role });
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
      const today = dayjs();
      const filtered = [];

      for (const docSnap of querySnapshot.docs) {
        const auction = { id: docSnap.id, ...docSnap.data() };

        const endTime = dayjs(auction.endTime || auction.startTime).add(1, "day"); // assuming 1-day auctions
        const startTime = dayjs(auction.startTime);
        const diffInDays = startTime.diff(today, "day");

        if (endTime.isBefore(today)) {
          try {
            await deleteDoc(doc(db, "auctions", auction.id));
            console.log(`🗑️ Deleted expired auction: ${auction.title}`);
          } catch (err) {
            console.error("❌ Error deleting:", auction.title, err);
          }
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

          <div className="profile-toggle-buyer" onClick={() => setShowProfile(!showProfile)}>
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
      </main>
    </div>
  );
}

export default BuyerLayout;