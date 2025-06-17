import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import "./MyBids.css";

const MyBids = () => {
  const [userBids, setUserBids] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBids = async () => {
      onAuthStateChanged(auth, async (user) => {
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
      });
    };

    fetchMyBids();
  }, []);

  return (
    <div className="my-bids-wrapper">
      <h2 className="my-bids-heading">Your Bids</h2>

      {loading ? (
        <p className="my-bids-loading">Loading your bids...</p>
      ) : userBids.length === 0 ? (
        <p className="my-bids-empty">You haven’t placed a bid on any auction yet.</p>
      ) : (
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
                  {isWinner ? (
                    <>
                      <p className="status won">Won</p>
                      <Link to={`/payment/${item.id}`} className="payment-link">
                         Make Payment →
                         </Link>
                    </>
                  ) : (
                    <p className={`status ${status.toLowerCase().replace(" ", "-")}`}>{status}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBids;
