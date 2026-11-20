// node shot.cjs [url] — снимки страницы: компьютер 1440 и телефон 390, по экранам
const { chromium } = require(process.env.HOME + '/.local/lib/node_modules/playwright');
const url = process.argv[2] || 'http://127.0.0.1:5290/';
const out = __dirname + '/shots';
require('fs').mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  for (const [w, h, tag, mob] of [[1440, 900, 'd', false], [390, 844, 'm', true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob });
    const p = await ctx.newPage();
    p.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text().slice(0, 160)); });
    p.on('pageerror', e => console.log('[pageerror]', e.message.slice(0, 160)));
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    if (tag === 'd') {
      const m = await p.evaluate(() => { const el = document.querySelector('.mega'); const fs = parseFloat(getComputedStyle(el).fontSize); const r = document.createRange(); r.selectNodeContents(el); return { em: r.getBoundingClientRect().width / fs, fs, w: el.getBoundingClientRect().width, over: document.documentElement.scrollWidth - innerWidth }; });
      console.log('mega', JSON.stringify(m));
    } else console.log('mobile overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    let i = 0;
    for (let y = 0; y < total; y += h - (mob ? 60 : 0)) {
      await p.evaluate(yy => window.scrollTo(0, yy), y); await p.waitForTimeout(900);
      await p.screenshot({ path: `${out}/${tag}${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 80 }); i++;
      if (i > 14) break;
    }
    console.log(tag, 'экранов', i, 'высота', total);
    await ctx.close();
  }
  await b.close();
})();
