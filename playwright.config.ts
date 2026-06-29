import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Testler bittiğinde HTML formatında görsel bir rapor sunar */
  reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }]],

  use: {
    /* Hata olursa, hatanın nerede olduğunu inceleyebilmek için detaylı log tutar */
    trace: 'retain-on-failure',
    /* Sadece hata olduğunda ekran görüntüsü alır */
    screenshot: 'only-on-failure',
  },
});