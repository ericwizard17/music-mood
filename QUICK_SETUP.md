# 🚀 Hızlı Kurulum Rehberi

## ⚠️ Şu An Çalışmayan Özellikler

1. ❌ **Sanatçı fotoğrafları görünmüyor**
2. ❌ **Aylık dinleyici sayıları görünmüyor**
3. ❌ **Google girişi çalışmıyor**

**Neden?** `.env` dosyasında API key'ler eksik!

---

## ✅ Çözüm: 3 Adımda Kurulum

### Adım 1: Spotify API Key'leri Alın (5 dakika)

1. **Spotify Developer'a gidin:**
   ```
   https://developer.spotify.com/dashboard
   ```

2. **"Create an App" butonuna tıklayın**

3. **App bilgilerini doldurun:**
   - App name: `MusicMood`
   - App description: `Weather-based music recommendations`
   - Redirect URI: `http://localhost:3000`

4. **"Settings" butonuna tıklayın**

5. **Client ID ve Client Secret'ı kopyalayın**

---

### Adım 2: `.env` Dosyasını Düzenleyin

1. **`.env` dosyasını açın** (proje klasöründe)

2. **Spotify key'lerini yapıştırın:**
   ```env
   SPOTIFY_CLIENT_ID=buraya_client_id_yapistirin
   SPOTIFY_CLIENT_SECRET=buraya_client_secret_yapistirin
   ```

3. **Dosyayı kaydedin** (Ctrl+S)

---

### Adım 3: Sunucuyu Yeniden Başlatın

1. **Terminal'de Ctrl+C ile sunucuyu durdurun**

2. **Tekrar başlatın:**
   ```bash
   npm start
   ```

3. **Tarayıcıyı yenileyin:** `http://localhost:3000`

---

## 🎉 Sonuç

Artık şunları görebileceksiniz:
- ✅ Sanatçı fotoğrafları (album art)
- ✅ Aylık dinleyici sayıları (örn: 1.5M)
- ✅ Spotify'dan gerçek zamanlı şarkılar

---

## 🔐 Google Girişi (Opsiyonel)

Google girişi için:

1. **Google Cloud Console'a gidin:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **OAuth 2.0 Client ID oluşturun**

3. **`.env` dosyasına ekleyin:**
   ```env
   GOOGLE_CLIENT_ID=buraya_google_client_id_yapistirin.apps.googleusercontent.com
   ```

4. **Sunucuyu yeniden başlatın**

Detaylı rehber: [GOOGLE_AUTH_CHECK.md](GOOGLE_AUTH_CHECK.md)

---

## 🤖 AI Önerileri (Opsiyonel)

AI destekli açıklamalar için:

1. **OpenAI API Key alın:**
   ```
   https://platform.openai.com/api-keys
   ```

2. **`.env` dosyasına ekleyin:**
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Sunucuyu yeniden başlatın**

Detaylı rehber: [AI_SETUP.md](AI_SETUP.md)

---

## 📋 Özet Checklist

- [ ] Spotify Developer'da app oluşturdum
- [ ] Client ID ve Secret kopyaladım
- [ ] `.env` dosyasına yapıştırdım
- [ ] Sunucuyu yeniden başlattım
- [ ] Tarayıcıyı yeniledim
- [ ] Sanatçı fotoğraflarını görüyorum ✅

---

## ❓ Sorun mu Yaşıyorsunuz?

### "Spotify API yapılandırılmamış" hatası

**Çözüm:**
1. `.env` dosyasında `SPOTIFY_CLIENT_ID` ve `SPOTIFY_CLIENT_SECRET` var mı?
2. Değerler doğru kopyalandı mı? (boşluk yok)
3. Sunucu yeniden başlatıldı mı?

### "Statik playlist kullanılıyor" mesajı

**Çözüm:**
- Bu normal! Spotify key'leri ekleyince otomatik olarak Spotify'a geçecek

### Hala çalışmıyor

**Kontrol edin:**
```bash
# Terminal'de:
node -e "require('dotenv').config(); console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID)"
```

Eğer `undefined` görüyorsanız, `.env` dosyası doğru yüklenmemiş demektir.

---

## 🎯 Beklenen Sonuç

Kurulum sonrası şarkı kartları şöyle görünecek:

```
┌─────────────────────────────────┐
│ [Album Fotoğrafı]               │
│                                 │
│ #1                              │
│ Blinding Lights                 │
│ The Weeknd [🟢] [👥 15.2M]     │
│ After Hours • 3:20              │
│ [▶️] [🎵] [ℹ️]                  │
└─────────────────────────────────┘
```

**Özellikler:**
- 🖼️ Album kapağı
- 🎵 Şarkı adı
- 👤 Sanatçı adı
- 🟢 Spotify profil linki
- 👥 Aylık dinleyici sayısı (gerçek zamanlı)
- ⏱️ Şarkı süresi
- ▶️ 30 saniyelik önizleme
- 🎵 Spotify'da aç
- ℹ️ Detaylı bilgi

---

**Kurulum süresi:** ~5 dakika
**Zorluk:** Kolay ⭐

Başarılar! 🎉
