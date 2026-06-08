const express = require('express');
const router = express.Router();
const { protect } = require('../config/auth');
const {
  autoRecovery, addRecovery, getAllRecovery, getRecoveryStats, getRecoveryById, updateRecovery,
} = require('../controllers/recoveryController');

router.post('/auto', autoRecovery);              // internal call dari harvest-service
router.post('/', protect, addRecovery);
router.get('/', protect, getAllRecovery);
router.get('/stats', protect, getRecoveryStats);
router.get('/:id', protect, getRecoveryById);
router.put('/:id', protect, updateRecovery);

module.exports = router;
