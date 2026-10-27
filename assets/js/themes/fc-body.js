/* ============================================================================
   fc-body.js — 기울인 구도 시안의 게임기 '그림' (도트 · 크라프트 · 스테이지 안이 함께 씀)
   ----------------------------------------------------------------------------
   예전에는 게임기 몸통을 상자 여러 개(셸 · 손잡이 · 화면 테 · 두께 조각)로 쌓아 그렸는데,
   판을 기울이면 조각마다 계단 모서리가 따로 틀어져 깨져 보였습니다. 이제 몸통은 SVG 그림 한 장
   (viewBox 1000 × 500)이고, 버튼 · 화면 속 내용 · 꽂기 연출(각 안의 JS)은 그 위에 그대로 얹힙니다.
     · 그림은 .hero.fc-console 맨 앞에 붙고(aria-hidden, 클릭 안 받음), 900px 이상에서만 보입니다
       (좁은 화면은 각 안의 세로 휴대기 CSS 그대로).
     · 손잡이 · 화면 자리는 각 안의 CSS 가 같은 숫자(cqw)로 맞춥니다 — 그림 1000 단위 = 판 폭 100cqw.
       크라프트: 손잡이 0–130 · 870–1000, 화면 166–834 × 56–444
       도트·스테이지: 몸통 0–970 × 0–470(+ 오른쪽·아래 두께), 손잡이 0–130 · 840–970, 화면 160–810 × 60–410
   SKINS 에 든 시안일 때만 동작하고, [data-slot="main"] 이 다시 그려지면 다시 붙습니다.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__portfolioFcBody) return;
  window.__portfolioFcBody = true;
  var NS = 'http://www.w3.org/2000/svg';

  function rect(x, y, w, h, c, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"' + (extra || '') + '/>';
  }
  /* 계단 모서리 사각형 — prof = 위에서부터 한 줄씩 들여 쓸 칸 수(칸 = u) */
  function steps(x, y, w, h, u, prof, c) {
    var out = '', n = prof.length, i, d;
    for (i = 0; i < n; i++) {
      d = prof[i] * u;
      out += rect(x + d, y + i * u, w - 2 * d, u, c) + rect(x + d, y + h - (i + 1) * u, w - 2 * d, u, c);
    }
    return out + rect(x, y + n * u, w, h - 2 * n * u, c);
  }

  /* ── 도트 그림 엔진 ─────────────────────────────────────────────────────
     10단위 = 한 칸, 100 × 50 칸 격자에 칸마다 색을 한 번씩 칠한 뒤 가로로 이어진 같은 색을 한 줄 rect 로 냅니다.
     외곽선은 '몸통 ∪ 두께' 실루엣의 가장자리 칸으로 계산해 칠하므로, 계단 모서리에서도 선이 끊기지 않습니다.
     몸통 = 97 × 47 칸(0–96 · 0–46), 모서리 계단 [3,1,1], 두께 = 오른쪽 아래로 d 칸. */
  function pixelArt(o) {
    var W = 100, H = 50, BW = 97, BH = 47, PROF = [3, 1, 1], g = [], x, y, i;
    for (y = 0; y < H; y++) { g.push([]); for (x = 0; x < W; x++) g[y].push(null); }
    function inBody(cx, cy) {
      if (cx < 0 || cy < 0 || cx >= BW || cy >= BH) return false;
      var row = Math.min(cy, BH - 1 - cy);
      return row >= PROF.length || (cx >= PROF[row] && cx < BW - PROF[row]);
    }
    function inAll(cx, cy) {
      for (var k = 0; k <= o.depth; k++) if (inBody(cx - k, cy - k)) return true;
      return false;
    }
    /* 칠하기: 몸통 안쪽 칸에만(실루엣을 넘지 않음) */
    function fill(x0, y0, w, h, c) {
      for (var yy = y0; yy < y0 + h; yy++) for (var xx = x0; xx < x0 + w; xx++) if (inBody(xx, yy) && g[yy]) g[yy][xx] = c;
    }
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (inAll(x, y) && !inBody(x, y)) g[y][x] = o.side;
    o.paint(fill);
    /* 외곽선: 실루엣 가장자리 + 앞면과 두께가 맞닿는 가장자리 */
    var out = function (cx, cy) { return !inAll(cx, cy); };
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (!inAll(x, y)) continue;
      var edge = out(x - 1, y) || out(x + 1, y) || out(x, y - 1) || out(x, y + 1);
      var seam = inBody(x, y) && (!inBody(x + 1, y) || !inBody(x, y + 1) || !inBody(x + 1, y + 1));
      if (edge || seam) g[y][x] = o.line;
    }
    var s = '';
    for (y = 0; y < H; y++) {
      for (x = 0; x < W;) {
        var c = g[y][x];
        if (!c) { x++; continue; }
        for (i = x + 1; i < W && g[y][i] === c; i++) {}
        s += rect(x * 10, y * 10, (i - x) * 10, 10, c);
        x = i;
      }
    }
    return '<svg class="fcb-art" viewBox="0 0 1000 500" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  /* ── ② 도트: 흰 바탕 아이소 도트 — 검은 한 칸 테, 크림 몸통, 진홍 손잡이 + 주황 사선, 회색 두께 ── */
  function dotArt() {
    var K = '#161616', CR = '#ffdfad', RD = '#ae1032', RH = '#d23a55', OR = '#ff9e00', WH = '#ffffff';
    return pixelArt({ depth: 3, line: K, side: '#858585', paint: function (f) {
      f(0, 0, 97, 47, CR);
      f(3, 1, 91, 1, WH);                                   /* 윗면 하이라이트 */
      f(0, 0, 13, 47, RD); f(84, 0, 13, 47, RD);            /* 손잡이 */
      f(2, 1, 10, 1, RH); f(85, 1, 10, 1, RH);
      for (var y = 3; y < 44; y += 3) { f(12, y, 1, 2, OR); f(84, y + 1, 1, 2, OR); }   /* 화면 쪽 주황 사선 띠 */
      f(13, 0, 1, 47, K); f(83, 0, 1, 47, K);               /* 손잡이 경계 */
      f(15, 5, 67, 37, K); f(16, 6, 65, 35, WH);           /* 화면 테 + 액정 */
      f(17, 2, 1, 1, RD);                                   /* 전원등 */
      for (var i = 0; i < 6; i++) f(69 + i * 2, 2, 1, 2, K); /* 통풍구 */
      for (i = 0; i < 16; i++) f(19 + i * 2, 43, 2, 1, i % 2 ? OR : RD);   /* 아랫 베젤 사선 띠 */
      for (i = 0; i < 5; i++) f(72 + i * 2, 43, 1, 2, K);   /* 스피커 */
    } });
  }

  /* ── ⑩ 스테이지: 8비트 — 남색 몸통, 빨강 손잡이(밝은 · 어두운 두 단계), 주황 선, 크림 액정 ── */
  function levelArt() {
    var K = '#10131f', NV = '#2b3150', NV2 = '#3a4270', RD = '#c4243a', RH = '#ea5a5a', RS = '#8e1426', OR = '#fca044', CR = '#fff6dd', CS = '#e3c990';
    return pixelArt({ depth: 2, line: K, side: '#1a1e33', paint: function (f) {
      f(0, 0, 97, 47, NV);
      f(3, 1, 91, 1, NV2);                                  /* 윗면 밝은 줄 */
      f(0, 0, 13, 47, RD); f(84, 0, 13, 47, RD);            /* 손잡이 */
      f(1, 3, 1, 41, RH); f(3, 1, 9, 1, RH); f(85, 1, 9, 1, RH);
      f(11, 2, 1, 43, RS); f(95, 3, 1, 41, RS);
      f(13, 0, 1, 47, OR); f(83, 0, 1, 47, OR);             /* 화면 쪽 주황 선 */
      f(15, 5, 67, 37, K); f(16, 6, 65, 35, CR); f(16, 6, 65, 1, CS); f(16, 7, 1, 34, CS);   /* 화면 */
      f(17, 2, 1, 1, '#00c84a'); f(18, 2, 1, 1, K);         /* 전원등 */
      f(44, 2, 1, 1, '#6b7290'); f(52, 2, 1, 1, '#6b7290'); /* 나사 */
      for (var i = 0; i < 6; i++) f(70 + i * 2, 43, 1, 2, K);   /* 스피커 */
    } });
  }

  /* ── ⑨ 크라프트: 기념 포스터의 2색 평면 — 크림 몸통, 진홍 손잡이 면, 진홍 화면 테 ── */
  function kraftArt() {
    var CR = '#f5ebd6', LIP = '#e5cda8', RD = '#a3203a', SC = '#fffaf0';
    var s = '<defs><clipPath id="fcb-k-body"><rect x="0" y="0" width="1000" height="500" rx="96"/></clipPath></defs>';
    s += '<rect x="0" y="0" width="1000" height="500" rx="96" fill="' + CR + '"/>';
    s += '<g clip-path="url(#fcb-k-body)">' +
      '<rect x="0" y="480" width="1000" height="20" fill="' + LIP + '"/>' +            /* 아래 두께 한 줄 */
      '<rect x="0" y="0" width="130" height="500" fill="' + RD + '"/>' +
      '<rect x="870" y="0" width="130" height="500" fill="' + RD + '"/>' +
      '</g>';
    s += '<rect x="150" y="40" width="700" height="420" rx="30" fill="' + RD + '"/>';
    s += '<rect x="166" y="56" width="668" height="388" rx="18" fill="' + SC + '"/>';
    s += '<circle cx="186" cy="20" r="6" fill="' + RD + '"/>';                                  /* 전원등 */
    var i;
    for (i = 0; i < 5; i++) s += '<circle cx="' + (742 + i * 18) + '" cy="474" r="4.5" fill="' + RD + '"/>';
    return '<svg class="fcb-art" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  var ART = { 'pixel-fc-dot': dotArt, 'pixel-fc-level': levelArt, 'pixel-fc-kraft': kraftArt };

  function skin() { return document.documentElement.getAttribute('data-skin'); }
  function paint() {
    var draw = ART[skin()];
    Array.prototype.forEach.call(document.querySelectorAll('.fcb-art'), function (el) {
      if (!draw || el.getAttribute('data-for') !== skin()) el.parentNode.removeChild(el);
    });
    if (!draw) return;
    Array.prototype.forEach.call(document.querySelectorAll('.fcs-rig > .hero'), function (hero) {
      if (hero.querySelector(':scope > .fcb-art')) return;
      var box = document.createElement('div');
      box.innerHTML = draw();
      var svg = box.firstChild;
      svg.setAttribute('data-for', skin());
      hero.insertBefore(svg, hero.firstChild);
    });
  }
  function start() {
    paint();
    if (!window.MutationObserver) return;
    var main = document.querySelector('[data-slot="main"]');
    var queued = false;
    var later = function () { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; paint(); }); };
    if (main) new MutationObserver(later).observe(main, { childList: true, subtree: true });
    new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
