require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'user-service', status: 'ok' }));
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
