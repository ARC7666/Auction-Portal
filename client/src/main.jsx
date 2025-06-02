import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Vite doesn't generate reportWebVitals by default, so you can remove that part if you don't need it

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);