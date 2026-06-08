const Recovery = require('../models/Recovery');

// POST /api/circular/auto  — dipanggil harvest-service otomatis saat kualitas Rusak
const autoRecovery = async (req, res) => {
  try {
    const { harvestId, namaKomoditas, jumlah, userId } = req.body;

    // Tentukan metode default berdasarkan jenis komoditas (simple logic)
    const sayuran = ['tomat', 'wortel', 'kubis', 'bayam', 'kangkung', 'sawi'];
    const buah    = ['mangga', 'pisang', 'pepaya', 'jambu'];
    const nama    = namaKomoditas.toLowerCase();

    let metode = 'kompos';
    if (sayuran.some((s) => nama.includes(s))) metode = 'pakan_ternak';
    else if (buah.some((b) => nama.includes(b))) metode = 'kompos';

    const recovery = await Recovery.create({ harvestId, namaKomoditas, jumlah, userId, metode });
    res.status(201).json({ message: 'Recovery otomatis dibuat', recovery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/circular  — petani pilih metode manual
const addRecovery = async (req, res) => {
  try {
    const { harvestId, namaKomoditas, jumlah, metode, catatan } = req.body;
    const recovery = await Recovery.create({
      harvestId,
      userId: req.user.id,
      namaKomoditas,
      jumlah,
      metode,
      catatan,
    });
    res.status(201).json({ message: 'Recovery berhasil disimpan', recovery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/circular
const getAllRecovery = async (req, res) => {
  try {
    const filter = req.user.role === 'petani' ? { userId: req.user.id } : {};
    const data = await Recovery.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/circular/stats  — untuk dashboard
const getRecoveryStats = async (req, res) => {
  try {
    const stats = await Recovery.aggregate([
      { $group: { _id: '$metode', totalJumlah: { $sum: '$jumlah' }, count: { $sum: 1 } } },
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/circular/:id
const getRecoveryById = async (req, res) => {
  try {
    const data = await Recovery.findById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Data recovery tidak ditemukan' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/circular/:id
const updateRecovery = async (req, res) => {
  try {
    const updated = await Recovery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Recovery diperbarui', recovery: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { autoRecovery, addRecovery, getAllRecovery, getRecoveryStats, getRecoveryById, updateRecovery };
