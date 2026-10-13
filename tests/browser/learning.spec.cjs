const {test, expect} = require('@playwright/test');
const curriculum = require('../../curriculum/learning.json');

for (const locale of ['en', 'ru']) {
  test(`${locale}: learning filters persist and transfer to practice`, async ({page}) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/?lang=${locale}`);
    await page.locator('[data-learning-entry=basics]').click();
    await expect(page.locator('#scope')).toHaveValue('Core');
    const ids = await page.locator('.question-row-link').evaluateAll(links => links.map(link => link.dataset.openQuestion));
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.every(id => curriculum.questions[id].level === 'Core')).toBe(true);
    await page.locator('#learnFilters > summary').click();
    await page.locator('#scope').selectOption('Applied');
    await page.locator('#learningSort').selectOption('id');
    await page.reload();
    await expect(page.locator('#scope')).toHaveValue('Applied');
    await expect(page.locator('#learningSort')).toHaveValue('id');
    const applied = await page.locator('.question-row-link').evaluateAll(links => links.map(link => link.dataset.openQuestion));
    expect(applied.length).toBeGreaterThan(0);
    expect(applied.every(id => curriculum.questions[id].level === 'Applied')).toBe(true);
    await page.locator('.question-row-link').first().click();
    await page.locator('#questionTopic').click();
    await expect(page.locator('#scope')).toHaveValue('Applied');
    await page.locator('#practiceSelection').click();
    await expect(page.locator('#scope')).toHaveValue('Applied');
    await page.locator('#startPractice').click();
    const id = (await page.locator('.session-card .meta').innerText()).split(' ')[0];
    expect(curriculum.questions[id].level).toBe('Applied');
    expect(errors).toEqual([]);
  });
}

test('a path follows its authored order across sections, reload and language changes', async ({page}) => {
  const path = curriculum.paths.find(path => path.topic === 'rap');
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/?lang=en#topic=rap');
  await page.locator('[data-start-path=rap]').click();
  await expect(page).toHaveURL(new RegExp(`#q-${path.questionIds[0]}&path=rap$`));
  await page.locator('#nextQuestion').click();
  await expect(page).toHaveURL(new RegExp(`#q-${path.questionIds[1]}&path=rap$`));
  await page.reload();
  await expect(page.locator('.learning-context')).toContainText('2 /');
  await page.locator('[data-language=ru]').click();
  await expect(page.locator('.learning-context')).toContainText(path.titleRu);
  await page.locator('#nextQuestion').click();
  await expect(page).toHaveURL(new RegExp(`#q-${path.questionIds[2]}&path=rap$`));
  await page.goBack();
  await expect(page.locator('.learning-context')).toContainText('2 /');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  // Reading never writes mastery ratings.
  expect(await page.evaluate(() => localStorage.getItem('abap-study-ratings-v2'))).toBeNull();
});

test('checkpoint starts practice for precisely the full path, independent of library level', async ({page}) => {
  const path = curriculum.paths.find(path => path.topic === 'rap');
  await page.goto(`/?lang=en#q-${path.questionIds.at(-1)}&path=rap`);
  await expect(page.locator('.learning-checkpoint')).toContainText(path.checkpoint.prompt);
  await page.locator('.learning-checkpoint summary').click();
  await expect(page.locator('.learning-checkpoint')).toContainText(path.checkpoint.answer);
  await page.locator('[data-practice-path=rap]').click();
  await expect(page.locator('.session-card')).toBeVisible();
  await expect(page.locator('.session-progress')).toHaveAttribute('max', String(path.questionIds.length));
  const visited = [];
  for (let i = 0; i < path.questionIds.length; i++) {
    visited.push((await page.locator('.session-card .meta').innerText()).split(' ')[0]);
    await page.locator('#skipPractice').click();
  }
  expect(visited.sort()).toEqual([...path.questionIds].sort());
});

test('recommended order respects prerequisites and leaving a path restores library navigation', async ({page}) => {
  await page.goto('/?lang=en#topic=cds');
  const ids = await page.locator('.question-row-link').evaluateAll(links => links.map(link => link.dataset.openQuestion));
  expect(ids.indexOf('CDS-03')).toBeLessThan(ids.indexOf('CDS-04'));
  await page.locator('[data-start-path=cds]').click();
  await expect(page.locator('.learning-context')).toBeVisible();
  await page.locator('#questionTopic').click();
  await page.locator('.question-row-link[data-open-question=CDS-01]').click();
  await expect(page.locator('.learning-context')).toHaveCount(0);
  await page.goto('/?lang=en#topic=abap');
  await page.locator('#learnFilters > summary').click();
  await page.locator('#learningSort').selectOption('id');
  await page.locator('#homeCrumb').click();
  await page.locator('[data-learning-entry=basics]').click();
  await expect(page.locator('#learningSort')).toHaveValue('recommended');
});
