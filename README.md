![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Gmail](https://img.shields.io/badge/Gmail-EA4335?style=for-the-badge&logo=gmail&logoColor=white)

# Chatbot Otomasyon Testi

Bu proje, https://shipeedylojistiktest.arkas.com/yardim adresinde bulunan chatbot'un işlevselliğini test etmek ve olası hataları otomatik olarak raporlamak için **Playwright** kullanılarak geliştirilmiştir. Test başarısız olduğunda, detaylı hata raporları otomatik olarak **Email** ile gönderilebilir.

## 🎯 Özellikler

- ✅ **Otomatik Chatbot Testleri** - Playwright ile web test otomasyonu
- ✅ **Otomatik Email Bildirimi** - Test başarısız olduğunda otomatik email gönderimi
- ✅ **PDF Rapor Oluşturma** - Test sonuçlarının profesyonel PDF raporunda sunumu
- ✅ **Screenshot'lar** - Hata anında alınan ekran görüntüleri
- ✅ **Detaylı Hata Mesajları** - Test hatalarının tam açıklaması
- ✅ **Log Dosyaları** - Tüm test işlemlerinin kaydı

## 📋 İçindekiler

- [Kurulum](#kurulum)
- [Yapılandırma](#yapılandırma)
- [Çalıştırma](#çalıştırma)
- [Email Bildirimi](#email-bildirimi)
- [Zamanlanmış Görevler](#zamanlanmış-görevler)
- [Dosya Yapısı](#dosya-yapısı)

## 🚀 Kurulum

### Ön Gereksinimler
- Node.js (v14 veya üzeri)
- npm paket yöneticisi

### Kurulum Adımları

1. **Projeyi Klonlayın:**
   ```bash
   git clone https://github.com/Goktugormanli/chatbot-otomasyon-test.git
   cd chatbot-otomasyon-test
   ```

2. **Gerekli Paketleri Yükleyin:**
   ```bash
   npm install
   ```

3. **Playwright Tarayıcılarını Yükleyin:**
   ```bash
   npx playwright install
   ```

## ⚙️ Yapılandırma

### .env Dosyası Oluşturma

Proje kök dizininde `.env` dosyası oluşturun ve aşağıdaki değişkenleri tanımlayın:

```env
# Test Yapılandırması
TARGET_URL=https://shipeedylojistiktest.arkas.com/yardim
WAIT_TIMEOUT=15000

# Email Yapılandırması (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_TO=recipient@example.com

# Rapor Yapılandırması
REPORT_PATH=file:///c:/Users/username/Desktop/chatbot-otomasyon-test/playwright-report/index.html
```

### Gmail App Password Oluşturma

1. Google Hesabınıza Giriş Yapın: https://myaccount.google.com
2. **Güvenlik** bölümüne gelin
3. **2 Adımlı Doğrulamayı** etkinleştirin (eğer etkin değilse)
4. **Uygulama Şifrelerine** gelin
5. Uygulama olarak **Mail**, Cihaz olarak **Windows Bilgisayar** seçin
6. Oluşturulan 16 karakterli şifreyi `.env` dosyasında `MAIL_PASS` olarak girin

## 🏃 Çalıştırma

### Manuel Test Çalıştırması

Proje klasöründeki `test-calistir.bat` dosyasına **çift tıklayarak** testi başlatabilirsiniz.

```cmd
test-calistir.bat
```

### Test Komut Satırından Çalıştırma

```bash
# Tüm testleri çalıştır
npx playwright test

# Belirli bir test dosyasını çalıştır
npx playwright test tests/example.spec.ts

# Başlı başına modda çalıştır (tarayıcı görünür)
npx playwright test --headed

# Raporu açın
npx playwright show-report
```

## 📧 Email Bildirimi

Test başarısız olduğunda otomatik olarak email gönderilir. Email şunları içerir:

- 🚨 **Hata Bildirimi** - Testin başarısız olduğunu belirten başlık
- 📝 **Hata Detayları** - Testin neden başarısız olduğunun tam açıklaması
- 🖼️ **Screenshot** - Hata anında alınan ekran görüntüsü
- 🔗 **Test URL** - Test edilmekte olan web sitesi adresi
- 📄 **PDF Rapor** - Detaylı test raporunun PDF dosyası

### PDF Rapor İçeriği

Gönderilen PDF dosyası aşağıdakileri içerir:

- Test adı ve konumu
- Hata mesajı
- Beklenen vs. alınan sonuçlar
- Test sırasında alınan screenshot'lar
- Tam hata stacktrace'i

## 📁 Dosya Yapısı

```
chatbot-otomasyon-test/
├── tests/
│   ├── example.spec.ts       # Test senaryoları
│   └── values.ts              # Test değerleri ve sabitler
├── playwright-report/         # Playwright raporları (otomatik oluşturulur)
├── test-results/              # Test sonuçları (otomatik oluşturulur)
├── mail-gonder.js             # Email gönderme scripti
├── test-calistir.bat          # Windows batch dosyası (manuel çalıştırma için)
├── playwright.config.ts       # Playwright yapılandırması
├── package.json               # NPM paket bağımlılıkları
├── .env                       # Ortam değişkenleri (gizli)
├── test.log.txt               # Test log dosyası
├── hata_kayitlari.txt         # Hata kayıtları
└── README.md                  # Bu dosya
```

## 🔄 Zamanlanmış Görevler

Windows Görev Zamanlayıcısı (Task Scheduler) kullanarak testleri belirli saatlerde otomatik çalıştırabilirsiniz:

1. **Windows Görev Zamanlayıcısını Açın:**
   - `Win + R` tuşlarına basıp `taskschd.msc` yazın

2. **Yeni Görev Oluşturun:**
   - Sağ panelde "Görev Oluştur..." seçeneğini tıklayın

3. **Genel Sekmesinde:**
   - **Ad:** `Chatbot Otomasyon Testi`
   - **Açıklama:** `Günlük chatbot testini çalıştırır`

4. **Tetikleyici (Triggers) Sekmesinde:**
   - "Yeni" butonu tıklayın
   - Zamanlamayı ayarlayın (örn: Her gün 09:00'da)

5. **İşlemler (Actions) Sekmesinde:**
   - **Program/Script:** `C:\Users\[YourUsername]\Desktop\chatbot-otomasyon-test\test-calistir.bat`
   - **Başlangıç Dizini:** `C:\Users\[YourUsername]\Desktop\chatbot-otomasyon-test`

6. **Koşullar Sekmesinde:**
   - "Görev için elektrik tasarrufu seçeneklerini kullan" seçeneğini **kaldırın**

7. **Kaydedin ve Test Edin:**
   - `Sağ tıkla → Çalıştır` ile test edin

## 🛠️ Sorun Giderme

### Email Gönderilmiyor

- ✅ `.env` dosyasında email yapılandırmasını kontrol edin
- ✅ Gmail hesabında 2 Adımlı Doğrulama etkinleştirilmiş mi kontrol edin
- ✅ App Password (uygulama şifresi) doğru mu kontrol edin
- ✅ `test.log.txt` dosyasında email hata mesajlarını kontrol edin

### Test Çalışmıyor

- ✅ Node.js ve npm sürümlerini kontrol edin: `node -v`, `npm -v`
- ✅ Gerekli paketlerin yüklendiğini kontrol edin: `npm list`
- ✅ `.env` dosyasının proje kök dizininde olduğunu kontrol edin
- ✅ TARGET_URL'nin erişilebilir olduğunu kontrol edin

### PDF Rapor Boş Geliyorsa

- ✅ Playwright raporunun oluştuğunu kontrol edin: `playwright-report/` klasörü
- ✅ Test sonuçlarının kaydedildiğini kontrol edin: `test-results/` klasörü
- ✅ `test.log.txt` dosyasında hata mesajlarını kontrol edin

## 📝 Log Dosyaları

Proje tarafından oluşturulan log dosyaları:

- **test.log.txt** - Test çalıştırması sırasında çıktı ve hata mesajları
- **hata_kayitlari.txt** - Test başarısızlıklarının tarihi kaydı

## 🔐 Güvenlik Notları

- **`.env` dosyasını asla GitHub'a yüklemez** - `.gitignore` dosyasını kontrol edin
- Email şifresi yerine **App Password** (Uygulama Şifresi) kullanın
- Duyarlı verileri `.env` dosyasında saklayın

## 👤 Geliştirici

**Göktuğ Ormanlı** - Chatbot Otomasyon Testi

---

**Son Güncelleme:** 2 Temmuz 2026
