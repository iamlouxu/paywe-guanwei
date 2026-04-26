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
    
    //   抓取選單內的所有成員
    const options = page.locator('.absolute.top-full button');
    await expect(options).toHaveCount(3);
    
    //   動態辨識誰是「我」：預設付款人旁邊會有 check icon (✓)
    //   不能用固定 index，因為 Supabase 回傳的成員順序不固定
    const friends: { name: string; index: number }[] = [];
    let myName = '';

    for (let i = 0; i < 3; i++) {
      const name = await options.nth(i).locator('span.flex-1').innerText();
      const hasCheck = await options.nth(i).locator('span.material-symbols-outlined', { hasText: 'check' }).count();
      if (hasCheck > 0) {
        myName = name;
      } else {
        friends.push({ name, index: i });
      }
    }

    const friendA = friends[0].name;
    const friendB = friends[1].name;

    //   點擊朋友 A 作為付款人
    await options.nth(friends[0].index).click();

    //   等待下拉選單的 AnimatePresence 退場動畫完全結束
    await expect(page.locator('.absolute.top-full')).not.toBeVisible({ timeout: 3000 });
    //   驗證付款人顯示已經切換成 friendA，確保 React state 已更新
    await expect(page.locator('button').filter({ hasText: 'expand_more' })).toContainText(friendA);

    await page.getByRole('button', { name: /確認新增/ }).click();
    await page.waitForURL(`http://localhost:5173/expense-record/${testGroupId}`);

    // 3. 前往專屬的結算畫面 (Settlement.tsx) 檢視最佳化結果
    await page.goto(`http://localhost:5173/settlement/${testGroupId}`);
    await page.waitForLoadState('networkidle');

    // 4. 驗證數學邏輯！
    //   驗證點 A：畫面上應該會有 $150 的轉帳
    //   (加上 .first() 避免畫面其他區塊剛好算成 $150 而導致 Playwright 嚴格模式衝突)
    await expect(page.getByText('$150').first()).toBeVisible();
    await expect(page.getByText('$300')).not.toBeVisible();
    await expect(page.getByText('$100')).not.toBeVisible(); // 確保傳統的 "B還我100, B還A50" 的舊邏輯沒有出現

    //   驗證點 B：轉帳來源必須是 friendB
    await expect(page.getByText(friendB)).toBeVisible();

    //   驗證點 C：整個結算清單應該「只會有一筆」被最佳化後的轉帳 (朋友B -> 我 $150)
    //   如果結算邏輯沒有成功優化，就會顯示超過一筆。這比判斷文字更精準，且能避免同名問題。
    const transactionRows = page.locator('.grid.gap-4 > div');
    await expect(transactionRows).toHaveCount(1);
  });
});
