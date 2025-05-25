import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfilePreview from "./ProfilePreview";
import "../../assets/css/Profile.css";

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    subjects: "",
    hourlyRate: "",
    location: "",
    availability: [],
    teachingPreferences: "online",
    qualifications: "",
    profilePicture: null, // Will hold the File object
  });

  const [previewImage, setPreviewImage] = useState(null); // For displaying the selected image
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");

  const maxSizeMB = 2; // Define your maximum size in MB
  const maxSizeInBytes = maxSizeMB * 1024 * 1024;

  // Fetch tutor data on component mount
  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        console.log("Token from localStorage:", token);
        const response = await axios.get("http://localhost:5000/api/tutors/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          let formattedAvailability = [];
          if (response.data.availability && Array.isArray(response.data.availability) && response.data.availability.every(item => typeof item === 'object' && item.day && Array.isArray(item.times))) {
            formattedAvailability = response.data.availability;
          } else if (response.data.availability && Array.isArray(response.data.availability)) {
            formattedAvailability = response.data.availability.reduce((acc, item) => {
              const [day, time] = item.split(" ");
              const dayEntry = acc.find(entry => entry.day === day);
              if (dayEntry) {
                dayEntry.times.push(time);
              } else {
                acc.push({ day, times: [time] });
              }
              return acc;
            }, []);
          }

          setFormData({
            ...response.data,
            subjects: response.data.subjects ? response.data.subjects.join(", ") : "",
            qualifications: response.data.qualifications ? response.data.qualifications.join(", ") : "",
            availability: formattedAvailability,
          });

          if (response.data.profilePicture) {
            setPreviewImage(response.data.profilePicture);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchTutorData();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > maxSizeInBytes) {
        setErrorMessage(`Profile picture is too large. Maximum size allowed is ${maxSizeMB}MB.`);
        setFormData({ ...formData, profilePicture: null });
        setPreviewImage(null);
        return;
      }
      setErrorMessage("");
      setFormData({ ...formData, profilePicture: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };


  const handleAvailabilityChange = (day, timeSlot) => {
    setFormData((prevState) => {
      const updatedAvailability = [...prevState.availability];
      const dayIndex = updatedAvailability.findIndex((item) => item.day === day);

      if (dayIndex !== -1) {
        if (updatedAvailability[dayIndex].times.includes(timeSlot)) {
          updatedAvailability[dayIndex].times = updatedAvailability[dayIndex].times.filter(
            (time) => time !== timeSlot
          );
        } else {
          updatedAvailability[dayIndex].times.push(timeSlot);
        }
      } else {
        updatedAvailability.push({ day, times: [timeSlot] });
      }

      return { ...prevState, availability: updatedAvailability };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "subjects" || key === "qualifications") {
          formDataToSend.append(key, formData[key].split(",").map((item) => item.trim()));
        } else if (key === "availability") {
          // Send the availability array directly
          formDataToSend.append(key, formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.put("http://localhost:5000/api/tutors/profile", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("Profile updated successfully!");
      // Optionally clear preview after successful upload
      //setPreviewImage(null);
      //setFormData({...formData, profilePicture: null});

    } catch (error) {
      setErrorMessage("Error updating profile. Try again.");
      console.error(error);
    }
  };

  return (
    <div className="profile-container">
      <h2>Tutor Profile Management</h2>
      {successMessage && <p className="success">{successMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="profile-form">

        {/* First Name & Last Name */}
        <div className="form-row">
          <div className="form-group">
            <label>First Name:</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
        </div>

        {/* Bio (Full-width) */}
        <div className="form-group">
          <label>Bio:</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} required />
        </div>

        {/* Subjects & Hourly Rate */}
        <div className="form-row">
          <div className="form-group">
            <label>Subjects:</label>
            <input type="text" name="subjects" value={formData.subjects} onChange={handleChange} required placeholder="e.g. Math, Physics" />
          </div>
          <div className="form-group">
            <label>Hourly Rate ($):</label>
            <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} required />
          </div>
        </div>

        {/* Qualifications & Location */}
        <div className="form-row">
          <div className="form-group">
            <label>Qualifications:</label>
            <input type="text" name="qualifications" value={formData.qualifications} onChange={handleChange} required placeholder="e.g. MSc Computer Science, PhD Mathematics" />
          </div>
          <div className="form-group">
            <label>Location:</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required />
          </div>
        </div>

        {/* Teaching Preferences (Full-width) */}
        <div className="form-group">
          <label>Teaching Preferences:</label>
          <select name="teachingPreferences" value={formData.teachingPreferences} onChange={handleChange}>
            <option value="online">Online</option>
            <option value="in-person">In-Person</option>
            <option value="both">Both</option>
          </select>
        </div>

        {/* Availability (Full-width) */}
        <div className="form-group availability-container">
          <label>Availability:</label>
          <div className="availability-grid">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
              <div key={day} className="availability-row">
                <div className="availability-day">{day}</div>
                <div className="availability-times">
                  {["10:00", "12:00", "14:00", "16:00", "18:00"].map((time) => (
                    <label key={time} className={`availability-slot ${formData.availability.some(item => item.day === day && item.times.includes(time)) ? 'selected' : ''}`}>
                      <input type="checkbox" checked={formData.availability.some(item => item.day === day && item.times.includes(time))} onChange={() => handleAvailabilityChange(day, time)} />
                      {time}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Picture Upload */}
        <div className="form-group">
          <label>Profile Picture:</label>
          <input type="file" name="profilePicture" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Image Preview */}
        {previewImage && (
          <div className="image-preview-container">
            <h3>Preview</h3>
            <img src={previewImage} alt="Profile Preview" />
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" disabled={!formData.firstName || !formData.lastName || !formData.bio || !formData.subjects || !formData.hourlyRate || !formData.location || !formData.qualifications}>
          Save Profile
        </button>
      </form>

      {/* Profile Preview */}
      <ProfilePreview formData={formData} previewImage={previewImage} />
    </div>
  );
};

export default ProfileForm;