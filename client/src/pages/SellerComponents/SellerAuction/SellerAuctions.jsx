// SellerAuctions.jsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../../../firebase/firebaseConfig';
import Swal from 'sweetalert2';
import './SellerAuctions.css';

function SellerAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchAuctions = async () => {
      try {
        const q = query(
          collection(db, 'auctions'),
          where('sellerId', '==', auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAuctions(results.map(a => ({ ...a, showDesc: false })));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const handleDelete = async (auctionId) => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: 'Are you sure you want to delete this auction?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        confirmButton: 'custom-swal-confirm',
        cancelButton: 'custom-swal-cancel'
      },
      buttonsStyling: false
    });

    if (!result.isConfirmed) return;

    try {
      await deleteDoc(doc(db, 'auctions', auctionId));
      setAuctions(prev => prev.filter(a => a.id !== auctionId));

      Swal.fire({
        title: 'Deleted!',
        text: 'The auction has been removed',
        icon: 'success',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        customClass: {
          popup: 'success-swal-popup'
        }
      });
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire('Error', 'Failed to delete auction.', 'error');
    }
  };

  return (
    <div className="seller-auctions-wrapper">
      <h2 className="seller-auctions-heading">Your Listings</h2>

      {loading ? (
        <p className="seller-auctions-loading">Loading auctions...</p>
      ) : auctions.length === 0 ? (
        <p className="seller-auctions-empty">No listings yet.</p>
      ) : (
        <div className="auction-grid">
          {auctions.map((auction, index) => (
            <div
              className="auction-card-modern animated-card-seller"
              key={auction.id}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={auction.media?.[0] || "/placeholder.jpg"}
                alt={auction.title}
                className="auction-image"
              />

              <div className="auction-info">
                <div className="auction-header">
                  <h3 className="auction-title">{auction.title}</h3>
                  <button
                    className="desc-toggle-btn"
                    onClick={() => setAuctions(prev =>
                      prev.map(a =>
                        a.id === auction.id ? { ...a, showDesc: !a.showDesc } : a
                      )
                    )}
                  >
                    {auction.showDesc ? "Hide Details ▲" : "Show Details ▼"}
                  </button>
                </div>

                {auction.showDesc && (
                  <p className="auction-description">{auction.description}</p>
                )}

                <div className="auction-details-grid">
                  <p><strong>Start Price:</strong> ₹{auction.startPrice}</p>
                  <p><strong>Current Bid:</strong> ₹{auction.currentBid || "--"}</p>
                  <p><strong>Status:</strong> {auction.status}</p>
                </div>

                <div className="auction-actions">
                  <button onClick={() => handleDelete(auction.id)} className="delete-btn">❌ Delete</button>
                </div>

                {auction.status !== 'live' && (
                  <div className="auction-actions">
                    <Link to={`/seller-dashboard-layout/edit-auction/${auction.id}`} className='edit-link' >✏️ ‎‎ ‎    Edit</Link>
                    <button onClick={() => handleDelete(auction.id)} className="delete-btn">❌ Delete</button>
                  </div>


                )}
              </div>
            </div>

          ))}
        </div>
      )}
    </div>
  );
}

export default SellerAuctions;