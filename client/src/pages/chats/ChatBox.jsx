import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const BuyerChatList = ({ user }) => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchUpcomingAuctions = async () => {
      try {
        const nowISO = new Date().toISOString();

        const q = query(
          collection(db, "auctions"),
          where("endTime", ">", nowISO)
        );

        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setAuctions(list);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      }
    };
    fetchUpcomingAuctions();
  }, []);

  if (auctions.length === 0) return <p>No upcoming auctions.</p>;

  return (
    <div>
      <h2>Upcoming Auctions</h2>
      {auctions.map((auction) => (
        <div key={auction.id} style={{ marginBottom: "1rem" }}>
          <h3>{auction.title}</h3>
          <p>{auction.description}</p>
          <button onClick={() => {/* open chat UI with seller */}}>
            Chat Now
          </button>
        </div>
      ))}
    </div>
  );
};

export default BuyerChatList;