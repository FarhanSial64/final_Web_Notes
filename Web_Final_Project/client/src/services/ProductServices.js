import axios from 'axios';

const BASE_URL = 'http://localhost:5000/products';

export const getProducts = async (params = {}) => {
  try {
    const response = await axios.get(BASE_URL, { params });
    return response.data; // returns { products, total }
  } catch (err) {
    console.error('Error fetching products:', err);
    throw err;
  }
};
