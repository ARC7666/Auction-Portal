import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CalendarDays } from 'lucide-react';
import Swal from 'sweetalert2';
import DescriptionPopover from './DescriptionPopover';
import './listing-card.css';

function ListingCard({ listing }) {
  const { title, media, currentBid, startTime, endTime, description, id } = listing;
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


 const [anchorRect, setAnchorRect] = useState(null);
const descBtnRef = useRef();

const toggleDesc = () => {
  if (descOpen) {
    setDescOpen(false);
    setAnchorRect(null);
  } else {
    const rect = descBtnRef.current.getBoundingClientRect();
    setAnchorRect(rect);
    setDescOpen(true);
  }
};

useEffect(() => {
  const closeOnClickOrScroll = (e) => {
    if (!descBtnRef.current?.contains(e.target)) {
      setDescOpen(false);
      setAnchorRect(null);
    }
  };

  const closeOnScroll = () => {
    setDescOpen(false);
    setAnchorRect(null);
  };

  document.addEventListener('mousedown', closeOnClickOrScroll);
  window.addEventListener('scroll', closeOnScroll, true); 

  return () => {
    document.removeEventListener('mousedown', closeOnClickOrScroll);
    window.removeEventListener('scroll', closeOnScroll, true);
  };
}, []);
 

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
        <div className={`badge ${badgeClass}`}>{badgeText}</div>
        <img src={media?.[0]} alt={title} className="listing-image" />
        <div className="listing-details">
          <h3>{title}</h3>
          <hr className="listing-card-divider-up" />
          <p className="desc">Current Bid: ₹{currentBid?.toFixed(2)}</p>
          <p
            style={{ fontSize: '0.85rem', color: isLive ? 'green' : isUpcoming ? 'orange' : 'red', marginTop: '-85px' }}
          >
            {isLive ? '⏳ Ends in: ' : isUpcoming ? '🔜 Starts in: ' : '❌ Bidding ended'} {countdown()}
          </p>
          <hr className="listing-card-divider-down" />
          {description && (
            <div className="desc-popover-wrapper">
              <button
                className="desc-toggle-btn"
                onClick={toggleDesc}
                ref={descBtnRef}
                aria-expanded={descOpen}
              >
                {descOpen ? (
                  <>Hide  Description <span className="desc-icon">▲</span></>
                ) : (
                  <>Show Description <span className="desc-icon">▼</span></>
                )}
              </button>
            </div>
          )}

          {descOpen && (
            <DescriptionPopover
              anchorRect={anchorRect}
              description={description}
              onClose={() => setDescOpen(false)}
            />
          )}
          <div className="card-actions">
            <Link to={`/buyer-dashboard/auction/${listing.id}`}>
              <button
                className="bid-now"
                disabled={!isLive}
                style={{
                  backgroundColor: isLive ? '#4CAF50' : '#ccc',
                  cursor: isLive ? 'pointer' : 'not-allowed',
                }}
              >
                {isLive ? 'Bid Now' : isUpcoming ? 'Not Started' : 'Ended'}
              </button>
            </Link>

            <div className="tooltip-wrapper">
              <button
                className="calendar-icon"
                onClick={handleSaveReminder}
                style={{
                  marginLeft: "auto",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <CalendarDays size={22} />
              </button>
              <span className="tooltip-text">Add Reminder</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default ListingCard;