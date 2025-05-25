import React from 'react';
import './SpendingAnalytics.css';

const SpendingAnalytics = ({ totalSpent = 0, monthlySpendData }) => {
  const safeMonthlyData = Array.isArray(monthlySpendData) ? monthlySpendData : [];

  return (
    <div className="spending-analytics">
      <h2>Total Spent: ${totalSpent}</h2>
      <div className="spending-chart">
        <h3>Monthly Spend</h3>
        <div className="chart">
          {safeMonthlyData.length > 0 ? (
            safeMonthlyData.map((data, index) => (
              <div key={index} className="bar" style={{ height: `${data.amount}%` }}>
                <span>{data.month}</span>
              </div>
            ))
          ) : (
            <p>No monthly spend data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalytics;
