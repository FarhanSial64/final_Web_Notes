import React, { useState, useEffect } from 'react';
import { 
  FaKey, 
  FaUser, 
  FaEnvelope, 
  FaSpinner, 
  FaCheck, 
  FaTimes, 
  FaSearch,
  FaPaperPlane,
  FaLock,
  FaUnlock,
  FaExclamationTriangle
} from 'react-icons/fa';
import { 
  changeAdminPassword, 
  resetUserPassword, 
  getAllUsers 
} from '../../services/adminService';
import './AdminSettings.css';

const AdminSettings = () => {
  // Admin password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStatus, setPasswordStatus] = useState({
    loading: false,
    success: false,
    error: false,
    message: ''
  });

  // User password reset state
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetStatus, setResetStatus] = useState({
    loading: false,
    success: false,
    error: false,
    message: ''
  });
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
        setLoadingUsers(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle admin password change form input
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    
    // Clear error for this field when user types
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({
        ...passwordErrors,
        [e.target.name]: ''
      });
    }
  };

  // Validate password change form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle admin password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setPasswordStatus({
      loading: true,
      success: false,
      error: false,
      message: ''
    });
    
    try {
      const response = await changeAdminPassword(passwordData);
      
      setPasswordStatus({
        loading: false,
        success: true,
        error: false,
        message: response.message || 'Password changed successfully'
      });
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordStatus(prev => ({
          ...prev,
          success: false,
          message: ''
        }));
      }, 3000);
      
    } catch (error) {
      setPasswordStatus({
        loading: false,
        success: false,
        error: true,
        message: error.response?.data?.message || 'Failed to change password'
      });
    }
  };

  // Handle user selection for password reset
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setResetStatus({
      loading: false,
      success: false,
      error: false,
      message: ''
    });
  };

  // Handle user password reset
  const handleResetUserPassword = async () => {
    if (!selectedUser) return;
    
    setResetStatus({
      loading: true,
      success: false,
      error: false,
      message: ''
    });
    
    try {
      const response = await resetUserPassword(selectedUser._id);
      
      setResetStatus({
        loading: false,
        success: true,
        error: false,
        message: response.message || 'Password reset email sent successfully'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setResetStatus(prev => ({
          ...prev,
          success: false,
          message: ''
        }));
      }, 3000);
      
    } catch (error) {
      setResetStatus({
        loading: false,
        success: false,
        error: true,
        message: error.response?.data?.message || 'Failed to reset user password'
      });
    }
  };

  return (
    <div className="admin-settings-page">
      <h1 className="admin-settings-title">Admin Settings</h1>
      
      <div className="admin-settings-container">
        {/* Admin Password Change Section */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FaKey className="settings-icon" />
            <h2>Change Admin Password</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={passwordErrors.currentPassword ? 'error' : ''}
                />
              </div>
              {passwordErrors.currentPassword && (
                <p className="error-message">{passwordErrors.currentPassword}</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-with-icon">
                <FaUnlock className="input-icon" />
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={passwordErrors.newPassword ? 'error' : ''}
                />
              </div>
              {passwordErrors.newPassword && (
                <p className="error-message">{passwordErrors.newPassword}</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="input-with-icon">
                <FaUnlock className="input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={passwordErrors.confirmPassword ? 'error' : ''}
                />
              </div>
              {passwordErrors.confirmPassword && (
                <p className="error-message">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            
            <button 
              type="submit" 
              className="settings-button"
              disabled={passwordStatus.loading}
            >
              {passwordStatus.loading ? (
                <><FaSpinner className="spinner" /> Changing Password...</>
              ) : (
                <>Change Password</>
              )}
            </button>
            
            {passwordStatus.success && (
              <p className="success-message">
                <FaCheck /> {passwordStatus.message}
              </p>
            )}
            
            {passwordStatus.error && (
              <p className="error-message">
                <FaTimes /> {passwordStatus.message}
              </p>
            )}
          </form>
        </div>
        
        {/* User Password Reset Section */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FaUser className="settings-icon" />
            <h2>Reset User Password</h2>
          </div>
          
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="users-list-container">
            {loadingUsers ? (
              <div className="loading-container">
                <FaSpinner className="spinner" />
                <p>Loading users...</p>
              </div>
            ) : (
              <div className="users-list">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div 
                      key={user._id} 
                      className={`user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                      <span className="user-role">{user.role?.name || 'N/A'}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-results">No users found</p>
                )}
              </div>
            )}
          </div>
          
          <div className="reset-action">
            {selectedUser ? (
              <>
                <div className="selected-user-info">
                  <p>
                    <strong>Selected User:</strong> {selectedUser.name} ({selectedUser.email})
                  </p>
                </div>
                <button 
                  className="settings-button"
                  onClick={handleResetUserPassword}
                  disabled={resetStatus.loading}
                >
                  {resetStatus.loading ? (
                    <><FaSpinner className="spinner" /> Sending Reset Email...</>
                  ) : (
                    <><FaPaperPlane /> Send Password Reset Email</>
                  )}
                </button>
              </>
            ) : (
              <p className="select-user-message">
                <FaExclamationTriangle /> Select a user to reset their password
              </p>
            )}
            
            {resetStatus.success && (
              <p className="success-message">
                <FaCheck /> {resetStatus.message}
              </p>
            )}
            
            {resetStatus.error && (
              <p className="error-message">
                <FaTimes /> {resetStatus.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
