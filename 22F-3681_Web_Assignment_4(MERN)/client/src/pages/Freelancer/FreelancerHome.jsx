import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './FreelancerHome.css';

const FreelancerHome = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState({
    current: 0,
    previous: 0,
    twoMonthsAgo: 0
  });

  // Helper function to normalize status values
  const normalizeStatus = useCallback((status) => {
    if (!status) return '';

    // Convert to lowercase and remove spaces/underscores
    const normalized = status.toLowerCase().replace(/[\s_]/g, '');

    // Map to standard values
    if (normalized === 'open') return 'open';
    if (normalized === 'inprogress') return 'in_progress';
    if (normalized === 'completed') return 'completed';
    if (normalized === 'cancelled') return 'cancelled';
    if (normalized === 'pending') return 'pending';

    // Default fallback
    return status.toLowerCase();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = useCallback((user) => {
    if (!user) return 0;

    const requiredFields = ['name', 'email', 'phone', 'skills', 'bio', 'hourlyRate'];
    let completedFields = 0;

    requiredFields.forEach(field => {
      if (user[field] && (typeof user[field] !== 'object' || user[field].length > 0)) {
        completedFields++;
      }
    });

    return Math.round((completedFields / requiredFields.length) * 100);
  }, []);

  // Calculate monthly earnings
  const calculateMonthlyEarnings = useCallback((projects) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const twoMonthsAgo = previousMonth === 0 ? 11 : previousMonth - 1;
    const currentYear = now.getFullYear();

    // Initialize earnings
    let earnings = {
      current: 0,
      previous: 0,
      twoMonthsAgo: 0
    };

    // Calculate earnings from completed projects
    projects.forEach(project => {
      if (normalizeStatus(project.status) === 'completed') {
        const completedDate = new Date(project.updatedAt || project.createdAt);
        const completedMonth = completedDate.getMonth();
        const completedYear = completedDate.getFullYear();

        if (completedMonth === currentMonth && completedYear === currentYear) {
          earnings.current += project.budget || 0;
        } else if (completedMonth === previousMonth &&
                  (completedYear === currentYear || (currentMonth === 0 && completedYear === currentYear - 1))) {
          earnings.previous += project.budget || 0;
        } else if (completedMonth === twoMonthsAgo &&
                  (completedYear === currentYear || (previousMonth === 0 && completedYear === currentYear - 1))) {
          earnings.twoMonthsAgo += project.budget || 0;
        }
      }
    });

    return earnings;
  }, [normalizeStatus]);

  // Fetch user data, projects, and bids
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication token not found');
          setIsLoading(false);
          return;
        }

        const [userResponse, projectsResponse, bidsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5005/api/projects', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5004/api/bids/my', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const userData = userResponse.data;
        const projectsData = projectsResponse.data;
        const bidsData = bidsResponse.data;

        console.log('User data:', userData);
        console.log('Projects data:', projectsData);
        console.log('Bids data:', bidsData);

        setUser(userData);
        setProjects(projectsData);
        setBids(bidsData);

        // Calculate profile completion
        const completion = calculateProfileCompletion(userData);
        setProfileCompletion(completion);

        // Calculate monthly earnings
        const earnings = calculateMonthlyEarnings(projectsData);
        setMonthlyEarnings(earnings);

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [calculateMonthlyEarnings, calculateProfileCompletion]);

  // Calculate statistics
  const activeProjectsCount = projects.filter(project => normalizeStatus(project.status) === 'in_progress').length;
  const completedProjectsCount = projects.filter(project => normalizeStatus(project.status) === 'completed').length;
  const totalEarnings = projects
    .filter(project => normalizeStatus(project.status) === 'completed')
    .reduce((total, project) => total + (project.budget || 0), 0);

  // Get recent bids (last 5)
  const recentBids = bids
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Loading state
  if (isLoading) {
    return (
      <div className="freelancer-home">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="freelancer-home">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="freelancer-home">
      <div className="welcome-banner">
        <h2>Welcome back, {user?.name || 'Freelancer'}!</h2>
        <p>Here's a quick snapshot of your freelancing journey.</p>
      </div>

      <div className="dashboard-section cards">
        <div className="card">
          <h3>Active Projects</h3>
          <p>{activeProjectsCount} ongoing</p>
        </div>
        <div className="card">
          <h3>Total Earnings</h3>
          <p>${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Completed Projects</h3>
          <p>{completedProjectsCount}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Recent Bids</h3>
        {recentBids.length > 0 ? (
          <table className="bids-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentBids.map(bid => {
                // Get project title
                const projectTitle = typeof bid.projectId === 'object'
                  ? bid.projectId.title
                  : projects.find(p => p._id === bid.projectId)?.title || 'Unknown Project';

                return (
                  <tr key={bid._id}>
                    <td>{projectTitle}</td>
                    <td>${bid.bidAmount}</td>
                    <td className={`bid-status-${bid.status}`}>
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </td>
                    <td>{formatDate(bid.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="no-data-message">You haven't placed any bids yet.</p>
        )}
      </div>

      <div className="dashboard-section messages-earnings-wrapper">
        <div className="notifications-panel">
          <h3>Recent Activity</h3>
          {projects.length > 0 || bids.length > 0 ? (
            <ul>
              {projects
                .filter(project => normalizeStatus(project.status) === 'in_progress')
                .slice(0, 2)
                .map(project => (
                  <li key={project._id}>
                    Project "{project.title}" is in progress
                  </li>
                ))
              }
              {bids
                .filter(bid => bid.status === 'pending')
                .slice(0, 2)
                .map(bid => {
                  const projectTitle = typeof bid.projectId === 'object'
                    ? bid.projectId.title
                    : projects.find(p => p._id === bid.projectId)?.title || 'Unknown Project';

                  return (
                    <li key={bid._id}>
                      Your bid on "{projectTitle}" is pending
                    </li>
                  );
                })
              }
              {bids
                .filter(bid => bid.counterOffer)
                .slice(0, 2)
                .map(bid => {
                  const projectTitle = typeof bid.projectId === 'object'
                    ? bid.projectId.title
                    : projects.find(p => p._id === bid.projectId)?.title || 'Unknown Project';

                  return (
                    <li key={`${bid._id}-counter`}>
                      You have a counter offer for "{projectTitle}"
                    </li>
                  );
                })
              }
            </ul>
          ) : (
            <p className="no-data-message">No recent activity to display.</p>
          )}
        </div>

        <div className="earnings-chart">
          <h3>Earnings (Last 3 Months)</h3>
          <div className="bar-chart">
            <div className="bar-container">
              <div
                className="bar"
                style={{
                  height: `${monthlyEarnings.twoMonthsAgo > 0
                    ? (monthlyEarnings.twoMonthsAgo / Math.max(monthlyEarnings.twoMonthsAgo, monthlyEarnings.previous, monthlyEarnings.current) * 100)
                    : 0}%`
                }}
                title={`2 Months Ago: $${monthlyEarnings.twoMonthsAgo.toFixed(2)}`}
              ></div>
              <span className="month-label">2 Mo Ago</span>
            </div>
            <div className="bar-container">
              <div
                className="bar"
                style={{
                  height: `${monthlyEarnings.previous > 0
                    ? (monthlyEarnings.previous / Math.max(monthlyEarnings.twoMonthsAgo, monthlyEarnings.previous, monthlyEarnings.current) * 100)
                    : 0}%`
                }}
                title={`Last Month: $${monthlyEarnings.previous.toFixed(2)}`}
              ></div>
              <span className="month-label">Last Mo</span>
            </div>
            <div className="bar-container">
              <div
                className="bar"
                style={{
                  height: `${monthlyEarnings.current > 0
                    ? (monthlyEarnings.current / Math.max(monthlyEarnings.twoMonthsAgo, monthlyEarnings.previous, monthlyEarnings.current) * 100)
                    : 0}%`
                }}
                title={`This Month: $${monthlyEarnings.current.toFixed(2)}`}
              ></div>
              <span className="month-label">This Mo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          <Link to="/freelancer/find-project">
            <button>Find Projects</button>
          </Link>
          <Link to="/freelancer/profile-settings">
            <button>Update Profile</button>
          </Link>
          <Link to="/freelancer/bids">
            <button>View My Bids</button>
          </Link>
          <Link to="/freelancer/projects">
            <button>Active Projects</button>
          </Link>
        </div>
      </div>

      <div className="dashboard-section profile-completion">
        <h3>Profile Completion</h3>
        <div className="progress-bar">
          <div className="filled" style={{ width: `${profileCompletion}%` }}></div>
        </div>
        <p>{profileCompletion}% complete</p>
        {profileCompletion < 100 && (
          <p className="completion-tip">
            Complete your profile to increase your chances of getting hired.
            <Link to="/freelancer/profile-settings"> Update Profile</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default FreelancerHome;
