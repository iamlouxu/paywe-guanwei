import { test, expect } from '@playwright/test';

/**
 * 登入流程測試
 * 注意：這些測試「不使用」global-setup 的 storageState
 * 因為測試對象本身就是登入頁，需要從未登入狀態開始
 */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('登入頁', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('空白送出 → 顯示錯誤訊息', async ({ page }) => {
    await page.getByRole('button', { name: '登入帳號' }).click();
    await expect(page.getByText('請填寫信箱和密碼')).toBeVisible();
  });

  test('帳密正確 → 跳到首頁', async ({ page }) => {
    await page.getByPlaceholder('信箱').first().fill(process.env.TEST_EMAIL!);
    await page.getByPlaceholder('密碼').first().fill(process.env.TEST_PASSWORD!);
    await page.getByRole('button', { name: '登入帳號' }).click();

    await expect(page).toHaveURL('/');
  });

  test('帳密錯誤 → 顯示錯誤訊息', async ({ page }) => {
    await page.getByPlaceholder('信箱').first().fill('wrong@email.com');
    await page.getByPlaceholder('密碼').first().fill('wrongpassword');
    await page.getByRole('button', { name: '登入帳號' }).click();

    await expect(page.getByText('信箱或密碼不正確')).toBeVisible();
  });
});
