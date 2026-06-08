# SmartHarvest Microservices — PLBK
**Universitas Syiah Kuala | Program Studi Informatika | 2026**

Arsitektur microservices untuk sistem **Smart Harvest and Circular Distribution System**, dikembangkan sebagai tugas mata kuliah Perangkat Lunak Berbasis Komponen (PLBK).

---

## Struktur Folder

```
SMARTHARVEST_MICROSERVICES/
├── api-gateway/          → Port 3000 — Pintu masuk semua request
├── user-service/         → Port 3001 — Auth, registrasi, manajemen user
├── harvest-service/      → Port 3002 — Input & kelola hasil panen
├── order-service/        → Port 3003 — Permintaan komoditas pedagang
├── matching-service/     → Port 3004 — Pencocokan supply & demand otomatis
├── circular-service/     → Port 3005 — Pengelolaan panen rusak (circular economy)
├── dashboard-service/    → Port 3006 — Statistik & monitoring admin
├── weather-service/      → Port 3007 — Data cuaca (OpenWeatherMap)
└── chat-service/         → Port 3008 — Pesan antara petani & pedagang
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
npm run dev    # mode development (auto-restart dengan nodemon)
# atau
npm start      # mode production
```

Atau jalankan satu per satu di terminal terpisah:
```bash
cd user-service && npm run dev
cd harvest-service && npm run dev
# dst...
```

---

## API Endpoints (via API Gateway port 3000)

### Auth & User
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login, dapat token JWT |
| GET | `/api/users` | Semua user (admin) |
| GET | `/api/users/:id` | Detail user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Hapus user (admin) |

### Hasil Panen
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/harvest` | Tambah panen (+ upload foto) |
| GET | `/api/harvest` | Daftar panen |
| GET | `/api/harvest/available` | Panen tersedia untuk matching |
| GET | `/api/harvest/:id` | Detail panen |
| PUT | `/api/harvest/:id` | Update panen |
| DELETE | `/api/harvest/:id` | Hapus panen |

### Permintaan (Order)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/orders` | Buat permintaan (auto trigger matching) |
| GET | `/api/orders` | Daftar permintaan |
| GET | `/api/orders/:id` | Detail permintaan |
| PUT | `/api/orders/:id` | Update permintaan |
| DELETE | `/api/orders/:id` | Hapus permintaan |

### Matching
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/matching` | Semua hasil matching |
| GET | `/api/matching/:requestId` | Matching per permintaan |

### Circular Economy
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/circular` | Tambah recovery manual |
| GET | `/api/circular` | Daftar recovery |
| GET | `/api/circular/stats` | Statistik per metode |
| PUT | `/api/circular/:id` | Update recovery |

### Dashboard (Admin)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/dashboard/stats` | Statistik lengkap sistem |
| GET | `/api/dashboard/harvest-trend` | Tren panen 6 bulan terakhir |

### Weather
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/weather` | Cuaca saat ini (default: Banda Aceh) |
| GET | `/api/weather/forecast` | Prakiraan cuaca |

### Chat
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
POST /api/harvest  → harvest-service simpan data
    ↓ (jika kualitas = Rusak)
circular-service.autoRecovery() dipanggil otomatis
    
Pedagang Login
    ↓
POST /api/orders  → order-service simpan permintaan
    ↓ (otomatis)
matching-service.runMatching() → cocokkan dengan harvest tersedia
    ↓
Hasil matching tersimpan, status harvest & order diperbarui

Admin Login
    ↓
GET /api/dashboard/stats → aggregate data dari semua service
```

---

## Database (MongoDB Atlas)

Semua service menggunakan **1 database**: `smartharvest_plbk`

Collections yang terbentuk otomatis:
- `users` — dari user-service
- `hasilpanens` — dari harvest-service
- `permintaans` — dari order-service
- `matchings` — dari matching-service
- `recoveries` — dari circular-service
- `chats` — dari chat-service

---

## Anggota Kelompok

1. Khalisha Adzraini Arif (2308107010031)
2. Tinsari Rauhana (2308107010038)
3. Dian Islami (2308107010048)

**Program Studi Informatika — FMIPA Universitas Syiah Kuala, 2026**
