# ✅ Deployment Test Guide

## 🎯 Post-Deployment Testing

Bu rehber, deployment sonrası tüm özelliklerin çalıştığını doğrulamak için adım adım test senaryoları içerir.

## 📋 Test Checklist

- [ ] Health Check
- [ ] Database Connection
- [ ] Redis Connection
- [ ] Spotify API Integration
- [ ] Mood Score Calculation
- [ ] Learned Bias System
- [ ] Spotify Cache
- [ ] Search Logging
- [ ] Session Management
- [ ] Frontend Integration

## 🧪 Test Scenarios

### 1. Health Check

**Test**: Backend çalışıyor mu?

```bash
curl https://your-app.up.railway.app/api/health
```

**Expected Response**:
```json
{
  "status": "OK",
  "timestamp": "2025-12-24T...",
  "spotify": {
    "configured": true,
    "tokenValid": true
  }
}
```

**✅ Pass Criteria**:
- Status code: 200
- `status`: "OK"
- `spotify.configured`: true

---

### 2. Recommendations API (Rain Weather)

**Test**: Hava durumuna göre şarkı önerileri

```bash
curl -H "x-session-id: test-session-123" \
  "https://your-app.up.railway.app/api/recommendations?weather=Rain&temp=15&hour=20"
```

**Expected Response**:
```json
{
  "weather": "Rain",
  "temp": 15,
  "hour": 20,
  "sessionId": "test-session-123",
  "moodScore": {
    "base": 35,
    "learned": 0,
    "userOffset": 0,
    "final": 35,
    "category": "melancholic",
    "description": "Melankolik / Low Energy",
    "color": "#8b5cf6"
  },
  "audioFeatures": {
    "energy": 0.3,
    "valence": 0.2,
    "minTempo": 60,
    "maxTempo": 85,
    "acousticness": 0.7
  },
  "tracks": [...],
  "count": 10,
  "cached": false
}
```

**✅ Pass Criteria**:
- Status code: 200
- `moodScore.base` ≈ 35 (Rain + temp 15 + hour 20)
- `tracks` array has 10 items
- `audioFeatures.energy` ≈ 0.3 (low energy for rain)

**📊 Check Logs**:
```bash
# Railway
railway logs

# Docker
docker compose logs backend

# Look for:
# 🎵 Recommendations for Rain (15°C, 20:00)
# 💾 Spotify cache set: Rain/35
```

---

### 3. Mood Slider Feedback (POST)

**Test**: Kullanıcı mood ayarını kaydet

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-session-id: test-session-123" \
  -d '{"offset": 10}' \
  https://your-app.up.railway.app/api/mood-feedback
```

**Expected Response**:
```json
{
  "ok": true,
  "bias": 10
}
```

**✅ Pass Criteria**:
- Status code: 200
- `ok`: true
- `bias`: 10

**🗄️ Check Database**:
```sql
-- PostgreSQL
SELECT * FROM user_mood_stats 
WHERE session_id = 'test-session-123' 
AND date = CURRENT_DATE;

-- Expected:
-- session_id: test-session-123
-- date: 2025-12-24
-- total_offset: 10
-- count: 1
```

**🔴 Check Redis**:
```bash
# Redis CLI
redis-cli GET "mood:bias:test-session-123:2025-12-24"

# Expected: "10"
```

---

### 4. Redis Cache Hit

**Test**: İkinci istek cache'den gelsin

```bash
# First request (cache miss)
curl -H "x-session-id: test-session-123" \
  "https://your-app.up.railway.app/api/recommendations?weather=Clear&temp=22&hour=14"

# Second request (cache hit)
curl -H "x-session-id: test-session-123" \
  "https://your-app.up.railway.app/api/recommendations?weather=Clear&temp=22&hour=14"
```

**Expected Response (Second Request)**:
```json
{
  ...
  "cached": true
}
```

**✅ Pass Criteria**:
- First request: `cached: false`
- Second request: `cached: true`
- Response time: Second request < 100ms

**📊 Check Logs**:
```bash
# Look for:
# First request:
# 🌐 Fetching from Spotify: spotify:Clear:84
# 💾 Spotify cache set: spotify:Clear:84

