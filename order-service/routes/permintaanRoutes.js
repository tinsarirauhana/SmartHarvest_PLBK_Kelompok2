const express = require('express');
const router = express.Router();
const { protect } = require('../config/auth');
const { addOrder, getAllOrders, getOrderById, updateOrder, deleteOrder } = require('../controllers/permintaanController');

router.post('/', protect, addOrder);
router.get('/', protect, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, updateOrder);
router.delete('/:id', protect, deleteOrder);

module.exports = router;
