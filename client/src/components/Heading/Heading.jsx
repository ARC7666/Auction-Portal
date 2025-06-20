import React from 'react';
import './heading.css'; 

const Heading = ({ title, subtitle, center }) => {
  return (
    <div className={`custom-heading ${center ? "center" : ""}`}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};

export default Heading;