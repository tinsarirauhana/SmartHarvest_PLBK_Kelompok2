const Permintaan = require('../models/Permintaan');
const axios = require('axios');

const MATCHING_SERVICE = process.env.MATCHING_SERVICE_URL || 'http://localhost:3004';

// POST /api/orders
const addOrder = async (req, res) => {
  try {
    const { namaKomoditas, jumlah, kualitas } = req.body;
    const order = await Permintaan.create({ userId: req.user.id, namaKomoditas, jumlah, kualitas });

    // Trigger matching otomatis
    try {
      await axios.post(`${MATCHING_SERVICE}/api/matching/run`, { requestId: order._id });
    } catch (matchErr) {
      console.warn('Matching service tidak merespons:', matchErr.message);
    }

    res.status(201).json({ message: 'Permintaan berhasil dibuat', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const filter = req.user.role === 'pedagang' ? { userId: req.user.id } : {};
    const orders = await Permintaan.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Permintaan.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Permintaan tidak ditemukan' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/:id
const updateOrder = async (req, res) => {
  try {
    const updated = await Permintaan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Permintaan diperbarui', order: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  try {
    await Permintaan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Permintaan dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addOrder, getAllOrders, getOrderById, updateOrder, deleteOrder };
