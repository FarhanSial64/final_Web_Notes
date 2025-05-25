// src/services/adminService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/admin';

// Utility: Get properly formatted token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Get summary metrics for dashboard
export const getSummaryMetrics = async () => {
  try {
    console.log('Fetching summary metrics...');
    // Add authentication headers
    const response = await axios.get(`${BASE_URL}/metrics/summary`, {
      headers: getAuthHeader()
    });
    console.log('Summary metrics response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching summary metrics:', err?.response?.data || err.message);
    throw err;
  }
};

// Get order statistics
export const getOrderStats = async () => {
  try {
    console.log('Fetching order statistics...');
    // Add authentication headers
    const response = await axios.get(`${BASE_URL}/metrics/orders`, {
      headers: getAuthHeader()
    });
    console.log('Order statistics response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching order statistics:', err?.response?.data || err.message);
    throw err;
  }
};

// Get customer statistics
export const getCustomerStats = async () => {
  try {
    console.log('Fetching customer statistics...');
    // Add authentication headers
    const response = await axios.get(`${BASE_URL}/metrics/customers`, {
      headers: getAuthHeader()
    });
    console.log('Customer statistics response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching customer statistics:', err?.response?.data || err.message);
    throw err;
  }
};

// Get sales analytics data
export const getSalesAnalytics = async (period = 'monthly') => {
  try {
    console.log('Fetching sales analytics...');
    // Add authentication headers
    const response = await axios.get(`${BASE_URL}/metrics/sales-analytics`, {
      params: { period },
      headers: getAuthHeader()
    });
    console.log('Sales analytics response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching sales analytics:', err?.response?.data || err.message);
    throw err;
  }
};

// Get top products
export const getTopProducts = async (limit = 5) => {
  try {
    console.log('Fetching top products...');
    // Use debug route for testing, consistent with other endpoints
    const response = await axios.get(`${BASE_URL}/debug/products/top`, {
      params: { limit },
      headers: getAuthHeader()
    });
    console.log('Top products response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching top products:', err?.response?.data || err.message);
    throw err;
  }
};

// Get recent orders
export const getRecentOrders = async (limit = 5) => {
  try {
    console.log('Fetching recent orders...');
    // Use debug route for testing
    const response = await axios.get(`${BASE_URL}/debug/orders/recent`, {
      params: { limit },
      headers: getAuthHeader()
    });
    console.log('Recent orders response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching recent orders:', err?.response?.data || err.message);
    throw err;
  }
};

// Get product category sales
export const getProductCategorySales = async () => {
  try {
    console.log('Fetching product category sales...');
    // Use debug route for testing
    const response = await axios.get(`${BASE_URL}/debug/products/category-sales`, {
      headers: getAuthHeader()
    });
    console.log('Product category sales response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching product category sales:', err?.response?.data || err.message);
    throw err;
  }
};

// Get low stock products
export const getLowStockProducts = async (threshold = 10) => {
  try {
    console.log('Fetching low stock products...');
    // Use debug route for testing
    const response = await axios.get(`${BASE_URL}/debug/products/low-stock`, {
      params: { threshold },
      headers: getAuthHeader()
    });
    console.log('Low stock products response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching low stock products:', err?.response?.data || err.message);
    throw err;
  }
};

// Restock a product
export const restockProduct = async (productId, quantity) => {
  try {
    console.log(`Restocking product ${productId} with quantity ${quantity}...`);
    const response = await axios.post(
      `${BASE_URL}/products/${productId}/restock`,
      { quantity },
      { headers: getAuthHeader() }
    );
    console.log('Restock response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error restocking product:', err?.response?.data || err.message);
    throw err;
  }
};

// Get all users (for admin management)
export const getAllUsers = async () => {
  try {
    console.log('Fetching all users...');
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: getAuthHeader(),
    });
    console.log('Users response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching users:', err?.response?.data || err.message);
    throw err;
  }
};

// Get all roles
export const getAllRoles = async () => {
  try {
    console.log('Fetching all roles...');

    // First try to get roles from the API
    try {
      const response = await axios.get(`${BASE_URL}/roles`, {
        headers: getAuthHeader(),
      });
      console.log('Roles response:', response.data);
      return response.data;
    } catch (apiError) {
      console.warn('Could not fetch roles from API, using default roles:', apiError);

      // If API fails, return default roles
      return [
        { _id: 'admin', name: 'admin' },
        { _id: 'customer', name: 'customer' },
        { _id: 'salesman', name: 'salesman' }
      ];
    }
  } catch (err) {
    console.error('Error in getAllRoles:', err);
    throw err;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    console.log(`Fetching user with ID: ${userId}...`);
    const response = await axios.get(`${BASE_URL}/users/${userId}`, {
      headers: getAuthHeader(),
    });
    console.log('User response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching user:', err?.response?.data || err.message);
    throw err;
  }
};

