import React from "react";
import "../../assets/css/Profile.css";

const ProfilePreview = ({ formData, previewImage }) => {
  return (
    <div className="profile-preview">
      <h3>Profile Preview</h3>
      <div className="profile-card">
        {/* Profile Image */}
        <img src={previewImage || "https://via.placeholder.com/150"} alt="Profile Preview" />

        {/* Name */}
        <h4>{formData.firstName} {formData.lastName}</h4>

        {/* Profile Details Grid */}
        <div className="profile-details">
          <div className="detail-box">
            <span className="detail-title">Bio:</span>
            <span className="detail-content">{formData.bio}</span>
          </div>

          <div className="detail-box">
            <span className="detail-title">Subjects:</span>
            <span className="detail-content">{formData.subjects}</span>
          </div>

          <div className="detail-box">
            <span className="detail-title">Hourly Rate:</span>
            <span className="detail-content">${formData.hourlyRate}</span>
          </div>

          <div className="detail-box">
            <span className="detail-title">Location:</span>
            <span className="detail-content">{formData.location}</span>
          </div>

          <div className="detail-box">
            <span className="detail-title">Teaching Preferences:</span>
            <span className="detail-content">{formData.teachingPreferences}</span>
          </div>

          <div className="detail-box">
            <span className="detail-title">Qualifications:</span>
            <span className="detail-content">{formData.qualifications}</span>
          </div>
        </div>

        {/* Availability Section */}
        <div className="availability-preview">
          <h4>Availability</h4>
          {formData.availability.length > 0 ? (
            <ul>
              {formData.availability.map((entry, index) => (
                <li key={index}>
                  <strong>{entry.day}:</strong> {entry.times.join(", ")}
                </li>
              ))}
            </ul>
          ) : (
            <p>No availability set.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
