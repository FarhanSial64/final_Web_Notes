import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeBanner.css';

const WelcomeBanner = ({ clientName = 'Client' }) => {
  const navigate = useNavigate();

  const handlePostProject = () => {
    navigate('/client/create-project');
  };

  return (
    <div className="welcome-banner">
      <div className="welcome-text">
        <h1>Welcome back, {clientName}!</h1>
        <p>Ready to post your next project?</p>
      </div>
      <button
        className="post-project-btn"
        onClick={handlePostProject}
      >
        Post a New Project
      </button>
    </div>
  );
};

export default WelcomeBanner;
