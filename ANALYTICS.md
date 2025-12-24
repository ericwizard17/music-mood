# 📊 Analytics System - Complete Implementation

## 🎯 Overview

Basit ve etkili analytics sistemi. Kullanıcı mood trendlerini ve istatistiklerini gösterir.

## 🗄️ Database Schema

### mood_logs Table (Minimal)

```sql
-- Minimal analytics tablosu
CREATE TABLE IF NOT EXISTS mood_logs (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    mood_score INT NOT NULL,
    weather TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_mood_logs_created_at ON mood_logs(created_at);
CREATE INDEX idx_mood_logs_session ON mood_logs(session_id);
```

### Insert Trigger (Auto-log from search_history)

```sql
-- Otomatik mood log ekleme
CREATE OR REPLACE FUNCTION log_mood_from_search()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO mood_logs (session_id, mood_score, weather, created_at)
    VALUES (NEW.session_id, NEW.final_mood, NEW.weather, NEW.created_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_mood
AFTER INSERT ON search_history
FOR EACH ROW
EXECUTE FUNCTION log_mood_from_search();
```

## 🔧 Backend Endpoints

### 1. Daily Summary (Son 7 Gün)

```javascript
/**
 * GET /api/analytics/summary
 * Son 7 günün günlük ortalama mood bias'ı
 */
app.get("/api/analytics/summary", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                date,
                AVG(total_offset::float / NULLIF(count, 0)) AS avg_bias,
                SUM(count) AS total_searches
            FROM user_mood_stats
            WHERE date >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY date
            ORDER BY date DESC
            LIMIT 7
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Analytics summary error:', error);
        res.status(500).json({ error: error.message });
    }
});
```

### 2. Hourly Mood Distribution

```javascript
/**
 * GET /api/analytics/hourly
 * Saatlik mood dağılımı
 */
app.get("/api/analytics/hourly", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                EXTRACT(HOUR FROM created_at) AS hour,
                AVG(mood_score) AS avg_mood,
                COUNT(*) AS count
            FROM mood_logs
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY hour
            ORDER BY hour
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Analytics hourly error:', error);
        res.status(500).json({ error: error.message });
    }
});
```

### 3. Weather Distribution

```javascript
/**
 * GET /api/analytics/weather
 * Hava durumu dağılımı
 */
app.get("/api/analytics/weather", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                weather,
                COUNT(*) AS count,
                AVG(mood_score) AS avg_mood
            FROM mood_logs
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY weather
            ORDER BY count DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Analytics weather error:', error);
        res.status(500).json({ error: error.message });
    }
});
```

### 4. User Stats

```javascript
/**
 * GET /api/analytics/user/:sessionId
 * Kullanıcı istatistikleri
 */
app.get("/api/analytics/user/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await db.query(`
            SELECT
                COUNT(*) AS total_searches,
                AVG(mood_score) AS avg_mood,
                MIN(mood_score) AS min_mood,
                MAX(mood_score) AS max_mood,
                MODE() WITHIN GROUP (ORDER BY weather) AS favorite_weather
            FROM mood_logs
            WHERE session_id = $1
            AND created_at >= NOW() - INTERVAL '30 days'
        `, [sessionId]);

        res.json(result.rows[0] || {});
    } catch (error) {
        console.error('Analytics user error:', error);
        res.status(500).json({ error: error.message });
    }
});
```

## 🎨 Frontend Implementation

### HTML

```html
<!-- Analytics Section -->
<section id="analyticsSection" class="analytics-section hidden">
    <div class="analytics-header">
        <h3>📊 Mood Analytics</h3>
        <button id="closeAnalytics" class="close-btn">✕</button>
    </div>

    <!-- Daily Summary -->
    <div class="analytics-card">
        <h4>Son 7 Gün - Günlük Ortalama</h4>
        <ul id="analyticsList" class="analytics-list"></ul>
    </div>

    <!-- Hourly Distribution -->
    <div class="analytics-card">
        <h4>Saatlik Dağılım</h4>
        <div id="hourlyChart" class="chart-container"></div>
    </div>

    <!-- Weather Distribution -->
    <div class="analytics-card">
        <h4>Hava Durumu Dağılımı</h4>
        <ul id="weatherList" class="analytics-list"></ul>
    </div>
</section>

<!-- Analytics Button (in header) -->
<button id="showAnalytics" class="analytics-btn">
    📊 Analytics
</button>
```

### JavaScript

```javascript
/**
 * ANALYTICS MODULE
 */

// DOM Elements
const analyticsElements = {
    section: document.getElementById('analyticsSection'),
    showBtn: document.getElementById('showAnalytics'),
    closeBtn: document.getElementById('closeAnalytics'),
    analyticsList: document.getElementById('analyticsList'),
    hourlyChart: document.getElementById('hourlyChart'),
    weatherList: document.getElementById('weatherList')
};

/**
 * Load daily summary
 */
async function loadDailySummary() {
    try {
        const res = await fetch(`${API_BASE}/api/analytics/summary`);
        const data = await res.json();

        const list = analyticsElements.analyticsList;
        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = '<li class="empty">Henüz veri yok</li>';
            return;
        }

        data.forEach(day => {
            const li = document.createElement("li");
            const avgBias = day.avg_bias ? Math.round(day.avg_bias) : 0;
            const color = avgBias > 0 ? '#10b981' : avgBias < 0 ? '#ef4444' : '#6366f1';
            
            li.innerHTML = `
                <span class="date">${day.date}</span>
                <span class="value" style="color: ${color}">
                    ${avgBias > 0 ? '+' : ''}${avgBias}
                </span>
                <span class="count">${day.total_searches} arama</span>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        console.error('Load daily summary error:', error);
        analyticsElements.analyticsList.innerHTML = '<li class="error">Yüklenemedi</li>';
    }
}

