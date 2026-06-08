require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/permintaanRoutes');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'order-service', status: 'ok' }));
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
