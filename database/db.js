/**
 * DATABASE CONNECTION
 * PostgreSQL and Redis connections
 */

const { Pool } = require('pg');
const { createClient } = require('redis');

// ==========================================
// POSTGRESQL CONNECTION
// ==========================================

const db = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/musicmood',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test PostgreSQL connection
db.on('connect', () => {
    console.log('✅ PostgreSQL connected');
});

db.on('error', (err) => {
    console.error('❌ PostgreSQL error:', err);
});

// ==========================================
// REDIS CONNECTION
// ==========================================

const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('❌ Redis: Too many retries, giving up');
                return new Error('Too many retries');
            }
            return Math.min(retries * 100, 3000);
        }
    }
});

redis.on('connect', () => {
    console.log('✅ Redis connected');
});

redis.on('error', (err) => {
    console.error('❌ Redis error:', err);
});

// Connect to Redis
(async () => {
    try {
        await redis.connect();
    } catch (error) {
        console.error('❌ Redis connection failed:', error.message);
    }
})();

// ==========================================
// REDIS KEY PATTERNS
// ==========================================

const REDIS_KEYS = {
    // mood:bias:{session_id}:{date}
    moodBias: (sessionId, date) => `mood:bias:${sessionId}:${date}`,

    // spotify:{weather}:{mood}
    spotifyCache: (weather, mood) => `spotify:${weather}:${mood}`,

    // session:{session_id}
    session: (sessionId) => `session:${sessionId}`,

    // stats:daily:{date}
    dailyStats: (date) => `stats:daily:${date}`
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get learned bias from Redis (fast) or PostgreSQL (fallback)
 * @param {string} sessionId - Session ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Promise<number>} - Learned bias
 */
async function getLearnedBias(sessionId, date) {
    try {
        // Try Redis first (fast cache) - only if connected
        if (redisConnected) {
            const key = REDIS_KEYS.moodBias(sessionId, date);
            const cached = await redis.get(key);

            if (cached !== null) {
                return parseInt(cached);
            }
        }

        // Fallback to PostgreSQL (or return 0 if DB not available)
        try {
            const result = await db.query(
                'SELECT get_learned_bias($1, $2) as bias',
                [sessionId, date]
            );

            const bias = result.rows[0]?.bias || 0;

            // Cache in Redis for 1 hour (if available)
            if (redisConnected) {
                await redis.setEx(key, 3600, bias.toString());
            }

            return bias;
        } catch (dbError) {
            console.warn('⚠️  Database not available, using default bias');
            return 0;
        }
    } catch (error) {
        console.error('Get learned bias error:', error);
        return 0;
    }
}

/**
 * Save mood feedback to PostgreSQL and update Redis cache
 * @param {string} sessionId - Session ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {number} offset - Mood offset
 */
async function saveMoodFeedback(sessionId, date, offset) {
    try {
        // Save to PostgreSQL
        await db.query(
            'SELECT update_user_mood_stats($1, $2, $3)',
            [sessionId, date, offset]
        );

        // Update Redis cache
        const key = REDIS_KEYS.moodBias(sessionId, date);
        const newBias = await getLearnedBias(sessionId, date);
        await redis.setEx(key, 3600, newBias.toString());

        console.log(`📊 Mood feedback saved: ${offset} (Session: ${sessionId})`);
    } catch (error) {
        console.error('Save mood feedback error:', error);
        throw error;
    }
}

/**
 * Get Spotify cache from Redis
 * @param {string} weather - Weather condition
 * @param {number} mood - Mood score
 * @returns {Promise<Object|null>} - Cached tracks or null
 */
async function getSpotifyCache(weather, mood) {
    try {
        const key = REDIS_KEYS.spotifyCache(weather, mood);
        const cached = await redis.get(key);

        if (cached) {
            console.log(`💾 Spotify cache hit: ${weather}/${mood}`);
            return JSON.parse(cached);
        }

        return null;
    } catch (error) {
        console.error('Get Spotify cache error:', error);
        return null;
    }
}

/**
 * Set Spotify cache in Redis
 * @param {string} weather - Weather condition
 * @param {number} mood - Mood score
 * @param {Object} tracks - Spotify tracks
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 */
async function setSpotifyCache(weather, mood, tracks, ttl = 3600) {
    try {
        const key = REDIS_KEYS.spotifyCache(weather, mood);
        await redis.setEx(key, ttl, JSON.stringify(tracks));
        console.log(`💾 Spotify cache set: ${weather}/${mood}`);
    } catch (error) {
        console.error('Set Spotify cache error:', error);
    }
}

/**
 * Log search to PostgreSQL
 * @param {Object} searchData - Search data
 */
async function logSearch(searchData) {
    try {
        await db.query(
            `INSERT INTO search_history 
            (session_id, city, weather, temp, hour, base_mood, learned_bias, user_offset, final_mood)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                searchData.sessionId,
                searchData.city,
                searchData.weather,
                searchData.temp,
                searchData.hour,
                searchData.baseMood,
                searchData.learnedBias,
                searchData.userOffset,
                searchData.finalMood
            ]
        );

        // Update session activity
        await db.query(
            'SELECT update_session_activity($1, $2)',
            [searchData.sessionId, searchData.userId || null]
        );
    } catch (error) {
        console.error('Log search error:', error);
    }
}

/**
 * Clean expired Spotify cache from PostgreSQL
 */
async function cleanExpiredCache() {
    try {
        const result = await db.query('SELECT clean_expired_cache()');
        const deleted = result.rows[0]?.clean_expired_cache || 0;
        console.log(`🧹 Cleaned ${deleted} expired cache entries`);
        return deleted;
    } catch (error) {
        console.error('Clean expired cache error:', error);
        return 0;
    }
}

/**
 * Get user mood statistics
 * @param {string} sessionId - Session ID
 * @param {number} days - Number of days (default: 7)
 * @returns {Promise<Object>} - Statistics
 */
async function getUserMoodStats(sessionId, days = 7) {
    try {
        const result = await db.query(
            `SELECT 
                date,
                total_offset,
                count,
                ROUND(total_offset::DECIMAL / NULLIF(count, 0)) as average
            FROM user_mood_stats
            WHERE session_id = $1 
            AND date >= CURRENT_DATE - INTERVAL '${days} days'
            ORDER BY date DESC`,
            [sessionId]
        );

        return result.rows;
    } catch (error) {
        console.error('Get user mood stats error:', error);
        return [];
    }
}

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');

    try {
        await redis.quit();
        await db.end();
        console.log('✅ Connections closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    db,
    redis,
    REDIS_KEYS,
    getLearnedBias,
    saveMoodFeedback,
    getSpotifyCache,
    setSpotifyCache,
    logSearch,
    cleanExpiredCache,
    getUserMoodStats
};
