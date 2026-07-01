![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)

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
- `WAIT_TIMEOUT`: Yanıt bekleme süresi (milisaniye).

## Çalıştırma
- **Manuel Çalıştırma:** Proje klasöründeki `test-calistir.bat` dosyasına çift tıklayarak testi manuel olarak başlatabilirsiniz.
- **Test Sonuçları:** - Test tamamlandığında `playwright-report/index.html` dosyası üzerinden detaylı görsele sahip rapora ulaşabilirsiniz.
- Test süreçleri ve hata kayıtları anlık olarak `test.log.txt` dosyasına işlenmektedir; geçmiş kayıtları buradan inceleyebilirsiniz.
## Zamanlanmış Görevler
Windows Görev Zamanlayıcı (Task Scheduler) kullanarak `test-calistir.bat` dosyasını günlük belirli saatlerde otomatik çalışacak şekilde yapılandırabilirsiniz. 
---
Geliştirici: Göktuğ Ormanlı
