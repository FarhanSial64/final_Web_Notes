// ClientNotifications.jsx
import React from 'react';
import ClientDashboardLayout from '../../Components/ClientSidebar/ClientDashboardLayout';
import './ClientNotifications.css';

const ClientNotifications = () => {
  return (
    <ClientDashboardLayout>
      <div className="client-notifications">
        <h2>Notifications</h2>
        <ul>
          <li>No new notifications.</li>
        </ul>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientNotifications;
