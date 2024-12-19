// CustomAlert.js
import React from 'react';
import './CustomAlert.css';

const CustomAlert = ({ message, onClose, type }) => {
  return (
    <div className={`alert-container ${type}`}>
      <div className="alert-content">
        <p>{message}</p>
        <button onClick={onClose} className="close-button">OK</button>
      </div>
    </div>
  );
};

export default CustomAlert;
