const axios = require('axios');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// GET /api/weather?lat=5.55&lon=95.32
const getWeather = async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    let url;
    if (city) {
      url = `${BASE_URL}/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric&lang=id`;
    } else {
      const latitude  = lat  || '5.5501';   // default Banda Aceh
      const longitude = lon  || '95.3238';
      url = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=id`;
    }

    const response = await axios.get(url);
    const d = response.data;

    res.json({
      kota: d.name,
      suhu: d.main.temp,
      suhuMin: d.main.temp_min,
      suhuMax: d.main.temp_max,
      kelembaban: d.main.humidity,
      kecepatan_angin: d.wind.speed,
      kondisi: d.weather[0]?.description,
      ikon: d.weather[0]?.icon,
      koordinat: d.coord,
    });
  } catch (err) {
    // Fallback data jika API key belum diisi
    if (!WEATHER_API_KEY) {
      return res.json({
        kota: 'Banda Aceh',
        suhu: 32,
        suhuMin: 28,
        suhuMax: 35,
        kelembaban: 80,
        kecepatan_angin: 5,
        kondisi: 'cerah berawan',
        ikon: '02d',
        koordinat: { lat: 5.5501, lon: 95.3238 },
        _note: 'Data dummy — isi WEATHER_API_KEY di .env untuk data real',
      });
    }
    res.status(500).json({ message: err.message });
  }
};

// GET /api/weather/forecast?lat=5.55&lon=95.32
const getForecast = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const latitude  = lat || '5.5501';
    const longitude = lon || '95.3238';

    if (!WEATHER_API_KEY) {
      return res.json({
        _note: 'Data dummy — isi WEATHER_API_KEY di .env untuk data real',
        forecast: [],
      });
    }

    const url = `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=id&cnt=5`;
    const response = await axios.get(url);

    const forecast = response.data.list.map((item) => ({
      waktu: item.dt_txt,
      suhu: item.main.temp,
      kondisi: item.weather[0]?.description,
    }));

    res.json({ forecast });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWeather, getForecast };
