const {test, expect} = require('@playwright/test');

const description = 'Build RAP business objects. ABAP internal tables are preferred.';
const matches = [
  {id: 'RAP-05', requirement_evidence: 'Build RAP business objects.', relevance_reason: 'Explain how changes are saved in a RAP business object.', requirement_type: 'required'},
  {id: 'ABAP-01', requirement_evidence: 'ABAP internal tables are preferred.', relevance_reason: 'Choose a suitable internal table for each access pattern.', requirement_type: 'preferred'},
];
async function mockService(page, post, get = {available: true}) {
  const requests = [];
  await page.route('**/api/prepare-job', async route => {
    const isPost = route.request().method() === 'POST';
    if (isPost) requests.push(route.request().postDataJSON());
    const value = isPost ? post : get;
    await route.fulfill({status: value.error ? 503 : 200, contentType: 'application/json', body: JSON.stringify(value)});
  });
  return requests;
}
async function openJob(page, locale = 'en') {
  await page.goto(`/?lang=${locale}`);
  await page.locator('#prepareJob').click();
  await expect(page.locator('#findJobQuestions')).toBeEnabled();
}

test('required matches appear before preferences even when the model orders them differently', async ({page}) => {
  await mockService(page, {matches: [...matches].reverse()});
  await openJob(page);
  await page.locator('#jobDescription').fill(description);
  await page.locator('#findJobQuestions').click();
  await expect(page.locator('.job-match-meta').first()).toContainText('Required');
  await expect(page.locator('#jobMatches input').first()).toHaveValue('RAP-05');
  await expect(page.locator('.job-match-meta').last()).toContainText('Preferred');
});

for (const locale of ['en', 'ru']) {
  test(`${locale}: preview uses canonical questions and applies only the reviewed selection`, async ({page}) => {
    const requests = await mockService(page, {matches});
    await page.setViewportSize({width: 390, height: 900});
    await openJob(page, locale);
    await page.locator('#jobDescription').fill(description);
    await page.locator('#jobLimitEnabled').check();
    await page.locator('#jobCount').fill('2');
    await page.locator('#findJobQuestions').click();
    await expect(page.locator('.job-match')).toHaveCount(2);
    await expect(page.locator('.job-match blockquote').first()).toHaveText(matches[0].requirement_evidence);
    await expect(page.locator('.job-match-meta').last()).toContainText(locale === 'ru' ? 'Желательно' : 'Preferred');
    await expect(page.locator('#jobPreviewTitle')).toBeFocused();
    await page.locator('#jobMatches input[value="ABAP-01"]').uncheck();
    await page.locator('#applyJob').click();
    await expect(page.locator('#jobDialog')).not.toBeVisible();
    await expect(page.locator('.session-card .meta')).toContainText('RAP-05');
    await expect(page.locator('.session-bar')).toContainText(locale === 'ru' ? 'Подготовка к вакансии' : 'Job preparation');
    await expect(page.locator('#revealPractice')).toBeVisible();
    expect(requests).toEqual([{description, count: 2, language: locale}]);
    expect(await page.evaluate(() => JSON.stringify({...localStorage}).includes('Build RAP business objects'))).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  });

  test(`${locale}: daily allowance warning identifies shared limit and keeps ordinary practice available`, async ({page}) => {
    const requests = await mockService(page, {error: {code: 'daily_limit', retryAt: '2030-01-01T00:00:00Z'}});
    await openJob(page, locale);
    await page.locator('#jobDescription').fill(description);
    await page.locator('#findJobQuestions').click();
    await expect(page.locator('#jobStatus')).toContainText(locale === 'ru' ? 'Общий дневной лимит' : 'shared daily AI allowance');
    await expect(page.locator('#jobStatus')).toContainText('2030');
    await expect(page.locator('#findJobQuestions')).toBeDisabled();
    await expect(page.locator('#jobPreview')).not.toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#prepareJob')).toBeFocused();
    await page.locator('#trainTab').click();
    await page.locator('#startPractice').click();
    await expect(page.locator('#sessionQuestion')).toBeVisible();
    expect(requests).toHaveLength(1);
  });
}

