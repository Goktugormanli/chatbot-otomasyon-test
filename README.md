# Chatbot Otomasyon Testi

Arkas chatbot'u ([shipeedylojistiktest.arkas.com/yardim](https://shipeedylojistiktest.arkas.com/yardim)) için Playwright + TypeScript tabanlı otomasyon test projesi. Senaryolar kod yazılmadan bir CSV dosyası üzerinden yönetilir; test başarısız olduğunda ekran görüntülü, otomatik e-posta bildirimi gönderilir.

## İçindekiler

- [Genel Akış](#genel-akış)
- [Klasör Yapısı](#klasör-yapısı)
- [Kurulum](#kurulum)
- [Testleri Çalıştırma](#testleri-çalıştırma)
- [Senaryo Ekleme / Düzenleme (CSV Formatı)](#senaryo-ekleme--düzenleme-csv-formatı)
- [Çok Dilli Testler (TR / EN)](#çok-dilli-testler-tr--en)
- [Hata Bildirimi (E-posta)](#hata-bildirimi-e-posta)
- [Zamanlanmış Çalıştırma (Task Scheduler)](#zamanlanmış-çalıştırma-task-scheduler)
- [Sorun Giderme](#sorun-giderme)

## Genel Akış

```
testData.csv (test uzmanı doldurur)
        │  scripts/csv-to-json.js
        ▼
testData.json (otomatik üretilir, elle düzenlenmez)
        │  tests/utils/testData.ts okur
        ▼
tests/utils/scenarios.ts  ──▶  dile göre filtreler (tr / en)
        │
        ├── tests/chatbot.spec.ts      → TR senaryoları çalıştırır
        └── tests/chatbot.en.spec.ts   → EN senaryoları çalıştırır
        │
        ▼  (tests/utils/chatbot.page.ts üzerinden siteyle etkileşim)
Playwright test sonucu → test-results/results.json (JSON reporter)
        │
        ▼ (hata varsa)
mail-gonder.js → her başarısız testin KENDİ ekran görüntüsü + hata mesajıyla PDF rapor → e-posta
```

Tek gerçek kaynak **CSV**'dir. Yeni senaryo eklemek veya mevcut birini değiştirmek için kod dokunmaya gerek yoktur.

## Klasör Yapısı

```
chatbot-otomasyon-test/
├── test-calistir.bat          # Ana tetikleyici: CSV→JSON, testler, hata bildirimi
├── mail-gonder.js             # Hata durumunda e-posta gönderimi (nodemailer + puppeteer)
├── playwright.config.ts       # Reporter ayarları (html + json)
├── otomasyon_kayitlari.txt    # Her çalıştırmanın özet logu (otomatik oluşur)
├── scripts/
│   └── csv-to-json.js         # CSV → JSON dönüştürücü
└── tests/
    ├── chatbot.spec.ts        # TR senaryoları (test.describe burada tanımlı)
    ├── chatbot.en.spec.ts     # EN senaryoları (test.describe burada tanımlı)
    ├── data/
    │   ├── testData.csv       # Test uzmanının doldurduğu kaynak dosya
    │   └── testData.json      # Otomatik üretilir — elle düzenleme!
    └── utils/
        ├── chatbot.page.ts    # Page Object: DOM etkileşimleri, dile duyarlı selector'lar
        ├── testData.ts        # testData.json'ı tip güvenli (TypeScript) okur
        └── scenarios.ts       # Senaryoları dile göre filtreler (test çağrısı içermez)
```

## Kurulum

```bash
npm install
npx playwright install     # Tarayıcı motorlarını indirir
```

Proje kökünde bir `.env` dosyası oluştur (e-posta bildirimi için gereklidir):

```env
TARGET_URL=https://shipeedylojistiktest.arkas.com/yardim

MAIL_HOST=smtp.ornek.com
MAIL_PORT=587
MAIL_USER=gonderen@ornek.com
MAIL_PASS=uygulama_sifresi
MAIL_TO=alici@ornek.com
```

## Testleri Çalıştırma

**Tam otomasyon (CSV dönüşümü + testler + hata bildirimi):**

```bash
test-calistir.bat
```

**Sadece Türkçe senaryolar:**

```bash
npx playwright test chatbot.spec.ts
```

**Sadece İngilizce senaryolar:**

```bash
npx playwright test chatbot.en.spec.ts
```

**Belirli bir senaryo (senaryo adının bir kısmıyla eşleştirerek):**

```bash
npx playwright test chatbot.spec.ts --grep "BAF nedir"
```

**Tarayıcıyı görerek çalıştırmak için** (`--headed`) veya adım adım izlemek için (`--debug`) ekleyebilirsin:

```bash
npx playwright test chatbot.en.spec.ts --headed
```

> ⚠️ **Önemli:** `npx playwright test` komutunu **doğrudan** çalıştırdığında, CSV'deki değişiklikler `testData.json`'a otomatik yansımaz — bu dönüşüm sadece `test-calistir.bat` içinde otomatik tetiklenir. CSV'yi değiştirdiysen ve testleri doğrudan `npx playwright test` ile çalıştırıyorsan, önce elle çalıştır:
>
> ```bash
> node scripts/csv-to-json.js
> ```

## Senaryo Ekleme / Düzenleme (CSV Formatı)

`tests/data/testData.csv` sütunları:

| Sütun | Zorunlu mu? | Açıklama |
|---|---|---|
| `Senaryo Adı` | Evet | Testin görünen adı. Aynı isim birden fazla satırda tekrarlanırsa çok turlu bir diyalog oluşur. |
| `Karşılama Mesajı` | Hayır | Sohbet açıldığında botun ilk mesajının içermesi gereken metin. |
| `Kullanıcı Mesajı` | Evet | Bota gönderilecek mesaj. |
| `Beklenen Cevap İçeriği` | Evet | Botun cevabında bulunması beklenen metin (büyük/küçük harf duyarsız). |
| `Dil` | Hayır | `tr` veya `en`. Boş bırakılırsa `tr` kabul edilir. |

**Tek turlu örnek:**

```
Senaryo Adı;Karşılama Mesajı;Kullanıcı Mesajı;Beklenen Cevap İçeriği;Dil
BAF nedir - happy path;Merhaba;BAFne (Bunker Adjustment Factor) nedir?;bunker adjustment factor;tr
```

**Çok turlu örnek** (aynı senaryo adı, sıralı satırlar — ilk satırdan sonrakilerde "Karşılama Mesajı" boş bırakılabilir):

```
Rezervasyon belgeleri;Merhaba;Hangi belgeleri hazırlamalıyım?;fatura;tr
Rezervasyon belgeleri;;Nereye yüklemem gerekiyor?;rezervasyon bölümü;tr
```

Değişiklik yaptıktan sonra `node scripts/csv-to-json.js` çalıştır (veya `test-calistir.bat`'ı kullan) ve `testData.json`'ın güncellendiğini terminaldeki `[BAŞARILI] N senaryo okundu` mesajından doğrula.

## Çok Dilli Testler (TR / EN)

- CSV'de `Dil` sütununa `en` yazılan satırlar `chatbot.en.spec.ts`'de, `tr` (veya boş) olanlar `chatbot.spec.ts`'de çalışır.
- `ChatbotPage` sınıfı locale parametresi alır (`new ChatbotPage(page, 'en')`) ve dile göre doğru placeholder metnini + dil değiştirme adımını (`.MuiSelect-root` dropdown → `getByRole('option', { name: 'EN' })`) otomatik uygular.
- Yeni bir dil eklemek istersen (örn. Almanca), `tests/utils/chatbot.page.ts` içindeki `LOCALES` objesine yeni bir giriş eklemen yeterli; spec dosyası tarafında sadece `chatbot.de.spec.ts` gibi yeni bir dosya açıp `getScenariosForLocale('de')` çağırman gerekir.

## Hata Bildirimi (E-posta)

`playwright.config.ts` içindeki JSON reporter (`test-results/results.json`) sayesinde `mail-gonder.js`, her başarısız testin **kendi** ekran görüntüsünü ve hata mesajını (ANSI renk kodlarından temizlenmiş, okunabilir halde) eşleştirip PDF rapor olarak e-postaya ekler. Aynı testin retry nedeniyle birden fazla denemesi varsa, sadece **son deneme** raporlanır (tekrarlı mail içeriği önlenir).

## Zamanlanmış Çalıştırma (Task Scheduler)

`test-calistir.bat`, Windows Task Scheduler ile periyodik çalıştırılmak üzere tasarlanmıştır:

- Çalışma dizinini kendi konumuna sabitler (`cd /d "%~dp0"`), böylece Scheduler'ın nereden tetiklendiği önemli değildir.
- Her çalıştırmanın özetini `otomasyon_kayitlari.txt`'e ekler (tarih/saat + BİLGİ/HATA/BAŞARILI etiketleriyle).
- Sonunda sessizce çıkar (`exit`), Scheduler'da asılı (zombie) süreç bırakmaz.

## Sorun Giderme

**"No tests found" hatası alıyorsan:**
- CSV'yi değiştirdiysen `node scripts/csv-to-json.js`'i çalıştırdığından emin ol.
- Filtrelemek istediğin dile (`tr`/`en`) ait en az bir senaryo olduğunu `testData.json`'da kontrol et.

**"Playwright Test did not expect test.describe() to be called here" hatası alıyorsan:**
- `test.describe()`/`test()` çağrılarının **sadece** `.spec.ts` dosyalarının içinde olduğundan, yardımcı dosyalarda (`scenarios.ts`, `chatbot.page.ts`, `testData.ts`) bu çağrıların **olmadığından** emin ol.
- `npm ls @playwright/test` ve `npm ls playwright` ile tek bir sürüm kurulu olduğunu doğrula.

**E-posta gönderilmiyorsa:**
- `.env` dosyasındaki `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS`, `MAIL_TO` değerlerini kontrol et.
- `test.log.txt` içindeki `[DEBUG]` satırlarına bak — hangi adımda takıldığını gösterir.