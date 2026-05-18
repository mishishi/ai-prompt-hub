import { test, expect } from '@playwright/test';

test.describe('PromptBench E2E', () => {

  async function goToPage(page, url) {
    await page.addInitScript(() => {
      localStorage.setItem('promptbench-onboarding', '1');
    });
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  }

  test('homepage loads', async ({ page }) => {
    await goToPage(page, '/');
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15000 });
  });

  test('library page loads with categories', async ({ page }) => {
    await goToPage(page, '/library');
    await expect(page.locator('input[type="text"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('button').filter({ hasText: /全部|All/ }).first()).toBeVisible({ timeout: 5000 });
  });

  test('category filter reduces results', async ({ page }) => {
    await goToPage(page, '/library');
    const allCards = await page.locator('article').count();
    const catBtn = page.locator('button').filter({ hasText: /代码审查|Review/ }).first();
    if (await catBtn.isVisible().catch(() => false)) {
      await catBtn.click();
      await page.waitForTimeout(500);
      const filteredCards = await page.locator('article').count();
      expect(filteredCards).toBeLessThan(allCards);
    }
  });

  test('search finds templates', async ({ page }) => {
    await goToPage(page, '/library');
    await page.fill('input[type="text"]', 'security');
    await page.waitForTimeout(500);
    const cards = page.locator('article');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('template detail page renders', async ({ page }) => {
    await goToPage(page, '/template/security-code-review');
    // The detail page has an h2 with the template name
    await expect(page.locator('h2').first()).toBeVisible({ timeout: 15000 });
  });

  test('AI generator page loads', async ({ page }) => {
    await goToPage(page, '/generate');
    await expect(page.locator('textarea')).toBeVisible({ timeout: 15000 });
  });

  test('card copy button text changes', async ({ page }) => {
    await goToPage(page, '/library');
    const copyBtn = page.locator('article button').filter({ hasText: /Copy|复制/ }).first();
    await copyBtn.click();
    // Button text should change to "Copied!" / "已复制！"
    await expect(copyBtn).toContainText(/Copied|已复制/, { timeout: 5000 });
  });
});
