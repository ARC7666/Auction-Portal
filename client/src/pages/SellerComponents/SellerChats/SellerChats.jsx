import React, { useEffect, useState } from 'react';
import { auth, db } from '../../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './SellerChats.css';

function SellerChats() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collection(db, 'auctions'), where('sellerId', '==', user.uid));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setListings(data);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p className="seller-chat-msg">Loading chats...</p>;

  return (
    <div className="dashboard-content">
      {listings.length === 0 ? (
        <p className="seller-chat-msg">No auctions found.</p>
      ) : (
       <div className="my-bids-table-scroll">
        <div className="seller-chat-table">
          <div className="seller-chat-header">
            <span>Thumbnail</span>
            <span>Title</span>
            <span>Current Bid</span>
            <span>Starting Bid</span>
            <span>Status</span>
            <span>Chat</span>
          </div>

          {listings.map((auction) => (

            <div className="seller-chat-row" key={auction.id}>
              <img
                src={auction.media?.[0] || "/placeholder.jpg"}
                alt={auction.title}
                className="seller-chat-thumbnail"
              />
              <div className="seller-chat-cell">
                <p className="label">Title</p>
                <p>{auction.title || "N/A"}</p>
              </div>

              <div className="seller-chat-cell">
                <p className="label">Current Bid</p>
                <p>₹{auction.currentBid !== undefined ? auction.currentBid : "N/A"}</p>
              </div>

              <div className="seller-chat-cell">
                <p className="label">Starting Bid</p>
                <p>{auction.startPrice || "N/A"}</p>
              </div>

              <div className="seller-chat-cell">
                <p className="label">Status</p>
                <p>{auction.status || "N/A"}</p>
              </div>


              <div className="seller-chat-cell">
                <Link to={`/seller-dashboard-layout/chat/${auction.id}`} className="chat-link">
                  View Chat →
                </Link>
              </div>
            </div>

          ))}
        </div>
        </div>
      )}
    </div>
  );
}

export default SellerChats;