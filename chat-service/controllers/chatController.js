const Chat = require('../models/Chat');

// POST /api/chat  — kirim pesan
const sendMessage = async (req, res) => {
  try {
    const { receiverId, pesan } = req.body;
    const chat = await Chat.create({ senderId: req.user.id, receiverId, pesan });
    res.status(201).json({ message: 'Pesan terkirim', chat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/:userId  — ambil percakapan antara 2 user
const getConversation = async (req, res) => {
  try {
    const myId    = req.user.id;
    const otherId = req.params.userId;
    const chats   = await Chat.find({
      $or: [
        { senderId: myId,    receiverId: otherId },
        { senderId: otherId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // Tandai pesan yang diterima sebagai sudah dibaca
    await Chat.updateMany(
      { senderId: otherId, receiverId: myId, dibaca: false },
      { dibaca: true }
    );

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat  — daftar semua kontak yang pernah chat dengan user ini
const getContacts = async (req, res) => {
  try {
    const myId = req.user.id;
    const chats = await Chat.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    }).sort({ createdAt: -1 });

    // Kumpulkan unique userId lawan
    const contactMap = {};
    chats.forEach((c) => {
      const other = c.senderId.toString() === myId ? c.receiverId.toString() : c.senderId.toString();
      if (!contactMap[other]) {
        contactMap[other] = { userId: other, pesanTerakhir: c.pesan, waktu: c.createdAt };
      }
    });

    res.json(Object.values(contactMap));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/unread  — hitung pesan belum dibaca
const getUnreadCount = async (req, res) => {
  try {
    const count = await Chat.countDocuments({ receiverId: req.user.id, dibaca: false });
    res.json({ unread: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendMessage, getConversation, getContacts, getUnreadCount };
