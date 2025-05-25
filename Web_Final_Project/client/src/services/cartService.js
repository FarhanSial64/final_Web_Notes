// src/services/cartService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/cart';

// Utility: Get properly formatted token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Fetch user's cart
export const getCart = async () => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching cart:', err?.response?.data || err.message);
    throw err;
  }
};

// Add item to cart
export const addToCart = async (productId, quantity = 1) => {
  try {
    // Get the product details first to get the productCode
    const productResponse = await axios.get(`http://localhost:5000/products/id/${productId}`, {
      headers: getAuthHeader()
    });

    const productCode = productResponse.data.productCode;

    if (!productCode) {
      throw new Error('Product code not found');
    }

    const response = await axios.post(
      `${BASE_URL}/add`,
      { productCode, quantity },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (err) {
    console.error('Error adding to cart:', err?.response?.data || err.message);
    throw err;
  }
};

// Update cart item quantity
export const updateCartItem = async (productId, quantity) => {
  try {
    // Get the product details first to get the productCode
    const productResponse = await axios.get(`http://localhost:5000/products/id/${productId}`, {
      headers: getAuthHeader()
    });

    const productCode = productResponse.data.productCode;

    if (!productCode) {
      throw new Error('Product code not found');
    }

    const response = await axios.put(
      `${BASE_URL}/update`,
      { productCode, quantity },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (err) {
    console.error('Error updating cart item:', err?.response?.data || err.message);
    throw err;
  }
};

// Remove item from cart
export const removeCartItem = async (productId) => {
  try {
    // Get the product details first to get the productCode
    const productResponse = await axios.get(`http://localhost:5000/products/id/${productId}`, {
      headers: getAuthHeader()
    });

    const productCode = productResponse.data.productCode;

    if (!productCode) {
      throw new Error('Product code not found');
    }

    const response = await axios.delete(`${BASE_URL}/remove/${productCode}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (err) {
    console.error('Error removing from cart:', err?.response?.data || err.message);
    throw err;
  }
};
