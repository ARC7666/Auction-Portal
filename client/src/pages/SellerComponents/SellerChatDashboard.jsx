import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SellerChatDashboard = ({ user }) => {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerAuctions = async () => {
      const q = query(
        collection(db, "auctions"),
        where("sellerId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAuctions(list);
    };

    fetchSellerAuctions();
  }, [user.uid]);

  return (
    <div>
      <h2>Your Auctions (Seller)</h2>
      {auctions.length === 0 ? (
        <p>No auctions found where you are seller.</p>
      ) : (
        auctions.map(auction => (
          <div key={auction.id} style={{border: '1px solid #ddd', margin: '10px', padding: '10px'}}>
            <h3>{auction.title || "Untitled Auction"}</h3>
            <button onClick={() => navigate(`/chat/${auction.id}`)}>Open Chat</button>
          </div>
        ))
      )}
    </div>
  );
};

export default SellerChatDashboard;