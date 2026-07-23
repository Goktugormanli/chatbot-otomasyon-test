import { Page, expect } from '@playwright/test';

export type ChatLocale = 'tr' | 'en';

interface LocaleConfig {
  messagePlaceholder: string;
  // Sadece TR disindaki diller icin kullanilir.
  languageButtonSelector?: string;
  // MUI Select bir dropdown actigi icin option'a getByRole ile erisiliyor,
  // bu yuzden selector string yerine erisilebilir isim (accessible name) tutuyoruz.
  languageOptionName?: string;
}

const LOCALES: Record<ChatLocale, LocaleConfig> = {
  tr: {
    messagePlaceholder: 'İletinizi yazın',
  },
  en: {
    messagePlaceholder: 'Type your message', // TODO: dil degistikten sonra input placeholder'i gercekten degisiyor mu, kontrol et
    languageButtonSelector: '.MuiSelect-root',
    languageOptionName: 'EN',
  },
};

export class ChatbotPage {
  readonly page: Page;
  readonly chatButton = '.chat-button';
  readonly responseSelector = '.webchat__render-markdown';
  readonly locale: ChatLocale;

  constructor(page: Page, locale: ChatLocale = 'tr') {
    this.page = page;
    this.locale = locale;
  }

  private get messagePlaceholder() {
    return LOCALES[this.locale].messagePlaceholder;
  }

  async goto() {
    const target = process.env.TARGET_URL || 'https://shipeedylojistiktest.arkas.com/yardim';
    await this.page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.locator(this.chatButton).waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Sayfa dilini locale'e gore ayarlar. TR icin no-op'tur (varsayilan dil).
   * goto() sonrasi, openChat() ONCESINDE cagrilmalidir - cunku dil degisince
   * sayfa yeniden render olabilir ve chat-button/placeholder referanslari
   * degisebilir.
   */
  async switchLanguage() {
    const config = LOCALES[this.locale];
    if (!config.languageButtonSelector) return; // TR: yapilacak bir sey yok

    await this.page.locator(config.languageButtonSelector).click();
    await this.page.getByRole('option', { name: config.languageOptionName! }).click();
    // Dil degisince i18n metinlerinin/DOM'un guncellenmesi icin kisa bekleme
    await this.page.waitForTimeout(500);
  }

  async openChat() {
    await this.page.locator(this.chatButton).click();
    const First_message = this.page.locator(this.responseSelector).first();
    await First_message.waitFor({ state: 'visible', timeout: 30000 });
    await this.page.getByPlaceholder(this.messagePlaceholder).waitFor({ state: 'visible', timeout: 30000 });
  }

  async verifyGreeting(expectedText: string, timeout = 15000) {
    const initialGreeting = this.page.locator(this.responseSelector).first();
    await initialGreeting.waitFor({ state: 'visible', timeout });
    const actual = (await initialGreeting.innerText()).toLowerCase();
    expect(actual, `Beklenen başlangıç karşılama mesajı bulunamadı: ${expectedText}`).toContain(expectedText.toLowerCase());
  }

  async sendMessage(message: string, timeout = 30000) {
    const input = this.page.getByPlaceholder(this.messagePlaceholder);
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
    expect(actual, `Bot cevabı beklenen metni içermiyor: ${expectedText}`).toContain(expectedText.toLowerCase());
    return actual;
  }
}