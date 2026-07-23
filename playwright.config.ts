import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/legacy/**'],
  
  /* Testler bittiğinde hem HTML hem de JSON formatında rapor sunar */
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  use: {
    baseURL: process.env.TARGET_URL || 'https://shipeedylojistiktest.arkas.com/yardim',
    channel: 'chrome',
    /* Hata olursa, hatanın nerede olduğunu inceleyebilmek için detaylı log tutar */
    trace: 'retain-on-failure',
    /* Sadece hata olduğunda ekran görüntüsü alır */
    screenshot: 'only-on-failure',
  },
});
