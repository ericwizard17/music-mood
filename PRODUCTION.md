# 🚀 MusicMood - Production Architecture

## 📊 Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Browser)                      │
│  • HTML/CSS/JavaScript                                       │
│  • Session ID (localStorage)                                 │
│  • Mood Learning (localStorage)                              │
│  • Google OAuth                                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP Request
                 │ Headers: x-session-id, x-user-id
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js/Express)                  │
│  • Session Management (UUID)                                 │
│  • Mood Score Calculation                                    │
│  • Spotify API Integration                                   │
└────────┬────────────────────┬────────────────────┬──────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │      Redis      │  │   Spotify API   │
│                 │  │                 │  │                 │
│ • User Stats    │  │ • Learned Bias  │  │ • Tracks        │
│ • Search Log    │  │ • Spotify Cache │  │ • Features      │
│ • Analytics     │  │ • Session Data  │  │ • Search        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 🗄️ Database Schema

### PostgreSQL Tables

#### 1. user_mood_stats
```sql
CREATE TABLE user_mood_stats (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    date DATE NOT NULL,
    total_offset INT DEFAULT 0,
    count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, date)
);
```

#### 2. user_sessions
```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_searches INT DEFAULT 0,
    average_mood_offset DECIMAL(5,2) DEFAULT 0
);
```

#### 3. search_history
```sql
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    city TEXT NOT NULL,
    weather TEXT NOT NULL,
    temp DECIMAL(5,2) NOT NULL,
    hour INT NOT NULL,
    base_mood INT NOT NULL,
    learned_bias INT DEFAULT 0,
    user_offset INT DEFAULT 0,
    final_mood INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. spotify_cache
```sql
CREATE TABLE spotify_cache (
    id SERIAL PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    weather TEXT NOT NULL,
    mood INT NOT NULL,
    tracks JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);
```

## 🔴 Redis Key Patterns

```javascript
// Mood bias cache (1 hour TTL)
mood:bias:{session_id}:{date}
// Example: mood:bias:abc123:2025-12-24
// Value: "5" (learned bias)

// Spotify cache (1 hour TTL)
spotify:{weather}:{mood}
// Example: spotify:Clear:84
// Value: JSON array of tracks

// Session data (24 hour TTL)
session:{session_id}
// Example: session:abc123
// Value: JSON object with session info

// Daily stats (24 hour TTL)
stats:daily:{date}
// Example: stats:daily:2025-12-24
// Value: JSON object with daily statistics
```

## 🔄 Request Flow

### 1. Frontend Request

```javascript
// localStorage'dan session ID al veya oluştur
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('sessionId', sessionId);
}

// API request
const response = await fetch(
    'http://localhost:3000/api/recommendations?weather=Clear&temp=22&hour=14&userOffset=5',
    {
        headers: {
            'x-session-id': sessionId,
            'x-user-id': currentUser?.id || null
        }
    }
);
```

### 2. Backend Processing

```javascript
app.get('/api/recommendations', async (req, res) => {
    // 1. Session ID al (middleware)
    const sessionId = req.sessionId; // UUID
    const today = '2025-12-24';
    
    // 2. Base mood hesapla
    const baseMood = calculateMoodScore({
        hour: 14,
        weather: 'Clear',
        temp: 22
    }); // = 84
    
    // 3. Learned bias al (Redis → PostgreSQL)
    const learnedBias = await getLearnedBias(sessionId, today);
    // Redis: GET mood:bias:abc123:2025-12-24
    // PostgreSQL: SELECT get_learned_bias('abc123', '2025-12-24')
    // Result: 5
    
    // 4. Final mood hesapla
    const userOffset = 10; // Slider değeri
    const finalMood = baseMood + learnedBias + userOffset;
    // = 84 + 5 + 10 = 99
    
    // 5. Redis cache kontrol
    const cached = await getSpotifyCache('Clear', 99);
    // Redis: GET spotify:Clear:99
    if (cached) return res.json({ tracks: cached, cached: true });
    
    // 6. Spotify API çağrısı
    const audio = moodToAudio(99);
    const tracks = await fetchSpotifyTracks(audio);
    
    // 7. Redis'e cache'le
    await setSpotifyCache('Clear', 99, tracks, 3600);
    // Redis: SETEX spotify:Clear:99 3600 "[...]"
    
    // 8. Search log (PostgreSQL)
    await logSearch({
        sessionId,
        city: 'Istanbul',
        weather: 'Clear',
        temp: 22,
        hour: 14,
        baseMood: 84,
        learnedBias: 5,
        userOffset: 10,
        finalMood: 99
    });
    // PostgreSQL: INSERT INTO search_history (...)
    
    // 9. User offset kaydet
    if (userOffset !== 0) {
        await saveMoodFeedback(sessionId, today, userOffset);
        // PostgreSQL: SELECT update_user_mood_stats('abc123', '2025-12-24', 10)
        // Redis: SETEX mood:bias:abc123:2025-12-24 3600 "7"
    }
    
    // 10. Response
    return res.json({
        moodScore: {
            base: 84,
            learned: 5,
            userOffset: 10,
            final: 99
        },
        tracks,
        cached: false
    });
});
```

## 📦 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/musicmood
REDIS_URL=redis://localhost:6379

# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Server
PORT=3000
NODE_ENV=production

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
```

