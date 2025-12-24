/**
 * SHUFFLE HELPER FOR APP.JS
 * Bu dosyayı app.js'den önce yükleyin
 */

/**
 * Diziyi karıştırır (Fisher-Yates shuffle algoritması)
 * @param {Array} array - Karıştırılacak dizi
 * @returns {Array} - Karıştırılmış dizi
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Belirli bir mood için rastgele şarkı listesi döndürür
 * @param {string} mood - Mood kategorisi
 * @param {number} count - Döndürülecek şarkı sayısı (varsayılan: 10)
 * @returns {Array} - Karıştırılmış şarkı listesi
 */
function getRandomSongs(mood, count = 10) {
    const playlist = PLAYLISTS[mood];
    if (!playlist) return [];

    const shuffled = shuffleArray(playlist.songs);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// displayPlaylist fonksiyonunu override et
const originalDisplayPlaylist = window.displayPlaylist;

window.displayPlaylist = function (mood) {
    const playlist = PLAYLISTS[mood];
    const elements = {
        playlistContainer: document.getElementById('playlistContainer')
    };

    // Container'ı temizle
    elements.playlistContainer.innerHTML = '';

    // Rastgele 10 şarkı seç (her aramada farklı)
    const randomSongs = getRandomSongs(mood, 10);

    // Her şarkı için kart oluştur
    randomSongs.forEach((song, index) => {
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

    // Kaç farklı şarkı olduğunu göster
    console.log(`🎵 ${mood} mood: ${randomSongs.length} şarkı gösteriliyor (toplam ${playlist.songs.length} şarkı mevcut)`);
};

console.log('🔀 Shuffle system loaded - Her aramada farklı şarkılar gösterilecek!');