// Add new user
export const addUser = async (userData) => {
  try {
    console.log('Adding new user:', userData);
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: getAuthHeader(),
    });
    console.log('Add user response:', response.data);
    return response.data.user;
  } catch (err) {
    console.error('Error adding user:', err?.response?.data || err.message);
    throw err;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    console.log(`Updating user with ID: ${userId}...`, userData);
    const response = await axios.put(`${BASE_URL}/users/${userId}`, userData, {
      headers: getAuthHeader(),
    });
    console.log('Update user response:', response.data);
    return response.data.user;
  } catch (err) {
    console.error('Error updating user:', err?.response?.data || err.message);
    throw err;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    console.log(`Deleting user with ID: ${userId}...`);
    const response = await axios.delete(`${BASE_URL}/users/${userId}`, {
      headers: getAuthHeader(),
    });
    console.log('Delete user response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error deleting user:', err?.response?.data || err.message);
    throw err;
  }
};

// Get all products (for admin management)
export const getAllProducts = async () => {
  try {
    console.log('Fetching all products...');
    const response = await axios.get(`${BASE_URL}/products`, {
      headers: getAuthHeader(),
    });
    console.log('Products response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching products:', err?.response?.data || err.message);
    throw err;
  }
};

// Get product by ID
export const getProductById = async (productId) => {
  try {
    console.log(`Fetching product with ID: ${productId}...`);
    const response = await axios.get(`${BASE_URL}/products/${productId}`, {
      headers: getAuthHeader(),
    });
    console.log('Product response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching product:', err?.response?.data || err.message);
    throw err;
  }
};

// Add new product
export const addProduct = async (productData) => {
  try {
    console.log('Adding new product:', productData);
    const response = await axios.post(`${BASE_URL}/products`, productData, {
      headers: getAuthHeader(),
    });
    console.log('Add product response:', response.data);
    return response.data.product;
  } catch (err) {
    console.error('Error adding product:', err?.response?.data || err.message);
    throw err;
  }
};

// Update product
export const updateProduct = async (productId, productData) => {
  try {
    console.log(`Updating product with ID: ${productId}...`, productData);
    const response = await axios.put(`${BASE_URL}/products/${productId}`, productData, {
      headers: getAuthHeader(),
    });
    console.log('Update product response:', response.data);
    return response.data.product;
  } catch (err) {
    console.error('Error updating product:', err?.response?.data || err.message);
    throw err;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    console.log(`Deleting product with ID: ${productId}...`);
    const response = await axios.delete(`${BASE_URL}/products/${productId}`, {
      headers: getAuthHeader(),
    });
    console.log('Delete product response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error deleting product:', err?.response?.data || err.message);
    throw err;
  }
};

// Get all orders (for admin management)
export const getAllOrders = async () => {
  try {
    console.log('Fetching all orders...');
    const response = await axios.get(`${BASE_URL}/orders`, {
      headers: getAuthHeader(),
    });
    console.log('Orders response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching orders:', err?.response?.data || err.message);
    throw err;
  }
};

// Create a new order (admin only)
export const createOrder = async (orderData) => {
  try {
    console.log('Creating new order:', orderData);
    const response = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: getAuthHeader(),
    });
    console.log('Create order response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error creating order:', err?.response?.data || err.message);
    throw err;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    console.log(`Fetching order with ID: ${orderId}...`);
    const response = await axios.get(`${BASE_URL}/orders/${orderId}`, {
      headers: getAuthHeader(),
    });
    console.log('Order details response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error fetching order details:', err?.response?.data || err.message);
    throw err;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    console.log(`Updating order status for ID: ${orderId}...`, statusData);
    const response = await axios.put(`${BASE_URL}/orders/${orderId}`, statusData, {
      headers: getAuthHeader(),
    });
    console.log('Update order status response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error updating order status:', err?.response?.data || err.message);
    throw err;
  }
};

// Delete order
export const deleteOrder = async (orderId) => {
  try {
    console.log(`Deleting order with ID: ${orderId}...`);
    const response = await axios.delete(`${BASE_URL}/orders/${orderId}`, {
      headers: getAuthHeader(),
    });
    console.log('Delete order response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error deleting order:', err?.response?.data || err.message);
    throw err;
  }
};

// Upload image
export const uploadImage = async (imageFile) => {
  try {
    console.log('Uploading image:', imageFile.name);
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(
      'http://localhost:5000/upload/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeader()
        }
      }
    );

    console.log('Image upload response:', response.data);
    return response.data.imageUrl;
  } catch (err) {
    console.error('Error uploading image:', err?.response?.data || err.message);
    throw err;
  }
};

// Change admin password
export const changeAdminPassword = async (passwordData) => {
  try {
    console.log('Changing admin password...');
    const response = await axios.post(
      `${BASE_URL}/settings/change-password`,
      passwordData,
      {
        headers: getAuthHeader()
      }
    );
    console.log('Change password response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error changing password:', err?.response?.data || err.message);
    throw err;
  }
};

// Reset user password (send reset email)
export const resetUserPassword = async (userId) => {
  try {
    console.log(`Sending password reset email for user ID: ${userId}...`);
    const response = await axios.post(
      `${BASE_URL}/settings/reset-user-password/${userId}`,
      {},
      {
        headers: getAuthHeader()
      }
    );
    console.log('Reset password response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error resetting user password:', err?.response?.data || err.message);
    throw err;
  }
};
