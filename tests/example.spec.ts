import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const MESSAGE = process.env.TEST_MESSAGE || "keçi";
const URL = process.env.TARGET_URL || 'https://shipeedylojistiktest.arkas.com/yardim';
const TIMEOUT = Number(process.env.WAIT_TIMEOUT) || 15000;
const RULE = process.env.ERROR_KEYWORDS || 'error|failed|exception';
const WARN = process.env.ERROR_MESSAGE || 'sistemde hata';

test('Chatbot Control', async ({ page }) => {
  await page.goto(URL);

  await page.locator('.chat-button').click();

  // 1. Mesaj kutusunu bulur ve metni yazar
  await page.getByPlaceholder('İletinizi yazın').fill(MESSAGE);

  // 2. Tıklamakla uğraşmaz, direkt klavyeden Enter tuşunu gönderir
  await page.waitForTimeout(5000);

  // 3. 5 saniye dolduktan sonra Enter'a bas
  await page.getByPlaceholder('İletinizi yazın').press('Enter');

  // 3. Ekrana düşecek olan 3. mesajı (Botun asıl cevabını) hedefler
  const botun_cevabi = page.locator('.webchat__render-markdown').nth(1);

  // 4. Belirlediğimiz süre boyunca o mesajın gelmesini bekler
  await botun_cevabi.waitFor({ state: 'visible', timeout: TIMEOUT });

  // 5. Mesaj başarıyla geldiğinde içindeki metni okur
  const gelen_metin = await botun_cevabi.innerText();

  const rule = new RegExp(`(${RULE})`, 'i');

  // 6. Hata kuralı kontrolünü yapar
  expect(gelen_metin, `${WARN} "${gelen_metin}"`).not.toMatch(rule);
});