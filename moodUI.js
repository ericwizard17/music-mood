/**
 * MOOD SCORE UI MODULE
 * Frontend mood score görselleştirme ve kullanıcı etkileşimi
 */

// ==========================================
// DOM ELEMENTS
// ==========================================

const moodElements = {
    slider: document.getElementById('moodSlider'),
    sliderValue: document.getElementById('moodValue'),
    moodBar: document.getElementById('moodFill'),
    moodScoreText: document.getElementById('moodScore'),
    moodCategory: document.getElementById('moodCategory'),
    moodDescription: document.getElementById('moodDescription')
};

// ==========================================
// STATE
// ==========================================

let currentBaseMood = 50;  // Otomatik hesaplanan mood
let userMoodOffset = 0;    // Kullanıcının manuel ayarı (-20 ile +20)
let finalMoodScore = 50;   // Final mood score

// ==========================================
// MOOD TRACKING (LocalStorage)
// ==========================================

const MOOD_STORAGE_KEY = 'musicmood_daily_offsets';

/**
 * Günlük mood offset'i kaydeder
 * @param {number} offset - Mood offset (-20 ile +20)
 */
function saveDailyMoodOffset(offset) {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const data = getDailyMoodData();

        if (data.date === today) {
            // Bugünün verisi varsa güncelle
            data.totalOffset += offset;
            data.count += 1;
        } else {
            // Yeni gün, yeni veri
            data.date = today;
            data.totalOffset = offset;
            data.count = 1;
        }

        localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(data));
        console.log(`📊 Mood offset kaydedildi: ${offset} (Günlük ortalama: ${getDailyAverageMoodOffset()})`);
    } catch (error) {
        console.error('Mood offset kaydetme hatası:', error);
    }
}

/**
 * Günlük mood verisini getirir
 * @returns {Object} - Günlük mood verisi
 */
