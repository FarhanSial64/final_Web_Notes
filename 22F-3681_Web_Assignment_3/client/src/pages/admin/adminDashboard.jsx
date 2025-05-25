import React, { useState, useEffect } from "react";
import "../../assets/css/tutorVerification.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [action, setAction] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName") || "Admin";

  const fetchTutors = async () => {
    try {
      console.log("Fetching tutors...");
      const token = localStorage.getItem("token");
  
      if (!token) throw new Error("No token found, please log in again.");
  
      const response = await fetch("http://localhost:5000/api/admin/tutors/pending", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch data from server.");
      }
  
      const data = await response.json();
      setTutors(data);
      setFilteredTutors(data);
  
      // Calculate statistics
      const pendingCount = data.filter(tutor => tutor.verificationStatus.toLowerCase() === "pending").length;
      const approvedCount = data.filter(tutor => tutor.verificationStatus.toLowerCase() === "approved").length;
      const rejectedCount = data.filter(tutor => tutor.verificationStatus.toLowerCase() === "rejected").length;
  
      setStats({ pending: pendingCount, approved: approvedCount, rejected: rejectedCount });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    const filtered = tutors.filter((tutor) =>
      `${tutor.firstName} ${tutor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTutors(filtered);
  }, [searchQuery, tutors]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    
    alert("Logging out...");
    navigate('/login');
  };

  const openModal = (tutor) => {
    setSelectedTutor(tutor);
  };

  const closeModal = () => {
    setSelectedTutor(null);
  };

  const handleVerification = (status) => {
    setAction(status);
    setShowConfirmation(true);
  };

  const useCountUp = (target, duration = 2000) => {
    const [count, setCount] = useState(0);
  
    useEffect(() => {
      let start = 0;
      const increment = Math.ceil(target / (duration / 50)); // Smooth step increment
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 50); // Update every 50ms
  
      return () => clearInterval(timer);
    }, [target, duration]);
  
    return count;
  };
  const submitVerification = async () => {
    if (!selectedTutor) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/admin/tutors/verify/${selectedTutor._id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action, comments: adminComment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update tutor status");
      }

      const updatedTutorData = await response.json();

      console.log("Backend updatedTutor:", updatedTutorData);
      alert(`Tutor ${action} successfully!`);

      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor._id === updatedTutorData.updatedTutor.tutor.id
            ? { ...tutor, verificationStatus: updatedTutorData.updatedTutor.tutor.verificationStatus, verificationComments: updatedTutorData.updatedTutor.tutor.verificationComments }
            : tutor
        )
      );
      setFilteredTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor._id === updatedTutorData.updatedTutor.tutor.id
            ? { ...tutor, verificationStatus: updatedTutorData.updatedTutor.tutor.verificationStatus, verificationComments: updatedTutorData.updatedTutor.tutor.verificationComments }
            : tutor
        )
      );

      setStats((prevStats) => {
        const newStats = { ...prevStats };
  
        if (selectedTutor.verificationStatus.toLowerCase() === "pending") {
          newStats.pending -= 1;
        } else if (selectedTutor.verificationStatus.toLowerCase() === "approved") {
          newStats.approved -= 1;
        } else if (selectedTutor.verificationStatus.toLowerCase() === "rejected") {
          newStats.rejected -= 1;
        }
  
        if (action === "approved") {
          newStats.approved += 1;
        } else if (action === "rejected") {
          newStats.rejected += 1;
        }
  
        return newStats;
      });

      setShowConfirmation(false);
      setSelectedTutor(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const navigateToReports = () => {
    navigate('/Reports');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h2>Welcome, {adminName}</h2>
        <div className="header-buttons">
          <button className="report-btn" onClick={navigateToReports}>Reports</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main>
        <div className="header-actions-row">
          <h2 className="section-title">Tutor Verification Requests</h2>
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="stats-container">
          <div className="stats-box pending">
            <h3>Pending</h3>
            <p>{useCountUp(stats.pending)}</p> {/* 🔥 Animated Counter */}
          </div>
          <div className="stats-box approved">
            <h3>Approved</h3>
            <p>{useCountUp(stats.approved)}</p> {/* 🔥 Animated Counter */}
          </div>
          <div className="stats-box rejected">
            <h3>Rejected</h3>
            <p>{useCountUp(stats.rejected)}</p> {/* 🔥 Animated Counter */}
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
          <table className="verification-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTutors.length > 0 ? (
                filteredTutors.map((tutor) => (
                  <tr key={tutor._id}>
                    <td>{`${tutor.firstName} ${tutor.lastName}`}</td>
                    <td>{tutor.email}</td>
                    <td>
                      <span className={`status ${tutor.verificationStatus.toLowerCase()}`}>
                        {tutor.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => openModal(tutor)} className="view-btn">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No matching tutor requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>

      {selectedTutor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={closeModal} />

            <img
              src={selectedTutor.profilePicture || "/default-avatar.png"}
              alt="Profile"
              className="profile-pic"
            />

            <h3>{selectedTutor.firstName} {selectedTutor.lastName}</h3>
            <table className="tutor-details-table">
              <tbody>
                <tr>
                  <td><strong>Username:</strong></td>
                  <td>{selectedTutor.username}</td>
                </tr>
                <tr>
                  <td><strong>Email:</strong></td>
                  <td>{selectedTutor.email}</td>
                </tr>
                <tr>
                  <td><strong>Location:</strong></td>
                  <td>{selectedTutor.location || "N/A"}</td>
                </tr>
                <tr>
                  <td><strong>Subjects:</strong></td>
                  <td>{selectedTutor.subjects.length > 0 ? selectedTutor.subjects.join(", ") : "N/A"}</td>
                </tr>
                <tr>
                  <td><strong>Hourly Rate:</strong></td>
                  <td>{selectedTutor.hourlyRate ? `$${selectedTutor.hourlyRate}/hr` : "N/A"}</td>
                </tr>
                <tr>
                  <td><strong>Teaching Preferences:</strong></td>
                  <td>{selectedTutor.teachingPreferences || "N/A"}</td>
                </tr>
                <tr>
                  <td><strong>Qualifications:</strong></td>
                  <td>{selectedTutor.qualifications || "N/A"}</td>
                </tr>
                <tr>
                  <td><strong>Availability:</strong></td>
                  <td>
                    {selectedTutor.availability ? (
                      <ul>
                        {Object.entries(selectedTutor.availability).map(([day, times]) => (
                          <li key={day}><strong>{day}:</strong> {times.join(", ")}</li>
                        ))}
                      </ul>
                    ) : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td><strong>Bio:</strong></td>
                  <td>{selectedTutor.bio || "N/A"}</td>
                </tr>
                <tr>
                  <td><strong>Verification Status:</strong></td>
                  <td>
                    <span className={`status ${selectedTutor.verificationStatus.toLowerCase()}`}>
                      {selectedTutor.verificationStatus}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>Admin Comments:</strong></td>
                  <td>{selectedTutor.verificationComments || "N/A"}</td>
                </tr>
              </tbody>
            </table>

            {/* Accept & Reject Buttons */}
            <div className="modal-buttons">
              <button
                className="accept-btn"
                onClick={() => handleVerification("approved")}
                disabled={selectedTutor.verificationStatus.toLowerCase() === "approved"}
              >
                Accept
              </button>
              <button
                className="reject-btn"
                onClick={() => handleVerification("rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={() => setShowConfirmation(false)} />

            <h3>Confirm {action === "approved" ? "Approval" : "Rejection"}</h3>
            <textarea
              placeholder="Enter admin comments..."
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              className="comment-box"
            />

            <div className="modal-buttons">
              <button className="accept-btn" onClick={submitVerification}>Confirm</button>
              <button className="reject-btn" onClick={() => setShowConfirmation(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <footer className="admin-footer">
        <p>© 2025 Admin Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;