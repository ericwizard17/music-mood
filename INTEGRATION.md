# 🎯 MusicMood - Tam Entegrasyon Rehberi

## 🎵 Spotify API + Mood Score + Learning System

Bu rehber, tüm sistemin nasıl entegre çalıştığını açıklar.

## 📊 Sistem Akışı

```
┌─────────────────────────────────────────────────────────┐
│                    WEATHER API                          │
│              (OpenWeatherMap)                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─► hour: 14
                 ├─► weather: "Clear"
                 └─► temp: 22°C
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              calculateMoodScore()                       │
│         (hour × 0.3 + weather × 0.4 + temp × 0.3)      │
└────────────────┬────────────────────────────────────────┘
                 │
                 └─► Base Mood: 78
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              getLearnedBias()                           │
│         (Kullanıcının geçmiş tercihleri)               │
└────────────────┬────────────────────────────────────────┘
                 │
                 └─► Learned Bias: +5
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Kullanıcı Slider                           │
│                (Manuel ayar)                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 └─► User Offset: +10
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              applyUserMood()                            │
│    finalMood = baseMood + learnedBias + userOffset     │
│              (78 + 5 + 10 = 93)                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 └─► Final Mood: 93
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              moodToAudio()                              │
│         (Mood → Spotify Audio Features)                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─► energy: 0.8
                 ├─► valence: 0.8
                 ├─► minTempo: 110
                 └─► maxTempo: 140
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Spotify API                                │
│         GET /v1/recommendations                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 └─► 10 Şarkı Önerisi
```

## 🔧 Backend Entegrasyonu

### server.js

```javascript
const { calculateMoodScore, moodToAudio, getMoodCategory } = require('./moodScore');

app.get("/api/recommendations", async (req, res) => {
    const weather = req.query.weather;
    const temp = parseFloat(req.query.temp) || 20;
    const hour = parseInt(req.query.hour) || new Date().getHours();

    // 1. Base mood hesapla
    const baseMood = calculateMoodScore({ hour, weather, temp });
    
    // 2. Mood → Audio features
    const audio = moodToAudio(baseMood);
    
    // 3. Spotify'dan şarkı al
    const spotifyRes = await axios.get(
        'https://api.spotify.com/v1/recommendations',
        {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                seed_genres: "pop,indie,lofi,chill,acoustic",
                limit: 10,
                target_energy: audio.energy,
                target_valence: audio.valence,
                min_tempo: audio.minTempo,
                max_tempo: audio.maxTempo,
                target_acousticness: audio.acousticness
            }
        }
    );
    
    res.json({
        weather,
        temp,
        hour,
        moodScore: {
            total: baseMood,
            category: getMoodCategory(baseMood).category,
            description: getMoodCategory(baseMood).description,
            color: getMoodCategory(baseMood).color
        },
        audioFeatures: audio,
        tracks: spotifyRes.data.tracks,
        count: spotifyRes.data.tracks.length
    });
});
```

## 🎨 Frontend Entegrasyonu

### spotify.js (Güncellenmiş)

```javascript
// Mood learning modülünü import et
// <script src="moodLearning.js"></script>

async function searchWeatherAndMusicWithSpotify() {
    const city = elements.cityInput.value.trim();
    
    // Hava durumu verisini çek
    const weatherData = await fetchWeatherData(city);
    const weatherMain = weatherData.weather[0].main;
    const temp = weatherData.main.temp;
    const hour = new Date().getHours();
    
    // 1. Backend'den base mood al
    const response = await fetch(
        `http://localhost:3000/api/recommendations?weather=${weatherMain}&temp=${temp}&hour=${hour}`
    );
    const data = await response.json();
    
    const baseMood = data.moodScore.total;
    
    // 2. Öğrenilmiş bias'ı al
    const learnedBias = MoodLearning.getLearnedBias();
    
    // 3. Kullanıcı slider değerini al
    const userOffset = Number(document.getElementById('moodSlider').value);
    
    // 4. Final mood hesapla
    const finalMood = applyUserMood(
        baseMood + learnedBias,
        userOffset
    );
    
    // 5. UI'ı güncelle
    MoodScoreUI.updateMoodUI(finalMood);
    displaySpotifyTracks(data.tracks);
    
    // 6. Kullanıcı tercihini kaydet
    if (userOffset !== 0) {
        MoodLearning.saveMoodFeedback(userOffset);
    }
}

function applyUserMood(baseMood, userOffset) {
    const finalMood = baseMood + userOffset;
    return Math.max(0, Math.min(100, finalMood));
}
```

### HTML Yapısı

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <title>MusicMood</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Mood Score Görselleştirme -->
    <div class="mood-display">
        <div class="mood-bar">
            <div id="moodFill" class="mood-fill"></div>
        </div>
        <p>
            Mood Score: <span id="moodScore">50</span>
            <span id="moodCategory" class="mood-category">Chill</span>
        </p>
        <small id="moodDescription">Sakin ve dengeli</small>
    </div>

    <!-- Mood Slider -->
    <div class="mood-slider-container">
        <label for="moodSlider">
            <svg>...</svg>
            Mood Ayarı
        </label>
        <div class="mood-slider-wrapper">
            <span class="mood-slider-min">😔</span>
            <input 
                type="range" 
                min="-20" 
                max="20" 
                value="0" 
                id="moodSlider"
                class="mood-slider"
            />
            <span class="mood-slider-max">😊</span>
        </div>
        <div class="mood-slider-value">
            <span id="moodValue">0</span>
            <small>Otomatik hesaplanan değere eklenir</small>
        </div>
    </div>

    <!-- Scripts -->
    <script src="playlists.js"></script>
    <script src="auth.js"></script>
    <script src="app.js"></script>
    <script src="moodLearning.js"></script>
    <script src="moodUI.js"></script>
    <script src="spotify.js"></script>
</body>
</html>
```

### CSS Stilleri

```css
/* Mood Bar */
.mood-bar {
    width: 100%;
    height: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1rem;
}

.mood-fill {
    height: 100%;
    width: 0%;
    transition: width 0.4s ease, background 0.4s ease;
    background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
}

/* Mood Display */
.mood-display {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
}

#moodScore {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-accent-primary);
}

.mood-category {
    font-size: 1rem;
    font-weight: 600;
    margin-left: 1rem;
}

#moodDescription {
    display: block;
    color: var(--color-text-muted);
    margin-top: 0.5rem;
}

/* Mood Slider */
.mood-slider-container {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
}

.mood-slider-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.mood-slider-label svg {
    width: 20px;
    height: 20px;
}

.mood-slider-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.mood-slider {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    outline: none;
    --slider-color: #6366f1;
}

.mood-slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--slider-color);
    cursor: pointer;
    transition: all 0.2s ease;
}

.mood-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
}

.mood-slider-min,
.mood-slider-max {
    font-size: 1.5rem;
}

.mood-slider-value {
    text-align: center;
    margin-top: 1rem;
}

.mood-slider-value span {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-accent-primary);
}

.mood-slider-value small {
    display: block;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
}
```

## 📈 Kullanım Örnekleri

### Örnek 1: İlk Kullanım (Öğrenme Yok)

```javascript
// Kullanıcı Istanbul'u arıyor
weather: "Clear"
temp: 22°C
hour: 14:00

// Backend hesaplama
baseMood = calculateMoodScore({ hour: 14, weather: "Clear", temp: 22 })
         = (80 × 0.3) + (85 × 0.4) + (85 × 0.3)
         = 24 + 34 + 25.5
         = 83.5 ≈ 84

// Frontend
learnedBias = 0 (ilk kullanım)
userOffset = 0 (slider ortada)

finalMood = 84 + 0 + 0 = 84 (Energetic)

// Spotify
audio = moodToAudio(84)
      = { energy: 0.8, valence: 0.8, minTempo: 110, maxTempo: 140 }

// Sonuç: Enerjik şarkılar
```

### Örnek 2: Kullanıcı Slider ile Ayar Yapıyor

```javascript
// Kullanıcı slider'ı +10'a çekiyor
baseMood = 84
learnedBias = 0
userOffset = +10

finalMood = 84 + 0 + 10 = 94 (Energetic)

// Kaydet
saveMoodFeedback(+10)

// localStorage:
{
  "2025-12-24": {
    "totalOffset": 10,
    "count": 1
  }
}
```

### Örnek 3: Aynı Gün İkinci Arama (Öğrenme Başladı)

