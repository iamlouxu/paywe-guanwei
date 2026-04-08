import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM 沒有 __dirname，用這個方式取得當前目錄
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 讀取 .env.test，裡面有測試帳號的 email/password
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests',

  // 測試循序跑，避免同時操作 Supabase 產生競爭條件
  fullyParallel: false,

  // CI 上若有 test.only 就報錯
  forbidOnly: !!process.env.CI,

  // 失敗重試一次
  retries: 1,

  // 測試結果用 HTML 報告呈現
  reporter: 'html',

  // 所有測試執行前，先跑 global-setup 做登入
  globalSetup: './playwright/global-setup.ts',

  use: {
    baseURL: 'http://localhost:5173',

    // 帶著登入後的 session 進入每個測試
    storageState: 'playwright/.auth/user.json',

    // 失敗時收集操作軌跡，方便 debug
    trace: 'on-first-retry',

    // Mobile-first：用 iPhone 14 Pro 的尺寸
    viewport: { width: 390, height: 844 },
  },

  projects: [
    // Step 1：先跑 global-setup（登入並儲存 session）
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },

    // Step 2：用 Chromium 跑所有測試，依賴 setup 完成
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
      },
      dependencies: ['setup'],
    },
  ],

  // 借用已在跑的 npm run dev，不重複啟動
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
