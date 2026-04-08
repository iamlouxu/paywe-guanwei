import { test, expect } from '@playwright/test';

let testGroupId: string;

test.describe('結算流程', () => {
  // 在所有測試前：建立一個群組並新增一筆花費，這樣才有東西可以結算
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    // 1. 建立群組
    await page.goto('http://localhost:5173/create-group');
    await page.getByPlaceholder('輸入群組名稱 (例如: PayWe 管委會)...').fill('E2E 結算群組');
    
    // 加入一位測試成員
    await page.waitForSelector('button:has-text("加入")', { timeout: 8000 });
    await page.getByRole('button', { name: '加入' }).first().click();
    await page.getByRole('button', { name: '完成建立' }).click();
    await page.waitForURL(/\/group-created\//, { timeout: 10000 });
    testGroupId = page.url().split('/').pop()!;

    // 2. 新增一筆帳目
    await page.goto(`http://localhost:5173/add-expense/${testGroupId}`);
    await page.getByPlaceholder('0').fill('500');
    await page.getByPlaceholder('例如：晚餐、計程車、電影票').fill('結算測試帳目');
    await page.getByRole('button', { name: /確認新增/ }).click();
    await page.waitForURL(`http://localhost:5173/expense-record/${testGroupId}`, { timeout: 10000 });

    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    // 每次測試前都進入這個群組的明細頁
    await page.goto(`/expense-record/${testGroupId}`);
    await page.waitForLoadState('networkidle');
  });

  test('點擊結算清單會跳出確認視窗，且成功結清', async ({ page }) => {
    // 1. 確保畫面上有一筆帳目可以結算
    await expect(page.getByText('結算測試帳目')).toBeVisible();

    // 2. 點擊下方的「結算清單」按鈕 (這會觸發結算確認視窗)
    await page.getByRole('button', { name: '結算清單' }).click();

    // 3. 驗證彈出視窗有顯示出來
    await expect(page.getByText('確定要結清群組嗎？')).toBeVisible();

    // 4. 點擊「是的，確認結清」
    await page.getByRole('button', { name: '是的，確認結清' }).click();

    // 5. 驗證會出現「群組已永久結清」的成功訊息或頁面標籤更新
    // 根據您在 ExpenseRecord 的設定，成功後按鈕會變成「該群組已結清」
    await expect(page.getByRole('button', { name: '該群組已結清' })).toBeVisible({ timeout: 8000 });
  });

  test('已結清的群組，在首頁會顯示已結清標籤', async ({ page }) => {
    // 前一個測試已經把它結清了，回到首頁檢查
    await page.goto('/');
    
    // 首頁群組卡片上應該要有「已結清」的小標籤
    const groupCard = page.locator('a', { hasText: 'E2E 結算群組' });
    await expect(groupCard.getByText('已結清')).toBeVisible();
  });
});
