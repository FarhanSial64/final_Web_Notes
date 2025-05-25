import React from 'react';
import { Link } from 'react-router-dom';
import './ClientSidebar.css';

const ClientSidebar = () => {
  return (
    <aside className="client-sidebar">
      <h2>Client Panel</h2>
      <nav>
        <ul>
          <li><Link to="/client/home">Dashboard</Link></li>
          <li><Link to="/client/my-projects">My Projects</Link></li>
          <li><Link to="/client/create-project">Create Project</Link></li>
          <li><Link to="/client/notifications">Notifications</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default ClientSidebar;
