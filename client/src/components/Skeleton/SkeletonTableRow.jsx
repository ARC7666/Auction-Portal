import React from 'react';
import './skeleton.css';

function SkeletonTableRow() {
  return (
    <div className="skeleton-table-row">
      <div className="skeleton-pulse skeleton-cell image"></div>
      <div className="skeleton-pulse skeleton-cell text-long"></div>
      <div className="skeleton-pulse skeleton-cell text-short"></div>
      <div className="skeleton-pulse skeleton-cell text-medium"></div>
      <div className="skeleton-pulse skeleton-cell text-short"></div>
      <div className="skeleton-pulse skeleton-cell text-short"></div>
    </div>
  );
}

export default SkeletonTableRow;
