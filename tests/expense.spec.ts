import { test, expect } from '@playwright/test';

/**
 * 新增帳目測試
 * 因為 AddExpense 需要 groupId，beforeAll 會先透過 UI 建立一個測試群組
 */

let testGroupId: string;

test.describe('新增帳目', () => {
  test.beforeAll(async ({ browser }) => {
    // 用帶有 session 的 context 建立測試群組，取得 groupId
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    await page.goto('http://localhost:5173/create-group');
    await page.getByPlaceholder('輸入群組名稱 (例如: PayWe 管委會)...').fill('E2E 帳目測試群組');

    await page.waitForSelector('button:has-text("加入")', { timeout: 8000 });
    await page.getByRole('button', { name: '加入' }).first().click();

    await page.getByRole('button', { name: '完成建立' }).click();
    await page.waitForURL(/\/group-created\//, { timeout: 10000 });

    // 從 URL 取出 groupId
    testGroupId = page.url().split('/').pop()!;

    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/add-expense/${testGroupId}`);
  });

  test('空白送出 → 顯示金額錯誤', async ({ page }) => {
    await page.getByRole('button', { name: /確認新增/ }).click();
    await expect(page.getByText('請輸入大於 0 的有效金額')).toBeVisible();
  });

  test('有金額但沒填項目名稱 → 顯示項目錯誤', async ({ page }) => {
    await page.getByPlaceholder('0').fill('100');
    await page.getByRole('button', { name: /確認新增/ }).click();
    await expect(page.getByText('請輸入花費項目')).toBeVisible();
  });

  test('完整流程 → 新增成功後跳回帳目清單', async ({ page }) => {
    await page.getByPlaceholder('0').fill('300');
    await page.getByPlaceholder('例如：晚餐、計程車、電影票').fill('E2E 測試帳目');

    await page.getByRole('button', { name: /確認新增/ }).click();

    // 成功後應跳回 /expense-record/:groupId
    await expect(page).toHaveURL(`/expense-record/${testGroupId}`);
  });
});
