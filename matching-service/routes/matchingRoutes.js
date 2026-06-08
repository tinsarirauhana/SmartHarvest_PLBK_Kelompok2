const express = require('express');
const router = express.Router();
const { protect } = require('../config/auth');
const { runMatching, getAllMatching, getMatchByRequest } = require('../controllers/matchingController');

router.post('/run', runMatching);                        // dipanggil internal (order-service)
router.get('/', protect, getAllMatching);
router.get('/:requestId', protect, getMatchByRequest);

module.exports = router;
