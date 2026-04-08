import { test, expect } from '@playwright/test';

test.describe('建立群組', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create-group');
  });

  test('空白送出 → 顯示群組名稱錯誤', async ({ page }) => {
    await page.getByRole('button', { name: '完成建立' }).click();
    await expect(page.getByText('請填寫群組名稱')).toBeVisible();
  });

  test('只填名稱、不加成員 → 顯示成員錯誤', async ({ page }) => {
    await page.getByPlaceholder('輸入群組名稱 (例如: PayWe 管委會)...').fill('E2E 測試群組');
    await page.getByRole('button', { name: '完成建立' }).click();
    await expect(page.getByText('請至少加入一位成員才能建立分帳群組')).toBeVisible();
  });

  test('完整流程 → 建立成功後跳到 /group-created', async ({ page }) => {
    await page.getByPlaceholder('輸入群組名稱 (例如: PayWe 管委會)...').fill('E2E 測試群組');

    // 等待推薦成員清單出現（需要 Supabase 回應），然後加入第一位
    await page.waitForSelector('button:has-text("加入")', { timeout: 8000 });
    await page.getByRole('button', { name: '加入' }).first().click();

    await page.getByRole('button', { name: '完成建立' }).click();

    // 成功後應跳轉到 /group-created/:groupId
    await expect(page).toHaveURL(/\/group-created\//);
  });
});
