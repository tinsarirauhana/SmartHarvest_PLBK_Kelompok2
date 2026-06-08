require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'dashboard-service', status: 'ok' }));
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`Dashboard Service running on port ${PORT}`));
