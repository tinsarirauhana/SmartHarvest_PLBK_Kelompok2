const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    senderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pesan:      { type: String, required: true, trim: true },
    dibaca:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
