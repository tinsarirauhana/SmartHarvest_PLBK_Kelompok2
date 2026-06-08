const express = require('express');
const router = express.Router();
const { protect } = require('../config/auth');
const { sendMessage, getConversation, getContacts, getUnreadCount } = require('../controllers/chatController');

router.post('/', protect, sendMessage);
router.get('/', protect, getContacts);
router.get('/unread', protect, getUnreadCount);
router.get('/:userId', protect, getConversation);

module.exports = router;
