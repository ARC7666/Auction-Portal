import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './listing-card.css';

function ListingCard({ listing }) {
  const { title, media, currentBid, startTime, endTime, description } = listing;
  const [now, setNow] = useState(new Date());
  const [descOpen, setDescOpen] = useState(false);

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

  // Badge text & classes based on auction status
  const badgeText = isLive ? "LIVE" : isUpcoming ? "UPCOMING" : "ENDED";
  const badgeClass = isLive ? "live" : isUpcoming ? "upcoming" : "ended";

  return (
    <div className="listing-card">
      {/* Badge */}
      <div className={`badge ${badgeClass}`}>
        {badgeText}
      </div>

      <img src={media?.[0]} alt={title} className="listing-image" />
      <div className="listing-details">
        <h3>{title}</h3>

         <hr className="listing-card-divider-up" />

        {/* Current Bid */}
        <p className="desc">Current Bid: ₹{currentBid?.toFixed(2)}</p>

        {/* Countdown Text */}
        <p style={{ fontSize: "0.85rem", color: isLive ? "green" : isUpcoming ? "orange" : "red" }}>
          {isLive ? "⏳ Ends in: " : isUpcoming ? "🔜 Starts in: " : "❌ Bidding ended"} {countdown()}
        </p>
         <hr className="listing-card-divider-down" />

        {/* Description toggle button */}
        {description && (
          <>
            <button
              className="desc-toggle-btn"
              onClick={() => setDescOpen(!descOpen)}
              aria-expanded={descOpen}
            >
              {descOpen ? "Hide Description ▲" : "Show Description ▼"}
            </button>

            <div className={`desc-content ${descOpen ? "open" : ""}`}>
              {description}
            </div>
          </>
        )}

        <Link to={`/buyer-dashboard/auction/${listing.id}`}>
          <button
            className="bid-now"
            disabled={!isLive}
            style={{
              backgroundColor: isLive ? "#4CAF50" : "#ccc",
              cursor: isLive ? "pointer" : "not-allowed",
            }}
          >
            {isLive ? "Bid Now" : isUpcoming ? "Not Started" : "Ended"}
          </button>
        </Link>
      </div>
    </div>
  );
}

export default ListingCard;