# 🎯 MusicMood - Quick Reference Guide

## 📝 Backend Code Snippets

### 1. Mood Feedback Endpoint

```javascript
/**
 * POST /api/mood-feedback
 * Kullanıcının mood slider ayarını kaydeder
 */
app.post("/api/mood-feedback", async (req, res) => {
    const { offset } = req.body;
    const sessionId = req.sessionId;
    const today = new Date().toISOString().split("T")[0];

    try {
        // PostgreSQL: Upsert mood stats
        await db.query(
            `INSERT INTO user_mood_stats (session_id, date, total_offset, count)
            VALUES ($1, $2, $3, 1)
            ON CONFLICT (session_id, date)
            DO UPDATE SET
                total_offset = user_mood_stats.total_offset + $3,
                count = user_mood_stats.count + 1`,
            [sessionId, today, offset]
        );

        // Redis: Update cache
        const result = await db.query(
            `SELECT ROUND(total_offset::DECIMAL / count) as bias
            FROM user_mood_stats
            WHERE session_id = $1 AND date = $2`,
            [sessionId, today]
        );

        const newBias = result.rows[0]?.bias || 0;
        await redis.setEx(
            `mood:bias:${sessionId}:${today}`,
            86400, // 24 hours
            newBias.toString()
        );

        res.json({ ok: true, bias: newBias });
    } catch (error) {
        console.error('Mood feedback error:', error);
        res.status(500).json({ error: error.message });
    }
});
```

### 2. Get Learned Bias

```javascript
/**
 * Günlük öğrenilen bias'ı okur (Redis → PostgreSQL fallback)
 */
async function getLearnedBias(sessionId) {
    const today = new Date().toISOString().split("T")[0];
    const redisKey = `mood:bias:${sessionId}:${today}`;

    try {
        // Redis cache kontrolü
        const cached = await redis.get(redisKey);
        if (cached !== null) {
            console.log(`💾 Redis cache hit: ${redisKey}`);
            return Number(cached);
        }

        // PostgreSQL'den al
        const result = await db.query(
            `SELECT total_offset, count
            FROM user_mood_stats
            WHERE session_id = $1 AND date = $2`,
            [sessionId, today]
        );

        if (result.rows.length === 0) {
            return 0;
        }

        const { total_offset, count } = result.rows[0];
        const bias = Math.round(total_offset / count);

        // Redis'e cache'le
        await redis.setEx(redisKey, 86400, bias.toString());
        console.log(`💾 Redis cache set: ${redisKey} = ${bias}`);

        return bias;
    } catch (error) {
        console.error('Get learned bias error:', error);
        return 0;
    }
}
```

### 3. Spotify Cache Helper

```javascript
/**
 * Generic Spotify cache helper
 */
async function getSpotifyRecommendations(key, fetchFn) {
    try {
        // Redis cache kontrolü
        const cached = await redis.get(key);
        if (cached) {
            console.log(`💾 Spotify cache hit: ${key}`);
            return JSON.parse(cached);
        }

        // Spotify API'den al
        console.log(`🌐 Fetching from Spotify: ${key}`);
        const data = await fetchFn();

        // Redis'e cache'le (1 saat)
        await redis.setEx(key, 3600, JSON.stringify(data));

        return data;
    } catch (error) {
        console.error('Spotify cache error:', error);
        throw error;
    }
}
```

### 4. Recommendations Endpoint (Full)

