const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Tidak ada token, akses ditolak' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'smartharvest_secret');
    next();
  } catch {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Hanya admin yang diizinkan' });
  next();
};

module.exports = { protect, adminOnly };
