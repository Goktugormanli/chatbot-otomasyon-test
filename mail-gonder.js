const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * results.json (Playwright JSON reporter) icindeki suite agacini gezip
 * basarisiz (failed/timedOut/interrupted) testleri, KENDI attachment'lariyla
 * (screenshot dahil) birlikte duz bir listeye cikarir.
 *
 * Onceki versiyondaki hata: ekran goruntuleri playwright-report/data
 * klasorunden "tum .png dosyalarini" toplayarak seciliyordu, yani hangi
 * screenshot'in hangi teste ait oldugu hic dogrulanmiyordu. Bu yuzden
 * email'e bazen baska bir testin (hatta onceki run'dan kalan) screenshot'i
 * gidiyordu. results.json'da her test kendi attachment'ini tasidigi icin
 * bu karisma ihtimali ortadan kalkiyor.
 */
function collectFailedTests(suite, projectFile, list = []) {
    if (Array.isArray(suite.specs)) {
        for (const spec of suite.specs) {
            for (const test of spec.tests || []) {
                const results = test.results || [];
                // Retry yapilandirilmissa ayni test icin birden fazla deneme
                // (attempt) kaydi olur. Sadece SON denemeyi raporla, yoksa
                // ayni hata mailde 2-3 kez tekrar eder.
                const lastResult = results[results.length - 1];
                if (lastResult && lastResult.status && lastResult.status !== "passed" && lastResult.status !== "skipped") {
                    list.push({
                        title: spec.title,
                        file: spec.file || projectFile,
                        status: lastResult.status,
                        attemptCount: results.length,
                        errorMessage: stripAnsi(
                            (lastResult.error && lastResult.error.message) ||
                                (lastResult.errors && lastResult.errors[0] && lastResult.errors[0].message) ||
                                ""
                        ),
                        attachments: lastResult.attachments || [],
                    });
                }
            }
        }
    }
    if (Array.isArray(suite.suites)) {
        for (const child of suite.suites) {
            collectFailedTests(child, projectFile, list);
        }
    }
    return list;
}

