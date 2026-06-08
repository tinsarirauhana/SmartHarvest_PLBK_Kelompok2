// harvest-service/hasilPanenController.js
const HasilPanen = require("./HasilPanen");
const axios = require("axios"); // WAJIB: npm install axios

/**
 * HELPER FUNCTION (PLBK):
 * Fungsi ini bertugas mengambil data User dari User-Service (Port 5001)
 * Karena .populate() tidak bisa jalan antar-database microservice.
 */
const populateUserManual = async (data) => {
  if (!data) return null;

  // Jika datanya array (untuk fungsi getAll, getGradeC, dll)
  if (Array.isArray(data)) {
    return await Promise.all(
      data.map(async (item) => {
        const itemObj = item.toObject();
        try {
          const userRes = await axios.get(
            `http://localhost:5001/api/users/${item.user_id}`,
          );
          itemObj.user_id = userRes.data; // Ganti ID dengan Objek User lengkap
        } catch (err) {
          itemObj.user_id = { _id: item.user_id, nama: "Petani Lokal" }; // Fallback jika user-service mati
        }
        return itemObj;
      }),
    );
  }

  // Jika datanya hanya satu objek (untuk getById, update)
  else {
    const itemObj = data.toObject();
    try {
      const userRes = await axios.get(
        `http://localhost:5001/api/users/${data.user_id}`,
      );
      itemObj.user_id = userRes.data;
    } catch (err) {
      itemObj.user_id = { _id: data.user_id, nama: "Petani Lokal" };
    }
    return itemObj;
  }
};

// 1. TAMBAH PANEN
exports.createPanen = async (req, res) => {
  try {
    const {
      user_id,
      nama_komoditas,
      jumlah,
      kualitas,
      status,
      tanggal,
      deskripsi,
      harga,
      lokasi,
    } = req.body;

    const panenData = {
      user_id,
      nama_komoditas,
      jumlah: Number(jumlah),
      harga: Number(harga),
      lokasi: lokasi,
      kualitas,
      status: status || "Tersedia",
      tanggal: tanggal || new Date(),
      deskripsi,
      foto: [],
    };

    if (req.file) {
      panenData.foto = [{ path: `/uploads/${req.file.filename}` }];
    } else if (req.files && req.files.length > 0) {
      panenData.foto = req.files.map((f) => ({
        path: `/uploads/${f.filename}`,
      }));
    }

    const data = await HasilPanen.create(panenData);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 2. GET SEMUA PANEN (REVISI: Ditambah User Manual)
exports.getPanen = async (req, res) => {
  try {
    const data = await HasilPanen.find().sort({ tanggal: -1 });
    const result = await populateUserManual(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. GET GRADE C (REVISI: Ditambah User Manual)
exports.getPanenGradeC = async (req, res) => {
  try {
    const data = await HasilPanen.find({
      $or: [
        { kualitas: { $regex: /grade c/i } },
        { kualitas: { $regex: /rusak/i } },
      ],
    });
    const result = await populateUserManual(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. GET RECOVERY (REVISI: Ditambah User Manual)
exports.getPanenRecovery = async (req, res) => {
  try {
    const data = await HasilPanen.find({
      "recovery.jenis": { $exists: true, $ne: null },
    });
    const result = await populateUserManual(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. GET SATU PANEN BY ID (REVISI: Ditambah User Manual)
exports.getPanenById = async (req, res) => {
  try {
    const data = await HasilPanen.findById(req.params.id);
    if (!data)
      return res.status(404).json({ message: "Panen tidak ditemukan" });

    const result = await populateUserManual(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. UPDATE PANEN (Bisa dipanggil oleh Order-Service untuk potong stok)
exports.updatePanen = async (req, res) => {
  try {
    const data = await HasilPanen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data)
      return res.status(404).json({ message: "Panen tidak ditemukan" });

    const result = await populateUserManual(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. UPDATE RECOVERY PANEN
exports.updatePanenRecovery = async (req, res) => {
  try {
    const { recovery } = req.body;
    const data = await HasilPanen.findByIdAndUpdate(
      req.params.id,
      { recovery },
      { new: true },
    );
    const result = await populateUserManual(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. DELETE PANEN
exports.deletePanen = async (req, res) => {
  try {
    await HasilPanen.findByIdAndDelete(req.params.id);
    res.json({ message: "Panen dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
