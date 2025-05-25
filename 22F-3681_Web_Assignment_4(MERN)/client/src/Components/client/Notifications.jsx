import React from 'react';
import './Notifications.css';

const Notifications = ({ notifications }) => {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      {safeNotifications.length > 0 ? (
        <ul>
          {safeNotifications.map((notification, index) => (
            <li key={index} className={`notification ${notification.type}`}>
              <span className="notification-title">{notification.title}</span>
              <p className="notification-message">{notification.message}</p>
              <span className="notification-time">{notification.time}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No notifications available.</p>
      )}
    </div>
  );
};

export default Notifications;
