/**
 * AI RECOMMENDATIONS SERVICE
 * OpenAI API kullanarak akıllı müzik önerileri ve açıklamaları üretir
 */

let OpenAI;
let openai;

// OpenAI SDK'yı yüklemeyi dene
try {
    OpenAI = require('openai');
    // OpenAI client'ı başlat
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        console.log('✅ OpenAI SDK yüklendi');
    } else {
        console.warn('⚠️ OPENAI_API_KEY bulunamadı, fallback açıklamalar kullanılacak');
    }
} catch (error) {
    console.warn('⚠️ OpenAI SDK yüklenemedi, fallback açıklamalar kullanılacak');
    console.warn('   Hata:', error.message);
}

/**
 * Hava durumu ve mood bilgisine göre AI destekli açıklama üretir
 * @param {Object} params - Parametreler
 * @param {string} params.city - Şehir adı
 * @param {string} params.weather - Hava durumu (Clear, Rain, Snow, vb.)
 * @param {number} params.temperature - Sıcaklık (Celsius)
 * @param {string} params.mood - Mood kategorisi (energetic, chill, melancholic, lofi)
 * @param {Array} params.songs - Önerilen şarkılar listesi
 * @returns {Promise<Object>} - AI tarafından üretilen açıklama ve öneriler
 */
async function generateMusicRecommendation(params) {
    const { city, weather, temperature, mood, songs } = params;

    // OpenAI yüklü değilse direkt fallback döndür
    if (!openai) {
        return {
            success: false,
            explanation: getFallbackExplanation(mood, weather, temperature),
            mood: mood,
            weatherContext: {
                city,
                weather,
                temperature
            },
            error: 'OpenAI SDK not available'
        };
    }

    try {
        // Şarkı listesini formatla
        const songList = songs.slice(0, 5).map((song, index) =>
            `${index + 1}. ${song.title} - ${song.artist} (${song.genre})`
        ).join('\n');

        // Türkçe prompt oluştur
        const prompt = `Sen bir müzik uzmanısın. Aşağıdaki bilgilere göre kullanıcıya müzik önerileri hakkında kısa ve etkileyici bir açıklama yap:

Şehir: ${city}
Hava Durumu: ${weather}
Sıcaklık: ${temperature}°C
Ruh Hali Kategorisi: ${mood}

Önerilen İlk 5 Şarkı:
${songList}

Lütfen şunları yap:
1. Bu hava durumunun neden bu tür müziklerle uyumlu olduğunu açıkla (2-3 cümle)
2. Bu şarkıların bu hava durumunda neden dinlenmesi gerektiğini anlat (2-3 cümle)
3. Kullanıcıya bu müzikleri dinlerken yapabileceği aktiviteler öner (1-2 cümle)

Yanıtını samimi, dostça ve ilham verici bir dille yaz. Maksimum 150 kelime kullan.`;

        // OpenAI API'ye istek gönder
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Sen müzik ve ruh hali konusunda uzman, samimi ve ilham verici bir asistansın. Kullanıcılara hava durumuna göre müzik önerileri yapıyorsun."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.8,
            max_tokens: 300
        });

        const aiExplanation = completion.choices[0].message.content.trim();

        return {
            success: true,
            explanation: aiExplanation,
            mood: mood,
            weatherContext: {
                city,
                weather,
                temperature
            }
        };

    } catch (error) {
        console.error('OpenAI API Error:', error);

        // Hata durumunda fallback açıklama döndür
        return {
            success: false,
            explanation: getFallbackExplanation(mood, weather, temperature),
            mood: mood,
            weatherContext: {
                city,
                weather,
                temperature
            },
            error: error.message
        };
    }
}

/**
 * AI kullanılamadığında fallback açıklama üretir
 * @param {string} mood - Mood kategorisi
 * @param {string} weather - Hava durumu
 * @param {number} temperature - Sıcaklık
 * @returns {string} - Fallback açıklama
 */
