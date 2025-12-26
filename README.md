# 🎵 MusicMood - Hava Durumuna Göre Müzik Önerileri

Hava durumuna göre size özel **Spotify** müzik önerileri sunan, **AI-powered** modern web uygulaması.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Özellikler

### 🎵 Spotify Entegrasyonu
- ✅ Hava durumuna göre otomatik şarkı önerileri
- ✅ Album art ve 30s preview
- ✅ Spotify'da açma linki
- ✅ Audio features detayları

### 🤖 AI Müzik Danışmanı
- ✅ OpenAI GPT-3.5 ile kişiselleştirilmiş açıklamalar
- ✅ Her arama için benzersiz öneriler
- ✅ Türkçe destek

### 🔐 Kullanıcı Yönetimi
- ✅ Google OAuth 2.0 güvenli giriş
- ✅ Favori şehirler (maksimum 10)
- ✅ Profil yönetimi

### 🎨 Modern Tasarım
- ✅ Dark theme ve glassmorphism
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Toast notifications

---

## 🚀 Hızlı Başlangıç

### 1. Kurulum

```bash
# Projeyi klonlayın
git clone <repository-url>
cd music-mood

# Bağımlılıkları yükleyin
npm install

# Environment variables oluşturun
copy .env.example .env  # Windows
```

### 2. API Keys

`.env` dosyasını düzenleyin ve API key'lerinizi ekleyin:

```env
# SPOTIFY API (ZORUNLU)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# GOOGLE OAUTH (Opsiyonel)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# OPENAI API (Opsiyonel)
OPENAI_API_KEY=sk-proj-your_openai_key

# SERVER
PORT=3000
NODE_ENV=development
```

#### API Key'leri Nereden Alınır?

**Spotify API:**
1. https://developer.spotify.com/dashboard
2. "Create an App" → Credentials'ları kopyalayın

**OpenAI API (Opsiyonel):**
1. https://platform.openai.com/api-keys
2. "Create new secret key" → API key'i kopyalayın

**Google OAuth (Opsiyonel):**
1. https://console.cloud.google.com/apis/credentials
2. OAuth 2.0 Client ID oluşturun

**OpenWeatherMap API:**
- Ücretsiz API key: https://openweathermap.org/api
- `config.js` dosyasında güncelleyin

### 3. Çalıştırın

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Tarayıcıda: `http://localhost:3000`

---

## 📁 Proje Yapısı

```
music-mood/
├── server.js              # Express backend
├── database/
│   ├── db.js             # PostgreSQL & Redis bağlantıları
│   └── schema.sql        # Database schema
├── Frontend
│   ├── index.html        # Ana sayfa
│   ├── styles.css        # Tüm stiller
│   ├── app.js            # Ana uygulama
│   ├── spotify.js        # Spotify entegrasyonu
│   ├── auth.js           # Google OAuth
│   ├── config.js         # Frontend config
│   └── shuffle.js        # Playlist shuffle
├── Business Logic
│   ├── moodScore.js      # Mood hesaplama
│   ├── moodUI.js         # Mood UI
│   ├── moodLearning.js   # Learning system
│   ├── playlists.js      # Fallback playlists
│   └── aiRecommendations.js # AI entegrasyonu
└── Documentation
    ├── README.md         # Bu dosya
    ├── QUICK_SETUP.md    # Hızlı kurulum
    ├── PRODUCTION.md     # Production rehberi
    ├── RAILWAY.md        # Railway deployment
    └── GUVENLIK_RAPORU.md # Güvenlik raporu
```

---

## 🎯 API Endpoints

### Backend Server (Port 3000)

```bash
# Health check
GET /api/health

# Hava durumuna göre öneriler
GET /api/recommendations?weather=Clear&temp=22&hour=14

# Şarkı arama
GET /api/search?q=Coldplay

# Şarkı detayları
GET /api/track/:trackId

# AI destekli müzik açıklaması
POST /api/ai-recommendations
Body: { city, weather, temperature, mood, songs }
```

---

## 🛠️ Teknolojiler

### Backend
- **Express.js** - Web framework
- **Axios** - HTTP client
- **PostgreSQL** - Database (opsiyonel)
- **Redis** - Cache (opsiyonel)
- **OpenAI** - AI açıklamaları

### Frontend
- **HTML5** - Semantik yapı
- **CSS3** - Modern tasarım
- **Vanilla JavaScript** - Framework'süz
- **Google Sign-In API** - OAuth 2.0
- **Spotify Web API** - Müzik önerileri

---

## 🗄️ Database (Opsiyonel)

Uygulama database olmadan da çalışır. Ancak tam özellikler için:

### PostgreSQL + Redis ile Docker

```bash
docker compose up -d
```

Bu komut başlatır:
- PostgreSQL (Port 5432)
- Redis (Port 6379)
- Backend (Port 3000)

