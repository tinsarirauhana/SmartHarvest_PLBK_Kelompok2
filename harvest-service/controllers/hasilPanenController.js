const HasilPanen = require('../models/HasilPanen');
const axios = require('axios');

const CIRCULAR_SERVICE = process.env.CIRCULAR_SERVICE_URL || 'http://localhost:3005';

// POST /api/harvest  — tambah hasil panen
const addHarvest = async (req, res) => {
  try {
    const { namaKomoditas, jumlah, lokasi, deskripsi, tanggalPanen, kualitas } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : '';

    const harvest = await HasilPanen.create({
      userId: req.user.id,
      namaKomoditas,
      jumlah,
      lokasi,
      deskripsi,
      tanggalPanen,
      kualitas,
      foto,
    });

    // Jika kualitas Rusak, kirim ke circular-service
    if (kualitas === 'Rusak') {
      try {
        await axios.post(`${CIRCULAR_SERVICE}/api/circular/auto`, {
          harvestId: harvest._id,
          namaKomoditas,
          jumlah,
          userId: req.user.id,
        });
      } catch (circErr) {
        console.warn('Circular service tidak merespons:', circErr.message);
      }
    }

    res.status(201).json({ message: 'Hasil panen berhasil ditambahkan', harvest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/harvest  — semua panen (admin/pedagang bisa lihat semua)
const getAllHarvest = async (req, res) => {
  try {
    const filter = req.user.role === 'petani' ? { userId: req.user.id } : {};
    const data = await HasilPanen.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/harvest/available  — hanya status tersedia/sebagian untuk matching
const getAvailableHarvest = async (req, res) => {
  try {
    const data = await HasilPanen.find({ status: { $in: ['tersedia', 'sebagian'] }, kualitas: { $ne: 'Rusak' } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/harvest/:id
const getHarvestById = async (req, res) => {
  try {
    const harvest = await HasilPanen.findById(req.params.id);
    if (!harvest) return res.status(404).json({ message: 'Data panen tidak ditemukan' });
    res.json(harvest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/harvest/:id
const updateHarvest = async (req, res) => {
  try {
    const updated = await HasilPanen.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Data panen diperbarui', harvest: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/harvest/:id
const deleteHarvest = async (req, res) => {
  try {
    await HasilPanen.findByIdAndDelete(req.params.id);
    res.json({ message: 'Data panen dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addHarvest, getAllHarvest, getAvailableHarvest, getHarvestById, updateHarvest, deleteHarvest };
