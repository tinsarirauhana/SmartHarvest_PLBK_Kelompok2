// api-gateway/server.js
const express = require("express");
const proxy = require("express-http-proxy");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware dasar
app.use(cors());
app.use(express.json());

/**
 * LOGIKA GATEWAY:
 * Menambahkan path lengkap di target proxy agar Express tidak memotong
 * alamat URL saat diteruskan ke service tujuan.
 */

// 1. Mengarahkan ke User Service (Port 5001)
app.use(
  "/api/users",
  proxy("http://localhost:5001", {
    proxyReqPathResolver: (req) => `/api/users${req.url}`,
  }),
);

// 2. Mengarahkan ke Harvest Service (Port 5002)
app.use(
  "/api/panen",
  proxy("http://localhost:5002", {
    proxyReqPathResolver: (req) => `/api/panen${req.url}`,
  }),
);

// 3. Mengarahkan ke Order Service (Port 5003)
app.use(
  "/api/permintaan",
  proxy("http://localhost:5003", {
    proxyReqPathResolver: (req) => `/api/permintaan${req.url}`,
  }),
);

// 4. Mengarahkan ke Weather Service (Port 5004)
app.use(
  "/api/weather",
  proxy("http://localhost:5004", {
    proxyReqPathResolver: (req) => `/api/weather${req.url}`,
  }),
);

// 5. Mengarahkan ke Chat Service (Port 5005)
app.use(
  "/api/chat",
  proxy("http://localhost:5005", {
    proxyReqPathResolver: (req) => `/api/chat${req.url}`,
  }),
);

// 6. Proxy khusus untuk Gambar/Uploads agar tampil di Frontend
// Tetap mengambil dari port 5002 (Harvest Service)
app.use("/uploads", proxy("http://localhost:5002/uploads"));

// Health Check untuk Gateway
app.get("/", (req, res) => {
  res.send("--- Smart Harvest API Gateway (PLBK) is Running ---");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ======================================================
     API GATEWAY (STARY POINT) RUNNING ON PORT ${PORT}
     User Service    : 5001
     Harvest Service : 5002
     Order Service   : 5003
     Weather Service : 5004
     Chat Service    : 5005
  ======================================================
  `);
});
