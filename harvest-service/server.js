require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const harvestRoutes = require('./routes/hasilPanenRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.json({ service: 'harvest-service', status: 'ok' }));
app.use('/api/harvest', harvestRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Harvest Service running on port ${PORT}`));
