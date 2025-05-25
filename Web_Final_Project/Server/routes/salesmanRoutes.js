const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware'); // your middleware
const { isSalesman } = require('../middlewares/roleMiddleware'); // optional RBAC check

const {
  getSalesmanDashboard,
  getSalesmanOrders,
  updateOrderStatus,
  getSalesmanReport
} = require('../controllers/salesmanController');

// Apply authenticate and isSalesman middleware
router.get('/dashboard', authenticate, isSalesman, getSalesmanDashboard);
router.get('/orders', authenticate, isSalesman, getSalesmanOrders);
router.put('/order/:orderId/status', authenticate, isSalesman, updateOrderStatus);
router.get('/sales-report', authenticate, isSalesman, getSalesmanReport);

module.exports = router;
