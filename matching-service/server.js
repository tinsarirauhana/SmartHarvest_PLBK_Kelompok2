require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const matchingRoutes = require('./routes/matchingRoutes');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'matching-service', status: 'ok' }));
app.use('/api/matching', matchingRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Matching Service running on port ${PORT}`));
