import { test } from '@playwright/test';
import { ChatbotPage } from './utils/chatbot.page';
import { testData } from './utils/testData';

test.describe('Happy Path', () => {
  for (const scenario of testData.happyPath) {
    test(scenario.name, async ({ page }) => {
      const chatbot = new ChatbotPage(page);

      await test.step('Sayfayı aç ve sohbet penceresini başlat', async () => {
        await chatbot.goto();
        await chatbot.openChat();
      });

      if (scenario.greeting) {
        await test.step('Botun ilk karşılama mesajını doğrula', async () => {
          await chatbot.verifyGreeting(scenario.greeting);
        });
      }

      await test.step('Soruyu yaz ve gönder', async () => {
        await chatbot.sendMessage(scenario.message);
      });

      await test.step('Botun doğru cevabı verdiğini kontrol et', async () => {
        await chatbot.expectBotResponseContains(scenario.expectedContains);
      });
    });
  }
});
