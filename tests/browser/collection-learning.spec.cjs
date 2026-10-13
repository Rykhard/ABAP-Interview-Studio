const {test,expect}=require('@playwright/test');
const ids=['ABAP-01','RAP-05','RAP-01'];
async function seed(page,locale='en'){
 await page.goto('/?lang='+locale);
 await page.evaluate(ids=>localStorage.setItem('studio.jobCollections.v1',JSON.stringify({version:1,collections:[{id:'study-example',title:'My role',questionIds:ids,createdAt:'2026-10-13'}]})),ids);
 await page.locator('#jobCollectionsNav').click();await page.locator('[data-action=learn]').click();
}
for(const locale of ['en','ru'])test(`${locale}: collection learning shows all questions and preserves its scope through reading, reload and locale changes`,async({page})=>{
 await seed(page,locale);await expect(page.locator('#collectionsDialog')).not.toBeVisible();await expect(page.locator('#heading')).toHaveText('My role');await expect(page.locator('.question-row')).toHaveCount(3);await expect(page.locator('#learnFilters')).not.toBeVisible();
 const order=await page.locator('.question-row-link').evaluateAll(links=>links.map(x=>x.dataset.openQuestion));expect([...order].sort()).toEqual([...ids].sort());
 await page.reload();await expect(page.locator('.question-row')).toHaveCount(3);
 await page.locator('#expandAll').click();await expect(page.locator('#view .card')).toHaveCount(3);await page.locator('#collapseAll').click();
 const link=page.locator('.question-row-link').first();expect(await link.getAttribute('href')).toContain('collection=study-example');await link.click();await expect(page.locator('.route-position')).toHaveText('1 / 3');
 await page.locator('#nextQuestion').click();await expect(page.locator('.focused-card')).toHaveAttribute('id','q-'+order[1]);await page.reload();await expect(page.locator('.route-position')).toHaveText('2 / 3');
 await page.locator(`[data-language=${locale==='en'?'ru':'en'}]`).click();await expect(page.locator('.route-position')).toHaveText('2 / 3');await page.locator('#questionTopic').click();await expect(page.locator('.question-row')).toHaveCount(3);await expect(page.locator('#heading')).toHaveText('My role');
 await page.locator('#practiceSelection').click();await expect(page.locator('.session-bar')).toContainText('My role');await expect(page.locator('.session-progress')).toBeVisible();
 await page.locator('#revealPractice').click();await page.locator('[data-score="0"]').click();await page.locator('#finishPractice').click();await page.locator('#retrySession').click();
 await page.locator('[data-study-collection]').click();await expect(page.locator('.question-row')).toHaveCount(3);await expect(page.locator('#heading')).toHaveText('My role');
});
test('leaving a collection restores the full topic library',async({page})=>{
 await seed(page);await page.locator('.nav-topic[data-topic=rap]').click();await expect(page.locator('.question-row')).toHaveCount(63);expect(page.url()).not.toContain('collection=');
});
test('question limit switch submits null and preserves more than ten saved questions',async({page})=>{
 let posted;const description='Build RAP business objects and manage transactional applications.';
 const matches=Array.from({length:12},(_,index)=>({id:'RAP-'+String(index+1).padStart(2,'0'),requirement_type:'required',requirement_evidence:'Build RAP business objects',relevance_reason:'A relevant RAP mechanism.'}));
 await page.route('**/api/prepare-job',route=>{const isPost=route.request().method()==='POST';if(isPost)posted=route.request().postDataJSON();return route.fulfill({json:isPost?{matches}:{available:true}});});
 await page.goto('/?lang=en');await page.locator('#prepareJob').click();await expect(page.locator('#findJobQuestions')).toBeEnabled();await page.locator('#jobDescription').fill(description);await expect(page.locator('#jobLimitEnabled')).not.toBeChecked();await expect(page.locator('#jobCount')).not.toBeVisible();await expect(page.locator('#jobLimitHint')).toBeVisible();await page.locator('#findJobQuestions').click();await expect(page.locator('.job-match')).toHaveCount(12);expect(posted.count).toBeNull();
 await page.locator('#saveJobCollection').click();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('studio.jobCollections.v1')).collections[0]);expect(saved.questionIds).toHaveLength(12);
 await page.locator('#openJobCollections').click();await page.locator('[data-action=learn]').click();await expect(page.locator('.question-row')).toHaveCount(12);
});

for(const locale of ['en','ru'])test(`${locale}: question count defaults to automatic after opening and reopening`,async({page})=>{
 let posted;
 await page.route('**/api/prepare-job',route=>{const post=route.request().method()==='POST';if(post)posted=route.request().postDataJSON();return route.fulfill({json:post?{matches:[]}:{available:true}});});
 await page.goto('/?lang='+locale);await page.locator('#prepareJob').click();
 await expect(page.locator('#jobLimitEnabled')).not.toBeChecked();await expect(page.locator('#jobCount')).toBeDisabled();
 await page.locator('#jobLimitEnabled').check();await page.locator('#jobCount').fill('12');
 await page.locator('#jobDescription').fill('Required: design and test ABAP applications.');await page.locator('#findJobQuestions').click();
 await expect.poll(()=>posted?.count).toBe(12);
 await page.locator('#closeJob').click();await page.locator('#prepareJob').click();
 await expect(page.locator('#jobLimitEnabled')).not.toBeChecked();await expect(page.locator('#jobCount')).not.toBeVisible();
 await page.locator('#jobDescription').fill('Required: design and test ABAP applications.');await page.locator('#findJobQuestions').click();
 await expect.poll(()=>posted?.count).toBeNull();
});
