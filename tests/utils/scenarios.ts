import { testData, ChatScenario } from './testData';
import { ChatLocale } from './chatbot.page';

/**
 * testData.json icindeki senaryolardan sadece verilen locale'e ait
 * olanlari dondurur. Bu dosyada test.describe()/test() cagrilmaz -
 * sadece veri filtreler. test.describe()/test() cagrilari spec
 * dosyalarinin (chatbot.spec.ts, chatbot.en.spec.ts) icinde kalir.
 */
export function getScenariosForLocale(locale: ChatLocale): ChatScenario[] {
  return testData.scenarios.filter((s) => (s.language || 'tr') === locale);
}