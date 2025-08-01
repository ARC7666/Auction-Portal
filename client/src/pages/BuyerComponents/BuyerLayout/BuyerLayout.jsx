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
  const searchContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const handleClickOutside = (event) => {
    const isInsideSearch = searchContainerRef.current?.contains(event.target);
    const isInsideProfileDropdown = dropdownRef.current?.contains(event.target);
    const isSearchInputFocused = document.activeElement === searchInputRef.current;

    if (!isInsideSearch && !isInsideProfileDropdown && !isSearchInputFocused) {
      setShowProfile(false);
      setShowNotifications(false);
      if (window.innerWidth <= 768) setMobileSearchVisible(false);
    }
  };

  useEffect(() => {
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
        });
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Logout failed. Try again.");
      });
  };

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
            onClick={() => navigate(user ? "/buyer-dashboard" : "/")}
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
          {/* Desktop Search */}
          {window.innerWidth > 768 && (
            <div className="search-container desktop-search" ref={searchContainerRef}>
              <Search size={24} color="#fff" onClick={() => searchInputRef.current?.focus()} style={{ cursor: "pointer" }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-box visible"
              />
              {searchQuery && (
                <X size={16} color="#fff" className="clear-search" onClick={() => setSearchQuery("")} />
              )}
            </div>
          )}

          {/* Mobile Search Icon */}
          {window.innerWidth <= 768 && (
            <>
              <div
                className="mobile-search-icon"
                onClick={() => setMobileSearchVisible(prev => !prev)}
              >
                <Search size={24} color="#fff" />
              </div>

              {mobileSearchVisible && (
                <div className="mobile-search-popup" ref={searchContainerRef}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <X
                    size={28}
                    color="#555"
                    className="close-mobile-search"
                    onClick={() => {
                      setSearchQuery("");
                      setMobileSearchVisible(false);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              )}
            </>
          )}

          {/* Profile */}
          <div className="profile-toggle-buyer" onClick={() => setShowProfile(!showProfile)}>
            <img src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.name || "User"}`} alt="User Avatar" />
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
                      <button className="dropdown-btn"> <CalendarDays size={16} /> Calendar </button>
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