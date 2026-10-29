// 스테이지(pixel-fc-level) 픽셀 규칙 검사 — 그림이 원래 크기가 아닌 곳 · 도트 글꼴이 제 격자 배수가 아닌 곳을 찾습니다.
// 사용법: (저장소 맨 위에서) python3 -m http.server 8822  →  node tools/fc-pixel/stage-audit.mjs
//         playwright(또는 playwright-core)가 필요합니다. CHROME 환경 변수로 크롬 경로를 줄 수 있습니다.
// 규칙(CLAUDE.md): 그림은 1배로만 · Press Start 2P 는 8의 배수 · Galmuri14 는 14의 배수 · Galmuri11 은 11의 배수.
// 카드(.gcard · .card-back)는 cqw 고정 칸 규칙이라 검사에서 뺍니다.
import { chromium } from 'playwright-core';
const PAGES = ['index.html', 'resume.html', 'cover-letter.html', 'projects.html', 'play.html', 'projects/detail.html?p=league-of-defense'];
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME, args: ['--no-sandbox'] } : { args: ['--no-sandbox'] });
let bad = 0;
for (const w of [1440, 390]) for (const pg of PAGES) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(`http://127.0.0.1:${process.env.PORT || 8822}/${pg}${pg.includes('?') ? '&' : '?'}skin=pixel-fc-level`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const out = new Set();
    const skip = (el) => el.closest('.gcard, .card-back, .quip__more');
    const sprite = (el, pseudo) => {
      const c = getComputedStyle(el, pseudo);
      if (!c.backgroundImage.includes('data:image/svg') || c.display === 'none') return;
      if (pseudo && (c.content === 'none' || c.content === 'normal')) return;
      const imgs = c.backgroundImage.split(/,(?=\s*(?:url|linear|radial|repeating))/), sizes = c.backgroundSize.split(',');
      imgs.forEach((im, i) => {
        const m = im.match(/width%3D'(\d+)'%20height%3D'(\d+)'|width='(\d+)' height='(\d+)'/); if (!m) return;
        const W = +(m[1] || m[3]), H = +(m[2] || m[4]), sz = (sizes[i] || sizes[0] || '').trim();
        const mm = sz.match(/([\d.]+)px\s+([\d.]+)px/);
        const [sw, sh] = mm ? [+mm[1], +mm[2]] : /^auto/.test(sz) ? [W, H] : [parseFloat(c.width), parseFloat(c.height)];
        if (sw !== W || sh !== H) out.add(`그림 ${el.className.toString().split(' ')[0] || el.tagName}${pseudo || ''} ${W}×${H} → ${sw}×${sh}`);
      });
    };
    const grid = (f, s) => /Press/.test(f) ? s % 8 === 0 : /Galmuri14/.test(f) ? s % 14 === 0 : /Galmuri11/.test(f) ? s % 11 === 0 : true;
    document.querySelectorAll('body *').forEach((el) => {
      if (skip(el)) return;
      sprite(el, null); sprite(el, '::before'); sprite(el, '::after');
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      const c = getComputedStyle(el); if (c.display === 'none' || c.visibility === 'hidden') return;
      const f = c.fontFamily.split(',')[0].replace(/"/g, '');
      if (/Galmuri|Press/.test(f) && !grid(f, parseFloat(c.fontSize))) out.add(`글꼴 ${el.className.toString().split(' ')[0] || el.tagName} ${f} ${c.fontSize}`);
    });
    const main = document.querySelector('main'); if (main) { sprite(main, '::before'); sprite(main, '::after'); }
    return [...out];
  });
  bad += r.length;
  console.log(`${w} ${pg}`, r.length ? '\n  ' + r.join('\n  ') : 'ok');
  await p.close();
}
await b.close();
process.exit(bad ? 1 : 0);