# Second request:
# 💾 Spotify cache hit: spotify:Clear:84
```

**🔴 Check Redis**:
```bash
redis-cli KEYS "spotify:*"

# Expected:
# 1) "spotify:Clear:84"
# 2) "spotify:Rain:35"

redis-cli GET "spotify:Clear:84"
# Expected: JSON array of tracks
```

---

### 5. Database Logging

**Test**: Aramalar database'e kaydediliyor mu?

```bash
# Make a search
curl -H "x-session-id: test-session-123" \
  "https://your-app.up.railway.app/api/recommendations?weather=Snow&temp=5&hour=8&city=Istanbul"
```

**🗄️ Check Database**:
```sql
-- Check search_history
SELECT * FROM search_history 
WHERE session_id = 'test-session-123' 
ORDER BY created_at DESC 
LIMIT 5;

-- Expected columns:
-- session_id: test-session-123
-- city: Istanbul
-- weather: Snow
-- temp: 5
-- hour: 8
-- base_mood: ~45
-- learned_bias: 10 (from previous test)
-- user_offset: 0
-- final_mood: ~55
-- created_at: 2025-12-24 ...
```

**✅ Pass Criteria**:
- Row inserted in `search_history`
- All fields populated correctly
- `created_at` is recent

---

### 6. Learned Bias Integration

**Test**: Öğrenilen bias sonraki aramalarda kullanılıyor mu?

```bash
# Step 1: Save mood feedback
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-session-id: test-session-456" \
  -d '{"offset": 15}' \
  https://your-app.up.railway.app/api/mood-feedback

# Step 2: Make recommendation request
curl -H "x-session-id: test-session-456" \
  "https://your-app.up.railway.app/api/recommendations?weather=Clouds&temp=18&hour=16"
```

**Expected Response**:
```json
{
  "moodScore": {
    "base": 63,
    "learned": 15,
    "userOffset": 0,
    "final": 78
  }
}
```

**✅ Pass Criteria**:
- `learned`: 15 (from previous feedback)
- `final`: base + learned + userOffset

**📊 Check Logs**:
```bash
# Look for:
# 🎵 test-session-456: Base=63, Learned=15, User=0, Final=78
```

---

### 7. Session Management

**Test**: Farklı session'lar ayrı tutulur mu?

```bash
# Session A
curl -H "x-session-id: session-A" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"offset": 10}' \
  https://your-app.up.railway.app/api/mood-feedback

# Session B
curl -H "x-session-id: session-B" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"offset": -5}' \
  https://your-app.up.railway.app/api/mood-feedback

# Check Session A
curl -H "x-session-id: session-A" \
  "https://your-app.up.railway.app/api/recommendations?weather=Clear&temp=22&hour=14"

# Check Session B
curl -H "x-session-id: session-B" \
  "https://your-app.up.railway.app/api/recommendations?weather=Clear&temp=22&hour=14"
```

**Expected**:
- Session A: `learned: 10`
- Session B: `learned: -5`

**✅ Pass Criteria**:
- Each session has independent learned bias
- Database has separate rows for each session

---

### 8. Multiple Feedback Aggregation

**Test**: Birden fazla feedback ortalaması alınıyor mu?

```bash
# Session: test-agg

# Feedback 1
curl -X POST -H "x-session-id: test-agg" \
  -H "Content-Type: application/json" \
  -d '{"offset": 10}' \
  https://your-app.up.railway.app/api/mood-feedback

# Feedback 2
curl -X POST -H "x-session-id: test-agg" \
  -H "Content-Type: application/json" \
  -d '{"offset": 20}' \
  https://your-app.up.railway.app/api/mood-feedback

# Feedback 3
curl -X POST -H "x-session-id: test-agg" \
  -H "Content-Type: application/json" \
  -d '{"offset": 15}' \
  https://your-app.up.railway.app/api/mood-feedback

# Check learned bias
curl -H "x-session-id: test-agg" \
  "https://your-app.up.railway.app/api/recommendations?weather=Clear&temp=22&hour=14"
