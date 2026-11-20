// node shot-themes.cjs — первый экран во всех гаммах: компьютер и телефон
const { chromium } = require(process.env.HOME + '/.local/lib/node_modules/playwright');
const out = __dirname + '/shots/themes'; require('fs').mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  for (const t of ['lilac', 'rose', 'olive', 'sand', 'blue', 'dark']) {
    for (const [w, h, tag, mob] of [[1440, 900, 'd', false], [390, 844, 'm', true]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob });
      const p = await ctx.newPage();
      await p.goto(`http://127.0.0.1:5290/?t=${t}`, { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
      await p.screenshot({ path: `${out}/${t}-${tag}.jpg`, type: 'jpeg', quality: 86 });
      await ctx.close();
    }
    console.log(t);
  }
  await b.close();
})();
