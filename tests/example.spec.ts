import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import { Values } from './../values';



dotenv.config();

const MESSAGE = Values.TEST_MESSAGE || "keçi";
const URL = process.env.TARGET_URL || 'https://shipeedylojistiktest.arkas.com/yardim';
const TIMEOUT = Number(process.env.WAIT_TIMEOUT) || 15000;
<<<<<<< Updated upstream
const RULE = process.env.CHECK_KEYWORDS || 'evet';
const WARN = process.env.CHECK_MESSAGE || 'Sistem sorunsuz';
const GREETING = process.env.GREETING || 'Merhaba. Ben Optichain';
=======
const RULE = Values.CHECK_KEYWORDS || 'evet';
const GREETING = Values.GREETING || 'Merhaba. Ben Optichain';
>>>>>>> Stashed changes

test('Chatbot Control', async ({ page }) => {
  await page.goto(URL);

  await page.locator('.chat-button').click();

<<<<<<< Updated upstream
    // Beklenen başlangıç karşılama mesajını görmeyi zorunlu kıl
  const initialGreeting = page.locator('.webchat__render-markdown').first();
  await initialGreeting.waitFor({ state: 'visible', timeout: TIMEOUT });
  const greetingText = await initialGreeting.innerText();
  
=======
  // Beklenen başlangıç karşılama mesajını görmeyi zorunlu kıl
  const initialGreeting = page.locator('.webchat__render-markdown').first();
  await initialGreeting.waitFor({ state: 'visible', timeout: TIMEOUT });
  const greetingText = await initialGreeting.innerText();

>>>>>>> Stashed changes
  expect(
    greetingText.toLowerCase(),
    `Başlangıç mesajı bulunamadı. Gelen: "${greetingText}"`
  ).toContain(GREETING.toLowerCase());

<<<<<<< Updated upstream
  
=======




>>>>>>> Stashed changes
  await page.getByPlaceholder('İletinizi yazın').fill(MESSAGE);



<<<<<<< Updated upstream
  
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
=======

  await page.waitForTimeout(5000);


  await page.getByPlaceholder('İletinizi yazın').press('Enter');


  const botun_cevabi = page.locator('.webchat__render-markdown').nth(1);


  await botun_cevabi.waitFor({ state: 'visible', timeout: TIMEOUT });



  const gelen_metin = (await botun_cevabi.innerText());

  expect(
    gelen_metin.toLowerCase(),
    `Eşleşme başarısız. Gelen: "${gelen_metin}" \n Beklenen: "${RULE}"`
  ).toContain(RULE.toLowerCase());

  //const rule = new RegExp(`(${RULE})`, 'i');
  //const eslesme = rule.exec(gelen_metin);
  //const hata_mesaji = eslesme
  // ? `${WARN} - Tespit edilen kelime: "${eslesme[0]}" | Gelen Mesaj: "${gelen_metin}"`
  // : `${WARN} | Gönderilen Metin: ${MESSAGE}`;

  // Eğer `CHECK_KEYWORDS` ile bot cevabı eşleşiyorsa test geçer,
  // eşleşmiyorsa `hata_mesaji` raporda gösterilerek başarısız olur.
  //expect(gelen_metin, hata_mesaji).toMatch(rule);
>>>>>>> Stashed changes
});