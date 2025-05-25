import React from 'react';

const SessionRequestCard = ({ session, onAccept, onDecline }) => {
  return (
    <div className="session-request-card">
      <p><strong>Student:</strong> {session.student?.username || 'N/A'}</p>
      <p><strong>Subject:</strong> {session.subject}</p>
      <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> {session.time}</p>
      <p><strong>Type:</strong> {session.sessionType}</p>
      <button className="accept-button" onClick={onAccept}>Accept</button>
      <button className="decline-button" onClick={onDecline}>Decline</button>
    </div>
  );
};

export default SessionRequestCard;