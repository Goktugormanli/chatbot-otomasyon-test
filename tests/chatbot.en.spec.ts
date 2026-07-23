import { test } from '@playwright/test';
import { ChatbotPage } from './utils/chatbot.page';
import { getScenariosForLocale } from './utils/scenarios';

/**
 * Bu dosyaya yeni bir senaryo eklemek İÇİN KOD DEĞİŞTİRMEK GEREKMEZ.
 * Tüm senaryolar tests/data/testData.json içinden okunur (Dil sütunu
 * "en" olan satırlar burada çalışır).
 * Yeni senaryo eklemek/düzenlemek için bkz. SENARYO-YAZMA-REHBERI.md
 */
const scenarios = getScenariosForLocale('en');

test.describe('Chatbot Senaryoları (EN)', () => {
  for (const scenario of scenarios) {
    test(scenario.name, async ({ page }) => {
      const chatbot = new ChatbotPage(page, 'en');

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