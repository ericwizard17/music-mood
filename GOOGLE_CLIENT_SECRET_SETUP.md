# 🔑 Google Client Secret Kurulum

## Hızlı Kurulum

Google Client Secret'ınız projeye eklenmeye hazır!

### Adım 1: .env Dosyasını Düzenleyin

`.env` dosyasını açın ve şu satırı bulun:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

Bu satırı şununla değiştirin:
```env
GOOGLE_CLIENT_SECRET=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
```

**ÖNEMLİ NOT:** Bu değer aslında bir **Client Secret** (GOCSPX- prefix'i bunu gösterir). 
Google OAuth için hem Client ID hem de Client Secret gereklidir.

### Adım 2: Tam .env Yapılandırması

`.env` dosyanız şöyle görünmeli:

```env
# ==========================================
# MUSICMOOD - ENVIRONMENT VARIABLES
# ==========================================

# SPOTIFY API (ZORUNLU)
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# GOOGLE OAUTH (Kullanıcı girişi için)
# Client ID - Frontend'de kullanılır (config.js)
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
# Client Secret - Backend'de kullanılır
GOOGLE_CLIENT_SECRET=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

# OPENAI API (Opsiyonel - AI açıklamaları için)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# SERVER CONFIGURATION
PORT=3000
NODE_ENV=development
```

### Adım 3: Google Client ID'yi Alın

Google Cloud Console'dan Client ID'nizi de almanız gerekiyor:

1. https://console.cloud.google.com/apis/credentials adresine gidin
2. OAuth 2.0 Client ID'nizi bulun
3. Client ID'yi kopyalayın (format: `xxxxx.apps.googleusercontent.com`)
4. `.env` dosyasındaki `GOOGLE_CLIENT_ID` satırına yapıştırın

### Adım 4: Frontend Config'i Güncelleyin

`config.js` dosyası otomatik olarak güncellenmiştir. Google Client ID'yi oradan da kullanabilirsiniz.

---

## 🚀 Çalıştırma

Değişiklikleri yaptıktan sonra:

```bash
npm start
```

---

## ✅ Doğrulama

Google OAuth'un çalıştığını kontrol etmek için:

1. Tarayıcıda `http://localhost:3000` açın
2. "Google ile Giriş Yap" butonunu görmelisiniz
3. Butona tıklayın ve Google hesabınızla giriş yapın

---

## 🔒 Güvenlik

**ÖNEMLİ:** 
- ✅ `.env` dosyası `.gitignore`'da - GitHub'a yüklenmez
- ✅ Client Secret'ı asla public olarak paylaşmayın
- ✅ Production'da Railway environment variables kullanın

---

## 📚 Daha Fazla Bilgi

Detaylı Google OAuth kurulumu için:
- `GOOGLE_AUTH_CHECK.md` dosyasına bakın
- `README.md` - Google OAuth bölümü

---

**Hazır!** 🎉 Google OAuth artık projenizde kullanıma hazır.
