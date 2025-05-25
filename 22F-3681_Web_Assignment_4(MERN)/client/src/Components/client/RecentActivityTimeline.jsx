import React from 'react';
import './RecentActivityTimeline.css';

const RecentActivityTimeline = ({ activities }) => {
  const safeActivities = Array.isArray(activities) ? activities : []; // Fallback to an empty array

  return (
    <div className="activity-timeline">
      <h2>Recent Activity</h2>
      <ul className="timeline-list">
        {safeActivities.length > 0 ? (
          safeActivities.map((activity, index) => (
            <li key={index} className="timeline-item">
              <div className="activity-icon">📌</div>
              <div className="activity-content">
                <p className="activity-text">{activity.description}</p>
                <span className="activity-date">{activity.timestamp}</span>
              </div>
            </li>
          ))
        ) : (
          <p>No recent activities to show.</p> // Fallback message if no activities
        )}
      </ul>
    </div>
  );
};

export default RecentActivityTimeline;
