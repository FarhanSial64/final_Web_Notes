import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// Microservice Base URLs from environment variables or default to localhost for local development
const services = {
  auth: process.env.AUTH_SERVICE || 'http://localhost:5000',
  admin: process.env.ADMIN_SERVICE || 'http://localhost:5001',
  analytics: process.env.ANALYTICS_SERVICE || 'http://localhost:5002',
  review: process.env.REVIEW_SERVICE || 'http://localhost:5003',
  bid: process.env.BID_SERVICE || 'http://localhost:5004',
  project: process.env.PROJECT_SERVICE || 'http://localhost:5005',
  user: process.env.USER_SERVICE || 'http://localhost:5006',
  notification: process.env.NOTIFICATION_SERVICE || 'http://localhost:5007',
  socket: process.env.SOCKET_SERVICE || 'http://localhost:5008', // WebSocket: handle separately
};

// Route proxies with path rewrites
app.use('/api/auth', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' }
}));

app.use('/api/admin', createProxyMiddleware({
  target: services.admin,
  changeOrigin: true,
  pathRewrite: { '^/api/admin': '' }
}));

app.use('/api/analytics', createProxyMiddleware({
  target: services.analytics,
  changeOrigin: true,
  pathRewrite: { '^/api/analytics': '' }
}));

app.use('/api/reviews', createProxyMiddleware({
  target: services.review,
  changeOrigin: true,
  pathRewrite: { '^/api/reviews': '' }
}));

app.use('/api/bids', createProxyMiddleware({
  target: services.bid,
  changeOrigin: true,
  pathRewrite: { '^/api/bids': '' }
}));

app.use('/api/projects', createProxyMiddleware({
  target: services.project,
  changeOrigin: true,
  pathRewrite: { '^/api/projects': '' }
}));

app.use('/api/users', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '' }
}));

app.use('/api/notifications', createProxyMiddleware({
  target: services.notification,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '' }
}));

// Optional health route
app.get('/', (req, res) => res.send('API Gateway is running...'));

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