```javascript
/**
 * GET /api/recommendations
 * Tam entegrasyon: Mood Score + Learning + Spotify Cache
 */
app.get("/api/recommendations", async (req, res) => {
    try {
        const { weather, temp = 20, hour = new Date().getHours(), userOffset = 0, city = 'Unknown' } = req.query;
        const sessionId = req.sessionId;
        const today = new Date().toISOString().split("T")[0];

        // 1. Base mood hesapla
        const baseMood = calculateMoodScore({
            hour: parseInt(hour),
            weather,
            temp: parseFloat(temp)
        });

        // 2. Learned bias al
        const learnedBias = await getLearnedBias(sessionId);

        // 3. Final mood hesapla
        const finalMood = Math.max(0, Math.min(100, 
            baseMood + learnedBias + parseInt(userOffset)
        ));

        console.log(`🎵 ${sessionId}: Base=${baseMood}, Learned=${learnedBias}, User=${userOffset}, Final=${finalMood}`);

        // 4. Spotify cache key
        const spotifyKey = `spotify:${weather}:${finalMood}`;

        // 5. Spotify'dan al (cache-aware)
        const tracks = await getSpotifyRecommendations(spotifyKey, async () => {
            const token = await getSpotifyToken();
            const audio = moodToAudio(finalMood);

            const params = {
                seed_genres: "pop,indie,lofi,chill,acoustic",
                limit: 10,
                target_energy: audio.energy,
                target_valence: audio.valence,
                min_tempo: audio.minTempo,
                max_tempo: audio.maxTempo,
                target_acousticness: audio.acousticness
            };

            const filteredParams = Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== undefined)
            );

            const spotifyRes = await axios.get(
                `${SPOTIFY_CONFIG.API_BASE_URL}/recommendations`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: filteredParams
                }
            );

            return spotifyRes.data.tracks.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(a => a.name).join(', '),
                album: track.album.name,
                albumArt: track.album.images[0]?.url,
                previewUrl: track.preview_url,
                spotifyUrl: track.external_urls.spotify,
                duration: track.duration_ms,
                popularity: track.popularity
            }));
        });

        // 6. Search log (async, non-blocking)
        logSearch({
            sessionId,
            city,
            weather,
            temp: parseFloat(temp),
            hour: parseInt(hour),
            baseMood,
            learnedBias,
            userOffset: parseInt(userOffset),
            finalMood,
            userId: req.userId
        }).catch(err => console.error('Log search error:', err));

        // 7. Response
        res.json({
            weather,
            temp: parseFloat(temp),
            hour: parseInt(hour),
            city,
            sessionId,
            moodScore: {
                base: baseMood,
                learned: learnedBias,
                userOffset: parseInt(userOffset),
                final: finalMood,
                ...getMoodCategory(finalMood)
            },
            audioFeatures: moodToAudio(finalMood),
            tracks,
            count: tracks.length
        });

    } catch (err) {
        console.error('❌ Recommendation error:', err);
        res.status(500).json({
            error: 'Recommendation error',
            message: err.message
        });
    }
});
```

## 🎨 Frontend Code Snippets

### 1. Session Management

```javascript
/**
 * Session ID yönetimi
 */
class SessionManager {
    constructor() {
        this.sessionId = this.getOrCreateSessionId();
    }

    getOrCreateSessionId() {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = this.generateUUID();
            localStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    getHeaders() {
        return {
            'x-session-id': this.sessionId,
            'x-user-id': this.getUserId()
        };
    }

    getUserId() {
        // Google OAuth'dan gelen user ID
        const user = JSON.parse(localStorage.getItem('musicmood_user') || 'null');
        return user?.id || null;
    }
}

const sessionManager = new SessionManager();
```

### 2. API Calls with Session

```javascript
/**
 * Recommendations API çağrısı
 */
async function getRecommendations(weather, temp, hour, userOffset) {
    try {
        const params = new URLSearchParams({
            weather,
            temp,
            hour,
            userOffset,
            city: elements.cityInput.value.trim()
        });

        const response = await fetch(
            `http://localhost:3000/api/recommendations?${params}`,
            {
                headers: sessionManager.getHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Session ID'yi güncelle (backend'den gelebilir)
        const newSessionId = response.headers.get('X-Session-Id');
        if (newSessionId && newSessionId !== sessionManager.sessionId) {
            sessionManager.sessionId = newSessionId;
            localStorage.setItem('sessionId', newSessionId);
        }

        return data;
    } catch (error) {
        console.error('Get recommendations error:', error);
        throw error;
    }
}
```

### 3. Mood Slider Integration

```javascript
/**
 * Mood slider event handler
 */
const moodSlider = document.getElementById('moodSlider');
const moodValue = document.getElementById('moodValue');

let debounceTimer;

moodSlider.addEventListener('input', (e) => {
    const offset = parseInt(e.target.value);
    moodValue.textContent = offset > 0 ? `+${offset}` : offset;
    
    // Debounce: 500ms sonra backend'e gönder
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        saveMoodFeedback(offset);
    }, 500);
});

async function saveMoodFeedback(offset) {
    try {
        const response = await fetch('http://localhost:3000/api/mood-feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...sessionManager.getHeaders()
            },
            body: JSON.stringify({ offset })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`📊 Mood feedback saved: ${offset}, New bias: ${data.bias}`);
        }
    } catch (error) {
        console.error('Save mood feedback error:', error);
    }
}
```

### 4. Complete Search Flow

```javascript
/**
 * Tam arama akışı
 */
