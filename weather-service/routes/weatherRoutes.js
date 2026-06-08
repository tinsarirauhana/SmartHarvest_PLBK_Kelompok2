const express = require('express');
const router = express.Router();
const { protect } = require('../config/auth');
const { getWeather, getForecast } = require('../controllers/weatherController');

router.get('/', protect, getWeather);
router.get('/forecast', protect, getForecast);

module.exports = router;
