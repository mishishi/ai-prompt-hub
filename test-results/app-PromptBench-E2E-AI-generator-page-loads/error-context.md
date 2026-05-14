# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> PromptBench E2E >> AI generator page loads
- Location: e2e\app.spec.ts:51:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3006/generate
Call log:
  - navigating to "http://localhost:3006/generate", waiting until "load"

```

# Test source

```ts
  1  | ﻿import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('PromptBench E2E', () => {
  4  | 
  5  |   test('homepage loads', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  8  |     await expect(page.locator('button:has-text("Prompt")').first()).toBeVisible();
  9  |     await expect(page.locator('button:has-text("模板")').first()).toBeVisible();
  10 |   });
  11 | 
  12 |   test('homepage shows template cards', async ({ page }) => {
  13 |     await page.goto('/');
  14 |     const cards = page.locator('article');
  15 |     await expect(cards.first()).toBeVisible({ timeout: 10000 });
  16 |     const count = await cards.count();
  17 |     expect(count).toBeGreaterThanOrEqual(4);
  18 |   });
  19 | 
  20 |   test('library page loads', async ({ page }) => {
  21 |     await page.goto('/library');
  22 |     await expect(page.locator('input[type="text"]')).toBeVisible({ timeout: 10000 });
  23 |     await expect(page.locator('button:has-text("全部")')).toBeVisible();
  24 |   });
  25 | 
  26 |   test('category filter reduces results', async ({ page }) => {
  27 |     await page.goto('/library');
  28 |     const allCards = await page.locator('article').count();
  29 |     await page.locator('button:has-text("代码审查")').click();
  30 |     await page.waitForTimeout(500);
  31 |     const filteredCards = await page.locator('article').count();
  32 |     expect(filteredCards).toBeLessThan(allCards);
  33 |   });
  34 | 
  35 |   test('search finds templates', async ({ page }) => {
  36 |     await page.goto('/library');
  37 |     await page.fill('input[type="text"]', 'security');
  38 |     await page.waitForTimeout(500);
  39 |     const cards = page.locator('article');
  40 |     await expect(cards.first()).toBeVisible({ timeout: 5000 });
  41 |     const count = await cards.count();
  42 |     expect(count).toBeGreaterThan(0);
  43 |   });
  44 | 
  45 |   test('template detail page renders', async ({ page }) => {
  46 |     await page.goto('/template/security-code-review');
  47 |     await expect(page.locator('h2')).toBeVisible({ timeout: 10000 });
  48 |     await expect(page.locator('button:has-text("复制")').first()).toBeVisible();
  49 |   });
  50 | 
  51 |   test('AI generator page loads', async ({ page }) => {
> 52 |     await page.goto('/generate');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3006/generate
  53 |     await expect(page.locator('textarea')).toBeVisible({ timeout: 10000 });
  54 |     await expect(page.locator('button:has-text("生成")').first()).toBeVisible();
  55 |   });
  56 | 
  57 |   test('language switch to English', async ({ page }) => {
  58 |     await page.goto('/');
  59 |     const langBtn = page.locator('button:has-text("中文")');
  60 |     if (await langBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  61 |       await langBtn.click();
  62 |       await page.waitForTimeout(500);
  63 |       await expect(page.locator('text=Generate Your Prompt')).toBeVisible();
  64 |     }
  65 |   });
  66 | 
  67 |   test('card copy button works', async ({ page }) => {
  68 |     await page.goto('/library');
  69 |     const copyBtn = page.locator('article button:has-text("复制")').first();
  70 |     await copyBtn.click();
  71 |     await expect(page.locator('text=已复制')).toBeVisible({ timeout: 5000 });
  72 |   });
  73 | });
```