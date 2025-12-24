# 🔐 Google Authentication Kurulum Rehberi

## Sorun
Google girişi yapılandırılmamış veya geçersiz Client ID kullanılıyor.

## ✅ Çözüm Adımları

### 1. Google Cloud Console'a Giriş Yapın
- [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
- Google hesabınızla giriş yapın

### 2. Yeni Proje Oluşturun (veya mevcut projeyi seçin)
- Sol üst köşeden proje seçin veya yeni proje oluşturun
- Proje adı: `MusicMood` (veya istediğiniz bir isim)

### 3. OAuth Consent Screen'i Yapılandırın
1. Sol menüden **APIs & Services** > **OAuth consent screen** seçin
2. **External** seçin ve **CREATE** butonuna tıklayın
3. Gerekli bilgileri doldurun:
   - **App name**: MusicMood
   - **User support email**: Email adresiniz
   - **Developer contact information**: Email adresiniz
4. **SAVE AND CONTINUE** butonuna tıklayın
5. Scopes ekranında **SAVE AND CONTINUE** butonuna tıklayın
6. Test users ekranında **SAVE AND CONTINUE** butonuna tıklayın

### 4. OAuth 2.0 Client ID Oluşturun
1. Sol menüden **APIs & Services** > **Credentials** seçin
2. **+ CREATE CREDENTIALS** > **OAuth client ID** seçin
3. **Application type**: **Web application** seçin
4. **Name**: MusicMood Web Client
5. **Authorized JavaScript origins** bölümüne ekleyin:
   ```
   http://localhost:5500
   http://localhost:3000
   http://127.0.0.1:5500
   https://your-production-domain.com  (production için)
   ```
6. **Authorized redirect URIs** bölümüne ekleyin:
   ```
   http://localhost:5500
   http://localhost:3000
   https://your-production-domain.com  (production için)
   ```
7. **CREATE** butonuna tıklayın

### 5. Client ID'yi Kopyalayın
- Oluşturulan Client ID şu formatta olacaktır:
  ```
  123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
  ```
- Bu değeri kopyalayın

### 6. config.js Dosyasını Güncelleyin
`config.js` dosyasını açın ve şu satırı bulun:
```javascript
const GOOGLE_CLIENT_ID = window.ENV?.GOOGLE_CLIENT_ID ||
    'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';
```

Kopyaladığınız Client ID ile değiştirin:
```javascript
const GOOGLE_CLIENT_ID = window.ENV?.GOOGLE_CLIENT_ID ||
    '123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com';
```

### 7. Sayfayı Yenileyin
- Tarayıcınızı yenileyin (F5 veya Ctrl+R)
- Google Sign-In butonu artık çalışmalı

## 🔍 Doğrulama
Tarayıcı konsolunda (F12) şu mesajları görmelisiniz:
```
✅ Google Auth başarıyla yüklendi
🔐 Auth module loaded
```

Eğer hala hata alıyorsanız:
```
⚠️ Google Client ID yapılandırılmamış veya geçersiz.
```
Bu mesajı görüyorsanız, Client ID'nin doğru formatta olduğundan emin olun.

## 📝 Notlar
- Client ID **PUBLIC** bir bilgidir, gizli tutmanıza gerek yoktur
- Client Secret **GİZLİ** bir bilgidir, frontend'de ASLA kullanmayın
- Production için mutlaka production domain'inizi Authorized origins'e ekleyin

## 🚀 Production Deployment
Production'a deploy ederken:
1. Production domain'inizi Google Cloud Console'da Authorized JavaScript origins'e ekleyin
2. Environment variable olarak Client ID'yi ayarlayın:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

## ❓ Sık Karşılaşılan Hatalar

### "redirect_uri_mismatch" hatası
- Google Cloud Console'da Authorized redirect URIs'e domain'inizi ekleyin

### "origin_mismatch" hatası
- Google Cloud Console'da Authorized JavaScript origins'e domain'inizi ekleyin

### "idpiframe_initialization_failed" hatası
- Tarayıcınızın third-party cookies'i engellemediğinden emin olun
- Gizli modda (incognito) test edin

## 🔗 Faydalı Linkler
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
