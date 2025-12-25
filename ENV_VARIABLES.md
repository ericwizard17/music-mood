# 🔑 Environment Variables Rehberi

## Genel Bakış

MusicMood uygulaması için gerekli tüm environment variables ve yapılandırma bilgileri.

---

## 📋 Gerekli Environment Variables

### 1. **OPENAI_API_KEY** (YENİ! - Zorunlu) 🤖

**Açıklama:** AI Müzik Danışmanı için OpenAI API anahtarı

**Nasıl Alınır:**
1. [OpenAI Platform](https://platform.openai.com/api-keys) adresine gidin
2. "Create new secret key" butonuna tıklayın
3. API key'i kopyalayın

**Format:**
```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Kullanım:**
- Backend'de AI açıklamaları üretmek için
- GPT-3.5-turbo modeli ile çalışır

**Maliyet:**
- ~$0.0015 per request (GPT-3.5-turbo)
- Ücretsiz tier: $5 kredi

---

### 2. **SPOTIFY_CLIENT_ID** (Zorunlu) 🎵

**Açıklama:** Spotify API için client ID

**Nasıl Alınır:**
1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) adresine gidin
2. "Create an App" butonuna tıklayın
3. Client ID'yi kopyalayın

**Format:**
```
32 karakterlik hexadecimal string
Örnek: 3f0a0f8b6e3f4c5d9e8f7a6b5c4d3e2f
```

**Kullanım:**
- Müzik önerileri almak için
- Şarkı arama için
- Audio features için

---

### 3. **SPOTIFY_CLIENT_SECRET** (Zorunlu) 🔐

**Açıklama:** Spotify API için client secret

**Nasıl Alınır:**
- Spotify Developer Dashboard'da Client ID ile birlikte verilir

**Format:**
```
32 karakterlik hexadecimal string
```

**⚠️ ÖNEMLİ:**
- Bu değer GİZLİ tutulmalıdır
- Asla frontend'de kullanmayın
- Git'e commit etmeyin

---

### 4. **GOOGLE_CLIENT_ID** (Opsiyonel) 🔐

**Açıklama:** Google OAuth 2.0 için client ID

**Nasıl Alınır:**
1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) adresine gidin
2. "Create Credentials" → "OAuth client ID" seçin
3. Application type: "Web application"
4. Authorized JavaScript origins ekleyin:
   ```
   http://localhost:3000
   https://service-name-396747194422.europe-west1.run.app
   ```
5. Client ID'yi kopyalayın

**Format:**
```
xxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

**Kullanım:**
- Kullanıcı girişi için
- Favori şehirler özelliği için
- Profil yönetimi için

**Not:** Opsiyonel - Olmadan da uygulama çalışır, sadece giriş özelliği olmaz

---

### 5. **DATABASE_URL** (Production için) 🗄️

**Açıklama:** PostgreSQL veritabanı bağlantı URL'i

**Format:**
```
postgresql://user:password@host:port/database
```

**Örnekler:**
```bash
# Local
postgresql://musicmood:musicmood@localhost:5432/musicmood

# Docker
postgresql://musicmood:musicmood@postgres:5432/musicmood

# Railway
${{Postgres.DATABASE_URL}}
```

**Kullanım:**
- Mood learning sistemi
- Kullanıcı tercihleri
- Arama geçmişi

---

### 6. **REDIS_URL** (Production için) 🔴

**Açıklama:** Redis cache bağlantı URL'i

**Format:**
```
redis://host:port
```

**Örnekler:**
```bash
# Local
redis://localhost:6379

# Docker
redis://redis:6379

# Railway
${{Redis.REDIS_URL}}
```

**Kullanım:**
- Spotify token caching
- Mood bias caching
- API response caching

---

### 7. **PORT** (Opsiyonel)

**Açıklama:** Server port numarası

**Varsayılan:** `3000`

**Format:**
```
3000
```

---

### 8. **NODE_ENV** (Opsiyonel)

**Açıklama:** Çalışma ortamı

**Değerler:**
- `development` - Geliştirme
- `production` - Production

**Varsayılan:** `development`

---

## 📁 Dosya Yapısı

### Backend (.env)

```bash
# .env dosyası (backend için)
OPENAI_API_KEY=sk-proj-xxx
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
PORT=3000
NODE_ENV=development
```

### Frontend (config.js)

Frontend environment variables `config.js` dosyasında tanımlanır:

```javascript
const GOOGLE_CLIENT_ID = window.ENV?.GOOGLE_CLIENT_ID ||
    'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

const OPENWEATHER_API_KEY = window.ENV?.OPENWEATHER_API_KEY ||
    'fe4feefa8543e06d4f3c66d92c61b69c';
```

---

## 🚀 Deployment

### Local Development

1. `.env.example` dosyasını `.env` olarak kopyalayın:
   ```bash
   copy .env.example .env  # Windows
   cp .env.example .env    # Mac/Linux
   ```

2. `.env` dosyasını gerçek değerlerle doldurun

3. Sunucuyu başlatın:
   ```bash
   npm start
   ```

### Production (Railway/Cloud Run)

**Railway:**
```bash
# Environment variables sekmesinde ekleyin
OPENAI_API_KEY=sk-proj-xxx
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
NODE_ENV=production
```

**Google Cloud Run:**
```bash
# Cloud Run service oluştururken
gcloud run deploy musicmood \
  --set-env-vars OPENAI_API_KEY=sk-proj-xxx \
  --set-env-vars SPOTIFY_CLIENT_ID=xxx \
  --set-env-vars SPOTIFY_CLIENT_SECRET=xxx \
  --set-env-vars GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com \
  --set-env-vars NODE_ENV=production
```

---

## 🔒 Güvenlik

### ✅ Yapılması Gerekenler

1. **`.env` dosyasını Git'e eklemeyin:**
   ```bash
   # .gitignore dosyasında
   .env
   .env.local
   .env.production
   ```

2. **API key'leri asla frontend'de hardcode etmeyin**

3. **Production'da environment variables kullanın**

4. **Client Secret'ları asla frontend'e göndermeyin**

### ❌ Yapılmaması Gerekenler

- ❌ API key'leri Git'e commit etmeyin
- ❌ Client Secret'ı frontend'de kullanmayın
- ❌ `.env` dosyasını public repository'ye yüklemeyin
- ❌ API key'leri console.log ile yazdırmayın

---

## 🧪 Test

### Environment Variables Kontrolü

```bash
# Node.js ile test
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY)"

# Tüm environment variables
node -e "require('dotenv').config(); console.log(process.env)"
```

### Frontend Kontrolü

Tarayıcı console'unda:
```javascript
console.log(window.CONFIG);
// {
//   API_BASE: "http://localhost:3000",
//   GOOGLE_CLIENT_ID: "xxx.apps.googleusercontent.com",
//   OPENWEATHER_API_KEY: "xxx",
//   IS_PRODUCTION: false,
//   IS_DEVELOPMENT: true
// }
```

---

## 📊 Öncelik Sırası

### Zorunlu (Uygulama çalışmaz)
1. ✅ **SPOTIFY_CLIENT_ID**
2. ✅ **SPOTIFY_CLIENT_SECRET**
3. ✅ **OPENAI_API_KEY** (AI özellikleri için)

### Önemli (Bazı özellikler çalışmaz)
4. ⚠️ **GOOGLE_CLIENT_ID** (Giriş özelliği için)

### Opsiyonel (Production için)
5. 📦 **DATABASE_URL** (Mood learning için)
6. 📦 **REDIS_URL** (Caching için)

---

## 🆘 Sorun Giderme

### "API key not configured" hatası
- `.env` dosyasını kontrol edin
- Dosya adının `.env` olduğundan emin olun (`.env.example` değil)
- Sunucuyu yeniden başlatın

### "Invalid API key" hatası
- API key'in doğru kopyalandığından emin olun
- Boşluk veya özel karakter olmadığını kontrol edin
- API key'in aktif olduğunu kontrol edin

### "Google Client ID invalid" hatası
- Format kontrolü: `.apps.googleusercontent.com` ile bitmeli
- Authorized JavaScript origins eklenmiş mi?
- `config.js` dosyasında doğru mu?

---

## 📚 İlgili Dokümantasyon

- [AI_SETUP.md](AI_SETUP.md) - OpenAI API kurulumu
- [GOOGLE_AUTH_CHECK.md](GOOGLE_AUTH_CHECK.md) - Google OAuth kurulumu
- [SPOTIFY_SETUP.md](SPOTIFY_SETUP.md) - Spotify API kurulumu
- [README.md](README.md) - Genel bakış

---

**Son Güncelleme:** 2025-12-25
**Versiyon:** 2.1.0
