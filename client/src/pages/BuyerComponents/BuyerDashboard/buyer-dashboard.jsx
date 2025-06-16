

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import ListingCard from '../../../components/ListingCard';
import './buyer-dashboard.css';
import { ListFilter, Radio, Archive, Clock } from 'lucide-react';


function BuyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const filterRef = useRef(null);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const applyFilter = (type) => {
    setShowDropdown(false);
    setFilter(type);
  };

 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const role = docSnap.data().role;

        if (role !== "buyer") {
          navigate("/unauthorized", { replace: true });
        } else {
          setUser(user);
          setLoading(false);
        }
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


  useEffect(() => {
  const handleClickOutside = (event) => {
    if (filterRef.current && !filterRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
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
    <div className="filter-container" ref={filterRef}>
  <button className="filter-toggle" onClick={toggleDropdown}>
    ☰ Filter
  </button>
  {showDropdown && (
    <div className="filter-dropdown">
      <button onClick={() => applyFilter("all")}>
        <ListFilter size={16} style={{ marginRight: '8px' }} />
        Show All Auctions
      </button>
      <button onClick={() => applyFilter("live")}>
        <Radio size={16} style={{ marginRight: '8px' }} />
        Live Now
      </button>
      <button onClick={() => applyFilter("past")}>
        <Archive size={16} style={{ marginRight: '8px' }} />
        Closed Auctions
      </button>
      <button onClick={() => applyFilter("future")}>
        <Clock size={16} style={{ marginRight: '8px' }} />
        Upcoming 
      </button>
    </div>
  )}
</div>

    {loading ? (
      <p>Loading auctions...</p>
    ) : filteredListings.length === 0 ? (
      <p className="no-auctions">No auctions found.</p>
    ) : (
      <div className="auction-grid-buyer">
        {filteredListings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    )}

</>
);
}


export default BuyerDashboard;