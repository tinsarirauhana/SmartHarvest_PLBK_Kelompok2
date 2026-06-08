const mongoose = require('mongoose');

const permintaanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    namaKomoditas: { type: String, required: true, trim: true },
    jumlah: { type: Number, required: true },
    kualitas: { type: String, enum: ['A', 'B', 'C'], required: true },
    tanggal: { type: Date, default: Date.now },
    status: { type: String, enum: ['menunggu', 'terpenuhi', 'sebagian'], default: 'menunggu' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Permintaan', permintaanSchema);
