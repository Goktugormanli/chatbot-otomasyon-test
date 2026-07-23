import { test } from '@playwright/test';
import { ChatbotPage } from './utils/chatbot.page';
import { testData } from './utils/testData';

/**
 * Bu dosyaya yeni bir senaryo eklemek İÇİN KOD DEĞİŞTİRMEK GEREKMEZ.
 * Tüm senaryolar tests/data/testData.json içinden okunur (Dil sütunu
 * boş veya "tr" olan satırlar "tr", "en" olanlar "en" olarak isimlendirilir).
 * Yeni senaryo eklemek/düzenlemek için bkz. SENARYO-YAZMA-REHBERI.md
 *
 * Sadece tek bir dili çalıştırmak istersen (dosya bölmeye gerek yok):
 *   npx playwright test --grep "@tr"
 *   npx playwright test --grep "@en"
 */
test.describe('Chatbot Senaryoları', () => {
  for (const scenario of testData.scenarios) {
    test(`${scenario.name} @${scenario.language}`, async ({ page }) => {
      const chatbot = new ChatbotPage(page, scenario.language);

      await test.step('Sayfayı aç, dili ayarla ve sohbet penceresini başlat', async () => {
        await chatbot.goto();
        await chatbot.switchLanguage();
        await chatbot.openChat();
      });

      if (scenario.greeting) {
        await test.step('Botun ilk karşılama mesajını doğrula', async () => {
          await chatbot.verifyGreeting(scenario.greeting!);
        });
      }

      for (const [index, turn] of scenario.turns.entries()) {
        await test.step(`Tur ${index + 1}: "${turn.message}"`, async () => {
          await chatbot.sendMessage(turn.message);
          await chatbot.expectBotResponseContains(turn.expectedContains);
        });
      }
    });
  }
});