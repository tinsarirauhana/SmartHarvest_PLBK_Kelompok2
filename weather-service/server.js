require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'weather-service', status: 'ok' }));
app.use('/api/weather', weatherRoutes);

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => console.log(`Weather Service running on port ${PORT}`));
