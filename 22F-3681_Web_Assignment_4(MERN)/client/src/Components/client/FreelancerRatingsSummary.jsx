import React, { useMemo } from 'react';
import './FreelancerRatingsSummary.css';

const FreelancerRatingsSummary = ({ projects }) => {
  // Generate ratings data from projects
  const ratings = useMemo(() => {
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      // Fallback data if no projects are available
      return [
        { freelancer: 'No ratings available', rating: 0, project: 'No completed projects yet' }
      ];
    }

    // Filter projects that have freelancer ratings
    const projectsWithRatings = projects.filter(project =>
      project.freelancerRating &&
      project.freelancerName &&
      project.title
    );

    // If no projects with ratings, return fallback message
    if (projectsWithRatings.length === 0) {
      return [
        { freelancer: 'No ratings available', rating: 0, project: 'No completed projects yet' }
      ];
    }

    // Sort by rating (highest first)
    const sortedProjects = [...projectsWithRatings].sort(
      (a, b) => b.freelancerRating - a.freelancerRating
    );

    // Take the top 5 rated projects
    return sortedProjects.slice(0, 5).map(project => ({
      freelancer: project.freelancerName,
      rating: project.freelancerRating,
      project: project.title,
      id: project._id
    }));
  }, [projects]);

  return (
    <div className="freelancer-ratings-summary">
      <h3>Freelancer Ratings Summary</h3>
      <div className="ratings-list">
        {ratings.map((item, index) => (
          <div key={item.id || index} className="rating-card">
            <div className="rating-top">
              <strong>{item.freelancer}</strong>
              {item.rating > 0 ? (
                <span className="rating-stars">{item.rating} ★</span>
              ) : (
                <span className="no-rating">No rating</span>
              )}
            </div>
            <p className="project-title">{item.project}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreelancerRatingsSummary;
