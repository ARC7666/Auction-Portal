import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  const { auctionId } = useParams();
  const [params] = useSearchParams();
  const uid = params.get("uid");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const markAsPaid = async () => {
      console.log("auctionId:", auctionId);
      console.log(" uid:", uid);

      if (!auctionId || !uid) {
        console.error("❌ Missing auctionId or uid, redirecting...");
        navigate("/buyer-dashboard/my-bids");
        return;
      }

      try {
        await updateDoc(doc(db, "auctions", auctionId), {
          paymentStatus: "paid",
          buyerId: uid,
          status: "sold",
          paymentSubmittedAt: new Date(),
        });

        console.log("✅ Payment status updated in Firestore for:", auctionId);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("❌ Firestore update failed:", error);
      }
    };

    markAsPaid();
  }, [auctionId, uid, navigate]);

  if (loading) return <p className="payment-status-msg">🔄 Finalizing your payment...</p>;

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <h2>🎉 Payment Successful!</h2>
        <p>Your bid has been secured. Thank you for shopping with Auctania!</p>
        <Link className="continue-btn" to="/buyer-dashboard/my-bids">
          Continue to My Bids →
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;