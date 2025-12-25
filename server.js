/**
 * MUSIC MOOD BACKEND SERVER
 * Express.js server with Spotify API integration
 * Handles weather-based music recommendations
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { v4: uuid } = require('uuid');
require('dotenv').config();

// Mood Score modülünü import et
const { calculateMoodScore, moodToAudio, getMoodCategory } = require('./moodScore');

// Database modüllerini import et
const {
    db,
    redis,
    getLearnedBias,
    saveMoodFeedback,
    getSpotifyCache,
    setSpotifyCache,
    logSearch,
    getUserMoodStats
} = require('./database/db');

// AI Recommendations modülünü import et
const {
    generateMusicRecommendation,
    generateSongInsights
} = require('./aiRecommendations');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Session ID Middleware
app.use((req, res, next) => {
    // Header'dan session ID al veya yeni oluştur
    if (!req.headers['x-session-id']) {
        req.sessionId = uuid();
        res.setHeader('X-Session-Id', req.sessionId);
    } else {
        req.sessionId = req.headers['x-session-id'];
    }

    // User ID (Google OAuth'dan gelirse)
    req.userId = req.headers['x-user-id'] || null;

    next();
});

// ==========================================
// CONFIGURATION
// ==========================================

const SPOTIFY_CONFIG = {
    // DEMO CREDENTIALS - Replace with your own from https://developer.spotify.com/dashboard
    CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || '3f0a0f8b6e3f4c5d9e8f7a6b5c4d3e2f',
    CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    TOKEN_URL: 'https://accounts.spotify.com/api/token',
    API_BASE_URL: 'https://api.spotify.com/v1'
};

// ==========================================
// SPOTIFY TOKEN MANAGEMENT
// ==========================================

let spotifyToken = null;
let tokenExpiresAt = 0;

/**
 * Spotify API için access token alır
 * @returns {Promise<string>} - Access token
 */
