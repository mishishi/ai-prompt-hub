import { test, expect } from '@playwright/test';

test.describe('PromptBench E2E', () => {

  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10000 });
  });

  test('library page loads with categories', async ({ page }) => {
    await page.goto('/library');
    await expect(page.locator('input[type="text"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("全部")')).toBeVisible();
  });

  test('category filter reduces results', async ({ page }) => {
    await page.goto('/library');
    const allCards = await page.locator('article').count();
    await page.locator('button:has-text("代码审查")').click();
    await page.waitForTimeout(500);
    const filteredCards = await page.locator('article').count();
    expect(filteredCards).toBeLessThan(allCards);
  });

  test('search finds templates', async ({ page }) => {
    await page.goto('/library');
    await page.fill('input[type="text"]', 'security');
    await page.waitForTimeout(500);
    const cards = page.locator('article');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('template detail page renders', async ({ page }) => {
    await page.goto('/template/security-code-review');
    await expect(page.locator('button:has-text("返回")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("复制")').first()).toBeVisible();
  });

  test('AI generator page loads', async ({ page }) => {
    await page.goto('/generate');
    await expect(page.locator('textarea')).toBeVisible({ timeout: 10000 });
  });

  test('card copy shows feedback', async ({ page }) => {
    await page.goto('/library');
    const copyBtn = page.locator('article button:has-text("复制")').first();
    await copyBtn.click();
    await expect(page.locator('text=已复制')).toBeVisible({ timeout: 5000 });
  });
});