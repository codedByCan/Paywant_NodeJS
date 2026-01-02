const express = require('express');
const Paywant = require('./paywant'); // Modülü dahil et

const app = express();

// Paywant bildirimleri x-www-form-urlencoded olarak gönderir
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Paywant Ayarları
const paywant = new Paywant({
  apiKey: 'API_KEYINIZ_BURAYA',       // Paywant panelinden alın
  apiSecret: 'API_SECRET_KEYINIZ_BURAYA' // Paywant panelinden alın
});

// ---------------------------------------------------------
// 2. Ödeme Oluşturma Rotası (Kullanıcı "Öde"ye basınca çalışır)
// ---------------------------------------------------------
app.get('/api/payment/create', async (req, res) => {
  try {
    const siparisNo = 'SIP_' + Date.now(); // Benzersiz sipariş no
    
    const result = await paywant.createPayment({
      userID: '12345',               // Sitenizdeki Üye ID (int olmalı)
      userEmail: 'musteri@site.com', // Müşteri Email
      userAccountName: 'ahmet123',   // Müşteri Kullanıcı Adı (yoksa email yazın)
      userIp: '127.0.0.1',           // Müşteri IP Adresi (req.ip'den alınmalı)
      
      productData: {
        name: 'Premium Üyelik',      // Ürün Adı
        amount: 50.00,               // Tutar (TL)
        extraData: siparisNo,        // Sipariş numarasını buraya koyuyoruz!
        commissionType: '1',         // 1: Komisyonu Müşteri öder, 2: Biz öderiz
        paymentChannel: '0'          // 0: Hepsi açık
      }
    });

    console.log('Ödeme Linki Oluşturuldu:', result.link);
    
    // Kullanıcıyı Paywant ödeme sayfasına yönlendir
    res.redirect(result.link);

  } catch (error) {
    console.error('Ödeme Oluşturma Hatası:', error.message);
    res.status(500).send('Ödeme başlatılamadı: ' + error.message);
  }
});

// ---------------------------------------------------------
// 3. Callback (Bildirim) Rotası (Paywant buraya POST atar)
// ---------------------------------------------------------
app.post('/api/payment/callback', (req, res) => {
  try {
    console.log('Paywant Bildirimi Geldi:', req.body);

    // Hash doğrulaması yap
    const verification = paywant.verifyCallback(req.body);

    if (verification.success) {
      // Ödeme Başarılı!
      const siparisNo = verification.orderId; // extraData'dan gelir
      const odenenTutar = verification.amount;

      console.log(`Sipariş ONAYLANDI. No: ${siparisNo}, Tutar: ${odenenTutar}`);

      // BURADA VERİTABANI GÜNCELLEMESİ YAPIN (Siparişi onayla, bakiyeyi ekle vb.)

      // Paywant'a işlemin başarılı olduğunu bildirmek için "OK" dönüyoruz
      res.send('OK');
    } else {
      // Ödeme başarısız (Status 100 değilse)
      console.log('Ödeme başarısız durumu.');
      res.send('OK'); // Yine de OK dönmek gerekebilir, loglara bakın.
    }

  } catch (error) {
    // Hash tutmazsa buraya düşer
    console.error('Güvenlik Hatası:', error.message);
    res.status(400).send('BAD_HASH');
  }
});

app.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor...');
});
