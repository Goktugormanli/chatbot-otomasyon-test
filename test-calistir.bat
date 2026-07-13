@echo off
:: 1. Calisma dizinini bat dosyasinin oldugu klasore (Root) sabitle
cd /d "%~dp0"

:: 2. Sistemin calistigini ana kayit defterine (Tarih/Saat ile) not et
echo %date% %time% - [BILGI] Otomasyon tetiklendi, testler basliyor... >> otomasyon_kayitlari.txt

:: 3. Eski detayli metin logunu sil (Sadece son turun terminal ciktisi kalsin)
if exist test.log.txt del test.log.txt

:: 4. Playwright'i sessizce calistir ve butun ciktilari (hatalar dahil) test.log.txt icine yonlendir
call npx playwright test > test.log.txt 2>&1
set "test_result=%errorlevel%"

:: 5. Testin basari durumunu (Exit Code) kontrol et
if "%test_result%" neq "0" (
    :: --- HATA SENARYOSU ---
    echo %date% %time% - [HATA] Test patladi! Hata ani 'test-results' icine ZIP olarak kaydedildi. >> otomasyon_kayitlari.txt
    echo %date% %time% - [BILGI] E-posta bildirim sureci baslatiliyor... >> otomasyon_kayitlari.txt
    
    :: E-posta scriptini calistir ve onun loglarini da ayni txt dosyasina ekle
    call node mail-gonder.js >> test.log.txt 2>&1
    
    if errorlevel 1 (
        echo %date% %time% - [KRITIK] E-posta GONDERILEMEDI! >> otomasyon_kayitlari.txt
    ) else (
        echo %date% %time% - [BASARILI] Hata bildirimi e-posta ile iletildi. >> otomasyon_kayitlari.txt
    )
) else (
    :: --- BASARI SENARYOSU ---
    echo %date% %time% - [BASARILI] Test sorunsuz tamamlandi. >> otomasyon_kayitlari.txt
)

:: 6. Task Scheduler'in askida kalmamasi (zombie olmamasi) icin sessizce cikis yap
exit