function getDailyMoodData() {
    try {
        const stored = localStorage.getItem(MOOD_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Mood data okuma hatası:', error);
    }

    // Varsayılan veri
    return {
        date: new Date().toISOString().split('T')[0],
        totalOffset: 0,
        count: 0
    };
}

/**
 * Günlük ortalama mood offset'i hesaplar
 * @returns {number} - Ortalama offset
 */
function getDailyAverageMoodOffset() {
    const data = getDailyMoodData();
    if (data.count === 0) return 0;
    return Math.round(data.totalOffset / data.count);
}

/**
 * Mood istatistiklerini gösterir
 * @returns {Object} - İstatistikler
 */
function getMoodStats() {
    const data = getDailyMoodData();
    const average = getDailyAverageMoodOffset();

    return {
        date: data.date,
        searchCount: data.count,
        averageOffset: average,
        totalOffset: data.totalOffset,
        trend: average > 0 ? 'positive' : average < 0 ? 'negative' : 'neutral'
    };
}

// ==========================================
// USER MOOD ADJUSTMENT
// ==========================================

/**
 * Kullanıcı ayarını base mood'a uygular
 * @param {number} baseMood - Otomatik hesaplanan mood (0-100)
 * @param {number} userOffset - Kullanıcı ayarı (-20 ile +20)
 * @returns {number} - Final mood score (0-100 arası sınırlandırılmış)
 */
function applyUserMood(baseMood, userOffset) {
    const finalMood = baseMood + userOffset;
    return Math.max(0, Math.min(100, finalMood));
}

// ==========================================
// MOOD VISUALIZATION
// ==========================================

/**
 * Mood score'u UI'da görselleştirir
 * @param {number} score - Mood score (0-100)
 */
function updateMoodUI(score) {
    if (!moodElements.moodBar || !moodElements.moodScoreText) return;

    const fill = moodElements.moodBar;
    const text = moodElements.moodScoreText;

    // Progress bar genişliği
    fill.style.width = score + "%";
    text.innerText = score;

    // Renk değişimi (mood kategorisine göre)
    let color, category, description;

    if (score >= 70) {
        color = "#f59e0b";  // Turuncu - Energetic
        category = "Enerjik";
        description = "Pozitif ve yüksek enerji";
    } else if (score >= 40) {
        color = "#3b82f6";  // Mavi - Chill
        category = "Chill";
        description = "Sakin ve dengeli";
    } else {
        color = "#8b5cf6";  // Mor - Melancholic
        category = "Melankolik";
        description = "Duygusal ve düşük enerji";
    }

    fill.style.background = color;

    // Kategori ve açıklama güncelle
    if (moodElements.moodCategory) {
        moodElements.moodCategory.textContent = category;
        moodElements.moodCategory.style.color = color;
    }

    if (moodElements.moodDescription) {
        moodElements.moodDescription.textContent = description;
    }
}

/**
 * Mood bar'ı animasyonlu olarak günceller
 * @param {number} score - Mood score (0-100)
 */
function animateMoodBar(score) {
    // Smooth animation için requestAnimationFrame kullan
    const startScore = finalMoodScore;
    const endScore = score;
    const duration = 600; // ms
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const currentScore = Math.round(startScore + (endScore - startScore) * easeProgress);
        updateMoodUI(currentScore);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

// ==========================================
// SLIDER EVENT HANDLERS
// ==========================================

/**
 * Mood slider değiştiğinde çalışır
 */
if (moodElements.slider && moodElements.sliderValue) {
    moodElements.slider.addEventListener('input', (e) => {
        userMoodOffset = parseInt(e.target.value);
        moodElements.sliderValue.textContent = userMoodOffset > 0 ? `+${userMoodOffset}` : userMoodOffset;

        // Final mood score'u hesapla ve göster
        finalMoodScore = applyUserMood(currentBaseMood, userMoodOffset);
        updateMoodUI(finalMoodScore);

        // Slider rengini güncelle
        updateSliderColor(userMoodOffset);
    });
}

/**
 * Slider rengini offset değerine göre günceller
 * @param {number} offset - Mood offset (-20 ile +20)
 */
function updateSliderColor(offset) {
    if (!moodElements.slider) return;

    const slider = moodElements.slider;

    if (offset > 0) {
        slider.style.setProperty('--slider-color', '#10b981');  // Yeşil (pozitif)
    } else if (offset < 0) {
        slider.style.setProperty('--slider-color', '#ef4444');  // Kırmızı (negatif)
    } else {
        slider.style.setProperty('--slider-color', '#6366f1');  // İndigo (nötr)
    }
}

// ==========================================
// PUBLIC API
// ==========================================

/**
 * Base mood score'u günceller (backend'den gelen değer)
 * @param {number} baseMood - Otomatik hesaplanan mood
 */
function setBaseMood(baseMood) {
    currentBaseMood = baseMood;
    finalMoodScore = applyUserMood(baseMood, userMoodOffset);
    animateMoodBar(finalMoodScore);
}

/**
 * Mood score'u sıfırlar
 */
function resetMoodScore() {
    currentBaseMood = 50;
    userMoodOffset = 0;
    finalMoodScore = 50;

    if (moodElements.slider) {
        moodElements.slider.value = 0;
    }

    if (moodElements.sliderValue) {
        moodElements.sliderValue.textContent = '0';
    }

    updateMoodUI(50);
    updateSliderColor(0);
}

/**
 * Mevcut final mood score'u döndürür
 * @returns {number} - Final mood score
 */
function getFinalMoodScore() {
    return finalMoodScore;
}

/**
 * User mood offset'i döndürür
 * @returns {number} - User offset
 */
function getUserMoodOffset() {
    return userMoodOffset;
}

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Sayfa yüklendiğinde başlangıç değerlerini ayarla
 */
document.addEventListener('DOMContentLoaded', () => {
    // Başlangıç mood score'u göster
    updateMoodUI(50);
    updateSliderColor(0);

    console.log('🎭 Mood Score UI initialized');
});

// ==========================================
// GLOBAL EXPORTS
// ==========================================

window.MoodScoreUI = {
    setBaseMood,
    resetMoodScore,
    getFinalMoodScore,
    getUserMoodOffset,
    updateMoodUI,
    applyUserMood
};

console.log('🎭 Mood Score UI module loaded');
