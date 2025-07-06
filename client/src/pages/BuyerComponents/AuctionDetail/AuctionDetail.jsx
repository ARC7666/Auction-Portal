import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase/firebaseConfig';
import { arrayUnion } from "firebase/firestore";
import { Link } from "react-router-dom";
import { MessageSquare, Share2, Gavel, Radio, Settings, User, LogOut, BellRing } from "lucide-react";
import './AuctionDetail.css';
import { useNavigate } from 'react-router-dom';
import LoaderScreen from '../../../components/LoaderScreen';

const AuctionDetails = () => {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuction = async () => {
      const docRef = doc(db, 'auctions', auctionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAuction({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchAuction();
  }, [auctionId]);

  useEffect(() => {
    if (!auction) return;

    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(auction.endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Auction Ended');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, [auction]);

  const handleBid = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate(`/login?redirect=/buyer-dashboard/auction/${auction.id}`);
      return;
    }

    if (bidAmount && parseFloat(bidAmount) > auction.currentBid) {
      const bidData = {
        userId: user.uid,
        amount: parseFloat(bidAmount),
        timestamp: new Date().toISOString(),
      };

      const docRef = doc(db, 'auctions', auction.id);

      await updateDoc(docRef, {
        currentBid: bidData.amount,
        bids: arrayUnion(bidData)
      });


      setAuction(prev => ({
        ...prev,
        currentBid: bidData.amount,
        bids: [...(prev.bids || []), bidData]
      }));

      setBidAmount('');

      setBidSuccess(true);
      setTimeout(() => setBidSuccess(false), 1500);
    }
  };

  const handleNextImage = () => {
    if (auction?.media && currentImage < auction.media.length - 1) {
      setCurrentImage(currentImage + 1);
    }
  };

  const handlePrevImage = () => {
    if (auction?.media && currentImage > 0) {
      setCurrentImage(currentImage - 1);
    }
  };


const shareAuction = async () => {
  const url = `${window.location.origin}/buyer-dashboard/auction/${auction.id}`;

  // Native share support (for mobile or modern browsers)
  if (navigator.share) {
    try {
      await navigator.share({
        title: auction.title || "Auctania Auction",
        text: "Check out this auction on Auctania!",
        url,
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  } else {
    // Desktop fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      
      // SweetAlert confirmation for user feedback
      import('sweetalert2').then(Swal => {
        Swal.default.fire({
          icon: 'success',
          title: 'Link copied!',
          text: 'Paste it anywhere to share.',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      });

    } catch (err) {
      console.error("Clipboard copy failed:", err);
      alert("Copy failed. Please copy manually.");
    }
  }
};

  const now = new Date();
  const start = new Date(auction?.startTime);
  const end = new Date(auction?.endTime);
  const status = now < start ? 'notStarted' : now > end ? 'ended' : 'live';


  if (!auction) return <p>No auction found.</p>;

  return (
    <div className="auction-detail-page">
      <div className="auction-detail-container">
        <div className="auction-gallery">
          {auction.media && auction.media.length > 0 ? (
            <div className="carousel-wrapper">
              {auction.media.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Auction ${index}`}
                  className={`auction-main-img ${index === currentImage ? 'visible' : 'hidden'}`}
                />
              ))}

              <button
                className="carousel-btn left"
                onClick={handlePrevImage}
                disabled={currentImage === 0}
              >
                ◀
              </button>
              <button
                className="carousel-btn right"
                onClick={handleNextImage}
                disabled={currentImage === auction.media.length - 1}
              >
                ▶
              </button>

              <div className="dot-container">
                {auction.media.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentImage ? 'active' : ''}`}
                    onClick={() => setCurrentImage(index)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#777' }}>
              <p>No images available</p>
            </div>
          )}
        </div>

        <div className="auction-details">
          <h2>{auction.title}</h2>
          <p className="auction-description">{auction.description}</p>

          {bidSuccess && <div className="bid-success-msg">✅ Your bid was placed!</div>}

          {status === 'live' && (
            <div className="bidding-section">
              <p className="current-bid">Current Bid: ₹{auction.currentBid}</p>
              <p className="countdown">Time Left: {timeLeft}</p>
              <input
                type="number"
                value={bidAmount}
                className="bid-input"
                onChange={e => setBidAmount(e.target.value)}
                placeholder="Enter your bid"
              />
              <button onClick={handleBid} className="bid-now-btn">Bid Now</button>
            </div>
          )}


          <button
            className="chat-btn-buyer"
            onClick={() => {
              const user = auth.currentUser;
              if (!user) {
                navigate(`/login?redirect=/buyer-dashboard/auction/${auction.id}`);
              } else {
                navigate(`/buyer-dashboard/chat/${auction.id}`);
              }
            }}
          >
            <MessageSquare className="nav-icon" />
            <span>Chat</span>
          </button>
          <button
            className="chat-btn-buyer"
            onClick={shareAuction}
          >
            <Share2 className="nav-icon" />
            <span>Share</span>
          </button>


          {status === 'notStarted' && (
            <button className="bid-status-btn" disabled>Not Started</button>
          )}

          {status === 'ended' && (
            <>
              <p className="countdown">Auction Ended</p>
              <button className="bid-status-btn" disabled>Ended</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;