/* ============================================================================
   fc-body.js — 기울인 구도 시안의 게임기 '그림' (도트 · 크라프트 · 스테이지 · 기념판 · 하드웨어 · 전시 안이 함께 씀)
   ----------------------------------------------------------------------------
   예전에는 게임기 몸통을 상자 여러 개(셸 · 손잡이 · 화면 테 · 두께 조각)로 쌓아 그렸는데,
   판을 기울이면 조각마다 계단 모서리가 따로 틀어져 깨져 보였습니다. 이제 몸통은 SVG 그림 한 장
   (viewBox 1000 × 500)이고, 버튼 · 화면 속 내용 · 꽂기 연출(각 안의 JS)은 그 위에 그대로 얹힙니다.
     · 그림은 .hero.fc-console 맨 앞에 붙고(aria-hidden, 클릭 안 받음), 900px 이상에서만 보입니다
       (좁은 화면은 각 안의 세로 휴대기 CSS 그대로).
     · 손잡이 · 화면 자리는 각 안의 CSS 가 같은 숫자(cqw)로 맞춥니다 — 그림 1000 단위 = 판 폭 100cqw.
       크라프트: 손잡이 0–130 · 870–1000, 화면 166–834 × 56–444
       도트·스테이지: 몸통 0–970 × 0–470(+ 오른쪽·아래 두께), 손잡이 0–130 · 840–970, 화면 160–810 × 60–410
       (스테이지는 16회차부터 패미컴 문법 그림 stageArt — 10회차 Codex 판 -cx 는 예전 levelArt 그대로)
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
     몸통 = 97 × 47 칸(0–96 · 0–46), 모서리 = 한 칸씩 물러나는 45° 계단 [2,1](두 칸 이상 한꺼번에 물러나면
     꺾인 안쪽에 칸 하나가 끼어 '픽셀이 하나 더 들어간' 모서리가 됩니다), 두께 = 오른쪽 아래로 d 칸. */
  function pixelArt(o) {
    var W = 100, H = 50, BW = 97, BH = 47, PROF = [2, 1], g = [], x, y, i;
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
      f(2, 1, 93, 1, WH);                                   /* 윗면 하이라이트 */
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
      f(2, 1, 93, 1, NV2);                                  /* 윗면 밝은 줄 */
      f(0, 0, 13, 47, RD); f(84, 0, 13, 47, RD);            /* 손잡이 */
      f(1, 2, 1, 43, RH); f(2, 1, 10, 1, RH); f(85, 1, 10, 1, RH);
      f(11, 2, 1, 43, RS); f(95, 2, 1, 43, RS);
      f(13, 0, 1, 47, OR); f(83, 0, 1, 47, OR);             /* 화면 쪽 주황 선 */
      f(15, 5, 67, 37, K); f(16, 6, 65, 35, CR); f(16, 6, 65, 1, CS); f(16, 7, 1, 34, CS);   /* 화면 */
      f(17, 2, 1, 1, '#00c84a'); f(18, 2, 1, 1, K);         /* 전원등 */
      f(44, 2, 1, 1, '#6b7290'); f(52, 2, 1, 1, '#6b7290'); /* 나사 */
      for (var i = 0; i < 6; i++) f(70 + i * 2, 43, 1, 2, K);   /* 스피커 */
    } });
  }

  /* ── ⑩ 스테이지(16회차): 패미컴 문법 — 양옆 = 자주 컨트롤러(금색 앞판 · 검은 십자 버튼 · 고무 버튼 · 빨강 B/A),
     가운데 = 크림 몸통(밀어 켜는 스위치 둘 · 전원등 · 홈줄) · 짙은 화면 테 · 자주 아랫단(카트리지 구멍 · 스피커).
     격자는 5단위 한 칸(200 × 100 칸 — 예전 10단위의 두 배 촘촘), 외곽선은 실루엣 가장자리로 계산, 색마다 path 하나로 냅니다.
     누를 수 있는 키(◀ ▶ · 메일 · B · A)는 HTML 버튼을 그림 위 같은 자리에 투명하게 얹습니다(pixel-fc-folio.css 16회차 절).
     좌표: 십자 중심 (65, 175) · 고무 버튼 30–100 × 280–315 · B 중심 (905, 170) · A 중심 (905, 280) · 화면 165–805 × 65–405. */
  function stageArt() {
    var U = 5, W = 200, H = 100, BW = 194, BH = 94, D = 4, PROF = [5, 3, 2, 1, 1];
    var K = '#171c28',
        CR = '#efe6d1', CRh = '#fffaee', CRs = '#cfc2a4', CRd = '#a99a7a',
        MR = '#8f1d1f', MRh = '#bb4a40', MRd = '#5c1013',
        GD = '#d6ad55', GDh = '#f3d68a', GDd = '#a17a2a',
        CH = '#34353f', CHh = '#4c4e5b',
        LC = '#fff6dd', LCs = '#e3c990',
        DP = '#14161d', DPh = '#4a5062', DPd = '#000000',
        RB = '#c9232c', RBh = '#f16a5e', RBd = '#7c1218',
        RU = '#2a2b33', RUh = '#50525e';
    var g = [], x, y;
    for (y = 0; y < H; y++) { g.push([]); for (x = 0; x < W; x++) g[y].push(null); }
    function inBody(cx, cy) {
      if (cx < 0 || cy < 0 || cx >= BW || cy >= BH) return false;
      var row = Math.min(cy, BH - 1 - cy);
      return row >= PROF.length || (cx >= PROF[row] && cx < BW - PROF[row]);
    }
    function inAll(cx, cy) { for (var k = 0; k <= D; k++) if (inBody(cx - k, cy - k)) return true; return false; }
    function f(x0, y0, w, h, c) { for (var yy = y0; yy < y0 + h; yy++) for (var xx = x0; xx < x0 + w; xx++) if (inBody(xx, yy)) g[yy][xx] = c; }
    function px(xx, yy, c) { if (inBody(xx, yy)) g[yy][xx] = c; }
    function disc(cx, cy, r, c) { for (var yy = Math.floor(cy - r); yy <= Math.ceil(cy + r); yy++) for (var xx = Math.floor(cx - r); xx <= Math.ceil(cx + r); xx++) if ((xx + .5 - cx) * (xx + .5 - cx) + (yy + .5 - cy) * (yy + .5 - cy) <= r * r) px(xx, yy, c); }
    /* 둥근 모서리 사각형(한 칸 깎기) */
    function rr(x0, y0, w, h, c) { f(x0 + 1, y0, w - 2, h, c); f(x0, y0 + 1, w, h - 2, c); }
    /* 두께(옆면): 손잡이 밑은 자주, 몸통 밑은 크림 그늘 */
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (inAll(x, y) && !inBody(x, y)) g[y][x] = MRd;

    /* ── 몸통(크림) ── */
    f(0, 0, BW, BH, CR);
    f(4, 1, 186, 1, CRh);
    /* ── 손잡이 = 컨트롤러 두 개(자주) ── */
    [[0, 26], [168, 26]].forEach(function (s) {
      var x0 = s[0], w = s[1];
      f(x0, 0, w, BH, MR);
      f(x0 + 2, 1, w - 4, 1, MRh); f(x0 + 1, 3, 1, BH - 6, MRh);       /* 윗면 · 왼쪽 빛 */
      f(x0 + w - 2, 3, 1, BH - 6, MRd); f(x0 + 2, BH - 2, w - 4, 1, MRd);  /* 오른쪽 · 아래 그늘 */
      /* 금색 앞판 */
      f(x0 + 3, 14, 20, 66, GD);
      f(x0 + 3, 14, 20, 1, GDh); f(x0 + 3, 14, 1, 66, GDh);
      f(x0 + 3, 79, 20, 1, GDd); f(x0 + 22, 14, 1, 66, GDd);
    });
    /* 손잡이와 몸통 사이 홈 */
    f(26, 0, 1, BH, MRd); f(27, 0, 1, BH, CRs); f(167, 0, 1, BH, MRd); f(166, 0, 1, BH, CRs);

    /* ── 왼쪽 컨트롤러: 십자 버튼 ── */
    f(5, 32, 16, 6, DP); f(10, 27, 6, 16, DP);               /* 십자(검정) — 금색 판 위라 따로 외곽선 없이 */
    f(5, 32, 5, 1, DPh); f(16, 32, 5, 1, DPh); f(10, 27, 6, 1, DPh);   /* 윗변 빛 한 줄 */
    f(11, 33, 4, 4, '#262a35');                               /* 가운데 오목 */
    /* 화살표(◀ ▶ 는 누를 수 있는 키, ▲ ▼ 는 그림) — 회색 세모 */
    var AR = '#6b7184';
    f(7, 34, 1, 2, AR); f(8, 33, 1, 4, AR);
    f(18, 34, 1, 2, AR); f(17, 33, 1, 4, AR);
    f(12, 29, 2, 1, AR); f(11, 30, 4, 1, AR);
    f(12, 40, 2, 1, AR); f(11, 39, 4, 1, AR);
    /* 고무 버튼(메일) */
    rr(6, 56, 14, 7, K); rr(7, 57, 12, 5, RU); f(8, 57, 10, 1, RUh);

    /* ── 오른쪽 컨트롤러: B · A 둥근 버튼(어두운 홈 위) ── */
    [[181, 34], [181, 56]].forEach(function (c) {
      var cx = c[0], cy = c[1];
      rr(cx - 8, cy - 8, 16, 16, MRd);                          /* 어두운 홈 */
      disc(cx, cy, 6.4, K); disc(cx + .5, cy + .5, 5.4, RBd);   /* 검은 테 · 아래 오른쪽 그늘 */
      disc(cx - .3, cy - .3, 5.0, RB);                          /* 빨강 면 */
      f(cx - 3, cy - 4, 3, 1, RBh); f(cx - 4, cy - 3, 1, 3, RBh);   /* 위 왼쪽 반사 */
    });

    /* ── 가운데 몸통 ── */
    /* 윗면: 밀어 켜는 스위치 둘 · 전원등 · 나사 */
    rr(34, 3, 10, 5, K); f(35, 4, 8, 3, MR); f(35, 4, 4, 1, MRh);
    rr(47, 3, 10, 5, K); f(48, 4, 8, 3, MR); f(52, 4, 4, 1, MRh);
    f(60, 4, 3, 3, K); f(61, 5, 1, 1, '#ff3b30');              /* 전원등 */
    for (x = 100; x < 160; x += 3) f(x, 3, 2, 5, CRs);    /* 윗면 홈줄 */
    /* 화면 테(짙은 회색) + 액정 */
    f(30, 10, 134, 74, K); f(31, 11, 132, 72, CH); f(31, 11, 132, 1, CHh); f(31, 11, 1, 72, CHh);
    f(32, 12, 130, 70, K);
    f(33, 13, 128, 68, LC); f(33, 13, 128, 1, LCs); f(33, 14, 1, 67, LCs);
    /* 아랫단: 자주 띠 · 카트리지 구멍 · 스피커 */
    f(28, 85, 138, 9, MR); f(28, 85, 138, 1, MRh); f(28, 84, 138, 1, CRs);
    rr(78, 87, 38, 4, K); f(80, 88, 34, 1, '#000');        /* 카트리지 구멍 */
    for (y = 87; y < 92; y += 2) f(140, y, 20, 1, K);      /* 스피커 */
    disc(36, 89, 1.4, MRd); disc(42, 89, 1.4, MRd);         /* 나사 */

    /* 외곽선 */
    var out = function (cx, cy) { return !inAll(cx, cy); };
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (!inAll(x, y)) continue;
      var edge = out(x - 1, y) || out(x + 1, y) || out(x, y - 1) || out(x, y + 1);
      var seam = inBody(x, y) && (!inBody(x + 1, y) || !inBody(x, y + 1) || !inBody(x + 1, y + 1));
      if (edge || seam) g[y][x] = K;
    }
    /* 같은 색 가로 줄을 모으고, 바로 윗줄과 폭 · 자리가 같으면 세로로 이어 붙여 색마다 path 하나로 */
    var open = {}, done = [], i, k;
    for (y = 0; y < H; y++) {
      var next = {};
      for (x = 0; x < W;) {
        var c = g[y][x]; if (!c) { x++; continue; }
        for (i = x + 1; i < W && g[y][i] === c; i++) {}
        k = c + ' ' + x + ' ' + (i - x);
        if (open[k]) { open[k].h++; next[k] = open[k]; delete open[k]; }
        else next[k] = { c: c, x: x, y: y, w: i - x, h: 1 };
        x = i;
      }
      for (k in open) done.push(open[k]);
      open = next;
    }
    for (k in open) done.push(open[k]);
    var paths = {};
    done.forEach(function (r) { (paths[r.c] = paths[r.c] || []).push('M' + r.x * U + ' ' + r.y * U + 'h' + r.w * U + 'v' + r.h * U + 'h-' + r.w * U + 'z'); });
    var s = '';
    for (k in paths) s += '<path fill="' + k + '" d="' + paths[k].join('') + '"/>';
    return '<svg class="fcb-art" viewBox="0 0 1000 500" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  /* ── ⑨ 크라프트: 기념 포스터의 2색 — 크림 몸통, 진홍 손잡이 · 화면 테.
     평면만으로는 크라프트 바탕에 묻혀서 입체를 더했습니다: 아래로 두께 한 겹(viewBox 밖 500–528, svg overflow 로 보임) ·
     윗면 밝은 띠 · 손잡이 둥근 면 그늘 · 화면이 안으로 들어간 그늘. 바닥 그림자는 CSS(drop-shadow). ── */
  function kraftArt() {
    var CR = '#f5ebd6', CR_HI = '#fffaf0', CR_SH = '#dcc6a0', SIDE = '#b9996e', SIDE_RD = '#6e1426',
      RD = '#a3203a', RD_HI = '#c8394f', RD_SH = '#7f1830', SC = '#fffaf0', SC_SH = '#eadfc8';
    var s = '<defs>' +
      '<clipPath id="fcb-k-body"><rect x="0" y="0" width="1000" height="500" rx="96"/></clipPath>' +
      '<clipPath id="fcb-k-side"><rect x="0" y="28" width="1000" height="500" rx="96"/></clipPath>' +
      '<linearGradient id="fcb-k-grip" x1="0" x2="0" y1="0" y2="1">' +
        '<stop offset="0" stop-color="' + RD_HI + '"/><stop offset=".18" stop-color="' + RD + '"/>' +
        '<stop offset=".82" stop-color="' + RD + '"/><stop offset="1" stop-color="' + RD_SH + '"/></linearGradient>' +
      '<linearGradient id="fcb-k-shell" x1="0" x2="0" y1="0" y2="1">' +
        '<stop offset="0" stop-color="' + CR_HI + '"/><stop offset=".12" stop-color="' + CR + '"/>' +
        '<stop offset=".9" stop-color="' + CR + '"/><stop offset="1" stop-color="' + CR_SH + '"/></linearGradient>' +
      '</defs>';
    /* 두께: 몸통을 28 아래로 한 장 더 — 크림 옆면 + 손잡이 자리는 짙은 진홍 */
    s += '<g clip-path="url(#fcb-k-side)"><rect x="0" y="28" width="1000" height="500" fill="' + SIDE + '"/>' +
      '<rect x="0" y="28" width="130" height="500" fill="' + SIDE_RD + '"/><rect x="870" y="28" width="130" height="500" fill="' + SIDE_RD + '"/></g>';
    /* 몸통 앞면 */
    s += '<g clip-path="url(#fcb-k-body)">' +
      '<rect x="0" y="0" width="1000" height="500" fill="url(#fcb-k-shell)"/>' +
      '<rect x="0" y="0" width="130" height="500" fill="url(#fcb-k-grip)"/>' +
      '<rect x="870" y="0" width="130" height="500" fill="url(#fcb-k-grip)"/>' +
      '<rect x="122" y="0" width="8" height="500" fill="' + RD_SH + '" opacity=".55"/>' +     /* 손잡이 · 몸통 이음 그늘 */
      '<rect x="870" y="0" width="8" height="500" fill="' + RD_SH + '" opacity=".55"/>' +
      '<rect x="0" y="0" width="1000" height="500" rx="96" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="6"/>' +
      '</g>';
    /* 화면 테(볼록) + 액정(오목) */
    s += '<rect x="150" y="44" width="700" height="420" rx="30" fill="' + RD_SH + '"/>';
    s += '<rect x="150" y="40" width="700" height="420" rx="30" fill="' + RD + '"/>';
    s += '<rect x="166" y="56" width="668" height="388" rx="18" fill="' + SC_SH + '"/>';
    s += '<rect x="166" y="64" width="668" height="380" rx="18" fill="' + SC + '"/>';
    s += '<circle cx="186" cy="20" r="6" fill="' + RD + '"/><circle cx="184" cy="18" r="2" fill="#fff" opacity=".6"/>';   /* 전원등 */
    var i;
    for (i = 0; i < 5; i++) s += '<circle cx="' + (742 + i * 18) + '" cy="476" r="4.5" fill="' + RD_SH + '"/>';      /* 스피커 */
    return '<svg class="fcb-art" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  /* 벡터 몸통 공통 자리(크라프트와 같음): 손잡이 0–130 · 870–1000, 화면 166–834 × 56–444 */
  function svgWrap(defs, body) {
    return '<svg class="fcb-art" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>' + defs + '</defs>' + body + '</svg>';
  }

  /* ── 기념판(gold): 칠기 같은 진홍 몸통 + 금박 테두리 · 금박 이음선, 검은 유광 베젤, 상아 액정 ── */
  function goldArt() {
    var d = '<linearGradient id="fg-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d5303b"/><stop offset=".45" stop-color="#b3141f"/><stop offset="1" stop-color="#7e0b14"/></linearGradient>' +
      '<linearGradient id="fg-foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a651c"/><stop offset=".28" stop-color="#e8c766"/><stop offset=".42" stop-color="#fff2bf"/><stop offset=".58" stop-color="#c99b39"/><stop offset=".8" stop-color="#f0d27a"/><stop offset="1" stop-color="#8a651c"/></linearGradient>' +
      '<linearGradient id="fg-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="fg-bezel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2224"/><stop offset="1" stop-color="#0f0b0c"/></linearGradient>' +
      '<clipPath id="fg-body"><rect width="1000" height="500" rx="92"/></clipPath>';
    var b = '<rect x="0" y="26" width="1000" height="500" rx="92" fill="#5c0710"/>' +                       /* 두께 */
      '<rect width="1000" height="500" rx="92" fill="url(#fg-red)"/>' +
      '<g clip-path="url(#fg-body)"><rect x="0" y="0" width="1000" height="200" fill="url(#fg-gloss)"/>' +
      '<rect x="128" y="0" width="5" height="500" fill="url(#fg-foil)"/><rect x="867" y="0" width="5" height="500" fill="url(#fg-foil)"/></g>' +
      '<rect x="7" y="7" width="986" height="486" rx="86" fill="none" stroke="url(#fg-foil)" stroke-width="5"/>' +   /* 금박 테 */
      '<rect x="150" y="38" width="700" height="424" rx="26" fill="url(#fg-bezel)"/>' +
      '<rect x="156" y="44" width="688" height="412" rx="22" fill="none" stroke="url(#fg-foil)" stroke-width="3"/>' +
      '<rect x="166" y="56" width="668" height="388" rx="14" fill="#fbf4e2"/>' +
      '<rect x="166" y="56" width="668" height="10" rx="5" fill="#000" opacity=".08"/>' +
      '<circle cx="186" cy="22" r="6" fill="url(#fg-foil)"/>';
    for (var i = 0; i < 6; i++) b += '<rect x="' + (730 + i * 16) + '" y="470" width="7" height="18" rx="3.5" fill="#5c0710"/>';
    return svgWrap(d, b);
  }

  /* ── 하드웨어(metal): 빨강 플라스틱 테 + 헤어라인 브러시드 알루미늄 전면판, 인쇄된 검은 화면 테 · 나사 · 스피커 ── */
  function metalArt() {
    var d = '<linearGradient id="fm-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8333c"/><stop offset="1" stop-color="#9c1720"/></linearGradient>' +
      '<linearGradient id="fm-al" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef0f1"/><stop offset=".35" stop-color="#c9ced2"/><stop offset=".5" stop-color="#f4f6f7"/><stop offset=".7" stop-color="#b9bfc4"/><stop offset="1" stop-color="#dfe3e6"/></linearGradient>' +
      '<pattern id="fm-hair" width="1000" height="3" patternUnits="userSpaceOnUse"><rect width="1000" height="1" fill="#fff" opacity=".35"/><rect y="2" width="1000" height="1" fill="#6d757c" opacity=".12"/></pattern>' +
      '<radialGradient id="fm-screw" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#9aa2a8"/><stop offset="1" stop-color="#5e666c"/></radialGradient>';
    var b = '<rect x="0" y="22" width="1000" height="500" rx="70" fill="#6e0f16"/>' +
      '<rect width="1000" height="500" rx="70" fill="url(#fm-red)"/>' +
      '<rect x="22" y="20" width="956" height="460" rx="52" fill="url(#fm-al)"/>' +
      '<rect x="22" y="20" width="956" height="460" rx="52" fill="url(#fm-hair)"/>' +
      '<rect x="22" y="20" width="956" height="460" rx="52" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>' +
      '<rect x="146" y="36" width="708" height="428" rx="16" fill="#1d1f22"/>' +
      '<rect x="156" y="46" width="688" height="408" rx="10" fill="none" stroke="#c8202c" stroke-width="3"/>' +
      '<rect x="166" y="56" width="668" height="388" rx="6" fill="#eef0e6"/>' +
      '<text x="162" y="30" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="3" fill="#1d1f22">KJS-01 · PORTFOLIO</text>' +
      '<text x="852" y="30" text-anchor="end" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="3" fill="#c8202c">GAME PLANNER</text>';
    [[52, 48], [948, 48], [52, 452], [948, 452]].forEach(function (c) {
      b += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="9" fill="url(#fm-screw)"/><rect x="' + (c[0] - 6) + '" y="' + (c[1] - 1) + '" width="12" height="2" fill="#4a5258" transform="rotate(35 ' + c[0] + ' ' + c[1] + ')"/>';
    });
    for (var i = 0; i < 7; i++) b += '<rect x="' + (700 + i * 18) + '" y="470" width="8" height="2" fill="#3b4045" opacity="0"/>';
    for (i = 0; i < 4; i++) b += '<rect x="' + (905 + 0) + '" y="' + (380 + i * 14) + '" width="40" height="5" rx="2.5" fill="#5e666c"/>';
    return svgWrap(d, b);
  }

  /* ── 전시(museum): 사실적인 진홍 기기 — 부드러운 곡면 음영, 유리 같은 화면 반사, 무광 손잡이 ── */
  function museumArt() {
    var d = '<linearGradient id="fu-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3434b"/><stop offset=".2" stop-color="#c8202c"/><stop offset=".85" stop-color="#a5161f"/><stop offset="1" stop-color="#7f0f17"/></linearGradient>' +
      '<linearGradient id="fu-grip" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8f1219"/><stop offset=".35" stop-color="#b81c26"/><stop offset="1" stop-color="#9b141d"/></linearGradient>' +
      '<linearGradient id="fu-gripr" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#8f1219"/><stop offset=".35" stop-color="#b81c26"/><stop offset="1" stop-color="#9b141d"/></linearGradient>' +
      '<linearGradient id="fu-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<clipPath id="fu-clip"><rect width="1000" height="500" rx="110"/></clipPath>';
    var b = '<rect x="6" y="18" width="988" height="500" rx="110" fill="#5a0a10"/>' +
      '<rect width="1000" height="500" rx="110" fill="url(#fu-body)"/>' +
      '<g clip-path="url(#fu-clip)"><rect x="0" y="0" width="134" height="500" fill="url(#fu-grip)"/><rect x="866" y="0" width="134" height="500" fill="url(#fu-gripr)"/>' +
      '<rect x="134" y="0" width="2" height="500" fill="#000" opacity=".25"/><rect x="864" y="0" width="2" height="500" fill="#000" opacity=".25"/>' +
      '<rect x="40" y="10" width="920" height="6" rx="3" fill="#fff" opacity=".35"/></g>' +
      '<rect x="148" y="36" width="704" height="428" rx="30" fill="#151515"/>' +
      '<rect x="166" y="56" width="668" height="388" rx="16" fill="#faf8f4"/>' +
      '<rect x="148" y="36" width="704" height="428" rx="30" fill="url(#fu-glass)"/>' +
      '<circle cx="190" cy="22" r="5" fill="#ff6b6b"/><circle cx="190" cy="22" r="10" fill="#ff6b6b" opacity=".18"/>';
    for (var i = 0; i < 5; i++) b += '<circle cx="' + (760 + i * 16) + '" cy="478" r="4" fill="#5a0a10"/>';
    return svgWrap(d, b);
  }

  var ART = { 'pixel-fc-dot': dotArt, 'pixel-fc-level': stageArt, 'pixel-fc-kraft': kraftArt,
              'pixel-fc-gold': goldArt, 'pixel-fc-metal': metalArt, 'pixel-fc-museum': museumArt,
              /* 10회차 Codex 다듬기 안 — 원본과 같은 게임기 그림에서 출발 */
              'pixel-fc-dot-cx': dotArt, 'pixel-fc-level-cx': levelArt, 'pixel-fc-kraft-cx': kraftArt };

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
