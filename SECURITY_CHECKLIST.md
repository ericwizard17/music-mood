# 🔒 GitHub'a Yüklemeden Önce Güvenlik Kontrolü

## ⚠️ KRİTİK: API Key'leri Koruyun!

GitHub'a yüklemeden önce **MUTLAKA** bu kontrolleri yapın:

---

## ✅ Güvenlik Checklist

### 1. `.env` Dosyası Korunuyor mu?

```bash
# Kontrol et:
git status

# .env dosyası listede OLMAMALI!
# Eğer görünüyorsa:
git rm --cached .env
```

**Beklenen:** `.env` dosyası git tarafından izlenmiyor ✅

---

### 2. `.gitignore` Doğru mu?

`.gitignore` dosyasında şunlar olmalı:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

**Durum:** ✅ Zaten mevcut

---

### 3. Commit Geçmişinde API Key Var mı?

```bash
# Kontrol et:
git log --all --full-history --source -- .env

# Eğer sonuç varsa, geçmişi temizleyin!
```

---

## 🚨 Eğer API Key'leri Yanlışlıkla Yüklediyseniz

### Acil Adımlar:

1. **Hemen Spotify Key'leri Yenileyin:**
   ```
   https://developer.spotify.com/dashboard/c82d44b1373944a79331dd3d99ba1ecb/settings
   ```
   - "Rotate client secret" butonuna tıklayın
   - Yeni secret'ı `.env` dosyasına ekleyin

2. **Git Geçmişini Temizleyin:**
   ```bash
   # BFG Repo-Cleaner kullanın
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push
   git push origin --force --all
   ```

3. **Google/OpenAI Key'leri de Yenilediyseniz:**
   - Google: https://console.cloud.google.com/apis/credentials
   - OpenAI: https://platform.openai.com/api-keys

---

## ✅ Güvenli GitHub Yükleme

### Adım 1: Son Kontrol

```bash
# Hangi dosyalar yüklenecek?
git status

# .env OLMAMALI!
```

### Adım 2: Commit

```bash
git add .
git commit -m "feat: Add Spotify integration with artist followers"
```

### Adım 3: Push

```bash
git push origin main
```

---

## 📋 Yüklenmesi Gereken Dosyalar

✅ **Güvenli (Yüklenebilir):**
- `.env.example` (placeholder key'ler)
- `.gitignore` (güvenlik ayarları)
- `README.md`
- `QUICK_SETUP.md`
- `AI_SETUP.md`
- Tüm kod dosyaları (`.js`, `.html`, `.css`)

❌ **Asla Yüklenmemeli:**
- `.env` (gerçek API key'ler)
- `node_modules/` (bağımlılıklar)
- `.vscode/` (IDE ayarları)

---

## 🔐 Production Deployment

Production'da (Railway, Heroku, vb.) API key'leri şöyle ekleyin:

### Railway:
```bash
# Dashboard → Variables sekmesi
SPOTIFY_CLIENT_ID=c82d44b1373944a79331dd3d99ba1ecb
SPOTIFY_CLIENT_SECRET=a2e7c0e1f83d4f7e9bb8e9a68292eb16
```

### Heroku:
```bash
heroku config:set SPOTIFY_CLIENT_ID=c82d44b1373944a79331dd3d99ba1ecb
heroku config:set SPOTIFY_CLIENT_SECRET=a2e7c0e1f83d4f7e9bb8e9a68292eb16
```

### Google Cloud Run:
```bash
gcloud run deploy musicmood \
  --set-env-vars SPOTIFY_CLIENT_ID=c82d44b1373944a79331dd3d99ba1ecb \
  --set-env-vars SPOTIFY_CLIENT_SECRET=a2e7c0e1f83d4f7e9bb8e9a68292eb16
```

---

## 🎯 Özet

**Şu an durum:**
- ✅ `.env` dosyası `.gitignore`'da
- ✅ `.env.example` placeholder key'lerle hazır
- ✅ Gerçek key'ler sadece local `.env` dosyasında
- ✅ GitHub'a yüklenmeye hazır

**Güvenli push komutu:**
```bash
git add .
git commit -m "feat: Complete Spotify integration"
git push origin main
```

---

## ⚠️ Son Uyarı

**ASLA** şunları yapmayın:
- ❌ `.env` dosyasını commit etmeyin
- ❌ API key'leri kod içine hardcode etmeyin
- ❌ Screenshot'larda API key'leri paylaşmayın
- ❌ Public repository'de key'leri bırakmayın

**Her zaman:**
- ✅ `.gitignore` kullanın
- ✅ Environment variables kullanın
- ✅ `.env.example` ile örnek gösterin
- ✅ Dokümantasyonda nasıl alınacağını açıklayın

---

**Güvenli kodlamalar!** 🔒
