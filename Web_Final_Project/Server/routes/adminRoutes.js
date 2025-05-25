const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

const adminController = require('../controllers/adminController');
const settingsController = require('../controllers/settingsController');

// Test route to check if admin routes are accessible
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes are working!' });
});

// Debug route for top products
router.get('/debug/products/top', authenticate, isAdmin, (req, res) => {
  console.log('Debug route for top products called');
  adminController.getTopProducts(req, res);
});

// Debug route for recent orders
router.get('/debug/orders/recent', authenticate, isAdmin, (req, res) => {
  console.log('Debug route for recent orders called');
  adminController.getRecentOrders(req, res);
});

// Debug route for category sales
router.get('/debug/products/category-sales', authenticate, isAdmin, (req, res) => {
  console.log('Debug route for category sales called');
  adminController.getProductCategorySales(req, res);
});

// Debug route for low stock products
router.get('/debug/products/low-stock', authenticate, isAdmin, (req, res) => {
  console.log('Debug route for low stock products called');
  adminController.getLowStockProducts(req, res);
});

// User Management Routes
router.get('/users', authenticate, isAdmin, adminController.getAllUsers);
router.get('/users/:id', authenticate, isAdmin, adminController.getUserById);
router.post('/users', authenticate, isAdmin,  adminController.addUser);
router.put('/users/:id', authenticate, isAdmin, adminController.updateUser);
router.delete('/users/:id', authenticate, isAdmin, adminController.deleteUser);
router.get('/roles', authenticate, isAdmin, adminController.getAllRoles);

// Product Management Routes
router.get('/products', authenticate, isAdmin, adminController.getAllProducts);
router.get('/products/:id', authenticate, isAdmin, adminController.getProductById);
router.post('/products', authenticate, isAdmin, adminController.addProduct);
router.put('/products/:id', authenticate, isAdmin, adminController.updateProduct);
router.delete('/products/:id', authenticate, isAdmin, adminController.deleteProduct);

// Order Management Routes
router.get('/orders', authenticate, isAdmin, adminController.getAllOrders);
router.get('/orders/:id', authenticate, isAdmin, adminController.getOrderById);
router.post('/orders', authenticate, isAdmin, adminController.createOrder);
router.put('/orders/:id', authenticate, isAdmin, adminController.updateOrderStatus);
router.delete('/orders/:id', authenticate, isAdmin, adminController.deleteOrder);

// Admin Dashboard & Sales Report
router.get('/dashboard', authenticate, isAdmin, adminController.getDashboardStats);
router.get('/sales-report', authenticate, isAdmin, adminController.getSalesReport);

// Dashboard Metrics
// Restore authentication for all routes
router.get('/metrics/summary', authenticate, isAdmin, adminController.getSummaryMetrics);
router.get('/metrics/orders', authenticate, isAdmin, adminController.getOrderStats);
router.get('/metrics/customers', authenticate, isAdmin, adminController.getCustomerStats);
router.get('/metrics/sales-analytics', authenticate, isAdmin, adminController.getSalesAnalytics);
router.get('/products/top', authenticate, isAdmin, adminController.getTopProducts);
router.get('/orders/recent', authenticate, isAdmin, adminController.getRecentOrders);
router.get('/products/category-sales', authenticate, isAdmin, adminController.getProductCategorySales);
router.get('/products/low-stock', authenticate, isAdmin, adminController.getLowStockProducts);
router.post('/products/:productId/restock', authenticate, isAdmin, adminController.restockProduct);

// Settings Routes
router.post('/settings/change-password', authenticate, isAdmin, settingsController.changeAdminPassword);
router.post('/settings/reset-user-password/:userId', authenticate, isAdmin, settingsController.resetUserPassword);
router.post('/settings/generate-password/:userId', authenticate, isAdmin, settingsController.generateRandomPassword);

module.exports = router;
