/**
 * AUTHENTICATION MODULE
 * Google OAuth 2.0 entegrasyonu
 * Kullanıcı girişi ve profil yönetimi
 */

// ==========================================
// GOOGLE AUTH CONFIGURATION
// ==========================================

const AUTH_CONFIG = {
    // Google Cloud Console'dan alacağınız Client ID
    // config.js dosyasından otomatik olarak alınır
    get CLIENT_ID() {
        return window.CONFIG?.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';
    },

    // OAuth 2.0 ayarları
    SCOPES: 'profile email',

    // Kullanıcı bilgileri localStorage key'i
    USER_STORAGE_KEY: 'musicmood_user',

    // Favori şehirler localStorage key'i
    FAVORITES_STORAGE_KEY: 'musicmood_favorites'
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let currentUser = null;
let isGoogleApiLoaded = false;

// ==========================================
// DOM ELEMENTS
// ==========================================

const authElements = {
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userProfile: document.getElementById('userProfile'),
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    favoritesSection: document.getElementById('favoritesSection'),
    favoritesList: document.getElementById('favoritesList'),
    addFavoriteBtn: document.getElementById('addFavoriteBtn')
};

// ==========================================
// GOOGLE API INITIALIZATION
// ==========================================

/**
 * Google API'yi yükler ve başlatır
 */
function initGoogleAuth() {
    // Google API script'i zaten yüklü mü kontrol et
    if (typeof google !== 'undefined' && google.accounts) {
        initializeGoogleSignIn();
    } else {
        console.error('Google API yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
    }
}

/**
 * Google Sign-In'i başlatır
 */
function initializeGoogleSignIn() {
    try {
        // Client ID kontrolü
        const clientId = AUTH_CONFIG.CLIENT_ID;

        // Debug bilgisi
        console.log('🔑 Google Client ID kontrol ediliyor...');
        console.log('📝 Client ID:', clientId ? clientId.substring(0, 20) + '...' : 'YOK');

        if (!clientId ||
            clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com' ||
            !clientId.includes('.apps.googleusercontent.com')) {
            console.warn('⚠️ Google Client ID yapılandırılmamış veya geçersiz.');
            console.warn('📝 Lütfen config.js dosyasında GOOGLE_CLIENT_ID değerini güncelleyin.');
            console.warn('🔗 Google Cloud Console: https://console.cloud.google.com/apis/credentials');
            console.info('💡 İpucu: Client ID formatı: "xxxxx.apps.googleusercontent.com" olmalıdır');

            // Login button'ı gizle ve bilgilendirme mesajı göster
            if (authElements.loginBtn) {
                authElements.loginBtn.innerHTML = `
                    <div style="padding: 12px 24px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 24px; color: #ef4444; font-size: 14px;">
                        <strong>⚠️ Google girişi yapılandırılmamış</strong><br>
                        <small>Lütfen config.js dosyasında GOOGLE_CLIENT_ID ekleyin</small>
                    </div>
                `;
            }
            return;
        }

        console.log('✅ Client ID geçerli, Google Sign-In başlatılıyor...');

        // Google Sign-In button'ı oluştur
        google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            itp_support: true // Safari için
        });

        // Login button'ı render et
        google.accounts.id.renderButton(
            authElements.loginBtn,
            {
                theme: 'filled_black',
                size: 'large',
                text: 'signin_with',
                shape: 'pill',
                logo_alignment: 'left',
                width: 250
            }
        );

        // One Tap prompt'u göster (opsiyonel)
        // google.accounts.id.prompt();

        isGoogleApiLoaded = true;
        console.log('✅ Google Auth başarıyla yüklendi');

        // Önceden giriş yapmış kullanıcıyı kontrol et
        loadUserFromStorage();

    } catch (error) {
        console.error('❌ Google Auth başlatma hatası:', error);
        console.error('📋 Hata detayları:', error.message);
        showAuthError('Giriş sistemi yüklenemedi. Lütfen sayfayı yenileyin.');

        // Hata durumunda bilgilendirici mesaj göster
        if (authElements.loginBtn) {
            authElements.loginBtn.innerHTML = `
                <div style="padding: 12px 24px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 24px; color: #ef4444; font-size: 14px;">
                    <strong>❌ Giriş sistemi yüklenemedi</strong><br>
                    <small>Lütfen sayfayı yenileyin</small>
                </div>
            `;
        }
    }
}

/**
 * Google credential response'unu işler
 * @param {Object} response - Google'dan gelen credential response
 */
