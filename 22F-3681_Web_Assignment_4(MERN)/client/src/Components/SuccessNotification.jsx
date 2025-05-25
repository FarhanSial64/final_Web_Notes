import React, { useEffect, useRef } from 'react';
import './SuccessNotification.css';

const SuccessNotification = ({ message, onClose }) => {
  const progressRef = useRef(null);
  
  useEffect(() => {
    // Start the progress bar animation
    progressRef.current.style.animation = 'progress 5s linear forwards';
    
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="success-notification">
      <div className="notification-content">
        <div className="notification-header">
          <h4>Success!</h4>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <p>{message}</p>
        <div className="progress-bar" ref={progressRef}></div>
      </div>
    </div>
  );
};

export default SuccessNotification;