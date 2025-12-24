/**
 * SPOTIFY INTEGRATION MODULE
 * Frontend Spotify API entegrasyonu
 * Backend server üzerinden Spotify'dan şarkı önerileri alır
 */

// ==========================================
// CONFIGURATION
// ==========================================

// API Base URL (config.js'den alınır)
const API_BASE = window.CONFIG?.API_BASE || 'http://localhost:3000';

const SPOTIFY_API = {
    BASE_URL: `${API_BASE}/api`,
    ENDPOINTS: {
        RECOMMENDATIONS: '/recommendations',
        SEARCH: '/search',
        TRACK: '/track',
        HEALTH: '/health',
        MOOD_FEEDBACK: '/mood-feedback'
    }
};

// ==========================================
// STATE
// ==========================================

let currentSpotifyTracks = [];
let isSpotifyEnabled = false;

// ==========================================
// SPOTIFY API FUNCTIONS
// ==========================================

/**
 * Backend server'ın çalışıp çalışmadığını kontrol eder
 * @returns {Promise<boolean>}
 */
async function checkSpotifyAvailability() {
    try {
        const response = await fetch(`${SPOTIFY_API.BASE_URL.replace('/api', '')}/api/health`);
        const data = await response.json();

        isSpotifyEnabled = data.status === 'OK' && data.spotify.configured;

        if (isSpotifyEnabled) {
            console.log('✅ Spotify API kullanılabilir');
        } else {
            console.warn('⚠️ Spotify API yapılandırılmamış');
        }

        return isSpotifyEnabled;
    } catch (error) {
        console.warn('⚠️ Backend server çalışmıyor, statik playlist kullanılacak');
        isSpotifyEnabled = false;
        return false;
    }
}

/**
 * Hava durumuna göre Spotify'dan şarkı önerileri alır
 * @param {string} weather - Hava durumu kategorisi (Clear, Clouds, Rain, etc.)
 * @returns {Promise<Array>} - Şarkı listesi
 */
async function getSpotifyRecommendations(weather) {
    try {
        const response = await fetch(
            `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.RECOMMENDATIONS}?weather=${weather}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        currentSpotifyTracks = data.tracks;

        console.log(`🎵 ${data.count} Spotify şarkısı alındı (${weather})`);
        return data.tracks;

    } catch (error) {
        console.error('Spotify recommendations hatası:', error);
        throw error;
    }
}

/**
 * Spotify'da şarkı arar
 * @param {string} query - Arama sorgusu
 * @returns {Promise<Array>} - Şarkı listesi
 */
async function searchSpotifyTracks(query) {
    try {
        const response = await fetch(
            `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.tracks;

    } catch (error) {
        console.error('Spotify search hatası:', error);
        throw error;
    }
}

/**
 * Şarkı detaylarını alır
 * @param {string} trackId - Spotify track ID
 * @returns {Promise<Object>} - Şarkı detayları
 */
async function getSpotifyTrackDetails(trackId) {
    try {
        const response = await fetch(
            `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.TRACK}/${trackId}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Spotify track details hatası:', error);
        throw error;
    }
}

// ==========================================
// UI FUNCTIONS
// ==========================================

/**
 * Spotify şarkılarını UI'da gösterir
 * @param {Array} tracks - Spotify şarkı listesi
 */
function displaySpotifyTracks(tracks) {
    elements.playlistContainer.innerHTML = '';

    if (!tracks || tracks.length === 0) {
        elements.playlistContainer.innerHTML = `
            <div class="empty-playlist">
                <p>Şarkı bulunamadı</p>
            </div>
        `;
        return;
    }

    tracks.forEach((track, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card spotify-track';
        songCard.style.animationDelay = `${index * 0.1}s`;
        songCard.dataset.trackId = track.id;

        // Süreyi formatla
        const duration = formatDuration(track.duration);

        songCard.innerHTML = `
            ${track.albumArt ? `
                <div class="song-album-art">
                    <img src="${track.albumArt}" alt="${track.album}" loading="lazy">
                    ${track.previewUrl ? '<div class="play-overlay"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>' : ''}
                </div>
            ` : ''}
            <div class="song-content">
                <div class="song-number">#${index + 1}</div>
                <div class="song-title">${track.title}</div>
                <div class="song-artist">${track.artist}</div>
                <div class="song-meta">
                    <span class="song-album">${track.album}</span>
                    <span class="song-duration">${duration}</span>
                </div>
                <div class="song-actions">
                    ${track.previewUrl ? `
                        <button class="song-action-btn preview-btn" onclick="playPreview('${track.previewUrl}')" title="Önizleme">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                <path d="M10 8L16 12L10 16V8Z" fill="currentColor"/>
                            </svg>
                        </button>
                    ` : ''}
                    <a href="${track.spotifyUrl}" target="_blank" rel="noopener" class="song-action-btn spotify-btn" title="Spotify'da Aç">
                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                    </a>
                    <button class="song-action-btn details-btn" onclick="showTrackDetails('${track.id}')" title="Detaylar">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="1" fill="currentColor"/>
                            <circle cx="12" cy="5" r="1" fill="currentColor"/>
                            <circle cx="12" cy="19" r="1" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Album art'a tıklandığında preview çal
        if (track.previewUrl) {
            const albumArt = songCard.querySelector('.song-album-art');
            if (albumArt) {
                albumArt.style.cursor = 'pointer';
                albumArt.addEventListener('click', () => playPreview(track.previewUrl));
            }
        }

        elements.playlistContainer.appendChild(songCard);
    });
}

/**
 * Süreyi formatlar (ms -> mm:ss)
 * @param {number} ms - Milisaniye
 * @returns {string} - Formatlanmış süre
 */
function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
}

