import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CalendarDays } from 'lucide-react';
import Swal from 'sweetalert2';
import './listing-card.css';

function ListingCard({ listing }) {
  const { title, media, currentBid, startTime, endTime, id } = listing;
  const [now, setNow] = useState(new Date());
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const start = new Date(startTime);
  const end = new Date(endTime);

  const isLive = now >= start && now <= end;
  const isUpcoming = now < start;
  const isEnded = now > end;

  const timeLeft = isUpcoming ? start - now : end - now;

  const countdown = () => {
    const t = timeLeft > 0 ? timeLeft : 0;
    const d = Math.floor(t / (1000 * 60 * 60 * 24));
    const h = Math.floor((t / (1000 * 60 * 60)) % 24);
    const m = Math.floor((t / (1000 * 60)) % 60);
    const s = Math.floor((t / 1000) % 60);
    return `${d > 0 ? d + 'd ' : ''}${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveReminder = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("Please login first");

      await addDoc(collection(db, "reminders"), {
        userId: user.uid,
        auctionId: id,
        title,
        startTime,
        endTime,
        createdAt: serverTimestamp()
      });

      await Swal.fire({
        icon: "success",
        title: "Reminder Added",
        text: "This auction has been saved to your calendar.",
        timer: 1800,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        timerProgressBar: true,
        background: "#fff",
        color: "#000"
      });
    } catch (err) {
      console.error("❌ Failed to save reminder", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not add reminder.",
        showConfirmButton: true,
      });
    }
  };

  const badgeText = isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'ENDED';
  const badgeClass = isLive ? 'live' : isUpcoming ? 'upcoming' : 'ended';

  return (
    <div className="listing-card">
      <div className={`listing-image-wrapper ${imgLoaded ? '' : 'loading'}`}>
        <div className={`badge ${badgeClass}`}>{badgeText}</div>
        <Link to={`/buyer-dashboard/auction/${listing.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          <img 
            src={media?.[0]} 
            alt={title} 
            className={`listing-image ${imgLoaded ? 'loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
          />
        </Link>
      </div>

      <div className="listing-details">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 className="listing-title" title={title} style={{ margin: 0 }}>{title}</h3>
          <div className="tooltip-wrapper" style={{ flexShrink: 0, marginLeft: '8px' }}>
            <button
              className="calendar-icon-btn"
              onClick={handleSaveReminder}
              style={{ width: '24px', height: '24px' }}
            >
              <CalendarDays size={18} />
            </button>
            <span className="tooltip-text">Add to Calendar</span>
          </div>
        </div>
        
        <div className="listing-price-row">
          <span className="price-label">Current Bid</span>
          <span className="price-value">
            ₹{currentBid?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className={`countdown-inline ${badgeClass}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span className="countdown-text">
            {isLive ? 'Ends in: ' : isUpcoming ? 'Starts in: ' : 'Ended'}
          </span>
          <span className="countdown-timer">{countdown()}</span>
        </div>
      </div>

      <div className="card-actions">
        <Link to={`/buyer-dashboard/auction/${listing.id}`} className="full-width-link">
          <button
            className={`bid-now-btn ${isLive ? 'live-btn' : 'disabled-btn'}`}
            disabled={!isLive}
          >
            {isLive ? 'Bid Now' : isUpcoming ? 'Not Started' : 'Ended'}
          </button>
        </Link>
      </div>
    </div>
  );
}

export default ListingCard;