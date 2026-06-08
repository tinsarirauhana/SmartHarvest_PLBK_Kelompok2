// chat-service/chatRoutes.js
const express = require("express");
const {
  getChatList,
  getChatMessages,
  sendMessage,
  getUnreadCount,
} = require("./chatController");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Chat Service Component is Active" });
});

// GET chat list untuk user
router.get("/list/:user_id", getChatList);

// GET detail chat messages antara 2 user
router.get("/messages/:user_id/:contact_id", getChatMessages);

// POST send message
router.post("/send", sendMessage);

// GET unread count
router.get("/unread/:user_id", getUnreadCount);

module.exports = router;
