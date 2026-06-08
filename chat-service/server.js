const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/chat", require("./chatRoutes"));

const PORT = 5005;
app.listen(PORT, () => console.log(`Chat Service jalan di port ${PORT}`));