async function getSpotifyToken() {
    // Token hala geçerliyse mevcut token'ı kullan
    if (spotifyToken && Date.now() < tokenExpiresAt) {
        return spotifyToken;
    }

    try {
        const credentials = Buffer.from(
            `${SPOTIFY_CONFIG.CLIENT_ID}:${SPOTIFY_CONFIG.CLIENT_SECRET}`
        ).toString('base64');

        const response = await axios.post(
            SPOTIFY_CONFIG.TOKEN_URL,
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        spotifyToken = response.data.access_token;
        // Token'ın geçerlilik süresini kaydet (biraz erken expire et)
        tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;

        console.log('✅ Spotify token alındı');
        return spotifyToken;

    } catch (error) {
        console.error('❌ Spotify token hatası:', error.response?.data || error.message);
        throw new Error('Spotify token alınamadı');
    }
}

// ==========================================
// MOOD SCORE SYSTEM
// ==========================================

/**
 * Saate göre mood score hesaplar
 * @param {number} hour - Saat (0-23)
 * @returns {number} - Mood score (0-100)
 */
function getTimeScore(hour) {
    if (hour >= 6 && hour < 11) return 60;   // Sabah - Orta enerji
    if (hour >= 11 && hour < 17) return 80;  // Öğlen - Yüksek enerji
    if (hour >= 17 && hour < 22) return 70;  // Akşam - Orta-yüksek enerji
    return 40;                               // Gece - Düşük enerji
}

/**
 * Sıcaklığa göre mood score hesaplar
 * @param {number} temp - Sıcaklık (Celsius)
 * @returns {number} - Mood score (0-100)
 */
function getTempScore(temp) {
    if (temp >= 20 && temp <= 25) return 85;   // İdeal sıcaklık - Çok pozitif
    if (temp >= 15 && temp < 20) return 70;    // Serin - Pozitif
    if (temp > 25 && temp <= 30) return 65;    // Sıcak - Orta-yüksek
    if (temp >= 5 && temp < 15) return 55;     // Soğuk - Orta
    if (temp < 5) return 40;                   // Çok soğuk - Düşük
    if (temp > 30) return 50;                  // Çok sıcak - Orta
    return 50;                                 // Varsayılan
}

/**
 * Hava durumuna göre base mood score hesaplar
 * @param {string} weather - Hava durumu kategorisi
 * @returns {number} - Base mood score (0-100)
 */
function getWeatherScore(weather) {
    switch (weather) {
        case "Clear":
            return 85;  // Çok pozitif
        case "Clouds":
            return 60;  // Orta-yüksek
        case "Rain":
            return 35;  // Düşük
        case "Snow":
            return 50;  // Orta
        case "Thunderstorm":
            return 25;  // Çok düşük
        case "Drizzle":
            return 45;  // Düşük-orta
        case "Mist":
        case "Fog":
        case "Haze":
            return 55;  // Orta
        default:
            return 50;  // Varsayılan nötr
    }
}

/**
 * Basit mood score hesaplar (hava durumu + saat)
 * Not: Bu fonksiyon artık kullanılmıyor, moodScore.js modülü kullanılıyor
 * @param {string} weather - Hava durumu kategorisi
 * @param {number} hour - Saat (0-23)
 * @returns {Object} - Mood score bilgileri
 */
function calculateBasicMoodScore(weather, hour) {
    const weatherScore = getWeatherScore(weather);
    const timeScore = getTimeScore(hour);

    // Ağırlıklı ortalama: %70 hava durumu, %30 saat
    const totalScore = Math.round(weatherScore * 0.7 + timeScore * 0.3);

    // Kategori belirleme
    let category, description, color;

    if (totalScore <= 30) {
        category = 'melancholic';
        description = 'Melankolik / Low Energy';
        color = '#8b5cf6';  // Mor
    } else if (totalScore <= 60) {
        category = 'chill';
        description = 'Neutral / Chill';
        color = '#3b82f6';  // Mavi
    } else {
        category = 'energetic';
        description = 'Enerjik / Pozitif';
        color = '#f59e0b';  // Turuncu
    }

    return {
        total: totalScore,
        weatherScore,
        timeScore,
        category,
        description,
        color,
        weather,
        hour
    };
}

// ==========================================
// WEATHER TO AUDIO MAPPING
// ==========================================

/**
 * Hava durumunu audio özelliklerine dönüştürür
 * Mood score'a göre dinamik ayarlama yapar
 * @param {string} weather - Hava durumu kategorisi
 * @param {number} moodScore - Mood score (0-100)
 * @returns {Object} - Audio özellikleri
 */
function mapWeatherToAudio(weather, moodScore = null) {
    // Eğer mood score verilmişse, dinamik ayarlama yap
    if (moodScore !== null) {
        // Mood score'a göre energy ve valence hesapla
        const energy = Math.max(0.1, Math.min(1.0, moodScore / 100));
        const valence = Math.max(0.1, Math.min(1.0, moodScore / 100));

        // Tempo hesapla (mood score yükseldikçe tempo artar)
        const baseTempo = 60 + (moodScore * 1.2);  // 60-180 BPM arası
        const minTempo = Math.round(Math.max(60, baseTempo - 20));
        const maxTempo = Math.round(Math.min(180, baseTempo + 20));

        // Acousticness (mood score düşükse daha akustik)
        const acousticness = Math.max(0.1, Math.min(0.9, 1 - (moodScore / 120)));

        return {
            energy,
            valence,
            minTempo,
            maxTempo,
            acousticness,
            moodScore
        };
    }

    // Statik mapping (fallback)
    switch (weather) {
        case "Clear":
            return {
                energy: 0.8,
                valence: 0.8,
                minTempo: 110,
                maxTempo: 140,
                acousticness: 0.3
            };

        case "Clouds":
            return {
                energy: 0.5,
                valence: 0.5,
                minTempo: 90,
                maxTempo: 120,
                acousticness: 0.5
            };

        case "Rain":
        case "Drizzle":
            return {
                energy: 0.3,
                valence: 0.2,
                minTempo: 60,
                maxTempo: 90,
                acousticness: 0.6
            };

        case "Snow":
            return {
                energy: 0.4,
                valence: 0.4,
                minTempo: 70,
                maxTempo: 100,
                acousticness: 0.7
            };

        case "Thunderstorm":
            return {
                energy: 0.9,
                valence: 0.2,
                minTempo: 120,
                maxTempo: 160,
                acousticness: 0.2
            };

        default:
            return {
                energy: 0.5,
                valence: 0.5,
                minTempo: 80,
                maxTempo: 120,
                acousticness: 0.5
            };
    }
}

// ==========================================
// API ROUTES
// ==========================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    // Environment variable'lardan Spotify yapılandırmasını kontrol et
    const spotifyConfigured = !!(
        process.env.SPOTIFY_CLIENT_ID &&
        process.env.SPOTIFY_CLIENT_SECRET &&
        process.env.SPOTIFY_CLIENT_ID !== 'your_spotify_client_id_here' &&
        process.env.SPOTIFY_CLIENT_SECRET !== 'your_spotify_client_secret_here'
    );

    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        spotify: {
            configured: spotifyConfigured,
            tokenValid: spotifyToken !== null && Date.now() < tokenExpiresAt
        },
        redis: {
            connected: redis?.isOpen || false
        },
        openai: {
            configured: !!process.env.OPENAI_API_KEY
        }
    });
});

