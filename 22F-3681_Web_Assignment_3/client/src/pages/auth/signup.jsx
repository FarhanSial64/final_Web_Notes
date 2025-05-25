import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/css/signupPage.css"; // Import the CSS file

function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "student",
    location: "",
    qualifications: "",
    hourlyRate: "",
    teachingPreferences: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(""); // Clear previous errors

    const { firstName, lastName, username, email, password, role } = formData;

    if (!firstName || !lastName || !username || !email || !password || !role) {
      setError("All required fields must be filled.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      alert("✅ Signup successful! Redirecting to login.");
      navigate("/login");
    } catch (error) {
      console.error("❌ Signup Error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="signup-background">
        {" "}
        {/* Dynamic Background */}
        <div className="signup-container">
          <h2>Signup</h2>
          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  placeholder="City"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <label>Role:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
            </select>

            {formData.role === "tutor" && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Qualifications:</label>
                    <input
                      type="text"
                      name="qualifications"
                      placeholder="Qualifications"
                      value={formData.qualifications}
                      onChange={handleChange}
                      required
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label>Hourly Rate ($):</label>
                    <input
                      type="number"
                      name="hourlyRate"
                      placeholder="Hourly Rate"
                      min="0"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <label>Teaching Preferences:</label>
                <select
                  name="teachingPreferences"
                  value={formData.teachingPreferences}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Teaching Preference</option>
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                  <option value="both">Both</option>
                </select>
              </>
            )}

            <button type="submit" className="submit-btn">
              Signup
            </button>
          </form>

          <p>
            Already have an account?{" "}
            <Link to="/login" className="link-text">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
