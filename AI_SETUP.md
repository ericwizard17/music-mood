# 🤖 AI Müzik Danışmanı - Kurulum ve Kullanım

## Genel Bakış

MusicMood uygulamasına OpenAI entegrasyonu eklendi! Artık hava durumuna göre müzik önerileriniz AI tarafından akıllıca açıklanıyor ve nedenlerini öğreniyorsunuz.

## ✨ Yeni Özellikler

### 1. **AI Destekli Açıklamalar**
- Hava durumu ve müzik uyumunun nedenleri
- Seçilen şarkıların neden bu hava durumuna uygun olduğu
- Müzik dinlerken yapılabilecek aktivite önerileri

### 2. **Akıllı Öneriler**
- OpenAI GPT-3.5-turbo modeli kullanılarak üretilen kişiselleştirilmiş açıklamalar
- Türkçe, samimi ve ilham verici dil
- Her arama için benzersiz içerik

### 3. **Fallback Sistemi**
- OpenAI API'ye erişilemediğinde otomatik olarak yerleşik açıklamalar kullanılır
- Kesintisiz kullanıcı deneyimi

## 🔧 Kurulum

### 1. OpenAI API Key Alma

1. [OpenAI Platform](https://platform.openai.com/api-keys) adresine gidin
2. Hesabınıza giriş yapın (yoksa ücretsiz hesap oluşturun)
3. "Create new secret key" butonuna tıklayın
4. API key'inizi kopyalayın (sadece bir kez gösterilir!)

### 2. Ortam Değişkenlerini Ayarlama

`.env` dosyanızı oluşturun veya güncelleyin:

```bash
# OpenAI API
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Diğer gerekli değişkenler
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### 3. Bağımlılıkları Yükleme

```bash
npm install
```

OpenAI paketi otomatik olarak yüklenecektir:
- `openai@^4.20.1`

### 4. Sunucuyu Başlatma

```bash
npm start
```

veya geliştirme modu için:

```bash
npm run dev
```

## 📖 Kullanım

### Frontend'den AI Açıklaması Alma

Kullanıcı bir şehir aradığında, otomatik olarak:

1. Hava durumu bilgisi alınır
2. Uygun mood ve şarkılar belirlenir
3. AI'dan açıklama istenir
4. Sonuç güzel bir kart içinde gösterilir

### API Endpoint'leri

#### POST `/api/ai-recommendations`

AI destekli müzik önerisi açıklaması alır.

**Request Body:**
```json
{
  "city": "Istanbul",
  "weather": "Clear",
  "temperature": 22,
  "mood": "energetic",
  "songs": [
    {
      "title": "Blinding Lights",
      "artist": "The Weeknd",
      "genre": "Synthpop"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "explanation": "22°C'de açık ve güneşli havasında enerjik müzikler dinlemek için harika bir gün! Bu hava durumu, pozitif enerjili şarkılarla mükemmel uyum sağlıyor...",
  "mood": "energetic",
  "weatherContext": {
    "city": "Istanbul",
    "weather": "Clear",
    "temperature": 22
  }
}
```

#### POST `/api/ai-insights`

Belirli şarkılar hakkında AI destekli içgörüler alır.

**Request Body:**
```json
{
  "songs": [...],
  "mood": "chill"
}
```

## 🎨 UI Özellikleri

### AI Açıklama Kartı

- **Gradient arka plan** - Mor-mavi gradient efekt
- **Animasyonlu glow efekti** - Sürekli parlayan arka plan
- **Loading spinner** - AI yanıtı beklerken gösterilir
- **Smooth animasyonlar** - FadeInUp animasyonu ile gösterilir

### Stil Özellikleri

```css
.ai-explanation-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.1);
}
```

## 🔒 Güvenlik

- API key'ler **asla** frontend'e gönderilmez
- Tüm AI istekleri backend üzerinden yapılır
- `.env` dosyası `.gitignore`'da yer alır
- Environment variables Railway/Docker'da güvenli şekilde saklanır

## 💡 Özelleştirme

### AI Prompt'unu Değiştirme

`aiRecommendations.js` dosyasında `generateMusicRecommendation` fonksiyonundaki prompt'u düzenleyebilirsiniz:

```javascript
const prompt = `Sen bir müzik uzmanısın. Aşağıdaki bilgilere göre...`;
```

### Fallback Açıklamalarını Özelleştirme

`aiRecommendations.js` dosyasında `getFallbackExplanation` fonksiyonunu düzenleyin:

```javascript
const explanations = {
    energetic: `Özel açıklamanız...`,
    chill: `...`,
    // ...
};
```

### AI Model Değiştirme

Farklı bir OpenAI modeli kullanmak için:

```javascript
const completion = await openai.chat.completions.create({
    model: "gpt-4", // veya "gpt-3.5-turbo"
    // ...
});
```

## 📊 Maliyet Optimizasyonu

### Token Kullanımı

- Her istek yaklaşık **300-500 token** kullanır
- GPT-3.5-turbo ile maliyet: ~$0.0015 per request
- GPT-4 ile maliyet: ~$0.015 per request

### Öneri

- Geliştirme için GPT-3.5-turbo kullanın
- Production'da yüksek kalite için GPT-4 düşünülebilir
- Caching mekanizması ekleyerek maliyeti azaltabilirsiniz

## 🐛 Sorun Giderme

### "OpenAI API Error" Hatası

1. API key'in doğru olduğundan emin olun
2. OpenAI hesabınızda kredi olduğunu kontrol edin
3. `.env` dosyasının doğru yüklendiğini kontrol edin

```bash
# Test için
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY)"
```

### AI Açıklaması Görünmüyor

1. Browser console'u kontrol edin
2. Network tab'ında `/api/ai-recommendations` isteğini kontrol edin
3. Fallback açıklama gösteriliyorsa, backend loglarını kontrol edin

### Yavaş Yanıt Süresi

- OpenAI API genellikle 2-5 saniye sürer
- Loading spinner kullanıcıya gösterilir
- Timeout ayarı eklenebilir

## 🚀 İleri Seviye

### Redis Cache Ekleme

Aynı şehir için tekrar eden istekleri önlemek için:

```javascript
// Cache key oluştur
const cacheKey = `ai:${city}:${weather}:${mood}`;

// Cache'den kontrol et
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// AI'dan al ve cache'le
const result = await generateMusicRecommendation(...);
await redis.setex(cacheKey, 3600, JSON.stringify(result)); // 1 saat
```

### Rate Limiting

Çok fazla istek önlemek için:

```javascript
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10 // maksimum 10 istek
});

app.post('/api/ai-recommendations', aiLimiter, async (req, res) => {
  // ...
});
```

## 📝 Lisans

Bu özellik MIT lisansı altında sunulmaktadır.

## 🤝 Katkıda Bulunma

AI açıklamalarını geliştirmek için PR'lar memnuniyetle karşılanır!

---

**Not:** OpenAI API kullanımı için [OpenAI Terms of Service](https://openai.com/policies/terms-of-use) kabul edilmelidir.
