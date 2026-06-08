const axios = require('axios');

const HARVEST_SERVICE  = process.env.HARVEST_SERVICE_URL  || 'http://localhost:3002';
const ORDER_SERVICE    = process.env.ORDER_SERVICE_URL    || 'http://localhost:3003';
const MATCHING_SERVICE = process.env.MATCHING_SERVICE_URL || 'http://localhost:3004';
const CIRCULAR_SERVICE = process.env.CIRCULAR_SERVICE_URL || 'http://localhost:3005';
const USER_SERVICE     = process.env.USER_SERVICE_URL     || 'http://localhost:3001';

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const headers = { Authorization: token };

    const [harvestRes, ordersRes, matchingRes, recoveryRes, usersRes] = await Promise.allSettled([
      axios.get(`${HARVEST_SERVICE}/api/harvest`, { headers }),
      axios.get(`${ORDER_SERVICE}/api/orders`, { headers }),
      axios.get(`${MATCHING_SERVICE}/api/matching`, { headers }),
      axios.get(`${CIRCULAR_SERVICE}/api/circular/stats`, { headers }),
      axios.get(`${USER_SERVICE}/api/users`, { headers }),
    ]);

    const harvests  = harvestRes.status  === 'fulfilled' ? harvestRes.value.data  : [];
    const orders    = ordersRes.status   === 'fulfilled' ? ordersRes.value.data   : [];
    const matchings = matchingRes.status === 'fulfilled' ? matchingRes.value.data : [];
    const recovery  = recoveryRes.status === 'fulfilled' ? recoveryRes.value.data : [];
    const users     = usersRes.status    === 'fulfilled' ? usersRes.value.data    : [];

    const totalPanen     = harvests.reduce((sum, h) => sum + (h.jumlah || 0), 0);
    const totalAlokasi   = matchings.reduce((sum, m) => sum + (m.jumlahDialokasi || 0), 0);
    const totalRecovery  = recovery.reduce((sum, r) => sum + (r.totalJumlah || 0), 0);

    res.json({
      totalPanen,
      totalHarvestRecord: harvests.length,
      totalAlokasi,
      totalTransaksi: matchings.length,
      totalPermintaan: orders.length,
      totalRecovery,
      recoveryByMetode: recovery,
      totalUsers: users.length,
      topKomoditas: getTopKomoditas(harvests),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/dashboard/harvest-trend
const getHarvestTrend = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const harvestRes = await axios.get(`${HARVEST_SERVICE}/api/harvest`, {
      headers: { Authorization: token },
    });
    const harvests = harvestRes.data;

    // Group by month
    const trendMap = {};
    harvests.forEach((h) => {
      const month = new Date(h.tanggalPanen || h.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'short',
      });
      if (!trendMap[month]) trendMap[month] = { month, jumlah: 0, count: 0 };
      trendMap[month].jumlah += h.jumlah || 0;
      trendMap[month].count += 1;
    });

    res.json(Object.values(trendMap).slice(-6)); // 6 bulan terakhir
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function getTopKomoditas(harvests) {
  const map = {};
  harvests.forEach((h) => {
    const k = h.namaKomoditas;
    if (!map[k]) map[k] = 0;
    map[k] += h.jumlah || 0;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, total]) => ({ name, total }));
}

module.exports = { getDashboardStats, getHarvestTrend };
