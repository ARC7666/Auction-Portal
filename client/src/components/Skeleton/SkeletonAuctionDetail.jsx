import React from 'react';
import './skeleton.css';

function SkeletonAuctionDetail() {
  return (
    <div className="auction-detail-page" style={{ padding: '2rem' }}>
      <div className="auction-detail-container" style={{ display: 'flex', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="auction-gallery" style={{ flex: '1', maxWidth: '600px' }}>
          <div className="skeleton-pulse" style={{ width: '100%', height: '400px', borderRadius: '16px' }}></div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
            <div className="skeleton-pulse" style={{ width: '10px', height: '10px', borderRadius: '50%' }}></div>
            <div className="skeleton-pulse" style={{ width: '10px', height: '10px', borderRadius: '50%' }}></div>
            <div className="skeleton-pulse" style={{ width: '10px', height: '10px', borderRadius: '50%' }}></div>
          </div>
        </div>

        <div className="auction-details" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton-pulse" style={{ width: '80%', height: '40px', borderRadius: '8px' }}></div>
          <div className="skeleton-pulse" style={{ width: '100%', height: '80px', borderRadius: '8px' }}></div>
          
          <div className="skeleton-pulse" style={{ width: '50%', height: '30px', borderRadius: '4px', marginTop: '20px' }}></div>
          <div className="skeleton-pulse" style={{ width: '40%', height: '20px', borderRadius: '4px' }}></div>
          
          <div className="skeleton-pulse" style={{ width: '100%', height: '50px', borderRadius: '12px', marginTop: '10px' }}></div>
          <div className="skeleton-pulse" style={{ width: '100%', height: '50px', borderRadius: '12px' }}></div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonAuctionDetail;
