// src/pages/buyer/BuyerDashboard.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from '../../../firebase/firebaseConfig';
import ListingCard from '../../../components/ListingCard';
import './buyer-dashboard.css';

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
        const q = query(collection(db, "auctions"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const allListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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



return (

  <>
    <div className="filter-container">
      <button className="filter-toggle" onClick={toggleDropdown}>
    ☰ Filter
  </button>
  {showDropdown && (
    <div className="filter-dropdown">
      <button onClick={() => applyFilter("all")}>All</button>
      <button onClick={() => applyFilter("live")}>Live</button>
      <button onClick={() => applyFilter("past")}>Past</button>
      <button onClick={() => applyFilter("future")}>Upcoming</button>
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

</>
);
}


export default BuyerDashboard;