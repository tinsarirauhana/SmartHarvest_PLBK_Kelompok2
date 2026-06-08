// order-service/controllers/permintaanController.js
const Permintaan = require("./Permintaan");
const axios = require("axios");

/**
 * HELPER: Fungsi untuk mengambil data detail User dari User Service (Port 5001)
 */
const fetchUserDetail = async (userId) => {
  try {
    const res = await axios.get(`http://localhost:5001/api/users/${userId}`);
    return res.data;
  } catch (err) {
    // Jika user-service mati atau tidak ketemu, kembalikan data default agar tidak crash
    return { _id: userId, nama: "User Tidak Ditemukan", alamat: "N/A" };
  }
};

/**
 * 1. FUNGSI CREATE (Untuk InputKebutuhan.tsx)
 */
exports.createPermintaan = async (req, res) => {
  try {
    const { user_id, nama_komoditas, jumlah, kualitas, tanggal } = req.body;
    const nomor_permintaan = `TKR-AGR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPermintaan = new Permintaan({
      user_id,
      nomor_permintaan,
      nama_komoditas,
      jumlah: Number(jumlah),
      kualitas,
      tanggal,
      status: "Diajukan",
    });

    const saved = await newPermintaan.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2. FUNGSI GET ALL (REVISI: Hapus .populate, gunakan API)
 */
exports.getPermintaan = async (req, res) => {
  try {
    // HAPUS .populate()
    const data = await Permintaan.find().sort({ tanggal: -1 });

    // Gabungkan data user secara manual lewat API Call
    const dataWithUser = await Promise.all(
      data.map(async (item) => {
        const itemObj = item.toObject();
        itemObj.user_id = await fetchUserDetail(item.user_id);
        return itemObj;
      }),
    );

    res.json(dataWithUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3. FUNGSI GET BY ID (REVISI: Hapus .populate, gunakan API)
 */
exports.getPermintaanById = async (req, res) => {
  try {
    // HAPUS .populate()
    const data = await Permintaan.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });

    const itemObj = data.toObject();
    itemObj.user_id = await fetchUserDetail(data.user_id);

    res.json(itemObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4. FUNGSI MATCHING (MENGGUNAKAN AXIOS KE HARVEST SERVICE)
 */
exports.matchPermintaan = async (req, res) => {
  try {
    const { id } = req.params;
    const permintaan = await Permintaan.findById(id);

    if (!permintaan)
      return res.status(404).json({ message: "Permintaan tidak ditemukan" });

    // Ambil data stok dari Harvest Service (Port 5002)
    const responseHarvest = await axios.get("http://localhost:5002/api/panen");
    const allStok = responseHarvest.data;

    // Filter stok secara manual di memori (JSON Filter)
    const stokTersedia = allStok.filter(
      (stok) =>
        stok.nama_komoditas.toLowerCase().trim() ===
          permintaan.nama_komoditas.toLowerCase().trim() &&
        stok.kualitas.trim() === permintaan.kualitas.trim() &&
        stok.jumlah > 0 &&
        new Date(stok.tanggal) <= new Date(permintaan.tanggal),
    );

    let totalTerkumpul = 0;
    let matches = [];
    const targetKebutuhan = permintaan.jumlah;

    for (let stok of stokTersedia) {
      if (totalTerkumpul < targetKebutuhan) {
        let sisaKebutuhan = targetKebutuhan - totalTerkumpul;
        let diambil = Math.min(stok.jumlah, sisaKebutuhan);

        totalTerkumpul += diambil;
        matches.push({
          hasil_panen_id: stok._id,
          petani_nama: stok.user_id?.nama || "Petani",
          jumlah_diambil: diambil,
          lokasi: stok.lokasi || "Aceh",
          harga_per_kg: stok.harga || 0,
        });
      }
    }

    permintaan.status =
      matches.length > 0 ? "Menunggu Konfirmasi" : "Dibatalkan";
    permintaan.matches = matches;
    await permintaan.save();

    res.json({
      success: true,
      message: matches.length > 0 ? "Match Berhasil" : "Stok tidak ditemukan",
      data: {
        nomor_permintaan: permintaan.nomor_permintaan,
        total_ditemukan: totalTerkumpul,
        status: permintaan.status,
        list_petani: matches,
        kualitas: permintaan.kualitas,
        biaya: {
          harga_dasar: matches.length > 0 ? matches[0].harga_per_kg : 0,
          logistik: 200,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5. FUNGSI KONFIRMASI (UPDATE STOK VIA API HARVEST)
 */
exports.konfirmasiPesanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { tindakan } = req.body;

    const permintaan = await Permintaan.findById(id);
    if (!permintaan)
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });

    const statusAkhir = tindakan === "setuju" ? "Selesai" : "Dibatalkan";

    // JIKA SETUJU: Panggil Harvest Service untuk potong stok
    if (tindakan === "setuju" && permintaan.matches.length > 0) {
      for (let item of permintaan.matches) {
        try {
          const currentPanen = await axios.get(
            `http://localhost:5002/api/panen/${item.hasil_panen_id}`,
          );
          const jumlahBaru = currentPanen.data.jumlah - item.jumlah_diambil;

          await axios.put(
            `http://localhost:5002/api/panen/${item.hasil_panen_id}`,
            {
              jumlah: jumlahBaru,
            },
          );
        } catch (apiErr) {
          console.error(`Gagal update stok harvest: ${apiErr.message}`);
        }
      }
    }

    permintaan.status = statusAkhir;
    await permintaan.save();
    res.json({ message: `Pesanan berhasil ${statusAkhir}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
