import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { Link } from 'react-router-dom';
import './SellerAuctions.css';

function SellerAuctions() {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchAuctions = async () => {
      const q = query(
        collection(db, 'auctions'),
        where('sellerId', '==', auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAuctions(results);
    };

    fetchAuctions();
  }, []);

  const handleDelete = async (auctionId) => {
    const confirm = window.confirm("Are you sure you want to delete this auction?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'auctions', auctionId));
      setAuctions(prev => prev.filter(a => a.id !== auctionId));
      alert("Auction deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete auction.");
    }
  };

  const handleEdit = (auctionId) => {
    // Navigate to edit page with auction ID
    navigate(`/edit-auction/${auctionId}`);
  };

  return (
    <div className="auction-list-container">
      <aside className="sidebar2">
              <div className="logo"><img src="/logo.png" alt="Logo" /></div>
               <div className="dashboard-title2">
                  <hr />
                  <span>Seller Dashboard</span>
                  <hr />
                </div>
      
              
              <nav className="nav-buttons">
                <Link to="/create-auction"><button>Create Auction</button></Link>
                <Link to="/seller-dashboard"><button>Home</button></Link>
                <Link to="/seller-analytics"><button>Sale Analytics</button></Link>
              </nav>
      
            </aside>
    <main className="dashboard-content2">
      <h2>Your Listings</h2>
      {auctions.length === 0 ? (
        <p>No listings yet.</p>
      ) : (
        <ul className="auction-list">
          {auctions.map(auction => (
            <li key={auction.id}>
              <h4>{auction.title}</h4>
              <p>{auction.description}</p>
              <p>Start Price: ₹{auction.startPrice}</p>
              <p>Status: {auction.status}</p>

              {auction.status !== 'live' && (
                <div style={{ marginTop: '8px' }}>
                  <Link to={`/edit-auction/${auction.id}`} className="edit-link">✏️ Edit</Link>
                  <button onClick={() => handleDelete(auction.id)} style={{ marginLeft: '8px' }}>
                    ❌ Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      </main>
    </div>
  );
}

export default SellerAuctions;