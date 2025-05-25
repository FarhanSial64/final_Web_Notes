import React, { useEffect, useState } from "react";
import axios from "axios";
import SessionRequestCard from "../../components/Dashboard/SessionRequestCard";
import SessionCalendar from "../../components/Dashboard/SessionCalendar";
import EarningsTracker from "../../components/Dashboard/EarningsTracker";

const SessionManage = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earningsSummary, setEarningsSummary] = useState({
    totalEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
  });

  const API_URL = "http://localhost:5000/api/sessions";

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/tutor`, { headers: getAuthHeader() });
      setSessions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${API_URL}/earnings`, { headers: getAuthHeader() });
      setEarningsSummary(response.data);
    } catch (err) {
      console.error("Error fetching earnings summary:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchEarnings();
  }, []);

  const handleAction = async (sessionId, action) => {
    try {
      await axios.post(`${API_URL}/${sessionId}/${action}`, {}, { headers: getAuthHeader() });
      setSessions(
        sessions.map((s) =>
          s._id === sessionId ? { ...s, status: action, paymentStatus: action === "complete" ? "completed" : s.paymentStatus } : s
        )
      );
      fetchEarnings(); // Update earnings after status change
    } catch (error) {
      console.error(`Error performing action (${action}) on session ${sessionId}:`, error);
    }
  };

  if (isLoading) {
    return <p>Loading session data...</p>;
  }

  if (error) {
    return <p>Error loading session data: {error}</p>;
  }

  const pendingRequests = sessions.filter((session) => session.status === "pending");
  const acceptedSessionsForCompletion = sessions.filter(
    (session) => session.status === "accepted" && new Date(session.date) <= new Date()
  );
  const upcomingAcceptedSessions = sessions.filter(
    (session) => session.status === "accepted" && new Date(session.date) > new Date()
  );
  const pendingAndUpcoming = [...pendingRequests, ...upcomingAcceptedSessions];
  const completedSessions = sessions.filter((session) => session.status === "completed");

  return (
    <div className="session-manage-container">
      <h1>Manage Sessions</h1>

      <div className="session-requests-section">
        <h2>Pending Session Requests</h2>
        {pendingRequests.length > 0 ? (
          pendingRequests.map((session) => (
            <SessionRequestCard
              key={session._id}
              session={session}
              onAccept={() => handleAction(session._id, "accept")}
              onDecline={() => handleAction(session._id, "decline")}
            />
          ))
        ) : (
          <p>No pending session requests.</p>
        )}
      </div>

      <div className="session-actions-section">
        <h2>Mark Sessions as Completed</h2>
        {acceptedSessionsForCompletion.length > 0 ? (
          <ul>
            {acceptedSessionsForCompletion.map((session) => (
              <li key={session._id}>
                {session.subject} with {session.student?.username || "N/A"} on{" "}
                {new Date(session.date).toLocaleDateString()} at {session.time}
                <button onClick={() => handleAction(session._id, "complete")}>Mark as Completed</button>
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
        <EarningsTracker earningsSummary={earningsSummary} completedSessions={completedSessions} />
      </div>
    </div>
  );
};

export default SessionManage;