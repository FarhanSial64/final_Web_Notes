import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const [user, setUser] = useState({
    _id: '',
    name: '',
    email: '',
    phone: '',
    skills: [],
    portfolio: [],
    bio: '',
    hourlyRate: '',
    availability: '',
    education: '',
    experience: '',
    languages: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    image: '',
    link: ''
  });
  const [editingPortfolioIndex, setEditingPortfolioIndex] = useState(-1);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication token not found');
          setIsLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = response.data;
        console.log('User data:', userData);

        // Set default values for fields that might not exist in the database
        setUser({
          _id: userData._id, // Make sure to store the user ID
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          skills: userData.skills || [],
          portfolio: userData.portfolio || [],
          bio: userData.bio || '',
          hourlyRate: userData.hourlyRate || '',
          availability: userData.availability || '',
          education: userData.education || '',
          experience: userData.experience || '',
          languages: userData.languages || []
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.message || 'Failed to fetch user data');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  // Handle skills
  const handleAddSkill = () => {
    if (newSkill.trim() && !user.skills.includes(newSkill.trim())) {
      setUser(prevUser => ({
        ...prevUser,
        skills: [...prevUser.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setUser(prevUser => ({
      ...prevUser,
      skills: prevUser.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Handle languages
  const handleAddLanguage = () => {
    if (newLanguage.trim() && !user.languages.includes(newLanguage.trim())) {
      setUser(prevUser => ({
        ...prevUser,
        languages: [...prevUser.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (languageToRemove) => {
    setUser(prevUser => ({
      ...prevUser,
      languages: prevUser.languages.filter(language => language !== languageToRemove)
    }));
  };

  // Handle portfolio items
  const handlePortfolioInputChange = (e) => {
    const { name, value } = e.target;
    setNewPortfolioItem(prevItem => ({
      ...prevItem,
      [name]: value
    }));
  };

  const handleAddPortfolioItem = () => {
    if (newPortfolioItem.title.trim() && newPortfolioItem.description.trim()) {
      if (editingPortfolioIndex >= 0) {
        // Update existing item
        const updatedPortfolio = [...user.portfolio];
        updatedPortfolio[editingPortfolioIndex] = newPortfolioItem;

        setUser(prevUser => ({
          ...prevUser,
          portfolio: updatedPortfolio
        }));

        setEditingPortfolioIndex(-1);
      } else {
        // Add new item
        setUser(prevUser => ({
          ...prevUser,
          portfolio: [...prevUser.portfolio, newPortfolioItem]
        }));
      }

      // Reset form
      setNewPortfolioItem({
        title: '',
        description: '',
        image: '',
        link: ''
      });
    }
  };

  const handleEditPortfolioItem = (index) => {
    setNewPortfolioItem(user.portfolio[index]);
    setEditingPortfolioIndex(index);
  };

  const handleRemovePortfolioItem = (index) => {
    setUser(prevUser => ({
      ...prevUser,
      portfolio: prevUser.portfolio.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found');
        setIsLoading(false);
        return;
      }

      // Include the user ID in the URL
      const userId = user._id; // Get the user ID from the user object
      if (!userId) {
        setError('User ID not found');
        setIsLoading(false);
        return;
      }

      // Extract only the fields that the backend controller expects
      const updateData = {
        name: user.name,
        phone: user.phone,
        skills: user.skills,
        // Only include preferences if it exists
        ...(user.preferences && { preferences: user.preferences })
      };

      console.log('Sending update data:', updateData);

      const response = await axios.put(
        `http://localhost:5006/api/users/${userId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Profile updated:', response.data);
      setSuccessMessage('Profile updated successfully!');

      // Show success message for 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      setIsLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);

      // Provide more specific error messages based on the error
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);

        if (err.response.status === 404) {
          setError('User not found. Please try logging in again.');
        } else if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(err.response.data?.message || 'Failed to update profile');
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request made but no response received:', err.request);
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', err.message);
        setError('Error setting up request: ' + err.message);
      }

      setIsLoading(false);
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const requiredFields = [
      'name', 'email', 'phone', 'bio', 'hourlyRate',
      'availability', 'education', 'experience'
    ];

    const hasSkills = user.skills.length > 0;
    const hasPortfolio = user.portfolio.length > 0;
    const hasLanguages = user.languages.length > 0;

    let completedFields = 0;

    requiredFields.forEach(field => {
      if (user[field]) completedFields++;
    });

    if (hasSkills) completedFields++;
    if (hasPortfolio) completedFields++;
    if (hasLanguages) completedFields++;

    const totalFields = requiredFields.length + 3; // +3 for skills, portfolio, languages
    return Math.round((completedFields / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Loading state
  if (isLoading && !user.name) {
    return (
      <div className="profile-settings">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-settings">
      <div className="profile-header">
        <h2>Profile Settings</h2>
        <p>Manage your personal and professional details.</p>

        <div className="profile-completion-container">
          <div className="profile-completion-info">
            <h3>Profile Completion</h3>
            <span>{profileCompletion}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Personal Information</h3>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={user.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleInputChange}
              required
              disabled // Email should not be editable
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={user.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Professional Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={user.bio || ''}
              onChange={handleInputChange}
              rows="4"
              placeholder="Write a short professional bio..."
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <h3>Professional Details</h3>

          <div className="form-group">
            <label htmlFor="hourlyRate">Hourly Rate ($)</label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={user.hourlyRate || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="e.g. 25.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              name="availability"
              value={user.availability || ''}
              onChange={handleInputChange}
            >
              <option value="">Select availability</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="weekends">Weekends only</option>
              <option value="flexible">Flexible hours</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="education">Education</label>
            <textarea
              id="education"
              name="education"
              value={user.education || ''}
              onChange={handleInputChange}
              rows="3"
              placeholder="Your educational background..."
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="experience">Work Experience</label>
            <textarea
              id="experience"
              name="experience"
              value={user.experience || ''}
              onChange={handleInputChange}
              rows="3"
              placeholder="Your relevant work experience..."
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <h3>Skills</h3>

          <div className="skills-container">
            {user.skills.map((skill, index) => (
              <div key={index} className="skill-tag">
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="add-skill-form">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill..."
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="add-btn"
            >
              Add
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>Languages</h3>

          <div className="skills-container">
            {user.languages.map((language, index) => (
              <div key={index} className="skill-tag">
                <span>{language}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLanguage(language)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="add-skill-form">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add a language..."
            />
            <button
              type="button"
              onClick={handleAddLanguage}
              className="add-btn"
            >
              Add
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>Portfolio</h3>

          <div className="portfolio-items">
            {user.portfolio.map((item, index) => (
              <div key={index} className="portfolio-item">
                <h4>{item.title}</h4>
                <p>{item.description}</p>

                {item.link && (
                  <p>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      View Project
                    </a>
                  </p>
                )}

                <div className="portfolio-actions">
                  <button
                    type="button"
                    onClick={() => handleEditPortfolioItem(index)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePortfolioItem(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="portfolio-form">
            <h4>{editingPortfolioIndex >= 0 ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h4>

            <div className="form-group">
              <label htmlFor="portfolio-title">Title</label>
              <input
                type="text"
                id="portfolio-title"
                name="title"
                value={newPortfolioItem.title}
                onChange={handlePortfolioInputChange}
                placeholder="Project title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="portfolio-description">Description</label>
              <textarea
                id="portfolio-description"
                name="description"
                value={newPortfolioItem.description}
                onChange={handlePortfolioInputChange}
                rows="3"
                placeholder="Project description"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="portfolio-image">Image URL</label>
              <input
                type="text"
                id="portfolio-image"
                name="image"
                value={newPortfolioItem.image}
                onChange={handlePortfolioInputChange}
                placeholder="URL to project image"
              />
            </div>

            <div className="form-group">
              <label htmlFor="portfolio-link">Project Link</label>
              <input
                type="text"
                id="portfolio-link"
                name="link"
                value={newPortfolioItem.link}
                onChange={handlePortfolioInputChange}
                placeholder="URL to live project"
              />
            </div>

            <div className="portfolio-form-actions">
              {editingPortfolioIndex >= 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPortfolioIndex(-1);
                    setNewPortfolioItem({
                      title: '',
                      description: '',
                      image: '',
                      link: ''
                    });
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={handleAddPortfolioItem}
                className="add-btn"
              >
                {editingPortfolioIndex >= 0 ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="save-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