### Manuel Kurulum

**PostgreSQL:**
```bash
createdb musicmood
psql musicmood < database/schema.sql
```

**Redis:**
```bash
redis-server
```

**`.env` Güncelleme:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/musicmood
REDIS_URL=redis://localhost:6379
```

---

## 🚀 Deployment

### Railway (Önerilen)

1. **Railway'e Git:** https://railway.app
2. **Proje Oluştur:** GitHub repo'nuzu bağlayın
3. **Database Ekle:** PostgreSQL + Redis (otomatik)
4. **Environment Variables:** API key'leri ekleyin

**Detaylı kurulum:** `RAILWAY.md`

### Diğer Platformlar

- **Vercel:** Frontend + Serverless functions
- **Heroku:** Full-stack deployment
- **DigitalOcean:** VPS deployment

---

## 🔒 Güvenlik

### ✅ İyi Uygulamalar
- ✅ `.env` dosyası `.gitignore`'da
- ✅ API keys backend'de saklanıyor
- ✅ CORS yapılandırması
- ✅ Input validation
- ✅ Error handling

### ⚠️ Production İçin
- [ ] HTTPS kullanın
- [ ] Rate limiting ekleyin
- [ ] Logging sistemi kurun
- [ ] Error monitoring (Sentry)
- [ ] API key rotation

**Detaylı güvenlik raporu:** `GUVENLIK_RAPORU.md`

---

## 📊 Özellik Durumu

### ✅ Tam Çalışan (Database olmadan)
- ✅ Spotify müzik önerileri
- ✅ AI açıklamaları
- ✅ Hava durumu entegrasyonu
- ✅ Google OAuth
- ✅ Şarkı preview
- ✅ Modern UI

### 🔄 Database Gerektiren
- 🔄 Mood Learning (kullanıcı tercihlerini öğrenme)
- 🔄 Session yönetimi
- 🔄 Analytics
- 🔄 Spotify cache

---

## 🐛 Hata Ayıklama

### Backend Çalışmıyor
```bash
# Port kontrolü
netstat -ano | findstr :3000

# Server loglarını kontrol edin
npm start
```

### Spotify Bağlanamıyor
- `.env` dosyasını kontrol edin
- Credentials'ların doğru olduğundan emin olun
- Spotify Developer Dashboard'da app'i kontrol edin

### Redis/PostgreSQL Hatası
- Normal! Uygulama database olmadan da çalışır
- Tam özellikler için Docker veya manuel kurulum yapın

---

## 🎭 Hava Durumu → Mood Mapping

| Hava Durumu | Mood | Energy | Valence | Tempo |
|-------------|------|--------|---------|-------|
| ☀️ Clear | Energetic | 0.8 | 0.8 | 110-140 |
| ☁️ Clouds | Chill | 0.5 | 0.5 | 90-120 |
| 🌧️ Rain | Melancholic | 0.3 | 0.2 | 60-90 |
| ❄️ Snow | Lofi | 0.4 | 0.4 | 70-100 |
| ⚡ Thunderstorm | Intense | 0.9 | 0.2 | 120-160 |

---

## 🔄 Gelecek Özellikler

- [ ] Playlist export (Spotify'a kaydetme)
- [ ] Haftalık hava durumu ve playlist önerileri
- [ ] Sosyal medya paylaşım
- [ ] PWA desteği
- [ ] Dark/Light mode toggle
- [ ] Çoklu dil desteği
- [ ] YouTube Music entegrasyonu

---

## 📄 Lisans

MIT License - Detaylar için LICENSE dosyasına bakın.

---

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 💡 İpuçları

1. **Spotify Preview:** Tüm şarkılarda preview olmayabilir
2. **Rate Limiting:** Çok fazla istek atmayın
3. **Token Yönetimi:** Server otomatik halleder
4. **Fallback:** Spotify yoksa statik playlist kullanılır
5. **Database:** Opsiyonel - temel özellikler çalışır

---

## 📚 Dokümantasyon

- **Hızlı Kurulum:** `QUICK_SETUP.md`
- **Production Rehberi:** `PRODUCTION.md`
- **Railway Deployment:** `RAILWAY.md`
- **Güvenlik Raporu:** `GUVENLIK_RAPORU.md`

---

## 🎯 Hızlı Komutlar

```bash
# Kurulum
npm install

# Development
npm run dev

# Production
npm start

# Docker (PostgreSQL + Redis)
docker compose up -d

# Docker durdur
docker compose down
```

---

**Keyifli müzik keşifleri!** 🎵✨

Made with ❤️ using Spotify API, OpenAI, and modern web technologies.

---

**Son Güncelleme:** 26 Aralık 2025  
**Versiyon:** 2.0.0  
**Durum:** ✅ Production Ready
