// chat-service/chatController.js
const Chat = require("./Chat");
const mongoose = require("mongoose");
const axios = require("axios");

/**
 * 1. GET CHAT LIST (Daftar percakapan)
 * REVISI: Mengganti .populate() dengan API Call ke User Service
 */
exports.getChatList = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const userId = new mongoose.Types.ObjectId(user_id);

    // Cari semua chat (Tanpa .populate)
    const allChats = await Chat.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    }).sort({ tanggal: -1 });

    const conversations = new Map();

    for (const chat of allChats) {
      const otherUserId =
        chat.sender_id.toString() === user_id
          ? chat.receiver_id.toString()
          : chat.sender_id.toString();

      if (!conversations.has(otherUserId)) {
        try {
          // --- MICROSERVICE LOGIC: Ambil data user dari User-Service (Port 5001) ---
          const response = await axios.get(
            `http://localhost:5001/api/users/${otherUserId}`,
          );
          const otherUser = response.data;

          const unreadCount = await Chat.countDocuments({
            receiver_id: userId,
            sender_id: new mongoose.Types.ObjectId(otherUserId),
            dibaca: false,
          });

          conversations.set(otherUserId, {
            id: otherUserId,
            nama: otherUser.nama,
            pesanTerakhir: chat.pesan || "",
            waktu: formatWaktu(chat.tanggal),
            belumDibaca: unreadCount,
            online: true,
            role: otherUser.role,
            alamat: otherUser.alamat,
          });
        } catch (apiErr) {
          console.error(
            `Gagal ambil detail user ${otherUserId} dari User Service`,
          );
          continue;
        }
      }
    }

    res.json(Array.from(conversations.values()));
  } catch (err) {
    console.error("Get Chat List Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2. GET CHAT MESSAGES (Isi percakapan)
 */
exports.getChatMessages = async (req, res) => {
  try {
    const { user_id, contact_id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(user_id) ||
      !mongoose.Types.ObjectId.isValid(contact_id)
    ) {
      return res.status(400).json({ error: "Invalid format" });
    }

    const userId = new mongoose.Types.ObjectId(user_id);
    const contactId = new mongoose.Types.ObjectId(contact_id);

    // Cari pesan tanpa populate
    const messages = await Chat.find({
      $or: [
        { sender_id: userId, receiver_id: contactId },
        { sender_id: contactId, receiver_id: userId },
      ],
    }).sort({ tanggal: 1 });

    // Mark as read
    await Chat.updateMany(
      { receiver_id: userId, sender_id: contactId, dibaca: false },
      { dibaca: true },
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3. SEND CHAT MESSAGE
 */
exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, pesan } = req.body;

    const newChat = new Chat({
      sender_id: new mongoose.Types.ObjectId(sender_id),
      receiver_id: new mongoose.Types.ObjectId(receiver_id),
      pesan,
      tipe_pesan: "text",
    });

    const saved = await newChat.save();

    // Opsional: Ambil info pengirim dari User Service untuk dikembalikan ke frontend
    try {
      const userRes = await axios.get(
        `http://localhost:5001/api/users/${sender_id}`,
      );
      const senderInfo = userRes.data;

      // Buat objek gabungan agar frontend tidak error karena mencari data sender
      const responseData = {
        ...saved._doc,
        sender_id: {
          _id: senderInfo._id,
          nama: senderInfo.nama,
          email: senderInfo.email,
        },
      };
      res.status(201).json(responseData);
    } catch (e) {
      res.status(201).json(saved);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4. GET UNREAD COUNT
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.user_id);
    const count = await Chat.countDocuments({
      receiver_id: userId,
      dibaca: false,
    });
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function (Tetap menggunakan milikmu yang asli)
function formatWaktu(date) {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Waktu tidak valid";

    const now = new Date();
    const diff = now - dateObj;
    const hari = diff / (1000 * 60 * 60 * 24);

    if (hari < 1) {
      const jam = Math.floor(diff / (1000 * 60 * 60));
      if (jam === 0) {
        const menit = Math.floor(diff / (1000 * 60));
        return menit <= 0 ? "Baru saja" : `${menit} menit lalu`;
      }
      return `${jam} jam lalu`;
    }
    if (hari < 7) {
      return Math.floor(hari) === 1 ? "Kemarin" : `${Math.floor(hari)}d lalu`;
    }
    return dateObj.toLocaleDateString("id-ID");
  } catch (error) {
    return "Waktu tidak valid";
  }
}
