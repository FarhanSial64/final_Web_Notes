// pages/Admin/AdminProfile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCamera, 
  FaSpinner, 
  FaCheck, 
  FaTimes,
  FaArrowLeft
} from 'react-icons/fa';
import './AdminProfile.css';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', image: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [status, setStatus] = useState({ loading: false, success: false, error: false });
  const [imageKey, setImageKey] = useState(Date.now()); // Used to force image reload

  // Function to force reload an image from the server
  const forceImageReload = (imageUrl) => {
    if (!imageUrl) return null;

    try {
      // First, make sure we have a properly formatted URL
      let formattedUrl = imageUrl;

      // Handle relative paths
      if (!formattedUrl.startsWith('http')) {
        // Check if the path already includes /uploads/ to avoid duplication
        if (formattedUrl.startsWith('/uploads/')) {
          formattedUrl = `http://localhost:5000${formattedUrl}`;
        } else {
          formattedUrl = `http://localhost:5000/uploads/${formattedUrl}`;
        }
      }

      // Remove any existing cache-busting parameters
      formattedUrl = formattedUrl.includes('?') ? formattedUrl.split('?')[0] : formattedUrl;

      // Add a new cache-busting parameter
      const finalUrl = `${formattedUrl}?t=${Date.now()}`;

      console.log('Forcing image reload with URL:', finalUrl);
      setImageKey(Date.now()); // Update key to force re-render
      return finalUrl;
    } catch (err) {
      console.error('Error in forceImageReload:', err);
      return imageUrl; // Return original URL as fallback
    }
  };

  useEffect(() => {
    // Track if component is mounted
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/user/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        // Only update state if component is still mounted
        if (!isMounted) return;

        console.log('Fetched profile data:', data);
        setUser(data);
        setFormData({ name: data.name, phone: data.phone, address: data.address, image: data.image });

        // Handle image loading with preloading
        if (data.image) {
          // Determine if it's a relative or absolute path
          let fullImageUrl = data.image;
          if (!fullImageUrl.startsWith('http')) {
            // Check if the path already includes /uploads/ to avoid duplication
            if (fullImageUrl.startsWith('/uploads/')) {
              fullImageUrl = `http://localhost:5000${fullImageUrl}`;
            } else {
              fullImageUrl = `http://localhost:5000/uploads/${fullImageUrl}`;
            }
          }

          // Add a timestamp to force a fresh load
          const timestamp = Date.now();
          const timestampedUrl = `${fullImageUrl}?t=${timestamp}`;
          console.log('Initial image URL:', timestampedUrl);

          // Set the image URL immediately
          setImageKey(timestamp);
          setPreviewImage(timestampedUrl);

          // Also try preloading in parallel
          const img = new Image();
          img.onload = () => {
            if (!isMounted) return; // Check if component is still mounted
            console.log('Initial image preloaded successfully');
            // No need to update the preview as it's already set
          };
          img.onerror = () => {
            if (!isMounted) return; // Check if component is still mounted
            console.error('Failed to preload initial image');
            // Keep the preview URL as it might still work in the actual img tag
          };
          img.src = timestampedUrl;
        } else {
          setPreviewImage(null);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };

    fetchProfile();

    // Cleanup function to release object URLs and prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  // Effect to clean up object URLs when previewImage changes
  useEffect(() => {
    // Only run cleanup when previewImage is set and it's an object URL
    if (previewImage && previewImage.startsWith('blob:')) {
      // Store the current URL for cleanup
      const currentUrl = previewImage;

      // Return cleanup function
      return () => {
        // Only revoke if the preview image has changed (meaning we're not using this URL anymore)
        if (previewImage !== currentUrl) {
          URL.revokeObjectURL(currentUrl);
          console.log('Revoked object URL:', currentUrl);
        }
      };
    }
  }, [previewImage]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file) {
        console.log('Selected new image file:', file.name, 'type:', file.type, 'size:', file.size);

        // Validate file type
        if (!file.type.match('image.*')) {
          console.error('File is not an image:', file.type);
          alert('Please select an image file (JPEG, PNG, etc.)');
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.error('File is too large:', file.size);
          alert('Image file is too large. Please select an image smaller than 5MB.');
          return;
        }

        // Revoke any previous object URL to prevent memory leaks
        if (previewImage && previewImage.startsWith('blob:')) {
          URL.revokeObjectURL(previewImage);
        }

        // Create a local object URL for preview
        const objectUrl = URL.createObjectURL(file);
        console.log('Created object URL for preview:', objectUrl);

        setFormData({ ...formData, image: file });
        setPreviewImage(objectUrl); // Preview before upload
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: false });

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('address', formData.address);

      if (formData.image instanceof File) {
        data.append('image', formData.image);
      }

      console.log('Submitting profile update with data:', {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        hasImage: formData.image instanceof File
      });

      const response = await axios.put('http://localhost:5000/user/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('Profile update response:', response.data);
      const updatedUser = response.data.user;

      console.log('Raw updated user data:', updatedUser);

      // Handle the image update with multiple approaches to ensure it loads
      if (updatedUser.image) {
        try {
          // Determine if it's a relative or absolute path
          let fullImageUrl = updatedUser.image;
          if (!fullImageUrl.startsWith('http')) {
            // Check if the path already includes /uploads/ to avoid duplication
            if (fullImageUrl.startsWith('/uploads/')) {
              fullImageUrl = `http://localhost:5000${fullImageUrl}`;
            } else {
              fullImageUrl = `http://localhost:5000/uploads/${fullImageUrl}`;
            }
          }

          console.log('Server returned image path:', updatedUser.image);
          console.log('Full image URL constructed:', fullImageUrl);

          // IMMEDIATE APPROACH: Set the image URL right away with cache busting
          // This ensures the UI updates immediately without waiting for checks
          const timestamp = Date.now();
          const immediateUrl = `${fullImageUrl}?t=${timestamp}`;
          console.log('Setting immediate preview URL:', immediateUrl);

          // Force a complete re-render by updating both the URL and the key
          setImageKey(timestamp);

          // Use a small timeout to ensure the DOM has time to process
          setTimeout(() => {
            setPreviewImage(immediateUrl);
          }, 50);

          // In parallel, verify the image exists to ensure it's valid
          fetch(fullImageUrl, { method: 'HEAD', cache: 'no-cache' })
            .then(response => {
              console.log('Image HEAD request response:', response.status);
              if (!response.ok) {
                console.error('Image not found on server:', fullImageUrl);
                // If verification fails, we'll keep the immediate URL since it might still work
              }
            })
            .catch(err => {
              console.error('Error checking image existence:', err);
              // Even if the check fails, keep the immediate URL
            });
        } catch (err) {
          console.error('Error handling image update:', err);
          // If there's an error in the URL construction, don't change the preview
        }
      }

      setStatus({ loading: false, success: true, error: false });
      setUser(updatedUser);
      setFormData({
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        image: updatedUser.image,
      });
    } catch (err) {
      console.error('Update failed', err);
      setStatus({ loading: false, success: false, error: true });
    }
  };

  if (!user) return (
    <div className="admin-profile-page loading">
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading your profile...</p>
      </div>
    </div>
  );

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-container">
        <div className="admin-profile-header">
          <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h2>Admin Profile</h2>
          <p className="admin-profile-subtitle">Manage your personal information</p>
        </div>

        <div className="admin-profile-content">
          <div className="admin-profile-image-section">
            {previewImage ? (
              <div className="admin-profile-image-container">
                <img
                  key={`profile-img-${imageKey}`} // Use imageKey to force re-render
                  src={previewImage}
                  alt="Profile"
                  className="admin-profile-preview"
                  loading="eager" // Force eager loading
                  decoding="sync" // Force synchronous decoding
                  onLoad={() => console.log('Image loaded successfully in UI:', previewImage)}
                  onError={(e) => {
                    console.error('Image failed to load in UI:', previewImage);
                    e.target.onerror = null; // Prevent infinite loop

                    // Try to reload the image once with a new cache-busting parameter
                    if (!e.target.dataset.retried && previewImage && !previewImage.startsWith('blob:')) {
                      console.log('Retrying image load with new cache-busting parameter');
                      e.target.dataset.retried = 'true';
                      const reloadedUrl = forceImageReload(previewImage);
                      if (reloadedUrl) {
                        e.target.src = reloadedUrl;
                        return;
                      }
                    }

                    e.target.style.display = 'none'; // Hide the broken image

                    // Show placeholder instead
                    if (!e.target.parentNode.querySelector('.admin-profile-image-placeholder')) {
                      const placeholder = document.createElement('div');
                      placeholder.className = 'admin-profile-image-placeholder';
                      placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>';
                      e.target.parentNode.appendChild(placeholder);
                    }
                  }}
                  crossOrigin="anonymous" // Try to avoid CORS issues
                />
              </div>
            ) : (
              <div className="admin-profile-image-placeholder">
                <FaUser />
              </div>
            )}
            <div className="admin-image-upload-container">
              <label htmlFor="image-upload" className="admin-image-upload-label">
                <FaCamera /> Change Photo
              </label>
              <input
                id="image-upload"
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
                className="admin-image-upload-input"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admin-profile-form">
            <div className="admin-form-group">
              <label><FaUser /> Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="admin-form-group">
              <label><FaPhone /> Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="admin-form-group">
              <label><FaMapMarkerAlt /> Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-update-button" disabled={status.loading}>
                {status.loading ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>

            {status.success && (
              <div className="admin-success-message">
                <FaCheck className="message-icon" /> Profile updated successfully!
              </div>
            )}

            {status.error && (
              <div className="admin-error-message">
                <FaTimes className="message-icon" /> Failed to update profile.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
