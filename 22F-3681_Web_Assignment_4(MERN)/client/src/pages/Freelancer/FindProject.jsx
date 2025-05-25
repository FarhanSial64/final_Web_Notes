import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './FindProject.css';

Modal.setAppElement('#root');

const FindProject = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

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

  // Filter/search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minBudget: '',
    maxBudget: '',
    deadline: '',
    skills: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Bid modal state
  const [bidModalIsOpen, setBidModalIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bidDetails, setBidDetails] = useState({
    proposal: '',
    bidAmount: '',
  });

  // Function to open bid modal
  const openBidModal = (project) => {
    setSelectedProject(project);
    setBidModalIsOpen(true);
  };

  // Function to close bid modal
  const closeBidModal = () => {
    setBidModalIsOpen(false);
    setSelectedProject(null);
    setBidDetails({
      proposal: '',
      bidAmount: '',
    });
  };

  // Fetch user data and projects
  useEffect(() => {
    const fetchUserAndProjects = async () => {
      try {
        const [userResponse, projectsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('http://localhost:5005/api/projects', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
        ]);

        console.log('User data:', userResponse.data);
        console.log('Projects data:', projectsResponse.data);

        // Force the role to be 'freelancer' for testing
        const userData = userResponse.data;
        userData.role = 'freelancer';

        setUser(userData);
        setProjects(projectsResponse.data);
        setFilteredProjects(projectsResponse.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        setIsLoading(false);
      }
    };

    fetchUserAndProjects();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let results = projects;

    // Apply search term filter
    if (searchTerm) {
      results = results.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply budget filters
    if (filters.minBudget) {
      results = results.filter(project => project.budget >= Number(filters.minBudget));
    }
    if (filters.maxBudget) {
      results = results.filter(project => project.budget <= Number(filters.maxBudget));
    }

    // Apply deadline filter
    if (filters.deadline) {
      const deadlineDate = new Date(filters.deadline);
      results = results.filter(project => new Date(project.deadline) <= deadlineDate);
    }

    // Apply skills filter
    if (filters.skills) {
      const skillsArray = filters.skills.split(',').map(skill => skill.trim().toLowerCase());
      results = results.filter(project =>
        project.skills?.some(projectSkill =>
          skillsArray.some(skill => projectSkill.toLowerCase().includes(skill))
        )
      );
    }

    setFilteredProjects(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filters, projects]);

  // Get current projects for pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  // Handle bid submission
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !bidDetails.proposal || !bidDetails.bidAmount) return;

    try {
      const response = await axios.post(
        'http://localhost:5004/api/bids',
        {
          projectId: selectedProject._id,
          proposal: bidDetails.proposal,
          bidAmount: bidDetails.bidAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      alert(`Bid placed successfully! ${response.data.message}`);
      closeBidModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place bid');
    }
  };

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

      // Update the project in the local state
      const updatedProjects = projects.map(project =>
        project._id === projectId ? { ...project, status: newStatus } : project
      );
      setProjects(updatedProjects);

      // Also update filtered projects
      const updatedFilteredProjects = filteredProjects.map(project =>
        project._id === projectId ? { ...project, status: newStatus } : project
      );
      setFilteredProjects(updatedFilteredProjects);

      alert(`Project status updated to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update project status');
    }
  };

  // Handle time logging
  const [timeLogModal, setTimeLogModal] = useState(false);
  const [selectedProjectForTimeLog, setSelectedProjectForTimeLog] = useState(null);
  const [timeLogDetails, setTimeLogDetails] = useState({
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

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

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      minBudget: '',
      maxBudget: '',
      deadline: '',
      skills: '',
    });
  };

  return (
    <div className="find-project-container">
      <div className="project-header">
        <h2>Find Projects</h2>
        <div className="search-filter-container">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Budget Range ($)</label>
              <div className="budget-range">
                <input
                  type="number"
                  name="minBudget"
                  placeholder="Min"
                  value={filters.minBudget}
                  onChange={handleFilterChange}
                />
                <span>to</span>
                <input
                  type="number"
                  name="maxBudget"
                  placeholder="Max"
                  value={filters.maxBudget}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Deadline Before</label>
              <input
                type="date"
                name="deadline"
                value={filters.deadline}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>Skills (comma separated)</label>
              <input
                type="text"
                name="skills"
                placeholder="e.g. React, Node, Design"
                value={filters.skills}
                onChange={handleFilterChange}
              />
            </div>

            <button className="reset-filters" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="project-stats">
            <p>Showing {filteredProjects.length} projects</p>
            {filteredProjects.length !== projects.length && (
              <button onClick={resetFilters} className="clear-filters">
                Clear all filters
              </button>
            )}
          </div>

          {filteredProjects.length > 0 ? (
            <>
              <div className="project-grid">
                {currentProjects.map((project) => (
                  <div key={project._id} className="project-card">
                    <div className="card-header">
                      <h3>{project.title}</h3>
                      <span className={`status-badge ${normalizeStatus(project.status)}`}>
                        {project.status.replace('_', ' ')}
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
                      {console.log(`Project ${project._id} - Normalized Status: ${normalizeStatus(project.status)}, User role: ${user?.role}`)}

                      {/* Check for open projects using normalized status */}
                      {user?.role === 'freelancer' && normalizeStatus(project.status) === 'open' && (
                        <button
                          onClick={() => openBidModal(project)}
                          className="bid-button"
                        >
                          Place Bid
                        </button>
                      )}

                      {/* Check for in-progress projects using normalized status */}
                      {user?.role === 'freelancer' && normalizeStatus(project.status) === 'in_progress' && (
                        <>
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
                        </>
                      )}
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
              <p>No projects match your search criteria.</p>
              <button onClick={resetFilters}>Reset filters</button>
            </div>
          )}
        </>
      )}

      {/* Bid Modal */}
      <Modal
        isOpen={bidModalIsOpen}
        onRequestClose={closeBidModal}
        contentLabel="Place Bid Modal"
        className="fp-modal"
        overlayClassName="fp-overlay"
      >
        {selectedProject && (
          <div className="fp-modal-content">
            <div className="fp-modal-header">
              <h3>Place Bid for: {selectedProject.title}</h3>
              <button onClick={closeBidModal} className="fp-modal-close-button">×</button>
            </div>
            <div className="project-info">
              <p><strong>Budget:</strong> ${selectedProject.budget}</p>
              <p><strong>Deadline:</strong> {new Date(selectedProject.deadline).toLocaleDateString()}</p>
            </div>

            <form onSubmit={handleBidSubmit}>
              <div className="form-group">
                <label htmlFor="proposal">Your Proposal</label>
                <textarea
                  id="proposal"
                  name="proposal"
                  value={bidDetails.proposal}
                  onChange={(e) => setBidDetails({...bidDetails, proposal: e.target.value})}
                  required
                  placeholder="Explain your approach, relevant experience, and why you're the best fit..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="bidAmount">Your Bid Amount ($)</label>
                <div className="bid-amount-container">
                  <div className="currency-symbol">$</div>
                  <input
                    type="number"
                    id="bidAmount"
                    name="bidAmount"
                    value={bidDetails.bidAmount}
                    onChange={(e) => setBidDetails({...bidDetails, bidAmount: e.target.value})}
                    required
                    min="1"
                    step="any"
                    placeholder="Enter your bid amount"
                  />
                </div>
                {selectedProject.budget && (
                  <p className="budget-comparison">
                    <span>Client's budget: ${selectedProject.budget}</span>
                    {bidDetails.bidAmount && (
                      <span className={bidDetails.bidAmount > selectedProject.budget ? 'higher' : 'lower'}>
                        Your bid is {bidDetails.bidAmount > selectedProject.budget ? 'higher' : 'lower'}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="fp-modal-actions">
                <button type="button" onClick={closeBidModal} className="fp-secondary-button">
                  Cancel
                </button>
                <button type="submit" className="fp-primary-button">
                  Submit Bid
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

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
              <p><strong>Status:</strong> {selectedProjectForTimeLog.status.replace('_', ' ')}</p>
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

export default FindProject;