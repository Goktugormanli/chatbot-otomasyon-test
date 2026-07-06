import { test } from '@playwright/test';
import { ChatbotPage } from './utils/chatbot.page';
import { testData } from './utils/testData';

test.describe('Graceful Fallback', () => {
  for (const scenario of testData.outOfDomain) {
    test(scenario.name, async ({ page }) => {
      const chatbot = new ChatbotPage(page);

      await test.step('Sayfayı aç ve sohbet penceresini başlat', async () => {
        await chatbot.goto();
        await chatbot.openChat();
      });

      await test.step('Bağlam dışı soruyu yaz ve gönder', async () => {
        await chatbot.sendMessage(scenario.message);
      });

      await test.step('Botun kibar ret mesajını doğrula', async () => {
        await chatbot.expectBotResponseContains(scenario.expectedContains);
      });
    });
  }
});
