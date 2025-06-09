import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from '../../../firebase/firebaseConfig';
import Swal from 'sweetalert2';
import { logo } from '../../../assets';
import ListingCard from '../../../components/ListingCard'; // ✅ Imported from external file
import './buyer-dashboard.css';
import ChatBox from '../../chats/ChatBox';

function BuyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const applyFilter = (type) => {
    setShowDropdown(false);
    setFilter(type);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
      else navigate("/", { replace: true });
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "auctions"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const allListings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setListings(allListings);
      } catch (err) {
        console.error("Error fetching auctions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const now = new Date();
  const filteredListings = listings.filter(listing => {
    const start = new Date(listing.startTime);
    const end = new Date(listing.endTime);

    if (filter === 'all') return true;
    if (filter === 'live') return start <= now && now <= end;
    if (filter === 'past') return end < now;
    if (filter === 'future') return start > now;
    return true;
  });

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been logged out successfully.',
          showConfirmButton: false,
          timer: 1200,
          timerProgressBar: true,
        });
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Logout failed.");
      });
  };

  return (
    <div className="buyer-dashboard">
      <aside className="sidebar">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="dashboard-title">
          <hr />
          <span>Buyer Dashboard</span>
          <hr />
        </div>
        <nav className="nav-buttons">
          <Link to="/ChatBox"><button>Chat</button></Link>
          <Link to="/my-bids"><button>My Bids</button></Link>
          <Link to="/auctions"><button>Live Auctions</button></Link>
        </nav>
        <div className="logout-button">
          <button onClick={handleLogout}>LOGOUT</button>
        </div>
      </aside>

      <main className="dashboard-content">
        <div className="filter-container">
          <button className="filter-toggle" onClick={toggleDropdown}>
            ☰ Filter
          </button>
          {showDropdown && (
            <div className="filter-dropdown">
              <button onClick={() => applyFilter("all")}>All</button>
              <button onClick={() => applyFilter("live")}>Live</button>
              <button onClick={() => applyFilter("past")}>Past</button>
            </div>
          )}
        </div>

        {loading ? (
          <p>Loading auctions...</p>
        ) : filteredListings.length === 0 ? (
          <p className="no-auctions">No auctions found.</p>
        ) : (
          <div className="auction-grid">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BuyerDashboard;