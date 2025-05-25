import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartComponent from "../../components/Reports/ChartComponent"; // Reusable chart component
import "../../assets/css/reports.css"; // Ensure you have styles for proper UI

const Reports = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState("popularSubjects");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Navigate to Tutor Verification Page
  const handleTutorVerification = () => {
    navigate("/adminDashboard");
  };

  // Handle Date Filter Change
  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  // Export Functionality (Example: Downloading Data as CSV)
  const handleExport = () => {
    const reportData = `Selected Report: ${selectedReport}\nStart Date: ${dateRange.start}\nEnd Date: ${dateRange.end}`;
    const blob = new Blob([reportData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="reports-container">
      {/* Header with Logout and Verification Buttons */}
      <div className="reports-header">
        <h2>Reports</h2>
        <div className="header-buttons">
          <button className="verify-btn" onClick={handleTutorVerification}>
            Review Tutor Applications
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="report-filters">
        <label>Select Report Type:</label>
        <select onChange={(e) => setSelectedReport(e.target.value)}>
          <option value="popularSubjects">Popular Subjects</option>
          <option value="sessionCompletion">Session Completion Rates</option>
          <option value="platformUsage">Platform Usage by City</option>
          <option value="userGrowth">User Growth Over Time</option>
        </select>

        {/* Date Range Filter */}
        <label>Start Date:</label>
        <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} />
        <label>End Date:</label>
        <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} />

        {/* Export Button */}
        <button className="export-btn" onClick={handleExport}>
          Export Report
        </button>
      </div>

      {/* Report Data (Conditional Rendering) */}
      <div className="report-content">
        {selectedReport === "popularSubjects" && <ChartComponent title="Popular Subjects" apiEndpoint="/api/reports/popular-subjects" />}
        {selectedReport === "sessionCompletion" && <ChartComponent title="Session Completion Rates" apiEndpoint="/api/reports/session-completion-rate" />}
        {selectedReport === "platformUsage" && <ChartComponent title="Platform Usage by City" apiEndpoint="/api/reports/usage-by-city" />}
        {selectedReport === "userGrowth" && <ChartComponent title="User Growth Over Time" apiEndpoint="/api/reports/user-growth" />}
      </div>

      {/* Footer */}
      <footer className="reports-footer">
        <p>© {new Date().getFullYear()} Your Platform Name. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Reports;
