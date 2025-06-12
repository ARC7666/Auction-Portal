import React from 'react';
import { useNavigate } from 'react-router-dom';
import unauthorizedImg from '../assets/images/unauthorized.jpg';
import './unauthorized.css';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <img src={unauthorizedImg} alt="403 Access Denied" className="unauthorized-image" />
      <button onClick={() => navigate(-1)} className="minecraft-btn">
        Take Me Back
      </button>
    </div>
  );
}