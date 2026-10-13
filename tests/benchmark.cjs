// Local diagnostic, not a timing assertion: compare on the same machine/browser.
const {chromium} = require('@playwright/test');
const serve = require('./serve.cjs');

(async () => {
  const stop = await serve();
  const browser = await chromium.launch({headless: true,
    ...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {})});
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      const parse = JSON.parse;
      window.largePayloadParses = [];
      JSON.parse = function (value, ...args) {
        const result = parse.call(this, value, ...args);
        if (typeof value === 'string' && value.length > 1000) largePayloadParses.push(value.length);
        return result;
      };
    });
    const runs = [];
    for (let index = 0; index < 6; index++) {
      await page.goto('http://127.0.0.1:8794/?lang=en');
      runs.push(await page.evaluate(() => ({
        domContentLoadedMs: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,
        parsedCharacters: largePayloadParses.reduce((total, length) => total + length, 0),
      })));
    }
    const warm = runs.slice(1).map(run => run.domContentLoadedMs).sort((a, b) => a - b);
    console.log(JSON.stringify({runs, warmMedianMs: warm[2], note: 'Local diagnostic; not a field performance score.'}, null, 2));
  } finally {
    await browser.close();
    await stop();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