function handleCredentialResponse(response) {
    try {
        // JWT token'ı decode et
        const userInfo = parseJwt(response.credential);

        // Kullanıcı bilgilerini kaydet
        currentUser = {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            loginTime: new Date().toISOString()
        };

        // LocalStorage'a kaydet
        saveUserToStorage(currentUser);

        // UI'ı güncelle
        updateAuthUI(true);

        console.log('✅ Giriş başarılı:', currentUser.name);
        showAuthSuccess(`Hoş geldiniz, ${currentUser.name}!`);

    } catch (error) {
        console.error('Credential işleme hatası:', error);
        showAuthError('Giriş yapılırken bir hata oluştu');
    }
}

/**
 * JWT token'ı decode eder
 * @param {string} token - JWT token
 * @returns {Object} - Decode edilmiş token verisi
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('JWT decode hatası:', error);
        throw new Error('Token decode edilemedi');
    }
}

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * Kullanıcı bilgilerini localStorage'a kaydeder
 * @param {Object} user - Kullanıcı bilgileri
 */
function saveUserToStorage(user) {
    try {
        localStorage.setItem(AUTH_CONFIG.USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('Kullanıcı kaydetme hatası:', error);
    }
}

/**
 * localStorage'dan kullanıcı bilgilerini yükler
 */
function loadUserFromStorage() {
    try {
        const userJson = localStorage.getItem(AUTH_CONFIG.USER_STORAGE_KEY);
        if (userJson) {
            currentUser = JSON.parse(userJson);
            updateAuthUI(true);
            console.log('✅ Kullanıcı oturumu yüklendi:', currentUser.name);
        }
    } catch (error) {
        console.error('Kullanıcı yükleme hatası:', error);
        localStorage.removeItem(AUTH_CONFIG.USER_STORAGE_KEY);
    }
}

/**
 * Kullanıcı çıkışı yapar
 */
function handleSignOut() {
    // Onay iste
    if (!confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        return;
    }

    // Google Sign-Out
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.disableAutoSelect();
    }

    // Kullanıcı bilgilerini temizle
    currentUser = null;
    localStorage.removeItem(AUTH_CONFIG.USER_STORAGE_KEY);

    // UI'ı güncelle
    updateAuthUI(false);

    console.log('✅ Çıkış yapıldı');
    showAuthSuccess('Başarıyla çıkış yaptınız');
}

/**
 * Auth UI'ını günceller
 * @param {boolean} isLoggedIn - Kullanıcı giriş yapmış mı?
 */
function updateAuthUI(isLoggedIn) {
    if (isLoggedIn && currentUser) {
        // Giriş yapılmış durumu
        authElements.loginBtn.classList.add('hidden');
        authElements.userProfile.classList.remove('hidden');
        authElements.favoritesSection.classList.remove('hidden');

        // Kullanıcı bilgilerini göster
        authElements.userAvatar.src = currentUser.picture;
        authElements.userAvatar.alt = currentUser.name;
        authElements.userName.textContent = currentUser.name;

        // Favorileri yükle
        loadFavorites();
    } else {
        // Çıkış yapılmış durumu
        authElements.loginBtn.classList.remove('hidden');
        authElements.userProfile.classList.add('hidden');
        authElements.favoritesSection.classList.add('hidden');
    }
}

// ==========================================
// FAVORITES MANAGEMENT
// ==========================================

/**
 * Favori şehirleri yükler
 */
function loadFavorites() {
    try {
        const favoritesJson = localStorage.getItem(AUTH_CONFIG.FAVORITES_STORAGE_KEY);
        const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];

        displayFavorites(favorites);
    } catch (error) {
        console.error('Favoriler yükleme hatası:', error);
        displayFavorites([]);
    }
}

/**
 * Favorileri UI'da gösterir
 * @param {Array} favorites - Favori şehirler listesi
 */
function displayFavorites(favorites) {
    authElements.favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        authElements.favoritesList.innerHTML = `
            <div class="empty-favorites">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>Henüz favori şehir eklemediniz</p>
                <small>Arama yaptıktan sonra ⭐ butonuna tıklayarak ekleyebilirsiniz</small>
            </div>
        `;
        return;
    }

    favorites.forEach((city, index) => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `
            <div class="favorite-info">
                <span class="favorite-city">${city.name}</span>
                <span class="favorite-date">${formatDate(city.addedAt)}</span>
            </div>
            <div class="favorite-actions">
                <button class="favorite-action-btn" onclick="searchFavoriteCity('${city.name}')" title="Ara">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                        <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <button class="favorite-action-btn delete" onclick="removeFavorite(${index})" title="Sil">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        `;
        authElements.favoritesList.appendChild(favoriteItem);
    });
}

/**
 * Mevcut şehri favorilere ekler
 */
