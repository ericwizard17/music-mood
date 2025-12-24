# 🎵 MusicMood - Test Rehberi

Bu dosya, uygulamanın tüm özelliklerini test etmek için adım adım talimatlar içerir.

## ✅ Ön Hazırlık

### 1. Bağımlılıkları Kontrol Edin
```bash
npm install
```

### 2. Environment Variables
`.env` dosyasını oluşturun ve credentials'ları ekleyin:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
PORT=3000
```

### 3. API Keys
- **OpenWeatherMap**: `app.js` → `CONFIG.API_KEY`
- **Google OAuth**: `auth.js` → `AUTH_CONFIG.CLIENT_ID` (c82d44b1373944a79331dd3d99ba1ecb)
- **Spotify**: `.env` dosyasında

## 🚀 Server Başlatma

```bash
npm start
```

Başarılı çıktı:
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

## 🧪 Backend API Testleri

### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```

**Beklenen Sonuç:**
```json
{
  "status": "OK",
  "timestamp": "2025-12-24T...",
  "spotify": {
    "configured": true,
    "tokenValid": true
  }
}
```

### Test 2: Recommendations (Clear Weather)
```bash
curl "http://localhost:3000/api/recommendations?weather=Clear"
```

**Beklenen Sonuç:**
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

### Test 3: Recommendations (Rain Weather)
```bash
curl "http://localhost:3000/api/recommendations?weather=Rain"
```

**Kontrol Edilecekler:**
- ✅ `energy`: 0.3 (düşük)
- ✅ `valence`: 0.2 (melankolik)
- ✅ `maxTempo`: 90 (yavaş)
- ✅ `acousticness`: 0.6 (akustik)
- ✅ 10 şarkı döndü

### Test 4: Recommendations (Snow Weather)
```bash
curl "http://localhost:3000/api/recommendations?weather=Snow"
```

**Kontrol Edilecekler:**
- ✅ `energy`: 0.4
- ✅ `acousticness`: 0.7 (çok akustik)
- ✅ Lo-fi tarzı şarkılar

### Test 5: Search
```bash
curl "http://localhost:3000/api/search?q=Coldplay"
```

**Beklenen Sonuç:**
```json
{
  "query": "Coldplay",
  "tracks": [...],
  "count": 20
}
```

### Test 6: Track Details
```bash
curl "http://localhost:3000/api/track/0VjIjW4GlUZAMYd2vXMi3b"
```

**Beklenen Sonuç:**
```json
{
  "id": "0VjIjW4GlUZAMYd2vXMi3b",
  "title": "Blinding Lights",
  "artist": "The Weeknd",
  "audioFeatures": {
    "energy": 0.73,
    "valence": 0.33,
    "tempo": 171.0,
    "acousticness": 0.001,
    "danceability": 0.514,
    "instrumentalness": 0.0
  }
}
```

## 🌐 Frontend Testleri

### Test 1: Sayfa Yükleme
1. Tarayıcıda `http://localhost:3000` açın
2. **Kontrol:**
   - ✅ Logo ve başlık görünüyor
   - ✅ Arama kutusu aktif
   - ✅ Google Sign-In butonu görünüyor
   - ✅ Animasyonlar çalışıyor

### Test 2: Google OAuth (Opsiyonel)
1. "Sign in with Google" butonuna tıklayın
2. Google hesabınızla giriş yapın
3. **Kontrol:**
   - ✅ Profil fotoğrafı görünüyor
   - ✅ İsim görünüyor
   - ✅ Çıkış butonu aktif
   - ✅ Favori şehirler bölümü görünüyor

### Test 3: Hava Durumu Arama (Spotify Aktif)
1. Şehir adı girin: "Istanbul"
2. "Ara" butonuna tıklayın veya Enter'a basın
3. **Kontrol:**
   - ✅ Loading spinner göründü
   - ✅ Hava durumu kartı göründü
   - ✅ Sıcaklık ve nem bilgisi doğru
   - ✅ Mood badge göründü
   - ✅ **10 Spotify şarkısı** göründü
   - ✅ Album art'lar yüklendi
   - ✅ Toast notification: "✅ 10 Spotify şarkısı yüklendi"

### Test 4: Spotify Özellikleri
1. Bir şarkı kartına hover yapın
2. **Kontrol:**
   - ✅ Kart yukarı kalktı
   - ✅ Border rengi değişti
   - ✅ Album art üzerinde play overlay göründü

3. Album art'a tıklayın (preview varsa)
4. **Kontrol:**
   - ✅ 30 saniyelik önizleme çaldı
   - ✅ Toast: "🎵 Önizleme çalıyor..."

5. 🟢 Spotify butonuna tıklayın
6. **Kontrol:**
   - ✅ Yeni sekmede Spotify açıldı
   - ✅ Doğru şarkı gösterildi

7. ⋮ Detaylar butonuna tıklayın
8. **Kontrol:**
   - ✅ Alert ile audio features göründü
   - ✅ Energy, Valence, Tempo, Acousticness, Danceability değerleri var

### Test 5: Farklı Hava Durumları

#### Clear (Açık Hava)
- Şehir: "Cairo" (genellikle açık)
- **Beklenen:**
  - ✅ Mood: Energetic
  - ✅ Enerjik şarkılar (Blinding Lights, Levitating, etc.)
  - ✅ Yüksek tempo

#### Clouds (Bulutlu)
- Şehir: "London" (genellikle bulutlu)
- **Beklenen:**
  - ✅ Mood: Chill
  - ✅ Sakin şarkılar
  - ✅ Orta tempo