/**
 * Spotify recommendations endpoint
 * GET /api/recommendations?weather=Clear&temp=22&hour=14
 */
app.get("/api/recommendations", async (req, res) => {
    try {
        const weather = req.query.weather;
        const temp = parseFloat(req.query.temp) || 20;  // Varsayılan 20°C
        const hour = parseInt(req.query.hour) || new Date().getHours();  // Varsayılan şu anki saat

        // Validasyon
        if (!weather) {
            return res.status(400).json({
                error: 'Weather parameter is required',
                example: '/api/recommendations?weather=Clear&temp=22&hour=14'
            });
        }

        // Spotify token al
        const token = await getSpotifyToken();

        // Mood score hesapla
        const moodScore = calculateMoodScore({ hour, weather, temp });
        const moodCategory = getMoodCategory(moodScore);

        // Mood score'u audio features'a dönüştür
        const audio = moodToAudio(moodScore);

        console.log(`🎵 Recommendations for ${weather} (${temp}°C, ${hour}:00)`);
        console.log(`   Mood Score: ${moodScore} (${moodCategory.category})`);
        console.log(`   Audio:`, audio);

        // Spotify API parametrelerini hazırla
        const params = {
            seed_genres: "pop,indie,lofi,chill,acoustic",
            limit: 10,
            target_energy: audio.energy,
            target_valence: audio.valence,
            min_tempo: audio.minTempo,
            max_tempo: audio.maxTempo,
            target_acousticness: audio.acousticness
        };

        // Undefined parametreleri filtrele (Spotify 400 hatası önleme)
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined)
        );

        // Spotify API'den öneriler al
        const spotifyRes = await axios.get(
            `${SPOTIFY_CONFIG.API_BASE_URL}/recommendations`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: filteredParams
            }
        );

        // Şarkı bilgilerini formatla
        const tracks = await Promise.all(spotifyRes.data.tracks.map(async (track) => {
            // İlk sanatçının detaylarını al
            let artistInfo = null;
            if (track.artists[0]?.id) {
                try {
                    const artistRes = await axios.get(
                        `${SPOTIFY_CONFIG.API_BASE_URL}/artists/${track.artists[0].id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    artistInfo = {
                        followers: artistRes.data.followers.total,
                        popularity: artistRes.data.popularity,
                        genres: artistRes.data.genres
                    };
                } catch (artistErr) {
                    console.warn(`Artist bilgisi alınamadı: ${track.artists[0].name}`);
                }
            }

            return {
                id: track.id,
                title: track.name,
                artist: track.artists.map(a => a.name).join(', '),
                artistUrl: track.artists[0]?.external_urls?.spotify,
                artistInfo: artistInfo, // Yeni: Artist bilgileri
                album: track.album.name,
                albumArt: track.album.images[0]?.url,
                previewUrl: track.preview_url,
                spotifyUrl: track.external_urls.spotify,
                duration: track.duration_ms,
                popularity: track.popularity
            };
        }));

        res.json({
            weather,
            temp,
            hour,
            moodScore: {
                total: moodScore,
                category: moodCategory.category,
                description: moodCategory.description,
                color: moodCategory.color
            },
            audioFeatures: audio,
            tracks,
            count: tracks.length
        });

    } catch (err) {
        console.error('❌ Recommendation error:', err.response?.data || err.message);
        res.status(500).json({
            error: 'Recommendation error',
            message: err.message,
            details: err.response?.data
        });
    }
});

/**
 * Search tracks endpoint
 * GET /api/search?q=artist:name track:title
 */
app.get("/api/search", async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({
                error: 'Query parameter is required',
                example: '/api/search?q=Coldplay'
            });
        }

        const token = await getSpotifyToken();

        const spotifyRes = await axios.get(
            `${SPOTIFY_CONFIG.API_BASE_URL}/search`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    q: query,
                    type: 'track',
                    limit: 20
                },
            }
        );

        const tracks = spotifyRes.data.tracks.items.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            artistUrl: track.artists[0]?.external_urls?.spotify,
            album: track.album.name,
            albumArt: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            spotifyUrl: track.external_urls.spotify,
            duration: track.duration_ms,
            popularity: track.popularity
        }));

        res.json({
            query,
            tracks,
            count: tracks.length
        });

    } catch (err) {
        console.error('❌ Search error:', err.response?.data || err.message);
        res.status(500).json({
            error: 'Search error',
            message: err.message
        });
    }
});

/**
 * Get track details
 * GET /api/track/:id
 */
app.get("/api/track/:id", async (req, res) => {
    try {
        const trackId = req.params.id;
        const token = await getSpotifyToken();

        const [trackRes, audioRes] = await Promise.all([
            axios.get(`${SPOTIFY_CONFIG.API_BASE_URL}/tracks/${trackId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${SPOTIFY_CONFIG.API_BASE_URL}/audio-features/${trackId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        const track = trackRes.data;
        const audio = audioRes.data;

        res.json({
            id: track.id,
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            albumArt: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            spotifyUrl: track.external_urls.spotify,
            duration: track.duration_ms,
            popularity: track.popularity,
            audioFeatures: {
                energy: audio.energy,
                valence: audio.valence,
                tempo: audio.tempo,
                acousticness: audio.acousticness,
                danceability: audio.danceability,
                instrumentalness: audio.instrumentalness
            }
        });

    } catch (err) {
        console.error('❌ Track details error:', err.response?.data || err.message);
        res.status(500).json({
            error: 'Track details error',
            message: err.message
        });
    }
});

/**
 * AI-powered music recommendations endpoint
 * POST /api/ai-recommendations
 * Body: { city, weather, temperature, mood, songs }
 */
app.post("/api/ai-recommendations", async (req, res) => {
    try {
        const { city, weather, temperature, mood, songs } = req.body;

        // Validasyon
        if (!city || !weather || !temperature || !mood || !songs) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['city', 'weather', 'temperature', 'mood', 'songs']
            });
        }

        console.log(`🤖 AI Recommendation request for ${city} (${weather}, ${temperature}°C, ${mood})`);

        // AI destekli öneri üret
        const aiResponse = await generateMusicRecommendation({
            city,
            weather,
            temperature,
            mood,
            songs
        });

        res.json(aiResponse);

    } catch (err) {
        console.error('❌ AI Recommendation error:', err.message);
        res.status(500).json({
            error: 'AI Recommendation error',
            message: err.message
        });
    }
});

/**
 * AI-powered song insights endpoint
 * POST /api/ai-insights
 * Body: { songs, mood }
 */
app.post("/api/ai-insights", async (req, res) => {
    try {
        const { songs, mood } = req.body;

        if (!songs || !mood) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['songs', 'mood']
            });
        }

        console.log(`🤖 AI Insights request for ${mood} mood`);

        const insights = await generateSongInsights(songs, mood);

        res.json(insights);

    } catch (err) {
        console.error('❌ AI Insights error:', err.message);
        res.status(500).json({
            error: 'AI Insights error',
            message: err.message
        });
    }
});

