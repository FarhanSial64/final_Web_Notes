import axios from 'axios';

const BASE_URL = 'http://localhost:5000/email';

export const sendContactEmail = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/contact`, formData);
    return response.data; // optional: could return a message or success flag
  } catch (err) {
    console.error('Error sending contact email:', err);
    throw err;
  }
};
