import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import './AuctionDetail.css';

const AuctionDetails = () => {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

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
    if (bidAmount && parseFloat(bidAmount) > auction.currentBid) {
      const docRef = doc(db, 'auctions', auction.id);
      await updateDoc(docRef, { currentBid: parseFloat(bidAmount) });
      setAuction(prev => ({ ...prev, currentBid: parseFloat(bidAmount) }));
      setBidAmount('');
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

  const now = new Date();
  const start = new Date(auction?.startTime);
  const end = new Date(auction?.endTime);
  const status = now < start ? 'notStarted' : now > end ? 'ended' : 'live';

  if (loading) return <p>Loading...</p>;
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

          {status === 'live' && (
            <div className="bidding-section">
              <p className="current-bid">Current Bid: ₹{auction.currentBid}</p>
              <p className="countdown">Time Left: {timeLeft}</p>
              <input
                type="number"
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                placeholder="Enter your bid"
              />
              <button onClick={handleBid} className="bid-now-btn">Bid Now</button>
            </div>
          )}

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