## 🚀 Deployment

### 1. Database Setup

```bash
# PostgreSQL
createdb musicmood
psql musicmood < database/schema.sql

# Redis
redis-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Run Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📊 Performance Optimizations

### 1. Redis Caching

- **Learned Bias**: 1 hour TTL
- **Spotify Tracks**: 1 hour TTL
- **Session Data**: 24 hour TTL

### 2. PostgreSQL Indexes

```sql
CREATE INDEX idx_user_mood_stats_session_date ON user_mood_stats(session_id, date);
CREATE INDEX idx_search_history_session ON search_history(session_id);
CREATE INDEX idx_spotify_cache_key ON spotify_cache(cache_key);
```

### 3. Connection Pooling

```javascript
const db = new Pool({
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});
```

## 📈 Analytics Queries

### Daily Statistics

```sql
SELECT 
    created_at::DATE as date,
    COUNT(DISTINCT session_id) as unique_users,
    COUNT(*) as total_searches,
    ROUND(AVG(final_mood), 2) as avg_mood,
    MODE() WITHIN GROUP (ORDER BY weather) as top_weather
FROM search_history
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY created_at::DATE
ORDER BY date DESC;
```

### User Mood Trends

```sql
SELECT 
    date,
    ROUND(total_offset::DECIMAL / count, 2) as avg_offset,
    count as searches
FROM user_mood_stats
WHERE session_id = 'abc123'
ORDER BY date DESC
LIMIT 30;
```

### Popular Weather Conditions

```sql
SELECT 
    weather,
    COUNT(*) as count,
    ROUND(AVG(final_mood), 2) as avg_mood
FROM search_history
GROUP BY weather
ORDER BY count DESC;
```

## 🔒 Security

### 1. Session Management

- UUID v4 for session IDs
- Stored in localStorage (frontend)
- Validated on every request (backend)

### 2. Database Security

- Prepared statements (SQL injection prevention)
- Connection pooling with limits
- Environment variables for credentials

### 3. API Security

- CORS configuration
- Rate limiting (recommended)
- Input validation

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Recommendations

```bash
curl -H "x-session-id: test123" \
  "http://localhost:3000/api/recommendations?weather=Clear&temp=22&hour=14&userOffset=5"
```

### Database Connection

```bash
psql musicmood -c "SELECT COUNT(*) FROM user_mood_stats;"
redis-cli PING
```

## 📚 API Endpoints

### GET /api/health

Health check endpoint

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-12-24T...",
  "spotify": { "configured": true, "tokenValid": true }
}
```

### GET /api/recommendations

Get music recommendations

**Parameters:**
- `weather` (required): Weather condition
- `temp` (optional): Temperature in Celsius
- `hour` (optional): Hour (0-23)
- `userOffset` (optional): User mood adjustment (-20 to +20)
- `city` (optional): City name

**Headers:**
- `x-session-id`: Session ID (auto-generated if not provided)
- `x-user-id`: User ID (from Google OAuth)

**Response:**
```json
{
  "weather": "Clear",
  "temp": 22,
  "hour": 14,
  "city": "Istanbul",
  "sessionId": "abc123...",
  "moodScore": {
    "base": 84,
    "learned": 5,
    "userOffset": 10,
    "final": 99,
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
  "count": 10,
  "cached": false
}
```

### GET /api/stats/:sessionId

Get user mood statistics

**Response:**
```json
{
  "sessionId": "abc123",
  "activeDays": 7,
  "totalSearches": 42,
  "averageOffset": 3.5,
  "dailyData": [...]
}
```

## 🎯 Next Steps

1. **Frontend Integration**: Update `spotify.js` to use session headers
2. **Monitoring**: Add logging and error tracking (Sentry)
3. **Rate Limiting**: Implement API rate limiting
4. **Caching**: Add more aggressive caching strategies
5. **Analytics Dashboard**: Build admin dashboard for analytics

---

**Production-ready architecture with PostgreSQL, Redis, and Spotify API!** 🚀✨
