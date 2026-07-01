# Chatbot Otomasyon Testi

Bu proje, https://shipeedylojistiktest.arkas.com/yardim üzerinde bulunan chatbot'un işlevselliğini test etmek ve olası hataları otomatik olarak raporlamak için Playwright kullanılarak geliştirilmiştir.

## İçindekiler
- [Kurulum](#kurulum)
- [Yapılandırma](#yapılandırma)
- [Çalıştırma](#çalıştırma)
- [Zamanlanmış Görevler](#zamanlanmış-görevler)

## Kurulum
Bilgisayarınızda Node.js yüklü olduğundan emin olun.
1. Projeyi bilgisayarınıza klonlayın:
   `https://github.com/Goktugormanli/chatbot-otomasyon-test.git`
2. Gerekli paketleri yükleyin:
   `npm install`
3. Playwright tarayıcılarını yükleyin:
   `npx playwright install`

## Yapılandırma
Proje kök dizininde bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri tanımlayın:
- `TARGET_URL`: Test edilecek web sitesi adresi.
- `TEST_MESSAGE`: Chatbota gönderilecek örnek metin.
- `WAIT_TIMEOUT`: Yanıt bekleme süresi (milisaniye).
- `ERROR_KEYWORDS`: Hata olarak kabul edilecek anahtar kelimeler (regex formatında).
- `ERROR_MESSAGE`: Ön uyarı mesajı.

## Çalıştırma
- **Manuel Çalıştırma:** Proje klasöründeki `test-calistir.bat` dosyasına çift tıklayarak testi manuel olarak başlatabilirsiniz.
- **Test Sonuçları:** Test tamamlandığında `playwright-report/index.html` dosyası üzerinden detaylı rapora ulaşabilirsiniz.

## Zamanlanmış Görevler
Windows Görev Zamanlayıcı (Task Scheduler) kullanarak `test-calistir.bat` dosyasını günlük belirli saatlerde otomatik çalışacak şekilde yapılandırabilirsiniz. Test başarısız olursa sistem ekrana bir uyarı mesajı (pop-up) çıkaracaktır.

---
Geliştirici: Göktuğ Ormanlı
