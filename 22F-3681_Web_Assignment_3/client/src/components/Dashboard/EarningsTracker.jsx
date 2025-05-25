import React from 'react';

const EarningsTracker = ({ earningsSummary, completedSessions }) => {
  const pendingPaymentSessions = completedSessions.filter(session => session.paymentStatus === 'pending');
  const completedPaymentSessions = completedSessions.filter(session => session.paymentStatus === 'completed');

  return (
    <div className="earnings-tracker">
      <h3>Earnings Information</h3>

      <h4>Earnings Summary</h4>
      <p>Weekly Earnings: ${earningsSummary.weeklyEarnings?.toFixed(2) || '0.00'}</p>
      <p>Monthly Earnings: ${earningsSummary.monthlyEarnings?.toFixed(2) || '0.00'}</p>

      <h4>Session Earnings</h4>
      {completedSessions.length > 0 ? (
        <ul>
          {completedSessions.map(session => (
            <li key={session._id}>
              Session on {new Date(session.date).toLocaleDateString()} - Subject: {session.subject} - Earnings: ${session.earnings?.toFixed(2) || 'N/A'} - Payment Status: {session.paymentStatus}
            </li>
          ))}
        </ul>
      ) : (
        <p>No completed sessions yet.</p>
      )}

      <h4>Payment Status Breakdown</h4>
      <p>Sessions Pending Payment: {pendingPaymentSessions.length}</p>
      <p>Sessions Payment Completed: {completedPaymentSessions.length}</p>
    </div>
  );
};

export default EarningsTracker; 