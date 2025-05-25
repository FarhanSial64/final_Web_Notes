import React from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from '../ClientSidebar/ClientSidebar';
import './ClientDashboardLayout.css';

const ClientDashboardLayout = () => {
  return (
    <div className="dashboard-container">
      <ClientSidebar />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientDashboardLayout;
