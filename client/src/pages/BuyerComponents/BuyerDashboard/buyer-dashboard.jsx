

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import ListingCard from '../../../components/ListingCard';
import SkeletonCard from '../../../components/Skeleton/SkeletonCard';
import './buyer-dashboard.css';
import { ListFilter, Radio, Archive, Clock, Car, Laptop, Gem, Crown, Watch, Shirt, Package, Menu, Paintbrush, Home, Folder, Book, PackageX } from 'lucide-react';


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

          if (role !== "buyer" && role !== "seller") {
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
        const q = query(collection(db, "auctions"), orderBy("startTime", "asc"));
        const snapshot = await getDocs(q);
        const allListings = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(listing => listing.isBanned !== true); 
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


  const groupedListings = filteredListings.reduce((acc, listing) => {
    const cat = listing.category || 'Others';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(listing);
    return acc;
  }, {});

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
    books: Book,
    others: Package
  };

  return (

    <>
      <main>
        <div className="hero-banner-buyer">
          <div className="hero-content">
            <h1>Discover Extraordinary Items.</h1>
            <p>Bid on exclusive items from top sellers around the world.</p>
          </div>
        </div>
        <div>
          <div className="filter-container-wrapper">
            <div className="filter-block" ref={filterRef}>
              <button className="filter-toggle" onClick={toggleDropdown}>
                <ListFilter size={18} style={{marginRight: '8px'}} /> Filter
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
                <Folder size={18} style={{marginRight: '8px'}} />
                Category
              </button>
              {showCategoryDropdown && (
                <div className="filter-dropdown">
                  {["all", "Vehicle", "Electronics", "Luxury", "Antique", "Jewellery", "Lifestyle", "Painting", "RealEstate", "Books", "Others"].map(cat => {
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
          <div className="auction-grid-buyer" style={{ marginTop: '2rem' }}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="empty-state-container">
            <PackageX size={64} color="#a1a1aa" className="empty-state-icon" />
            <h3>No items found</h3>
            <p>We're brewing up some extraordinary items. Stay tuned and check back soon!</p>
          </div>
        ) : (
          <div className="categorized-listings">
            {Object.keys(groupedListings).sort((a, b) => {
              const catA = a.toLowerCase();
              const catB = b.toLowerCase();
              if (catA === 'electronics') return -1;
              if (catB === 'electronics') return 1;
              if (catA === 'vehicle' || catA === 'cars') return -1;
              if (catB === 'vehicle' || catB === 'cars') return 1;
              if (catA === 'others') return 1;
              if (catB === 'others') return -1;
              return a.localeCompare(b);
            }).map((category) => {
              const items = groupedListings[category];
              const lowerCat = category.toLowerCase();
              const IconComponent = categoryIcons[lowerCat] || categoryIcons.others;
              return (
                <div key={category} className="category-section" style={{ marginBottom: '3rem' }}>
                  <h2 className="category-title" style={{ fontSize: '2rem', fontWeight: 700, color: '#1d1d1f', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {IconComponent && <IconComponent size={28} />} {category}
                  </h2>
                  <div className="auction-grid-buyer">
                    {items.map((listing, index) => (
                      <div
                        key={listing.id}
                        className="animated-card-buyer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <ListingCard listing={listing} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}


export default BuyerDashboard;