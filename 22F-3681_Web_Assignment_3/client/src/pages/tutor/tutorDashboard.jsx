import React from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../../components/Profile/ProfileForm";
import "../../assets/css/Profile.css";

const TutorDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="tutor-profile">
      <h1>Manage Your Tutor Profile</h1>
      <ProfileForm />

      {/* Manage Sessions Button */}
      <button
        className="session-btn"
        onClick={() => navigate("/tutor/dashboard/sessionManage")} // Corrected navigation path
      >
        Manage Sessions
      </button>
    </div>
  );
};

export default TutorDashboard;