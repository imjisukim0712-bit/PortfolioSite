/* 패미컴 픽셀 시안 — 1단계: 원본 그림 따기
   ---------------------------------------------------------------------------
   고품질 그림체 시안(기본: pixel-fc-3d)을 실제 브라우저로 그린 뒤, 게임기 몸체·손잡이 버튼·
   카트리지 껍데기·덱·진열판을 '글자와 사진을 비운 채' 투명 배경 PNG 로 따 둡니다.
   2단계 pixelize.py 가 이 PNG 를 픽셀 아트로 바꿔 assets/img/themes/fc-pixel/ 에 넣습니다.

   쓰는 법 (저장소 맨 위에서):
     python3 -m http.server 8200 &
     node tools/fc-pixel/capture.js http://localhost:8200 pixel-fc-3d /tmp/fc-pixel-raw
     python3 tools/fc-pixel/pixelize.py /tmp/fc-pixel-raw assets/img/themes/fc-pixel
   원본 시안을 바꾸고 싶으면 두 번째 인자만 바꿉니다 (예: pixel-fc-clay).
   주의: 따는 크기는 1440×900 데스크톱 기준이며, 픽셀 시안 CSS 의 여백(PAD) 값과 맞물려 있습니다. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [base = 'http://localhost:8200', skin = 'pixel-fc-3d', out = 'fc-pixel-raw'] = process.argv.slice(2);
const PAD = { console: 40, key: 8, cart: 12, deck: 16, tray: 30 };   /* 그림자까지 담으려고 상자 밖으로 넓게 땁니다 */

/* 따는 동안만 쓰는 스타일: 기울기를 풀고, 배경을 투명하게, 글자·사진·화면 속 내용은 숨깁니다 */
const PREP = `
  html, body, main, .home-screen, .ps-stage, .ps-rig, .draw, .draw > .wrap { background: transparent !important; }
  .ps-stage::before, .pf-sw, .nav-wrap { display: none !important; }
  .ps-rig { transform: none !important; }
  .fc-fly, .fc-slot, .fcr-preview, .fcr-aux { display: none !important; }
`;
const HIDE = {
  console: `.hero .wrap > *, .fc-grip > *, .ps-device-mark, .draw, .ps-intro, .ps-caption { visibility: hidden !important; }
            .hero .wrap { background: transparent !important; box-shadow: none !important; }`,
  keys:    `.hero > *:not(.fc-grip), .fc-lbl { visibility: hidden !important; }
            .hero { background: transparent !important; border-color: transparent !important; box-shadow: none !important; }
            .hero::before, .hero::after { display: none !important; }`,
  carts:   `.gcard__frame, .draw__deck-face, .fcr-select-guide, .hero { visibility: hidden !important; }
            .draw__stage { background: transparent !important; border-color: transparent !important; box-shadow: none !important; }`,
  tray:    `.draw__stage > *, .fcr-select-guide, .hero { visibility: hidden !important; }`
};

async function shot(page, el, pad, file) {
  const b = await el.boundingBox();
  if (!b) throw new Error('보이지 않는 요소: ' + file);
  const clip = { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2 };
  await page.screenshot({ path: path.join(out, file), clip, omitBackground: true });
  return { file, w: Math.round(b.width), h: Math.round(b.height), pad };
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('portfolio:theme', 'light'); } catch (e) {} });
  const page = await ctx.newPage();
  await page.goto(`${base}/index.html?skin=${skin}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.addStyleTag({ content: PREP });
  const meta = [];
  const step = async (css, fn) => { const tag = await page.addStyleTag({ content: css }); await page.waitForTimeout(150); await fn(); await tag.evaluate(n => n.remove()); };

  await step(HIDE.console, async () => { meta.push(await shot(page, await page.$('.hero'), PAD.console, 'console.png')); });
  await step(HIDE.keys, async () => {
    const keys = { 'key-prev.png': '.fc-key[data-fc-step="-1"]', 'key-next.png': '.fc-key[data-fc-step="1"]', 'key-mail.png': '.fc-key--mail',
                   'key-b.png': '.fc-key[data-fc-b]', 'key-a.png': '.fc-key[data-fc-a]' };
    for (const [file, sel] of Object.entries(keys)) { const el = await page.$(sel); if (el) meta.push(await shot(page, el, PAD.key, file)); }
  });
  await step(HIDE.carts, async () => {
    meta.push(await shot(page, await page.$('.draw__cards .gcard'), PAD.cart, 'cart.png'));
    meta.push(await shot(page, await page.$('.draw__deck'), PAD.deck, 'deck.png'));
  });
  await step(HIDE.tray, async () => { meta.push(await shot(page, await page.$('.draw__stage'), PAD.tray, 'tray.png')); });

  fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ skin, meta }, null, 2));
  console.log(JSON.stringify(meta));
  await browser.close();
})();
