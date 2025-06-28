// SellerAnalytics.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SellerAnalytics.css';

function SellerAnalytics() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="analytics-karlo">
      <img
        src="https://img.freepik.com/free-vector/flat-construction-template_23-2147745724.jpg"
        alt="Coming Soon"
        className="analytics-image"
      />
      <button className="dabao" onClick={handleBack}>
        Take Me Back
      </button>
    </div>
  );
}

export default SellerAnalytics;