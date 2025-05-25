import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SessionRequestCard from './SessionRequestCard';
import SessionCalendar from './SessionCalendar';
import EarningsTracker from './EarningsTracker';

const API_URL = '/api/sessions'; // Adjust if your base URL is different

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const SessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earningsSummary, setEarningsSummary] = useState({
    totalEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
  });

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/tutor`, { headers: getAuthHeader() });
      setSessions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${API_URL}/earnings`, { headers: getAuthHeader() });
      setEarningsSummary(response.data);
    } catch (err) {
      console.error('Error fetching earnings summary:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchEarnings();
    // Optionally set up a polling mechanism or WebSocket for real-time updates
  }, []);

  const updateSessionStatus = async (sessionId, newStatus) => {
    try {
      let response;
      switch (newStatus) {
        case 'accepted':
          response = await axios.post(`${API_URL}/${sessionId}/accept`, {}, { headers: getAuthHeader() });
          break;
        case 'declined':
          response = await axios.post(`${API_URL}/${sessionId}/decline`, {}, { headers: getAuthHeader() });
          break;
        case 'completed':
          response = await axios.post(`${API_URL}/${sessionId}/complete`, {}, { headers: getAuthHeader() });
          break;
        default:
          console.warn(`Unknown status: ${newStatus}`);
          return;
      }
      // Optimistically update the local state
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session._id === sessionId ? { ...session, status: newStatus, paymentStatus: newStatus === 'completed' ? 'completed' : session.paymentStatus } : session
        )
      );
      fetchEarnings(); // Update earnings after status change
    } catch (err) {
      setError(err.response?.data?.message || `Error updating session to ${newStatus}`);
    }
  };

  if (isLoading) {
    return <p>Loading session data...</p>;
  }

  if (error) {
    return <p>Error loading session data: {error}</p>;
  }

  const pendingRequests = sessions.filter(session => session.status === 'pending');
  const acceptedSessionsForCompletion = sessions.filter(
    session => session.status === 'accepted' && new Date(session.date) <= new Date()
  );
  const upcomingAcceptedSessions = sessions.filter(session => session.status === 'accepted' && new Date(session.date) > new Date());
  const pendingAndUpcoming = [...pendingRequests, ...upcomingAcceptedSessions];

  return (
    <div className="session-list-container">
      <h1>Tutor Dashboard</h1>

      <div className="session-management-section">
        <h2>Session Management</h2>
        <h3>Pending Session Requests</h3>
        {pendingRequests.length > 0 ? (
          pendingRequests.map(session => (
            <SessionRequestCard
              key={session._id}
              session={session}
              onAccept={() => updateSessionStatus(session._id, 'accepted')}
              onDecline={() => updateSessionStatus(session._id, 'declined')}
            />
          ))
        ) : (
          <p>No pending session requests.</p>
        )}

        <h3>Mark Sessions as Completed</h3>
        {acceptedSessionsForCompletion.length > 0 ? (
          <ul>
            {acceptedSessionsForCompletion.map(session => (
              <li key={session._id}>
                {session.subject} with {session.student?.username || 'N/A'} on {new Date(session.date).toLocaleDateString()} at {session.time}
                <button onClick={() => updateSessionStatus(session._id, 'completed')}>Mark as Completed</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No accepted sessions available to mark as completed.</p>
        )}
      </div>

      <div className="calendar-section">
        <h2>Upcoming Sessions</h2>
        <SessionCalendar sessions={pendingAndUpcoming} />
      </div>

      <div className="earnings-section">
        <h2>Earnings Tracker</h2>
        <EarningsTracker earningsSummary={earningsSummary} completedSessions={sessions.filter(s => s.status === 'completed')} />
      </div>
    </div>
  );
};

export default SessionList;