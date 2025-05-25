import axios from 'axios';

// Create a function to set up axios interceptors
export const setupAxiosInterceptors = (logout) => {
  console.log('Setting up axios interceptors');

  // Clear any existing interceptors to prevent duplicates
  axios.interceptors.request.eject(axios.interceptors.request.handlers?.[0]);
  axios.interceptors.response.eject(axios.interceptors.response.handlers?.[0]);

  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Don't log token verification requests to reduce noise
        if (!config.url.includes('verify-token')) {
          console.log(`Adding auth token to ${config.url}`);
        }
      }
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle 401 Unauthorized errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log(`Auth error (${error.response.status}) from ${error.config.url}. Logging out...`);
        // Call the logout function from AuthContext
        logout();
      }
      return Promise.reject(error);
    }
  );
};

// Export a function to get auth headers for individual requests
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Function to check if a token might be expired based on its structure
// This is a client-side check that doesn't guarantee validity but can help
// with quick checks without making a network request
export const isTokenExpired = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return true;

    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    // The middle part contains the payload (including exp timestamp)
    const payload = JSON.parse(atob(parts[1]));

    // Check if token has expiration and if it's expired
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    }

    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't parse the token, consider it expired
  }
};
