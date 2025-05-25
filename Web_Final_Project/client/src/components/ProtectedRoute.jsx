import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({
  requiredRole,
  redirectPath = '/login',
  children
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // This effect runs when authentication state changes
    console.log(`ProtectedRoute at ${location.pathname} - Auth state:`, {
      isAuthenticated,
      userRole: user?.role,
      loading
    });

    // Only mark checking as complete when loading is done
    if (!loading) {
      setIsChecking(false);
    }
  }, [isAuthenticated, user, loading, location.pathname]);

  // Show loading spinner while checking authentication
  if (loading || isChecking) {
    console.log('Still loading auth state, showing spinner');
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to', redirectPath);
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  // If a specific role is required, check if user has that role (case-insensitive)
  if (requiredRole && user && user.role) {
    const userRole = user.role.toLowerCase();
    const requiredRoleLower = requiredRole.toLowerCase();

    if (userRole !== requiredRoleLower) {
      console.log(`User role ${user.role} doesn't match required role ${requiredRole}`);

      // Redirect based on user's role (case-insensitive)
      if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === 'customer') {
        return <Navigate to="/" replace />;
      } else {
        return <Navigate to={redirectPath} replace />;
      }
    }
  } else if (requiredRole) {
    // If a role is required but user has no role, redirect to login
    console.log('User has no role but a role is required');
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  console.log('Access granted to protected route');
  // If there are children, render them, otherwise render the Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
