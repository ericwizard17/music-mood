/**
 * PLAYLISTS DATA
 * Hava durumuna göre kategorize edilmiş müzik önerileri
 * Her kategori farklı bir ruh haline karşılık gelir
 */

const PLAYLISTS = {
    energetic: {
        name: "Energetic",
        description: "Güneşli ve açık havalar için enerjik şarkılar. Gününüze pozitif enerji katacak parçalar.",
        color: "#f59e0b",
        songs: [
            {
                title: "Blinding Lights",
                artist: "The Weeknd",
                genre: "Synthpop"
            },
            {
                title: "Levitating",
                artist: "Dua Lipa",
                genre: "Disco-Pop"
            },
            {
                title: "Don't Start Now",
                artist: "Dua Lipa",
                genre: "Nu-Disco"
            },
            {
                title: "Good 4 U",
                artist: "Olivia Rodrigo",
                genre: "Pop Rock"
            },
            {
                title: "Heat Waves",
                artist: "Glass Animals",
                genre: "Indie Pop"
            },
            {
                title: "Uptown Funk",
                artist: "Mark Ronson ft. Bruno Mars",
                genre: "Funk"
            },
            {
                title: "Can't Stop the Feeling!",
                artist: "Justin Timberlake",
                genre: "Pop"
            }
        ]
    },
    
    chill: {
        name: "Chill",
        description: "Bulutlu ve sakin havalar için rahatlatıcı müzikler. Huzurlu bir atmosfer için ideal.",
        color: "#3b82f6",
        songs: [
            {
                title: "Weightless",
                artist: "Marconi Union",
                genre: "Ambient"
            },
            {
                title: "Sunset Lover",
                artist: "Petit Biscuit",
                genre: "Electronic"
            },
            {
                title: "Ocean Eyes",
                artist: "Billie Eilish",
                genre: "Indie Pop"
            },
            {
                title: "Electric Feel",
                artist: "MGMT",
                genre: "Psychedelic Pop"
            },
            {
                title: "Breathe Me",
                artist: "Sia",
                genre: "Art Pop"
            },
            {
                title: "Holocene",
                artist: "Bon Iver",
                genre: "Indie Folk"
            },
            {
                title: "Midnight City",
                artist: "M83",
                genre: "Synth-pop"
            }
        ]
    },
    
    melancholic: {
        name: "Melancholic",
        description: "Yağmurlu ve kasvetli günler için duygusal şarkılar. İçsel bir yolculuk için mükemmel.",
        color: "#8b5cf6",
        songs: [
            {
                title: "Someone Like You",
                artist: "Adele",
                genre: "Soul"
            },
            {
                title: "The Night We Met",
                artist: "Lord Huron",
                genre: "Indie Folk"
            },
            {
                title: "Skinny Love",
                artist: "Bon Iver",
                genre: "Indie Folk"
            },
            {
                title: "Mad World",
                artist: "Gary Jules",
                genre: "Alternative"
            },
            {
                title: "Hurt",
                artist: "Johnny Cash",
                genre: "Country"
            },
            {
                title: "Fix You",
                artist: "Coldplay",
                genre: "Alternative Rock"
            },
            {
                title: "Creep",
                artist: "Radiohead",
                genre: "Alternative Rock"
            }
        ]
    },
    
    lofi: {
        name: "Lofi",
        description: "Karlı ve sakin kış günleri için lo-fi beats. Çalışma ve odaklanma için harika.",
        color: "#10b981",
        songs: [
            {
                title: "Snowman",
                artist: "WYS",
                genre: "Lo-fi Hip Hop"
            },
            {
                title: "Let's Go Home",
                artist: "Quickly, Quickly",
                genre: "Lo-fi"
            },
            {
                title: "Rainy Days",
                artist: "Lofi Fruits Music",
                genre: "Lo-fi"
            },
            {
                title: "Coffee",
                artist: "Kainbeats",
                genre: "Lo-fi Hip Hop"
            },
            {
                title: "Moonlight",
                artist: "Jinsang",
                genre: "Lo-fi"
            },
            {
                title: "Warm Nights",
                artist: "Philanthrope",
                genre: "Lo-fi Hip Hop"
            },
            {
                title: "Dreams",
                artist: "Joakim Karud",
                genre: "Lo-fi"
            }
        ]
    }
};

/**
 * Hava durumu kategorilerini mood'lara eşleştiren mapping
 */
const WEATHER_TO_MOOD = {
    'Clear': 'energetic',
    'Clouds': 'chill',
    'Rain': 'melancholic',
    'Drizzle': 'melancholic',
    'Snow': 'lofi',
    'Thunderstorm': 'melancholic',
    'Mist': 'chill',
    'Smoke': 'chill',
    'Haze': 'chill',
    'Dust': 'chill',
    'Fog': 'chill',
    'Sand': 'chill',
    'Ash': 'chill',
    'Squall': 'melancholic',
    'Tornado': 'melancholic'
};