#### Rain (Yağmurlu)
- Şehir: "Seattle" (genellikle yağmurlu)
- **Beklenen:**
  - ✅ Mood: Melancholic
  - ✅ Duygusal, akustik şarkılar
  - ✅ Yavaş tempo

### Test 6: Favori Şehirler (Google OAuth Gerekli)
1. Giriş yapın
2. Bir şehir arayın
3. ⭐ butonuna tıklayın
4. **Kontrol:**
   - ✅ Toast: "Istanbul favorilere eklendi!"
   - ✅ Favori listesinde göründü
   - ✅ Tarih bilgisi var

5. Favori şehirde 🔍 butonuna tıklayın
6. **Kontrol:**
   - ✅ Otomatik arama yapıldı
   - ✅ Sonuçlar göründü

7. Favori şehirde ❌ butonuna tıklayın
8. **Kontrol:**
   - ✅ Toast: "Istanbul favorilerden kaldırıldı"
   - ✅ Listeden silindi

### Test 7: Hata Durumları

#### Boş Input
1. Arama kutusunu boş bırakın
2. "Ara" butonuna tıklayın
3. **Beklenen:**
   - ✅ Hata mesajı: "⚠️ Lütfen bir şehir adı girin"

#### Geçersiz Şehir
1. "asdfghjkl" yazın
2. "Ara" butonuna tıklayın
3. **Beklenen:**
   - ✅ Hata mesajı: "❌ Şehir bulunamadı..."

#### Spotify Server Kapalı
1. Server'ı durdurun (`Ctrl+C`)
2. Sayfa yenileyin
3. Bir şehir arayın
4. **Beklenen:**
   - ✅ Console: "⚠️ Backend server çalışmıyor, statik playlist kullanılacak"
   - ✅ Statik playlist göründü
   - ✅ Toast: "Statik playlist kullanılıyor"

## 📊 Performans Testleri

### Test 1: Sayfa Yükleme Hızı
- **Beklenen:** < 2 saniye

### Test 2: API Response Time
```bash
time curl "http://localhost:3000/api/recommendations?weather=Clear"
```
- **Beklenen:** < 1 saniye

### Test 3: Spotify Token Caching
1. İlk istek: Token alınır
2. İkinci istek: Cache'den kullanılır
3. **Kontrol:**
   - ✅ Console: "✅ Spotify token alındı" (sadece ilk istekte)
   - ✅ İkinci istek daha hızlı

## 🔒 Güvenlik Testleri

### Test 1: Environment Variables
```bash
# .env dosyası git'e eklenmemeli
git status
```
- **Beklenen:** `.env` dosyası görünmemeli

### Test 2: CORS
```bash
curl -H "Origin: http://evil.com" http://localhost:3000/api/health
```
- **Beklenen:** CORS başlıkları doğru

### Test 3: Undefined Parameters
```bash
curl "http://localhost:3000/api/recommendations?weather=Unknown"
```
- **Beklenen:**
  - ✅ 200 OK (hata vermemeli)
  - ✅ Default audio features kullanılmalı
  - ✅ Undefined parametreler filtrelenmeli

## 📱 Responsive Testleri

### Mobile (< 480px)
- ✅ Arama kutusu full width
- ✅ Şarkı kartları tek kolon
- ✅ User name gizli
- ✅ Logo küçük

### Tablet (481px - 768px)
- ✅ Şarkı kartları 2 kolon
- ✅ Header flex-wrap

### Desktop (> 768px)
- ✅ Şarkı kartları grid layout
- ✅ Tüm özellikler görünür

## ✅ Checklist

### Backend
- [ ] Server başlıyor
- [ ] Health check çalışıyor
- [ ] Spotify token alınıyor
- [ ] Recommendations endpoint çalışıyor
- [ ] Undefined params filtreleniyor
- [ ] Error handling çalışıyor

### Frontend
- [ ] Sayfa yükleniyor
- [ ] Hava durumu arama çalışıyor
- [ ] Spotify şarkıları gösteriliyor
- [ ] Album art'lar yükleniyor
- [ ] Preview çalıyor
- [ ] Spotify'da aç çalışıyor
- [ ] Detaylar gösteriliyor
- [ ] Toast notifications çalışıyor
- [ ] Fallback (statik playlist) çalışıyor

### Google OAuth
- [ ] Sign-In çalışıyor
- [ ] Profil gösteriliyor
- [ ] Favori ekleme çalışıyor
- [ ] Favori silme çalışıyor
- [ ] Favori arama çalışıyor
- [ ] Logout çalışıyor

### UX
- [ ] Loading states gösteriliyor
- [ ] Error messages anlamlı
- [ ] Animations smooth
- [ ] Responsive design çalışıyor
- [ ] Keyboard navigation çalışıyor

## 🐛 Bilinen Sorunlar

1. **Preview URL**: Tüm şarkılarda preview olmayabilir (Spotify API limiti)
2. **Rate Limiting**: Çok fazla istek atarsanız Spotify 429 döndürebilir
3. **Token Expiry**: 1 saat sonra otomatik yenilenir

## 💡 İpuçları

1. **Console'u açık tutun**: Hataları görmek için
2. **Network tab**: API çağrılarını izlemek için
3. **Postman**: Backend API'yi test etmek için
4. **Farklı şehirler**: Farklı hava durumlarını test edin

---

**Test tamamlandığında tüm checkboxlar işaretli olmalı!** ✅

Sorun bulursanız:
1. Console loglarını kontrol edin
2. Network tab'ı kontrol edin
3. Server loglarını kontrol edin
4. `.env` dosyasını kontrol edin

**Başarılı testler!** 🎵✨
