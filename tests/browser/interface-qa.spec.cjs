const {test, expect} = require('@playwright/test');
const curriculum = require('../../curriculum/learning.json');

for (const locale of ['en', 'ru']) {
  test(`${locale}: home exposes its active level and accurate catalog totals`, async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto(`/?lang=${locale}`);
    await page.locator('[data-learning-entry=basics]').click();
    await page.locator('#homeCrumb').click();
    await expect(page.locator('.catalog-level-state')).toBeVisible();
    const coreCount = Object.values(curriculum.questions).filter(q => q.level === 'Core').length;
    await expect(page.locator('#view > .controls')).toContainText(String(coreCount));
    const cardCount = await page.locator('.card-count').allTextContents();
    expect(cardCount.reduce((sum, text) => sum + Number(text.match(/\d+/)[0]), 0)).toBe(coreCount);
    await page.locator('[data-clear-catalog-level]').click();
    await expect(page.locator('.catalog-level-state')).toHaveCount(0);
    await expect(page.locator('#view > .controls')).toContainText(String(Object.keys(curriculum.questions).length));
    await page.reload();
    await expect(page.locator('#scope')).toHaveValue('all');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  });
}

test('next and previous stay within a saved collection across sections and languages', async ({page}) => {
  for (const id of ['ABAP-01', 'RAP-03']) {
    await page.goto(`/?lang=en#q-${id}`);
    await page.locator(`[data-save-question=${id}]`).click();
  }
  await page.locator('#savedQuestionsNav').click();
  const ids = await page.locator('.question-row-link').evaluateAll(links => links.map(link => link.dataset.openQuestion));
  expect(ids).toHaveLength(2);
  await page.locator('.question-row-link').first().click();
  await expect(page.locator('.route-position')).toHaveText('1 / 2');
  await page.locator('#nextQuestion').click();
  await expect(page).toHaveURL(new RegExp(`#q-${ids[1]}$`));
  await expect(page.locator('#nextQuestion')).toBeDisabled();
  await page.locator('[data-language=ru]').click();
  await expect(page.locator('.route-position')).toHaveText('2 / 2');
  await page.locator('#previousQuestion').click();
  await expect(page).toHaveURL(new RegExp(`#q-${ids[0]}$`));
  await page.locator('#questionTopic').click();
  await expect(page.locator('.question-row-link')).toHaveCount(2);
});

test('next follows the text-filtered list rather than unrelated questions in the section', async ({page}) => {
  await page.goto('/?lang=en#topic=rap&search=authorization');
  const ids = await page.locator('.question-row-link').evaluateAll(links => links.map(link => link.dataset.openQuestion));
  expect(ids.length).toBeGreaterThan(1);
  await page.locator('.question-row-link').first().click();
  await expect(page.locator('.route-position')).toHaveText(`1 / ${ids.length}`);
  await page.locator('#nextQuestion').click();
  await expect(page).toHaveURL(new RegExp(`#q-${ids[1]}$`));
  await page.locator('#questionTopic').click();
  await expect(page.locator('#search')).toHaveValue('authorization');
});
