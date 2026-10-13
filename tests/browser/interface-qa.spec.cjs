const {test, expect} = require('@playwright/test');
const curriculum = require('../../curriculum/learning.json');

for (const locale of ['en', 'ru']) for (const width of [390, 1440]) {
  test(`${locale} ${width}: sidebar counts align and long titles never cover disclosures`, async ({page}) => {
    await page.setViewportSize({width, height: 950});
    await page.goto(`/?lang=${locale}`);
    if (width < 900) await page.locator('#menuToggle').click();
    const checkColumns = async () => {
      const geometry = await page.locator('#segments').evaluate(nav => {
        const right = node => node.getBoundingClientRect().right;
        const rows = [...nav.querySelectorAll('.nav-topic-row')].map(row => {
          const title = row.querySelector('.nav-title'), count = row.querySelector('.nav-count');
          const toggle = row.querySelector('.nav-disclosure');
          return {titleRight: right(title), countLeft: count.getBoundingClientRect().left,
            countRight: right(count), toggleLeft: toggle.getBoundingClientRect().left,
            overflow: title.scrollWidth - title.clientWidth};
        });
        return {rows, counts: [...nav.querySelectorAll('.nav-topic>.nav-count,.nav-library .nav-count')].map(right)};
      });
      expect(Math.max(...geometry.counts) - Math.min(...geometry.counts)).toBeLessThan(1);
      for (const row of geometry.rows) {
        expect(row.titleRight).toBeLessThanOrEqual(row.countLeft - 4);
        expect(row.countRight).toBeLessThanOrEqual(row.toggleLeft - 4);
        expect(row.overflow).toBeLessThanOrEqual(1);
      }
    };
    await checkColumns();
    await page.locator('[data-expand-topic=sql]').click();
    await expect(page.locator('#subtopics-sql')).toBeVisible();
    await checkColumns();
    await page.locator('#guidedLessonsNav').click();
    await expect(page.locator('#guidedLessonsNav')).toHaveAttribute('aria-current', 'page');
  });
}

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
