![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

# ARKAS Chatbot Otomasyon Testleri

Bu proje, ARKAS'ın yardım chatbot'u üzerinde Playwright ve TypeScript kullanarak otomatik test senaryoları çalıştırmayı amaçlar. Projede üç ana test grubu bulunur:

- Happy Path senaryoları
- Bağlam dışı sorular için graceful fallback davranışı
- Güvenlik filtresi uyarıları

Ayrıca test başarısız olduğunda e-posta bildirimi ve PDF rapor üretimi de desteklenmektedir.

## Özellikler

- ✅ Playwright ile web otomasyonu
- ✅ Page Object Model yapısı
- ✅ Test verilerinin ayrı tutulması
- ✅ Hata anında ekran görüntüsü yakalama
- ✅ Başarısız testler için e-posta bildirimi
- ✅ HTML/PDF rapor üretimi desteği

## Kurulum

### Ön koşullar

- Node.js 18 veya üzeri
- npm
- Google Chrome / Chromium

### Adımlar

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. Playwright tarayıcılarını kurun:

```bash
npx playwright install
```

3. Proje kök dizininde `.env` dosyası oluşturun:

```env
TARGET_URL=https://shipeedylojistiktest.arkas.com/yardim
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_TO=recipient@example.com
```

> Gmail kullanıyorsanız uygulama şifresi kullanmanız gerekir.

## Testleri Çalıştırma

### Tüm testleri çalıştırma

```bash
npx playwright test
```

### UI modunda çalıştırma

```bash
npx playwright test --ui
```

### Headed modda çalıştırma

```bash
npx playwright test --headed
```

### Raporu görüntüleme

```bash
npx playwright show-report
```

### Windows batch dosyası ile çalıştırma

```cmd
test-calistir.bat
```

Bu betik testleri çalıştırır, başarısız olursa hata loglarını yazar ve e-posta gönderir.

## Proje Yapısı

```text
arkas/
├── tests/
│   ├── 01_happy_path.spec.ts
│   ├── 02_out_of_domain.spec.ts
│   ├── 03_safety_exceptions.spec.ts
│   ├── data/
│   │   └── testData.json
│   └── utils/
│       ├── chatbot.page.ts
│       └── testData.ts
├── playwright.config.ts
├── tsconfig.json
├── tests/tsconfig.json
├── mail-gonder.js
├── test-calistir.bat
├── package.json
├── .env
├── playwright-report/
├── test-results/
└── README.md
```

## Test Senaryoları

- Happy Path: Beklenen sorulara doğru cevap verme davranışını test eder.
- Graceful Fallback: Anlamsız veya alakasız sorularda kibar bir reddetme davranışını doğrular.
- Hard Exception: Tehlikeli veya güvenlik kuralını ihlal eden isteklerde güvenlik filtresi uyarısını doğrular.

## E-posta Bildirimi

Test başarısız olduğunda [mail-gonder.js](mail-gonder.js) çalışır. Bu betik:

- hata ayrıntılarını toplar
- ekran görüntüsü ve rapor bilgilerini hazırlar
- PDF rapor oluşturur
- belirtilen adrese e-posta gönderir

## Sorun Giderme

- Node.js ve npm sürümünü kontrol edin: `node -v`, `npm -v`
- Playwright tarayıcılarının kurulu olduğundan emin olun: `npx playwright install`
- `.env` dosyasının proje kök dizininde bulunduğunu doğrulayın
- `TARGET_URL` adresinin erişilebilir olduğunu kontrol edin
- TypeScript hatası alırsanız şu komutu çalıştırın:

```bash
npx tsc --noEmit --project tsconfig.json
```

## Geliştirici

Göktuğ Ormanlı
