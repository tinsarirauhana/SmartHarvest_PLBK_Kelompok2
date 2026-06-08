const Matching = require('../models/Matching');
const axios = require('axios');

const HARVEST_SERVICE = process.env.HARVEST_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE   = process.env.ORDER_SERVICE_URL   || 'http://localhost:3003';

// POST /api/matching/run  — dipanggil oleh order-service
const runMatching = async (req, res) => {
  try {
    const { requestId } = req.body;

    // Ambil data permintaan dari order-service (internal call, no auth header needed here)
    const orderRes = await axios.get(`${ORDER_SERVICE}/api/orders/${requestId}`);
    const order = orderRes.data;

    // Ambil semua harvest yang tersedia dari harvest-service
    const harvestRes = await axios.get(`${HARVEST_SERVICE}/api/harvest/available`);
    const harvests = harvestRes.data;

    // Filter cocok berdasarkan komoditas & kualitas
    const candidates = harvests.filter(
      (h) =>
        h.namaKomoditas.toLowerCase() === order.namaKomoditas.toLowerCase() &&
        h.kualitas === order.kualitas &&
        h.jumlah > 0
    );

    if (candidates.length === 0) {
      return res.json({ message: 'Tidak ada stok yang cocok', matched: [] });
    }

    const results = [];
    let remaining = order.jumlah;

    for (const harvest of candidates) {
      if (remaining <= 0) break;

      const allocate = Math.min(harvest.jumlah, remaining);
      remaining -= allocate;

      const match = await Matching.create({
        harvestId: harvest._id,
        requestId: order._id,
        namaKomoditas: order.namaKomoditas,
        jumlahDialokasi: allocate,
        kualitas: order.kualitas,
      });
      results.push(match);

      // Update status harvest
      const newStatus = harvest.jumlah - allocate === 0 ? 'teralokasi' : 'sebagian';
      await axios.put(`${HARVEST_SERVICE}/api/harvest/${harvest._id}`, {
        jumlah: harvest.jumlah - allocate,
        status: newStatus,
      });
    }

    // Update status order
    const orderStatus = remaining <= 0 ? 'terpenuhi' : 'sebagian';
    await axios.put(`${ORDER_SERVICE}/api/orders/${requestId}`, { status: orderStatus });

    res.json({ message: 'Matching selesai', matched: results, sisaPermintaan: remaining });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/matching
const getAllMatching = async (req, res) => {
  try {
    const data = await Matching.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/matching/:requestId  — lihat hasil matching per permintaan
const getMatchByRequest = async (req, res) => {
  try {
    const data = await Matching.find({ requestId: req.params.requestId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { runMatching, getAllMatching, getMatchByRequest };
