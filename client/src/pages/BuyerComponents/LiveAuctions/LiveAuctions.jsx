// LiveAuctions.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import ListingCard from "../../../components/ListingCard";
import "./LiveAuctions.css";


const LiveAuctions = () => {
  const [liveListings, setLiveListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveAuctions = async () => {
      try {
        const snapshot = await getDocs(collection(db, "auctions"));
        const now = new Date();

        const live = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((listing) => {
            const start = new Date(listing.startTime);
            const end = new Date(listing.endTime);
            return start <= now && now <= end;
          });

        setLiveListings(live);
      } catch (err) {
        console.error("Error fetching live auctions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveAuctions();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      {loading ? (
        <p>Loading...</p>
      ) : liveListings.length === 0 ? (
        <p>No live auctions currently.</p>
      ) : (
        <div className="live-auctions-grid">
          {liveListings.map((listing, index)=> (
              <div
               key={listing.id}
               className="animated-card-live-auction"
                 style={{ animationDelay: `${index * 100}ms` }}
              >
            <ListingCard key={listing.id} listing={listing} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveAuctions;