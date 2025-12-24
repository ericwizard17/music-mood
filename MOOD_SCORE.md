# 🎭 Mood Score Sistemi - Kullanım Rehberi

## 📊 Mood Score Nedir?

Mood Score, hava durumu, sıcaklık ve saat bilgilerini birleştirerek 0-100 arası bir skor hesaplayan sistemdir.

### Skor Aralıkları

| Skor | Kategori | Açıklama | Renk |
|------|----------|----------|------|
| 0-30 | Melankolik | Low Energy / Duygusal | 🟣 Mor (#8b5cf6) |
| 31-60 | Chill | Neutral / Sakin | 🔵 Mavi (#3b82f6) |
| 61-100 | Energetic | Pozitif / Enerjik | 🟠 Turuncu (#f59e0b) |

## 🧮 Hesaplama Formülü

```javascript
Mood Score = (Hava Durumu × 0.4) + (Sıcaklık × 0.3) + (Saat × 0.3)
```

### Hava Durumu Skorları

```javascript
Clear (Açık)      → 85
Clouds (Bulutlu)  → 60
Mist/Fog (Sisli)  → 55
Snow (Karlı)      → 50
Drizzle (Çisenti) → 45
Rain (Yağmurlu)   → 35
Thunderstorm      → 25
```

### Sıcaklık Skorları

```javascript
20-25°C (İdeal)   → 85
15-20°C (Serin)   → 70
25-30°C (Sıcak)   → 65
5-15°C (Soğuk)    → 55
>30°C (Çok sıcak) → 50
<5°C (Çok soğuk)  → 40
```

### Saat Skorları

```javascript
11:00-17:00 (Öğlen)  → 80
17:00-22:00 (Akşam)  → 70
06:00-11:00 (Sabah)  → 60
22:00-06:00 (Gece)   → 40
```

## 🎵 Spotify Audio Features Mapping

Mood Score, Spotify API parametrelerini belirler:

### Yüksek Mood (70-100) - Energetic

```javascript
{
  energy: 0.8,          // Yüksek enerji
  valence: 0.8,         // Pozitif ruh hali
  minTempo: 110,        // Hızlı tempo
  maxTempo: 140,
  acousticness: 0.3     // Düşük akustik
}
```

**Örnek Şarkılar**: Blinding Lights, Levitating, Don't Start Now

### Orta Mood (40-69) - Chill

```javascript
{
  energy: 0.5,          // Orta enerji
  valence: 0.5,         // Nötr ruh hali
  minTempo: 90,         // Orta tempo
  maxTempo: 120,
  acousticness: 0.5     // Orta akustik
}
```

**Örnek Şarkılar**: Weightless, Sunset Lover, Ocean Eyes

### Düşük Mood (0-39) - Melancholic

```javascript
{
  energy: 0.3,          // Düşük enerji
  valence: 0.2,         // Melankolik ruh hali
  minTempo: 60,         // Yavaş tempo
  maxTempo: 85,
  acousticness: 0.7     // Yüksek akustik
}
```

**Örnek Şarkılar**: Someone Like You, The Night We Met, Skinny Love

## 🎨 UI Renk Değişimi

Mood Score'a göre UI renkleri dinamik olarak değişir:

```css
/* Melankolik (0-30) */
--mood-color: #8b5cf6;  /* Mor */
--mood-gradient: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);

/* Chill (31-60) */
--mood-color: #3b82f6;  /* Mavi */
--mood-gradient: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);

/* Energetic (61-100) */
--mood-color: #f59e0b;  /* Turuncu */
--mood-gradient: linear-gradient(135deg, #f59e0b 0%, #f59e0b 100%);
```

## 🔧 Backend Kullanımı

### API Endpoint

```bash
GET /api/recommendations?weather=Clear&temp=22&hour=14
```

### Parametreler

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|-----------|-----|---------|------------|----------|
| weather | string | ✅ Evet | - | Hava durumu (Clear, Rain, etc.) |
| temp | number | ❌ Hayır | 20 | Sıcaklık (Celsius) |
| hour | number | ❌ Hayır | Şu anki saat | Saat (0-23) |

### Response

```json
{
  "weather": "Clear",
  "temp": 22,
  "hour": 14,
  "moodScore": {
    "total": 78,
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

## 🎮 Frontend Mood Slider

Kullanıcı manuel mood ayarı yapabilir (-20 ile +20 arası):

### HTML

```html
<div class="mood-slider-container">
    <label for="moodSlider">Mood Ayarı</label>
    <input 
        type="range" 
        min="-20" 
        max="20" 
        value="0" 
        id="moodSlider"
    />
    <span id="moodValue">0</span>
</div>
```

### JavaScript

```javascript
const slider = document.getElementById("moodSlider");
const moodValue = document.getElementById("moodValue");

slider.addEventListener("input", () => {
    moodValue.innerText = slider.value;
});

// API çağrısında kullan
const moodAdjustment = parseInt(slider.value);
const finalMoodScore = calculatedMoodScore + moodAdjustment;
```

## 📈 Örnek Senaryolar

### Senaryo 1: Güneşli Öğlen
```
Hava: Clear (85)
Sıcaklık: 24°C (85)
Saat: 14:00 (80)

Mood Score = (85 × 0.4) + (85 × 0.3) + (80 × 0.3)
           = 34 + 25.5 + 24
           = 83.5 ≈ 84 (Energetic)

Spotify: Enerjik şarkılar, yüksek tempo (110-140 BPM)
```

### Senaryo 2: Yağmurlu Gece
```
Hava: Rain (35)
Sıcaklık: 12°C (55)
Saat: 23:00 (40)

Mood Score = (35 × 0.4) + (55 × 0.3) + (40 × 0.3)
           = 14 + 16.5 + 12
           = 42.5 ≈ 43 (Chill)

Spotify: Sakin şarkılar, orta tempo (90-120 BPM)
```

### Senaryo 3: Karlı Sabah
```
Hava: Snow (50)
Sıcaklık: -2°C (40)
Saat: 08:00 (60)

Mood Score = (50 × 0.4) + (40 × 0.3) + (60 × 0.3)
           = 20 + 12 + 18
           = 50 (Chill)

Spotify: Lo-fi beats, akustik şarkılar
```

### Senaryo 4: Fırtınalı Akşam + Manuel Ayar
```
Hava: Thunderstorm (25)
Sıcaklık: 18°C (70)
Saat: 20:00 (70)

Base Mood Score = (25 × 0.4) + (70 × 0.3) + (70 × 0.3)
                = 10 + 21 + 21
                = 52 (Chill)

Manuel Ayar: +15
Final Mood Score = 52 + 15 = 67 (Energetic)

Spotify: Orta-yüksek enerjili şarkılar
```

## 🔄 Akış Diyagramı

```
┌─────────────────┐
│  Weather API    │
│  (OpenWeather)  │
└────────┬────────┘
         │
         ├─► weather: "Clear"
         ├─► temp: 22°C
         └─► hour: 14
         │
         ▼
┌─────────────────┐
│ calculateMood   │
│ Score()         │
└────────┬────────┘
         │
         ├─► weatherScore: 85
         ├─► tempScore: 85
         ├─► timeScore: 80
         └─► total: 84
         │
         ▼
┌─────────────────┐
│ getMoodCategory │
└────────┬────────┘
         │
         └─► category: "energetic"
         │
         ▼
┌─────────────────┐
│ moodToAudio()   │
└────────┬────────┘
         │
         ├─► energy: 0.8
         ├─► valence: 0.8
         └─► tempo: 110-140
         │
         ▼
┌─────────────────┐
│ Spotify API     │
│ Recommendations │
└────────┬────────┘
         │
         └─► 10 şarkı
```

## 💡 İpuçları

1. **Sıcaklık Etkisi**: 20-25°C arası en yüksek mood score'u verir
2. **Saat Etkisi**: Öğlen saatleri (11-17) en enerjik
3. **Hava Etkisi**: Clear (açık hava) en pozitif etkiyi yapar
4. **Manuel Ayar**: Kullanıcı -20/+20 arası ayar yapabilir
5. **Dinamik**: Her arama için yeniden hesaplanır

## 🎯 Kullanım Örnekleri

### Test 1: Maksimum Mood
```bash
curl "http://localhost:3000/api/recommendations?weather=Clear&temp=22&hour=14"
# Beklenen Mood Score: ~84 (Energetic)
```

### Test 2: Minimum Mood
```bash
curl "http://localhost:3000/api/recommendations?weather=Thunderstorm&temp=2&hour=2"
# Beklenen Mood Score: ~27 (Melancholic)
```

### Test 3: Orta Mood
```bash
curl "http://localhost:3000/api/recommendations?weather=Clouds&temp=18&hour=10"
# Beklenen Mood Score: ~63 (Energetic)
```

## 📚 Kod Referansları

- **Backend**: `moodScore.js` - Tüm hesaplama fonksiyonları
- **API**: `server.js` - `/api/recommendations` endpoint
- **Frontend**: `spotify.js` - UI entegrasyonu (eklenecek)

---

**Mood Score sistemi ile daha kişiselleştirilmiş müzik deneyimi!** 🎵✨
