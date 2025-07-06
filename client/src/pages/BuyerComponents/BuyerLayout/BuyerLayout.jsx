import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { logo } from "../../../assets";
import "./buyer-layout.css";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";
import Swal from "sweetalert2";
import { Home, Gavel, Radio, User, LogOut, BellRing, CalendarDays, Search, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const currentPath = location.pathname;
      const isAuctionPreview = currentPath.includes("/buyer-dashboard/auction");
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === "buyer") {
          const userData = docSnap.data();
          setUser({ ...user, name: userData.name, role: userData.role, profileImageUrl: userData.profileImageUrl || "" });
          setLoading(false);
        } else if (!isAuctionPreview) {
          navigate("/unauthorized", { replace: true });
        }
      } else if (!isAuctionPreview) {
        navigate("/", { replace: true });
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
        setShowNotifications(false);
        if (window.innerWidth <= 768) {
          setMobileSearchVisible(false);
        }
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
          if (auction.status === "ended" && now.diff(endTime, "hour") > 12) continue;
          filtered.push(auction);
        }
        setAuctions(filtered);
      } catch (err) {
        console.error("Error fetching auctions:", err);
      }
    };
    fetchAuctions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = auctions.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
  }, [searchQuery, auctions]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileSearchVisible(true);
      } else {
        setMobileSearchVisible(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
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

  useEffect(() => {
    const lastBidButton = document.querySelector(".bid-now-button");
    if (lastBidButton) {
      lastBidButton.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, []);

  if (loading) return <LoaderScreen />;

  const handleProtectedNavigation = (path) => {
    if (!user) {
      Swal.fire({ icon: 'info', title: 'Login Required', text: 'Please login to continue.', showConfirmButton: false, timer: 1300 });
      navigate(`/login?redirect=${path}`);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="buyer-dashboard upgraded-layout">
      <header className="header-bar-buyer" ref={dropdownRef}>
        <div className="logo-section">
          <button
            onClick={() => {
              if (!user) {
                navigate("/", { replace: true });
              } else {
                navigate("/buyer-dashboard");
              }
            }}
            className="unstyled-logo-button"
          >
            <img src={logo} alt="Logo" />
          </button>
        </div>

        <nav className="nav-buttons-header">
          <div className="desktop-nav">
            <button className={location.pathname === "/buyer-dashboard" ? "active" : ""} onClick={() => navigate("/buyer-dashboard")}> <Home size={18} /> <span>Home</span> </button>
            <button className={location.pathname === "/buyer-dashboard/my-bids" ? "active" : ""} onClick={() => handleProtectedNavigation("/buyer-dashboard/my-bids")}> <Gavel size={18} /> <span>My Bids</span> </button>
            <button className={location.pathname === "/buyer-dashboard/live-auctions" ? "active" : ""} onClick={() => handleProtectedNavigation("/buyer-dashboard/live-auctions")}> <Radio size={18} /> <span>Live</span> </button>
          </div>
        </nav>

        <div className="right-section-header">
          <div className={`search-container ${mobileSearchVisible ? "visible" : ""}`}>
            <Search
              size={20}
              color="#fff"
              onClick={(e) => {
                e.stopPropagation(); 
                if (window.innerWidth <= 766) {
                  setMobileSearchVisible(true);
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 100);
                } else {
                  searchInputRef.current?.focus();
                }
              }}
              style={{ cursor: "pointer" }}
            />
            <input ref={searchInputRef} type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input-box" style={{ display: mobileSearchVisible || window.innerWidth > 768 ? "block" : "none" }} />
            {searchQuery && <X size={16} color="#fff" className="clear-search" onClick={() => setSearchQuery("")} />}
          </div>

          {window.innerWidth > 768 && (
            <div className="notification-toggle" onClick={() => setShowNotifications(!showNotifications)}>
              <BellRing size={24} color="white" />
              {showNotifications && (
                <div className="notification-dropdown-buyer">
                  <p className="dropdown-title">Upcoming Auctions</p>
                  {upcomingAuctions.length === 0 ? (
                    <p className="no-auction">No auctions in next 5 days</p>
                  ) : (
                    upcomingAuctions.map((item, index) => (
                      <p key={index} className="auction-item">{item.title} – {dayjs(item.startTime).format("MMM D, h:mm A")}</p>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <div className="profile-toggle-buyer" onClick={() => setShowProfile(!showProfile)}>
            <img src={user?.profileImageUrl ? user.profileImageUrl : `https://ui-avatars.com/api/?name=${user?.name || "User"}`} alt="User Avatar" />
            {showProfile && (
              <div className="profile-dropdown-buyer">
                {user ? (
                  <>
                    <div className="profile-info-buyer">
                      <p className="profile-name-buyer">{user?.name || "No Name"}</p>
                      <p className="profile-email-buyer">{user?.email}</p>
                    </div>
                    <Link to="/buyer-dashboard/profile">
                      <button className="dropdown-btn"> <User size={16} /> Profile </button>
                    </Link>
                    <Link to="/buyer-dashboard/calender">
                      <button className="dropdown-btn"> <CalendarDays size={16} /> Calender/Reminder </button>
                    </Link>
                    {window.innerWidth <= 766 && (
                      <>
                        <button className="dropdown-btn" onClick={() => handleProtectedNavigation("/buyer-dashboard/my-bids")}> <Gavel size={16} /> My Bids </button>
                        <button className="dropdown-btn" onClick={() => handleProtectedNavigation("/buyer-dashboard/live-auctions")}> <Radio size={16} /> Live </button>
                        <button className="dropdown-btn" onClick={() => setShowNotifications(true)}> <BellRing size={16} /> Notifications </button>
                      </>
                    )}
                    <button className="dropdown-btn" onClick={handleLogout}> <LogOut size={16} /> Sign Out </button>
                  </>
                ) : (
                  <button className="dropdown-btn" onClick={() => navigate(`/login?redirect=${location.pathname}`)}> <User size={16} /> Login </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {searchQuery && (
          <div className="search-result-box">
            <h4>Search Results:</h4>
            {searchResults.length === 0 ? (
              <p>No matching products</p>
            ) : (
              searchResults.map((item) => (
                <div key={item.id} className="search-result-item" onClick={() => navigate(`/buyer-dashboard/auction/${item.id}`)}>
                  <p><strong>{item.title}</strong></p>
                  <p style={{ fontSize: "12px", color: "#777" }}>{item.description?.slice(0, 60)}...</p>
                </div>
              ))
            )}
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export default BuyerLayout;
