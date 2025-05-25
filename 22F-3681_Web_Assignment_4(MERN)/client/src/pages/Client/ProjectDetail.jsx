// ProjectDetail.jsx
import React from 'react';
import ClientDashboardLayout from '../../Components/ClientSidebar/ClientDashboardLayout';
import './ProjectDetail.css';

const ProjectDetail = () => {
  return (
    <ClientDashboardLayout>
      <div className="project-detail">
        <h2>Project Title</h2>
        <p><strong>Description:</strong> Detailed project description here.</p>
        <p><strong>Budget:</strong> $500</p>
        <p><strong>Status:</strong> In Progress</p>
      </div>
    </ClientDashboardLayout>
  );
};

export default ProjectDetail;
