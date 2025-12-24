# 🎵 MusicMood - API Kurulum Rehberi

Bu rehber, OpenWeatherMap API anahtarını nasıl alacağınızı ve yapılandıracağınızı adım adım açıklar.

## 📋 Gereksinimler

- Bir e-posta adresi
- İnternet bağlantısı
- 5-10 dakika

## 🔑 OpenWeatherMap API Anahtarı Alma

### Adım 1: Hesap Oluşturma

1. [OpenWeatherMap](https://openweathermap.org/) web sitesine gidin
2. Sağ üst köşedeki **"Sign In"** butonuna tıklayın
3. **"Create an Account"** linkine tıklayın
4. Formu doldurun:
   - Username (kullanıcı adı)
   - Email (e-posta)
   - Password (şifre)
5. **"I am 16 years old and over"** kutucuğunu işaretleyin
6. **"I agree with Privacy Policy..."** kutucuğunu işaretleyin
7. **"Create Account"** butonuna tıklayın

### Adım 2: E-posta Doğrulama

1. E-posta adresinizi kontrol edin
2. OpenWeatherMap'ten gelen doğrulama e-postasını açın
3. **"Verify your email"** butonuna tıklayın
4. Hesabınız aktif hale gelecektir

### Adım 3: API Anahtarını Alma

1. OpenWeatherMap'e giriş yapın
2. Sağ üst köşedeki kullanıcı adınıza tıklayın
3. **"My API keys"** seçeneğine tıklayın
4. **"API keys"** sekmesinde varsayılan bir anahtar göreceksiniz
5. Bu anahtarı kopyalayın (örnek: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

**Not**: API anahtarınızın aktif olması 10-15 dakika sürebilir.

### Adım 4: API Anahtarını Test Etme

Tarayıcınızda aşağıdaki URL'yi açın (API_KEY yerine kendi anahtarınızı yazın):

```
https://api.openweathermap.org/data/2.5/weather?q=Istanbul&appid=API_KEY&units=metric&lang=tr
```

Başarılı bir yanıt şöyle görünmelidir:

```json
{
  "coord": {
    "lon": 28.9784,
    "lat": 41.0082
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "açık",
      "icon": "01d"
    }
  ],
  ...
}
```

## 🔧 Uygulamada Yapılandırma

### Adım 1: app.js Dosyasını Açın

Proje klasöründeki `app.js` dosyasını bir metin editörü ile açın.

### Adım 2: API Anahtarını Ekleyin

Dosyanın başında `CONFIG` nesnesini bulun:

```javascript
const CONFIG = {
    API_KEY: 'YOUR_API_KEY_HERE',  // ← Bu satırı değiştirin
    API_BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
    UNITS: 'metric',
    LANG: 'tr'
};
```

`YOUR_API_KEY_HERE` yerine kendi API anahtarınızı yapıştırın:

```javascript
const CONFIG = {
    API_KEY: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',  // ← Kendi anahtarınız
    API_BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
    UNITS: 'metric',
    LANG: 'tr'
};
```

### Adım 3: Dosyayı Kaydedin

Değişiklikleri kaydedin (Ctrl+S veya Cmd+S).

## ✅ Test Etme

1. Uygulamayı bir web sunucusu ile çalıştırın:
   ```bash
   python -m http.server 8000
   ```

2. Tarayıcınızda `http://localhost:8000` adresine gidin

3. Bir şehir adı girin (örn: "Istanbul")

4. "Ara" butonuna tıklayın

5. Hava durumu ve müzik önerileri görünmelidir ✨

## 🚨 Sık Karşılaşılan Hatalar

### Hata 1: "API anahtarı yapılandırılmamış"

**Neden**: API anahtarı hala `YOUR_API_KEY_HERE` olarak ayarlanmış.

**Çözüm**: Yukarıdaki adımları takip ederek gerçek API anahtarınızı ekleyin.

---

### Hata 2: "API anahtarı geçersiz"

**Neden**: 
- API anahtarı yanlış kopyalanmış
- API anahtarı henüz aktif olmamış

**Çözüm**: 
- API anahtarını tekrar kontrol edin
- 10-15 dakika bekleyin ve tekrar deneyin
- OpenWeatherMap hesabınızda anahtarın aktif olduğunu kontrol edin

---

### Hata 3: "Şehir bulunamadı"

**Neden**: Şehir adı yanlış yazılmış veya tanınmıyor.

**Çözüm**: 
- Şehir adını doğru yazdığınızdan emin olun
- Büyük şehirleri deneyin (Istanbul, Ankara, Izmir)
- İngilizce yazım deneyin (Istanbul yerine Istanbul)

---

### Hata 4: "İnternet bağlantınızı kontrol edin"

**Neden**: İnternet bağlantısı yok veya API erişilemiyor.

**Çözüm**: 
- İnternet bağlantınızı kontrol edin
- Firewall/proxy ayarlarınızı kontrol edin
- VPN kullanıyorsanız kapatıp deneyin

## 📊 API Kullanım Limitleri

**Ücretsiz Plan**:
- ✅ 60 çağrı/dakika
- ✅ 1,000,000 çağrı/ay
- ✅ Güncel hava durumu
- ✅ 5 günlük tahmin

Bu limitler normal kullanım için fazlasıyla yeterlidir.

## 🔒 Güvenlik İpuçları

### ⚠️ YAPMAYIN:
- ❌ API anahtarınızı GitHub'a yüklemeyin
- ❌ API anahtarınızı başkalarıyla paylaşmayın
- ❌ API anahtarınızı public bir yerde yayınlamayın

### ✅ YAPIN:
- ✅ API anahtarınızı güvenli bir yerde saklayın
- ✅ Production'da backend kullanın
- ✅ Environment variables kullanın
- ✅ API kullanımınızı düzenli kontrol edin

## 🔄 API Anahtarını Yenileme

Eğer API anahtarınız ifşa olduysa:

1. [OpenWeatherMap](https://home.openweathermap.org/api_keys) API Keys sayfasına gidin
2. Eski anahtarı silin
3. **"Generate"** butonuna tıklayarak yeni anahtar oluşturun
4. Yeni anahtarı `app.js` dosyasında güncelleyin

## 📚 Ek Kaynaklar

- [OpenWeatherMap API Dokümantasyonu](https://openweathermap.org/api)
- [API Kullanım Örnekleri](https://openweathermap.org/current)
- [Hava Durumu Kodları](https://openweathermap.org/weather-conditions)

## 💡 İpuçları

1. **API Anahtarını Test Edin**: Uygulamada kullanmadan önce tarayıcıda test edin
2. **Cache Kullanın**: Aynı şehir için sık sık istek atmayın
3. **Hata Yönetimi**: Kullanıcıya anlamlı hata mesajları gösterin
4. **Rate Limiting**: Çok fazla istek atmaktan kaçının

## 🎯 Sonraki Adımlar

API anahtarınızı başarıyla yapılandırdıktan sonra:

1. ✅ Farklı şehirleri deneyin
2. ✅ Hava durumlarına göre farklı mood'ları keşfedin
3. ✅ Kendi şarkılarınızı playlist'lere ekleyin
4. ✅ Tasarımı özelleştirin

---

Herhangi bir sorunla karşılaşırsanız, lütfen bir issue açın! 🚀

**Keyifli kodlamalar!** 💻✨
