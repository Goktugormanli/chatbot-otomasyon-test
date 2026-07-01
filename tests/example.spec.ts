import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';


dotenv.config();

const MESSAGE = process.env.TEST_MESSAGE || "keçi";
const URL = process.env.TARGET_URL || 'https://shipeedylojistiktest.arkas.com/yardim';
const TIMEOUT = Number(process.env.WAIT_TIMEOUT) || 15000;
const RULE = process.env.CHECK_KEYWORDS || 'evet';
const WARN = process.env.CHECK_MESSAGE || 'Sistem sorunsuz';
const GREETING = process.env.GREETING || 'Merhaba. Ben Optichain';

test('Chatbot Control', async ({ page }) => {
  await page.goto(URL);

  await page.locator('.chat-button').click();

    // Beklenen başlangıç karşılama mesajını görmeyi zorunlu kıl
  const initialGreeting = page.locator('.webchat__render-markdown').first();
  await initialGreeting.waitFor({ state: 'visible', timeout: TIMEOUT });
  const greetingText = await initialGreeting.innerText();
  
  expect(
    greetingText.toLowerCase(),
    `Başlangıç mesajı bulunamadı. Gelen: "${greetingText}"`
  ).toContain(GREETING.toLowerCase());

  
  await page.getByPlaceholder('İletinizi yazın').fill(MESSAGE);



  
  await page.waitForTimeout(5000);

  
  await page.getByPlaceholder('İletinizi yazın').press('Enter');

  
  const botun_cevabi = page.locator('.webchat__render-markdown').nth(1);

  
  await botun_cevabi.waitFor({ state: 'visible', timeout: TIMEOUT });

 
  const gelen_metin = await botun_cevabi.innerText();
  const rule = new RegExp(`(${RULE})`, 'i');
  const eslesme = rule.exec(gelen_metin);
  const hata_mesaji = eslesme
    ? `${WARN} - Tespit edilen kelime: "${eslesme[0]}" | Gelen Mesaj: "${gelen_metin}"`
    : `${WARN} | Gönderilen Metin: ${MESSAGE}`;

  // Eğer `CHECK_KEYWORDS` ile bot cevabı eşleşiyorsa test geçer,
  // eşleşmiyorsa `hata_mesaji` raporda gösterilerek başarısız olur.
  expect(gelen_metin, hata_mesaji).toMatch(rule);
});