const puppeteer = require('puppeteer');
const fs = require('fs');

const iPhone = puppeteer.devices['iPhone 6'];

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.emulate(iPhone);

  await Promise.all([
    page.coverage.startJSCoverage(),
  ]);

  await page.goto('///INSERT URL HERE///');

  await page.waitForTimeout(10000);

  const jsCoverage = await Promise.all([
    page.coverage.stopJSCoverage(),
  ]);

  const js_coverage = [...jsCoverage];
  let js_used_bytes = 0;
  let js_total_bytes = 0;

  for (const entry of js_coverage[0]) {
    js_total_bytes += entry.text.length;
    console.log(`Total Bytes for ${entry.url}: ${entry.text.length}`);

    let covered_js = "";
    for (const range of entry.ranges) {
      js_used_bytes += range.end - range.start - 1;
      covered_js += entry.text.slice(range.start, range.end) + '\n';
    }

    console.log(`Used Bytes for ${entry.url}: ${covered_js.length}`);
    const filename = entry.url.replace(/[^\w\s]/gi, '').replace(/ /g, '_');
    fs.writeFile(`./exported_js/${filename}.js`, covered_js, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log(`The file ${filename}.js was saved!`);
    });
  }

  console.log(`Total Bytes of jS: ${js_total_bytes}`);
  console.log(`Used Bytes of jS: ${js_used_bytes}`);

  await browser.close();
})();