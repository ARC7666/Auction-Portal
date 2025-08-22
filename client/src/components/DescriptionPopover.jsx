import React from 'react';
import ReactDOM from 'react-dom';

function DescriptionPopover({ anchorRect, onClose, description }) {
  if (!anchorRect) return null;

  const style = {
    position: 'fixed',
    top: anchorRect.bottom + 8,
    left: anchorRect.left,
    width: 240,
    zIndex: 9999,
    backgroundColor: '#fff',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
    fontSize: '0.85rem',
    lineHeight: 1.4,
  };

  const arrowStyle = {
    position: 'absolute',
    top: -8,
    left: 20,
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: '8px solid #fff',
    filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.05))',
  };

  return ReactDOM.createPortal(
    <div style={style}>
      <div style={arrowStyle} />
      <p>{description}</p>
    </div>,
    document.body
  );
}

export default DescriptionPopover;