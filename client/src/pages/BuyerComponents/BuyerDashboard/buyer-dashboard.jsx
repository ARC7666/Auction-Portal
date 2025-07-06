

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import ListingCard from '../../../components/ListingCard';
import './buyer-dashboard.css';
import { ListFilter, Radio, Archive, Clock, Car, Laptop, Gem, Crown, Watch, Shirt, Package, Menu , Paintbrush, Home} from 'lucide-react';


function BuyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const filterRef = useRef(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryRef = useRef(null);

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


  useEffect(() => {
  window.history.pushState(null, "", window.location.href);
  const handlePopState = () => {
    window.history.pushState(null, "", window.location.href);
  };
  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);

  useEffect(() => {
    const handleClickOutsideCategory = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideCategory);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideCategory);
    };
  }, []);


  const now = new Date();
  const filteredListings = listings.filter(listing => {
    const start = new Date(listing.startTime);
    const end = new Date(listing.endTime);
    const ended12HoursAgo = new Date(end.getTime() + 12 * 60 * 60 * 1000);

    if (new Date() > ended12HoursAgo) return false;

    const matchesTime =
      filter === 'all' ||
      (filter === 'live' && start <= now && now <= end) ||
      (filter === 'past' && end < now) ||
      (filter === 'future' && start > now);

    const matchesCategory =
      categoryFilter === 'all' || listing.category?.toLowerCase() === categoryFilter;

    return matchesTime && matchesCategory;
  });


  const categoryIcons = {
    all: Menu,
    vehicle: Car,
    electronics: Laptop,
    luxury: Crown,
    antique: Watch,
    jewellery: Gem,
    lifestyle: Shirt,
    painting: Paintbrush,
    realestate: Home,
    others: Package
  };

  return (

    <>
      <main>
        <div><h2 className="my-bids-heading">Explore Bids</h2>
          <div className="filter-container-wrapper">
            <div className="filter-block" ref={filterRef}>
              <button className="filter-toggle" onClick={toggleDropdown}>
                ☰ Filter
              </button>
              {showDropdown && (
                <div className="filter-dropdown">
                  <button
                    className={filter === "all" ? "active-option" : ""}
                    onClick={() => applyFilter("all")}
                  >
                    <ListFilter size={16} style={{ marginRight: '8px' }} />
                    Show All Auctions
                  </button>
                  <button
                    className={filter === "live" ? "active-option" : ""}
                    onClick={() => applyFilter("live")}
                  >
                    <Radio size={16} style={{ marginRight: '8px' }} />
                    Live Now
                  </button>
                  <button
                    className={filter === "future" ? "active-option" : ""}
                    onClick={() => applyFilter("future")}
                  >
                    <Clock size={16} style={{ marginRight: '8px' }} />
                    Upcoming
                  </button>
                  <button
                    className={filter === "past" ? "active-option" : ""}
                    onClick={() => applyFilter("past")}
                  >
                    <Archive size={16} style={{ marginRight: '8px' }} />
                    Closed Auctions
                  </button>

                </div>
              )}
            </div>

            <div className="filter-block" ref={categoryRef}>
              <button className="filter-toggle" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                🗂 Category
              </button>
              {showCategoryDropdown && (
                <div className="filter-dropdown">
                  {["all", "Vehicle", "Electronics", "Luxury", "Antique", "Jewellery", "Lifestyle", "Painting" , "RealEstate", "Others"].map(cat => {
                    const lowerCat = cat.toLowerCase();
                    const IconComponent = categoryIcons[lowerCat];

                    return (
                      <button
                        key={cat}
                        className={categoryFilter === lowerCat ? "active-option" : ""}
                        onClick={() => {
                          setCategoryFilter(lowerCat);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        {IconComponent && <IconComponent size={16} style={{ marginRight: '8px' }} />}
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <p>Loading auctions...</p>
        ) : filteredListings.length === 0 ? (
          <p className="no-auctions">No auctions found.</p>
        ) : (
          <div className="auction-grid-buyer">
            {filteredListings.map((listing, index) => (
              <div
                key={listing.id}
                className="animated-card-buyer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}


export default BuyerDashboard;