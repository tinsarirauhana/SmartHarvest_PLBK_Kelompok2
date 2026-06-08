const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../config/auth');
const { getDashboardStats, getHarvestTrend } = require('../controllers/dashboardController');

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/harvest-trend', protect, adminOnly, getHarvestTrend);

module.exports = router;
