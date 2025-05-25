import React from 'react';
import './ProjectSummaryCards.css';

const ProjectSummaryCards = ({ summary }) => {
  const {
    activeProjects = 0,
    postedProjects = 0,
    pendingBids = 0,
    completedProjects = 0
  } = summary || {};

  return (
    <div className="summary-cards">
      <div className="card active">
        <h3>✅ Active Projects</h3>
        <p>{activeProjects}</p>
      </div>
      <div className="card posted">
        <h3>📤 Posted Projects</h3>
        <p>{postedProjects}</p>
      </div>
      <div className="card pending">
        <h3>⏳ Pending Bids</h3>
        <p>{pendingBids}</p>
      </div>
      <div className="card completed">
        <h3>📦 Completed Projects</h3>
        <p>{completedProjects}</p>
      </div>
    </div>
  );
};

export default ProjectSummaryCards;
