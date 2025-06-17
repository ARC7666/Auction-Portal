import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import payment1 from "../../../assets/images/payment1.jpg";
import "./PaymentPage.css";

const PaymentPage = () => {
  const { auctionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [auction, setAuction] = useState(null);
  const [user, setUser] = useState(null);
  const [isWinner, setIsWinner] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return navigate("/unauthorized");
      setUser(currentUser);

      const auctionRef = doc(db, "auctions", auctionId);
      const auctionSnap = await getDoc(auctionRef);

      if (!auctionSnap.exists()) {
        setError("Auction not found.");
        return;
      }

      const auctionData = auctionSnap.data();
      setAuction(auctionData);

      if (auctionData.status !== "ended") {
        setError("Auction has not ended yet.");
        return;
      }

      const sortedBids = [...(auctionData.bids || [])].sort((a, b) => b.amount - a.amount);

      if (sortedBids[0]?.userId !== currentUser.uid) {
        setError("You are not the winning bidder for this auction.");
        return;
      }

      setIsWinner(true);
      setLoading(false);
    });
  }, [auctionId, navigate]);

  const handleFakePayment = async () => {
    if (!auction) return;

    await updateDoc(doc(db, "auctions", auctionId), {
      paymentStatus: "paid",
    });

    alert("✅ Payment successful! Thank you.");
    navigate("/buyer-dashboard/my-bids");
  };

  if (loading) return <p className="payment-msg">Loading payment details...</p>;
  if (error) return <p className="payment-error">❌ {error}</p>;

  return (
    <div className="payment-backTheme">
      <div className="paymentBox">
        <div className="paymentIllustration">
          <img src={payment1} alt="illustration" className="payment-image" />
        </div>

        <div className="paymentContent">
          <div className="payment-titleText">
            <h2>Payment details</h2>
          </div>

          <div className="payment-methods">
                      <button className="payment-Button">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Google_Favicon_2025.svg"
              alt="google-logo"
              className="googleLogo"
            />
            Google
          </button>
         
          <button className="payment-Button">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt="apple-logo"
              className="AppleLogo"
            />
            Apple
          </button>
          <button className="payment-Button">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/248px-PayPal.svg.png"
              alt="paypal-logo"
              className="paypalLogo"
            />
            
          </button>
          </div>

          <div className="payment-divider">
            <hr /><span> Or </span><hr />
          </div>

          <form className="payment-form" onSubmit={(e) => { e.preventDefault(); handleFakePayment(); }}>
            <div>
              <label>Card Number *</label>
              <input type="text" placeholder="1234 5678 9012 3456" required />
            </div>

            <div>
              <label>Cardholder Name *</label>
              <input type="text" placeholder="Your Name" required />
            </div>

            <div className="payment-row">
              <div>
                <label>Expiry Date *</label>
                <input type="text" placeholder="MM/YY" required />
              </div>
              <div>
                <label>CVV *</label>
                <input type="password" placeholder="xxx" required />
              </div>
            </div>

            <div className="payment-total">Total Amount: ₹{auction.currentBid}</div>

            <button type="submit" className="payment-submit">Pay ₹{auction.currentBid}</button>
          </form>


<p className="GoBack">
  Some Issues?{' '}
  <span className="link" onClick={() => navigate(-1)}>Go Back</span>
</p>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;