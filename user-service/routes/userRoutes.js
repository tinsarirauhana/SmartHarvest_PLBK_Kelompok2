const express = require('express');
const router = express.Router();
const { register, login, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../config/auth');

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);

// User management (admin)
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, getUserById);
router.put('/users/:id', protect, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
