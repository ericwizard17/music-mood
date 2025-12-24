/**
 * ENVIRONMENT CONFIGURATION
 * Frontend environment variables
 */

// API Base URL
// Production: Set via window.ENV or use deployed URL
// Development: localhost:3000
const API_BASE = window.ENV?.API_URL ||
    window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.origin;

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = window.ENV?.GOOGLE_CLIENT_ID ||
    'c82d44b1373944a79331dd3d99ba1ecb';

// OpenWeatherMap API Key
const OPENWEATHER_API_KEY = window.ENV?.OPENWEATHER_API_KEY ||
    'YOUR_API_KEY_HERE';

// Environment
const IS_PRODUCTION = window.location.hostname !== 'localhost';
const IS_DEVELOPMENT = !IS_PRODUCTION;

// Export configuration
window.CONFIG = {
    API_BASE,
    GOOGLE_CLIENT_ID,
    OPENWEATHER_API_KEY,
    IS_PRODUCTION,
    IS_DEVELOPMENT
};

console.log('🔧 Environment:', IS_PRODUCTION ? 'Production' : 'Development');
console.log('🌐 API Base:', API_BASE);
