import React from 'react';
import { Link } from 'react-router-dom';
import './FreelancerSidebar.css';

const FreelancerSidebar = () => {
  return (
    <aside className="freelancer-sidebar">
      <h2>Freelancer Panel</h2>
      <nav>
        <ul>
          <li><Link to="/freelancer/home">Dashboard</Link></li>
          <li><Link to="/freelancer/bids">My Bids</Link></li>
          <li><Link to="/freelancer/projects">Active Projects</Link></li>
          <li><Link to="/freelancer/notifications">Notifications</Link></li>
          <li><Link to="/freelancer/profile-settings">Profile Settings</Link></li>
          <li><Link to="/freelancer/find-project">Find New Projects</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default FreelancerSidebar;
