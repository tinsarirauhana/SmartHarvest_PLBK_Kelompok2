const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
// Perhatikan: base path disesuaikan agar API Gateway mudah mengarahkan
app.use("/api/users", require("./userRoutes"));

app.get("/", (req, res) => {
  res.send("User Service is Running...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
