import React from 'react';
import { Link } from 'react-router-dom';
import './unauthorized.css';

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="glitch-wrapper">
        <h1 className="glitch" data-text="403">403</h1>
        <p className="glitch-subtext" data-text="Page Not Found">Access Denied</p>
      </div>
      <Link to="/" className="back-home-btn">
        Go Back Home
      </Link>
    </div>
  );
}