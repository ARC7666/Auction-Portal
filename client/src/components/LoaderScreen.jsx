import React from 'react';
import './loader-screen.css';
import { logo } from '../assets'; 

const LoaderScreen = () => {
  return (
    <div className="loader-container">
      <img src={logo} alt="Logo" className="loader-logo" />
      <div className="cube-loader">
  <div className="cube"></div>
  <div className="cube"></div>
  <div className="cube"></div>
  <div className="cube"></div>
</div>
      <p className="loader-text">Setting up your dashboard...</p>
    </div>
  );
};

export default LoaderScreen;