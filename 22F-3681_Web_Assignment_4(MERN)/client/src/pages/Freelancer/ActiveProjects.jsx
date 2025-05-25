import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './FindProject.css'; // Reuse the same CSS

Modal.setAppElement('#root');

const ActiveProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(6);

  // Helper function to normalize status values
  const normalizeStatus = (status) => {
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
  };

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Time Log modal state
  const [timeLogModal, setTimeLogModal] = useState(false);
  const [selectedProjectForTimeLog, setSelectedProjectForTimeLog] = useState(null);
  const [timeLogDetails, setTimeLogDetails] = useState({
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch user data and active projects
  useEffect(() => {
    const fetchUserAndProjects = async () => {
      try {
        const projectsResponse = await axios.get('http://localhost:5005/api/projects', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        // Filter only in-progress projects
        const activeProjects = projectsResponse.data.filter(
          project => normalizeStatus(project.status) === 'in_progress'
        );

        setProjects(activeProjects);
        setFilteredProjects(activeProjects);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        setIsLoading(false);
      }
    };

    fetchUserAndProjects();
  }, []);

  // Apply search
  useEffect(() => {
    if (searchTerm) {
      const results = projects.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProjects(results);
    } else {
      setFilteredProjects(projects);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, projects]);

  // Get current projects for pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  // Handle project status change
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5005/api/projects/${projectId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Remove the project from the list since it's no longer active
      const updatedProjects = projects.filter(project => project._id !== projectId);
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects);

      alert(`Project status updated to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update project status');
    }
  };

  // Time logging functions
  const openTimeLogModal = (project) => {
    setSelectedProjectForTimeLog(project);
    setTimeLogModal(true);
  };

  const closeTimeLogModal = () => {
    setTimeLogModal(false);
    setSelectedProjectForTimeLog(null);
    setTimeLogDetails({
      hours: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleTimeLogSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectForTimeLog || !timeLogDetails.hours || !timeLogDetails.description) return;

    try {
      await axios.post(
        `http://localhost:5005/api/projects/${selectedProjectForTimeLog._id}/log-time`,
        timeLogDetails,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      alert('Time logged successfully!');
      closeTimeLogModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log time');
    }
  };

  return (
    <div className="find-project-container">
      <div className="project-header">
        <h2>Active Projects</h2>
        <div className="search-filter-container">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search active projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading active projects...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="project-stats">
            <p>Showing {filteredProjects.length} active projects</p>
          </div>

          {filteredProjects.length > 0 ? (
            <>
              <div className="project-grid">
                {currentProjects.map((project) => (
                  <div key={project._id} className="project-card">
                    <div className="card-header">
                      <h3>{project.title}</h3>
                      <span className="status-badge in_progress">
                        In Progress
                      </span>
                    </div>
                    <p className="project-description">
                      {project.description.length > 150
                        ? `${project.description.substring(0, 150)}...`
                        : project.description}
                    </p>
                    <div className="project-skills">
                      {project.skills?.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                      {project.skills?.length > 3 && (
                        <span className="skill-more">+{project.skills.length - 3} more</span>
                      )}
                    </div>
                    <div className="project-details">
                      <div className="detail-item">
                        <span className="detail-label">Budget:</span>
                        <span className="detail-value">${project.budget}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Deadline:</span>
                        <span className="detail-value">
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="project-actions">
                      <button
                        onClick={() => handleStatusChange(project._id, 'completed')}
                        className="status-button complete-button"
                      >
                        Mark as Completed
                      </button>
                      <button
                        onClick={() => openTimeLogModal(project)}
                        className="status-button log-time-button"
                      >
                        Log Time
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft /> Previous
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={currentPage === number ? 'active' : ''}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-projects">
              <p>You don't have any active projects.</p>
            </div>
          )}
        </>
      )}

      {/* Time Log Modal */}
      <Modal
        isOpen={timeLogModal}
        onRequestClose={closeTimeLogModal}
        contentLabel="Log Time Modal"
        className="fp-modal"
        overlayClassName="fp-overlay"
      >
        {selectedProjectForTimeLog && (
          <div className="fp-modal-content">
            <div className="fp-modal-header">
              <h3>Log Time for: {selectedProjectForTimeLog.title}</h3>
              <button onClick={closeTimeLogModal} className="fp-modal-close-button">×</button>
            </div>
            <div className="project-info">
              <p><strong>Project:</strong> {selectedProjectForTimeLog.title}</p>
              <p><strong>Status:</strong> In Progress</p>
            </div>

            <form onSubmit={handleTimeLogSubmit}>
              <div className="form-group">
                <label htmlFor="hours">Hours Worked</label>
                <input
                  type="number"
                  id="hours"
                  name="hours"
                  value={timeLogDetails.hours}
                  onChange={(e) => setTimeLogDetails({...timeLogDetails, hours: e.target.value})}
                  required
                  min="0.5"
                  step="0.5"
                  placeholder="Enter hours worked"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={timeLogDetails.date}
                  onChange={(e) => setTimeLogDetails({...timeLogDetails, date: e.target.value})}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Work Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={timeLogDetails.description}
                  onChange={(e) => setTimeLogDetails({...timeLogDetails, description: e.target.value})}
                  required
                  placeholder="Describe the work you completed during this time..."
                  className="form-control"
                />
              </div>

              <div className="fp-modal-actions">
                <button type="button" onClick={closeTimeLogModal} className="fp-secondary-button">
                  Cancel
                </button>
                <button type="submit" className="fp-primary-button">
                  Submit Time Log
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActiveProjects;
