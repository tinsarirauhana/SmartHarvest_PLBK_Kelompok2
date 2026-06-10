# SmartHarvest Microservices — PLBK
**Universitas Syiah Kuala | Program Studi Informatika | 2026**

Arsitektur microservices untuk sistem **Smart Harvest and Circular Distribution System**, dikembangkan sebagai tugas mata kuliah Perangkat Lunak Berbasis Komponen (PLBK).

---

## Struktur Folder

```
SMARTHARVEST_MICROSERVICES/
├── api-gateway/          → Port 5000 — Pintu masuk semua request
├── user-service/         → Port 5001 — Auth, registrasi, manajemen user
├── harvest-service/      → Port 5002 — Input & kelola hasil panen
├── order-service/        → Port 5003 — Permintaan komoditas pedagang
├── weather-service/      → Port 5004 — Data cuaca (OpenWeatherMap)
└── chat-service/         → Port 5005 — Pesan antara petani & pedagang
```

---

## Cara Setup

### 1. Clone / buka folder ini di VS Code

### 2. Install semua dependencies
```bash
npm install          # install concurrently di root
npm run install:all  # install semua service sekaligus
```

### 3. Konfigurasi `.env` di setiap service

Setiap service punya file `.env`. Ganti bagian berikut di **semua** `.env`:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smartharvest_plbk?retryWrites=true&w=majority
```

> **Penting:** Semua service pakai **database yang sama** (`smartharvest_plbk`) di MongoDB Atlas kamu.

Untuk `weather-service`, isi juga:
```
WEATHER_API_KEY=isi_dengan_api_key_openweathermap_kamu
```
API key gratis di: https://openweathermap.org/api

### 4. Jalankan semua service sekaligus
```bash
npm run dev
# atau
npm start
```

Atau jalankan satu per satu di terminal terpisah:
```bash
cd api-gateway && node server.js
cd user-service && node server.js
cd harvest-service && node server.js
cd order-service && node server.js
cd weather-service && node server.js
cd chat-service && node server.js
```

---

## API Endpoints

### Auth & User — `http://localhost:5001/api/users`
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/users/register` | Registrasi user baru |
| POST | `/api/users/login` | Login, dapat token JWT |
| GET | `/api/users` | Semua user (admin) |
| GET | `/api/users/:id` | Detail user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Hapus user (admin) |

### Hasil Panen — `http://localhost:5002/api/panen`
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/panen` | Tambah panen (+ upload foto) |
| GET | `/api/panen` | Daftar panen |
| GET | `/api/panen/available` | Panen tersedia untuk matching |
| GET | `/api/panen/:id` | Detail panen |
| PUT | `/api/panen/:id` | Update panen |
| DELETE | `/api/panen/:id` | Hapus panen |

### Permintaan (Order) — `http://localhost:5003/api/permintaan`
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/permintaan` | Buat permintaan (auto trigger matching) |
| GET | `/api/permintaan` | Daftar permintaan |
| GET | `/api/permintaan/:id` | Detail permintaan |
| PUT | `/api/permintaan/:id` | Update permintaan |
| DELETE | `/api/permintaan/:id` | Hapus permintaan |

### Weather — `http://localhost:5004/api/weather`
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/weather` | Cuaca saat ini (default: Banda Aceh) |
| GET | `/api/weather/forecast` | Prakiraan cuaca |

### Chat — `http://localhost:5005/api/chat`
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/chat` | Kirim pesan |
| GET | `/api/chat` | Daftar kontak |
| GET | `/api/chat/unread` | Jumlah pesan belum dibaca |
| GET | `/api/chat/:userId` | Percakapan dengan user tertentu |

---

## Autentikasi

Semua endpoint (kecuali register & login) memerlukan header:
```
Authorization: Bearer <token_jwt>
```
Token didapat saat login.

---

## Alur Sistem

```
Petani Login
    ↓
POST /api/panen  → harvest-service simpan data panen

Pedagang Login
    ↓
POST /api/permintaan  → order-service simpan permintaan
    ↓ (otomatis, di dalam order-service)
runMatching() → cocokkan dengan data panen tersedia dari harvest-service
    ↓
Status panen & permintaan diperbarui

Admin Login
    ↓
GET /api/users → lihat semua user via user-service

Petani/Pedagang
    ↓
GET /api/weather → cek cuaca via weather-service
POST /api/chat  → kirim pesan via chat-service
GET /api/chat/:userId → lihat percakapan
```

---

## Database (MongoDB Atlas)

Semua service menggunakan **1 database**: `smartharvest_plbk`

Collections yang terbentuk otomatis:
- `users` — dari user-service
- `hasilpanens` — dari harvest-service
- `permintaans` — dari order-service
- `matchings` — dari order-service (hasil matching)
- `recoveries` — dari harvest-service (circular economy)
- `chats` — dari chat-service

---

## Anggota Kelompok

1. Khalisha Adzraini Arif (2308107010031)
2. Tinsari Rauhana (2308107010038)
3. Dian Islami (2308107010048)

**Program Studi Informatika — FMIPA Universitas Syiah Kuala, 2026**
