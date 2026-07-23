import * as fs from 'fs';
import * as path from 'path';
import type { ChatLocale } from './chatbot.page';

/**
 * Tek bir sohbet turu: kullanıcının gönderdiği mesaj ve botun
 * cevabında bulunması beklenen metin.
 */
export interface ChatTurn {
  message: string;
  expectedContains: string;
}

/**
 * Bir test senaryosu. `turns` dizisi 1 veya daha fazla eleman
 * içerebilir; birden fazla eleman uzun/çok turlu bir diyaloğu test eder.
 */
export interface ChatScenario {
  name: string;
  /** Opsiyonel: sohbet açıldığında botun ilk karşılama mesajı kontrol edilsin mi? */
  greeting?: string;
  turns: ChatTurn[];
  /** CSV'deki "Dil" sütunundan gelir. Boşsa csv-to-json.js 'tr' atar. */
  language: ChatLocale;
}

export interface TestData {
  scenarios: ChatScenario[];
}

const dataPath = path.resolve(__dirname, '../data/testData.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');

export const testData = JSON.parse(rawData) as TestData;