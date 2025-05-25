import React, { useMemo } from 'react';
import './PerformanceSummary.css';

const PerformanceSummary = ({ projects, bids }) => {
  // Calculate performance metrics from projects and bids data
  const summaryData = useMemo(() => {
    // Default values in case of no data
    const defaultData = {
      avgHireTime: '0 days',
      avgSpend: '$0',
      posted: 0,
      completed: 0,
      avgRating: 0,
      completionRate: '0%',
      avgBidsPerProject: 0
    };

    // If no projects data, return default values
    if (!projects || projects.length === 0) {
      return defaultData;
    }

    // Count projects by status
    const posted = projects.length;
    const completed = projects.filter(project =>
      project.status?.toLowerCase() === 'completed'
    ).length;

    // Calculate completion rate
    const completionRate = posted > 0
      ? Math.round((completed / posted) * 100)
      : 0;

    // Calculate average spend per project for completed projects
    const completedProjects = projects.filter(project =>
      project.status?.toLowerCase() === 'completed'
    );

    const totalSpend = completedProjects.reduce(
      (sum, project) => sum + (project.budget || 0),
      0
    );

    const avgSpend = completedProjects.length > 0
      ? (totalSpend / completedProjects.length).toFixed(2)
      : 0;

    // Calculate average hire time (from project creation to assignment)
    let totalHireTime = 0;
    let projectsWithHireTime = 0;

    projects.forEach(project => {
      if (project.createdAt && project.assignedAt) {
        const createdDate = new Date(project.createdAt);
        const assignedDate = new Date(project.assignedAt);
        const hireTimeInDays = (assignedDate - createdDate) / (1000 * 60 * 60 * 24);

        if (hireTimeInDays >= 0) {
          totalHireTime += hireTimeInDays;
          projectsWithHireTime++;
        }
      }
    });

    const avgHireTime = projectsWithHireTime > 0
      ? (totalHireTime / projectsWithHireTime).toFixed(1)
      : 0;

    // Calculate average freelancer rating
    let totalRating = 0;
    let ratedFreelancers = 0;

    projects.forEach(project => {
      if (project.freelancerRating && project.freelancerRating > 0) {
        totalRating += project.freelancerRating;
        ratedFreelancers++;
      }
    });

    const avgRating = ratedFreelancers > 0
      ? (totalRating / ratedFreelancers).toFixed(1)
      : 0;

    // Calculate average bids per project
    let totalBids = 0;

    if (bids && typeof bids === 'object') {
      Object.values(bids).forEach(projectBids => {
        if (Array.isArray(projectBids)) {
          totalBids += projectBids.length;
        }
      });
    }

    const avgBidsPerProject = posted > 0
      ? (totalBids / posted).toFixed(1)
      : 0;

    return {
      avgHireTime: `${avgHireTime} days`,
      avgSpend: `$${avgSpend}`,
      posted,
      completed,
      avgRating,
      completionRate: `${completionRate}%`,
      avgBidsPerProject
    };
  }, [projects, bids]);

  return (
    <div className="performance-summary">
      <h3>Performance Summary</h3>
      <div className="summary-grid">
        <div className="summary-card">
          <h4>Avg. Hire Time</h4>
          <p>{summaryData.avgHireTime}</p>
        </div>
        <div className="summary-card">
          <h4>Avg. Spend / Project</h4>
          <p>{summaryData.avgSpend}</p>
        </div>
        <div className="summary-card">
          <h4>Projects Posted</h4>
          <p>{summaryData.posted}</p>
        </div>
        <div className="summary-card">
          <h4>Projects Completed</h4>
          <p>{summaryData.completed}</p>
        </div>
        <div className="summary-card">
          <h4>Completion Rate</h4>
          <p>{summaryData.completionRate}</p>
        </div>
        <div className="summary-card">
          <h4>Avg. Bids / Project</h4>
          <p>{summaryData.avgBidsPerProject}</p>
        </div>
        <div className="summary-card">
          <h4>Freelancer Rating Avg</h4>
          <p>{summaryData.avgRating > 0 ? `${summaryData.avgRating} ★` : 'No ratings'}</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceSummary;
