const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Service URLs
const SERVICES = {
  USER:      process.env.USER_SERVICE_URL      || 'http://localhost:3001',
  HARVEST:   process.env.HARVEST_SERVICE_URL   || 'http://localhost:3002',
  ORDER:     process.env.ORDER_SERVICE_URL      || 'http://localhost:3003',
  MATCHING:  process.env.MATCHING_SERVICE_URL  || 'http://localhost:3004',
  CIRCULAR:  process.env.CIRCULAR_SERVICE_URL  || 'http://localhost:3005',
  DASHBOARD: process.env.DASHBOARD_SERVICE_URL || 'http://localhost:3006',
  WEATHER:   process.env.WEATHER_SERVICE_URL   || 'http://localhost:3007',
  CHAT:      process.env.CHAT_SERVICE_URL      || 'http://localhost:3008',
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway running', services: SERVICES });
});

// Proxy routes
app.use('/api/auth',      createProxyMiddleware({ target: SERVICES.USER,      changeOrigin: true }));
app.use('/api/users',     createProxyMiddleware({ target: SERVICES.USER,      changeOrigin: true }));
app.use('/api/harvest',   createProxyMiddleware({ target: SERVICES.HARVEST,   changeOrigin: true }));
app.use('/api/orders',    createProxyMiddleware({ target: SERVICES.ORDER,     changeOrigin: true }));
app.use('/api/matching',  createProxyMiddleware({ target: SERVICES.MATCHING,  changeOrigin: true }));
app.use('/api/circular',  createProxyMiddleware({ target: SERVICES.CIRCULAR,  changeOrigin: true }));
app.use('/api/dashboard', createProxyMiddleware({ target: SERVICES.DASHBOARD, changeOrigin: true }));
app.use('/api/weather',   createProxyMiddleware({ target: SERVICES.WEATHER,   changeOrigin: true }));
app.use('/api/chat',      createProxyMiddleware({ target: SERVICES.CHAT,      changeOrigin: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
