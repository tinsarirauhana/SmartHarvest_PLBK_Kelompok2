const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/weather", require("./weatherRoutes"));

const PORT = 5004;
app.listen(PORT, () => console.log(`Weather Service jalan di port ${PORT}`));
