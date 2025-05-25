import React from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickActions.css';

const QuickActions = () => {
  const navigate = useNavigate();

  const handlePostProject = () => {
    navigate('/client/post-project');
  };

  const handleInviteFreelancers = () => {
    navigate('/client/invite-freelancers');
  };

  const handleBrowseFreelancers = () => {
    navigate('/client/browse-freelancers');
  };

  const handleViewInvoices = () => {
    navigate('/client/invoices');
  };

  return (
    <div className="quick-actions">
      <h2>Quick Actions</h2>
      <div className="action-buttons">
        <button
          className="action-btn"
          onClick={handlePostProject}
        >
          📌 Post New Project
        </button>
        <button
          className="action-btn"
          onClick={handleInviteFreelancers}
        >
          👥 Invite Freelancers
        </button>
        <button
          className="action-btn"
          onClick={handleBrowseFreelancers}
        >
          💼 Browse Freelancers
        </button>
        <button
          className="action-btn"
          onClick={handleViewInvoices}
        >
          🧾 View Invoices
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
