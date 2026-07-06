
@echo off
cd /d "%~dp0"

echo Test basliyor...
call npx playwright test > test.log.txt 2>&1
set "test_result=%errorlevel%"

if "%test_result%" neq "0" (
    echo [HATA] Test basarisiz oldu! Detaylar test.log.txt dosyasinda.
    echo %date% %time% - Test Failed >> hata_kayitlari.txt

    echo [BILGI] E-posta gonderiliyor...
    call node mail-gonder.js >> test.log.txt 2>&1
    if errorlevel 1 (
        echo [HATA] E-posta gonderilemedi.
        echo %date% %time% - Email Failed >> hata_kayitlari.txt
    ) else (
        echo [BASARILI] E-posta gonderildi.
        echo %date% %time% - Email Sent >> hata_kayitlari.txt
    )
    
   
    msg * "Dikkat: Chatbot testi basarisiz oldu! E-posta iletildi."
) else (
    echo [BASARILI] Test sorunsuz tamamlandi.
)


pause