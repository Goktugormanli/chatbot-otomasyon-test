@echo off cd /d "C:\Users\bimar.stajyer2\Desktop\chatbot-otomasyon-test"
call npx playwright test > test.log.txt 2>&1
set test_result=%errorlevel%



if %test_result% neq 0 (
    echo Test Failed. Check test.log.txt for details.
    echo %date% %time% - Test Failed >> hata_kayitlari.txt
) else (
    echo Test Passed.)
    pause