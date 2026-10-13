const {test, expect} = require('@playwright/test');
const {pathToFileURL} = require('node:url');
const path = require('node:path');

for (const locale of ['en', 'ru']) for (const width of [390, 1440]) {
  test(`${locale} ${width}: navigate, search, code, diagrams and saved progress`, async ({page}) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({width, height: 950});
    await page.goto(`/?lang=${locale}`);
    await expect(page.locator('.topic-card')).toHaveCount(10);
    // Instrumentation confirms diagrams are not parsed on the catalog screen.
    expect(await page.evaluate(() => studioDataCache.has('diagram-data'))).toBe(false);
    await page.locator('.topic-card[data-open=rap]').click();
    await expect(page.locator('.topic-start [data-open-question]')).toHaveCount(3);
    await page.keyboard.press('Control+k');
    await page.locator('#globalSearchInput').fill('save sequence');
    await expect(page.locator('[data-search-result]').first()).toHaveAttribute('data-search-result', 'RAP-05');
    await page.locator('[data-search-result=RAP-05]').click();
    await expect(page).toHaveURL(/#q-RAP-05$/);
    await page.goto(`/?lang=${locale}#q-ABAP-01`);
    await page.locator('[data-save-question=ABAP-01]').click();
    await page.locator('[data-study-view=developer]').click();
    await expect(page.locator('.code-window')).toContainText('TABLE');
    await page.locator('[data-code-step]').last().click();
    await expect(page.locator('[data-code-step]').last()).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-study-view=calm]').click();
    await expect(page.locator('.diagram-canvas .selectable-diagram')).toBeVisible();
    await page.locator('[data-open-visual]').first().click();
    await expect(page.locator('#visualDialog')).toBeVisible();
    await page.locator('#closeVisual').click();
    await page.locator('#themeSwitch').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('[data-save-question=ABAP-01]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
    expect(errors).toEqual([]);
  });
}

test('quiz session survives locale switching and saves the selected answer', async ({page}) => {
  await page.goto('/?lang=en#mode=train&kind=quiz&size=5&topic=rap');
  await page.locator('#startPractice').click();
  const id = (await page.locator('.session-card .meta').innerText()).split(' ')[0];
  await page.locator('[data-choice]').first().click();
  await page.locator('[data-language=ru]').click();
  await expect(page.locator('.session-card .meta')).toContainText(id);
  await expect(page.locator('[data-choice][aria-pressed=true]')).toHaveCount(1);
  await page.locator('#checkQuiz').click();
  await expect(page.locator('#sessionFeedback')).toBeVisible();
  await expect(page.locator('#nextPractice')).toBeEnabled();
});

test('offline file works without network and reduced motion disables navigation animation', async ({page, context}) => {
  await context.setOffline(true);
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(pathToFileURL(path.resolve('START_HERE.html')).href + '?lang=ru#q-ADV-02');
  await expect(page.locator('.focused-card')).toContainText('Global');
  await page.locator('[data-study-view=developer]').click();
  await page.locator('[data-code-choice]').selectOption('instance-project-authorization');
  await expect(page.locator('.code-window')).toContainText('AUTHORITY-CHECK');
  await page.evaluate(() => document.querySelector('#segments .nav-topic[data-topic=cds]').click());
  await expect(page.locator('.nav-motion-indicator')).toHaveCount(0);
  await expect(page.locator('.topic-start [data-open-question]')).toHaveCount(3);
});
