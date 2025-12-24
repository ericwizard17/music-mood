-- ==========================================
-- MUSICMOOD DATABASE SCHEMA
-- PostgreSQL Database Schema
-- ==========================================

-- User Mood Statistics Table
-- Kullanıcıların günlük mood tercihlerini saklar
CREATE TABLE IF NOT EXISTS user_mood_stats (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    date DATE NOT NULL,
    total_offset INT DEFAULT 0,
    count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, date)
);

-- Index for faster queries
CREATE INDEX idx_user_mood_stats_session ON user_mood_stats(session_id);
CREATE INDEX idx_user_mood_stats_date ON user_mood_stats(date);
CREATE INDEX idx_user_mood_stats_session_date ON user_mood_stats(session_id, date);

-- User Sessions Table
-- Kullanıcı oturumlarını takip eder
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_searches INT DEFAULT 0,
    average_mood_offset DECIMAL(5,2) DEFAULT 0
);

-- Index for sessions
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- Search History Table
-- Tüm aramaları loglar (analytics için)
CREATE TABLE IF NOT EXISTS search_history (
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

-- Index for search history
CREATE INDEX idx_search_history_session ON search_history(session_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at);
CREATE INDEX idx_search_history_weather ON search_history(weather);

-- Spotify Cache Table
-- Spotify API sonuçlarını cache'ler
CREATE TABLE IF NOT EXISTS spotify_cache (
    id SERIAL PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    weather TEXT NOT NULL,
    mood INT NOT NULL,
    tracks JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Index for spotify cache
CREATE INDEX idx_spotify_cache_key ON spotify_cache(cache_key);
CREATE INDEX idx_spotify_cache_expires ON spotify_cache(expires_at);

-- Mood Learning Analytics Table
-- Gelişmiş analytics için
CREATE TABLE IF NOT EXISTS mood_analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_users INT DEFAULT 0,
    total_searches INT DEFAULT 0,
    avg_mood_offset DECIMAL(5,2) DEFAULT 0,
    most_common_weather TEXT,
    most_common_hour INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Update user_mood_stats function
CREATE OR REPLACE FUNCTION update_user_mood_stats(
    p_session_id TEXT,
    p_date DATE,
    p_offset INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_mood_stats (session_id, date, total_offset, count, updated_at)
    VALUES (p_session_id, p_date, p_offset, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (session_id, date)
    DO UPDATE SET
        total_offset = user_mood_stats.total_offset + p_offset,
        count = user_mood_stats.count + 1,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Get learned bias function
CREATE OR REPLACE FUNCTION get_learned_bias(
    p_session_id TEXT,
    p_date DATE
) RETURNS INT AS $$
DECLARE
    v_result INT;
BEGIN
    SELECT ROUND(total_offset::DECIMAL / NULLIF(count, 0))
    INTO v_result
    FROM user_mood_stats
    WHERE session_id = p_session_id AND date = p_date;
    
    RETURN COALESCE(v_result, 0);
END;
$$ LANGUAGE plpgsql;

-- Update session activity
CREATE OR REPLACE FUNCTION update_session_activity(
    p_session_id TEXT,
    p_user_id TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_sessions (session_id, user_id, last_seen, total_searches)
    VALUES (p_session_id, p_user_id, CURRENT_TIMESTAMP, 1)
    ON CONFLICT (session_id)
    DO UPDATE SET
        last_seen = CURRENT_TIMESTAMP,
        total_searches = user_sessions.total_searches + 1,
        user_id = COALESCE(p_user_id, user_sessions.user_id);
END;
$$ LANGUAGE plpgsql;

-- Clean old cache
CREATE OR REPLACE FUNCTION clean_expired_cache() RETURNS INT AS $$
DECLARE
    v_deleted INT;
BEGIN
    DELETE FROM spotify_cache
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_mood_stats_updated_at
    BEFORE UPDATE ON user_mood_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- VIEWS
-- ==========================================

-- User mood summary view
CREATE OR REPLACE VIEW user_mood_summary AS
SELECT 
    session_id,
    COUNT(DISTINCT date) as active_days,
    SUM(count) as total_searches,
    ROUND(AVG(total_offset::DECIMAL / NULLIF(count, 0)), 2) as avg_mood_offset,
    MAX(date) as last_active_date
FROM user_mood_stats
GROUP BY session_id;

-- Daily analytics view
CREATE OR REPLACE VIEW daily_analytics AS
SELECT 
    sh.created_at::DATE as date,
    COUNT(DISTINCT sh.session_id) as unique_users,
    COUNT(*) as total_searches,
    ROUND(AVG(sh.final_mood), 2) as avg_final_mood,
    ROUND(AVG(sh.user_offset), 2) as avg_user_offset,
    MODE() WITHIN GROUP (ORDER BY sh.weather) as most_common_weather,
    MODE() WITHIN GROUP (ORDER BY sh.hour) as most_common_hour
FROM search_history sh
GROUP BY sh.created_at::DATE
ORDER BY date DESC;

-- ==========================================
-- SAMPLE QUERIES
-- ==========================================

-- Get user's mood history for last 7 days
-- SELECT * FROM user_mood_stats 
-- WHERE session_id = 'abc123' 
-- AND date >= CURRENT_DATE - INTERVAL '7 days'
-- ORDER BY date DESC;

-- Get learned bias for today
-- SELECT get_learned_bias('abc123', CURRENT_DATE);

-- Get user summary
-- SELECT * FROM user_mood_summary WHERE session_id = 'abc123';

-- Get daily analytics
-- SELECT * FROM daily_analytics WHERE date >= CURRENT_DATE - INTERVAL '30 days';

-- Clean expired cache
-- SELECT clean_expired_cache();

-- ==========================================
-- INITIAL DATA (Optional)
-- ==========================================

-- Insert sample analytics record
INSERT INTO mood_analytics (date, total_users, total_searches, avg_mood_offset)
VALUES (CURRENT_DATE, 0, 0, 0)
ON CONFLICT (date) DO NOTHING;

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE user_mood_stats IS 'Stores daily mood offset statistics per user session';
COMMENT ON TABLE user_sessions IS 'Tracks user session information and activity';
COMMENT ON TABLE search_history IS 'Logs all search queries for analytics';
COMMENT ON TABLE spotify_cache IS 'Caches Spotify API responses to reduce API calls';
COMMENT ON TABLE mood_analytics IS 'Daily aggregated analytics data';

COMMENT ON FUNCTION update_user_mood_stats IS 'Updates or inserts user mood statistics';
COMMENT ON FUNCTION get_learned_bias IS 'Calculates learned bias for a session and date';
COMMENT ON FUNCTION update_session_activity IS 'Updates session last seen and search count';
COMMENT ON FUNCTION clean_expired_cache IS 'Removes expired Spotify cache entries';