/**
 * Load hourly distribution
 */
async function loadHourlyDistribution() {
    try {
        const res = await fetch(`${API_BASE}/api/analytics/hourly`);
        const data = await res.json();

        const chart = analyticsElements.hourlyChart;
        chart.innerHTML = "";

        if (data.length === 0) {
            chart.innerHTML = '<p class="empty">Henüz veri yok</p>';
            return;
        }

        // Simple bar chart
        const maxMood = Math.max(...data.map(d => d.avg_mood));

        data.forEach(item => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            
            const height = (item.avg_mood / maxMood) * 100;
            const color = item.avg_mood >= 70 ? '#f59e0b' : 
                         item.avg_mood >= 40 ? '#3b82f6' : '#8b5cf6';
            
            bar.innerHTML = `
                <div class="bar-fill" style="height: ${height}%; background: ${color}"></div>
                <div class="bar-label">${item.hour}:00</div>
                <div class="bar-value">${Math.round(item.avg_mood)}</div>
            `;
            
            chart.appendChild(bar);
        });
    } catch (error) {
        console.error('Load hourly distribution error:', error);
        analyticsElements.hourlyChart.innerHTML = '<p class="error">Yüklenemedi</p>';
    }
}

/**
 * Load weather distribution
 */
async function loadWeatherDistribution() {
    try {
        const res = await fetch(`${API_BASE}/api/analytics/weather`);
        const data = await res.json();

        const list = analyticsElements.weatherList;
        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = '<li class="empty">Henüz veri yok</li>';
            return;
        }

        data.forEach(item => {
            const li = document.createElement("li");
            const weatherEmoji = {
                'Clear': '☀️',
                'Clouds': '☁️',
                'Rain': '🌧️',
                'Snow': '❄️',
                'Thunderstorm': '⛈️',
                'Drizzle': '🌦️',
                'Mist': '🌫️'
            }[item.weather] || '🌤️';
            
            li.innerHTML = `
                <span class="weather">${weatherEmoji} ${item.weather}</span>
                <span class="count">${item.count} kez</span>
                <span class="mood">Avg: ${Math.round(item.avg_mood)}</span>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        console.error('Load weather distribution error:', error);
        analyticsElements.weatherList.innerHTML = '<li class="error">Yüklenemedi</li>';
    }
}

/**
 * Load all analytics
 */
async function loadAnalytics() {
    await Promise.all([
        loadDailySummary(),
        loadHourlyDistribution(),
        loadWeatherDistribution()
    ]);
}

/**
 * Show analytics
 */
function showAnalytics() {
    analyticsElements.section.classList.remove('hidden');
    loadAnalytics();
}

/**
 * Hide analytics
 */
function hideAnalytics() {
    analyticsElements.section.classList.add('hidden');
}

// Event listeners
if (analyticsElements.showBtn) {
    analyticsElements.showBtn.addEventListener('click', showAnalytics);
}

if (analyticsElements.closeBtn) {
    analyticsElements.closeBtn.addEventListener('click', hideAnalytics);
}

// Auto-load on page load (optional)
// window.addEventListener('load', loadAnalytics);
```

### CSS

```css
/* Analytics Section */
.analytics-section {
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    padding: 2rem;
    overflow-y: auto;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.analytics-section:not(.hidden) {
    transform: translateX(0);
}

.analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.analytics-header h3 {
    font-size: 1.5rem;
    color: var(--color-text-primary);
}

.close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Analytics Card */
.analytics-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.analytics-card h4 {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
}

/* Analytics List */
.analytics-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.analytics-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
}

.analytics-list .date {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
}

.analytics-list .value {
    font-weight: 700;
    font-size: 1.1rem;
}

.analytics-list .count {
    color: var(--color-text-muted);
    font-size: 0.85rem;
}

.analytics-list .empty,
.analytics-list .error {
    text-align: center;
    color: var(--color-text-muted);
    padding: 2rem;
}

/* Chart Container */
.chart-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 200px;
    gap: 4px;
}

.chart-bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.bar-fill {
    width: 100%;
    background: var(--color-accent-primary);
    border-radius: 4px 4px 0 0;
    transition: height 0.3s ease;
}

.bar-label {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
}

.bar-value {
    position: absolute;
    top: -20px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-primary);
}

/* Analytics Button */
.analytics-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
}

.analytics-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
    .analytics-section {
        width: 100%;
    }
}
```

## 🚀 Usage

### 1. Add to server.js

```javascript
// Analytics endpoints
app.get('/api/analytics/summary', async (req, res) => { /* ... */ });
app.get('/api/analytics/hourly', async (req, res) => { /* ... */ });
app.get('/api/analytics/weather', async (req, res) => { /* ... */ });
app.get('/api/analytics/user/:sessionId', async (req, res) => { /* ... */ });
```

### 2. Run database migration

```sql
-- Run schema update
psql $DATABASE_URL < database/analytics_schema.sql
```

### 3. Add to index.html

```html
<!-- Add analytics button and section -->
<!-- Add analytics.js script -->
<script src="analytics.js"></script>
```

### 4. Test

```bash
# Daily summary
curl http://localhost:3000/api/analytics/summary

# Hourly distribution
curl http://localhost:3000/api/analytics/hourly

# Weather distribution
curl http://localhost:3000/api/analytics/weather

# User stats
curl http://localhost:3000/api/analytics/user/test-session-123
```

---

**Simple and effective analytics!** 📊✨
