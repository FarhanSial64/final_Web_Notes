// src/services/wishlistService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/wishlist';

// Utility: Get properly formatted token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// ✅ Fetch user's wishlist
export const getWishlist = async () => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching wishlist:', err?.response?.data || err.message);
    throw err;
  }
};

// ✅ Add item to wishlist using productCode
export const addToWishlist = async (productId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/add`,
      { productId  },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (err) {
    console.error('Error adding to wishlist:', err?.response?.data || err.message);
    throw err;
  }
};

// ✅ Remove item from wishlist using productCode
export const removeFromWishlist = async (productId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/remove`, {
      headers: getAuthHeader(),
      data: { productId },
    });
    return response.data;
  } catch (err) {
    console.error('Error removing from wishlist:', err?.response?.data || err.message);
    throw err;
  }
};
