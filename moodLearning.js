/**
 * MOOD LEARNING SYSTEM
 * Kullanıcının mood tercihlerini öğrenen ve öneren sistem
 */

// ==========================================
// CONFIGURATION
// ==========================================

const MOOD_LEARNING_KEY = 'moodLearning';

// ==========================================
// MOOD FEEDBACK STORAGE
// ==========================================

/**
 * Kullanıcının mood ayarını kaydeder
 * @param {number} offset - Mood offset (-20 ile +20)
 */
function saveMoodFeedback(offset) {
    try {
        const today = new Date().toISOString().split("T")[0];
        const data = JSON.parse(localStorage.getItem(MOOD_LEARNING_KEY)) || {};

        if (!data[today]) {
            data[today] = { totalOffset: 0, count: 0 };
        }

        data[today].totalOffset += Number(offset);
        data[today].count += 1;

        localStorage.setItem(MOOD_LEARNING_KEY, JSON.stringify(data));

        console.log(`📚 Mood öğrenildi: ${offset} (Bugün: ${data[today].count} kayıt)`);
    } catch (error) {
        console.error('Mood feedback kaydetme hatası:', error);
    }
}

/**
 * Bugünün öğrenilmiş mood bias'ını döndürür
 * @returns {number} - Öğrenilmiş bias (ortalama offset)
 */
function getLearnedBias() {
    try {
        const today = new Date().toISOString().split("T")[0];
        const data = JSON.parse(localStorage.getItem(MOOD_LEARNING_KEY));

        if (!data || !data[today]) return 0;

        return Math.round(data[today].totalOffset / data[today].count);
    } catch (error) {
        console.error('Learned bias okuma hatası:', error);
        return 0;
    }
}

/**
 * Bugünün mood verilerini getirir
 * @returns {Object} - { totalOffset, count }
 */
function getTodayMoodData() {
    try {
        const today = new Date().toISOString().split("T")[0];
        const data = JSON.parse(localStorage.getItem(MOOD_LEARNING_KEY)) || {};

        return data[today] || { totalOffset: 0, count: 0 };
    } catch (error) {
        console.error('Today mood data okuma hatası:', error);
        return { totalOffset: 0, count: 0 };
    }
}

/**
 * Tüm mood geçmişini getirir
 * @returns {Object} - Tüm günlerin mood verisi
 */
function getAllMoodHistory() {
    try {
        return JSON.parse(localStorage.getItem(MOOD_LEARNING_KEY)) || {};
    } catch (error) {
        console.error('Mood history okuma hatası:', error);
        return {};
    }
}

// ==========================================
// MOOD ANALYTICS
// ==========================================

/**
 * Son N günün mood istatistiklerini hesaplar
 * @param {number} days - Kaç günlük veri (varsayılan: 7)
 * @returns {Object} - İstatistikler
 */
function getMoodStats(days = 7) {
    const history = getAllMoodHistory();
    const today = new Date();
    const stats = {
        totalSearches: 0,
        averageOffset: 0,
        trend: 'neutral',
        dailyData: [],
        recommendation: ''
    };

    let totalOffset = 0;
    let totalCount = 0;

    // Son N günü kontrol et
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        if (history[dateStr]) {
            const dayData = history[dateStr];
            const dayAverage = Math.round(dayData.totalOffset / dayData.count);

            stats.dailyData.push({
                date: dateStr,
                count: dayData.count,
                average: dayAverage,
                totalOffset: dayData.totalOffset
            });

            totalOffset += dayData.totalOffset;
            totalCount += dayData.count;
        }
    }

    stats.totalSearches = totalCount;
    stats.averageOffset = totalCount > 0 ? Math.round(totalOffset / totalCount) : 0;

    // Trend belirleme
    if (stats.averageOffset > 5) {
        stats.trend = 'positive';
        stats.recommendation = 'Genellikle daha enerjik müzikler tercih ediyorsunuz';
    } else if (stats.averageOffset < -5) {
        stats.trend = 'negative';
        stats.recommendation = 'Genellikle daha sakin müzikler tercih ediyorsunuz';
    } else {
        stats.trend = 'neutral';
        stats.recommendation = 'Dengeli bir müzik tercihiniz var';
    }

    return stats;
}