// ==========================================
// AUDIO PREVIEW
// ==========================================

let currentAudio = null;

/**
 * Şarkı önizlemesi çalar
 * @param {string} previewUrl - Preview URL
 */
function playPreview(previewUrl) {
    // Önceki ses varsa durdur
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    // Yeni ses çal
    currentAudio = new Audio(previewUrl);
    currentAudio.volume = 0.5;

    currentAudio.play()
        .then(() => {
            showToast('🎵 Önizleme çalıyor...', 'info');
        })
        .catch(error => {
            console.error('Preview çalma hatası:', error);
            showToast('Önizleme çalınamadı', 'error');
        });

    // 30 saniye sonra otomatik durdur
    currentAudio.addEventListener('ended', () => {
        currentAudio = null;
    });
}

/**
 * Şarkı detaylarını modal'da gösterir
 * @param {string} trackId - Spotify track ID
 */
async function showTrackDetails(trackId) {
    try {
        showToast('Şarkı detayları yükleniyor...', 'info');

        const track = await getSpotifyTrackDetails(trackId);

        // Modal oluştur (basit alert yerine)
        const details = `
🎵 ${track.title}
👤 ${track.artist}
💿 ${track.album}

📊 Audio Features:
• Energy: ${(track.audioFeatures.energy * 100).toFixed(0)}%
• Valence: ${(track.audioFeatures.valence * 100).toFixed(0)}%
• Tempo: ${track.audioFeatures.tempo.toFixed(0)} BPM
• Acousticness: ${(track.audioFeatures.acousticness * 100).toFixed(0)}%
• Danceability: ${(track.audioFeatures.danceability * 100).toFixed(0)}%

⭐ Popularity: ${track.popularity}/100
        `;

        alert(details);

    } catch (error) {
        showToast('Şarkı detayları alınamadı', 'error');
    }
}

// ==========================================
// INTEGRATION WITH MAIN APP
// ==========================================

/**
 * Ana uygulama ile entegrasyon
 * searchWeatherAndMusic fonksiyonunu override eder
 */
const originalSearchWeatherAndMusic = searchWeatherAndMusic;

async function searchWeatherAndMusicWithSpotify() {
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

        // Spotify kullanılabilir mi kontrol et
        if (isSpotifyEnabled) {
            try {
                // Spotify'dan şarkı önerileri al
                const spotifyTracks = await getSpotifyRecommendations(weatherMain);
                displaySpotifyTracks(spotifyTracks);
                showToast(`✅ ${spotifyTracks.length} Spotify şarkısı yüklendi`, 'success');
            } catch (spotifyError) {
                console.warn('Spotify hatası, statik playlist kullanılıyor:', spotifyError);
                displayPlaylist(mood);
                showToast('Statik playlist kullanılıyor', 'info');
            }
        } else {
            // Statik playlist kullan
            displayPlaylist(mood);
        }

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
// INITIALIZATION
// ==========================================

// Sayfa yüklendiğinde Spotify'ı kontrol et
window.addEventListener('load', async () => {
    await checkSpotifyAvailability();

    // Eğer Spotify kullanılabilirse, arama fonksiyonunu override et
    if (isSpotifyEnabled) {
        console.log('🎵 Spotify entegrasyonu aktif');
        // Global fonksiyonu override et
        window.searchWeatherAndMusic = searchWeatherAndMusicWithSpotify;
    } else {
        console.log('📀 Statik playlist kullanılıyor');
    }
});

// Global scope'a ekle
window.playPreview = playPreview;
window.showTrackDetails = showTrackDetails;

console.log('🎵 Spotify module loaded');
