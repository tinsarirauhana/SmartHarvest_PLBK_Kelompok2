const mongoose = require('mongoose');

const hasilPanenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    namaKomoditas: { type: String, required: true, trim: true },
    jumlah: { type: Number, required: true },
    lokasi: { type: String, required: true },
    deskripsi: { type: String, default: '' },
    tanggalPanen: { type: Date, required: true },
    kualitas: { type: String, enum: ['A', 'B', 'C', 'Rusak'], required: true },
    status: { type: String, enum: ['tersedia', 'sebagian', 'teralokasi'], default: 'tersedia' },
    foto: { type: String, default: '' }, // path file
  },
  { timestamps: true }
);

module.exports = mongoose.model('HasilPanen', hasilPanenSchema);
