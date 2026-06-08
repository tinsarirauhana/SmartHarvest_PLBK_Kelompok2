require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'chat-service', status: 'ok' }));
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`Chat Service running on port ${PORT}`));
