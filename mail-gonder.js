const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

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
        // Test sonuçlarından detaylı bilgi çıkar
        const reportDataDir = path.join(__dirname, "playwright-report", "data");
        const lastRunPath = path.join(__dirname, "test-results", ".last-run.json");
        
        console.log("[DEBUG] Test sonuçları okunuyor...");
        
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
                    <h1>🚨 Chatbot Otomasyon Test Raporu</h1>
                    <p>Test Tarihi: ${new Date().toLocaleString('tr-TR')}</p>
                </div>
        `;
        
        try {
            const lastRunData = JSON.parse(fs.readFileSync(lastRunPath, 'utf-8'));
            
            // Rapor data dizinindeki MD dosyalarını oku
            if (fs.existsSync(reportDataDir)) {
                const files = fs.readdirSync(reportDataDir).filter(f => f.endsWith('.md'));
                
                for (const file of files) {
                    const mdContent = fs.readFileSync(path.join(reportDataDir, file), 'utf-8');
                    
                    // MD dosyasından bilgi çıkar
                    const testNameMatch = mdContent.match(/- Name: (.+)/);
                    const locationMatch = mdContent.match(/- Location: (.+)/);
                    const errorMatch = mdContent.match(/# Error details\n\n\`\`\`\n([\s\S]*?)\n\`\`\`/);
                    
                    const testName = testNameMatch ? testNameMatch[1] : "Test";
                    const location = locationMatch ? locationMatch[1] : "Bilinmiyor";
                    const errorText = errorMatch ? errorMatch[1] : "";
                    
                    // PNG screenshot'ları bul
                    let screenshotHtml = '';
                    const pngFiles = fs.readdirSync(reportDataDir).filter(f => f.endsWith('.png'));
                    if (pngFiles.length > 0) {
                        screenshotHtml = '<h3>Screenshot:</h3>';
                        for (const pngFile of pngFiles) {
                            const pngPath = path.join(reportDataDir, pngFile);
                            const pngBase64 = fs.readFileSync(pngPath, 'base64');
                            screenshotHtml += `<img src="data:image/png;base64,${pngBase64}" class="screenshot" alt="Test Screenshot">`;
                        }
                    }
                    
                    htmlReport += `
                        <div class="test-case">
                            <h2>${testName}</h2>
                            <div class="test-info">
                                <strong>Konum:</strong> ${location}<br>
                                <strong>Durum:</strong> <span class="status-failed">❌ BAŞARISIZ</span>
                            </div>
                            ${errorText ? `
                                <h3>Hata Detayları:</h3>
                                <div class="error-box">${errorText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                            ` : ''}
                            ${screenshotHtml}
                        </div>
                    `;
                }
            }
        } catch (err) {
            console.log("[DEBUG] Detaylı rapor okunamadı, ana rapor kullanılıyor");
        }
        
        htmlReport += `
            </body>
            </html>
        `;
        
        const pdfPath = path.join(__dirname, "test-report.pdf");
        const htmlPath = path.join(__dirname, "test-report.html");
        
        // HTML dosyasını temp olarak kaydet
        fs.writeFileSync(htmlPath, htmlReport, 'utf-8');
        
        console.log("[DEBUG] HTML rapor yazıldı, Puppeteer başlatılıyor...");
        
        const browser = await puppeteer.launch({ 
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });
        
        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            
            const fileUrl = `file://${htmlPath}`;
            console.log("[DEBUG] HTML dosya yükleniyor...");
            
            await page.goto(fileUrl, { 
                waitUntil: 'networkidle0',
                timeout: 60000 
            });
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log("[DEBUG] PDF'e çevriliyor...");
            await page.pdf({
                path: pdfPath,
                format: 'A4',
                margin: {
                    top: '10mm',
                    bottom: '10mm',
                    left: '10mm',
                    right: '10mm'
                },
                printBackground: true
            });
            
            console.log("[DEBUG] PDF oluşturuldu:", pdfPath);
            
            // Temp HTML dosyasını sil
            fs.unlinkSync(htmlPath);
        } finally {
            await browser.close();
        }

        const emailHtmlContent = `
            <h2>🚨 Chatbot Otomasyon Testi Hata Bildirimi</h2>
            <p>Test sırasında bir hata oluştu. Detaylar için ekteki Test Raporunu görüntüleyin:</p>
            <ul>
                <li><strong>Test URL:</strong> ${process.env.TARGET_URL}</li>
                <li><strong>Ek Dosya:</strong> test-report.pdf - Detaylı Hata Raporu</li>
            </ul>
            <p>Rapor, test adımlarını, hata detaylarını ve kritik bilgilerini içerir.</p>
        `;
        
        const info = await transporter.sendMail({
            from: `Chatbot Otomasyon Testi <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_TO,
            subject: "🚨🚨🚨Chatbot Hata Bildirimi🚨🚨🚨",
            html: emailHtmlContent,
            text: `Test sırasında bir hata oluştu.\nTest raporunu ekteki PDF dosyasında görüntüleyebilirsiniz.\n\nTest URL = ${process.env.TARGET_URL}`,
            attachments: [
                {
                    filename: "test-report.pdf",
                    path: pdfPath
                }
            ]
        });

        console.log("Mail gönderildi:", info.messageId);
        
        // Temp PDF dosyasını sil
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
            console.log("[DEBUG] PDF dosyası silindi");
        }
        
        return info;
    } catch (error) {
        console.error("Mail gönderme hatası:", error);
        throw error;
    }
}

HataMailGonder().catch((err) => {
    console.error("[FATAL ERROR]", err.message);
    process.exitCode = 1;
});