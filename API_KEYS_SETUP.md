# 🔑 API Keys Kurulum Rehberi - MusicMood

## ⚠️ ÖNEMLİ UYARI
Verdiğiniz API key (`sk-proj-...`) bir **OpenAI API key**'dir ve bu projede **KULLANILMAZ**!

Bu proje şu API'leri kullanır:
1. ✅ **OpenWeatherMap API** (Hava durumu) - ZORUNLU
2. ✅ **Spotify API** (Müzik önerileri) - ZORUNLU
3. ✅ **Google OAuth** (Kullanıcı girişi) - Opsiyonel

---

## 1️⃣ OpenWeatherMap API Key (ÜCRETSİZ - ZORUNLU)

### 📝 Kayıt Adımları

#### Adım 1: Hesap Oluşturun
1. 🌐 [OpenWeatherMap Sign Up](https://home.openweathermap.org/users/sign_up) sayfasına gidin
2. Formu doldurun:
   - **Username**: Kullanıcı adınız (örn: musicmood_user)
   - **Email**: Geçerli email adresiniz
   - **Password**: Güçlü bir şifre
3. ✅ "I am 16 years old and over" kutusunu işaretleyin
4. ✅ "I agree with Privacy Policy, Terms and conditions..." kutusunu işaretleyin
5. **Create Account** butonuna tıklayın

#### Adım 2: Email Doğrulama (ÇOK ÖNEMLİ!)
1. 📧 Email kutunuzu kontrol edin
2. OpenWeatherMap'ten gelen "Please confirm your email" başlıklı emaili açın
3. **Verify your email** linkine tıklayın
4. ⏰ **DİKKAT**: API key'in aktif olması **30 dakika - 2 saat** sürebilir!

#### Adım 3: API Key'i Alın
1. [OpenWeatherMap](https://home.openweathermap.org/) sitesine giriş yapın
2. Sağ üst köşeden **kullanıcı adınıza** tıklayın
3. **My API Keys** sekmesine gidin
4. **Default** API key'i göreceksiniz (örnek: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
5. 📋 Bu key'i kopyalayın

#### Adım 4: Projeye Ekleyin
1. `config.js` dosyasını açın
2. Şu satırı bulun (yaklaşık 23. satır):
   ```javascript
   const OPENWEATHER_API_KEY = window.ENV?.OPENWEATHER_API_KEY ||
       'YOUR_API_KEY_HERE';
   ```
3. `YOUR_API_KEY_HERE` yerine kopyaladığınız key'i yapıştırın:
   ```javascript
   const OPENWEATHER_API_KEY = window.ENV?.OPENWEATHER_API_KEY ||
       'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
   ```
4. Dosyayı kaydedin (Ctrl+S)

### ✅ Test Edin
1. Tarayıcıda sayfayı yenileyin (F5)
2. Bir şehir adı girin (örn: "Istanbul")
3. "Ara" butonuna tıklayın
4. Hava durumu bilgileri görünmeli!

### ⚠️ Sorun Giderme
- **"API anahtarı geçersiz" hatası**: Email doğrulaması yaptınız mı?
- **"401 Unauthorized" hatası**: API key'in aktif olması için 30-120 dakika bekleyin
- **"404 Not Found" hatası**: Şehir adını doğru yazdığınızdan emin olun

### 💰 Ücretsiz Limitler
- **1,000 istek/gün** (Günlük kullanım için fazlasıyla yeterli)
- **60 istek/dakika**
- Kredi kartı gerektirmez ✅

---

## 2️⃣ Spotify API (ZORUNLU - Müzik Önerileri İçin)

### 📝 Kayıt Adımları

#### Adım 1: Spotify Developer Dashboard
1. 🌐 [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) sayfasına gidin
2. Spotify hesabınızla giriş yapın (yoksa ücretsiz oluşturun)
3. **Create an App** butonuna tıklayın

#### Adım 2: App Oluşturun
1. **App name**: `MusicMood` (veya istediğiniz bir isim)
2. **App description**: `Weather-based music recommendations`
3. **Redirect URIs**: 
   ```
   http://localhost:3000/callback
   http://localhost:5500/callback
   ```
4. ✅ Terms of Service'i kabul edin
5. **Create** butonuna tıklayın

#### Adım 3: Credentials'ları Alın
1. Oluşturduğunuz app'e tıklayın
2. **Settings** butonuna tıklayın
3. **Client ID** ve **Client Secret**'i kopyalayın

#### Adım 4: .env Dosyasına Ekleyin
1. Proje klasöründe `.env` dosyası oluşturun (yoksa)
2. Şu satırları ekleyin:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   PORT=3000
   ```
3. `your_client_id_here` ve `your_client_secret_here` yerine kopyaladığınız değerleri yapıştırın

#### Adım 5: Server'ı Başlatın
```bash
npm install
npm start
```

### ✅ Test Edin
1. Tarayıcıda `http://localhost:3000` açın
2. Bir şehir arayın
3. Spotify'dan gelen gerçek şarkı önerilerini görün!

**Detaylı kurulum için**: [SPOTIFY_SETUP.md](SPOTIFY_SETUP.md)

---

## 3️⃣ Google OAuth Client ID (OPSİYONEL - Kullanıcı Girişi İçin)

### 📝 Kayıt Adımları

#### Adım 1: Google Cloud Console
1. 🌐 [Google Cloud Console](https://console.cloud.google.com/) sayfasına gidin
2. Yeni proje oluşturun: **MusicMood**

#### Adım 2: OAuth Consent Screen
1. **APIs & Services** > **OAuth consent screen**
2. **External** seçin
3. Gerekli bilgileri doldurun

#### Adım 3: Client ID Oluşturun
1. **APIs & Services** > **Credentials**
2. **Create Credentials** > **OAuth client ID**
3. **Application type**: Web application
4. **Authorized JavaScript origins**:
   ```
   http://localhost:5500
   http://localhost:3000
   file://
   ```
5. Client ID'yi kopyalayın (format: `xxxxx.apps.googleusercontent.com`)

#### Adım 4: config.js'e Ekleyin
1. `config.js` dosyasını açın
2. Şu satırı bulun:
   ```javascript
   const GOOGLE_CLIENT_ID = window.ENV?.GOOGLE_CLIENT_ID ||
       'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';
   ```
3. Kopyaladığınız Client ID'yi yapıştırın

**Detaylı kurulum için**: [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md)

---

## 📊 Kurulum Durumu Kontrol Listesi

### Minimum Gereksinimler (Uygulamanın Çalışması İçin)
- [ ] ✅ OpenWeatherMap API Key eklendi
- [ ] ✅ Spotify Client ID ve Secret eklendi
- [ ] ✅ Server çalışıyor (`npm start`)

### Opsiyonel Özellikler
- [ ] 🔐 Google OAuth yapılandırıldı (Kullanıcı girişi için)
- [ ] 📦 PostgreSQL kuruldu (Mood learning için)
- [ ] 🚀 Redis kuruldu (Cache için)

---

## 🔒 Güvenlik Notları

### ⚠️ ASLA YAPMAYIN:
- ❌ API key'leri GitHub'a push etmeyin
- ❌ Client Secret'i frontend kodunda kullanmayın
- ❌ API key'leri public repository'de paylaşmayın

### ✅ YAPMANIZ GEREKENLER:
- ✅ `.env` dosyasını `.gitignore`'a ekleyin
- ✅ Environment variables kullanın
- ✅ Client Secret'i sadece backend'de kullanın
- ✅ API key'leri düzenli olarak rotate edin

---

## 🆘 Yardım

### Hata Mesajları

#### "API anahtarı yapılandırılmamış"
- `config.js` dosyasında `OPENWEATHER_API_KEY` değerini güncelleyin
- API key'in doğru kopyalandığından emin olun

#### "Google Client ID yapılandırılmamış"
- `config.js` dosyasında `GOOGLE_CLIENT_ID` değerini güncelleyin
- Client ID formatının `.apps.googleusercontent.com` ile bittiğinden emin olun

#### "Spotify bağlanamıyor"
- `.env` dosyasında `SPOTIFY_CLIENT_ID` ve `SPOTIFY_CLIENT_SECRET` değerlerini kontrol edin
- Server'ın çalıştığından emin olun (`npm start`)

### Daha Fazla Yardım
- 📖 [README.md](README.md) - Genel bakış
- 🎵 [SPOTIFY_SETUP.md](SPOTIFY_SETUP.md) - Detaylı Spotify kurulumu
- 🔐 [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md) - Detaylı Google OAuth kurulumu
- 🌤️ [API_SETUP.md](API_SETUP.md) - OpenWeatherMap detayları

---

## 🎯 Hızlı Başlangıç (TL;DR)

```bash
# 1. OpenWeatherMap API Key al
# https://openweathermap.org/api → Sign Up → Email Doğrula → API Key Kopyala

# 2. config.js'i güncelle
# OPENWEATHER_API_KEY = 'your_key_here'

# 3. Spotify API al
# https://developer.spotify.com/dashboard → Create App → Credentials Kopyala

# 4. .env dosyası oluştur
echo "SPOTIFY_CLIENT_ID=your_id" > .env
echo "SPOTIFY_CLIENT_SECRET=your_secret" >> .env

# 5. Çalıştır
npm install
npm start

# 6. Tarayıcıda aç
# http://localhost:3000
```

**Keyifli müzik keşifleri!** 🎵✨
