# 🎵 Spotify API Kurulum Rehberi

Bu rehber, Spotify API entegrasyonunu nasıl kuracağınızı adım adım açıklar.

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn
- Spotify hesabı
- 10-15 dakika

## 🎯 Spotify API Credentials Alma

### Adım 1: Spotify Developer Dashboard

1. [Spotify for Developers](https://developer.spotify.com/dashboard) adresine gidin
2. Spotify hesabınızla giriş yapın
3. **"Create an App"** butonuna tıklayın

### Adım 2: Uygulama Oluşturma

1. **App name**: `MusicMood` (veya istediğiniz isim)
2. **App description**: `Weather-based music recommendation app`
3. **Website**: `http://localhost:3000` (opsiyonel)
4. **Redirect URIs**: Şimdilik boş bırakabilirsiniz (Client Credentials Flow kullanıyoruz)
5. **APIs used**: Web API seçin
6. Terms of Service'i kabul edin
7. **"Create"** butonuna tıklayın

### Adım 3: Credentials'ları Kopyalama

1. Oluşturduğunuz uygulamaya tıklayın
2. **"Settings"** butonuna tıklayın
3. **Client ID**'yi kopyalayın
4. **"View client secret"** butonuna tıklayın
5. **Client Secret**'ı kopyalayın

⚠️ **Önemli**: Client Secret'ı asla paylaşmayın veya public repository'ye yüklemeyin!

## 🔧 Proje Kurulumu

### Adım 1: Bağımlılıkları Yükleyin

```bash
npm install
```

Veya yarn kullanıyorsanız:

```bash
yarn install
```

### Adım 2: Environment Variables Oluşturun

`.env.example` dosyasını kopyalayarak `.env` dosyası oluşturun:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### Adım 3: Credentials'ları Ekleyin

`.env` dosyasını açın ve Spotify credentials'larınızı ekleyin:

```env
# Spotify API
SPOTIFY_CLIENT_ID=buraya_client_id_yapisirin
SPOTIFY_CLIENT_SECRET=buraya_client_secret_yapisirin

# Server Configuration
PORT=3000
```

### Adım 4: Server'ı Başlatın

```bash
npm start
```

Geliştirme modunda (auto-reload ile):

```bash
npm run dev
```

Server başarıyla başladığında şu çıktıyı göreceksiniz:

```
╔════════════════════════════════════════╗
║     🎵 MusicMood Server Running 🎵     ║
╠════════════════════════════════════════╣
║  Port: 3000                            ║
║  URL:  http://localhost:3000           ║
╠════════════════════════════════════════╣
║  Endpoints:                            ║
║  • GET  /api/health                    ║
║  • GET  /api/recommendations?weather=  ║
║  • GET  /api/search?q=                 ║
║  • GET  /api/track/:id                 ║
╚════════════════════════════════════════╝

✅ Spotify bağlantısı başarılı
```

## ✅ Test Etme

### 1. Health Check

Tarayıcınızda veya Postman'de:

```
GET http://localhost:3000/api/health
```

Başarılı yanıt:

```json
{
  "status": "OK",
  "timestamp": "2025-12-24T18:46:00.000Z",
  "spotify": {
    "configured": true,
    "tokenValid": true
  }
}
```

### 2. Recommendations Test

```
GET http://localhost:3000/api/recommendations?weather=Clear
```

Başarılı yanıt:

```json
{
  "weather": "Clear",
  "audioFeatures": {
    "energy": 0.8,
    "valence": 0.8,
    "minTempo": 110,
    "maxTempo": 140,
    "acousticness": 0.3
  },
  "tracks": [
    {
      "id": "...",
      "title": "Blinding Lights",
      "artist": "The Weeknd",
      "album": "After Hours",
      "albumArt": "https://...",
      "previewUrl": "https://...",
      "spotifyUrl": "https://open.spotify.com/track/...",
      "duration": 200040,
      "popularity": 95
    }
    // ... 9 more tracks
  ],
  "count": 10
}
```

### 3. Search Test

```
GET http://localhost:3000/api/search?q=Coldplay
```

### 4. Track Details Test

```
GET http://localhost:3000/api/track/0VjIjW4GlUZAMYd2vXMi3b
```

## 🌐 Frontend Kullanımı

### Adım 1: Server'ı Çalıştırın

```bash
npm start
```

### Adım 2: Frontend'i Açın

Tarayıcınızda:

```
http://localhost:3000
```

### Adım 3: Kullanın

1. Bir şehir adı girin (örn: Istanbul)
2. "Ara" butonuna tıklayın
3. Spotify'dan gelen şarkıları görün!

## 🎵 Özellikler

### Album Art
- Her şarkının albüm kapağı görüntülenir
- Hover efekti ile play butonu görünür

### Preview (Önizleme)
- 🎵 butonuna tıklayarak 30 saniyelik önizleme dinleyin
- Otomatik olarak durur

### Spotify'da Aç
- 🟢 Spotify butonuna tıklayarak şarkıyı Spotify'da açın
- Yeni sekmede açılır

### Detaylar
- ⋮ butonuna tıklayarak audio features'ları görün
- Energy, Valence, Tempo, Acousticness, Danceability

## 🚨 Sık Karşılaşılan Hatalar

### Hata 1: "Spotify token alınamadı"

**Neden**: 
- Client ID veya Client Secret yanlış
- Credentials henüz aktif olmamış

**Çözüm**:
- `.env` dosyasındaki credentials'ları kontrol edin
- Spotify Developer Dashboard'da uygulamanın aktif olduğundan emin olun
- 5-10 dakika bekleyin ve tekrar deneyin

---

### Hata 2: "Backend server çalışmıyor"

**Neden**: 
- Server başlatılmamış
- Port 3000 kullanımda

**Çözüm**:
```bash
# Server'ı başlatın
npm start

# Farklı port kullanın
PORT=3001 npm start
```

---

### Hata 3: "EADDRINUSE: address already in use"

**Neden**: Port 3000 zaten kullanımda

**Çözüm**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Veya farklı port kullanın
PORT=3001 npm start
```

---

### Hata 4: "Module not found"

**Neden**: node_modules yüklenmemiş

**Çözüm**:
```bash
npm install
```

## 📊 API Kullanım Limitleri

**Spotify Free Tier**:
- ✅ Sınırsız API çağrısı
- ✅ Rate limit: ~180 requests/minute
- ✅ Recommendations API
- ✅ Search API
- ✅ Audio Features API

## 🔒 Güvenlik

### ⚠️ YAPMAYIN:
- ❌ Client Secret'ı GitHub'a yüklemeyin
- ❌ Client Secret'ı frontend'de kullanmayın
- ❌ `.env` dosyasını commit etmeyin

### ✅ YAPIN:
- ✅ `.env` dosyasını `.gitignore`'a ekleyin
- ✅ Backend'de token yönetimi yapın
- ✅ HTTPS kullanın (production'da)
- ✅ Rate limiting ekleyin

## 🔄 Token Yönetimi

Server otomatik olarak token yönetimi yapar:

1. İlk istekte token alınır
2. Token cache'lenir
3. Expire olmadan önce yenilenir
4. Her istekte geçerli token kullanılır

## 🎯 Audio Features Açıklaması

### Energy (0.0 - 1.0)
- **0.8+**: Çok enerjik (Clear weather)
- **0.5**: Orta enerji (Clouds)
- **0.3**: Düşük enerji (Rain)

### Valence (0.0 - 1.0)
- **0.8+**: Çok pozitif/mutlu
- **0.5**: Nötr
- **0.2**: Melankolik/üzgün

### Tempo (BPM)
- **110-140**: Hızlı (Clear)
- **90-120**: Orta (Clouds)
- **60-90**: Yavaş (Rain)

### Acousticness (0.0 - 1.0)
- **0.7+**: Çok akustik (Snow)
- **0.6**: Orta akustik (Rain)
- **0.3**: Az akustik (Clear)

## 📚 Ek Kaynaklar

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify API Console](https://developer.spotify.com/console)
- [Audio Features Reference](https://developer.spotify.com/documentation/web-api/reference/get-audio-features)
- [Recommendations API](https://developer.spotify.com/documentation/web-api/reference/get-recommendations)

## 💡 İpuçları

1. **Token Caching**: Server otomatik olarak token'ı cache'ler, manuel yönetim gerekmez
2. **Error Handling**: Spotify hatalarında otomatik olarak statik playlist'e geçer
3. **Preview URL**: Tüm şarkılarda preview olmayabilir (null kontrolü yapılır)
4. **Rate Limiting**: Çok fazla istek atmaktan kaçının

## 🚀 Production Deployment

Production'a deploy ederken:

1. Environment variables'ı production ortamında ayarlayın
2. HTTPS kullanın
3. CORS ayarlarını güncelleyin
4. Rate limiting ekleyin
5. Logging ekleyin
6. Error monitoring ekleyin (Sentry, etc.)

---

Herhangi bir sorunla karşılaşırsanız, lütfen bir issue açın! 🚀

**Keyifli müzik keşifleri!** 🎵✨
