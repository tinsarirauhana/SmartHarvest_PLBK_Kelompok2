const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/permintaan", require("./permintaanRoutes"));

const PORT = 5003;
app.listen(PORT, () => console.log(`Order Service jalan di port ${PORT}`));
