import React, { useState } from 'react';
import axios from 'axios';
import './BidOverview.css';

const BidOverview = ({ bids, onBidAccepted }) => {
  const safeBids = Array.isArray(bids) ? bids : [];
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [showProposal, setShowProposal] = useState(null);

  const handleViewProposal = (bid) => {
    setShowProposal(showProposal === bid.id ? null : bid.id);
  };

  const handleAcceptBid = async (bid) => {
    if (!bid.id) {
      console.error('Bid ID is missing');
      return;
    }

    setLoading(prev => ({ ...prev, [bid.id]: true }));
    setError(prev => ({ ...prev, [bid.id]: null }));

    try {
      const token = localStorage.getItem('token');

      // Accept the bid
      await axios.put(
        `http://localhost:5004/api/bids/${bid.id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update the project status to in_progress
      if (bid.projectId) {
        await axios.put(
          `http://localhost:5005/api/projects/${bid.projectId}/status`,
          { status: 'in_progress' },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      setLoading(prev => ({ ...prev, [bid.id]: false }));

      // Notify parent component that a bid was accepted
      if (onBidAccepted) {
        onBidAccepted(bid);
      }

      // Show success message
      alert(`Bid from ${bid.freelancerName} has been accepted!`);
    } catch (err) {
      console.error('Error accepting bid:', err);
      setError(prev => ({
        ...prev,
        [bid.id]: err.response?.data?.message || 'Failed to accept bid'
      }));
      setLoading(prev => ({ ...prev, [bid.id]: false }));
      alert('Failed to accept bid. Please try again.');
    }
  };

  return (
    <div className="bid-overview">
      <h2>Recent Bids</h2>
      {safeBids.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Freelancer</th>
              <th>Bid Amount</th>
              <th>Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeBids.map((bid, index) => (
              <React.Fragment key={bid.id || index}>
                <tr>
                  <td>{bid.freelancerName}</td>
                  <td>${bid.amount}</td>
                  <td>
                    {bid.message.length > 50
                      ? `${bid.message.substring(0, 50)}...`
                      : bid.message}
                  </td>
                  <td className={`status-${bid.status.toLowerCase()}`}>
                    {bid.status}
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => handleViewProposal(bid)}
                    >
                      {showProposal === bid.id ? 'Hide Proposal' : 'View Proposal'}
                    </button>
                    {bid.status.toLowerCase() === 'pending' && (
                      <button
                        className="accept-btn"
                        onClick={() => handleAcceptBid(bid)}
                        disabled={loading[bid.id]}
                      >
                        {loading[bid.id] ? 'Processing...' : 'Accept Bid'}
                      </button>
                    )}
                    {error[bid.id] && (
                      <div className="error-message">{error[bid.id]}</div>
                    )}
                  </td>
                </tr>
                {showProposal === bid.id && (
                  <tr className="proposal-row">
                    <td colSpan="5">
                      <div className="full-proposal">
                        <h4>Full Proposal</h4>
                        <p>{bid.message}</p>
                        {bid.freelancerId && (
                          <button
                            className="view-profile-btn"
                            onClick={() => window.location.href = `/freelancer-profile/${bid.freelancerId}`}
                          >
                            View Freelancer Profile
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No bids available.</p>
      )}
    </div>
  );
};

export default BidOverview;