test('cancelled preview leaves the active recall session, answer and filter state intact', async ({page}) => {
  await mockService(page, {matches});
  await page.goto('/?lang=en#mode=train&topic=rap&scope=Core&size=5');
  await page.locator('#startPractice').click();
  await page.locator('#revealPractice').click();
  const question = await page.locator('#sessionQuestion').innerText();
  const url = page.url();
  await page.locator('#prepareJobSession').click();
  await expect(page.locator('#findJobQuestions')).toBeEnabled();
  await page.locator('#jobDescription').fill(description);
  await page.locator('#findJobQuestions').click();
  await expect(page.locator('#jobReplace')).toBeVisible();
  await page.locator('#closeJob').click();
  await expect(page.locator('#sessionQuestion')).toHaveText(question);
  await expect(page.locator('.self-rating')).toBeVisible();
  await expect(page.locator('#topic')).toHaveValue('rap');
  expect(page.url()).toBe(url);
  await page.locator('#prepareJobSession').click();
  await expect(page.locator('#jobDescription')).toHaveValue('');
  await expect(page.locator('#jobPreview')).not.toBeVisible();
});

test('job session identity survives language switching and retrying a weak answer', async ({page}) => {
  await mockService(page, {matches: [matches[0]]});
  await openJob(page);
  await page.locator('#jobDescription').fill(description);
  await page.locator('#findJobQuestions').click();
  await expect(page.locator('#applyJob')).toBeVisible();
  await page.locator('#applyJob').click();
  await page.locator('[data-language=ru]').click();
  await expect(page.locator('.session-bar')).toContainText('Подготовка к вакансии');
  await page.locator('#revealPractice').click();
  await page.locator('[data-score="0"]').click();
  await page.locator('#finishPractice').click();
  await page.locator('#retrySession').click();
  await expect(page.locator('.session-bar')).toContainText('Подготовка к вакансии');
  await expect(page.locator('.session-card .meta')).toContainText('RAP-05');
});

test('editing input invalidates the preview and unchecking all questions prevents apply', async ({page}) => {
  await mockService(page, {matches});
  await openJob(page);
  await page.locator('#jobDescription').fill(description);
  await page.locator('#findJobQuestions').click();
  await expect(page.locator('.job-match')).toHaveCount(2);
  for (const checkbox of await page.locator('#jobMatches input').all()) await checkbox.uncheck();
  await expect(page.locator('#applyJob')).toBeDisabled();
  await page.locator('#jobDescription').fill('An unrelated role.');
  await expect(page.locator('#jobPreview')).not.toBeVisible();
});

test('empty, forged and nonliteral results never create a preview', async ({page}) => {
  const payloads = [{matches: []}, {matches: [{...matches[0], id: 'FAKE-99'}]}, {matches: [{...matches[0], requirement_evidence: 'Invented requirement'}]}, {matches: [matches[0], matches[0]]}];
  let index = 0;
  await page.route('**/api/prepare-job', route => route.fulfill({json: route.request().method() === 'POST' ? payloads[index++] : {available: true}}));
  await openJob(page);
  await page.locator('#jobDescription').fill(description);
  for (let i = 0; i < payloads.length; i++) {
    await page.locator('#findJobQuestions').click();
    await expect(page.locator('#jobStatus')).toContainText(i === 0 ? 'No relevant questions' : 'reliable selection');
    await expect(page.locator('#jobPreview')).not.toBeVisible();
  }
});

test('disabled service and non-JSON failure are recoverable without modifying the page', async ({page}) => {
  await mockService(page, {}, {error: {code: 'disabled'}});
  await page.goto('/?lang=en');
  await page.locator('#prepareJob').click();
  await expect(page.locator('#jobStatus')).toContainText('currently disabled');
  await expect(page.locator('#findJobQuestions')).toBeDisabled();
  await page.locator('#closeJob').click();
  await page.unroute('**/api/prepare-job');
  await page.route('**/api/prepare-job', route => route.fulfill({status: 502, contentType: 'text/html', body: '<h1>Bad gateway</h1>'}));
  await page.locator('#prepareJob').click();
  await expect(page.locator('#jobStatus')).toContainText('currently unavailable');
  await page.keyboard.press('Escape');
  await expect(page.locator('.topic-card')).toHaveCount(10);
});

