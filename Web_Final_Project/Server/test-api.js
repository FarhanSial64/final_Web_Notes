const axios = require('axios');

// Test the admin API endpoints
const testAdminAPI = async () => {
  try {
    console.log('Testing admin API endpoints...');

    // Test the test endpoint
    try {
      const testResponse = await axios.get('http://localhost:5000/admin/test');
      console.log('Test endpoint response:', testResponse.data);
    } catch (err) {
      console.error('Error testing test endpoint:', err.message);
    }

    // Test the summary metrics endpoint
    try {
      const summaryResponse = await axios.get('http://localhost:5000/admin/metrics/summary');
      console.log('Summary metrics response:', summaryResponse.data);
    } catch (err) {
      console.error('Error testing summary metrics endpoint:', err.message);
    }

    // Test the order stats endpoint
    try {
      const orderStatsResponse = await axios.get('http://localhost:5000/admin/metrics/orders');
      console.log('Order stats response:', orderStatsResponse.data);
    } catch (err) {
      console.error('Error testing order stats endpoint:', err.message);
    }

    // Test the customer stats endpoint
    try {
      const customerStatsResponse = await axios.get('http://localhost:5000/admin/metrics/customers');
      console.log('Customer stats response:', customerStatsResponse.data);
    } catch (err) {
      console.error('Error testing customer stats endpoint:', err.message);
    }

    // Test the sales analytics endpoint
    try {
      const salesAnalyticsResponse = await axios.get('http://localhost:5000/admin/metrics/sales-analytics');
      console.log('Sales analytics response:', salesAnalyticsResponse.data);
    } catch (err) {
      console.error('Error testing sales analytics endpoint:', err.message);
    }

    console.log('API testing complete.');
  } catch (err) {
    console.error('Error testing admin API:', err.message);
  }
};

// Run the tests
testAdminAPI();
