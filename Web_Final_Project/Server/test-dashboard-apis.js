const axios = require('axios');

// Test the admin dashboard API endpoints
const testDashboardAPIs = async () => {
  try {
    console.log('Testing admin dashboard API endpoints...');

    // Test the top products endpoint
    try {
      const topProductsResponse = await axios.get('http://localhost:5000/admin/debug/products/top');
      console.log('Top products response:', topProductsResponse.data);
    } catch (err) {
      console.error('Error testing top products endpoint:', err.message);
    }

    // Test the recent orders endpoint
    try {
      const recentOrdersResponse = await axios.get('http://localhost:5000/admin/debug/orders/recent');
      console.log('Recent orders response:', recentOrdersResponse.data);
    } catch (err) {
      console.error('Error testing recent orders endpoint:', err.message);
    }

    // Test the category sales endpoint
    try {
      const categorySalesResponse = await axios.get('http://localhost:5000/admin/debug/products/category-sales');
      console.log('Category sales response:', categorySalesResponse.data);
    } catch (err) {
      console.error('Error testing category sales endpoint:', err.message);
    }

    // Test the low stock products endpoint
    try {
      const lowStockResponse = await axios.get('http://localhost:5000/admin/debug/products/low-stock');
      console.log('Low stock products response:', lowStockResponse.data);
    } catch (err) {
      console.error('Error testing low stock products endpoint:', err.message);
    }

    console.log('API testing complete.');
  } catch (err) {
    console.error('Error testing admin dashboard APIs:', err.message);
  }
};

// Run the tests
testDashboardAPIs();