function addCurrentCityToFavorites() {
    if (!currentUser) {
        showAuthError('Favori eklemek için giriş yapmalısınız');
        return;
    }

    const cityName = elements.cityName.textContent;
    if (!cityName) {
        showAuthError('Önce bir şehir araması yapın');
        return;
    }

    try {
        const favoritesJson = localStorage.getItem(AUTH_CONFIG.FAVORITES_STORAGE_KEY);
        const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];

        // Zaten var mı kontrol et
        if (favorites.some(fav => fav.name === cityName)) {
            showAuthError('Bu şehir zaten favorilerinizde');
            return;
        }

        // Maksimum 10 favori
        if (favorites.length >= 10) {
            showAuthError('Maksimum 10 favori şehir ekleyebilirsiniz');
            return;
        }

        // Favorilere ekle
        favorites.push({
            name: cityName,
            addedAt: new Date().toISOString()
        });

        localStorage.setItem(AUTH_CONFIG.FAVORITES_STORAGE_KEY, JSON.stringify(favorites));

        loadFavorites();
        showAuthSuccess(`${cityName} favorilere eklendi!`);

    } catch (error) {
        console.error('Favori ekleme hatası:', error);
        showAuthError('Favori eklenirken bir hata oluştu');
    }
}

/**
 * Favori şehri siler
 * @param {number} index - Silinecek favorinin index'i
 */
function removeFavorite(index) {
    try {
        const favoritesJson = localStorage.getItem(AUTH_CONFIG.FAVORITES_STORAGE_KEY);
        const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];

        const cityName = favorites[index].name;
        favorites.splice(index, 1);

        localStorage.setItem(AUTH_CONFIG.FAVORITES_STORAGE_KEY, JSON.stringify(favorites));

        loadFavorites();
        showAuthSuccess(`${cityName} favorilerden kaldırıldı`);

    } catch (error) {
        console.error('Favori silme hatası:', error);
        showAuthError('Favori silinirken bir hata oluştu');
    }
}

/**
 * Favori şehir için arama yapar
 * @param {string} cityName - Şehir adı
 */
function searchFavoriteCity(cityName) {
    elements.cityInput.value = cityName;
    searchWeatherAndMusic();
}

// ==========================================
// UI FEEDBACK
// ==========================================

/**
 * Başarı mesajı gösterir
 * @param {string} message - Mesaj
 */
function showAuthSuccess(message) {
    showToast(message, 'success');
}

/**
 * Hata mesajı gösterir
 * @param {string} message - Mesaj
 */
function showAuthError(message) {
    showToast(message, 'error');
}

/**
 * Toast notification gösterir
 * @param {string} message - Mesaj
 * @param {string} type - success, error, info
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animasyon için kısa gecikme
    setTimeout(() => toast.classList.add('show'), 10);

    // 3 saniye sonra kaldır
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Tarihi formatlar
 * @param {string} dateString - ISO tarih string'i
 * @returns {string} - Formatlanmış tarih
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

/**
 * Kullanıcının giriş yapıp yapmadığını kontrol eder
 * @returns {boolean}
 */
function isUserLoggedIn() {
    return currentUser !== null;
}

/**
 * Mevcut kullanıcı bilgilerini döndürür
 * @returns {Object|null}
 */
function getCurrentUser() {
    return currentUser;
}

// ==========================================
// EVENT LISTENERS
// ==========================================

/**
 * Çıkış butonu event listener
 */
if (authElements.logoutBtn) {
    authElements.logoutBtn.addEventListener('click', handleSignOut);
}

/**
 * Favori ekleme butonu event listener
 */
if (authElements.addFavoriteBtn) {
    authElements.addFavoriteBtn.addEventListener('click', addCurrentCityToFavorites);
}

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Sayfa yüklendiğinde auth'u başlat
 */
window.addEventListener('load', () => {
    // Google API yüklenene kadar bekle
    const checkGoogleApi = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
            clearInterval(checkGoogleApi);
            initGoogleAuth();
        }
    }, 100);

    // 5 saniye sonra timeout
    setTimeout(() => {
        clearInterval(checkGoogleApi);
        if (!isGoogleApiLoaded) {
            console.error('Google API yüklenemedi (timeout)');
        }
    }, 5000);
});

// ==========================================
// EXPORT (Global scope için)
// ==========================================

// Global scope'a ekle
window.handleSignOut = handleSignOut;
window.addCurrentCityToFavorites = addCurrentCityToFavorites;
window.removeFavorite = removeFavorite;
window.searchFavoriteCity = searchFavoriteCity;
window.isUserLoggedIn = isUserLoggedIn;
window.getCurrentUser = getCurrentUser;

console.log('🔐 Auth module loaded');
