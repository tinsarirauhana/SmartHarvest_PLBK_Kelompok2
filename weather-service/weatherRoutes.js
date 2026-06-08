const router = require("express").Router();
const { getWeather } = require("./weatherController");

router.get("/", getWeather);

module.exports = router;