function getFallbackExplanation(mood, weather, temperature) {
    const explanations = {
        energetic: `${temperature}°C'de ${getWeatherDescription(weather)} havasında enerjik müzikler dinlemek için harika bir gün! Bu hava durumu, pozitif enerjili şarkılarla mükemmel uyum sağlıyor. Tempolu ritimler ve neşeli melodiler, gününüze ekstra bir canlılık katacak. Açık havada yürüyüş yaparken veya spor yaparken bu şarkıları dinlemenizi öneririz.`,

        chill: `${temperature}°C'de ${getWeatherDescription(weather)} havası, rahatlatıcı müzikler için ideal bir atmosfer yaratıyor. Bu sakin hava durumu, yumuşak melodiler ve huzur verici ritimlere mükemmel bir zemin oluşturuyor. Kahvenizi yudumlarken veya kitap okurken bu şarkılar size eşlik etsin. Kendinize zaman ayırın ve bu müziklerin tadını çıkarın.`,

        melancholic: `${temperature}°C'de ${getWeatherDescription(weather)} havası, duygusal bir müzik yolculuğu için mükemmel. Bu hava durumu, derin ve anlamlı şarkılarla harika bir uyum içinde. Melankolik melodiler, içsel bir keşif için size eşlik edecek. Pencereden dışarı bakarken veya günlük yazarken bu şarkıları dinleyin ve duygularınıza dokunmasına izin verin.`,

        lofi: `${temperature}°C'de ${getWeatherDescription(weather)} havası, lo-fi müzikler için ideal bir ortam sunuyor. Bu sakin atmosfer, odaklanma ve rahatlama için mükemmel bir zemin oluşturuyor. Yumuşak beatler ve minimalist melodiler, çalışırken veya dinlenirken size eşlik edecek. Sıcak bir içecekle bu müziklerin tadını çıkarın ve anın keyfini sürün.`
    };

    return explanations[mood] || explanations.chill;
}

/**
 * Hava durumu kodunu Türkçe açıklamaya çevirir
 * @param {string} weather - Hava durumu kodu
 * @returns {string} - Türkçe açıklama
 */
function getWeatherDescription(weather) {
    const descriptions = {
        'Clear': 'açık ve güneşli',
        'Clouds': 'bulutlu',
        'Rain': 'yağmurlu',
        'Drizzle': 'çiseleyen',
        'Snow': 'karlı',
        'Thunderstorm': 'fırtınalı',
        'Mist': 'sisli',
        'Fog': 'sisli',
        'Haze': 'puslu'
    };

    return descriptions[weather] || 'değişken';
}

/**
 * Belirli şarkılar için AI destekli açıklama üretir
 * @param {Array} songs - Şarkı listesi
 * @param {string} mood - Mood kategorisi
 * @returns {Promise<Object>} - Şarkı açıklamaları
 */
async function generateSongInsights(songs, mood) {
    // OpenAI yüklü değilse fallback döndür
    if (!openai) {
        return {
            success: false,
            insights: 'Bu şarkılar, seçilen ruh hali için özenle seçilmiştir.',
            error: 'OpenAI SDK not available'
        };
    }

    try {
        const songList = songs.slice(0, 3).map((song, index) =>
            `${index + 1}. ${song.title} - ${song.artist}`
        ).join('\n');

        const prompt = `Bu ${mood} ruh hali için önerilen şarkılar hakkında kısa ve ilginç bilgiler ver:

${songList}

Her şarkı için:
- Neden bu ruh haline uygun olduğunu açıkla
- Şarkının öne çıkan özelliğini belirt

Maksimum 100 kelime kullan.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Sen müzik konusunda bilgili ve ilham verici bir asistansın."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 200
        });

        return {
            success: true,
            insights: completion.choices[0].message.content.trim()
        };

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return {
            success: false,
            insights: 'Bu şarkılar, seçilen ruh hali için özenle seçilmiştir.',
            error: error.message
        };
    }
}

module.exports = {
    generateMusicRecommendation,
    generateSongInsights,
    getFallbackExplanation
};