/**
 * Mood learning verilerini temizler
 */
function clearMoodLearning() {
    try {
        localStorage.removeItem(MOOD_LEARNING_KEY);
        console.log('🗑️ Mood learning verileri temizlendi');
    } catch (error) {
        console.error('Mood learning temizleme hatası:', error);
    }
}

/**
 * Eski verileri temizler (30 günden eski)
 */
function cleanOldMoodData() {
    try {
        const data = getAllMoodHistory();
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let cleaned = false;

        Object.keys(data).forEach(dateStr => {
            const date = new Date(dateStr);
            if (date < thirtyDaysAgo) {
                delete data[dateStr];
                cleaned = true;
            }
        });

        if (cleaned) {
            localStorage.setItem(MOOD_LEARNING_KEY, JSON.stringify(data));
            console.log('🧹 Eski mood verileri temizlendi (30+ gün)');
        }
    } catch (error) {
        console.error('Eski veri temizleme hatası:', error);
    }
}

// ==========================================
// AUTO-SUGGESTION
// ==========================================

/**
 * Kullanıcı için mood önerisi oluşturur
 * @param {number} baseMood - Otomatik hesaplanan mood
 * @returns {Object} - Öneri bilgileri
 */
function suggestMoodAdjustment(baseMood) {
    const learnedBias = getLearnedBias();
    const stats = getMoodStats(7);

    let suggestion = 0;
    let confidence = 'low';
    let message = '';

    // Bugün en az 3 arama yapılmışsa, bugünün bias'ını kullan
    const todayData = getTodayMoodData();
    if (todayData.count >= 3) {
        suggestion = learnedBias;
        confidence = 'high';
        message = `Bugünkü tercihlerinize göre ${suggestion > 0 ? '+' : ''}${suggestion} öneriyoruz`;
    }
    // Son 7 günde en az 10 arama yapılmışsa, ortalamayı kullan
    else if (stats.totalSearches >= 10) {
        suggestion = stats.averageOffset;
        confidence = 'medium';
        message = `Geçmiş tercihlerinize göre ${suggestion > 0 ? '+' : ''}${suggestion} öneriyoruz`;
    }
    // Yeterli veri yoksa öneri yapma
    else {
        suggestion = 0;
        confidence = 'low';
        message = 'Daha fazla arama yaparak tercihlerinizi öğrenebiliriz';
    }

    return {
        suggestion,
        confidence,
        message,
        baseMood,
        suggestedFinalMood: Math.max(0, Math.min(100, baseMood + suggestion))
    };
}

// ==========================================
// EXPORTS
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
    // Node.js export
    module.exports = {
        saveMoodFeedback,
        getLearnedBias,
        getTodayMoodData,
        getAllMoodHistory,
        getMoodStats,
        clearMoodLearning,
        cleanOldMoodData,
        suggestMoodAdjustment
    };
} else {
    // Browser export
    window.MoodLearning = {
        saveMoodFeedback,
        getLearnedBias,
        getTodayMoodData,
        getAllMoodHistory,
        getMoodStats,
        clearMoodLearning,
        cleanOldMoodData,
        suggestMoodAdjustment
    };
}

// Sayfa yüklendiğinde eski verileri temizle
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        cleanOldMoodData();
        console.log('📚 Mood Learning System loaded');

        // İstatistikleri göster
        const stats = getMoodStats(7);
        if (stats.totalSearches > 0) {
            console.log(`📊 Son 7 gün: ${stats.totalSearches} arama, Ortalama: ${stats.averageOffset}, Trend: ${stats.trend}`);
        }
    });
}