```

**Expected**:
```json
{
  "moodScore": {
    "learned": 15
  }
}
```

**Calculation**:
```
total_offset = 10 + 20 + 15 = 45
count = 3
average = 45 / 3 = 15
```

**✅ Pass Criteria**:
- `learned`: 15 (average of 10, 20, 15)

**🗄️ Check Database**:
```sql
SELECT * FROM user_mood_stats 
WHERE session_id = 'test-agg' 
AND date = CURRENT_DATE;

-- Expected:
-- total_offset: 45
-- count: 3
```

---

### 9. Frontend Integration

**Test**: Frontend session yönetimi

**HTML/JavaScript**:
```javascript
// Generate or get session ID
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('sessionId', sessionId);
}

// Make API call
fetch('https://your-app.up.railway.app/api/recommendations?weather=Clear&temp=22&hour=14', {
    headers: {
        'x-session-id': sessionId
    }
})
.then(res => res.json())
.then(data => {
    console.log('Mood Score:', data.moodScore);
    console.log('Tracks:', data.tracks);
});
```

**✅ Pass Criteria**:
- Session ID persists in localStorage
- Same session ID used across requests
- Learned bias accumulates over time

---

### 10. Error Handling

**Test**: Hata durumları düzgün handle ediliyor mu?

```bash
# Missing weather parameter
curl "https://your-app.up.railway.app/api/recommendations"

# Expected: 400 Bad Request
# {
#   "error": "Weather parameter is required",
#   "example": "/api/recommendations?weather=Clear&temp=22&hour=14"
# }

# Invalid weather
curl "https://your-app.up.railway.app/api/recommendations?weather=InvalidWeather"

# Expected: 200 OK (uses default mood)

# Invalid offset
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-session-id: test" \
  -d '{"offset": "invalid"}' \
  https://your-app.up.railway.app/api/mood-feedback

# Expected: 500 or validation error
```

---

## 🔍 Debugging Tools

### Railway Logs

```bash
railway logs --tail=100
```

### PostgreSQL Queries

```sql
-- Active sessions today
SELECT session_id, COUNT(*) as searches
FROM search_history
WHERE created_at::DATE = CURRENT_DATE
GROUP BY session_id
ORDER BY searches DESC;

-- Mood stats summary
SELECT 
    session_id,
    date,
    total_offset,
    count,
    ROUND(total_offset::DECIMAL / count) as avg_offset
FROM user_mood_stats
ORDER BY date DESC, session_id;

-- Recent searches
SELECT 
    session_id,
    city,
    weather,
    final_mood,
    created_at
FROM search_history
ORDER BY created_at DESC
LIMIT 20;
```

### Redis Commands

```bash
# List all keys
redis-cli KEYS "*"

# Get mood bias
redis-cli GET "mood:bias:test-session-123:2025-12-24"

# Get Spotify cache
redis-cli GET "spotify:Clear:84"

# Check TTL
redis-cli TTL "mood:bias:test-session-123:2025-12-24"

# Clear all cache
redis-cli FLUSHALL
```

---

## ✅ Final Checklist

- [ ] Health check returns OK
- [ ] Recommendations API works
- [ ] Mood feedback saves to database
- [ ] Redis cache works (hit/miss)
- [ ] Learned bias persists
- [ ] Multiple sessions are independent
- [ ] Search logging works
- [ ] Frontend can connect
- [ ] Error handling works
- [ ] Logs show no errors

---

## 🐛 Common Issues

### Issue: "Database connection error"

**Solution**:
```bash
# Check DATABASE_URL
railway variables

# Test connection
railway run psql $DATABASE_URL -c "SELECT 1"
```

### Issue: "Redis connection timeout"

**Solution**:
```bash
# Check REDIS_URL
railway variables

# Test connection
railway run redis-cli -u $REDIS_URL ping
```

### Issue: "Spotify API returns 400"

**Solution**:
- Check `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
- Verify credentials at https://developer.spotify.com/dashboard
- Check logs for undefined parameters

---

**All tests passing? You're production-ready!** 🚀✨
