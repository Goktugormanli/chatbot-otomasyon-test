import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import { Values } from './../values';



dotenv.config();

const MESSAGE = Values.TEST_MESSAGE || "keçi";
const URL = process.env.TARGET_URL || 'https://shipeedylojistiktest.arkas.com/yardim';
const TIMEOUT = Number(process.env.WAIT_TIMEOUT) || 15000;
const RULE = Values.CHECK_KEYWORDS || 'evet';
const GREETING = Values.GREETING || 'Merhaba. Ben Optichain';


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

  const gelen_metin = (await botun_cevabi.innerText());

  expect(
    gelen_metin.toLowerCase(),
    `Gelen: "${gelen_metin}" \n Beklenen: "${RULE}"`
  ).toContain(RULE.toLowerCase());

});