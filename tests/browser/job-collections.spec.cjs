const {test,expect}=require('@playwright/test');
const description='Build RAP business objects and maintain existing applications.';
const quota={remaining:7,limit:8,resetAt:'2030-01-01T00:00:00Z'};
const result={matches:[{id:'RAP-05',requirement_type:'required',requirement_evidence:'Build RAP business objects',relevance_reason:'Understand the save sequence.'}],quota,usage:{prompt_tokens:200,completion_tokens:40,total_tokens:240}};
async function setup(page,locale='en'){
 await page.route('**/api/prepare-job',route=>route.fulfill({json:route.request().method()==='GET'?{available:true,quota}:result}));
 await page.goto('/?lang='+locale);await page.locator('#prepareJob').click();await expect(page.locator('#findJobQuestions')).toBeEnabled();
 await page.locator('#jobDescription').fill(description);await page.locator('#findJobQuestions').click();await expect(page.locator('#jobPreview')).toBeVisible();
}
for(const locale of ['en','ru'])test(`${locale}: saved collections persist, rename, delete, undo and start practice without storing job text`,async({page})=>{
 await setup(page,locale);
 await expect(page.locator('#jobQuota')).toContainText('7 / 8');
 await page.locator('#jobUsage summary').click();await expect(page.locator('#jobUsageText')).toContainText('200 / 40 / 240');
 await page.locator('#jobCollectionName').fill('RAP developer');await page.locator('#saveJobCollection').click();await expect(page.locator('#saveJobCollection')).toBeDisabled();
 const stored=await page.evaluate(()=>localStorage.getItem('studio.jobCollections.v1'));expect(stored).not.toContain('Build RAP');expect(stored).not.toContain('save sequence');expect(JSON.parse(stored).collections[0].questionIds).toEqual(['RAP-05']);
 await page.reload();await page.locator('#jobCollectionsNav').click();await expect(page.locator('.collection-card h3')).toHaveText('RAP developer');
 await page.locator('[data-action=rename]').click();await page.locator('.collection-rename input').fill('<img src=x>');await page.locator('.collection-rename button').click();await expect(page.locator('.collection-card h3')).toHaveText('<img src=x>');await expect(page.locator('.collection-card img')).toHaveCount(0);
 await page.locator('[data-action=delete]').click();await expect(page.locator('.collection-card')).toHaveCount(0);await page.locator('#collectionsUndo').click();await expect(page.locator('.collection-card')).toHaveCount(1);
 await page.locator('[data-action=practice]').click();await expect(page.locator('.session-card .meta')).toContainText('RAP-05');await expect(page.locator('.session-bar')).toContainText('<img src=x>');
 await page.locator(`[data-language=${locale==='ru'?'en':'ru'}]`).click();await expect(page.locator('.session-bar')).toContainText('<img src=x>');
});
test('collections group questions by topic and topic practice stays within the group',async({page})=>{
 await page.goto('/?lang=en');
 await page.evaluate(()=>localStorage.setItem('studio.jobCollections.v1',JSON.stringify({version:1,collections:[{id:'example',title:'Mixed skills',questionIds:['ABAP-01','RAP-05','RAP-01'],createdAt:'2026-10-13'}]})));
 await page.locator('#jobCollectionsNav').click();await expect(page.locator('.collection-topic')).toHaveCount(2);await expect(page.locator('.collection-topic summary').first()).toContainText('RAP');
 await page.locator('.collection-topic summary').last().click();await page.locator('[data-action=practice-topic][data-topic=abap]').click();await expect(page.locator('.session-card .meta')).toContainText('ABAP-01');
});
test('a storage failure never claims that a collection was saved',async({page})=>{
 await setup(page);await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};});
 await page.locator('#saveJobCollection').click();await expect(page.locator('#jobSaveStatus')).toContainText('Could not save');await expect(page.locator('#saveJobCollection')).toBeEnabled();
});
test('loading is indeterminate, cancellable and respects reduced motion',async({page})=>{
 let finish;const hold=new Promise(resolve=>{finish=resolve;});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/api/prepare-job',async route=>{if(route.request().method()==='POST')await hold;await route.fulfill({json:route.request().method()==='GET'?{available:true}:result}).catch(()=>{});});
 await page.setViewportSize({width:390,height:844});await page.goto('/?lang=ru');await page.locator('#prepareJob').click();await expect(page.locator('#findJobQuestions')).toBeEnabled();await page.locator('#jobDescription').fill(description);await page.locator('#findJobQuestions').click();
 await expect(page.locator('#jobProgress')).toBeVisible();await expect(page.locator('#jobDialog')).toHaveAttribute('aria-busy','true');await expect(page.locator('#jobProgress')).not.toHaveAttribute('aria-valuenow');
 expect(await page.locator('#jobProgress span').evaluate(x=>getComputedStyle(x).animationName)).toBe('none');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
 await page.keyboard.press('Escape');finish();await expect(page.locator('#jobProgress')).not.toBeVisible();await expect(page.locator('#prepareJob')).toHaveAttribute('data-busy','false');
});
