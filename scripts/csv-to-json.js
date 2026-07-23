// Bu script tests/data/testData.csv dosyasını okuyup
// tests/data/testData.json dosyasını otomatik olarak üretir.
// Test uzmanı sadece CSV dosyasını (Notepad veya Excel'de) doldurur;
// bu script ve test-calistir.bat testleri her çalıştırdığında bunu
// otomatik yapar. Harici bir npm paketine ihtiyaç duymaz.
//
// CSV sütunları (ilk satır başlık):
//   Senaryo Adı;Karşılama Mesajı;Kullanıcı Mesajı;Beklenen Cevap İçeriği;Dil
//
// "Dil" sütunu OPSİYONELDİR: boş bırakılırsa veya sütun hiç yoksa "tr"
// kabul edilir. İngilizce bir senaryo için hücreye "en" yazılması yeterli.
//
// Ayraç olarak noktalı virgül (;) veya virgül (,) otomatik algılanır
// (Türkçe Excel genelde ; kullanır).
//
// Aynı "Senaryo Adı" + aynı "Dil" ile birden fazla satır = çok turlu diyalog
// (satırlar sırasıyla tur 1, tur 2, ... olarak birleştirilir).

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'tests', 'data', 'testData.csv');
const jsonPath = path.join(__dirname, '..', 'tests', 'data', 'testData.json');

function detectDelimiter(headerLine) {
  const semicolons = (headerLine.match(/;/g) || []).length;
  const commas = (headerLine.match(/,/g) || []).length;
  return semicolons >= commas ? ';' : ',';
}

// Tırnak içindeki ayraçları/satır sonlarını doğru işleyen basit CSV satır ayrıştırıcı
function parseCsv(text, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        row.push(field);
        field = '';
      } else if (ch === '\r') {
        // yoksay
      } else if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }
  // son satır
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function main() {
  if (!fs.existsSync(csvPath)) {
    console.error(`[HATA] CSV dosyası bulunamadı: ${csvPath}`);
    process.exit(1);
  }

  let text = fs.readFileSync(csvPath, 'utf-8');
  // Excel'in UTF-8 kaydederken eklediği BOM karakterini temizle
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const firstLineEnd = text.indexOf('\n');
  const headerLine = firstLineEnd >= 0 ? text.slice(0, firstLineEnd) : text;
  const delimiter = detectDelimiter(headerLine);

  const rows = parseCsv(text, delimiter);
  if (rows.length === 0) {
    console.error('[HATA] CSV dosyası boş görünüyor.');
    process.exit(1);
  }

  const header = rows[0].map((h) => h.trim());
  const col = {
    name: header.indexOf('Senaryo Adı'),
    greeting: header.indexOf('Karşılama Mesajı'),
    message: header.indexOf('Kullanıcı Mesajı'),
    expected: header.indexOf('Beklenen Cevap İçeriği'),
    // Opsiyonel: yoksa -1 kalır, asagida 'tr' varsayilan atanir
    language: header.indexOf('Dil'),
  };

  const requiredCols = ['name', 'greeting', 'message', 'expected'];
  const missing = requiredCols.filter((key) => col[key] === -1);
  if (missing.length > 0) {
    console.error(
      `[HATA] Başlık satırında şu sütunlar bulunamadı: ${missing.join(', ')}. ` +
      `Başlıkların tam olarak "Senaryo Adı;Karşılama Mesajı;Kullanıcı Mesajı;Beklenen Cevap İçeriği" ` +
      `şeklinde olduğundan emin olun.`
    );
    process.exit(1);
  }
  if (col.language === -1) {
    console.log('[BİLGİ] "Dil" sütunu bulunamadı, tüm senaryolar "tr" kabul edilecek.');
  }

  const scenarios = [];
  const scenarioIndexByKey = new Map();
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const excelRowNumber = i + 1;
    const name = (r[col.name] || '').trim();
    const greeting = (r[col.greeting] || '').trim();
    const message = (r[col.message] || '').trim();
    const expected = (r[col.expected] || '').trim();
    const language = (col.language !== -1 ? (r[col.language] || '').trim().toLowerCase() : '') || 'tr';

    if (!name) {
      console.warn(`[UYARI] Satır ${excelRowNumber}: "Senaryo Adı" boş, satır atlandı.`);
      skipped++;
      continue;
    }
    if (!message || !expected) {
      console.warn(`[UYARI] Satır ${excelRowNumber} ("${name}"): "Kullanıcı Mesajı" veya "Beklenen Cevap İçeriği" eksik, satır atlandı.`);
      skipped++;
      continue;
    }

    // Ayni senaryo adi farkli dillerde de kullanilabilsin diye anahtar
    // isim + dil kombinasyonu (yoksa TR ve EN turlari birbirine karisirdi).
    const key = `${name}__${language}`;

    let scenario;
    if (scenarioIndexByKey.has(key)) {
      scenario = scenarios[scenarioIndexByKey.get(key)];
    } else {
      scenario = { name, turns: [], language };
      scenarioIndexByKey.set(key, scenarios.length);
      scenarios.push(scenario);
    }

    if (greeting && !scenario.greeting) {
      scenario.greeting = greeting;
    }

    scenario.turns.push({ message, expectedContains: expected });
  }

  fs.writeFileSync(jsonPath, JSON.stringify({ scenarios }, null, 2), 'utf-8');

  console.log(`[BAŞARILI] ${scenarios.length} senaryo okundu, testData.json güncellendi.`);
  if (skipped > 0) {
    console.log(`[BİLGİ] ${skipped} satır eksik/hatalı bilgi nedeniyle atlandı (yukarıdaki uyarılara bakın).`);
  }
}

main();