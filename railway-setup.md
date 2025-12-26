# 🚂 Railway Spotify API Kurulum Rehberi

## 🎯 Hızlı Kurulum

### Yöntem 1: Railway Dashboard (Tavsiye Edilen)

1. **Railway'e Giriş Yapın:**
   ```
   https://railway.com/project/2420043d-8c5d-4852-a23a-601c1f610aee
   ```

2. **Backend Servisini Seçin:**
   - Projenizde Node.js/Backend servisini bulun ve tıklayın

3. **Variables Sekmesine Gidin:**
   - "Variables" veya "Environment Variables" sekmesine tıklayın

4. **Spotify API Anahtarlarını Ekleyin:**
   
   **Variable Name:** `SPOTIFY_CLIENT_ID`  
   **Value:** `a2e7c0e1f83d4f7e9bb8e9a68292eb16`
   
   **Variable Name:** `SPOTIFY_CLIENT_SECRET`  
   **Value:** `[Spotify Dashboard'dan alın]`

5. **Kaydet ve Deploy:**
   - "Add" veya "Save" butonuna tıklayın
   - Railway otomatik olarak yeniden deploy edecektir

---

## Yöntem 2: Railway CLI

### Adım 1: Railway CLI Kurulumu

```bash
# Railway CLI'yi global olarak yükleyin
npm install -g @railway/cli
```

### Adım 2: Giriş Yapın

```bash
# Railway hesabınıza giriş yapın
railway login
```

Bu komut tarayıcınızı açacak ve giriş yapmanızı isteyecektir.

### Adım 3: Projeyi Bağlayın

```bash
# Proje dizinine gidin
cd "d:\Cursor projeler\music mood"

# Railway projesine bağlanın
railway link 2420043d-8c5d-4852-a23a-601c1f610aee
```

### Adım 4: Environment Variables Ekleyin

```bash
# Spotify Client ID ekleyin
railway variables set SPOTIFY_CLIENT_ID=a2e7c0e1f83d4f7e9bb8e9a68292eb16

# Spotify Client Secret ekleyin (kendi secret'ınızı yazın)
railway variables set SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

### Adım 5: Değişkenleri Kontrol Edin

```bash
# Tüm environment variables'ları görüntüleyin
railway variables
```

### Adım 6: Deploy Edin (Opsiyonel)

```bash
# Manuel deploy (Railway otomatik deploy edecektir)
railway up
```

---

## 🔑 Spotify Client Secret Nasıl Alınır?

1. **Spotify Developer Dashboard'a Gidin:**
   ```
   https://developer.spotify.com/dashboard
   ```

2. **Uygulamanıza Tıklayın:**
   - MusicMood uygulamanızı bulun ve tıklayın

3. **Settings'e Gidin:**
   - "Settings" butonuna tıklayın

4. **Client Secret'ı Görüntüleyin:**
   - "View client secret" butonuna tıklayın
   - Client Secret'ı kopyalayın

5. **Railway'e Ekleyin:**
   - Yukarıdaki yöntemlerden birini kullanarak ekleyin

---

## ✅ Doğrulama

### Health Check

Deploy tamamlandıktan sonra API'nizi test edin:

```bash
# Railway URL'inizi alın
railway open

# Veya doğrudan health endpoint'i test edin
curl https://your-app.up.railway.app/api/health
```

Başarılı yanıt:

```json
{
  "status": "OK",
  "timestamp": "2025-12-26T12:02:43.000Z",
  "spotify": {
    "configured": true,
    "tokenValid": true
  },
  "database": {
    "connected": true
  },
  "redis": {
    "connected": true
  }
}
```

### Spotify Test

```bash
# Recommendations endpoint'i test edin
curl "https://your-app.up.railway.app/api/recommendations?weather=Clear"
```

---

## 🔒 Güvenlik Notları

### ⚠️ YAPMAYIN:
- ❌ Client Secret'ı GitHub'a yüklemeyin
- ❌ Client Secret'ı public olarak paylaşmayın
- ❌ `.env` dosyasını commit etmeyin

### ✅ YAPIN:
- ✅ Environment variables'ı Railway dashboard'da saklayın
- ✅ `.env` dosyasını `.gitignore`'a ekleyin (zaten ekli)
- ✅ Sadece gerekli kişilerle paylaşın

---

## 🚨 Sık Karşılaşılan Hatalar

### Hata 1: "Spotify token alınamadı"

**Neden:**
- Client ID veya Client Secret yanlış
- Environment variables henüz yüklenmemiş

**Çözüm:**
```bash
# Variables'ları kontrol edin
railway variables

# Yeniden deploy edin
railway up
```

### Hata 2: "Environment variable not found"

**Neden:**
- Variable adı yanlış yazılmış
- Railway henüz yeniden deploy etmemiş

**Çözüm:**
```bash
# Variable adlarını kontrol edin (büyük/küçük harf duyarlı)
railway variables

# 1-2 dakika bekleyin ve tekrar deneyin
```

### Hata 3: "Deployment failed"

**Neden:**
- Build hatası
- Syntax hatası

**Çözüm:**
```bash
# Logları kontrol edin
railway logs

# Local'de test edin
npm start
```

---

## 📊 Tüm Environment Variables

Railway'de şu variables'ların olması gerekiyor:

```env
# Spotify API (ZORUNLU)
SPOTIFY_CLIENT_ID=a2e7c0e1f83d4f7e9bb8e9a68292eb16
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Database (Railway otomatik ekler)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Server Configuration
NODE_ENV=production
PORT=${{PORT}}

# Google OAuth (Opsiyonel)
GOOGLE_CLIENT_ID=your_google_client_id_here

# OpenAI (Opsiyonel)
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🎯 Sonraki Adımlar

Environment variables eklendikten sonra:

1. ✅ Railway otomatik olarak yeniden deploy edecek
2. ✅ Health endpoint'i kontrol edin
3. ✅ Spotify entegrasyonunu test edin
4. ✅ Frontend'i Railway URL'i ile güncelleyin

---

## 💡 İpuçları

1. **Otomatik Deploy:** Railway, environment variable değişikliklerinde otomatik deploy eder
2. **Değişiklik Süresi:** Deploy genellikle 2-3 dakika sürer
3. **Logs:** Sorun yaşarsanız `railway logs` ile logları kontrol edin
4. **Rollback:** Sorun olursa Railway dashboard'dan önceki versiyona dönebilirsiniz

---

**Başarılar!** 🚀✨

Herhangi bir sorunla karşılaşırsanız Railway loglarını kontrol edin:
```bash
railway logs --tail
```
