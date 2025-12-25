/**
 * MUSIC MOOD APP
 * Hava durumuna göre müzik öneren web uygulaması
 * OpenWeatherMap API entegrasyonu ile çalışır
 */

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
    // OpenWeatherMap API anahtarı config.js'den alınır
    get API_KEY() {
        return window.CONFIG?.OPENWEATHER_API_KEY || 'YOUR_API_KEY_HERE';
    },
    API_BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
    UNITS: 'metric',
    LANG: 'tr'
};

// ==========================================
// DOM ELEMENTS
// ==========================================

const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    resultsSection: document.getElementById('resultsSection'),
    cityName: document.getElementById('cityName'),
    weatherDescription: document.getElementById('weatherDescription'),
    weatherIcon: document.getElementById('weatherIcon'),
    temperature: document.getElementById('temperature'),
    humidity: document.getElementById('humidity'),
    moodBadge: document.getElementById('moodBadge'),
    moodDescription: document.getElementById('moodDescription'),
    playlistContainer: document.getElementById('playlistContainer'),
    aiExplanationCard: document.getElementById('aiExplanationCard'),
    aiExplanationText: document.getElementById('aiExplanationText'),
    aiExplanationLoading: document.getElementById('aiExplanationLoading')
};

// ==========================================
// CORE FUNCTIONS
// ==========================================

/**
 * Hava durumu kategorisini mood'a dönüştürür
 * @param {string} weatherMain - OpenWeatherMap'ten gelen ana hava durumu kategorisi
 * @returns {string} - Mood kategorisi (energetic, chill, melancholic, lofi)
 */
function weatherToMood(weatherMain) {
    // WEATHER_TO_MOOD mapping'ini kullan
    const mood = WEATHER_TO_MOOD[weatherMain];

    // Eğer mapping'de yoksa, varsayılan olarak 'chill' döndür
    return mood || 'chill';
}

/**
 * Hava durumunu audio özelliklerine dönüştürür
 * Spotify API veya benzeri müzik servisleri için kullanılabilir
 * @param {string} weather - Hava durumu kategorisi (Clear, Clouds, Rain, Snow, Thunderstorm)
 * @returns {Object} - Audio özellikleri (energy, valence, tempo, acousticness)
 */
function mapWeatherToAudio(weather) {
    switch (weather) {
        case "Clear":
            return {
                energy: 0.8,        // Yüksek enerji
                valence: 0.8,       // Pozitif ruh hali
                minTempo: 110       // Hızlı tempo
            };

        case "Clouds":
            return {
                energy: 0.5,        // Orta enerji
                valence: 0.5,       // Nötr ruh hali
                minTempo: 90        // Orta tempo
            };

        case "Rain":
            return {
                energy: 0.3,        // Düşük enerji
                valence: 0.2,       // Melankolik ruh hali
                maxTempo: 90,       // Yavaş tempo
                acousticness: 0.6   // Akustik ağırlıklı
            };

        case "Snow":
            return {
                energy: 0.4,        // Düşük-orta enerji
                valence: 0.4,       // Sakin ruh hali
                acousticness: 0.7   // Yüksek akustik
            };

        case "Thunderstorm":
            return {
                energy: 0.9,        // Çok yüksek enerji
                valence: 0.2,       // Yoğun/dramatik ruh hali
                minTempo: 120       // Çok hızlı tempo
            };

        default:
            return {
                energy: 0.5,        // Varsayılan orta enerji
                valence: 0.5        // Varsayılan nötr ruh hali
            };
    }
}

/**
 * Hata mesajı gösterir
 * @param {string} message - Gösterilecek hata mesajı
 */
function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('hidden');

    // 5 saniye sonra otomatik olarak gizle
    setTimeout(() => {
        elements.errorMessage.classList.add('hidden');
    }, 5000);
}

/**
 * Hata mesajını gizler
 */
function hideError() {
    elements.errorMessage.classList.add('hidden');
}

/**
 * Yükleme spinner'ını gösterir
 */
function showLoading() {
    elements.loadingSpinner.classList.remove('hidden');
    elements.resultsSection.classList.add('hidden');
}

/**
 * Yükleme spinner'ını gizler
 */
