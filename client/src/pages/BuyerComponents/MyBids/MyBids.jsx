import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import "./MyBids.css";

const MyBids = () => {
  const [userBids, setUserBids] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});
  const stripePromise = loadStripe("pk_test_51RegLwRuwQBUbxUX0Cxwm5qV6X6BuIvOLssOUtf0Tnq5DatithtpTFlxWYRLS9mL3Iy75Mi7fJkrRqJHLWOKitF100MDenEND2");

  const initiateStripePayment = async (item, user) => {
    try {
      const res = await fetch("https://us-central1-auction-portal-in.cloudfunctions.net/createCheckoutSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: item.currentBid,
          auctionId: item.id,
          userId: user.uid,
          userEmail: user.email,
          auctionTitle: item.title,
        }),
      });

      const data = await res.json();
      if (data.id) {
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        alert("❌ Could not initiate payment session.");
      }
    } catch (err) {
      console.error("❌ Stripe payment error:", err);
      alert("Payment failed. Please try again.");
    }
  };

  useEffect(() => {
    const fetchMyBids = async () => {
      const user = auth.currentUser;
      if (!user) return;
      setCurrentUser(user);
      const uid = user.uid;

      const snapshot = await getDocs(collection(db, "auctions"));
      const filtered = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const hasUserBid = data?.bids?.some((bid) => bid.userId === uid);
        if (hasUserBid) {
          filtered.push({ id: doc.id, ...data });
        }
      });

      setUserBids(filtered);
      setLoading(false);
    };

    fetchMyBids();
  }, []);

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="my-bids-wrapper">
      {loading ? (
        <p className="my-bids-loading">Loading your bids...</p>
      ) : userBids.length === 0 ? (
        <p className="my-bids-empty">You haven’t placed a bid on any auction yet.</p>
      ) : (
        <div className="my-bids-table-scroll">
          <div className="my-bids-table">
            <div className="my-bids-table-header">
              <span>Thumbnail</span>
              <span>Title</span>
              <span>Current Bid</span>
              <span>Your Bid</span>
              <span>Start Price</span>
              <span>Status</span>
            </div>

            {userBids.map((item) => {
              const now = new Date();
              const start = new Date(item.startTime);
              const end = new Date(item.endTime);
              const userBid = item.bids?.find((bid) => bid.userId === currentUser?.uid);

              let status = "Ongoing";
              let isWinner = false;
              if (now < start) status = "Not Started";
              else if (now > end) {
                const highestBid = item.bids?.sort((a, b) => b.amount - a.amount)[0];
                isWinner = highestBid?.userId === currentUser?.uid;
                status = isWinner ? "Won" : "Lost";
              }

              return (
                <div className="my-bids-table-row" key={item.id}>
                  <img src={item.media[0]} alt={item.title} className="my-bid-thumbnail" />

                  <div className="my-bid-cell">
                    <h4 className="my-bid-title">{item.title}</h4>
                  </div>


                  <button
                    className="toggle-details-btn"
                    onClick={() => toggleExpand(item.id)}
                  >
                    {expandedItems[item.id] ? "Hide Details ↑" : "Show Details ↓"}
                  </button>

                  <div className={`expanded-details ${expandedItems[item.id] ? 'show' : ''}`}>
                    <div className="my-bid-cell">
                      <p className="label">Current</p>
                      <p>₹{item.currentBid}</p>
                    </div>

                    <div className="my-bid-cell">
                      <p className="label">Your Bid</p>
                      <p>₹{userBid?.amount || "--"}</p>
                    </div>

                    <div className="my-bid-cell">
                      <p className="label">Start</p>
                      <p>₹{item.startPrice}</p>
                    </div>

                    <div className="my-bid-cell">
                      <p className="label">Status</p>
                      {item.paymentStatus === "paid" ? (
                        <p className="status paid">Paid ✅</p>
                      ) : isWinner ? (
                        <>
                          <p className="status won">Won</p>
                          <button
                            className="payment-link-auctania"
                            onClick={() => initiateStripePayment(item, currentUser)}
                          >
                            Make Payment →
                          </button>
                        </>
                      ) : (
                        <div>
                        <p className={`status ${status.toLowerCase().replace(" ", "-")}`}>{status}</p>
                        {status === "Ongoing" && (
                        <button
                          className="go-to-auction-btn"
                          onClick={() => navigate(`/buyer-dashboard/auction/${item.id}`)}
                        >
                          Go to Auction →
                        </button>
                      )}
                
                    </div>
                      )}
                    </div>  
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBids;