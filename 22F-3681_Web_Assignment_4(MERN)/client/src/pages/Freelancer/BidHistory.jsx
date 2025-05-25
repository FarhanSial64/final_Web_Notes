import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './BidHistory.css';

Modal.setAppElement('#root');

const BidHistory = () => {
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [bidsPerPage] = useState(6);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  // No modal state needed anymore

  // Fetch bids and related projects
  useEffect(() => {
    const fetchBidsAndProjects = async () => {
      try {
        // Get all bids for the logged-in freelancer
        const bidsResponse = await axios.get('http://localhost:5004/api/bids/my', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const bidData = bidsResponse.data;

        console.log("Bid data received:", bidData);

        // Get project details for each bid - handle both string IDs and object IDs
        const projectIds = [...new Set(bidData.map(bid => {
          // Check if projectId is an object with _id property or a string
          return typeof bid.projectId === 'object' ? bid.projectId._id : bid.projectId;
        }))];

        console.log("Project IDs to fetch:", projectIds);

        const projectsData = {};

        // First, store any project data that might already be populated in the bids
        bidData.forEach(bid => {
          if (typeof bid.projectId === 'object' && bid.projectId !== null) {
            const projectId = bid.projectId._id;
            projectsData[projectId] = bid.projectId;
            console.log(`Using populated project data for: ${projectId}`, bid.projectId);
          }
        });

        // Then fetch any missing project details
        await Promise.all(
          projectIds.map(async (projectId) => {
            // Skip if we already have this project's data
            if (projectsData[projectId] && projectsData[projectId].title) {
              return;
            }

            try {
              // Use the correct endpoint for fetching a single project
              const projectResponse = await axios.get(`http://localhost:5005/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              });

              // Store the project data with proper error handling
              if (projectResponse.data) {
                projectsData[projectId] = projectResponse.data;
                console.log(`Successfully fetched project: ${projectId}`, projectResponse.data);
              } else {
                console.error(`No data returned for project ${projectId}`);
                projectsData[projectId] = { title: 'Unknown Project', status: 'unknown' };
              }
            } catch (err) {
              console.error(`Error fetching project ${projectId}:`, err.response?.data || err.message);
              projectsData[projectId] = { title: 'Unknown Project', status: 'unknown' };
            }
          })
        );

        setBids(bidData);
        setFilteredBids(bidData);
        setProjects(projectsData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching bids:', err);
        setError(err.response?.data?.message || 'Failed to fetch bid history');
        setIsLoading(false);
      }
    };

    fetchBidsAndProjects();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let results = bids;

    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(bid => bid.status === statusFilter);
    }

    // Apply search term
    if (searchTerm) {
      results = results.filter(bid => {
        const project = projects[bid.projectId];
        return (
          project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bid.proposal?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredBids(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, bids, projects]);

  // Get current bids for pagination
  const indexOfLastBid = currentPage * bidsPerPage;
  const indexOfFirstBid = indexOfLastBid - bidsPerPage;
  const currentBids = filteredBids.slice(indexOfFirstBid, indexOfLastBid);
  const totalPages = Math.ceil(filteredBids.length / bidsPerPage);

  // Handle bid acceptance
  const handleAcceptBid = async (bidId) => {
    try {
      // Find the bid to get the project ID
      const bid = bids.find(b => b._id === bidId);
      if (!bid) {
        alert('Bid not found');
        return;
      }

      // Accept the bid
      const acceptResponse = await axios.put(
        `http://localhost:5004/api/bids/${bidId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      console.log('Bid acceptance response:', acceptResponse.data);

      // Update the project status to in_progress
      try {
        const projectUpdateResponse = await axios.put(
          `http://localhost:5005/api/projects/${bid.projectId}/status`,
          { status: 'in_progress' },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );

        console.log('Project status update response:', projectUpdateResponse.data);

        // Update the project in the local state
        setProjects(prev => ({
          ...prev,
          [bid.projectId]: {
            ...prev[bid.projectId],
            status: 'in_progress'
          }
        }));
      } catch (projectErr) {
        console.error('Error updating project status:', projectErr);
        alert('Bid accepted, but there was an issue updating the project status.');
      }

      // Update local state for bids
      const updatedBids = bids.map(b =>
        b._id === bidId ? { ...b, status: 'accepted' } : b
      );

      setBids(updatedBids);
      setFilteredBids(
        filteredBids.map(b =>
          b._id === bidId ? { ...b, status: 'accepted' } : b
        )
      );

      // No need to close modal anymore as we're not using it

      alert('Bid accepted! The project is now in progress.');
    } catch (err) {
      console.error('Error accepting bid:', err);
      alert(err.response?.data?.message || 'Failed to accept bid');
    }
  };

  // Handle bid rejection
  const handleRejectBid = async (bidId) => {
    try {
      // Find the bid to get the project ID
      const bid = bids.find(b => b._id === bidId);
      if (!bid) {
        alert('Bid not found');
        return;
      }

      // Reject the bid
      const rejectResponse = await axios.put(
        `http://localhost:5004/api/bids/${bidId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      console.log('Bid rejection response:', rejectResponse.data);

      // Update the project status back to open
      try {
        const projectUpdateResponse = await axios.put(
          `http://localhost:5005/api/projects/${bid.projectId}/status`,
          { status: 'open' },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );

        console.log('Project status update response:', projectUpdateResponse.data);

        // Update the project in the local state
        setProjects(prev => ({
          ...prev,
          [bid.projectId]: {
            ...prev[bid.projectId],
            status: 'open'
          }
        }));
      } catch (projectErr) {
        console.error('Error updating project status:', projectErr);
        alert('Bid rejected, but there was an issue updating the project status.');
      }

      // Update local state for bids
      const updatedBids = bids.map(b =>
        b._id === bidId ? { ...b, status: 'rejected' } : b
      );

      setBids(updatedBids);
      setFilteredBids(
        filteredBids.map(b =>
          b._id === bidId ? { ...b, status: 'rejected' } : b
        )
      );

      // No need to close modal anymore as we're not using it

      alert('Bid rejected. The project will be available for other freelancers.');
    } catch (err) {
      console.error('Error rejecting bid:', err);
      alert(err.response?.data?.message || 'Failed to reject bid');
    }
  };

  // Modal functions removed as we're not using a modal anymore

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  return (
    <div className="bid-history-container">
      <div className="bid-history-header">
        <h2>Bid History</h2>
        <div className="search-filter-container">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search bids..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="status-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading bid history...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="bid-stats">
            <p>Showing {filteredBids.length} bids</p>
          </div>

          {filteredBids.length > 0 ? (
            <>
              <div className="bid-grid">
                {currentBids.map((bid) => {
                  // Get the project ID (handle both string and object IDs)
                  const projectId = typeof bid.projectId === 'object' ? bid.projectId._id : bid.projectId;
                  const project = projects[projectId] || {};

                  console.log(`Rendering bid ${bid._id} for project:`, project);

                  // Format project status for display
                  const displayStatus = project.status
                    ? project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                    : 'Unknown';

                  return (
                    <div key={bid._id} className="bid-card">
                      <div className="card-header">
                        <h3>{project.title || 'Unknown Project'}</h3>
                        <span className={`status-badge ${getStatusBadgeClass(bid.status)}`}>
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </span>
                      </div>
                      <div className="bid-details">
                        <div className="detail-item">
                          <span className="detail-label">Your Bid:</span>
                          <span className="detail-value">${bid.bidAmount}</span>
                        </div>
                        {bid.counterOffer && (
                          <div className="detail-item counter-offer">
                            <span className="detail-label">Counter Offer:</span>
                            <span className="detail-value">${bid.counterOffer}</span>
                          </div>
                        )}
                        <div className="detail-item">
                          <span className="detail-label">Date:</span>
                          <span className="detail-value">{formatDate(bid.createdAt)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Project Status:</span>
                          <span className="detail-value">{displayStatus}</span>
                        </div>
                        {project.clientId && (
                          <div className="detail-item">
                            <span className="detail-label">Client:</span>
                            <span className="detail-value">
                              {typeof project.clientId === 'object' ? project.clientId.name : 'Unknown'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="bid-proposal">
                        <h4>Your Proposal</h4>
                        <p>{bid.proposal}</p>
                      </div>
                      <div className="bid-actions">
                        {/* Always show accept/reject buttons for pending bids with counter offers */}
                        {bid.status === 'pending' && bid.counterOffer && (
                          <div className="bid-action-buttons">
                            <button
                              onClick={() => handleRejectBid(bid._id)}
                              className="reject-button"
                            >
                              Reject Offer
                            </button>
                            <button
                              onClick={() => handleAcceptBid(bid._id)}
                              className="accept-button"
                            >
                              Accept Offer
                            </button>
                          </div>
                        )}
                        {bid.status === 'accepted' && (
                          <div className="bid-accepted-message">
                            <span>Bid accepted! Project in progress.</span>
                          </div>
                        )}
                        {bid.status === 'rejected' && (
                          <div className="bid-rejected-message">
                            <span>Bid rejected.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
            <div className="no-bids">
              <p>You haven't placed any bids yet.</p>
            </div>
          )}
        </>
      )}

      {/* We've removed the modal and placed the accept/reject buttons directly in the bid cards */}
    </div>
  );
};

export default BidHistory;
