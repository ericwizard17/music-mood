/**
 * MOOD SCORE SYSTEM
 * Hava durumu, sıcaklık ve saat bazlı mood score hesaplama
 */

// ==========================================
// SCORE CALCULATORS
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
    if (temp >= 20 && temp <= 25) return 85;   // İdeal sıcaklık
    if (temp >= 15 && temp < 20) return 70;    // Serin
    if (temp > 25 && temp <= 30) return 65;    // Sıcak
    if (temp >= 5 && temp < 15) return 55;     // Soğuk
    if (temp < 5) return 40;                   // Çok soğuk
    if (temp > 30) return 50;                  // Çok sıcak
    return 50;                                 // Varsayılan
}

/**
 * Hava durumuna göre mood score hesaplar
 * @param {string} weather - Hava durumu kategorisi
 * @returns {number} - Mood score (0-100)
 */
function getWeatherScore(weather) {
    switch (weather) {
        case "Clear": return 85;
        case "Clouds": return 60;
        case "Rain": return 35;
        case "Snow": return 50;
        case "Thunderstorm": return 25;
        case "Drizzle": return 45;
        case "Mist":
        case "Fog":
        case "Haze": return 55;
        default: return 50;
    }
}

/**
 * Toplam mood score hesaplar
 * @param {Object} params - Parametreler
 * @param {number} params.hour - Saat (0-23)
 * @param {string} params.weather - Hava durumu
 * @param {number} params.temp - Sıcaklık (Celsius)
 * @returns {number} - Toplam mood score (0-100)
 */
function calculateMoodScore({ hour, weather, temp }) {
    const timeScore = getTimeScore(hour);
    const weatherScore = getWeatherScore(weather);
    const tempScore = getTempScore(temp);

    // Ağırlıklı ortalama: %30 saat, %40 hava, %30 sıcaklık
    const mood =
        timeScore * 0.3 +
        weatherScore * 0.4 +
        tempScore * 0.3;

    return Math.round(mood);
}

// ==========================================
// MOOD TO AUDIO MAPPING
// ==========================================

/**
 * Mood score'u Spotify audio features'a dönüştürür
 * @param {number} mood - Mood score (0-100)
 * @returns {Object} - Spotify audio features
 */
function moodToAudio(mood) {
    // Yüksek mood (70-100): Enerjik ve pozitif
    if (mood >= 70) {
        return {
            energy: 0.8,
            valence: 0.8,
            minTempo: 110,
            maxTempo: 140,
            acousticness: 0.3
        };
    }

    // Orta mood (40-69): Chill ve nötr
    if (mood >= 40) {
        return {
            energy: 0.5,
            valence: 0.5,
            minTempo: 90,
            maxTempo: 120,
            acousticness: 0.5
        };
    }

    // Düşük mood (0-39): Melankolik ve düşük enerji
    return {
        energy: 0.3,
        valence: 0.2,
        minTempo: 60,
        maxTempo: 85,
        acousticness: 0.7
    };
}

/**
 * Mood score'a göre kategori belirler
 * @param {number} mood - Mood score (0-100)
 * @returns {Object} - Kategori bilgileri
 */
function getMoodCategory(mood) {
    if (mood <= 30) {
        return {
            category: 'melancholic',
            description: 'Melankolik / Low Energy',
            color: '#8b5cf6'  // Mor
        };
    } else if (mood <= 60) {
        return {
            category: 'chill',
            description: 'Neutral / Chill',
            color: '#3b82f6'  // Mavi
        };
    } else {
        return {
            category: 'energetic',
            description: 'Enerjik / Pozitif',
            color: '#f59e0b'  // Turuncu
        };
    }
}

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    getTimeScore,
    getTempScore,
    getWeatherScore,
    calculateMoodScore,
    moodToAudio,
    getMoodCategory
};
