/* 원본 패미컴(pixel-famicom) 부품 따기 — 3D 픽셀 · 복셀 시안용
   ---------------------------------------------------------------------------
   패미컴 게임기는 화면 높이에 따라 크기가 바뀌므로(--fc-h), 게임기 몸체는 한 장으로 늘이지 않고
   9조각(border-image)으로 붙입니다. 그래서 그림과 함께 '어디서 자를지(slice)'를 meta.json 에 적어 둡니다.
     · console.png / console-m.png : 데스크톱 · 모바일(390px) 게임기 몸체 (화면 속·버튼은 비움)
     · key-*.png                    : 손잡이 버튼 몸체 (글자는 비움 — 화면에서 도트 글꼴로)
     · cart.png · deck.png          : 카트리지 껍데기(라벨 비움) · 덱 (글자 비움)
   카트리지·덱은 크기가 카드 폭에 따라 변하므로, 붙일 때 쓸 바깥 여백을 % 로도 적어 둡니다.

   쓰는 법 (저장소 맨 위에서):
     python3 -m http.server 8200 &
     node tools/fc-pixel/capture-fc.js http://localhost:8200 /tmp/fc-raw
     python3 tools/fc-pixel/render3d.py bevel /tmp/fc-raw assets/img/themes/fc-px3d
     python3 tools/fc-pixel/render3d.py voxel /tmp/fc-raw assets/img/themes/fc-voxel */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [base = 'http://localhost:8200', out = 'fc-raw', skin = 'pixel-famicom'] = process.argv.slice(2);
const PAD = { console: 24, consoleM: 8, key: 6, cart: 14, deck: 18 };

const PREP = `
  html, body, main, .home-screen, .draw, .draw > .wrap, .draw__stage { background: transparent !important; }
  .pf-sw, .nav-wrap, .fc-fly, .fc-slot, .fc-boot { display: none !important; }
  .reveal { opacity: 1 !important; transform: none !important; }
`;
const HIDE = {
  console: `.hero > .wrap, .fc-grip > *, .draw { visibility: hidden !important; }`,
  keys:    `.hero > .wrap, .fc-lbl, .fc-key > *, .draw { visibility: hidden !important; }
            .fc-key { color: transparent !important; }
            .hero, .fc-grip { background: transparent !important; border-color: transparent !important; box-shadow: none !important; }`,
  carts:   `.hero, .gcard__frame, .draw__deck-face { visibility: hidden !important; }`
};

async function clipShot(page, b, pad, file) {
  const clip = { x: b.x - pad, y: b.y - pad, width: b.width + pad * 2, height: b.height + pad * 2 };
  await page.screenshot({ path: path.join(out, file), clip, omitBackground: true });
}

async function consoleShot(page, pad, file) {
  const m = await page.evaluate(() => {
    const h = document.querySelector('.hero'), w = h.querySelector(':scope > .wrap');
    const a = h.getBoundingClientRect(), b = w.getBoundingClientRect(), r = parseFloat(getComputedStyle(h).borderTopLeftRadius) || 0;
    return { x: a.x + scrollX, y: a.y + scrollY, width: a.width, height: a.height,
             gap: { top: b.top - a.top, right: a.right - b.right, bottom: a.bottom - b.bottom, left: b.left - a.left }, r };
  });
  await page.evaluate(y => window.scrollTo(0, y - 40), m.y);
  const b = await (await page.$('.hero')).boundingBox();
  await clipShot(page, b, pad, file);
  /* 9조각 자를 자리: 화면(.wrap) 가장자리, 단 둥근 모서리가 잘리지 않게 반지름보다 안쪽까지 */
  const s = k => Math.round(pad + Math.max(m.gap[k], m.r + 6));
  return { file, w: Math.round(m.width), h: Math.round(m.height), pad, r: m.r, gap: m.gap,
           slice: { top: s('top'), right: s('right'), bottom: s('bottom') + 12, left: s('left') } };
}

async function boxShot(page, sel, pad, file, border) {
  const el = await page.$(sel); if (!el) return null;
  await el.scrollIntoViewIfNeeded();
  const b = await el.boundingBox();
  await clipShot(page, b, pad, file);
  /* ::before 로 붙일 때의 바깥 여백(%): 기준은 테두리 안쪽 상자 */
  const iw = b.width - border * 2, ih = b.height - border * 2, ox = pad + border;
  return { file, w: Math.round(b.width), h: Math.round(b.height), pad,
           insetPct: { x: +(ox / iw * 100).toFixed(3), y: +(ox / ih * 100).toFixed(3) } };
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('portfolio:theme', 'light'); } catch (e) {} });
  const page = await ctx.newPage();
  const open = async () => { await page.goto(`${base}/index.html?skin=${skin}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(1200); await page.addStyleTag({ content: PREP }); };
  const step = async (css, fn) => { const tag = await page.addStyleTag({ content: css }); await page.waitForTimeout(150); const r = await fn(); await tag.evaluate(n => n.remove()); return r; };
  const meta = [];

  await open();
  meta.push(await step(HIDE.console, () => consoleShot(page, PAD.console, 'console.png')));
  await step(HIDE.keys, async () => {
    const keys = { 'key-prev.png': '.fc-key[data-fc-step="-1"]', 'key-next.png': '.fc-key[data-fc-step="1"]', 'key-mail.png': '.fc-key--mail',
                   'key-b.png': '.fc-key[data-fc-b]', 'key-a.png': '.fc-key[data-fc-a]' };
    for (const [file, sel] of Object.entries(keys)) { const r = await boxShot(page, sel, PAD.key, file, 0); if (r) meta.push(r); }
  });
  await step(HIDE.carts, async () => {
    const c = await boxShot(page, '.draw__cards .gcard', PAD.cart, 'cart.png', 3); if (c) meta.push(c);
    const d = await boxShot(page, '.draw__deck', PAD.deck, 'deck.png', 0); if (d) meta.push(d);
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await open();
  meta.push(await step(HIDE.console, () => consoleShot(page, PAD.consoleM, 'console-m.png')));

  fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ skin, meta }, null, 2));
  console.log(JSON.stringify(meta, null, 1));
  await browser.close();
})();
