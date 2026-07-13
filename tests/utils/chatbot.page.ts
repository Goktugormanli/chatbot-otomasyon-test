import { Page, expect } from '@playwright/test';

export class ChatbotPage {
  readonly page: Page;
  readonly chatButton = '.chat-button';
  readonly messageInput = '[placeholder="İletinizi yazın"]';
  readonly responseSelector = '.webchat__render-markdown';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    const target = process.env.TARGET_URL || 'https://shipeedylojistiktest.arkas.com/yardim';
    await this.page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.locator(this.chatButton).waitFor({ state: 'visible', timeout: 30000 });
  }

  async openChat() {
    await this.page.locator(this.chatButton).click();
    const First_message = this.page.locator(this.responseSelector).first();
    await First_message.waitFor({ state: 'visible', timeout: 30000 });
    await this.page.getByPlaceholder('İletinizi yazın').waitFor({ state: 'visible', timeout: 30000 });
  }


  async verifyGreeting(expectedText: string, timeout = 15000) {
    const initialGreeting = this.page.locator(this.responseSelector).first();
    await initialGreeting.waitFor({ state: 'visible', timeout });
    const actual = (await initialGreeting.innerText()).toLowerCase();
    expect(actual, `Beklenen başlangıç karşılama mesajı bulunamadı: ${expectedText}`).toContain(expectedText.toLowerCase());
  }

  async sendMessage(message: string, timeout = 30000) {
    const input = this.page.getByPlaceholder('İletinizi yazın');
    const previousCount = await this.page.locator(this.responseSelector).count();

    await input.click();
    await input.fill(message);
    await input.press('Enter');

    await this.page.waitForFunction(
      ({ selector, previousCount }) => document.querySelectorAll(selector).length > previousCount,
      { selector: this.responseSelector, previousCount },
      { timeout }
    );
  }

  async getBotResponseText(index = -1, timeout = 15000) {
    const response = index >= 0
      ? this.page.locator(this.responseSelector).nth(index)
      : this.page.locator(this.responseSelector).last();
    await response.waitFor({ state: 'visible', timeout });
    return response.innerText();
  }

  async expectBotResponseContains(expectedText: string, index = -1, timeout = 15000) {
    const actual = (await this.getBotResponseText(index, timeout)).toLowerCase();
    expect(actual, `Bot cevabı beklenen metni içeriyor: ${expectedText}`).toContain(expectedText.toLowerCase());
    return actual;
  }
}
