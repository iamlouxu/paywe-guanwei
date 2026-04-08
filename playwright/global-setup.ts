import { chromium, type FullConfig } from '@playwright/test';

/**
 * 在所有測試開始前執行一次：
 * 用測試帳號登入，把 Supabase session 存到 playwright/.auth/user.json
 * 之後每個測試直接帶這份 session，不需要重複登入
 */
async function globalSetup(_config: FullConfig) {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      '找不到測試帳號！請確認 .env.test 裡有設定 TEST_EMAIL 和 TEST_PASSWORD'
    );
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 前往登入頁
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');

  // 填入信箱（登入表單的第一個 input）
  await page.getByPlaceholder('信箱').first().fill(email);

  // 填入密碼
  await page.getByPlaceholder('密碼').first().fill(password);

  // 同時開始等待導航 + 點擊按鈕，避免 race condition
  await Promise.all([
    page.waitForURL('http://localhost:5173/', { timeout: 15000 }),
    page.getByRole('button', { name: '登入帳號' }).click(),
  ]);

  // 把 Supabase 存在 localStorage 的 session 儲存起來
  await page.context().storageState({ path: 'playwright/.auth/user.json' });

  console.log('✅ 測試帳號登入成功，session 已儲存');

  await browser.close();
}

export default globalSetup;
