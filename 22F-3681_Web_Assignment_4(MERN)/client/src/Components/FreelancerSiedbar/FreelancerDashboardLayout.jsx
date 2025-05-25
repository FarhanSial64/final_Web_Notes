import React from 'react';
import { Outlet } from 'react-router-dom';
import FreelancerSidebar from './FreelancerSidebar';
import './FreelancerDashboardLayout.css';

const FreelancerDashboardLayout = () => {
  return (
    <div className="freelancer-dashboard-container">
      <FreelancerSidebar />
      <main className="freelancer-dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};

export default FreelancerDashboardLayout;