// Jest/Playwright'in expect() ciktisindaki ANSI renk kodlarini
// (\x1b[31m, \x1b[39m vb.) temizler - terminalde renk olarak gorunen bu
// kodlar duz metinde/HTML'de ham escape dizisi olarak kaliyordu.
function stripAnsi(str) {
    return String(str).replace(/\x1b\[[0-9;]*m/g, "");
}

function escapeHtml(str) {
    return String(str).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function HataMailGonder() {
    const host = process.env.MAIL_HOST || process.env.SMTP_HOST;
    const port = Number(process.env.MAIL_PORT || process.env.SMTP_PORT || 587);

    console.log(`[DEBUG] Mail Host: ${host}`);
    console.log(`[DEBUG] Mail Port: ${port}`);
    console.log(`[DEBUG] Mail User: ${process.env.MAIL_USER}`);
    console.log(`[DEBUG] Mail To: ${process.env.MAIL_TO}`);

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    try {
        // playwright.config icine eklenen JSON reporter'in ciktisi.
        // Ornek: reporter: [['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]]
        const resultsJsonPath = path.join(__dirname, "test-results", "results.json");

        console.log("[DEBUG] Test sonuclari okunuyor...");

        let htmlReport = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                    .header { background: #d32f2f; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                    .header h1 { margin: 0; }
                    .test-case { background: white; padding: 20px; margin-bottom: 20px; border-left: 5px solid #d32f2f; border-radius: 3px; }
                    .test-case h2 { margin-top: 0; color: #d32f2f; }
                    .test-info { background: #f9f9f9; padding: 10px; border-radius: 3px; margin: 10px 0; }
                    .error-box { background: #ffebee; padding: 15px; border-left: 4px solid #d32f2f; margin: 10px 0; font-family: monospace; white-space: pre-wrap; word-wrap: break-word; }
                    .code-block { background: #f5f5f5; padding: 10px; border-radius: 3px; font-family: monospace; overflow-x: auto; }
                    .screenshot { max-width: 100%; margin: 10px 0; border: 1px solid #ddd; border-radius: 3px; }
                    .status-failed { color: #d32f2f; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f9f9f9; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Chatbot Otomasyon Test Raporu</h1>
                    <p>Test Tarihi: ${new Date().toLocaleString("tr-TR")}</p>
                </div>
        `;

        try {
            if (fs.existsSync(resultsJsonPath)) {
                const resultsJson = JSON.parse(fs.readFileSync(resultsJsonPath, "utf-8"));
                const failedTests = [];

                for (const suite of resultsJson.suites || []) {
                    collectFailedTests(suite, suite.file, failedTests);
                }

                console.log(`[DEBUG] ${failedTests.length} basarisiz test bulundu`);

                for (const test of failedTests) {
                    // Bu testin KENDI screenshot attachment'i - baska hicbir
                    // testin gorseliyle karismaz.
                    const screenshotAttachment = test.attachments.find(
                        (att) => att.name === "screenshot" && att.path && fs.existsSync(att.path)
                    );

                    let screenshotHtml = "";
                    if (screenshotAttachment) {
                        const pngBase64 = fs.readFileSync(screenshotAttachment.path, "base64");
                        screenshotHtml = `
                            <h3>Hata anindaki ekran goruntusu:</h3>
                            <img src="data:image/png;base64,${pngBase64}" class="screenshot" alt="Test Screenshot">
                        `;
                    }

                    htmlReport += `
                        <div class="test-case">
                            <h2>${escapeHtml(test.title)}</h2>
                            <div class="test-info">
                                <strong>Dosya:</strong> ${escapeHtml(test.file || "Bilinmiyor")}<br>
                                <strong>Durum:</strong> <span class="status-failed">BASARISIZ (${escapeHtml(test.status)})</span><br>
                                <strong>Deneme sayisi:</strong> ${test.attemptCount}
                            </div>
                            ${
                                test.errorMessage
                                    ? `
                                <h3>Hata Detaylari:</h3>
                                <div class="error-box">${escapeHtml(test.errorMessage)}</div>
                            `
                                    : ""
                            }
                            ${screenshotHtml}
                        </div>
                    `;
                }
            } else {
                console.log(`[DEBUG] results.json bulunamadi (${resultsJsonPath}). playwright.config icine JSON reporter eklendigini dogrulayin.`);
            }
        } catch (err) {
            console.log("[DEBUG] Detayli rapor okunamadi:", err.message);
        }

        htmlReport += `
            </body>
            </html>
        `;

        const pdfPath = path.join(__dirname, "test-report.pdf");
        const htmlPath = path.join(__dirname, "test-report.html");

        // HTML dosyasini temp olarak kaydet
        fs.writeFileSync(htmlPath, htmlReport, "utf-8");

        console.log("[DEBUG] HTML rapor yazildi, Puppeteer baslatiliyor...");

        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            const fileUrl = `file://${htmlPath}`;
            console.log("[DEBUG] HTML dosya yukleniyor...");

            await page.goto(fileUrl, {
                waitUntil: "networkidle0",
                timeout: 60000,
            });

            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log("[DEBUG] PDF'e cevriliyor...");
            await page.pdf({
                path: pdfPath,
                format: "A4",
                margin: {
                    top: "10mm",
                    bottom: "10mm",
                    left: "10mm",
                    right: "10mm",
                },
                printBackground: true,
            });

            console.log("[DEBUG] PDF olusturuldu:", pdfPath);

            // Temp HTML dosyasini sil
            fs.unlinkSync(htmlPath);
        } finally {
            await browser.close();
        }

        const emailHtmlContent = `
            <h2>Chatbot Otomasyon Testi Hata Bildirimi</h2>
            <p>Test sirasinda bir hata olustu. Detaylar icin ekteki Test Raporunu goruntuleyin:</p>
            <ul>
                <li><strong>Test URL:</strong> ${process.env.TARGET_URL}</li>
                <li><strong>Ek Dosya:</strong> test-report.pdf - Detayli Hata Raporu</li>
            </ul>
            <p>Rapor, test adimlarini, hata detaylarini ve hatanin gerceklestigi andaki ekran goruntusunu icerir.</p>
        `;

        const info = await transporter.sendMail({
            from: `Chatbot Otomasyon Testi <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_TO,
            subject: "Chatbot Hata Bildirimi",
            html: emailHtmlContent,
            text: `Test sirasinda bir hata olustu.\nTest raporunu ekteki PDF dosyasinda goruntuleyebilirsiniz.\n\nTest URL = ${process.env.TARGET_URL}`,
            attachments: [
                {
                    filename: "test-report.pdf",
                    path: pdfPath,
                },
            ],
        });

        console.log("Mail gonderildi:", info.messageId);

        // Temp PDF dosyasini sil
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
            console.log("[DEBUG] PDF dosyasi silindi");
        }

        return info;
    } catch (error) {
        console.error("Mail gonderme hatasi:", error);
        throw error;
    }
}

HataMailGonder().catch((err) => {
    console.error("[FATAL ERROR]", err.message);
    process.exitCode = 1;
});