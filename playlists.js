/**
 * PLAYLISTS DATA - EXPANDED VERSION
 * Hava durumuna göre kategorize edilmiş geniş müzik koleksiyonu
 * Her aramada farklı şarkılar göstermek için 30+ şarkı içerir
 */

const PLAYLISTS = {
    energetic: {
        name: "Energetic",
        description: "Güneşli ve açık havalar için enerjik şarkılar. Gününüze pozitif enerji katacak parçalar.",
        color: "#f59e0b",
        songs: [
            { title: "Blinding Lights", artist: "The Weeknd", genre: "Synthpop" },
            { title: "Levitating", artist: "Dua Lipa", genre: "Disco-Pop" },
            { title: "Don't Start Now", artist: "Dua Lipa", genre: "Nu-Disco" },
            { title: "Good 4 U", artist: "Olivia Rodrigo", genre: "Pop Rock" },
            { title: "Heat Waves", artist: "Glass Animals", genre: "Indie Pop" },
            { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", genre: "Funk" },
            { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", genre: "Pop" },
            { title: "Happy", artist: "Pharrell Williams", genre: "Pop" },
            { title: "Shut Up and Dance", artist: "Walk the Moon", genre: "Alternative Rock" },
            { title: "Walking on Sunshine", artist: "Katrina and the Waves", genre: "Pop Rock" },
            { title: "Mr. Blue Sky", artist: "Electric Light Orchestra", genre: "Rock" },
            { title: "September", artist: "Earth, Wind & Fire", genre: "Funk" },
            { title: "I Gotta Feeling", artist: "Black Eyed Peas", genre: "Pop" },
            { title: "Dynamite", artist: "BTS", genre: "Disco-Pop" },
            { title: "Shake It Off", artist: "Taylor Swift", genre: "Pop" },
            { title: "24K Magic", artist: "Bruno Mars", genre: "Funk" },
            { title: "Treasure", artist: "Bruno Mars", genre: "Funk" },
            { title: "Counting Stars", artist: "OneRepublic", genre: "Pop Rock" },
            { title: "On Top of the World", artist: "Imagine Dragons", genre: "Alternative Rock" },
            { title: "Best Day of My Life", artist: "American Authors", genre: "Indie Pop" },
            { title: "Good Time", artist: "Owl City & Carly Rae Jepsen", genre: "Pop" },
            { title: "Firework", artist: "Katy Perry", genre: "Pop" },
            { title: "Roar", artist: "Katy Perry", genre: "Pop" },
            { title: "Feel It Still", artist: "Portugal. The Man", genre: "Alternative Rock" },
            { title: "High Hopes", artist: "Panic! At The Disco", genre: "Pop Rock" },
            { title: "Sucker", artist: "Jonas Brothers", genre: "Pop Rock" },
            { title: "Dance Monkey", artist: "Tones and I", genre: "Pop" },
            { title: "Sunflower", artist: "Post Malone & Swae Lee", genre: "Hip Hop" },
            { title: "Juice", artist: "Lizzo", genre: "Pop" },
            { title: "Truth Hurts", artist: "Lizzo", genre: "Pop" }
        ]
    },

    chill: {
        name: "Chill",
        description: "Bulutlu ve sakin havalar için rahatlatıcı müzikler. Huzurlu bir atmosfer için ideal.",
        color: "#3b82f6",
        songs: [
            { title: "Weightless", artist: "Marconi Union", genre: "Ambient" },
            { title: "Sunset Lover", artist: "Petit Biscuit", genre: "Electronic" },
            { title: "Ocean Eyes", artist: "Billie Eilish", genre: "Indie Pop" },
            { title: "Electric Feel", artist: "MGMT", genre: "Psychedelic Pop" },
            { title: "Breathe Me", artist: "Sia", genre: "Art Pop" },
            { title: "Holocene", artist: "Bon Iver", genre: "Indie Folk" },
            { title: "Midnight City", artist: "M83", genre: "Synth-pop" },
            { title: "Intro", artist: "The xx", genre: "Indie Pop" },
            { title: "Teardrop", artist: "Massive Attack", genre: "Trip Hop" },
            { title: "Porcelain", artist: "Moby", genre: "Electronic" },
            { title: "Fade Into You", artist: "Mazzy Star", genre: "Dream Pop" },
            { title: "Dreams", artist: "Fleetwood Mac", genre: "Soft Rock" },
            { title: "Landslide", artist: "Fleetwood Mac", genre: "Soft Rock" },
            { title: "The Less I Know The Better", artist: "Tame Impala", genre: "Psychedelic Pop" },
            { title: "Lost in Yesterday", artist: "Tame Impala", genre: "Psychedelic Pop" },
            { title: "Feels Like We Only Go Backwards", artist: "Tame Impala", genre: "Psychedelic Pop" },
            { title: "Slow Dancing in the Dark", artist: "Joji", genre: "R&B" },
            { title: "Sanctuary", artist: "Joji", genre: "R&B" },
            { title: "Lovely", artist: "Billie Eilish & Khalid", genre: "Pop" },
            { title: "idontwannabeyouanymore", artist: "Billie Eilish", genre: "Alternative" },
            { title: "8TEEN", artist: "Khalid", genre: "R&B" },
            { title: "Location", artist: "Khalid", genre: "R&B" },
            { title: "Young Dumb & Broke", artist: "Khalid", genre: "R&B" },
            { title: "Strawberries & Cigarettes", artist: "Troye Sivan", genre: "Pop" },
            { title: "Youth", artist: "Troye Sivan", genre: "Pop" },
            { title: "Riptide", artist: "Vance Joy", genre: "Indie Folk" },
            { title: "Budapest", artist: "George Ezra", genre: "Indie Folk" },
            { title: "Home", artist: "Daughter", genre: "Indie Folk" },
            { title: "To Build a Home", artist: "The Cinematic Orchestra", genre: "Trip Hop" },
            { title: "Bloom", artist: "The Paper Kites", genre: "Indie Folk" }
        ]
    },

    melancholic: {
        name: "Melancholic",
        description: "Yağmurlu ve kasvetli günler için duygusal şarkılar. İçsel bir yolculuk için mükemmel.",
        color: "#8b5cf6",
        songs: [
            { title: "Someone Like You", artist: "Adele", genre: "Soul" },
            { title: "The Night We Met", artist: "Lord Huron", genre: "Indie Folk" },
            { title: "Skinny Love", artist: "Bon Iver", genre: "Indie Folk" },
            { title: "Mad World", artist: "Gary Jules", genre: "Alternative" },
            { title: "Hurt", artist: "Johnny Cash", genre: "Country" },
            { title: "Fix You", artist: "Coldplay", genre: "Alternative Rock" },
            { title: "Creep", artist: "Radiohead", genre: "Alternative Rock" },
            { title: "The Scientist", artist: "Coldplay", genre: "Alternative Rock" },
            { title: "Hallelujah", artist: "Jeff Buckley", genre: "Alternative Rock" },
            { title: "Black", artist: "Pearl Jam", genre: "Grunge" },
            { title: "Nutshell", artist: "Alice in Chains", genre: "Grunge" },
            { title: "Something in the Way", artist: "Nirvana", genre: "Grunge" },
            { title: "Tears in Heaven", artist: "Eric Clapton", genre: "Soft Rock" },
            { title: "Nothing Compares 2 U", artist: "Sinéad O'Connor", genre: "Pop" },
            { title: "Everybody Hurts", artist: "R.E.M.", genre: "Alternative Rock" },
            { title: "Fake Plastic Trees", artist: "Radiohead", genre: "Alternative Rock" },
            { title: "No Surprises", artist: "Radiohead", genre: "Alternative Rock" },
            { title: "How to Disappear Completely", artist: "Radiohead", genre: "Alternative Rock" },
            { title: "Exit Music (For a Film)", artist: "Radiohead", genre: "Alternative Rock" },
            { title: "Bloodstream", artist: "Bon Iver", genre: "Indie Folk" },
            { title: "Re: Stacks", artist: "Bon Iver", genre: "Indie Folk" },
            { title: "Flume", artist: "Bon Iver", genre: "Indie Folk" },
            { title: "All I Want", artist: "Kodaline", genre: "Indie Rock" },
            { title: "High and Dry", artist: "Radiohead", genre: "Alternative Rock" },
            { title: "Cosmic Love", artist: "Florence + The Machine", genre: "Indie Rock" },
            { title: "Shake It Out", artist: "Florence + The Machine", genre: "Indie Rock" },
            { title: "Skinny Love", artist: "Birdy", genre: "Indie Pop" },
            { title: "Let Her Go", artist: "Passenger", genre: "Folk" },
            { title: "Say Something", artist: "A Great Big World & Christina Aguilera", genre: "Pop" },
            { title: "When We Were Young", artist: "Adele", genre: "Soul" }
        ]
    },

    lofi: {
        name: "Lofi",
        description: "Karlı ve sakin kış günleri için lo-fi beats. Çalışma ve odaklanma için harika.",
        color: "#10b981",
        songs: [
            { title: "Snowman", artist: "WYS", genre: "Lo-fi Hip Hop" },
            { title: "Let's Go Home", artist: "Quickly, Quickly", genre: "Lo-fi" },
            { title: "Rainy Days", artist: "Lofi Fruits Music", genre: "Lo-fi" },
            { title: "Coffee", artist: "Kainbeats", genre: "Lo-fi Hip Hop" },
            { title: "Moonlight", artist: "Jinsang", genre: "Lo-fi" },
            { title: "Warm Nights", artist: "Philanthrope", genre: "Lo-fi Hip Hop" },
            { title: "Dreams", artist: "Joakim Karud", genre: "Lo-fi" },
            { title: "Affection", artist: "Jinsang", genre: "Lo-fi" },
            { title: "Summer", artist: "Jinsang", genre: "Lo-fi" },
            { title: "Solitude", artist: "Jinsang", genre: "Lo-fi" },
            { title: "Bliss", artist: "Philanthrope", genre: "Lo-fi Hip Hop" },
            { title: "Meadow", artist: "Philanthrope", genre: "Lo-fi Hip Hop" },
            { title: "Lullaby", artist: "Idealism", genre: "Lo-fi" },
            { title: "Hiraeth", artist: "Idealism", genre: "Lo-fi" },
            { title: "Nagashi", artist: "Idealism", genre: "Lo-fi" },
            { title: "Snowfall", artist: "Øneheart", genre: "Lo-fi" },
            { title: "Watching the Clouds", artist: "Øneheart", genre: "Lo-fi" },
            { title: "Snowman", artist: "Øneheart", genre: "Lo-fi" },
            { title: "Aruarian Dance", artist: "Nujabes", genre: "Lo-fi Hip Hop" },
            { title: "Feather", artist: "Nujabes", genre: "Lo-fi Hip Hop" },
            { title: "Luv(sic) pt. 2", artist: "Nujabes", genre: "Lo-fi Hip Hop" },
            { title: "Reflection Eternal", artist: "Nujabes", genre: "Lo-fi Hip Hop" },
            { title: "Shiki no Uta", artist: "Nujabes", genre: "Lo-fi Hip Hop" },
            { title: "Mystline", artist: "Nujabes", genre: "Lo-fi Hip Hop" },
            { title: "Homework Edit", artist: "SwuM", genre: "Lo-fi" },
            { title: "Snowman", artist: "Powfu", genre: "Lo-fi Hip Hop" },
            { title: "Death Bed", artist: "Powfu", genre: "Lo-fi Hip Hop" },
            { title: "Laying on My Porch", artist: "Powfu", genre: "Lo-fi Hip Hop" },
            { title: "I'll Come Back to You", artist: "Powfu", genre: "Lo-fi Hip Hop" },
            { title: "Breakfast", artist: "Chillhop Music", genre: "Lo-fi" }
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

/**
 * Diziyi karıştırır (Fisher-Yates shuffle algoritması)
 * @param {Array} array - Karıştırılacak dizi
 * @returns {Array} - Karıştırılmış dizi
 */
function shuffleArray(array) {
    const shuffled = [...array]; // Orijinal diziyi değiştirmemek için kopyala
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
