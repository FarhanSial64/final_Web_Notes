import React, { useState, useEffect } from 'react';
import {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  getAllRoles
} from '../../services/adminService';
import './AdminUsers.css';
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaUserShield,
  FaUserCog,
  FaUserTag,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Fetch users and roles on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Define default roles in case we can't fetch them from the server
        const defaultRoles = [
          { _id: 'admin', name: 'admin' },
          { _id: 'customer', name: 'customer' },
          { _id: 'salesman', name: 'salesman' }
        ];

        try {
          const usersData = await getAllUsers();
          setUsers(usersData);

          // Try to get roles, but use defaults if it fails
          try {
            const rolesData = await getAllRoles();
            setRoles(rolesData);
          } catch (roleError) {
            console.warn('Could not fetch roles, using defaults:', roleError);
            setRoles(defaultRoles);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          setErrorMessage('Failed to load users. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) errors.phone = 'Phone is required';

    if (showAddModal && !formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (showAddModal && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) errors.role = 'Role is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add user
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const newUser = await addUser(formData);
      setUsers([...users, newUser]);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: ''
      });
      setSuccessMessage('User added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding user:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to add user');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const updatedUser = await updateUser(currentUser._id, formData);
      setUsers(users.map(user =>
        user._id === currentUser._id ? updatedUser : user
      ));
      setShowEditModal(false);
      setSuccessMessage('User updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update user');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await deleteUser(currentUser._id);
      setUsers(users.filter(user => user._id !== currentUser._id));
      setShowDeleteModal(false);
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal with user data
  const openEditModal = (user) => {
    setCurrentUser(user);

    // Determine the role ID to use in the form
    let roleId = '';
    if (typeof user.role === 'string') {
      roleId = user.role;
    } else if (user.role && user.role._id) {
      roleId = user.role._id;
    } else if (user.role && user.role.name) {
      // If we only have the name, find the matching role in our roles array
      const matchingRole = roles.find(r => r.name === user.role.name);
      roleId = matchingRole ? matchingRole._id : user.role.name;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '', // Don't set password for edit
      role: roleId
    });
    setShowEditModal(true);
  };

  // Open delete modal with user data
  const openDeleteModal = (user) => {
    setCurrentUser(user);
    setShowDeleteModal(true);
  };

  // Helper function to extract role name from user object
  const getRoleName = (user) => {
    if (!user) return '';

    // Handle different role formats
    if (typeof user.role === 'string') {
      return user.role;
    } else if (user.role && user.role.name) {
      return user.role.name;
    } else if (user.role && user.role._id) {
      return user.role._id;
    }

    return '';
  };

  // Get role badge class based on role name
  const getRoleBadgeClass = (user) => {
    const roleName = getRoleName(user)?.toLowerCase();

    switch(roleName) {
      case 'admin':
        return 'role-badge admin';
      case 'salesman':
        return 'role-badge salesman';
      case 'customer':
        return 'role-badge customer';
      default:
        return 'role-badge';
    }
  };

  // Get role icon based on role name
  const getRoleIcon = (user) => {
    const roleName = getRoleName(user)?.toLowerCase();

    switch(roleName) {
      case 'admin':
        return <FaUserShield />;
      case 'salesman':
        return <FaUserCog />;
      case 'customer':
        return <FaUserTag />;
      default:
        return <FaUserTag />;
    }
  };

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <h1>User Management</h1>
        <p>Manage all users and their roles</p>
      </div>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="success-message">
          <FaCheck /> {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="error-message">
          <FaTimes /> {errorMessage}
        </div>
      )}

      {/* Search and Add User */}
      <div className="admin-users-actions">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className="add-user-btn"
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              password: '',
              role: ''
            });
            setFormErrors({});
            setShowAddModal(true);
          }}
        >
          <FaUserPlus /> Add User
        </button>
      </div>

      {/* Users Table */}
      {loading && !users.length ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading users...</p>
        </div>
      ) : (
        <>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>
                        <span className={getRoleBadgeClass(user)}>
                          {getRoleIcon(user)}
                          {getRoleName(user)}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(user)}
                          title="Edit User"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => openDeleteModal(user)}
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-users">
                      {searchTerm ? 'No users match your search' : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > usersPerPage && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <FaArrowLeft /> Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next <FaArrowRight />
              </button>
            </div>
          )}
        </>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={formErrors.phone ? 'error' : ''}
                />
                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className={formErrors.password ? 'error' : ''}
                />
                {formErrors.password && <span className="error-text">{formErrors.password}</span>}
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={formErrors.role ? 'error' : ''}
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>
                      {role.name || role._id}
                    </option>
                  ))}
                </select>
                {formErrors.role && <span className="error-text">{formErrors.role}</span>}
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <FaSpinner className="spinner" /> : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit User</h2>
            <form onSubmit={handleEditUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={formErrors.email ? 'error' : ''}
                  disabled // Email should not be editable
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={formErrors.phone ? 'error' : ''}
                />
                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={formErrors.role ? 'error' : ''}
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>
                      {role.name || role._id}
                    </option>
                  ))}
                </select>
                {formErrors.role && <span className="error-text">{formErrors.role}</span>}
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <FaSpinner className="spinner" /> : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h2>Delete User</h2>
            <p>Are you sure you want to delete the user <strong>{currentUser?.name}</strong>?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="delete-confirm-btn"
                disabled={loading}
              >
                {loading ? <FaSpinner className="spinner" /> : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
