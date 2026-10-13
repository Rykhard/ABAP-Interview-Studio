const {test, expect} = require('@playwright/test');
const curriculum = require('../../curriculum/learning.json');

test('answer batches retain the full navigation set and loaded count across language changes', async ({page}) => {
  await page.goto('/?lang=en#view=list');
  await page.locator('#expandAll').click();
  await expect(page.locator('.question-group article')).toHaveCount(20);
  await expect(page.locator('.answer-pagination')).toContainText(`20 / ${Object.keys(curriculum.questions).length}`);
  await page.locator('#moreAnswers').click();
  await expect(page.locator('.question-group article')).toHaveCount(40);
  const selected = page.locator('.question-group article').nth(39);
  const id = await selected.getAttribute('id');
  await selected.locator('h3 a').click();
  await expect(page.locator('.route-position')).toHaveText(`40 / ${Object.keys(curriculum.questions).length}`);
  await page.locator('#nextQuestion').click();
  await expect(page.locator('.route-position')).toHaveText(`41 / ${Object.keys(curriculum.questions).length}`);
  await page.locator('[data-language=ru]').click();
  await page.locator('#questionTopic').click();
  await expect(page.locator('.question-group article')).toHaveCount(60);
  await expect(page.locator(`#${id}`)).toBeAttached();
  await expect(page.locator('#moreAnswers')).toHaveText('Показать ещё ответы');
  await page.locator('#collapseAll').click();
  await expect(page.locator('.question-row-link')).toHaveCount(Object.keys(curriculum.questions).length);
});

test('modified question links keep native tab behavior', async ({page}) => {
  await page.goto('/?lang=en#topic=rap');
  const link = page.locator('.question-row-link').first();
  const handled = await link.evaluate(node => {
    const event = new MouseEvent('click', {bubbles: true, cancelable: true, button: 0, ctrlKey: true});
    node.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(handled).toBe(false);
  await expect(page).toHaveURL(/#topic=rap$/);
  await link.click();
  await expect(page).toHaveURL(/#q-/);
});

test('irrelevant content updates preserve sidebar nodes and malformed links remain usable', async ({page}) => {
  for (const fragment of ['', '#q-NOT-A-QUESTION', '#q-%E0%A4%A', '#unknown']) {
    await page.goto('/?lang=en' + fragment);
    await expect(page.locator('.topic-card').first()).toBeVisible();
  }
  await page.goto('/?lang=en#topic=rap');
  await page.locator('[data-expand-topic=rap]').click();
  const original = await page.locator('#subtopics-rap .nav-section').first().elementHandle();
  await page.locator('#learnFilters > summary').click();
  await page.locator('#search').fill('authorization');
  await expect(page.locator('.question-row-link').first()).toBeVisible();
  expect(await original.evaluate(node => node.isConnected)).toBe(true);
  await page.locator('.question-row-link').first().click();
  await page.locator('[data-save-question]').click();
  await expect(page.locator('#savedQuestionsNav .nav-count')).toHaveText('1');
});

for (const locale of ['en', 'ru']) for (const width of [390, 1440]) {
  test(`${locale} ${width}: practice level picker keeps a compact height`, async ({page}) => {
    await page.setViewportSize({width, height: 950});
    await page.goto(`/?lang=${locale}#mode=train&topic=rap&section=rap-model`);
    for (const kind of ['recall', 'quiz']) {
      await page.locator(`#${kind}Kind`).click();
      for (const level of ['all', 'Advanced']) {
        await page.locator('#scope').selectOption(level);
        const before = await page.locator('#scope').boundingBox();
        expect(before.height).toBeLessThan(90);
        expect(before.height).toBeGreaterThanOrEqual(44);
        await page.locator('#scope').click();
        const opened = await page.locator('#scope').boundingBox();
        expect(opened.height).toBe(before.height);
        await page.keyboard.press('Escape');
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  });
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
    // Every expanded group keeps its counts in a fixed column, including wrapped translations.
    for (const topic of ['rap', 'sql', 'integration']) {
      const toggle = page.locator(`[data-expand-topic=${topic}]`);
      if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
      const rows = await page.locator(`#subtopics-${topic} .nav-section`).evaluateAll(buttons => buttons.map(button => {
        const title = button.querySelector('.nav-section-title').getBoundingClientRect();
        const count = button.querySelector('.nav-count').getBoundingClientRect();
        return {titleRight: title.right, countLeft: count.left, countRight: count.right,
          overflow: button.scrollWidth - button.clientWidth};
      }));
      expect(Math.max(...rows.map(row => row.countRight)) - Math.min(...rows.map(row => row.countRight))).toBeLessThan(1);
      for (const row of rows) {
        expect(row.titleRight).toBeLessThanOrEqual(row.countLeft - 4);
        expect(row.overflow).toBeLessThanOrEqual(1);
      }
    }
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