function hideLoading() {
    elements.loadingSpinner.classList.add('hidden');
}

/**
 * Sonuçlar bölümünü gösterir
 */
function showResults() {
    elements.resultsSection.classList.remove('hidden');
}

/**
 * Input validasyonu yapar
 * @param {string} city - Şehir adı
 * @returns {boolean} - Geçerli ise true, değilse false
 */
function validateInput(city) {
    if (!city || city.trim() === '') {
        showError('⚠️ Lütfen bir şehir adı girin');
        return false;
    }

    if (city.length < 2) {
        showError('⚠️ Şehir adı en az 2 karakter olmalıdır');
        return false;
    }

    return true;
}

/**
 * API anahtarı kontrolü yapar
 * @returns {boolean} - API anahtarı geçerli ise true
 */
function validateApiKey() {
    if (CONFIG.API_KEY === 'YOUR_API_KEY_HERE' || !CONFIG.API_KEY) {
        showError('❌ API anahtarı yapılandırılmamış. Lütfen config.js dosyasında OPENWEATHER_API_KEY değerini güncelleyin.');
        return false;
    }
    return true;
}

/**
 * OpenWeatherMap API'den hava durumu verisi çeker
 * @param {string} city - Şehir adı
 * @returns {Promise<Object>} - Hava durumu verisi
 */
