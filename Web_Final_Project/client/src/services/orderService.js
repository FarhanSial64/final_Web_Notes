// src/services/orderService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/orders';

// Utility: Get properly formatted token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Place an order using the current cart
export const placeOrder = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}/place`,
      {}, // No body needed as the server will use the user's cart
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (err) {
    console.error('Error placing order:', err?.response?.data || err.message);
    throw err;
  }
};

// Get order history
export const getOrderHistory = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/history`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching order history:', err?.response?.data || err.message);
    throw err;
  }
};

// Track a specific order
export const trackOrder = async (orderId) => {
  try {
    const response = await axios.get(`${BASE_URL}/track/${orderId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (err) {
    console.error('Error tracking order:', err?.response?.data || err.message);
    throw err;
  }
};

// Cancel an order
export const cancelOrder = async (orderId) => {
  try {
    console.log('Sending cancel request to new endpoint:', `http://localhost:5000/cancel-order/${orderId}`);

    // Try the test route first
    try {
      const testResponse = await axios.get('http://localhost:5000/cancel-order/test');
      console.log('Test route response:', testResponse.data);
    } catch (testErr) {
      console.log('Test route failed:', testErr.message);
    }

    // Now try the actual PUT request with the new route
    const response = await axios.put(`http://localhost:5000/cancel-order/${orderId}`, {},
      { headers: getAuthHeader() }
    );

    console.log('Cancel order response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error cancelling order:', err?.response?.data || err.message);
    console.error('Full error object:', err);
    throw err;
  }
};