// ==========================================
// STATIC FILES
// ==========================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// ERROR HANDLING
// ==========================================

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// ==========================================
// SERVER START
// ==========================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     🎵 MusicMood Server Running 🎵     ║
╠════════════════════════════════════════╣
║  Port: ${PORT.toString().padEnd(33)}║
║  URL:  http://localhost:${PORT.toString().padEnd(22)}║
╠════════════════════════════════════════╣
║  Endpoints:                            ║
║  • GET  /api/health                    ║
║  • GET  /api/recommendations?weather=  ║
║  • GET  /api/search?q=                 ║
║  • GET  /api/track/:id                 ║
║  • POST /api/ai-recommendations        ║
║  • POST /api/ai-insights               ║
╚════════════════════════════════════════╝
    `);

    // Spotify token'ı başlangıçta al
    if (SPOTIFY_CONFIG.CLIENT_ID !== 'YOUR_SPOTIFY_CLIENT_ID') {
        getSpotifyToken()
            .then(() => console.log('✅ Spotify bağlantısı başarılı'))
            .catch(err => console.error('❌ Spotify bağlantı hatası:', err.message));
    } else {
        console.warn('⚠️  Spotify credentials yapılandırılmamış. .env dosyasını kontrol edin.');
    }
});

module.exports = app;
