import { test } from '@playwright/test';
import { ChatbotPage } from './utils/chatbot.page';
import { testData } from './utils/testData';

test.describe('Hard Exception', () => {
  for (const scenario of testData.safetyExceptions) {
    test(scenario.name, async ({ page }) => {
      const chatbot = new ChatbotPage(page);

      await test.step('Sayfayı aç ve sohbet penceresini başlat', async () => {
        await chatbot.goto();
        await chatbot.openChat();
      });

      await test.step('Tehlikeli isteği yaz ve gönder', async () => {
        await chatbot.sendMessage(scenario.message);
      });

      await test.step('Botun güvenlik filtresi uyarısını doğrula', async () => {
        await chatbot.expectBotResponseContains(scenario.expectedContains);
      });
    });
  }
});
