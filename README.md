# 🎵 MusicMood - Hava Durumuna Göre Müzik Önerileri

Hava durumuna göre size özel **Spotify** müzik önerileri sunan, **AI-powered mood learning** sistemi ile donatılmış modern web uygulaması.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)
![Redis](https://img.shields.io/badge/Redis-7-red.svg)

## ✨ Özellikler

### 🎵 Spotify Entegrasyonu
- ✅ **Gerçek Zamanlı Öneriler**: Spotify API ile hava durumuna göre 10 şarkı
- ✅ **Album Art**: Her şarkının albüm kapağı
- ✅ **30s Preview**: Şarkıları dinleme özelliği
- ✅ **Spotify'da Aç**: Doğrudan Spotify'da açma
- ✅ **Audio Features**: Energy, Valence, Tempo, Acousticness detayları
- ✅ **Redis Cache**: 1 saatlik cache ile hızlı yanıt

### 🧠 Mood Learning System
- ✅ **Akıllı Öğrenme**: Kullanıcı tercihlerini öğrenir
- ✅ **Günlük Bias**: Her gün için ayrı mood profili
- ✅ **PostgreSQL**: Kalıcı veri saklama
- ✅ **Redis Cache**: Hızlı bias hesaplama
- ✅ **Session Management**: UUID bazlı oturum yönetimi

### 📊 Mood Score System
- ✅ **Dinamik Hesaplama**: Hava + Sıcaklık + Saat
- ✅ **3 Kategori**: Energetic, Chill, Melancholic
- ✅ **Manuel Ayar**: -20 ile +20 arası slider
- ✅ **Görselleştirme**: Progress bar ve renk kodları

### 🔐 Kullanıcı Yönetimi
- ✅ **Google OAuth 2.0**: Güvenli giriş
- ✅ **Favori Şehirler**: Maksimum 10 şehir
- ✅ **Profil**: Avatar ve isim gösterimi
- ✅ **Session**: LocalStorage + Backend session

### 🎨 Modern Tasarım
- ✅ **Dark Theme**: Göz yormayan karanlık tema
- ✅ **Glassmorphism**: Modern UI efektleri
- ✅ **Animasyonlar**: Smooth transitions
- ✅ **Responsive**: Tüm cihazlarda mükemmel
- ✅ **Toast Notifications**: Kullanıcı geri bildirimleri

## 🚀 Hızlı Başlangıç

### 1️⃣ Kurulum

```bash
# Projeyi klonlayın
git clone <repository-url>
cd music-mood

# Bağımlılıkları yükleyin
npm install

# Environment variables oluşturun
copy .env.example .env  # Windows
# cp .env.example .env  # Mac/Linux
```

### 2️⃣ API Credentials

#### Spotify API (Detaylı: [SPOTIFY_SETUP.md](SPOTIFY_SETUP.md))
1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. "Create an App" → Credentials'ları kopyalayın
3. `.env` dosyasına ekleyin:
```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

#### OpenWeatherMap API (Detaylı: [API_SETUP.md](API_SETUP.md))
1. [OpenWeatherMap](https://openweathermap.org/api)
2. Ücretsiz API key alın
3. `app.js` dosyasında `CONFIG.API_KEY` güncelleyin

#### Google OAuth (Opsiyonel)
1. [Google Cloud Console](https://console.cloud.google.com/)
2. OAuth 2.0 Client ID oluşturun
3. `auth.js` dosyasında `AUTH_CONFIG.CLIENT_ID` güncelleyin

### 3️⃣ Çalıştırın

```bash
# Server'ı başlatın
npm start

# Veya development mode
npm run dev
```

Tarayıcıda: `http://localhost:3000`

## 📁 Proje Yapısı

```
music-mood/
├── server.js              # Express.js backend server
├── spotify.js             # Frontend Spotify entegrasyonu
├── auth.js                # Google OAuth 2.0
├── app.js                 # Ana uygulama mantığı
├── playlists.js           # Statik playlist (fallback)
├── index.html             # Ana sayfa
├── styles.css             # Tüm stiller
├── package.json           # Node.js dependencies
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── README.md              # Bu dosya
├── SPOTIFY_SETUP.md       # Spotify kurulum rehberi
└── API_SETUP.md           # OpenWeatherMap kurulum rehberi
```

## 🎯 API Endpoints

### Backend Server (Port 3000)

```bash
# Health check
GET /api/health

# Hava durumuna göre öneriler
GET /api/recommendations?weather=Clear

# Şarkı arama
GET /api/search?q=Coldplay

# Şarkı detayları
GET /api/track/:trackId
```

## 🎭 Hava Durumu → Mood Mapping

| Hava Durumu | Mood | Energy | Valence | Tempo | Acousticness |
|-------------|------|--------|---------|-------|--------------|
| ☀️ Clear | Energetic | 0.8 | 0.8 | 110-140 | 0.3 |
| ☁️ Clouds | Chill | 0.5 | 0.5 | 90-120 | 0.5 |
| 🌧️ Rain | Melancholic | 0.3 | 0.2 | 60-90 | 0.6 |
| ❄️ Snow | Lofi | 0.4 | 0.4 | 70-100 | 0.7 |
| ⚡ Thunderstorm | Intense | 0.9 | 0.2 | 120-160 | 0.2 |

## 🛠️ Teknolojiler

### Backend
- **Express.js** - Web framework
- **Axios** - HTTP client
- **dotenv** - Environment variables
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Semantik yapı
- **CSS3** - Modern tasarım, glassmorphism
- **Vanilla JavaScript** - Framework'süz
- **Google Sign-In API** - OAuth 2.0
- **OpenWeatherMap API** - Hava durumu
- **Spotify Web API** - Müzik önerileri

## 🎨 Özellikler Detayı

### Spotify Entegrasyonu
- ✅ Hava durumuna göre otomatik şarkı önerileri
- ✅ Album art gösterimi
- ✅ 30 saniyelik preview çalma
- ✅ Spotify'da açma linki
- ✅ Audio features detayları
- ✅ Fallback: Spotify yoksa statik playlist

### Google OAuth
- ✅ Güvenli giriş
- ✅ Profil fotoğrafı ve isim gösterimi
- ✅ Favori şehirler kaydetme
- ✅ LocalStorage ile oturum yönetimi

### UX İyileştirmeleri
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Input validation
- ✅ Responsive design
- ✅ Smooth animations

## 🔒 Güvenlik

### Backend
- ✅ Environment variables ile credential yönetimi
- ✅ CORS yapılandırması
- ✅ Token caching ve yenileme
- ✅ Error handling

### Frontend
- ✅ Input sanitization
- ✅ XSS koruması
- ✅ Secure localStorage kullanımı

### ⚠️ Production İçin
- [ ] HTTPS kullanın
- [ ] Rate limiting ekleyin
- [ ] Logging sistemi kurun
- [ ] Error monitoring (Sentry)
- [ ] API key rotation

## 📊 Performans

- ⚡ Vanilla JS (framework overhead yok)
- ⚡ Token caching (gereksiz API çağrıları yok)
- ⚡ Lazy loading (album art'lar)
- ⚡ Optimized animations
- ⚡ Minimal bundle size

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
- [SPOTIFY_SETUP.md](SPOTIFY_SETUP.md) rehberini takip edin

### Google Sign-In Çalışmıyor
- Client ID'nin doğru olduğundan emin olun
- Authorized JavaScript origins'i kontrol edin
- Tarayıcı console'unda hataları kontrol edin

## 📚 Dokümantasyon

- **[SPOTIFY_SETUP.md](SPOTIFY_SETUP.md)** - Detaylı Spotify kurulum rehberi
- **[API_SETUP.md](API_SETUP.md)** - OpenWeatherMap kurulum rehberi
- **[README.md](README.md)** - Genel bakış (bu dosya)

## 🚀 Deployment

### Vercel / Netlify
```bash
# Build komutu
npm run build

# Start komutu
npm start
```

### Environment Variables
```env
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx
PORT=3000
NODE_ENV=production
```

## 🔄 Gelecek Özellikler

- [ ] Playlist export (Spotify'a kaydetme)
- [ ] Haftalık hava durumu ve playlist önerileri
- [ ] Sosyal medya paylaşım
- [ ] PWA desteği
- [ ] Dark/Light mode toggle
- [ ] Çoklu dil desteği
- [ ] YouTube Music entegrasyonu
- [ ] Apple Music entegrasyonu

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

## 🎯 Hızlı Komutlar

```bash
# Kurulum
npm install

# Development
npm run dev

# Production
npm start

# Dependencies güncelleme
npm update

# Audit
npm audit
```

## 💡 İpuçları

1. **Spotify Preview**: Tüm şarkılarda preview olmayabilir
2. **Rate Limiting**: Çok fazla istek atmayın
3. **Token Yönetimi**: Server otomatik halleder
4. **Fallback**: Spotify yoksa statik playlist kullanılır
5. **Favori Limit**: Maksimum 10 şehir

---

**Client ID (Google)**: `c82d44b1373944a79331dd3d99ba1ecb`

**Keyifli müzik keşifleri!** 🎵✨

Made with ❤️ using Spotify API
