import React from 'react';
import './skeleton.css';

function SkeletonCard() {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-pulse skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-pulse skeleton-title"></div>
        <div className="skeleton-pulse skeleton-price" style={{ marginTop: '12px' }}></div>
        <div className="skeleton-pulse skeleton-timer" style={{ marginTop: '8px' }}></div>
        <div className="skeleton-pulse skeleton-button"></div>
      </div>
    </div>
  );
}

export default SkeletonCard;
