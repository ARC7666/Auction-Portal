import React from 'react';
import './loader-screen.css';
import { logoblack as logo } from '../assets'; 

const LoaderScreen = () => {
  return (
    <div className="loader-container">
      <img src={logo} alt="Logo" className="loader-logo" />
      <div className="apple-spinner"></div>
      <p className="loader-text">Setting up your dashboard...</p>
    </div>
  );
};

export default LoaderScreen;