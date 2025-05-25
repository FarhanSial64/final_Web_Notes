import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/login";
import SignupPage from "./pages/auth/signup";
import StudentDashboard from "./pages/student/studentDashboard";
import TutorDashboard from "./pages/tutor/tutorDashboard";
import AdminDashboard from "./pages/admin/adminDashboard";
import Reports from "./pages/admin/Reprots";
import SessionList from "./pages/tutor/sessionManage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/tutor/dashboard" element={<TutorDashboard />} />
        <Route path="/tutor/dashboard/sessionManage" element={<SessionList />} /> 
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;
