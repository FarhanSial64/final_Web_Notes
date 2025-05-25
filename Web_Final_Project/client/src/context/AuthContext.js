import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { setupAxiosInterceptors, isTokenExpired } from '../utils/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Define logout as useCallback to avoid recreating the function on each render
  const logout = useCallback(() => {
    console.log('Logging out user...');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Also clear any other user-related data from localStorage
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    setUser(null);
    // Redirect to login page if needed (handled by ProtectedRoute)
  }, []);

  // Set up axios interceptors once when the component mounts
  useEffect(() => {
    if (!authInitialized) {
      setupAxiosInterceptors(logout);
      setAuthInitialized(true);
    }
  }, [logout, authInitialized]);

  // Function to verify token with the server
  const verifyToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      console.log('Verifying token...');
      // Make a request to a protected endpoint to verify the token
      const response = await axios.get('http://localhost:5000/user/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Token verification response:', response.status);
      return response.status === 200;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Check if user is logged in on initial load
    const loadUserAuth = async () => {
      console.log('Loading user authentication state...');
      setLoading(true);

      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          // Parse the stored user data
          const userData = JSON.parse(storedUser);
          console.log('Found stored user data:', userData.role);

          // Quick client-side check for expired token
          if (isTokenExpired()) {
            console.warn('Token appears to be expired based on client-side check');
            logout();
            setLoading(false);
            return;
          }

          // Set user immediately to prevent flashing login screen
          // This improves user experience while we verify with the server
          setUser(userData);

          // Verify the token with the server in the background
          console.log('Verifying token with server...');
          const isValid = await verifyToken();

          if (!isValid) {
            console.warn('Token validation failed, logging out');
            logout();
          } else {
            console.log('Token is valid, user already set');
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          logout(); // Use the logout function to clean up
        }
      } else {
        console.log('No stored user or token found');
      }

      console.log('Auth loading complete');
      setLoading(false);
    };

    loadUserAuth();
  }, [logout, verifyToken]);

  const login = (userData, token) => {
    console.log('AuthContext - Login with user data:', userData);
    console.log('AuthContext - User image:', userData.image);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Calculate authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Update isAuthenticated whenever user or token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAuth = !!user && !!token;
    console.log('Authentication state updated:', isAuth);
    setIsAuthenticated(isAuth);
  }, [user]);

  // Calculate role states
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isSalesman, setIsSalesman] = useState(false);

  // Update role states whenever user or authentication state changes
  useEffect(() => {
    if (isAuthenticated && user && user.role) {
      // Use case-insensitive comparison for roles
      const userRole = user.role.toLowerCase();
      setIsAdmin(userRole === 'admin');
      setIsCustomer(userRole === 'customer');
      setIsSalesman(userRole === 'salesman');
      console.log('Role states updated - Admin:', userRole === 'admin');
    } else {
      setIsAdmin(false);
      setIsCustomer(false);
      setIsSalesman(false);
      console.log('No valid role found, setting all role states to false');
    }
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isCustomer,
        isSalesman,
        verifyToken, // Expose the verifyToken function
        authInitialized // Expose the initialization state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