async function fetchWeatherData(city) {
    const url = `${CONFIG.API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}&lang=${CONFIG.LANG}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            // HTTP hata kodlarını ele al
            if (response.status === 404) {
                throw new Error('Şehir bulunamadı. Lütfen geçerli bir şehir adı girin.');
            } else if (response.status === 401) {
                throw new Error('API anahtarı geçersiz. Lütfen yapılandırmayı kontrol edin.');
            } else {
                throw new Error('Hava durumu verisi alınamadı. Lütfen daha sonra tekrar deneyin.');
            }
        }

        const data = await response.json();
        return data;

    } catch (error) {
        // Network hataları
        if (error.message.includes('Failed to fetch')) {
            throw new Error('🌐 İnternet bağlantınızı kontrol edin');
        }
        throw error;
    }
}

/**
 * Hava durumu bilgilerini UI'da gösterir
 * @param {Object} weatherData - OpenWeatherMap'ten gelen hava durumu verisi
 */
function displayWeatherInfo(weatherData) {
    // Şehir adı
    elements.cityName.textContent = `${weatherData.name}, ${weatherData.sys.country}`;

    // Hava durumu açıklaması
    elements.weatherDescription.textContent = weatherData.weather[0].description;

    // Hava durumu ikonu
    const iconCode = weatherData.weather[0].icon;
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    elements.weatherIcon.alt = weatherData.weather[0].description;

    // Sıcaklık
    elements.temperature.textContent = `${Math.round(weatherData.main.temp)}°C`;

    // Nem
    elements.humidity.textContent = `Nem: ${weatherData.main.humidity}%`;
}

/**
 * Mood bilgisini UI'da gösterir
 * @param {string} mood - Mood kategorisi
 */
function displayMoodInfo(mood) {
    const playlist = PLAYLISTS[mood];

    // Mood badge
    elements.moodBadge.textContent = playlist.name;
    elements.moodBadge.className = `mood-badge ${mood}`;

    // Mood açıklaması
    elements.moodDescription.textContent = playlist.description;
}

/**
 * Playlist'i UI'da gösterir
 * @param {string} mood - Mood kategorisi
 */
function displayPlaylist(mood) {
    const playlist = PLAYLISTS[mood];

    // Container'ı temizle
    elements.playlistContainer.innerHTML = '';

    // Her şarkı için kart oluştur
    playlist.songs.forEach((song, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.style.animationDelay = `${index * 0.1}s`;

        songCard.innerHTML = `
            <div class="song-number">#${index + 1}</div>
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
            <div class="song-genre">${song.genre}</div>
        `;

        // Hover efekti için animasyon ekle
        songCard.addEventListener('mouseenter', function () {
            this.style.animation = 'fadeInUp 0.3s ease-out';
        });

        elements.playlistContainer.appendChild(songCard);
    });
}

/**
 * AI destekli müzik açıklaması alır ve gösterir
 * @param {string} city - Şehir adı
 * @param {string} weather - Hava durumu
 * @param {number} temperature - Sıcaklık
 * @param {string} mood - Mood kategorisi
 * @param {Array} songs - Şarkı listesi
 */
async function fetchAIExplanation(city, weather, temperature, mood, songs) {
    try {
        // AI kartını göster ve loading başlat
        elements.aiExplanationCard.classList.remove('hidden');
        elements.aiExplanationLoading.classList.remove('hidden');
        elements.aiExplanationText.classList.add('hidden');
        elements.aiExplanationText.textContent = '';

        // Backend'e istek gönder
        const response = await fetch('/api/ai-recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                city,
                weather,
                temperature,
                mood,
                songs: songs.slice(0, 10) // İlk 10 şarkıyı gönder
            })
        });

        if (!response.ok) {
            throw new Error('AI açıklaması alınamadı');
        }

        const data = await response.json();

        // Loading'i gizle ve açıklamayı göster
        elements.aiExplanationLoading.classList.add('hidden');
        elements.aiExplanationText.classList.remove('hidden');

        // Açıklamayı animasyonlu şekilde göster
        elements.aiExplanationText.textContent = data.explanation;
        elements.aiExplanationText.style.animation = 'fadeInUp 0.6s ease-out';

        console.log('✅ AI açıklaması alındı:', data.success ? 'OpenAI' : 'Fallback');

    } catch (error) {
        console.error('❌ AI açıklama hatası:', error);

        // Hata durumunda kartı gizle
        elements.aiExplanationCard.classList.add('hidden');
    }
}

/**
 * Ana arama fonksiyonu
 * Hava durumunu çeker ve uygun playlist'i gösterir
 */
async function searchWeatherAndMusic() {
    // Input'u al ve temizle
    const city = elements.cityInput.value.trim();

    // Validasyon
    if (!validateInput(city)) {
        return;
    }

    if (!validateApiKey()) {
        return;
    }

    // Hataları gizle
    hideError();

    // Loading göster
    showLoading();

    try {
        // Hava durumu verisini çek
        const weatherData = await fetchWeatherData(city);

        // Hava durumunu mood'a dönüştür
        const weatherMain = weatherData.weather[0].main;
        const mood = weatherToMood(weatherMain);

        // UI'ı güncelle
        displayWeatherInfo(weatherData);
        displayMoodInfo(mood);
        displayPlaylist(mood);

        // AI açıklamasını al
        await fetchAIExplanation(
            weatherData.name,
            weatherMain,
            weatherData.main.temp,
            mood,
            PLAYLISTS[mood].songs
        );

        // Loading'i gizle ve sonuçları göster
        hideLoading();
        showResults();

    } catch (error) {
        // Hataları göster
        hideLoading();
        showError(`❌ ${error.message}`);
        console.error('Error:', error);
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

/**
 * Arama butonuna tıklama event'i
 */
elements.searchBtn.addEventListener('click', searchWeatherAndMusic);

/**
 * Input'ta Enter tuşuna basma event'i
 */
elements.cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchWeatherAndMusic();
    }
});

/**
 * Input'a focus olduğunda hata mesajını gizle
 */
elements.cityInput.addEventListener('focus', hideError);

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Sayfa yüklendiğinde çalışacak fonksiyon
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 MusicMood App initialized');

    // API anahtarı kontrolü
    if (CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('⚠️ API anahtarı yapılandırılmamış. Lütfen config.js dosyasında OPENWEATHER_API_KEY değerini güncelleyin.');
        console.info('📝 OpenWeatherMap API anahtarı almak için: https://openweathermap.org/api');
    }

    // Input'a focus ver
    elements.cityInput.focus();
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Console'a güzel bir başlangıç mesajı yazdırır
 */
console.log(`
%c🎵 MusicMood App 
%cHava durumuna göre müzik keşfet
%cDeveloped with ❤️
`,
    'color: #6366f1; font-size: 24px; font-weight: bold;',
    'color: #94a3b8; font-size: 14px;',
    'color: #64748b; font-size: 12px;'
);
