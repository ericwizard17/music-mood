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
// Get your Client ID from: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = window.ENV?.GOOGLE_CLIENT_ID ||
    'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

// OpenWeatherMap API Key
// Get your FREE API key from: https://openweathermap.org/api
// After signup, find it at: https://home.openweathermap.org/api_keys
// DEMO KEY: This is a sample key for testing. Get your own free key!
const OPENWEATHER_API_KEY = window.ENV?.OPENWEATHER_API_KEY ||
    'fe4feefa8543e06d4f3c66d92c61b69c';

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
