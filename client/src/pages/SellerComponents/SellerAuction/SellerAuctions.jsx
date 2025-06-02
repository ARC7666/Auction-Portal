import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../../firebase/firebaseConfig';
import { Link } from 'react-router-dom';
import './SellerAuctions.css';
 import { signOut, onAuthStateChanged } from "firebase/auth";
import Swal from 'sweetalert2';
import { logo } from '../../../assets';

function SellerAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 const [user, setUser] = useState(null);
 
   
    useEffect(() => {
       const unsubscribe = onAuthStateChanged(auth, (user) => {
         if (user) {
           setUser(user); 
         } else {
           navigate("/"); 
         }
       });
   
       return () => unsubscribe(); 
     }, [navigate]);

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
        setAuctions(results);
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
        popup: 'success-swal-popup '
      }
    });
  } catch (err) {
    console.error("Delete failed:", err);
    Swal.fire('Error', 'Failed to delete auction.', 'error');
  }
};

  return (
    <div className="auction-list-container">
      {loading && (
        <div className="blur-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <aside className="sidebar2">
        <div className="logo"><img src={logo} alt="Logo" /></div>
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
          <div className="auction-grid">
            {auctions.map(auction => (
              <div className="auction-card" key={auction.id}>
                {auction.media?.[0] && (
                  <img
                    src={auction.media[0]}
                    alt={auction.title || "auction"}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' , borderRadius: '8px' }}
                  />
                )}

                <div className="auction-details">
                  <h3 >{auction.title}</h3>
                  <p>{auction.description}</p>
                  <p><strong>Start Price:</strong> ₹{auction.startPrice}</p>
                  <p><strong>Status:</strong> {auction.status}</p>

                  {auction.status !== 'live' && (
                    <div className="action-buttons">
                      <Link to={`/edit-auction/${auction.id}`} className="edit-link">✏️ Edit</Link>
                      <button onClick={() => handleDelete(auction.id)}>❌ Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SellerAuctions;