const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const connectDB = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Akses folder foto
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

// Karena struktur flat, panggil file di folder yang sama
app.use("/api/panen", require("./hasilPanenRoutes"));

const PORT = 5002;
app.listen(PORT, () => console.log(`Harvest Service jalan di port ${PORT}`));
