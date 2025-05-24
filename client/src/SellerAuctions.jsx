import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
//import './seller-auctions.css';

function SellerAuctions() {
  const [auctions, setAuctions] = useState([]);

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

  return (
    <div className="auction-list-container">
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SellerAuctions;