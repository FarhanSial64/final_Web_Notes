import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SuccessNotification from '../../Components/SuccessNotification';
import './CreateProject.css';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    deadline: '',
    isHourly: false,
    milestones: [],
  });
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    dueDate: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMilestoneChange = (e) => {
    const { name, value } = e.target;
    setNewMilestone(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMilestone = () => {
    if (!newMilestone.title || !newMilestone.dueDate) {
      setError('Please fill all milestone fields');
      return;
    }

    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));

    setNewMilestone({ title: '', dueDate: '' });
    setError('');
  };

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.title || !formData.budget || !formData.deadline) {
        throw new Error('Title, budget, and deadline are required');
      }

      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: Number(formData.budget),
        deadline: formData.deadline,
        isHourly: formData.isHourly,
        milestones: formData.milestones.map(m => ({
          title: m.title,
          dueDate: m.dueDate
        }))
      };

      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:5005/api/projects', projectData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setSuccessMessage('Project created successfully!');
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/client/my-projects');
        }, 5000);
      }
    } catch (err) {
      let errorMessage = 'Failed to create project';
      
      if (err.response) {
        errorMessage = err.response.data?.message || 
                     `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Is the backend running?';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Project creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-project-container">
      <h1>Create New Project</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label htmlFor="title">Project Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
              <option value="design">Design</option>
              <option value="writing">Writing</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="budget">Budget ($)*</label>
            <input
              type="number"
              id="budget"
              name="budget"
              min="0"
              value={formData.budget}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="deadline">Deadline*</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isHourly"
              name="isHourly"
              checked={formData.isHourly}
              onChange={handleChange}
            />
            <label htmlFor="isHourly">Hourly Project</label>
          </div>
        </div>

        <div className="milestones-section">
          <h3>Milestones (Optional)</h3>
          
          <div className="add-milestone">
            <div className="form-group">
              <label htmlFor="milestoneTitle">Milestone Title</label>
              <input
                type="text"
                id="milestoneTitle"
                name="title"
                value={newMilestone.title}
                onChange={handleMilestoneChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="milestoneDueDate">Due Date</label>
              <input
                type="date"
                id="milestoneDueDate"
                name="dueDate"
                value={newMilestone.dueDate}
                onChange={handleMilestoneChange}
              />
            </div>
            
            <button 
              type="button" 
              className="add-milestone-btn"
              onClick={addMilestone}
            >
              Add Milestone
            </button>
          </div>
          
          {formData.milestones.length > 0 && (
            <div className="milestones-list">
              <h4>Added Milestones:</h4>
              <ul>
                {formData.milestones.map((milestone, index) => (
                  <li key={index}>
                    <span>{milestone.title} - Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                    <button 
                      type="button" 
                      className="remove-milestone"
                      onClick={() => removeMilestone(index)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
      {showSuccess && (
        <SuccessNotification 
          message={successMessage} 
          onClose={() => {
            setShowSuccess(false);
            navigate('/client/my-projects');
          }} 
        />
      )}
    </div>
  );
};

export default CreateProject;