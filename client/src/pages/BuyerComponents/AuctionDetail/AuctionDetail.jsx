import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";
import ChatBox from '../../chats/ChatBox';

function AuctionDetails() {
  const { id } = useParams(); // auction ID from URL
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  // Fetch auction
  useEffect(() => {
    const fetchAuction = async () => {
      const docRef = doc(db, "auctions", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAuction({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("Auction not found.");
      }
    };
    fetchAuction();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!auction) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(auction.endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Auction Ended");
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  // Place Bid
  const placeBid = async () => {
    if (!bidAmount) return alert("Please enter a bid amount.");
    const bid = parseFloat(bidAmount);
    if (isNaN(bid)) return alert("Invalid bid.");

    const auctionRef = doc(db, "auctions", id);
    const auctionSnap = await getDoc(auctionRef);

    if (!auctionSnap.exists()) return alert("Auction not found.");
    const auctionData = auctionSnap.data();

    const now = new Date();
    if (now > new Date(auctionData.endTime)) return alert("Auction already ended.");
    if (bid <= auctionData.currentBid) return alert("Bid must be higher!");

    const newBid = {
      amount: bid,
      bidderId: auth.currentUser.uid,
      timestamp: new Date().toISOString(),
    };

    const updatedBids = [...auctionData.bids, newBid];

    await updateDoc(auctionRef, {
      currentBid: bid,
      bids: updatedBids,
    });

    alert("Bid placed!");
    setBidAmount(""); // clear input
    setAuction({ ...auctionData, currentBid: bid, bids: updatedBids });
  };
return auction ? (
  <div className="auction-details">
    <h2>{auction.title}</h2>
    <p>{auction.description}</p>
    <p>Start Price: ₹{auction.startPrice}</p>
    <p>Current Bid: ₹{auction.currentBid}</p>
    <p>Ends In: {timeLeft}</p>

    <input
      type="number"
      placeholder="Enter bid amount"
      value={bidAmount}
      onChange={(e) => setBidAmount(e.target.value)}
    />
    <button onClick={placeBid}>Place Bid</button>

    {/* 🟢 ChatBox Component */}
    <div style={{ marginTop: '2rem' }}>
      <h3>Chat About This Auction</h3>
      <ChatBox auctionId={auction.id} user={auth.currentUser} />
    </div>
  </div>
) : (
  <p>Loading auction...</p>
);
}

export default AuctionDetails;