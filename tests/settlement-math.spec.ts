import { test, expect } from '@playwright/test';

let testGroupId: string;

test.describe('結算數學邏輯最佳化', () => {
  test.beforeAll(async ({ browser }) => {
    // 建立新視窗與登入 session
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    // 1. 建立有 3 個人的群組 (測試帳號本身 + 2 位朋友)
    await page.goto('http://localhost:5173/create-group');
    await page.getByPlaceholder('輸入群組名稱').fill('E2E 數學邏輯群組');
    
    // 等待名單載入並加入前兩位成員
    await page.waitForSelector('button:has-text("加入")', { timeout: 8000 });
    // 因為按了第一個加入後，列表會更新，最好的做法是固定點擊清單裡的第一個「加入」按鈕兩次
    await page.getByRole('button', { name: '加入' }).first().click();
    await page.waitForTimeout(500); // 稍微等列表動畫
    await page.getByRole('button', { name: '加入' }).first().click();
    
    await page.getByRole('button', { name: '完成建立' }).click();
    await page.waitForURL(/\/group-created\//, { timeout: 10000 });
    
    testGroupId = page.url().split('/').pop()!;
    await context.close();
  });

  test('多筆帳務互相抵銷：最佳化結算路徑測試', async ({ page }) => {
    // ---- 情境設計 ----
    // 總共 3 人：我 (TestUser), 朋友A, 朋友B
    // 帳單 1：我付了 $300，三人平分。
    //   -> 我 +200, 朋友A -100, 朋友B -100
    // 帳單 2：朋友A付了 $150，三人平分。
    //   -> 朋友A +100, 我 -50, 朋友B -50
    // 
    // ---- 期望最佳化結果 ----
    // 我的最終餘額：+150
    // 朋友A最終餘額：0 (完美抵銷，不欠人也不用收錢)
    // 朋友B最終餘額：-150
    // --> 畫面上應該只出現 1 筆轉帳：朋友B 轉帳給 我 $150。而且畫面上不該出現朋友A的名字。
    
    // 1. 登記第一筆：我付了 $300
    await page.goto(`http://localhost:5173/add-expense/${testGroupId}`);
    await page.getByPlaceholder('0').fill('300');
    await page.getByPlaceholder('例如：晚餐、計程車、電影票').fill('第一筆代墊');
    await page.getByRole('button', { name: /確認新增/ }).click();
    await page.waitForURL(`http://localhost:5173/expense-record/${testGroupId}`);

    // 2. 登記第二筆：朋友A 付了 $150
    await page.goto(`http://localhost:5173/add-expense/${testGroupId}`);
    await page.getByPlaceholder('0').fill('150');
    await page.getByPlaceholder('例如：晚餐、計程車、電影票').fill('第二筆朋友代墊');

    //   打開「誰付的錢？」下拉選單
    await page.locator('button').filter({ hasText: 'expand_more' }).click();
    
    //   抓取選單內的所有成員名字，方便待會做驗證
    const options = page.locator('.absolute.top-full button');
    await expect(options).toHaveCount(3);
    
    //   nth(0) 通常是自己，nth(1) 是朋友A，nth(2) 是朋友B
    const myName = await options.nth(0).locator('span.flex-1').innerText();
    const friendA = await options.nth(1).locator('span.flex-1').innerText();
    const friendB = await options.nth(2).locator('span.flex-1').innerText();

    //   點擊朋友 A 作為付款人
    await options.nth(1).click();
    await page.getByRole('button', { name: /確認新增/ }).click();
    await page.waitForURL(`http://localhost:5173/expense-record/${testGroupId}`);

    // 3. 前往專屬的結算畫面 (Settlement.tsx) 檢視最佳化結果
    await page.goto(`http://localhost:5173/settlement/${testGroupId}`);
    await page.waitForLoadState('networkidle');

    // 4. 驗證數學邏輯！
    //   驗證點 A：畫面上應該只會有「一筆」 $150 的轉帳
    await expect(page.getByText('$150')).toBeVisible();
    await expect(page.getByText('$300')).not.toBeVisible();
    await expect(page.getByText('$100')).not.toBeVisible(); // 確保傳統的 "B還我100, B還A50" 的舊邏輯沒有出現

    //   驗證點 B：轉帳來源必須是 friendB
    await expect(page.getByText(friendB)).toBeVisible();

    //   驗證點 C：畫面上絕對不能出現 friendA 的名字 (因為他的帳已經透過結算邏輯在背景抵銷變 0 了)
    //   我們確保轉帳的清單裡沒有他
    const transactionSection = page.locator('.grid.gap-4');
    await expect(transactionSection.locator(`text=${friendA}`)).not.toBeVisible();
  });
});