test('all retryable server errors stay distinct and do not retry automatically', async ({page}) => {
  const errors = [
    ['invalid_input', 'Enter a job description'], ['context_limit', 'context allowance'],
    ['rate_limited', 'Too many requests'], ['busy', 'previous request'], ['timeout', 'took too long'],
    ['invalid_output', 'reliable selection'], ['unavailable', 'currently unavailable'],
  ];
  let posts = 0;
  await page.route('**/api/prepare-job', route => {
    const post = route.request().method() === 'POST';
    return route.fulfill({status: post ? 503 : 200, json: post ? {error: {code: errors[posts++][0]}} : {available: true}});
  });
  await openJob(page);
  await page.locator('#jobDescription').fill(description);
  for (const [, message] of errors) {
    await page.locator('#findJobQuestions').click();
    await expect(page.locator('#jobStatus')).toContainText(message);
    await expect(page.locator('#findJobQuestions')).toBeEnabled();
  }
  expect(posts).toBe(errors.length);
});

test('closing cancels an in-flight response and reopening cannot show stale results', async ({page}) => {
  let release;
  let started;
  const began = new Promise(resolve => { started = resolve; });
  await page.route('**/api/prepare-job', async route => {
    if (route.request().method() === 'GET') return route.fulfill({json: {available: true}});
    started();
    await new Promise(resolve => { release = resolve; });
    await route.fulfill({json: {matches}}).catch(() => {});
  });
  await openJob(page);
  await page.locator('#jobDescription').fill(description);
  await page.locator('#findJobQuestions').click();
  await began;
  await expect(page.locator('#findJobQuestions')).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.locator('#prepareJob').click();
  release();
  await expect(page.locator('#findJobQuestions')).toBeEnabled();
  await expect(page.locator('#jobDescription')).toHaveValue('');
  await expect(page.locator('#jobPreview')).not.toBeVisible();
});

test('description byte limit is checked before any inference request', async ({page}) => {
  const requests = await mockService(page, {matches: []});
  await openJob(page, 'ru');
  await page.locator('#jobDescription').fill('Я'.repeat(5500));
  await page.locator('#findJobQuestions').click();
  await expect(page.locator('#jobStatus')).toContainText('10 000 байт');
  expect(requests).toHaveLength(0);
});

test('short descriptions are rejected locally after trimming whitespace', async ({page}) => {
  const requests = await mockService(page, {matches: []});
  await openJob(page);
  await page.locator('#jobDescription').fill('                 Build RAP apps.                 ');
  await page.locator('#findJobQuestions').click();
  await expect(page.locator('#jobStatus')).toContainText('30 to 6,000 characters');
  expect(requests).toHaveLength(0);
});

test('quotes stay literal and canonical section labels replace untrusted AI explanations', async ({page}) => {
  const untrusted = '<img src=x onerror="window.jobInjected=true">';
  await mockService(page, {matches: [{...matches[0], requirement_evidence: untrusted, relevance_reason: untrusted}]});
  await openJob(page);
  await page.locator('#jobDescription').fill(untrusted);
  await page.locator('#findJobQuestions').click();
  await expect(page.locator('.job-match blockquote')).toHaveText(untrusted);
  await expect(page.locator('.job-match-reason')).toHaveText('Transactions & save ownership');
  await expect(page.locator('.job-match img')).toHaveCount(0);
  expect(await page.evaluate(() => window.jobInjected)).toBeUndefined();
});

test('browser timeout stops waiting without making a second inference request', async ({page}) => {
  let posts = 0;
  let release;
  let started;
  const began = new Promise(resolve => { started = resolve; });
  await page.route('**/api/prepare-job', async route => {
    if (route.request().method() === 'GET') return route.fulfill({json: {available: true}});
    posts++;
    started();
    await new Promise(resolve => { release = resolve; });
    await route.fulfill({json: {matches}}).catch(() => {});
  });
  await openJob(page);
  await page.clock.install();
  await page.locator('#jobDescription').fill(description);
  await page.locator('#findJobQuestions').click();
  await began;
  await page.clock.runFor(81000);
  await expect(page.locator('#jobStatus')).toContainText('took too long');
  await expect(page.locator('#findJobQuestions')).toBeEnabled();
  expect(posts).toBe(1);
  release();
});