```javascript
// Kullanıcı tekrar arama yapıyor
weather: "Clouds"
temp: 18°C
hour: 16:00

baseMood = calculateMoodScore({ hour: 16, weather: "Clouds", temp: 18 })
         = (80 × 0.3) + (60 × 0.4) + (70 × 0.3)
         = 24 + 24 + 21
         = 69

// Öğrenilmiş bias (bugünkü ortalama)
learnedBias = getLearnedBias()
            = 10 / 1 = 10

// Kullanıcı bu sefer +5 ekliyor
userOffset = +5

finalMood = 69 + 10 + 5 = 84 (Energetic)

// Kaydet
saveMoodFeedback(+5)

// localStorage:
{
  "2025-12-24": {
    "totalOffset": 15,  // 10 + 5
    "count": 2
  }
}

// Yeni learned bias: 15 / 2 = 7.5 ≈ 8
```

### Örnek 4: Bir Hafta Sonra (Akıllı Öneri)

```javascript
// 7 gün boyunca kullanım
localStorage:
{
  "2025-12-24": { "totalOffset": 15, "count": 3 },
  "2025-12-25": { "totalOffset": 20, "count": 4 },
  "2025-12-26": { "totalOffset": -10, "count": 2 },
  "2025-12-27": { "totalOffset": 12, "count": 3 },
  "2025-12-28": { "totalOffset": 8, "count": 2 },
  "2025-12-29": { "totalOffset": 15, "count": 3 },
  "2025-12-30": { "totalOffset": 10, "count": 2 }
}

// İstatistikler
stats = getMoodStats(7)
      = {
          totalSearches: 19,
          averageOffset: 70 / 19 ≈ 4,
          trend: 'neutral',
          recommendation: 'Dengeli bir müzik tercihiniz var'
        }

// Öneri sistemi
suggestion = suggestMoodAdjustment(baseMood)
           = {
               suggestion: +4,
               confidence: 'medium',
               message: 'Geçmiş tercihlerinize göre +4 öneriyoruz'
             }
```

## 🎯 API Endpoint'leri

### GET /api/recommendations

```bash
# Temel kullanım
GET /api/recommendations?weather=Clear&temp=22&hour=14

# Response
{
  "weather": "Clear",
  "temp": 22,
  "hour": 14,
  "moodScore": {
    "total": 84,
    "category": "energetic",
    "description": "Enerjik / Pozitif",
    "color": "#f59e0b"
  },
  "audioFeatures": {
    "energy": 0.8,
    "valence": 0.8,
    "minTempo": 110,
    "maxTempo": 140,
    "acousticness": 0.3
  },
  "tracks": [...],
  "count": 10
}
```

## 📚 Dosya Yapısı

```
music-mood/
├── server.js              # Express backend
├── moodScore.js           # Mood hesaplama (backend)
├── moodLearning.js        # Öğrenme sistemi (frontend)
├── moodUI.js              # UI kontrolleri (frontend)
├── spotify.js             # Spotify entegrasyonu (frontend)
├── app.js                 # Ana uygulama mantığı
├── auth.js                # Google OAuth
├── playlists.js           # Statik playlist (fallback)
├── index.html             # Ana sayfa
├── styles.css             # Tüm stiller
├── package.json           # Dependencies
├── .env                   # Environment variables
└── README.md              # Dokümantasyon
```

## 🚀 Çalıştırma

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env dosyasını oluştur
cp .env.example .env

# 3. Spotify credentials ekle
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# 4. Server'ı başlat
npm start

# 5. Tarayıcıda aç
http://localhost:3000
```

## 💡 Önemli Notlar

1. **Mood Score**: Otomatik hesaplanan base değer (0-100)
2. **Learned Bias**: Kullanıcının geçmiş tercihlerinden öğrenilen offset
3. **User Offset**: Kullanıcının manuel slider ayarı (-20 ile +20)
4. **Final Mood**: `baseMood + learnedBias + userOffset` (0-100 arası sınırlı)
5. **LocalStorage**: Tüm öğrenme verileri tarayıcıda saklanır
6. **30 Gün**: Eski veriler otomatik temizlenir

## 🎨 UI Renk Kodları

- **Energetic (70-100)**: `#f59e0b` (Turuncu)
- **Chill (40-69)**: `#3b82f6` (Mavi)
- **Melancholic (0-39)**: `#8b5cf6` (Mor)

---

**Tüm sistem entegre ve çalışmaya hazır!** 🎵✨
