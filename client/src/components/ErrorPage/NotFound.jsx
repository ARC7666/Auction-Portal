import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="glitch-wrapper">
        <h1 className="glitch" data-text="404">404</h1>
        <p className="glitch-subtext" data-text="Page Not Found">Page Not Found</p>
      </div>
      <Link to="/" className="back-home-btn">
        Go Back Home
      </Link>
    </div>
  );
}