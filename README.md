# Paywant Node.js Entegrasyonu

Paywant ödeme sistemini Node.js projelerine kolayca entegre etmek için hazırlanmış basit ve hafif bir örnek/kütüphane.

Bu proje, Paywant'ın **API** ve **callback (bildirim)** mekanizmasını kullanarak ödeme işlemlerini yönetmeye yardımcı olur. Özellikle oyun siteleri, freelance hizmetler veya dijital ürün satışlarında sık kullanılan Paywant altyapısına odaklanır.

## Özellikler

- Paywant API ile ödeme linki oluşturma / yönlendirme
- Paywant callback (dönen bildirim) doğrulama ve işleme
- Basit ve anlaşılır kod yapısı
- Kolay özelleştirilebilir

## Kurulum

1. Repoyu klonlayın:
   ```bash
   git clone https://github.com/codedByCan/Paywant_NodeJS.git
   cd Paywant_NodeJS
   ```

2. Bağımlılıkları yükleyin (eğer package.json varsa):
   ```bash
   npm install
   ```
   *(Genellikle `express`, `body-parser`, `crypto` gibi temel paketler yeterlidir)*

3. `.env` dosyası oluşturun ve Paywant bilgilerinizi ekleyin:

   ```env
   # .env
   PAYWANT_API_KEY=your_paywant_api_key
   PAYWANT_SECRET_KEY=your_paywant_secret_key
   PAYWANT_MERCHANT_ID=your_merchant_id
   
   # Opsiyonel
   PORT=3000
   SUCCESS_URL=http://localhost:3000/success
   FAIL_URL=http://localhost:3000/fail
   CALLBACK_URL=http://yourdomain.com/paywant/callback
   ```

## Kullanım

### 1. Ödeme Başlatma (Örnek: app.js)

```js
const express = require('express');
const app = express();
const Paywant = require('./paywant');

app.get('/odeme-baslat', async (req, res) => {
  try {
    const odemeBilgileri = {
      urunAdi: 'VIP Üyelik - 30 Gün',
      tutar: 50,                // TL cinsinden
      kullaniciAdi: 'kullanici123',
      email: 'ornek@email.com',
      ekstraVeri: 'user_id=1456',
      // ... diğer Paywant parametreleri
    };

    const odemeLinki = await Paywant.odemeOlustur(odemeBilgileri);
    res.redirect(odemeLinki);
  } catch (err) {
    res.status(500).send('Ödeme başlatılamadı: ' + err.message);
  }
});
```

### 2. Callback (Bildirim) İşleme (paywant.js içinde genellikle)

Paywant ödeme tamamlandığında bu adrese POST isteği atar:

```js
app.post('/paywant/callback', express.urlencoded({ extended: true }), (req, res) => {
  const sonuc = Paywant.callbackDogrula(req.body);

  if (sonuc.dogrulanmis) {
    // Ödeme başarılı → kullanıcıya ürünü ver
    console.log('Başarılı ödeme:', sonuc.extra_data);
    // TODO: Veritabanına yaz, kredi ekle vs.
    res.send('OK');
  } else {
    console.log('Geçersiz/başarısız ödeme');
    res.send('OK'); // Paywant'a mutlaka OK dönülmeli!
  }
});
```

## Dosya Yapısı

```
Paywant_NodeJS/
├── app.js          # Ana Express uygulaması (sunucu başlatma + route'lar)
├── paywant.js      # Paywant API ve callback yardımcı fonksiyonları
├── .env.example    # Örnek environment dosyası (isteğe bağlı)
└── README.md
```

## Paywant Resmi Kaynakları

- Paywant Geliştirici Dökümantasyonu: https://developer.paywant.com/
- Paywant Panel: https://www.paywant.com/

## Güvenlik Notları

- **Asla** API key ve secret key'leri Git'e commit etmeyin.
- Callback'leri doğrulamak için mutlaka hash kontrolü yapın.
- Production ortamında HTTPS kullanın.

## Katkıda Bulunma

Pull request'ler hoş karşılanır! Özellikle şu konularda katkı bekleniyor:

- Daha kapsamlı hata yönetimi
- TypeScript desteği
- Örnek veritabanı entegrasyonu (MongoDB / MySQL)
- Testler eklenmesi

## Lisans

MIT License – özgürce kullanabilir, değiştirebilir ve dağıtabilirsiniz.
```

Bu README hem yeni başlayanlar hem de deneyimli geliştiriciler için yeterince açıklayıcı. İstersen daha fazla örnek kod, badge'ler (stars, license vs.), logo veya Türkçe/İngilizce çift dil desteği ekleyebiliriz. Ne dersin, bir şey değiştirelim mi? 😊
