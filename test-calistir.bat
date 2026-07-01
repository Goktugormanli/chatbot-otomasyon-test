@echo off
cd /d "%~dp0"

echo Test basliyor...
call npx playwright test > test.log.txt 2>&1
set test_result=%errorlevel%

if %test_result% neq 0 (
    echo [HATA] Test basarisiz oldu! Detaylar test.log.txt dosyasinda.
    echo %date% %time% - Test Failed >> hata_kayitlari.txt
    
    :: Ekranda bir uyari penceresi cikmasini istersen su satiri ekle:
    msg * "Dikkat: Chatbot testi basarisiz oldu!"
) else (
    echo [BASARILI] Test sorunsuz tamamlandi.
)

:: PAUSE komutunu en alta al ki ekran kapanmasin
pause