async function searchWeatherAndMusic() {
    const city = elements.cityInput.value.trim();
    
    if (!city) {
        showError('Lütfen bir şehir adı girin');
        return;
    }

    showLoading();

    try {
        // 1. Hava durumu al
        const weatherData = await fetchWeatherData(city);
        const weather = weatherData.weather[0].main;
        const temp = weatherData.main.temp;
        const hour = new Date().getHours();

        // 2. Mood slider değerini al
        const userOffset = parseInt(moodSlider.value) || 0;

        // 3. Recommendations al
        const data = await getRecommendations(weather, temp, hour, userOffset);

        // 4. UI güncelle
        displayWeatherInfo(weatherData);
        displayMoodScore(data.moodScore);
        displaySpotifyTracks(data.tracks);

        // 5. Mood bar animasyonu
        animateMoodBar(data.moodScore.final);

        hideLoading();
        showResults();

    } catch (error) {
        hideLoading();
        showError(`❌ ${error.message}`);
        console.error('Search error:', error);
    }
}
```

## 🔧 Utility Functions

### 1. Mood Bar Animation

```javascript
function animateMoodBar(score) {
    const fill = document.getElementById('moodFill');
    const text = document.getElementById('moodScore');
    const category = document.getElementById('moodCategory');

    // Smooth width animation
    fill.style.width = score + '%';
    text.textContent = score;

    // Color based on category
    let color, categoryText;
    if (score >= 70) {
        color = '#f59e0b';
        categoryText = 'Enerjik';
    } else if (score >= 40) {
        color = '#3b82f6';
        categoryText = 'Chill';
    } else {
        color = '#8b5cf6';
        categoryText = 'Melankolik';
    }

    fill.style.background = color;
    category.textContent = categoryText;
    category.style.color = color;
}
```

### 2. Display Spotify Tracks

```javascript
function displaySpotifyTracks(tracks) {
    elements.playlistContainer.innerHTML = '';

    tracks.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'song-card spotify-track';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="song-album-art">
                <img src="${track.albumArt}" alt="${track.album}" loading="lazy">
                ${track.previewUrl ? '<div class="play-overlay">▶</div>' : ''}
            </div>
            <div class="song-content">
                <div class="song-number">#${index + 1}</div>
                <div class="song-title">${track.title}</div>
                <div class="song-artist">${track.artist}</div>
                <div class="song-meta">
                    <span class="song-album">${track.album}</span>
                    <span class="song-duration">${formatDuration(track.duration)}</span>
                </div>
                <div class="song-actions">
                    ${track.previewUrl ? `<button onclick="playPreview('${track.previewUrl}')">🎵</button>` : ''}
                    <a href="${track.spotifyUrl}" target="_blank">🟢 Spotify</a>
                </div>
            </div>
        `;

        elements.playlistContainer.appendChild(card);
    });
}
```

## 📊 Database Queries

### Get User Stats

```sql
-- Son 7 günün mood istatistikleri
SELECT 
    date,
    total_offset,
    count,
    ROUND(total_offset::DECIMAL / count) as average_offset
FROM user_mood_stats
WHERE session_id = 'abc123'
AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

### Daily Analytics

```sql
-- Günlük kullanıcı ve arama istatistikleri
SELECT 
    created_at::DATE as date,
    COUNT(DISTINCT session_id) as unique_users,
    COUNT(*) as total_searches,
    ROUND(AVG(final_mood), 2) as avg_mood,
    MODE() WITHIN GROUP (ORDER BY weather) as top_weather
FROM search_history
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY created_at::DATE
ORDER BY date DESC;
```

### Clean Old Data

```sql
-- 30 günden eski verileri temizle
DELETE FROM user_mood_stats
WHERE date < CURRENT_DATE - INTERVAL '30 days';

DELETE FROM search_history
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
```

## 🚀 Deployment Checklist

- [ ] PostgreSQL database oluşturuldu
- [ ] Redis server çalışıyor
- [ ] Environment variables ayarlandı
- [ ] npm install çalıştırıldı
- [ ] Database schema import edildi
- [ ] Spotify credentials test edildi
- [ ] Health check endpoint test edildi
- [ ] Session management test edildi
- [ ] Mood learning test edildi
- [ ] Spotify cache test edildi

---

**Quick reference for all major features!** 🎯✨
