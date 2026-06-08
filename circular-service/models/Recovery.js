const mongoose = require('mongoose');

const recoverySchema = new mongoose.Schema(
  {
    harvestId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    namaKomoditas: { type: String, required: true },
    jumlah: { type: Number, required: true },
    metode: {
      type: String,
      enum: ['kompos', 'pakan_ternak', 'limbah', 'lainnya'],
      default: 'lainnya',
    },
    catatan: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recovery', recoverySchema);
