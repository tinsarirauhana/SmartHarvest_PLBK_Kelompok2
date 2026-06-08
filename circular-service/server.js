require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const circularRoutes = require('./routes/circularRoutes');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'circular-service', status: 'ok' }));
app.use('/api/circular', circularRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Circular Economy Service running on port ${PORT}`));
