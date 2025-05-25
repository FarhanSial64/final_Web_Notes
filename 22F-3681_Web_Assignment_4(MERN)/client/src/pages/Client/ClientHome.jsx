import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ClientHome.css';

import WelcomeBanner from '../../Components/client/WelcomeBanner';
import ProjectSummaryCards from '../../Components/client/ProjectSummaryCards';
import SpendingAnalytics from '../../Components/client/SpendingAnalytics';
import BidOverview from '../../Components/client/BidOverview';
import Notifications from '../../Components/client/Notifications';
import TopFreelancersSuggested from '../../Components/client/TopFreelancersSuggested';
import RecentActivityTimeline from '../../Components/client/RecentActivityTimeline';
import QuickActions from '../../Components/client/QuickActions';
import ReportsDownload from '../../Components/client/ReportsDownload';
import SupportWidget from '../../Components/client/SupportWidget';
import PerformanceSummary from '../../Components/client/PerformanceSummary';
import FreelancerRatingsSummary from '../../Components/client/FreelancerRatingsSummary';

const ClientHome = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

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

  // Helper function to format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = useCallback((dateString) => {
    if (!dateString) return 'Unknown time';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }, []);

  // Helper function to get days until deadline
  const getDaysUntilDeadline = useCallback((deadlineString) => {
    if (!deadlineString) return 0;

    const deadline = new Date(deadlineString);
    const now = new Date();
    return Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  }, []);

  // Generate notifications based on project and bid data
  const generateNotifications = useCallback((projects, bids) => {
    const notifications = [];

    // Add notification for new bids
    const allBids = Object.values(bids).flat();
    const recentBids = allBids
      .filter(bid => new Date(bid.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
      .slice(0, 3);

    recentBids.forEach(bid => {
      const project = projects.find(p => p._id === (typeof bid.projectId === 'object' ? bid.projectId._id : bid.projectId));
      if (project) {
        notifications.push({
          type: 'alert',
          title: 'New Bid Received',
          message: `You received a new bid for "${project.title}"`,
          time: formatTimeAgo(bid.createdAt)
        });
      }
    });

    // Add notification for projects nearing deadline
    const projectsNearingDeadline = projects
      .filter(project => {
        if (!project.deadline) return false;
        const deadline = new Date(project.deadline);
        const now = new Date();
        const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline > 0 && daysUntilDeadline <= 3 && normalizeStatus(project.status) === 'in_progress';
      })
      .slice(0, 2);

    projectsNearingDeadline.forEach(project => {
      notifications.push({
        type: 'reminder',
        title: 'Project Deadline Approaching',
        message: `"${project.title}" is due in ${getDaysUntilDeadline(project.deadline)} days`,
        time: 'Deadline reminder'
      });
    });

    return notifications;
  }, [formatTimeAgo, getDaysUntilDeadline, normalizeStatus]);

  // Generate recent activities based on project and bid data
  const generateRecentActivities = useCallback((projects, bids) => {
    const activities = [];

    // Add activity for recently created projects
    const recentProjects = [...projects]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    recentProjects.forEach(project => {
      activities.push({
        description: `You posted a new project: "${project.title}"`,
        timestamp: formatDate(project.createdAt)
      });
    });

    // Add activity for recently received bids
    const allBids = Object.values(bids).flat();
    const recentBids = [...allBids]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    recentBids.forEach(bid => {
      const project = projects.find(p => p._id === (typeof bid.projectId === 'object' ? bid.projectId._id : bid.projectId));
      if (project) {
        activities.push({
          description: `You received a new bid for "${project.title}"`,
          timestamp: formatDate(bid.createdAt)
        });
      }
    });

    // Add activity for status changes
    const recentlyUpdatedProjects = [...projects]
      .filter(p => p.updatedAt && p.updatedAt !== p.createdAt)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 3);

    recentlyUpdatedProjects.forEach(project => {
      activities.push({
        description: `Project "${project.title}" status changed to ${project.status}`,
        timestamp: formatDate(project.updatedAt)
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  }, [formatDate]);

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

        // Fetch user data, projects, and top freelancers
        const [userResponse, projectsResponse, topFreelancersResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5005/api/projects', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/users/freelancers/top', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: [] })) // Fallback if endpoint doesn't exist
        ]);

        const userData = userResponse.data;
        const projectsData = projectsResponse.data;
        const topFreelancersData = topFreelancersResponse.data || [];

        console.log('User data:', userData);
        console.log('Projects data:', projectsData);

        setUser(userData);
        setProjects(projectsData);
        setTopFreelancers(topFreelancersData);

        // Fetch bids for each project
        const bidData = {};
        for (const project of projectsData) {
          try {
            const bidResponse = await axios.get(`http://localhost:5004/api/bids/project/${project._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            bidData[project._id] = bidResponse.data;
          } catch (err) {
            console.error(`Error fetching bids for project ${project._id}:`, err);
            bidData[project._id] = [];
          }
        }

        setBids(bidData);

        // Generate notifications based on project and bid data
        const generatedNotifications = generateNotifications(projectsData, bidData);
        setNotifications(generatedNotifications);

        // Generate recent activities based on project and bid data
        const generatedActivities = generateRecentActivities(projectsData, bidData);
        setRecentActivities(generatedActivities);

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [generateNotifications, generateRecentActivities]);



  // Calculate project summary statistics
  const calculateProjectSummary = () => {
    const activeProjects = projects.filter(project => normalizeStatus(project.status) === 'in_progress').length;
    const postedProjects = projects.length;
    const pendingBids = Object.values(bids).flat().filter(bid => bid.status === 'pending').length;
    const completedProjects = projects.filter(project => normalizeStatus(project.status) === 'completed').length;

    return {
      activeProjects,
      postedProjects,
      pendingBids,
      completedProjects
    };
  };

  // Calculate spending analytics
  const calculateSpendingAnalytics = () => {
    const completedProjects = projects.filter(project => normalizeStatus(project.status) === 'completed');
    const totalSpent = completedProjects.reduce((total, project) => total + (project.budget || 0), 0);

    // Calculate monthly spending for the last 3 months
    const now = new Date();
    const currentMonth = now.getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthlySpendData = [];
    for (let i = 5; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12; // Handle wrapping around to previous year
      const monthName = monthNames[month];

      const monthlySpent = completedProjects
        .filter(project => {
          const completedDate = new Date(project.updatedAt || project.createdAt);
          return completedDate.getMonth() === month &&
                 (completedDate.getFullYear() === now.getFullYear() ||
                  (month > currentMonth && completedDate.getFullYear() === now.getFullYear() - 1));
        })
        .reduce((total, project) => total + (project.budget || 0), 0);

      monthlySpendData.push({
        month: monthName,
        amount: monthlySpent
      });
    }

    return {
      totalSpent,
      monthlySpendData
    };
  };

  // Format recent bids for display
  const formatRecentBids = () => {
    const allBids = Object.values(bids).flat();
    const recentBids = [...allBids]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return recentBids.map(bid => {
      const freelancerName = bid.freelancerId?.name || 'Unknown Freelancer';
      return {
        id: bid._id,
        freelancerName,
        amount: bid.bidAmount,
        message: bid.proposal || 'No proposal provided',
        status: bid.status.charAt(0).toUpperCase() + bid.status.slice(1),
        projectId: typeof bid.projectId === 'object' ? bid.projectId._id : bid.projectId,
        freelancerId: typeof bid.freelancerId === 'object' ? bid.freelancerId._id : bid.freelancerId
      };
    });
  };

  // Format top freelancers for display
  const formatTopFreelancers = () => {
    if (topFreelancers.length === 0) {
      // If no top freelancers data, generate some placeholder data
      return [
        {
          id: 'freelancer1',
          name: 'Alex Johnson',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          skills: ['React', 'Node.js', 'MongoDB'],
          rating: 4.9
        },
        {
          id: 'freelancer2',
          name: 'Sarah Williams',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          skills: ['UI/UX Design', 'Figma', 'Adobe XD'],
          rating: 4.8
        }
      ];
    }

    return topFreelancers.map(freelancer => ({
      id: freelancer._id,
      name: freelancer.name,
      avatar: freelancer.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
      skills: freelancer.skills || ['Skilled Freelancer'],
      rating: freelancer.rating || 4.5
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="client-home">
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
      <div className="client-home">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Calculate data for components
  const projectSummary = calculateProjectSummary();
  const spendingAnalytics = calculateSpendingAnalytics();
  const recentBids = formatRecentBids();
  const formattedTopFreelancers = formatTopFreelancers();

  return (
    <div className="client-home">
      {/* Welcome Section */}
      <div className="dashboard-grid">
        <div className="welcome-section">
          <WelcomeBanner clientName={user?.name} />
        </div>
      </div>

      {/* Project Summary Section */}
      <div className="dashboard-grid">
        <div className="summary-section dashboard-card">
          <h3>Project Overview</h3>
          <ProjectSummaryCards summary={projectSummary} />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="dashboard-grid">
        <div className="analytics-section dashboard-card">
          <h3>Spending Analytics</h3>
          <SpendingAnalytics
            totalSpent={spendingAnalytics.totalSpent}
            monthlySpendData={spendingAnalytics.monthlySpendData}
          />
        </div>
      </div>

      {/* Bids and Notifications Section */}
      <div className="dashboard-grid">
        <div className="bids-section dashboard-card">
          <h3>Recent Bids</h3>
          <BidOverview
            bids={recentBids}
            onBidAccepted={(bid) => {
              // Update the bids data
              const updatedBids = { ...bids };

              // Find the bid in the bids object and update its status
              Object.keys(updatedBids).forEach(projectId => {
                updatedBids[projectId] = updatedBids[projectId].map(b =>
                  b.id === bid.id ? { ...b, status: 'Accepted' } : b
                );
              });

              setBids(updatedBids);

              // Update the projects data
              const updatedProjects = projects.map(project =>
                project._id === bid.projectId ? { ...project, status: 'in_progress' } : project
              );

              setProjects(updatedProjects);

              // Recalculate statistics
              const generatedNotifications = generateNotifications(updatedProjects, updatedBids);
              setNotifications(generatedNotifications);

              const generatedActivities = generateRecentActivities(updatedProjects, updatedBids);
              setRecentActivities(generatedActivities);
            }}
          />
        </div>
        <div className="notifications-section dashboard-card">
          <h3>Notifications</h3>
          <Notifications notifications={notifications} />
        </div>
      </div>

      {/* Freelancers and Activity Section */}
      <div className="dashboard-grid">
        <div className="freelancers-section dashboard-card">
          <h3>Top Freelancers</h3>
          <TopFreelancersSuggested freelancers={formattedTopFreelancers} />
        </div>
        <div className="activity-section dashboard-card">
          <h3>Recent Activity</h3>
          <RecentActivityTimeline activities={recentActivities} />
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="dashboard-grid">
        <div className="actions-section dashboard-card">
          <QuickActions />
        </div>
      </div>

      {/* Performance Metrics Section */}
      <div className="enhancements">
        <div className="reports-section dashboard-card">
          <h3>Reports & Downloads</h3>
          <ReportsDownload />
        </div>
        <div className="performance-section dashboard-card">
          <h3>Performance Metrics</h3>
          <PerformanceSummary
            projects={projects}
            bids={bids}
          />
        </div>
        <div className="ratings-section dashboard-card">
          <h3>Freelancer Ratings</h3>
          <FreelancerRatingsSummary
            projects={projects}
          />
        </div>
      </div>

      {/* Support Widget (Fixed Position) */}
      <div className="support-section">
        <SupportWidget />
      </div>
    </div>
  );
};

export default ClientHome;
