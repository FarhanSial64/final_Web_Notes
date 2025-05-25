import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  AccountCircle
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(authUser);
  const [profileImage, setProfileImage] = useState(null);
  const [imageKey, setImageKey] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();

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

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const { data } = await axios.get('http://localhost:5000/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('AdminLayout - Fetched profile data:', data);
        setUser(data);

        // Handle image loading
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
          console.log('AdminLayout - Image URL:', timestampedUrl);

          setImageKey(timestamp);
          setProfileImage(timestampedUrl);
        }
      } catch (err) {
        console.error('Failed to fetch profile in AdminLayout', err);
      }
    };

    fetchUserProfile();
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Create menu items with dynamic icon colors based on selected state
  const menuItems = [
    {
      text: 'Dashboard',
      icon: location.pathname === '/admin/dashboard'
        ? <DashboardIcon sx={{ color: 'primary.main !important' }} />
        : <DashboardIcon sx={{ color: '#666666 !important' }} />,
      path: '/admin/dashboard'
    },
    {
      text: 'Users',
      icon: location.pathname === '/admin/users'
        ? <PeopleIcon sx={{ color: 'primary.main !important' }} />
        : <PeopleIcon sx={{ color: '#666666 !important' }} />,
      path: '/admin/users'
    },
    {
      text: 'Products',
      icon: location.pathname === '/admin/products'
        ? <InventoryIcon sx={{ color: 'primary.main !important' }} />
        : <InventoryIcon sx={{ color: '#666666 !important' }} />,
      path: '/admin/products'
    },
    {
      text: 'Orders',
      icon: location.pathname === '/admin/orders'
        ? <ShoppingCartIcon sx={{ color: 'primary.main !important' }} />
        : <ShoppingCartIcon sx={{ color: '#666666 !important' }} />,
      path: '/admin/orders'
    },
    {
      text: 'Settings',
      icon: location.pathname === '/admin/settings'
        ? <SettingsIcon sx={{ color: 'primary.main !important' }} />
        : <SettingsIcon sx={{ color: '#666666 !important' }} />,
      path: '/admin/settings'
    }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {profileImage ? (
              <Avatar
                key={`avatar-${imageKey}`}
                src={profileImage}
                alt={user?.name || 'User'}
                imgProps={{
                  onError: (e) => {
                    console.error('Error loading avatar image:', profileImage);
                    e.target.onerror = null; // Prevent infinite loop

                    // Try to reload the image once with a new cache-busting parameter
                    if (!e.target.dataset.retried) {
                      console.log('Retrying avatar image load with new cache-busting parameter');
                      e.target.dataset.retried = 'true';
                      const reloadedUrl = forceImageReload(profileImage);
                      if (reloadedUrl) {
                        e.target.src = reloadedUrl;
                        return;
                      }
                    }

                    e.target.src = ''; // Clear the src to show the fallback
                  }
                }}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => navigate('/admin/profile')}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          {user && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar
                key={`sidebar-avatar-${imageKey}`}
                src={profileImage}
                alt={user?.name || 'User'}
                sx={{ width: 80, height: 80, mb: 1 }}
                imgProps={{
                  onError: (e) => {
                    console.error('Error loading sidebar avatar image:', profileImage);
                    e.target.onerror = null; // Prevent infinite loop

                    // Try to reload the image once with a new cache-busting parameter
                    if (!e.target.dataset.retried) {
                      console.log('Retrying sidebar avatar image load with new cache-busting parameter');
                      e.target.dataset.retried = 'true';
                      const reloadedUrl = forceImageReload(profileImage);
                      if (reloadedUrl) {
                        e.target.src = reloadedUrl;
                        return;
                      }
                    }

                    e.target.src = ''; // Clear the src to show the fallback
                  }
                }}
              />
              <Typography variant="subtitle1" fontWeight="bold">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="caption" color="primary" sx={{ textTransform: 'uppercase' }}>
                Administrator
              </Typography>
            </Box>
          )}
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  cursor: 'pointer',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>
                <LogoutIcon sx={{ color: '#666666 !important' }} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
