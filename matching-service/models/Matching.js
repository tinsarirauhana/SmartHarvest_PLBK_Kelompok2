const mongoose = require('mongoose');

const matchingSchema = new mongoose.Schema(
  {
    harvestId: { type: mongoose.Schema.Types.ObjectId, required: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, required: true },
    namaKomoditas: { type: String, required: true },
    jumlahDialokasi: { type: Number, required: true },
    kualitas: { type: String },
    status: { type: String, enum: ['matched', 'pending', 'cancelled'], default: 'matched' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Matching', matchingSchema);
