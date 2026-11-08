/* 홈 흐름(월드 1 ~ 5) + 시안 모음 — index.html 은 window.__PLAY · window.__SITE 를 켜고 읽고, drafts.html 은 시안 모음(?play 면 같은 흐름)으로 읽습니다 */
(function () {
  'use strict';
  var C = window.PORTFOLIO_CONTENT || {};
  var L = (function () { try { return localStorage.getItem('portfolio:lang') === 'en' ? 'en' : 'ko'; } catch (e) { return 'ko'; } })();
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function t(f) { return f == null ? '' : typeof f === 'string' ? f : (f[L] || f.ko || ''); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function T(ko, en) { return esc(L === 'en' ? en : ko); }

  /* ── 소품 그림 — stage-props.py 와 같은 문법(원작 1픽셀 = 4px 칸 · 검은 외곽선 · 같은 팔레트 묶음)으로 이 페이지에서 찍음 ── */
  var PAL = { K: '#171c28', g: '#80d010', G: '#00a800', l: '#fcbcb0', m: '#c84c0c', w: '#fcfcfc', o: '#fc9838', u: '#a4e4fc', v: '#008888', n: '#f6efe0', r: '#e0262c', c: '#3cbcfc', s: '#bcbcbc', S: '#7c7c7c' };
  function spr(rows) {
    var w = rows[0].length, b = '';
    rows.forEach(function (r, y) {
      for (var x = 0; x < w;) {
        var ch = r[x], n = 1; if (ch === '.') { x++; continue; }
        while (x + n < w && r[x + n] === ch) n++;
        b += "<rect x='" + x * 4 + "' y='" + y * 4 + "' width='" + n * 4 + "' height='4' fill='" + PAL[ch] + "'/>"; x += n;
      }
    });
    return 'url("data:image/svg+xml,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='" + w * 4 + "' height='" + rows.length * 4 + "' viewBox='0 0 " + w * 4 + ' ' + rows.length * 4 + "' shape-rendering='crispEdges'>" + b + '</svg>') + '")';
  }
  function grid(w, h, f) { var r = []; for (var y = 0; y < h; y++) { var s = ''; for (var x = 0; x < w; x++) s += f(x, y); r.push(s); } return r; }
  /* 사이트 고스트(1P) — 캐릭터 대신 사이트 자신의 마스코트. 모양은 그대로, 색만 빨강 한 가지(빛 · 그늘 없음) */
  var GHOST = ['....KKKK....', '..KKrrrrKK..', '.KrrrrrrrrK.', '.KrrrrrrrrK.', 'KrrrrrrrrrrK', 'KrrKKrrKKrrK', 'KrrKKrrKKrrK', 'KrrKKrrKKrrK', 'KrrrrrrrrrrK', 'KrrrrrrrrrrK', 'KrrrrrrrrrrK', 'KrrrrrrrrrrK', 'KrKrrKKrrKrK', 'KK.KK..KK.KK'];
  /* 무리 고스트(크림) — 1P 와 구분 */
  var GHOSTC = ['....KKKK....', '..KKnnnnKK..', '.KnnnnnnnnK.', '.KnnnnnnnnK.', 'KnnnnnnnnnnK', 'KnnKKnnKKnnK', 'KnnKKnnKKnnK', 'KnnKKnnKKnnK', 'KnnnnnnnnnnK', 'KnnnnnnnnnnK', 'KnnnnnnnnnnK', 'KnnnnnnnnnnK', 'KnKnnKKnnKnK', 'KK.KK..KK.KK'];
  /* 계단 블록 — 밝은 윗 · 왼 빗면, 어두운 아래 · 오른 빗면, 가운데 면 */
  var HARD = grid(16, 16, function (x, y) {
    if (x === 15 || y === 15) return 'K';
    if (x === 0 || y === 0) return 'l';
    if (x >= 4 && x <= 11 && y >= 4 && y <= 11) return (x === 11 || y === 11) ? 'l' : (x === 4 || y === 4) ? 'K' : 'm';
    if (y < 4 && y <= x && x <= 14 - y) return 'l';
    if (x < 4 && x <= y && y <= 14 - x) return 'l';
    return 'm';
  });
  /* 깃대(공 + 장대)와 깃발(삼각형)을 따로 — 마지막 시기에 깃발이 오름 */
  var POLE = grid(22, 52, function (x, y) {
    function ball(a, b) { return (a + .5 - 16) * (a + .5 - 16) + (b + .5 - 4) * (b + .5 - 4) <= 16; }
    function pole(a, b) { return b >= 8 && a >= 15 && a <= 16; }
    function any(a, b) { return ball(a, b) || pole(a, b); }
    if (!any(x, y)) return '.';
    return (!any(x - 1, y) || !any(x + 1, y) || !any(x, y - 1) || !any(x, y + 1)) ? 'K' : 'g';
  });
  var FLAGT = grid(15, 16, function (x, y) {
    function f(a, b) { if (b < 0 || b > 15 || a < 0 || a > 14) return false; return a >= Math.round(Math.abs(b - 7.5) / 7.5 * 14); }
    if (!f(x, y)) return '.';
    return (!f(x - 1, y) || !f(x + 1, y) || !f(x, y - 1) || !f(x, y + 1)) ? 'K' : 'w';
  });
  [['--d-ghost', GHOST], ['--d-ghostc', GHOSTC], ['--d-hard', HARD], ['--d-pole', POLE], ['--d-flagt', FLAGT]].forEach(function (p) { document.documentElement.style.setProperty(p[0], spr(p[1])); });
  function S(k, x, y, extra) { return '<i class="s s-' + k + (extra ? ' ' + extra : '') + '" style="left:' + x + 'px;' + (typeof y === 'string' ? y : 'top:' + y + 'px') + '"></i>'; }

  /* ── 육각형 능력(시안용 — 고르면 content.js 로 옮김). 칸 수는 예시, 근거는 이력서 내용 ── */
  var AX = [
    { k: 'dev',  n: { ko: '개발', en: 'Build' },             ev: { ko: '1인 개발 5종 · 유니티 · 고도', en: 'Five solo titles · Unity · Godot' } },
    { k: 'ship', n: { ko: '출시 · 운영', en: 'Ship & run' },   ev: { ko: '7종 출시 · 누적 30만 다운로드', en: '7 titles · 300K downloads' } },
    { k: 'comm', n: { ko: '커뮤니티', en: 'Community' },      ev: { ko: '회원 6만 개발 카페 스탭', en: 'Staff of a 60K dev community' } },
    { k: 'crit', n: { ko: '분석 · 글', en: 'Analysis' },       ev: { ko: '게임 평론 블로그 · 월 3~5천 뷰', en: 'Game criticism blog · 3–5K views/mo' } },
    { k: 'docs', n: { ko: '문서 · 발표', en: 'Docs & talks' },  ev: { ko: '주 1회 기획서 발표 · 12인 리더', en: 'Weekly design talks · leading 12' } },
    { k: 'team', n: { ko: '협업 · 도구', en: 'Team & tools' },  ev: { ko: '5인 팀 스팀 출시 · 깃허브 · 지라', en: '5-person Steam team · GitHub · Jira' } }
  ];
  var MAX = 5, FULL = [4, 4, 4, 4, 4, 4];
  /* 시기마다 오른 능력 — 이력서 경력 항목을 오래된 순으로 */
  var GAIN = [
    { dev: 3, ship: 3 },            /* 2016–2018 인디게임 1인 개발 */
    { comm: 4, docs: 1, ship: 1 },  /* 2019– 커뮤니티 스탭 */
    { crit: 4, docs: 1 },           /* 2021–2023 블로그 · 평론 */
    { docs: 1, team: 2 },           /* 2026 발표 스터디 리더 */
    { docs: 1, team: 2, dev: 1 }    /* 2026 게임 기획자 과정 */
  ];
  var CAREER = (C.resume && C.resume.career && C.resume.career.items) || [];
  var ERAS = CAREER.slice().reverse();                 /* 오래된 순 — GAIN 과 짝 */
  var stats = (C.resume && C.resume.stats) || [];
  var NAME = t(C.resume && C.resume.profile && C.resume.profile.items && C.resume.profile.items[0] && C.resume.profile.items[0].value) || '김지수';
  var CLS = { ko: '육각형 기획자', en: 'Hexagon game designer' };
  var YRS = (stats[3] && stats[3].num) || '10';
  function ax(k) { return AX.filter(function (a) { return a.k === k; })[0]; }
  function year(c) { var m = /\d{4}/.exec(t(c.date)); return m ? m[0] : ''; }
  function sumOf(idx) {
    var v = { dev: 0, ship: 0, comm: 0, crit: 0, docs: 0, team: 0 };
    idx.forEach(function (i) { Object.keys(GAIN[i]).forEach(function (k) { v[k] += GAIN[i][k]; }); });
    return AX.map(function (a) { return Math.min(MAX, v[a.k]); });
  }
  function upTo(i) { var a = []; for (var j = 0; j <= i; j++) a.push(j); return a; }

  /* 육각형 그림(SVG) — 도트 느낌으로 각진 선(crispEdges) */
  function hex(o) {
    o = o || {};
    var R = 100, lab = o.labels !== false, ink = o.ink || '#102346', gr = o.grid || 'rgba(16,35,70,.28)', vals = o.values || FULL;
    function pt(i, r) { var a = -Math.PI / 2 + i * Math.PI / 3; return [Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r)]; }
    function poly(v) { return v.map(function (x, i) { return pt(i, R * x / MAX).join(','); }).join(' '); }
    var s = '<svg viewBox="' + (lab ? '-178 -134 356 268' : '-110 -110 220 220') + '" shape-rendering="crispEdges" role="img" aria-label="' + T('여섯 능력 육각형', 'Hexagon of six abilities') + '">';
    for (var g = 1; g <= MAX; g++) s += '<polygon points="' + poly([g, g, g, g, g, g]) + '" fill="none" stroke="' + gr + '" stroke-width="' + (g === MAX ? 4 : 2) + '"/>';
    for (var i = 0; i < 6; i++) { var p = pt(i, R); s += '<line x1="0" y1="0" x2="' + p[0] + '" y2="' + p[1] + '" stroke="' + gr + '" stroke-width="2"/>'; }
    if (o.under) s += '<polygon points="' + poly(o.under) + '" fill="' + (o.fill || '#c8102e') + '" fill-opacity=".22" stroke="' + ink + '" stroke-opacity=".45" stroke-width="2"/>';
    if (vals.some(function (v) { return v > 0; })) {
      s += '<polygon points="' + poly(vals) + '" fill="' + (o.fill || '#c8102e') + '" fill-opacity=".8" stroke="' + ink + '" stroke-width="4"/>';
      vals.forEach(function (v, i) { if (!v) return; var p = pt(i, R * v / MAX); s += '<rect x="' + (p[0] - 6) + '" y="' + (p[1] - 6) + '" width="12" height="12" fill="#fff6dd" stroke="' + ink + '" stroke-width="3"/>'; });
    }
    if (lab) AX.forEach(function (a, i) {
      var p = pt(i, R + 26), anchor = Math.abs(p[0]) < 10 ? 'middle' : p[0] > 0 ? 'start' : 'end';
      /* 긴 이름(영문 'Team & tools' 등)은 두 줄로 — 한 줄이면 창 밖으로 잘림 */
      var nm = t(a.n), m = nm.length > 9 && /^(.+?\s[&·])\s(.+)$/.exec(nm), ln = m ? [m[1], m[2]] : [nm];
      s += '<text y="' + (p[1] + 7 - (ln.length - 1) * 12) + '" text-anchor="' + anchor + '" font-family="Galmuri11, monospace" font-size="22" fill="' + (o.text || ink) + '">' +
        ln.map(function (l, j) { return '<tspan x="' + p[0] + '"' + (j ? ' dy="24"' : '') + '>' + esc(l) + '</tspan>'; }).join('') + '</text>';
    });
    return s + '</svg>';
  }

  function nav(world) {
    return '<div class="m-nav"><b>' + esc(NAME) + ' · ' + T('게임 기획자', 'Game designer') + '</b><span class="sp"></span><span class="cur">▶ ' + T('홈', 'Home') + '</span><span>' + T('이력서', 'Résumé') + '</span><span>' + T('자기소개서', 'Cover letter') + '</span><span>' + T('프로젝트', 'Projects') + '</span><span>' + T('게임플레이', 'Play') + '</span><span class="sp"></span><span class="ps">' + esc(world || 'WORLD 1-1') + '</span></div>';
  }


  /* 시기마다 대표 숫자(이력서 문구에서 — 20만 다운로드 · 회원 6만 · 월 3~5천 뷰 · 12인 · 6개월) */
  var NUMS = [
    { v: '200K', u: { ko: '다운로드 · 5종 출시', en: 'downloads · 5 titles' } },
    { v: '60K', u: { ko: '커뮤니티 회원', en: 'community members' } },
    { v: '3-5K', u: { ko: '한 달 조회', en: 'views a month' } },
    { v: '12', u: { ko: '명 모임 · 주 1회 발표', en: 'people · weekly talks' } },
    { v: '6', u: { ko: '개월 과정', en: 'month course' } }
  ];
  function q4(v) { return Math.round(v / 4) * 4; }
  function flash(el, cls, ms) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(function () { el.classList.remove(cls); }, ms || 700); }
  function hSlot(i) { return 24 + i * 232; }

  /* ════ 스크롤만: 화면은 멈춘 채(sticky) 안에서 이야기가 흐르고, 스크롤하는 만큼 움직이고 글이 써짐 ════ */
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function typeTo(el, text, f) {            /* 글자를 스크롤만큼 — 남은 글자는 투명하게 두어 줄이 출렁이지 않게 */
    var n = Math.round(text.length * clamp01(f));
    if (el.__n === n && el.__t === text) return; el.__n = n; el.__t = text;
    el.innerHTML = esc(text.slice(0, n)) + '<span style="opacity:0">' + esc(text.slice(n)) + '</span>';
  }
  function cue() { return '<p class="s-cue" data-cue>▼ ' + T('스크롤하세요 — 누를 것 없음', 'Just scroll — nothing to click') + '</p><div class="s-bar"><i data-bar></i></div>'; }
  function cueSet(root, p) { var c = root.querySelector('[data-cue]'), b = root.querySelector('[data-bar]'); if (c) c.classList.toggle('off', p > .01); if (b) b.style.width = (p * 100).toFixed(1) + '%'; }

  function ease(u) { return 1 - Math.pow(1 - clamp01(u), 3); }

  /* ── 팔레트 — 월드 색 여러 벌 ── */
  var NESP = {
    day:    { n: { ko: '낮 · 1-1', en: 'Day · 1-1' },          sky: '#5c94fc', l: '#fcbcb0', m: '#c84c0c', g: '#80d010', G: '#00a800', w: '#fcfcfc', c: '#3cbcfc', o: '#fc9838' },
    under:  { n: { ko: '지하 · 1-2', en: 'Underground · 1-2' }, sky: '#000000', l: '#a4e4fc', m: '#008888', g: '#80d010', G: '#00a800', w: '#3cbcfc', c: '#0078f8', o: '#fc9838' },
    sunset: { n: { ko: '노을', en: 'Sunset' },                  sky: '#f87858', l: '#fce0a8', m: '#e45c10', g: '#f8b800', G: '#ac7c00', w: '#f8a4c0', c: '#f85898', o: '#fca044' },
    night:  { n: { ko: '밤 · 3-1', en: 'Night · 3-1' },        sky: '#000000', l: '#fcbcb0', m: '#c84c0c', g: '#80d010', G: '#00a800', w: '#fcfcfc', c: '#3cbcfc', o: '#fc9838' },
    castle: { n: { ko: '성 · 1-4', en: 'Castle · 1-4' },        sky: '#000000', l: '#bcbcbc', m: '#7c7c7c', g: '#bcbcbc', G: '#7c7c7c', w: '#7c7c7c', c: '#bcbcbc', o: '#f83800' },
    snow:   { n: { ko: '겨울', en: 'Snow' },                    sky: '#a4e4fc', l: '#fcfcfc', m: '#bcbcbc', g: '#fcfcfc', G: '#3cbcfc', w: '#fcfcfc', c: '#a4e4fc', o: '#fc9838' },
    riso:   { n: { ko: '검빨금 · 게임기 색', en: 'Black · red · gold' }, sky: '#1e1519', K: '#0f0a0c', l: '#f0cc6a', m: '#9a6a1e', g: '#ea3a33', G: '#8c0e22', w: '#fff6dd', c: '#d4a23e', o: '#d4a23e' }
  };
  var PAL_TIME = ['day', 'under', 'sunset', 'night', 'castle'];       /* '시간 따라' — 월드 1-1 → 1-2 → (노을) → 밤 → 1-4 성 */
  var PAL_MODES = ['day', 'time', 'under', 'sunset', 'night', 'castle', 'snow', 'riso'];     /* 기본 = 낮(늘 밝게) — 시간 따라는 고를 수 있는 한 벌 */
  /* stage-props.py 와 같은 그림(땅 블록 · 관 · 언덕 · 구름 · 덤불 · 동전)을 이 페이지에서 팔레트만 바꿔 다시 찍음 */
  var GROUND_R = ['lllllllllKllllll', 'lmmmmmmmmKlmmmmK', 'lmmmmmmmmKlmmmmK', 'lmmmmmmmmKlmmmmK', 'lmmmmmmmmKlmmmmK', 'lmmmmmmmmKKlmmmK', 'lmmmmmmmmKlmmmmK', 'lmmmmmmmmKlmmmmK', 'lmmmmmmmmKlmmmmK', 'KKmmmmmmKlmmmmmK', 'llKKKKKKlmmmmmmK', 'lmmmmmmKlmmmmmmK', 'lmmmmmmKlmmmmmmK', 'lmmmmmmKlmmmmmmK', 'lmmmmmmKlmmmmmmK', 'KKKKKKKKKKKKKKKK'];
  function rep(ch, n) { return new Array(n + 1).join(ch); }
  var LIP_IN = 'G' + 'gg' + 'G' + rep('g', 14) + 'GG' + 'g' + 'GGG' + 'g' + 'GGG' + 'G' + 'G', BODY_IN = 'G' + 'gg' + 'G' + rep('g', 12) + 'GG' + 'g' + 'GGG' + 'g' + 'GG' + 'G';
  var PIPE_R = [rep('K', 32)].concat(Array(8).fill('K' + LIP_IN + 'K'), [rep('K', 32)], Array(22).fill('..K' + BODY_IN + 'K..'));
  function outl(mask, fill, ground) {
    var h = mask.length, w = mask[0].length;
    function inn(x, y) { return x >= 0 && x < w && y >= 0 && y < h && mask[y][x] === '#'; }
    return mask.map(function (row, y) { var s = ''; for (var x = 0; x < w; x++) { if (!inn(x, y)) { s += '.'; continue; } var nb = [[x - 1, y], [x + 1, y], [x, y - 1]]; if (!(ground && y === h - 1)) nb.push([x, y + 1]); s += nb.some(function (q) { return !inn(q[0], q[1]); }) ? 'K' : fill; } return s; });
  }
  function paintR(rows, spots, ch) { rows = rows.map(function (r) { return r.split(''); }); spots.forEach(function (q) { var c = rows[q[1]][q[0]]; if (c !== '.' && c !== 'K') rows[q[1]][q[0]] = ch; }); return rows.map(function (r) { return r.join(''); }); }
  function puffsR(w, h, circles, base) { var m = []; for (var y = 0; y < h; y++) { var s = ''; for (var x = 0; x < w; x++) { var hit = y >= base && x >= 1 && x <= w - 2; circles.forEach(function (c) { if ((x + .5 - c[0]) * (x + .5 - c[0]) + (y + .5 - c[1]) * (y + .5 - c[1]) <= c[2] * c[2]) hit = true; }); s += hit ? '#' : '.'; } m.push(s); } return m; }
  var HILL_W = [12, 20, 26, 30, 34, 36, 38, 40, 42, 42, 44, 44, 46, 46, 46, 48, 48, 48, 48];
  var HILL_R = paintR(outl(HILL_W.map(function (wd) { var pad = (48 - wd) / 2; return rep('.', pad) + rep('#', wd) + rep('.', pad); }), 'G', true), [[20, 5], [20, 6], [20, 7], [28, 9], [28, 10], [28, 11], [14, 12], [14, 13], [14, 14], [33, 14], [33, 15], [33, 16]], 'K');
  var CLOUD_R = (function () { var c = outl(puffsR(28, 12, [[8, 7, 4.6], [14, 5.4, 5.6], [20.5, 7, 4.6]], 7), 'w'); var sp = [[9, 5], [15, 3], [21, 5]]; [9, 10].forEach(function (y) { for (var x = 2; x < 26; x++) sp.push([x, y]); }); return paintR(c, sp, 'c'); })();
  var BUSH_R = paintR(outl(puffsR(32, 14, [[6.5, 9, 5], [13, 6.5, 6.2], [19.5, 6.5, 6.2], [25.5, 9, 5]], 9), 'g', true), [[8, 7], [9, 6], [14, 4], [15, 3], [20, 4], [21, 3], [26, 7], [27, 6]], 'G');
  var COIN_R = ['.KKKK.', 'KooooK', 'KomooK', 'KomooK', 'KomooK', 'KomooK', 'KomooK', 'KomooK', 'KooooK', '.KKKK.'];
  var PAL_CACHE = {};
  function palVars(key) {
    if (PAL_CACHE[key]) return PAL_CACHE[key];
    var P = NESP[key], save = {}, k;
    for (k in PAL) save[k] = PAL[k];
    ['K', 'l', 'm', 'g', 'G', 'w', 'c', 'o'].forEach(function (c) { if (P[c]) PAL[c] = P[c]; });
    var v = { '--sp-sky': P.sky, '--sp-ground': spr(GROUND_R), '--sp-pipe': spr(PIPE_R), '--sp-hill': spr(HILL_R), '--sp-cloud': spr(CLOUD_R), '--sp-bush': spr(BUSH_R), '--sp-coin': spr(COIN_R), '--sp-hard': spr(HARD), '--sp-pole': spr(POLE), '--sp-flagt': spr(FLAGT) };
    for (k in save) PAL[k] = save[k];
    return (PAL_CACHE[key] = v);
  }
  function applyPal(el, key) { var v = palVars(key); for (var k in v) el.style.setProperty(k, v[k]); }
  function s5Props(i, x) {        /* 시기마다 지어지는 소품 — 켜기는 .on(스크롤로 되감기 가능) */
    function P(k, l, top, d, from) { return '<i class="s s-' + k + ' s2-p" data-s-p="' + i + '" style="left:' + (x + l) + 'px;top:' + top + 'px;--d:' + d + 's;--from:' + (from || '40px') + '"></i>'; }
    var s = '', j;
    if (i === 0) { s += P('pipe', 48, 494, 0, '128px'); for (j = 0; j < 5; j++) s += P('coin', 100 + (j - 2) * 38, 420 - (2 - Math.abs(j - 2)) * 20, .12 + j * .07, '-24px'); }
    if (i === 1) { s += P('hill', 16, 546, 0, '76px'); for (j = 0; j < 4; j++) s += P('ghost', 12 + j * 50, 566, .12 + j * .08, '-40px'); }
    if (i === 2) { s += P('cloud', 20, 336, 0, '-24px') + P('cloud', 96, 404, .1, '-24px') + P('ghost', 50, 566, .16, '-40px') + P('ghost', 112, 566, .22, '-40px'); }
    if (i === 3) { s += P('hard', 20, 558, 0, '64px') + P('ghost', 28, 502, .12, '-40px'); for (j = 0; j < 3; j++) s += P('ghost', 96 + j * 40, 566, .2 + j * .06, '-40px'); s += '<span class="m-chip s2-p" data-s-p="3" style="position:absolute;left:' + (x + 160) + 'px;top:520px;--d:.4s;--from:-12px">×12</span>'; }
    if (i === 4) { s += P('hard', 92, 558, 0, '64px') + P('pole', 62, 350, .08, '208px') + '<i class="s s-flagt s2-flag" style="left:' + (x + 62) + 'px;top:390px"></i>'; }
    return s;
  }
  function s5Top(i) { return [494, 546, 336, 502, 350][i]; }        /* 소품 꼭대기(닿는 자리) */
  function palBar(id) {
    return '<div class="palbar" data-palbar="' + id + '"><small>' + T('팔레트', 'Palette') + '</small>' + PAL_MODES.map(function (m) {
      var name = m === 'time' ? T('시간 따라 (월드 1-1 → 1-4)', 'By period (world 1-1 → 1-4)') : esc(t(NESP[m].n));
      var sw = m === 'time' ? PAL_TIME.map(function (k) { return '<u style="background:' + NESP[k].sky + ';outline:1px solid ' + NESP[k].m + '"></u>'; }).join('') : '<u style="background:' + NESP[m].sky + '"></u><u style="background:' + NESP[m].m + '"></u><u style="background:' + NESP[m].g + '"></u>';
      return '<button type="button" data-pal="' + m + '"' + (m === 'day' ? ' class="on"' : '') + '><i>' + sw + '</i>' + name + '</button>';
    }).join('') + '</div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pal]'); if (!b) return;
    var bar = b.closest('[data-palbar]'), box = document.querySelector('.mockbox[data-draft="' + bar.getAttribute('data-palbar') + '"]');
    [].forEach.call(bar.querySelectorAll('[data-pal]'), function (x) { x.classList.toggle('on', x === b); });
    if (box && box.__pal) box.__pal.setMode(b.getAttribute('data-pal'));
  });

  /* ════ 닿으면 큰 글씨 게임 대화창 — 빨강 고스트(1P) ════
     대화창 · 터짐 · 숫자는 장면(.mock, 1200 × 750 을 줄여 씀) 밖 무대(.sstick) 위에 원래 크기로 그림 —
     휴대폰에서 장면이 반으로 줄어도 이력 글은 16px 이상. 휴대폰은 장면 아래 대화칸(.bc-dock)에 뜨고, 장면은 680px 폭만 보이며 카메라가 고스트를 따라감 */
  var POPS = ['+200K', '+60K', '3-5K', 'x12', '6MO'];
  function gcChips(i) { return Object.keys(GAIN[i]).map(function (k) { return '<span>+' + esc(t(ax(k).n)) + '</span>'; }).join(''); }
  function gameCard(c, i) {
    return '<div class="gc" data-gc="' + i + '"><div class="gc__hd"><b class="gc__yr ps">' + esc(year(c)) + '</b><span class="gc__dt"><span class="ps">QUEST ' + (i + 1) + '/5</span>' + esc(t(c.date)) + '</span></div>' +
      '<p class="gc__r">' + esc(t(c.role)) + '</p><p class="gc__o">' + esc(t(c.org)) + '</p><p class="gc__b"><span data-gc-b><span style="opacity:0">' + esc(t(c.body)) + '</span></span><i class="gc__cur">▼</i></p>' +
      '<div class="gc__f"><p class="gc__n"><b class="ps">' + esc(NUMS[i].v) + '</b>' + esc(t(NUMS[i].u)) + '</p><div class="gc__c">' + gcChips(i) + '</div></div><i class="gc__tail" data-gc-tail></i></div>';
  }
  function fxHTML(i) { var s = '<div class="bst2" data-bst="' + i + '">'; for (var j = 0; j < 8; j++) s += '<i></i>'; return s + '</div><p class="popn" data-pop="' + i + '">' + POPS[i] + '</p>'; }
  function finCard() {
    return '<div class="gc gc--fin" data-fin><div class="gc__hd"><b class="gc__yr ps">CLEAR</b><span class="gc__dt"><span class="ps">5/5</span>' + T(YRS + '년 · 다섯 시기', YRS + ' years · five periods') + '</span></div>' +
      '<div class="gc__fin"><div><p class="gc__r">' + esc(t(CLS)) + '</p><p class="gc__o">' + T('위 팻말 다섯 개가 지나온 이력입니다. 다음 월드가 포트폴리오입니다.', 'The five signs above are the career so far. The next world is the portfolio.') + '</p>' +
        '<span class="m-btn"><span class="key">A</span>' + T('다음 월드 — 포트폴리오', 'Next world — portfolio') + '</span></div>' +
      '<div class="hexwrap">' + hex({ values: sumOf(upTo(4)), labels: false, ink: '#fff6dd', grid: 'rgba(255,246,221,.3)' }) + '</div></div></div>';
  }
  function dock(ko, en) { return '<div class="bc-dock" data-hint="' + T(ko, en) + '"></div>'; }
  function fixNav() { return nav().replace('class="m-nav"', 'class="m-nav" data-fix'); }
  function fixCue() { return cue().replace('class="s-bar"', 'class="s-bar" data-fix'); }
  /* 장면 좌표(1200 × 750) → 무대 좌표 */
  function stg(g, x, y) { return { x: g.offX + (x - g.camX) * g.z, y: y * g.z }; }
  function camApply(root, g) {
    var m = root.querySelector('.mock'), tx = g.mob ? -Math.round(g.camX) : 0;
    if (m.__tx === tx) return; m.__tx = tx;
    m.style.translate = tx ? tx + 'px 0' : '';
    [].forEach.call(m.querySelectorAll('[data-fix]'), function (el) { el.style.translate = tx ? (-tx) + 'px 0' : ''; });
  }
  /* k: 0 → 1 (한 시기의 일생) — 0 ~ .18 닿음(터짐 · 숫자 · 흔들림) · .04 ~ .2 닿은 자리에서 커짐 · .2 ~ .84 머묾(.2 ~ .6 글이 써짐) · .84 ~ 1 제 칸으로 접힘 */
  function gcFrame(root, g, o) {
    var card = o.card, k = o.k, P = stg(g, o.P.x, o.P.y);
    var kb = k / .18, bs = k > 0 && kb < 1; o.bst.style.visibility = bs ? 'visible' : 'hidden';
    if (bs) {
      o.bst.style.transform = 'translate(' + q4(P.x) + 'px,' + q4(P.y) + 'px)';
      var R = (g.mob ? 12 : 20) + (g.mob ? 64 : 120) * ease(kb), op = 1 - kb * kb;
      [].forEach.call(o.bst.children, function (el, j) {
        var a = j * Math.PI / 4 + Math.PI / 8; el.style.transform = 'translate(' + q4(Math.cos(a) * R) + 'px,' + q4(Math.sin(a) * R) + 'px)'; el.style.opacity = op;
      });
    }
    var kp = k / .3, ps = !o.noPop && k > 0 && kp < 1; o.pop.style.visibility = ps ? 'visible' : 'hidden';
    if (ps) { o.pop.style.transform = 'translate(' + q4(P.x - o.pop.offsetWidth / 2) + 'px,' + q4(P.y - (g.mob ? 28 : 48) - (g.mob ? 36 : 64) * ease(kp)) + 'px)'; o.pop.style.opacity = kp > .7 ? ((1 - kp) / .3).toFixed(2) : 1; }
    if (o.prevK <= 0 && k > 0 && k < .2) { flash(root.querySelector('.mock'), 'shake', 240); if (o.onHit) o.onHit(); }
    var on = k >= .04 && k < 1;
    card.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    var W = g.mob ? Math.min(560, g.sw - 24) : o.W;
    if (card.__w !== W) { card.__w = W; card.style.width = W + 'px'; card.__h = card.offsetHeight; }
    var H = card.__h, C = g.mob ? { x: g.sw / 2, y: g.mh + g.dock / 2 } : stg(g, o.Cc.x, o.Cc.y);
    C.x = Math.max(W / 2 + 12, Math.min(g.sw - W / 2 - 12, C.x));
    C.y = Math.max(H / 2 + (g.mob ? 8 : Math.round(68 * g.z)), Math.min(g.sh - H / 2 - 12, C.y));
    var s, cx, cy, op2 = 1;
    if (k < .2) { var u = ease((k - .04) / .16); s = .1 + .9 * u; cx = P.x + (C.x - P.x) * u; cy = P.y + (C.y - P.y) * u; }
    else if (k <= .84) { s = 1; cx = C.x; cy = C.y; }
    else {
      var w = ease((k - .84) / .16), Tp = stg(g, o.T.x, o.T.y), Tw = o.T.w * g.z, Th = o.T.h * g.z;
      s = 1 + (Tw / W - 1) * w; cx = C.x + (Tp.x + Tw / 2 - C.x) * w; cy = C.y + (Tp.y + Th / 2 - C.y) * w; op2 = w > .7 ? 1 - (w - .7) / .3 : 1;
    }
    card.style.transform = 'translate(' + Math.round(cx - W * s / 2) + 'px,' + Math.round(cy - H * s / 2) + 'px) scale(' + s.toFixed(3) + ')';
    card.style.opacity = op2;
    var f = (k - .2) / .4, b = card.querySelector('[data-gc-b]'); typeTo(b, o.text, f); card.classList.toggle('typing', f < 1);
    var tl = card.querySelector('[data-gc-tail]'), side = '', L0 = C.x - W / 2, T0 = C.y - H / 2;
    if (!g.mob && k >= .2 && k <= .84) {
      if (P.x < L0) side = 'l'; else if (P.x > L0 + W) side = 'r'; else if (P.y > T0 + H) side = 'b';
    }
    if (tl.getAttribute('data-side') !== side) tl.setAttribute('data-side', side);
    if (side === 'b') { tl.style.left = Math.max(28, Math.min(W - 28, P.x - L0)) + 'px'; tl.style.top = ''; }
    else if (side) { tl.style.top = Math.max(32, Math.min(H - 32, P.y - T0)) + 'px'; tl.style.left = ''; }
  }
  function finSet(el, g, on, Cm) {
    el.classList.toggle('on', on);
    if (!on) return;
    var W = g.mob ? Math.min(560, g.sw - 24) : 520;
    if (el.__w !== W) { el.__w = W; el.style.width = W + 'px'; el.__h = el.offsetHeight; }
    var H = el.__h, C = g.mob ? { x: g.sw / 2, y: g.mh + g.dock / 2 } : stg(g, Cm.x, Cm.y);
    C.x = Math.max(W / 2 + 12, Math.min(g.sw - W / 2 - 12, C.x)); C.y = Math.max(H / 2 + 8, Math.min(g.sh - H / 2 - 12, C.y));
    el.style.transform = 'translate(' + Math.round(C.x - W / 2) + 'px,' + Math.round(C.y - H / 2) + 'px)';
  }
  function all(root, s) { return [].slice.call(root.querySelectorAll(s)); }

  /* ── S · 지어지는 월드 — 고스트가 닿는 순간 공사장이 솟고, 그 꼭대기에서 대화창이 튀어나와 위 팻말로 접혀 들어감 ── */
  function draftS6() {
    var signs = ERAS.map(function (c, i) {
      var x = hSlot(i);
      return '<div class="sb" data-s-sb="' + i + '" style="left:' + x + 'px"><p class="y ps">' + esc(year(c)) + '</p><p class="q">?</p><div class="full"><p class="r">' + esc(t(c.role)) + '</p></div></div>' +
        s5Props(i, x).replace(/s-ghost s2-p/g, 's-ghostc s2-p');
    }).join('');
    var fx = ERAS.map(function (c, i) { return gameCard(c, i) + fxHTML(i); }).join('');
    return '<div class="mock mock-r2 mock-s2 mock-s6">' + fixNav() +
      '<div class="smb-hud" data-fix><div><span class="ps">QUEST</span><b class="ps" data-h-q>0/5</b></div><div><span class="ps">YEAR</span><b class="ps" data-h-y>' + esc(year(ERAS[0])) + '</b></div><div><span class="ps">WORLD</span><b class="px" data-h-w></b></div></div>' +
      signs + S('ghost', 40, 'top:566px', 's6-ghost') + '<i class="m-ground"></i>' + fixCue() + '</div>' +
      fx + finCard() +
      dock('▲ 고스트가 공사장에 닿는 순간, 그 시기의 이력이 여기 뜹니다', '▲ The moment the ghost reaches a site, that period appears here');
  }
  function wireS6(root) {
    var mock = root.querySelector('.mock'), gh = root.querySelector('.s6-ghost'), fin = root.querySelector('[data-fin]'), flagEl = root.querySelector('.s2-flag');
    var signs = all(root, '[data-s-sb]'), cards = all(root, '.gc[data-gc]'), bsts = all(root, '.bst2'), pops = all(root, '.popn');
    var props = ERAS.map(function (c, i) { return all(root, '[data-s-p="' + i + '"]'); });
    var hq = root.querySelector('[data-h-q]'), hy = root.querySelector('[data-h-y]'), hw = root.querySelector('[data-h-w]');
    var mode = 'day', curPal = '', rt, lastX = 40, prev = [0, 0, 0, 0, 0];
    function pal(key) { if (key === curPal) return; curPal = key; applyPal(mock, key); hw.textContent = t(NESP[key].n); }
    function sc(i) { return hSlot(i) + 108; }
    function jump() { flash(gh, 'r2-jump', 450); }
    var api = { prog: function (p) {
      api.__p = p;
      var g = root.__geo; if (!g) return;
      var x = clamp01(p) * 5.5, seg = Math.min(5, Math.floor(x)), l = x - seg, done = 0;
      pal(mode === 'time' ? PAL_TIME[Math.min(4, seg)] : mode);
      var gx;
      if (seg < 5) { var from = seg === 0 ? 40 : sc(seg - 1) - 24, to = sc(seg) - 24; gx = from + (to - from) * ease(l / .26); }
      else gx = sc(4) + 56;
      gx = q4(gx); gh.style.left = gx + 'px';
      if (gx !== lastX) { gh.classList.add('run'); clearTimeout(rt); rt = setTimeout(function () { gh.classList.remove('run'); }, 140); lastX = gx; }
      g.camX = g.mob ? Math.max(0, Math.min(1200 - g.camW, gx + 24 - g.camW / 2)) : 0; camApply(root, g);
      for (var i = 0; i < 5; i++) {
        var built = seg > i || (seg === i && l > .22);
        props[i].forEach(function (el) { el.classList.toggle('on', built); });
        var k = seg > i ? 1 : seg < i ? 0 : clamp01((l - .3) / .7), top = s5Top(i), c = sc(i);
        gcFrame(root, g, { card: cards[i], bst: bsts[i], pop: pops[i], k: k, prevK: prev[i], W: 480, P: { x: c, y: top }, Cc: { x: c < 600 ? c + 390 : c - 390, y: 380 }, T: { x: hSlot(i), y: 156, w: 216, h: 124 }, text: t(ERAS[i].body), onHit: jump });
        prev[i] = k;
        var on = seg > i || (seg === i && k >= .97); if (on) done++;
        signs[i].classList.toggle('on', on);
      }
      flagEl.classList.toggle('on', seg > 4 || (seg === 4 && l > .22));
      mock.classList.toggle('s2-done', seg === 5);
      hq.textContent = done + '/5'; hy.textContent = seg < 5 ? (year(ERAS[seg]) + (seg === 4 ? '.06' : '')) : 'NOW';
      finSet(fin, g, seg === 5 && l > .3, { x: 600, y: 432 });
      cueSet(root, p);
    }, setMode: function (m) { mode = m; curPal = ''; this.prog(this.__p || 0); } };
    root.__pal = api;
    return api;
  }


  /* 월드 지도 소품 — 슈퍼 마리오브라더스 3 지도 문법(번호 칸 · 성 · 집 · 덤불 · 강 · 다리 · 길 점 · 깃발)을 같은 4px 칸 · 검은 외곽선 · NES 팔레트로 새로 찍음.
     칸 = 16 × 16(START 32 × 16 · 깃발 16 × 32). 번호 칸: 검정 = 아직 · 주황 = 깬 곳. 성 = 출시한 프로젝트, 집 = 배운 곳 */
  var WMS = {
    p1: ['.KKKKKKKKKKKKKK.', 'KwwwwwwwwwwwwwwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKwKKKKKKwK', 'KwKKKKwwKKKKKKwK', 'KwKKKKKwKKKKKKwK', 'KwKKKKKwKKKKKKwK', 'KwKKKKKwKKKKKKwK', 'KwKKKKKwKKKKKKwK', 'KwKKKKwwwKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwwwwwwwwwwwwwwK', '.KKKKKKKKKKKKKK.'],
    p2: ['.KKKKKKKKKKKKKK.', 'KwwwwwwwwwwwwwwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKwwwKKKKKwK', 'KwKKKwKKKwKKKKwK', 'KwKKKKKKKwKKKKwK', 'KwKKKKKKwKKKKKwK', 'KwKKKKKwKKKKKKwK', 'KwKKKKwKKKKKKKwK', 'KwKKKwwwwwKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwwwwwwwwwwwwwwK', '.KKKKKKKKKKKKKK.'],
    p3: ['.KKKKKKKKKKKKKK.', 'KwwwwwwwwwwwwwwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKwwwKKKKKwK', 'KwKKKwKKKwKKKKwK', 'KwKKKKKKKwKKKKwK', 'KwKKKKKwwKKKKKwK', 'KwKKKKKKKwKKKKwK', 'KwKKKwKKKwKKKKwK', 'KwKKKKwwwKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwwwwwwwwwwwwwwK', '.KKKKKKKKKKKKKK.'],
    p4: ['.KKKKKKKKKKKKKK.', 'KwwwwwwwwwwwwwwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKwKKKKKwK', 'KwKKKKKwwKKKKKwK', 'KwKKKKwKwKKKKKwK', 'KwKKKwKKwKKKKKwK', 'KwKKKwwwwwKKKKwK', 'KwKKKKKKwKKKKKwK', 'KwKKKKKKwKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwKKKKKKKKKKKKwK', 'KwwwwwwwwwwwwwwK', '.KKKKKKKKKKKKKK.'],
    p1c: ['.KKKKKKKKKKKKKK.', 'KnnnnnnnnnnnnnnK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnoooooKoooooonK', 'KnooooKKoooooonK', 'KnoooooKoooooonK', 'KnoooooKoooooonK', 'KnoooooKoooooonK', 'KnoooooKoooooonK', 'KnooooKKKooooonK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnnnnnnnnnnnnnnK', '.KKKKKKKKKKKKKK.'],
    p2c: ['.KKKKKKKKKKKKKK.', 'KnnnnnnnnnnnnnnK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnooooKKKooooonK', 'KnoooKoooKoooonK', 'KnoooooooKoooonK', 'KnooooooKooooonK', 'KnoooooKoooooonK', 'KnooooKooooooonK', 'KnoooKKKKKoooonK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnnnnnnnnnnnnnnK', '.KKKKKKKKKKKKKK.'],
    p3c: ['.KKKKKKKKKKKKKK.', 'KnnnnnnnnnnnnnnK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnooooKKKooooonK', 'KnoooKoooKoooonK', 'KnoooooooKoooonK', 'KnoooooKKooooonK', 'KnoooooooKoooonK', 'KnoooKoooKoooonK', 'KnooooKKKooooonK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnnnnnnnnnnnnnnK', '.KKKKKKKKKKKKKK.'],
    p4c: ['.KKKKKKKKKKKKKK.', 'KnnnnnnnnnnnnnnK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnooooooKooooonK', 'KnoooooKKooooonK', 'KnooooKoKooooonK', 'KnoooKooKooooonK', 'KnoooKKKKKoooonK', 'KnooooooKooooonK', 'KnooooooKooooonK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnoooooooooooonK', 'KnnnnnnnnnnnnnnK', '.KKKKKKKKKKKKKK.'],
    start: ['.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.', 'KwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwK', 'KwmmmmmmmmmmmmmmmmmmmmmmmmmmmmwK', 'KwmmmmmmmmmmmmmmmmmmmmmmmmmmmmwK', 'KwmmmmmmmmmmmmmmmmmmmmmmmmmmmmwK', 'KwmmmmmwwwmwwwmmwmmwwmmwwwmmmmwK', 'KwmmmmmwmmmmwmmwmwmwmwmmwmmmmmwK', 'KwmmmmmwwwmmwmmwwwmwwmmmwmmmmmwK', 'KwmmmmmmmwmmwmmwmwmwmwmmwmmmmmwK', 'KwmmmmmwwwmmwmmwmwmwmwmmwmmmmmwK', 'KwmmmmmmmmmmmmmmmmmmmmmmmmmmmmwK', 'KwmmmmmmmmmmmmmmmmmmmmmmmmmmmmwK', 'KwmmmmmmmmmmmmmmmmmmmmmmmmmmmmwK', 'KwmmmmmmmmmmmmmmmmmmmmmmmmmmmmwK', 'KwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwK', '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.'],
    castle: ['................', '....KK.KK.KK....', '....KK.KK.KK....', '....KwKwwKwK....', '....KssssssK....', '....KSsKKsSK....', '....KSsKKsSK....', '.KK.KssssssK.KK.', '.KK.KwwwwwwK.KK.', '.KwKwwwwwwwwKwK.', '.KssSssssssSssK.', '.KssSssKKssSssK.', '.KSSSSKKKKSSSSK.', '.KsSssKKKKssSsK.', '.KsSssKKKKssSsK.', '.KKKKKKKKKKKKKK.'],
    house: ['.......KK.......', '......KmmK......', '.....KlmmlK.....', '....KlmmmmlK....', '...KlmmmmmmlK...', '..KlmmmmmmmmlK..', '.KlmmmmmmmmmmlK.', 'KKmmmmmmmmmmmmKK', '..KnnnnnnnnnnK..', '..KnnnnnnnnnnK..', '..KccnnnnnnccK..', '..KccnKKKKnccK..', '..KnnnKKKKnnnK..', '..KnnnKKKKnnnK..', '..KnnnKKKKnnnK..', '..KKKKKKKKKKKK..'],
    bush: ['................', '.....KKKKKK.....', '....KggggggK....', '....KwwggggK....', '...KwgggggggK...', '..KggggggggggK..', '.KgggggggggggGK.', 'KgggggggggwgGGGK', 'KggwgggggwgGGGGK', 'KgwgggggggGGGGGK', 'KggggggggGGGGGGK', 'KgggggggGGGGGGGK', '.KgggggGGGGGGGK.', '..KGGGGGGGGGGK..', '...KKKKKKKKKK...', '................'],
    water: ['cccccccccccccccc', 'cccccccccccccccc', 'cccccccccccccccc', 'cccccccccccccccc', 'ccwwwwwccccccccc', 'cccccccccccccccc', 'cccccccccccccccc', 'cccccccccccccccc', 'cccccccccccccccc', 'cccccccccccccccc', 'cccccccccccccccc', 'cccccccccwwwwwcc', 'cccccccccccccccc', 'cccccccccccccccc', 'cccccccccccccccc', 'cccccccccccccccc'],
    bridge: ['cccccccccccccccc', 'cccccccccccccccc', 'cccccccccccccccc', 'KKKKKKKKKKKKKKKK', 'oooKoooKoooKoooK', 'oooKoooKoooKoooK', 'oooKoooKoooKoooK', 'oooKoooKoooKoooK', 'oooKoooKoooKoooK', 'oooKoooKoooKoooK', 'oooKoooKoooKoooK', 'oooKoooKoooKoooK', 'KKKKKKKKKKKKKKKK', 'cccccccccccccccc', 'cccccccccccccccc', 'cccccccccccccccc'],
    dot: ['..KK..', '.KooK.', 'KooooK', 'KooooK', '.KooK.', '..KK..'],
    flag: ['.......KK.......', '......KggK......', '......KggK......', '......KggK......', '.......KK.......', '......KGK.......', '.....KwGK.......', '...KKwwGK.......', '..KwwwwGK.......', '.KwwwwwGK.......', '..KwwwwGK.......', '...KKwwGK.......', '.....KwGK.......', '......KGK.......', '.......KK.......', '.......KK.......', '.......KK.......', '.......KK.......', '.......KK.......', '.......KK.......', '.......KK.......', '.......KK.......', '.......KK.......', '.......KK.......', '.......KK.......', '.......KK.......', '.......KK.......', '.......KK.......', '...KKKKssKKKK...', '...KSSSSSSSSK...', '...KSSSSSSSSK...', '...KKKKKKKKKK...']
  };
  Object.keys(WMS).forEach(function (k) { document.documentElement.style.setProperty('--wm-' + k, spr(WMS[k])); });

  /* ════ 이력 — 월드 지도(슈퍼 마리오 시리즈 문법) ════
     슈퍼 마리오브라더스 3 의 지도 화면(번호 칸 · 성 · 집 · 강 · 다리 · 아래 상태 막대 · 카드 세 칸) + 슈퍼 마리오 월드의 코스 이름 띠를 한 화면에.
     10년 = 지도 한 장, 길 = 시간 순서. START = 나(프로필), 번호 칸 = 경력 · 활동, 성 = 출시한 프로젝트, 집 = 배운 곳, 깃발 = 다음 목표.
     칸을 누르거나 ◀ ▶(↑ ↓) 로 고르면 고스트(1P)가 그 칸에 서고, 오른쪽 코스 카드 · 위 이름 띠가 바뀜. 처음엔 START(나)가 골라져 있어 누르지 않아도 읽힘.
     글 · 숫자 · 기간은 content.js(이력서 · 프로젝트 · 자기소개서)에서. 이 화면만의 짧은 이름 · 큰 숫자는 WN 에(ko/en) — 실제 홈에 넣을 때 content.js 로 옮김 */
  function proj(id) { return ((C.projects && C.projects.items) || []).filter(function (p) { return p.id === id; })[0] || {}; }
  function car(re) { return CAREER.filter(function (c) { return re.test((c.role && c.role.ko) || ''); })[0] || {}; }
  function plain(h) { return String(h || '').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
  var WN = [
    { id: 'start', k: 'start', x: 16, y: 320, code: 'START', short: { ko: '나', en: 'Me' } },
    { id: 'solo', k: 'panel', d: '1', x: 192, y: 320, code: '1-1', short: { ko: '1인 개발', en: 'Solo dev' }, c: function () { return car(/1인 개발/); }, p: function () { return proj('indie-games'); },
      big: ['200K', { ko: '누적 다운로드', en: 'downloads' }] },
    { id: 'comm', k: 'panel', d: '2', x: 192, y: 128, code: '1-2', short: { ko: '커뮤니티 스탭', en: 'Community staff' }, c: function () { return car(/스탭/); },
      big: ['60K', { ko: '커뮤니티 회원', en: 'members' }] },
    { id: 'lod', k: 'castle', x: 448, y: 128, code: 'CASTLE', short: { ko: '리그 오브 디펜스', en: 'League of Defense' }, p: function () { return proj('league-of-defense'); },
      big: ['100K', { ko: '누적 다운로드', en: 'downloads' }] },
    { id: 'blog', k: 'panel', d: '3', x: 448, y: 320, code: '1-3', short: { ko: '게임 평론', en: 'Game criticism' }, c: function () { return car(/블로그/); },
      big: ['3–5K', { ko: '한 달 조회', en: 'views a month' }] },
    { id: 'study', k: 'panel', d: '4', x: 576, y: 320, code: '1-4', short: { ko: '발표 스터디', en: 'Study group' }, c: function () { return car(/스터디/); },
      big: ['12', { ko: '명 · 매주 기획서', en: 'people · weekly docs' }] },
    { id: 'course', k: 'house', x: 576, y: 128, code: 'HOUSE', short: { ko: '기획자 과정', en: 'Design course' }, c: function () { return car(/과정/); } },
    { id: 'com', k: 'castle', x: 704, y: 128, code: 'CASTLE', short: { ko: '컴스톡', en: 'Comstock' }, p: function () { return proj('comstock'); },
      big: ['STEAM', { ko: '석 달 만에 출시', en: 'shipped in 3 months' }] },
    { id: 'goal', k: 'flag', x: 704, y: 256, code: 'GOAL', short: { ko: '다음 목표 · PD', en: 'Next · PD' } }
  ];
  var WKIND = { start: { ko: '1P · 플레이어', en: '1P · Player' }, panel: { ko: '경력 · 활동', en: 'Career · activity' }, castle: { ko: '성 · 출시한 프로젝트', en: 'Castle · shipped project' }, house: { ko: '집 · 배운 곳', en: 'House · learning' }, flag: { ko: '깃발 · 다음 목표', en: 'Flag · next goal' } };
  var WGOAL = { ko: '큰 목표를 작은 문제로 나누어 해결하는 PD', en: 'A producer who breaks big goals into small problems' };
  /* 길(가운데 선 좌표) — 시간 순서대로. 마지막(깃발로 가는 길)은 아직 안 간 길이라 점선 */
  var WROAD = [[144, 352, 192, 352], [224, 192, 224, 320], [256, 160, 448, 160], [480, 192, 480, 320], [512, 352, 576, 352], [608, 192, 608, 320], [640, 160, 704, 160], [736, 192, 736, 256, 1]];
  var WBUSH = [[0, 0], [64, 0], [128, 0], [256, 0], [416, 0], [512, 0], [640, 0], [736, 0], [32, 224], [96, 224], [256, 232], [520, 232], [644, 232], [0, 384], [64, 384]];
  function wNow(n) {             /* 진행 중 = '현재' 이거나 끝 달이 안 지남 */
    var c = n.c && n.c(); if (!c || !c.date) return false;
    if (/현재/.test(c.date.ko || '')) return true;
    var m = /(\d{4})\.(\d{2})\s*$/.exec(c.date.ko || ''); if (!m) return !!c.now;
    var d = new Date(); return +m[1] * 12 + +m[2] >= d.getFullYear() * 12 + d.getMonth() + 1;
  }
  function wSprite(n) {
    if (n.k === 'panel') return 'p' + n.d + (wNow(n) ? '' : 'c');
    return n.k;
  }
  function wCard(n) {
    var c = n.c && n.c(), p = n.p && n.p(), now = wNow(n), h = '';
    var st = n.k === 'start' ? '<b class="wm-chip">1P</b>' : n.k === 'flag' ? '<b class="wm-chip wm-chip--next">NEXT</b>' : now ? '<b class="wm-chip wm-chip--now">▶ ' + T('진행 중', 'ONGOING') + '</b>' : '<b class="wm-chip wm-chip--clr ps">CLEAR</b>';
    h += '<p class="wm-c__top"><b class="ps wm-c__code">' + esc(n.code) + '</b><span>' + esc(t(WKIND[n.k])) + '</span>' + st + '</p>';
    if (n.k === 'start') {
      var quip = C.home && C.home.quips && C.home.quips[0];
      h += '<h4 class="wm-c__t">' + esc(NAME) + '<small>' + T('게임 기획자', 'Game designer') + '</small></h4><p class="wm-c__lead">' + esc(plain(t(C.hero && C.hero.titleHtml))) + '</p>' +
        '<div class="wm-c__stats">' + stats.map(function (s) { return '<div><b class="ps">' + esc(s.num) + '<small>' + esc(t(s.unit)) + '</small></b><span>' + esc(t(s.label)) + '</span></div>'; }).join('') + '</div>' +
        (quip ? '<p class="wm-c__say">“' + esc(t(quip)) + '”</p>' : '') + '<p class="wm-c__go">' + T('▼ 내리면 2016년부터 길을 따라갑니다', 'Scroll to follow the road from 2016') + '</p>';
      return h;
    }
    if (n.k === 'flag') {
      var course = car(/과정/);
      h += '<h4 class="wm-c__t">PD</h4><p class="wm-c__lead">' + esc(t(WGOAL)) + '</p>' +
        (course.role ? '<p class="wm-c__body">' + T('가는 길: ', 'On the way: ') + esc(t(course.role)) + ' · ' + esc(t(course.date)) + '</p>' : '') +
        '<p class="wm-c__body">' + T('아직 안 간 길이라 점선입니다.', 'The dotted road is the part not travelled yet.') + '</p>';
      return h;
    }
    var title = p && p.title ? t(p.title) : t(c.role);
    h += '<h4 class="wm-c__t">' + esc(title) + '</h4>';
    var meta = [];
    meta.push([T('기간', 'When'), p && p.period ? t(p.period) : t(c.date)]);
    if (p && p.headcount) meta.push([T('인원', 'Team'), t(p.headcount)]);
    if (p && p.myRole) meta.push([T('역할', 'Role'), t(p.myRole)]);
    if (p && p.status) meta.push([T('출시', 'Out'), t(p.status)]);
    if (c && c.org && !(p && p.status)) meta.push([T('소속', 'With'), t(c.org)]);
    h += '<dl class="wm-c__meta">' + meta.map(function (m) { return '<div><dt>' + m[0] + '</dt><dd>' + esc(m[1]) + '</dd></div>'; }).join('') + '</dl>';
    if (n.big) h += '<p class="wm-c__big"><b class="ps">' + esc(n.big[0]) + '</b><span>' + esc(t(n.big[1])) + '</span></p>';
    if (n.id === 'course' && c.date) {
      var m = /(\d{4})\.(\d{2})\s*[–-]\s*(\d{4})\.(\d{2})/.exec(c.date.ko || ''), d = new Date();
      if (m) { var a = +m[1] * 12 + +m[2], b = +m[3] * 12 + +m[4], z = d.getFullYear() * 12 + d.getMonth() + 1, tot = b - a + 1, el = Math.max(0, Math.min(tot, z - a + 1));
        h += '<div class="wm-c__bar"><i style="--p:' + (el / tot * 100).toFixed(1) + '%"></i><span>' + (L === 'en' ? 'Month ' + el + ' of ' + tot : el + ' / ' + tot + '개월') + '</span></div>'; }
    }
    if (p && p.quest && p.quest.goal) h += '<div class="wm-c__q"><p><b class="ps">QUEST</b>' + esc(t(p.quest.goal)) + '</p><p class="r">' + esc(t(p.quest.result)) + (p.quest.cleared ? '<b class="ps">CLEAR</b>' : '') + '</p></div>';
    if (c && c.body && !(p && p.learned && p.learned.length)) h += '<p class="wm-c__body">' + esc(t(c.body)) + '</p>';
    if (p && p.learned && p.learned.length) h += '<ul class="wm-c__learn">' + p.learned.slice(0, 2).map(function (x) { return '<li>' + esc(t(x)) + '</li>'; }).join('') + '</ul>';
    if (c && c.tags && !(p && p.learned)) h += '<p class="wm-c__tags">' + c.tags.map(function (x) { return '<span>' + esc(t(x)) + '</span>'; }).join('') + '</p>';
    return h;
  }
  function draftE1() {
    var map = '';
    for (var y = 0; y < 448; y += 64) map += '<i class="wm-s wm-water" style="left:320px;top:' + y + 'px"></i>';
    WBUSH.forEach(function (b) { map += '<i class="wm-s wm-bush" style="left:' + b[0] + 'px;top:' + b[1] + 'px"></i>'; });
    WROAD.forEach(function (r) {
      var hz = r[1] === r[3], x = Math.min(r[0], r[2]), y2 = Math.min(r[1], r[3]), len = hz ? Math.abs(r[2] - r[0]) : Math.abs(r[3] - r[1]);
      map += '<i class="wm-road' + (r[4] ? ' wm-road--next' : '') + (hz ? ' h' : ' v') + '" style="left:' + (hz ? x : x - 12) + 'px;top:' + (hz ? y2 - 12 : y2) + 'px;' + (hz ? 'width' : 'height') + ':' + len + 'px"></i>';
    });
    map += '<i class="wm-s wm-bridge" style="left:320px;top:128px"></i>';
    WN.forEach(function (n, i) {
      var w = n.k === 'start' ? 128 : 64, h = n.k === 'flag' ? 128 : 64, top = n.y < 300 && n.k !== 'flag';
      map += '<button type="button" class="wm-n wm-n--' + n.k + '" data-wn="' + i + '" style="left:' + n.x + 'px;top:' + n.y + 'px;width:' + w + 'px;height:' + h + 'px" aria-label="' + esc(n.code + ' · ' + t(n.short)) + '"><i class="wm-s wm-' + wSprite(n) + '"></i></button>';
      if (n.k !== 'start') map += '<span class="wm-lb' + (top ? ' up' : '') + '" data-wl="' + i + '" style="left:' + (n.x + w / 2) + 'px;top:' + (top ? n.y - 52 : n.y + h + 4) + 'px">' + esc(t(n.short)) + (wNow(n) ? ' <b>▶</b>' : '') + '</span>';
    });
    map += '<i class="wm-s wm-me" aria-hidden="true"></i>';
    var cards = [['200K', { ko: '1인 · 5종', en: 'Solo · 5 titles' }], ['100K', { ko: '리그 오브 디펜스', en: 'League of Defense' }], ['STEAM', { ko: '컴스톡', en: 'Comstock' }]];
    var dl = stats[0] ? String(stats[0].num).replace(/K$/i, '000') : '0';
    var yrs = +(stats[3] && stats[3].num) || 10, pm = '';
    for (var k = 0; k < 10; k++) pm += '<i' + (k < yrs ? ' class="on"' : '') + '>▶</i>';
    var status = '<div class="wm__st"><div class="wm-box"><p class="r1"><b class="ps">WORLD 1</b><span class="wm-pm" aria-label="' + T('10년', '10 years') + '">' + pm + '<b class="ps">P</b></span><small>' + T('2016 → 2026 · 10년', '2016 → 2026 · 10 yrs') + '</small></p>' +
      '<p class="r2"><b class="ps">1P</b><span class="wm-sc"><b class="ps">' + esc(('0000000' + dl).slice(-7)) + '</b><small>' + T('누적 다운로드', 'downloads') + '</small></span><span class="wm-sc"><b class="ps">×' + esc((stats[1] && stats[1].num) || '7') + '</b><small>' + T('출시작', 'titles') + '</small></span><span class="wm-sc"><b class="ps">' + esc((stats[2] && stats[2].num) || '60K') + '</b><small>' + T('커뮤니티', 'community') + '</small></span></p></div>' +
      '<div class="wm-cards">' + cards.map(function (c) { return '<div class="wm-card"><b class="ps">' + esc(c[0]) + '</b><span>' + esc(t(c[1])) + '</span></div>'; }).join('') + '</div></div>';
    return '<section class="wm" data-wm><div class="wm__bar"><b class="ps wm__code" data-wm-code></b><span class="wm__name" data-wm-name></span><span class="wm__yr" data-wm-yr></span><span class="sp"></span><span class="wm__hint">' + T('▼ 내리면 다음 칸', '▼ Scroll for the next') + '</span><button type="button" class="wm-key" data-wm-step="-1" aria-label="' + T('이전 칸', 'Previous') + '">◀</button><button type="button" class="wm-key" data-wm-step="1" aria-label="' + T('다음 칸', 'Next') + '">▶</button></div>' +
      '<div class="wm__body"><div class="wm__mapwrap"><div class="wm__map" tabindex="0" role="group" aria-label="' + T('월드 지도 — 10년 이력', 'World map — ten years') + '">' + map + '</div></div><article class="wm__card" aria-live="polite" data-wm-card></article></div>' + status + '</section>';
  }
  function wireE1() {
    var root = document.querySelector('[data-wm]'); if (!root) return null;
    var me = root.querySelector('.wm-me'), cur = 0;
    function sel(i, quiet) {
      cur = (i + WN.length) % WN.length; var n = WN[cur], w = n.k === 'start' ? 128 : 64;
      me.style.left = (n.x + w / 2 - 24) + 'px'; me.style.top = (n.k === 'flag' ? n.y - 16 : n.y - 44) + 'px';
      [].forEach.call(root.querySelectorAll('[data-wn]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-wn') === cur)); });
      [].forEach.call(root.querySelectorAll('[data-wl]'), function (b) { b.classList.toggle('on', +b.getAttribute('data-wl') === cur); });
      var c = n.c && n.c(), p = n.p && n.p();
      root.querySelector('[data-wm-code]').textContent = n.code;
      root.querySelector('[data-wm-name]').textContent = n.k === 'start' ? NAME + ' · ' + T('게임 기획자', 'Game designer') : t(n.short);
      root.querySelector('[data-wm-yr]').textContent = p && p.period ? t(p.period) : c && c.date ? t(c.date) : n.k === 'start' ? '2016' : '';
      var card = root.querySelector('[data-wm-card]'); card.innerHTML = wCard(n); pop(card, quiet);
      wCam(root.querySelector('.wm__mapwrap'), root.querySelector('.wm__map'), n.x + w / 2, n.k === 'flag' ? n.y + 48 : n.y + 16, quiet);
    }
    function req(i) { (root.__req || sel)((i + WN.length) % WN.length); }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-wn]'); if (b) req(+b.getAttribute('data-wn'));
      var k = e.target.closest('[data-wm-step]'); if (k) req(cur + +k.getAttribute('data-wm-step'));
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { req(cur + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { req(cur - 1); e.preventDefault(); }
    });
    sel(0, true);
    scrubWire('e1', { root: root, n: WN.length, go: sel, levels: ['is-tight'], step: .5 });
  }

  /* ── 마리오 시리즈 공용: 경력 칸 일곱(시간 순) · 시기마다 늘어난 숫자 · 한 칸씩 넘기기 ── */
  var WSEQ = WN.slice(1, -1);
  var WGAIN = { solo: { dl: 200000, ti: 5 }, lod: { dl: 100000, ti: 1 }, com: { ti: 1 } };
  var WTEAM = { solo: ['1', { ko: '명', en: 'person' }], comm: ['60K', { ko: '회원', en: 'members' }], lod: ['3', { ko: '명', en: 'people' }], blog: ['2', { ko: '명', en: 'people' }], study: ['12', { ko: '명', en: 'people' }], com: ['5', { ko: '명', en: 'people' }] };
  function wPeriod(n) { var c = n.c && n.c(), p = n.p && n.p(); return p && p.period ? t(p.period) : c && c.date ? t(c.date) : ''; }
  function wTitle(n) { var c = n.c && n.c(), p = n.p && n.p(); return p && p.title ? t(p.title) : c && c.role ? t(c.role) : t(n.short); }
  function wYear(n) { var m = /\d{4}/.exec(wPeriod(n)); return m ? m[0] : ''; }
  function wTotals(upto) {      /* upto 번째 칸까지 쌓인 점수(누적 다운로드) · 동전(출시작) */
    var dl = 0, ti = 0;
    for (var i = 0; i <= upto && i < WSEQ.length; i++) { var g = WGAIN[WSEQ[i].id] || {}; dl += g.dl || 0; ti += g.ti || 0; }
    return { dl: dl, ti: ti };
  }
  function wCourse() {          /* 기획자 과정 — 몇 달째인지(다음 목표까지 남은 길) */
    var c = car(/과정/), m = /(\d{4})\.(\d{2})\s*[–-]\s*(\d{4})\.(\d{2})/.exec((c.date && c.date.ko) || ''), d = new Date();
    if (!m) return null;
    var a = +m[1] * 12 + +m[2], b = +m[3] * 12 + +m[4], z = d.getFullYear() * 12 + d.getMonth() + 1, tot = b - a + 1;
    return { el: Math.max(0, Math.min(tot, z - a + 1)), tot: tot, c: c };
  }
  function wirePager(root, count, show) {          /* 누르기 · ← → 는 그 칸 자리까지 스크롤만(root.__req) — 칸을 바꾸는 건 늘 스크롤 */
    var cur = 0;
    function go(i, quiet) {
      cur = (i + count) % count; show(cur, quiet);
      [].forEach.call(root.querySelectorAll('[data-go]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-go') === cur)); });
    }
    function req(i) { (root.__req || go)((i + count) % count); }
    root.addEventListener('click', function (e) {
      var s = e.target.closest('[data-step]'); if (s) req(cur + +s.getAttribute('data-step'));
      var g = e.target.closest('[data-go]'); if (g) req(+g.getAttribute('data-go'));
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { req(cur + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { req(cur - 1); e.preventDefault(); }
    });
    go(0, true);
    return { go: go, cur: function () { return cur; } };
  }

  /* ── 스크롤로 넘기기(마리오 시리즈 넷 공용) — 틀(.scrub__stick)이 화면에 붙은 채, 내리는 만큼 다음 칸(진행 0 ~ 1 → 칸 번호).
     칸 누르기 · ◀ ▶ · ← → 는 그 칸 자리까지 페이지를 스크롤해 줄 뿐 — 아무것도 누르지 않고 내리기만 해도 끝까지 다 봄(사용자: "상호작용은 스크롤만으로도 돼야 해").
     틀이 화면보다 크면 api.levels 의 클래스(is-tight · is-tab …)를 차례로 붙여 줄이고(모든 칸 중 가장 큰 높이로 잼), 그래도 크면 마지막에만 zoom */
  var SCRUBS = [];
  function scrubHTML(d) {
    return '<div class="scrub" data-scrub="' + d.id + '"><div class="scrub__stick">' + d.f() +
      '<p class="scrub__cue"><span class="scrub__bar"><u></u></span><b data-scrub-n></b><span>' + T('▼ 내리기만 하면 다음 칸으로 — 칸을 누르면 그 자리까지 스크롤합니다', '▼ Just scroll to move on — tapping a space scrolls there') + '</span></p></div></div>';
  }
  function scrubWire(id, api) {      /* api: { root, n, go(i, quiet), tick(i, t), levels, step(화면 높이 대비 한 칸 길이) } */
    var box = document.querySelector('[data-scrub="' + id + '"]'); if (!box) return;
    var s = { box: box, stick: box.firstElementChild, api: api, cur: 0, n: box.querySelector('[data-scrub-n]'), bar: box.querySelector('.scrub__bar u') };
    api.root.__req = function (i) { scrubTo(s, i); };
    s.n.textContent = '1 / ' + api.n;
    SCRUBS.push(s);
    SCROLLERS.push({ box: box, stick: s.stick, prog: function (p) {
      var f = p * api.n, i = Math.min(api.n - 1, Math.floor(f));
      s.bar.style.width = (p * 100).toFixed(1) + '%';
      if (i !== s.cur) { s.cur = i; api.go(i); s.n.textContent = (i + 1) + ' / ' + api.n; }
      if (api.tick) api.tick(i, Math.min(1, f - i));       /* 칸 안 진행 0 ~ 1 — 걷기 · 글 쓰기 · 숫자 올리기 */
    } });
  }
  function scrubTo(s, i) {
    var r = s.box.getBoundingClientRect(), st = parseFloat(getComputedStyle(s.stick).top) || 0, span = s.box.offsetHeight - s.stick.offsetHeight;
    window.scrollTo({ top: Math.round(window.scrollY + r.top - st + span * (i + .5) / s.api.n), behavior: RM ? 'auto' : 'smooth' });
  }
  function fitScrubs() {
    var top = document.querySelector('.top'), th = top && getComputedStyle(top).position === 'sticky' ? Math.ceil(top.getBoundingClientRect().height) : 0;
    var vh = window.innerHeight, av = vh - th - 20;
    SCRUBS.forEach(function (s) {
      var root = s.api.root, lv = [''].concat(s.api.levels || []), k = 0, h, cue;
      s.stick.style.top = (th + 10) + 'px'; s.stick.style.minHeight = ''; root.style.zoom = '';
      cue = s.stick.offsetHeight - root.offsetHeight;
      function tallest() { var m = 0; for (var i = 0; i < s.api.n; i++) { s.api.go(i, true); m = Math.max(m, root.offsetHeight); } s.api.go(s.cur, true); return m; }
      do { root.className = root.className.replace(/\s*\bis-(tight|tab)\b/g, '') + (lv[k] ? ' ' + lv[k] : ''); h = tallest() + cue; } while (h > av && ++k < lv.length);
      var z = h > av ? Math.max(.62, (av - cue) / (h - cue)) : 1;
      if (z < 1) { root.style.zoom = z.toFixed(4); h = Math.ceil((h - cue) * z) + cue; s.api.go(s.cur, true); }
      s.stick.style.minHeight = h + 'px';
      s.box.style.height = (h + Math.max(240, Math.round(vh * (s.api.step || .5))) * (s.api.n - 1)) + 'px';
    });
  }
  function wCam(wrap, map, x, y, quiet) {   /* 지도가 창보다 크면 고른 칸이 가운데 오게 지도를 옮김(정수 px — 도트가 흐려지지 않게) */
    var W = wrap.clientWidth, H = wrap.clientHeight;
    var dx = Math.round(Math.max(0, Math.min(map.offsetWidth - W, x - W / 2))), dy = Math.round(Math.max(0, Math.min(map.offsetHeight - H, y - H / 2)));
    if (quiet) map.style.transition = 'none';
    map.style.transform = dx || dy ? 'translate(' + -dx + 'px, ' + -dy + 'px)' : '';
    if (quiet) { void map.offsetWidth; map.style.transition = ''; }
  }
  function pop(el, quiet) { if (!el || quiet || RM) return; el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop'); }

  /* ════ 이력 — 슈퍼 마리오브라더스(패미컴) 코스 시작 화면 ════
     검은 화면 맨 위 점수판(1P · 점수 · 동전 · WORLD · TIME, 값 밑에 뜻) + 가운데 'WORLD 3-4' 와 그 코스 + 아래 그 코스의 장면 한 줄(하늘 · 땅 블록 · 소품 1배).
     시기 하나 = 월드 하나(1 ~ 7, 출시한 프로젝트는 성이 있는 x-4), 다음 목표 = 마지막 월드 8.
     스크롤 = 플레이: 한 칸 안에서 고스트가 달려가 그 칸의 일을 해냄 — 경력 = 물음표 블록을 쳐서 그 시기의 숫자가 동전과 함께 튀어나옴, 출시 프로젝트 = 계단을 올라 깃대를 타고
     내려오면 깃발이 내려옴, 배운 곳 = 관 속으로 들어감, 다음 목표 = 계단 꼭대기에서 빈 깃대에 깃발이 오름. 그 순간 점수판이 올라가고 퀘스트 결과(CLEAR)가 뜸 */
  var MBW = [{ k: 'start', w: 'START' }].concat(WSEQ.map(function (n, i) { return { n: n, k: n.k, w: (i + 1) + (n.k === 'castle' ? '-4' : '-1') }; })).concat([{ k: 'goal', w: '8-1' }]);
  var MB_USED = grid(16, 16, function (x, y) { return x === 0 || y === 0 || x === 15 || y === 15 || ((x === 2 || x === 13) && (y === 2 || y === 13)) ? 'K' : 'm'; });   /* 다 쓴 블록 */
  function mbScene(e) {
    var k = e.k, s = '<i class="mb-gnd"></i><i class="mb-s s-cloud" style="left:6%;top:24px"></i><i class="mb-s s-cloud" style="left:36%;top:16px"></i><i class="mb-s s-hill" style="left:-24px"></i><i class="mb-s s-bush" style="left:38%"></i>';
    s += '<i class="mb-s s-ghost mb-me"></i><b class="mb-pts ps"></b>';
    if (k === 'panel') s += '<i class="mb-s s-brick mb-row" style="left:calc(66% - 64px)"></i><i class="mb-s s-qb mb-row mb-qb" style="left:66%"></i><i class="mb-s s-brick mb-row" style="left:calc(66% + 64px)"></i><i class="mb-s s-coin mb-coin" style="left:calc(66% + 20px)"></i>';
    if (k === 'castle' || k === 'goal') {
      for (var j = 0; j < 3; j++) s += '<i class="mb-s mb-hard mb-hard' + j + '" style="right:' + (232 - j * 64) + 'px;height:' + (j + 1) * 64 + 'px"></i>';
      s += '<i class="mb-s s-pole mb-pole"></i><i class="mb-s s-flagt mb-flag"></i>';
    }
    if (k === 'house') s += '<i class="mb-s s-pipe mb-pipe" style="left:min(66%, calc(100% - 144px))"></i>';
    return s;
  }
  function mbTot(i) {                 /* i 번째 화면에 들어설 때(앞) · 일을 해낸 뒤(뒤)의 점수판 */
    var e = MBW[i], j = e.n ? WSEQ.indexOf(e.n) : i === 0 ? -1 : WSEQ.length - 1;
    var after = j < 0 ? { dl: 0, ti: 0 } : wTotals(j), before = j < 1 ? (e.n ? { dl: 0, ti: 0 } : after) : wTotals(j - 1);
    return { before: e.n ? before : after, after: after };
  }
  function mbMid(i) {                /* 그 월드의 글(검은 화면) — 한 칸씩 넘기는 판 · 목록판 공용 */
    var e = MBW[i], n = e.n;
    var mid = '';
    if (!n && i === 0) {
      mid = '<p class="ps mb__w">START</p><p class="mb__lives"><i class="mb-s s-ghost in"></i><b class="ps">× ' + esc(YRS) + '</b><span>' + T('년째 게임을 만드는 중', 'years of making games') + '</span></p>' +
        '<h4 class="mb__t">' + esc(NAME) + '<small>' + T('게임 기획자', 'Game designer') + '</small></h4><p class="mb__lead">' + esc(plain(t(C.hero && C.hero.titleHtml))) + '</p>' +
        '<p class="mb__note">' + T('▼ 내리면 2016년부터 한 월드씩 — 고스트가 그 시기의 일을 해낼 때마다 위 점수판이 올라갑니다.', 'Scroll to play from 2016 — the scoreboard above climbs each time the ghost gets that period\'s job done.') + '</p>';
    } else if (!n) {
      var cs = wCourse();
      mid = '<p class="ps mb__w">WORLD 8-1</p><p class="mb__lives"><i class="mb-s s-ghost in"></i><b class="ps">NEXT</b><span>' + T('다음 목표', 'next goal') + '</span></p><h4 class="mb__t">PD</h4><p class="mb__lead">' + esc(t(WGOAL)) + '</p>' +
        (cs ? '<p class="mb__note mb-later">' + T('가는 길: ', 'On the way: ') + esc(t(cs.c.role)) + ' · ' + (L === 'en' ? 'month ' + cs.el + ' of ' + cs.tot : cs.tot + '개월 중 ' + cs.el + '개월째') + '</p>' : '');
    } else {
      var c = n.c && n.c(), p = n.p && n.p(), now = wNow(n), team = WTEAM[n.id];
      var meta = [wPeriod(n)].concat(p && p.myRole ? [t(p.myRole)] : []).concat(p && p.status ? [t(p.status)] : c && c.org ? [t(c.org)] : []);
      mid = '<p class="ps mb__w">WORLD ' + esc(e.w) + (now ? '<span class="mb__now">▶ ' + T('진행 중', 'NOW') + '</span>' : '') + '</p>' +
        (team ? '<p class="mb__lives"><i class="mb-s s-ghost in"></i><b class="ps">× ' + esc(team[0]) + '</b><span>' + esc(t(team[1])) + '</span></p>' : '') +
        '<h4 class="mb__t">' + esc(wTitle(n)) + '</h4><p class="mb__sub">' + meta.map(esc).join(' · ') + '</p>' +
        (n.big ? '<p class="mb__big mb-later"><b class="ps">' + esc(n.big[0]) + '</b><span>' + esc(t(n.big[1])) + '</span></p>' : '') +
        (p && p.quest && p.quest.goal ? '<p class="mb__q mb-later"><b class="ps">QUEST</b><span>' + esc(t(p.quest.goal)) + ' → <strong>' + esc(t(p.quest.result)) + '</strong></span>' + (p.quest.cleared ? '<em class="ps">CLEAR</em>' : '') + '</p>' : '') +
        (p && p.learned && p.learned[0] ? '<p class="mb__learn mb-later">' + esc(t(p.learned[0])) + '</p>' : c && c.body ? '<p class="mb__learn mb-later">' + esc(t(c.body)) + '</p>' : '');
    }
    return mid;
  }
  function mbShow(root, i, quiet) {
    var e = MBW[i], n = e.n;
    root.querySelector('[data-mb-world]').textContent = n ? e.w : i === 0 ? 'START' : '8-1';
    root.querySelector('[data-mb-time]').textContent = n ? wYear(n) : i === 0 ? '2016' : '2027';
    var mid = mbMid(i);
    var md = root.querySelector('[data-mb-mid]'); md.innerHTML = mid; pop(md, quiet);
    var sc = root.querySelector('[data-mb-scene]'); sc.innerHTML = mbScene(e);
    sc.querySelector('.mb-pts').textContent = n && n.big ? n.big[0] : !n && i ? 'PD' : '';
    root.__mbDone = -1;
    sc.classList.remove('go'); if (!quiet) { void sc.offsetWidth; sc.classList.add('go'); }
    mbTick(root, i, quiet ? 1 : 0);
  }
  function mbPath(pts, t) {           /* [[x, 땅 위 높이, 때], …] 를 따라 — 높이가 바뀌는 칸은 살짝 뛰어오름 */
    if (t <= pts[0][2]) return [pts[0][0], pts[0][1], false];
    for (var j = 1; j < pts.length; j++) if (t <= pts[j][2]) {
      var a = pts[j - 1], b = pts[j], f = (t - a[2]) / Math.max(1e-6, b[2] - a[2]);
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f + (b[1] !== a[1] && b[0] !== a[0] ? Math.sin(Math.PI * f) * 16 : 0), a[1] === b[1] && a[0] !== b[0]];
    }
    var z = pts[pts.length - 1]; return [z[0], z[1], false];
  }
  function mbAct(root, sc, e, t) {     /* 장면 한 줄 — 고스트가 그 코스를 해냄(t 0 ~ 1). 해낸 정도(act)를 돌려줌 */
    var k = e.k, W = sc.clientWidth, me = sc.querySelector('.mb-me'), pt = sc.querySelector('.mb-pts');
    if (!me) return 1;
    var g = parseFloat(getComputedStyle(root).getPropertyValue('--g')) || 128, sky = sc.clientHeight - g, act = 1, at, px = 0, py = 0;
    function q(v) { return Math.round(v / 4) * 4; }
    if (k === 'start') at = mbPath([[-48, 0, 0], [W * .22, 0, .45], [W * .22, 0, .88], [W + 48, 0, 1]], t);
    else if (k === 'panel') {
      var qb = sc.querySelector('.mb-qb'), bx = qb.offsetLeft, hit = t >= .53;
      at = mbPath([[-48, 0, 0], [bx + 8, 0, .45], [bx + 8, 0, .88], [W + 48, 0, 1]], t);
      at[1] = Math.sin(Math.PI * clamp01((t - .45) / .16)) * 40;
      qb.classList.toggle('is-used', hit);
      act = clamp01((t - .53) / .25);
      var coin = sc.querySelector('.mb-coin'), rise = Math.max(16, Math.min(72, sky - 160 - 44));     /* 하늘이 낮으면 덜 튐 */
      coin.style.visibility = hit && act < 1 ? 'visible' : 'hidden'; coin.style.bottom = (g + 160 + q(Math.sin(Math.PI * act * .8) * rise)) + 'px';
      px = bx + 168; py = 112 + act * 40;                 /* 숫자는 벽돌 줄 오른쪽에서 떠오름 */
    } else if (k === 'castle' || k === 'goal') {
      var hs = [].filter.call(sc.querySelectorAll('.mb-hard'), function (h) { return h.offsetParent; }).sort(function (a, b) { return a.offsetLeft - b.offsetLeft; });
      var pole = sc.querySelector('.mb-pole'), flag = sc.querySelector('.mb-flag'), pc = pole.offsetLeft + 64, path = [[-48, 0, 0], [hs[0].offsetLeft - 52, 0, .35]];
      hs.forEach(function (h, j) { path.push([h.offsetLeft + 8, h.offsetHeight, .35 + (j + 1) * .05]); });
      var top = hs[hs.length - 1].offsetHeight, tt = .35 + hs.length * .05;
      if (k === 'castle') {
        path.push([pc - 50, top, tt + .06]); path.push([pc - 50, 0, .84]); path.push([pc - 50, 0, .9]); path.push([W + 48, 0, 1]);
        act = clamp01((t - tt - .06) / (.84 - tt - .06));
        flag.style.bottom = (g + q(128 - act * 120)) + 'px';
      } else {
        act = clamp01((t - tt) / .3);
        flag.style.bottom = (g + q(8 + act * 120)) + 'px'; flag.style.visibility = t > tt ? 'visible' : 'hidden';
      }
      at = mbPath(path, t); px = pc - 112; py = 120 + act * 24;
    } else if (k === 'house') {
      var pipe = sc.querySelector('.mb-pipe'), pl = pipe.offsetLeft;
      at = mbPath([[-48, 0, 0], [pl - 52, 0, .4], [pl + 40, 128, .52], [pl + 40, 128, .56], [pl + 40, 68, .8]], t);
      act = clamp01((t - .56) / .24);
    }
    var bob = at[2] && Math.floor(at[0] / 12) % 2 ? 4 : 0;
    me.style.left = q(at[0]) + 'px'; me.style.bottom = q(g + at[1] + bob) + 'px';
    pt.style.visibility = pt.textContent && act > 0 && act < 1 ? 'visible' : 'hidden';
    pt.style.left = q(px) + 'px'; pt.style.bottom = q(g + py) + 'px';
    return act;
  }
  function mbTick(root, i, t) {
    var e = MBW[i], sc = root.querySelector('[data-mb-scene]');
    if (!sc.querySelector('.mb-me')) return;
    var act = mbAct(root, sc, e, t);
    sc.classList.toggle('is-cut', i > 0 && t < .05);        /* 월드 사이 — 슈퍼 마리오브라더스처럼 검은 화면이 한 번 */
    var tot = mbTot(i), f = e.n ? act : 1;
    root.querySelector('[data-mb-score]').textContent = ('000000' + Math.round(tot.before.dl + (tot.after.dl - tot.before.dl) * f)).slice(-6);
    root.querySelector('[data-mb-coin]').textContent = '×' + ('0' + (f >= .5 ? tot.after.ti : tot.before.ti)).slice(-2);
    var done = e.k === 'start' || act >= 1;
    [].forEach.call(root.querySelectorAll('.mb-later'), function (el) { el.classList.toggle('is-wait', !done); });
    if (done && root.__mbDone !== i) { root.__mbDone = i; [].forEach.call(root.querySelectorAll('.mb-later'), function (el) { pop(el, t >= 1); }); }
    if (!done) root.__mbDone = -1;
  }
  function draftE2() {
    document.documentElement.style.setProperty('--mb-used', spr(MB_USED)); document.documentElement.style.setProperty('--mb-mini', spr(MINIG));
    function col(label, val, cap) { return '<p class="mb__col"><span>' + label + '</span>' + val + '<small>' + cap + '</small></p>'; }
    var chips = MBW.map(function (e, i) { var n = e.n; return '<button type="button" class="mb-chip" data-go="' + i + '"><b class="ps">' + esc(e.w) + '</b><span>' + esc(n ? wYear(n) : i === 0 ? T('나', 'Me') : 'PD') + '</span></button>'; }).join('');
    return '<section class="mb" data-mb tabindex="0" aria-label="' + T('코스 시작 화면 — 10년 이력', 'Course start screens — ten years') + '">' +
      '<div class="mb__hud">' + col('<b class="ps">1P</b> <span class="mb__nm">' + esc(NAME) + '</span>', '<b class="ps" data-mb-score>000000</b>', T('누적 다운로드', 'downloads')) +
      col('&nbsp;', '<b class="ps"><i class="mb-s s-coin-s in"></i><span data-mb-coin>×00</span></b>', T('출시작', 'titles shipped')) +
      col('<span class="ps">WORLD</span>', '<b class="ps" data-mb-world>1-1</b>', T('시기 하나 = 월드 하나', 'one period = one world')) +
      col('<span class="ps">TIME</span>', '<b class="ps" data-mb-time>2016</b>', T('그 해', 'the year')) + '</div>' +
      '<div class="mb__mid" data-mb-mid aria-live="polite"></div>' +
      '<div class="mb__scene" data-mb-scene aria-hidden="true"></div>' +
      '<div class="mb__nav"><button type="button" class="mb-key ps" data-step="-1" aria-label="' + T('이전 월드', 'Previous world') + '">◀</button><div class="mb__chips">' + chips + '</div><button type="button" class="mb-key ps" data-step="1" aria-label="' + T('다음 월드', 'Next world') + '">▶</button></div></section>';
  }
  function wireE2() {
    var r = document.querySelector('[data-mb]'); if (!r) return;
    var pg = wirePager(r, MBW.length, function (i, q) { mbShow(r, i, q); });
    scrubWire('e2', { root: r, n: MBW.length, go: pg.go, tick: function (i, t) { mbTick(r, i, t); }, levels: ['is-tight', 'is-tight is-short'], step: .6 });
  }
  /* ════ 이력 — 슈퍼 마리오 월드(슈퍼 패미컴) 섬 지도 + 메시지 블록 + COURSE CLEAR! ════
     바다 위 섬 하나(위 = 풀밭, 아래 = 갈색 벼랑, 물가에 흰 물거품 — 같은 4px 칸으로 코드가 칸마다 칠함) · 노란 점(경력) · 돌 성(출시 프로젝트) · 파란 점(배운 곳) · 깃발(다음 목표).
     위 검은 띠에 목숨(1P × 10년) · 지금 선 코스 이름, 아래 검은 메시지 블록(그 칸의 한 줄), 오른쪽 결산 화면(COURSE CLEAR! · 기간 · 숫자 · 보너스).
     스크롤 = 길: 한 칸 안에서 앞 7할은 그 코스(메시지가 써지고 숫자가 올라감), 뒤 3할은 고스트가 다음 칸으로 걸어가며 모래 길이 그 뒤로 그려짐 — 닿는 순간 다음 코스가 뜸 */
  var SWC = 4, SWW = 200, SWH = 112;                  /* 칸 4px · 지도 800 × 448 */
  var SWN = { start: [16, 82], solo: [34, 82], comm: [44, 54], lod: [66, 34], blog: [92, 50], study: [112, 74], course: [134, 54], com: [156, 34], goal: [180, 60] };
  var SWORD = ['start', 'solo', 'comm', 'lod', 'blog', 'study', 'course', 'com', 'goal'];
  function swPx(id) { var p = SWN[id]; return [p[0] * SWC + 2, p[1] * SWC + 2]; }
  function swHash(x, y) { var h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; }
  function swMap() {
    var g = [], x, y;
    for (y = 0; y < SWH; y++) { g.push([]); for (x = 0; x < SWW; x++) g[y].push('c'); }
    /* 섬 = 둥근 덩어리 여섯을 겹친 뒤 가장자리를 사인 두 개로 울퉁불퉁하게 */
    var blobs = [[30, 70, 26, 26], [62, 44, 30, 26], [96, 56, 30, 28], [128, 60, 26, 24], [158, 44, 30, 26], [182, 62, 16, 16]];
    function land(x, y) {
      if (y >= SWH - 9) return false;
      return blobs.some(function (b, i) {
        var dx = (x - b[0]) / b[2], dy = (y - b[1]) / b[3], a = Math.atan2(dy, dx);
        return dx * dx + dy * dy <= 1 + .1 * Math.sin(3 * a + i * 1.7) + .06 * Math.sin(7 * a + i * 2.3);
      });
    }
    for (y = 0; y < SWH; y++) for (x = 0; x < SWW; x++) {
      if (land(x, y)) g[y][x] = 'g';
      else for (var k = 1; k <= 5; k++) if (y - k >= 0 && land(x, y - k)) { g[y][x] = k === 5 ? 'K' : 'm'; break; }
    }
    /* 벼랑 줄무늬 · 풀밭 가장자리 외곽선 · 풀 포기 */
    var src = g.map(function (r) { return r.slice(); });
    function at(x, y) { return (src[y] && src[y][x]) || 'c'; }
    for (y = 1; y < SWH - 1; y++) for (x = 1; x < SWW - 1; x++) {
      var v = src[y][x];
      if (v === 'm') g[y][x] = (at(x - 1, y) === 'c' || at(x + 1, y) === 'c') ? 'K' : x % 6 === 0 ? 'd' : at(x, y - 1) === 'g' ? 'o' : 'm';
      if (v === 'g') {
        if (at(x - 1, y) === 'c' || at(x + 1, y) === 'c' || at(x, y - 1) === 'c' || at(x, y + 1) === 'm') g[y][x] = 'K';
        else if (swHash(x, y) % 89 === 0 && at(x + 2, y) === 'g' && at(x + 1, y + 1) === 'g') { g[y][x] = 'G'; g[y][x + 2] = 'G'; g[y + 1][x + 1] = 'G'; }
      }
    }
    /* 물거품 — 섬에 닿는 물 칸 한 줄(흰색 · 하늘색 번갈아) */
    var land2 = g.map(function (r) { return r.slice(); });
    for (y = 1; y < SWH - 1; y++) for (x = 1; x < SWW - 1; x++) if (land2[y][x] === 'c' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) { var q = land2[y + d[1]][x + d[0]]; return q !== 'c' && q !== 'w' && q !== 'u'; })) g[y][x] = (x + y) % 2 ? 'w' : 'u';
    /* 언덕 몇 개(둥근 초록 둔덕) */
    [[24, 60], [78, 30], [104, 40], [146, 70], [170, 28]].forEach(function (h) {
      for (var yy = -5; yy <= 0; yy++) for (var xx = -7; xx <= 7; xx++) {
        var inside = (xx * xx) / 49 + (yy * yy) / 25 <= 1, X = h[0] + xx, Y = h[1] + yy;
        if (!inside || g[Y][X] !== 'g' && g[Y][X] !== 'G') continue;
        var bord = (((xx - 1) * (xx - 1)) / 49 + (yy * yy) / 25 > 1) || (((xx + 1) * (xx + 1)) / 49 + (yy * yy) / 25 > 1) || ((xx * xx) / 49 + ((yy - 1) * (yy - 1)) / 25 > 1);
        g[Y][X] = bord ? 'K' : (xx > 2 ? 'G' : xx < -3 && yy === -3 ? 'l' : 'g');
      }
    });
    return g.map(function (r) { return r.join(''); });
  }
  function swWaves(map, phase) {      /* 반짝이는 물결 — 바다 칸에만, 두 장을 번갈아 */
    return map.map(function (r, y) { return r.split('').map(function (v, x) { return v === 'c' && y % 6 === 3 && swHash(x + phase * 3, y) % 47 < 2 ? 'w' : '.'; }).join(''); });
  }
  var SWDOT = { Y: grid(7, 7, function (x, y) { var d = (x - 3) * (x - 3) + (y - 3) * (y - 3); return d > 10 ? '.' : d > 5 ? 'K' : (x + y < 5 ? 'w' : 'Y'); }) };
  SWDOT.B = SWDOT.Y.map(function (r) { return r.replace(/Y/g, 'b'); });
  SWDOT.R = SWDOT.Y.map(function (r) { return r.replace(/Y/g, 'r'); });
  var SWCAST = ['K.KKK.K', 'KsKsKsK', 'KsssssK', 'KsSsSsK', 'KsSKSsK', 'KssKssK', 'KKKKKKK'];     /* 진행 칸의 작은 성 · 깃발 */
  var SWFLAG = ['Kw.....', 'Kwww...', 'Kwwwww.', 'Kwww...', 'Kw.....', 'K......', 'KK.....'];
  var MINIG = ['..KKK..', '.KrrrK.', 'KrrrrrK', 'KrKrKrK', 'KrKrKrK', 'KrrrrrK', 'KrrrrrK', 'KK.K.KK'];
  function swSeg(i) { var a = swPx(SWORD[i]), b = swPx(SWORD[i + 1]); return 'M' + a[0] + ' ' + a[1] + 'V' + b[1] + 'H' + b[0]; }
  function swAlong(i, w) {            /* i 번째 길(세로 먼저 · 가로 나중) 위 w(0 ~ 1) 지점 */
    var a = swPx(SWORD[i]), b = swPx(SWORD[i + 1]), l1 = Math.abs(b[1] - a[1]), l2 = Math.abs(b[0] - a[0]), d = w * (l1 + l2);
    return d <= l1 ? [a[0], a[1] + Math.sign(b[1] - a[1]) * d, d] : [a[0] + Math.sign(b[0] - a[0]) * (d - l1), b[1], d];
  }
  function draftE3() {
    PAL.y = '#fce0a8'; PAL.Y = '#f8b800'; PAL.b = '#0058f8'; PAL.d = '#883000';
    var map = swMap(), de = document.documentElement.style;
    de.setProperty('--sw-map', spr(map)); de.setProperty('--sw-wave-a', spr(swWaves(map, 0))); de.setProperty('--sw-wave-b', spr(swWaves(map, 1))); de.setProperty('--sw-life', spr(MINIG));
    ['Y', 'B', 'R'].forEach(function (k) { de.setProperty('--sw-dot' + k, spr(SWDOT[k])); });
    de.setProperty('--sw-cast', spr(SWCAST)); de.setProperty('--sw-flag', spr(SWFLAG));
    var road = '';
    for (var i = 0; i < SWORD.length - 1; i++) road += '<path class="h" d="' + swSeg(i) + '"/>';
    for (i = 0; i < SWORD.length - 1; i++) road += '<g data-sw-seg="' + i + '"><path class="b" pathLength="1" d="' + swSeg(i) + '"/><path class="f' + (i === SWORD.length - 2 ? ' last' : '') + '" pathLength="1" d="' + swSeg(i) + '"/></g>';
    var nodes = WN.map(function (n, i) {
      var p = swPx(n.id), cx = p[0], cy = p[1], w = n.k === 'castle' || n.k === 'flag' ? 64 : 40, h = n.k === 'flag' ? 128 : w;
      var top = n.k === 'flag' ? cy - 120 : cy - h / 2 - (n.k === 'castle' ? 12 : 0), inner = n.k === 'castle' ? '<i class="sw-s wm-castle"></i>' : n.k === 'flag' ? '<i class="sw-s wm-flag"></i>' : '<i class="sw-s sw-dot' + (n.k === 'house' ? 'B' : n.k === 'start' ? 'R' : 'Y') + '"></i>';
      return '<button type="button" class="sw-n sw-n--' + n.k + '" data-go="' + i + '" style="left:' + (cx - w / 2) + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px" aria-label="' + esc(n.code + ' · ' + t(n.short)) + '">' + inner + '</button>';
    }).join('');
    return '<section class="sw" data-sw tabindex="0" aria-label="' + T('섬 지도 — 10년 이력', 'Island map — ten years') + '"><div class="sw__body">' +
      '<div class="sw__mapwrap"><div class="sw__top"><p class="sw__lives"><i class="sw-life"></i><b class="ps">× ' + esc(YRS) + '</b></p><p class="sw__name" data-sw-name></p><p class="sw__yr ps" data-sw-yr></p></div>' +
      '<div class="sw__view"><div class="sw__map"><i class="sw-wave a"></i><i class="sw-wave b"></i><svg class="sw-road" width="800" height="448" viewBox="0 0 800 448" aria-hidden="true">' + road + '</svg>' + nodes +
      '<i class="sw-me" aria-hidden="true"></i></div></div></div><div class="sw__msg" data-sw-msg aria-live="polite"></div>' +
      '<div class="sw__clear" data-sw-clear></div></div>' +
      '<div class="sw__nav"><button type="button" class="mb-key ps" data-step="-1" aria-label="' + T('이전 코스', 'Previous') + '">◀</button><span>' + T('▼ 내리면 길을 따라 다음 코스로', '▼ Scroll to follow the road') + '</span><button type="button" class="mb-key ps" data-step="1" aria-label="' + T('다음 코스', 'Next') + '">▶</button></div></section>';
  }
  function swCount(s) { return '<b class="ps" data-sw-count="' + esc(s) + '">' + esc(s) + '</b>'; }
  function swTw(s) { return '<p class="sw-tw"><span class="sw-tw__g">' + esc(s) + '</span><span class="sw-tw__t" data-sw-tw="' + esc(s) + '"></span></p>'; }
  function swMsg(i) { var n = WN[i], c = n.c && n.c(), p = n.p && n.p();
  var msg = n.k === 'start' ? plain(t(C.hero && C.hero.titleHtml)) : n.k === 'flag' ? t(WGOAL) : c && c.body ? t(c.body) : p && p.learned && p.learned[0] ? t(p.learned[0]) : '';
    return msg; }
  function swClear(i) {               /* 결산 화면(COURSE CLEAR! · READY! · NEXT) — 한 칸씩 넘기는 판 · 목록판 공용 */
    var n = WN[i], c = n.c && n.c(), p = n.p && n.p();
    var h = '<p class="sw-c__who">' + esc(NAME) + '</p>';
    if (n.k === 'start') {
      var quip = C.home && C.home.quips && C.home.quips[0];
      h += '<p class="ps sw-c__big">READY!</p><p class="sw-c__t">' + T('게임 기획자', 'Game designer') + '</p><dl class="sw-c__rows sw-c__rows--st">' + stats.map(function (s) { return '<div><dt>' + esc(t(s.label)) + '</dt><dd>' + swCount(s.num) + esc(t(s.unit)) + '</dd></div>'; }).join('') + '</dl>' +
        (quip ? '<p class="sw-c__say">“' + esc(t(quip)) + '”</p>' : '') + '<p class="sw-c__body sw-c__mu sw-c__go">' + T('▼ 내리면 2016년부터 길을 따라갑니다.', 'Scroll to follow the road from 2016.') + '</p>';
    } else if (n.k === 'flag') {
      var cs = wCourse();
      h += '<p class="ps sw-c__big">NEXT</p><p class="sw-c__t">PD</p><p class="sw-c__body">' + esc(t(WGOAL)) + '</p>' +
        (cs ? '<p class="sw-c__body">' + T('가는 길: ', 'On the way: ') + esc(t(cs.c.role)) + ' · ' + (L === 'en' ? 'month ' + cs.el + ' of ' + cs.tot : cs.tot + '개월 중 ' + cs.el + '개월째') + '</p><span class="sw-c__bar"><i style="--p:' + (cs.el / cs.tot * 100).toFixed(1) + '%"></i></span>' : '') +
        '<p class="sw-c__body sw-c__mu">' + T('흰 길은 아직 다 가지 않은 길입니다.', 'The white road is the part not fully travelled yet.') + '</p>';
    } else {
      var now = wNow(n);
      h += (now ? '<p class="sw-c__now">▶ ' + T('지금 진행 중인 코스', 'Course in progress') + '</p>' : '<p class="ps sw-c__big">COURSE CLEAR!</p>') + '<p class="sw-c__t">' + esc(wTitle(n)) + '</p><dl class="sw-c__rows">' +
        '<div><dt class="ps">TIME</dt><dd>' + esc(wPeriod(n)) + '</dd></div>' +
        (p && p.headcount ? '<div><dt class="ps">TEAM</dt><dd>' + esc(t(p.headcount)) + (p.myRole ? ' · ' + esc(t(p.myRole)) : '') + '</dd></div>' : c && c.org ? '<div><dt class="ps">WITH</dt><dd>' + esc(t(c.org)) + '</dd></div>' : '') +
        (n.big ? '<div><dt class="ps">SCORE</dt><dd>' + swCount(n.big[0]) + ' ' + esc(t(n.big[1])) + '</dd></div>' : '') +
        (p && p.quest && p.quest.goal ? '<div><dt class="ps">BONUS</dt><dd>' + esc(t(p.quest.goal)) + ' → <b>' + esc(t(p.quest.result)) + '</b></dd></div>' : '') + '</dl>' +
        (p && p.learned && p.learned.length ? '<ul class="sw-c__learn">' + p.learned.slice(0, 2).map(function (x) { return '<li>' + esc(t(x)) + '</li>'; }).join('') + '</ul>' : c && c.tags ? '<p class="sw-c__tags">' + c.tags.map(function (x) { return '<span>' + esc(t(x)) + '</span>'; }).join('') + '</p>' : '');
    }
    return h;
  }
  function swShow(root, i, quiet) {
    var n = WN[i], c = n.c && n.c(), p = n.p && n.p();
    root.querySelector('[data-sw-name]').textContent = n.k === 'start' ? NAME + ' · ' + T('게임 기획자', 'Game designer') : (n.code.indexOf('-') > 0 ? n.code + ' ' : '') + t(n.short);
    root.querySelector('[data-sw-yr]').textContent = n.k === 'start' ? '2016' : n.k === 'flag' ? 'NEXT' : wYear(n);
    var msg = swMsg(i);
    root.querySelector('[data-sw-msg]').innerHTML = swTw(msg);
    var h = swClear(i);
    h += '<div class="sw-c__prog"><p><b class="ps">COURSE</b><span class="ps">' + (i + 1) + ' / ' + WN.length + '</span></p><div class="sw-c__pips">' + WN.map(function (m, j) {
      return '<i class="sw-pip sw-pip--' + m.k + (j < i ? ' done' : j === i ? ' cur' : '') + '" title="' + esc(t(m.short)) + '"></i>';
    }).join('') + '</div></div>';
    root.querySelector('[data-sw-clear]').innerHTML = h;
    var hitN = root.querySelector('.sw-n[data-go="' + i + '"]');
    if (hitN && !quiet && !RM) { hitN.classList.remove('is-hit'); void hitN.offsetWidth; hitN.classList.add('is-hit'); }
    pop(root.querySelector('[data-sw-msg]'), quiet); pop(root.querySelector('[data-sw-clear]'), quiet);
    swTick(root, i, quiet ? 1 : 0);
  }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function countUp(s, f) {            /* '200K' → 0K … 200K · 숫자로 시작하지 않으면(3–5K · STEAM) 반쯤에 그대로 */
    var m = /^(\d+)(?![\d–-])(.*)$/.exec(s); if (!m) return f < .5 ? '' : s;
    return Math.round(+m[1] * f) + m[2];
  }
  function swTick(root, i, t) {
    var last = SWORD.length - 1, w = i < last ? clamp01((t - .7) / .3) : 0;
    [].forEach.call(root.querySelectorAll('[data-sw-seg]'), function (g) {
      var j = +g.getAttribute('data-sw-seg'), f = j < i ? 1 : j === i ? w : 0;
      g.style.visibility = f > 0 ? '' : 'hidden';
      [].forEach.call(g.children, function (pth) { pth.style.strokeDashoffset = (1 - f).toFixed(4); });
    });
    var at = w > 0 ? swAlong(i, w) : swPx(SWORD[i]).concat([0]), bob = w > 0 && w < 1 && Math.floor(at[2] / 12) % 2 ? 4 : 0;
    var me = root.querySelector('.sw-me'), x = Math.round((at[0] - 24) / 4) * 4, y = Math.round((at[1] - 70 - bob) / 4) * 4;
    me.style.left = x + 'px'; me.style.top = y + 'px';
    wCam(root.querySelector('.sw__view'), root.querySelector('.sw__map'), at[0], at[1] - 24, true);
    var tw = clamp01(t / .3);
    [].forEach.call(root.querySelectorAll('[data-sw-tw]'), function (el) { var a = Array.from(el.getAttribute('data-sw-tw')); el.textContent = a.slice(0, Math.round(a.length * tw)).join(''); });
    var cu = clamp01((t - .06) / .3);
    [].forEach.call(root.querySelectorAll('[data-sw-count]'), function (el) { el.textContent = countUp(el.getAttribute('data-sw-count'), cu); });
  }
  function wireE3() {
    var r = document.querySelector('[data-sw]'); if (!r) return;
    var pg = wirePager(r, WN.length, function (i, q) { swShow(r, i, q); });
    scrubWire('e3', { root: r, n: WN.length, go: pg.go, tick: function (i, t) { swTick(r, i, t); }, levels: ['is-tight'], step: .6 });
  }

  /* ════ 목록판 — "테마는 어느 정도 유지하되 그냥 아래로 쭉 나열" → "코스 클리어 이런 건 없애고 좀 더 짧게" ════
     한 칸씩 넘기지 않고 아홉 칸을 위에서 아래로 다 펼침(읽기는 보통 페이지처럼). 테마는 그대로 두고 스크롤이 놀이를 맡음.
     시기 하나 = 짧은 덩어리 하나(lItem — 이름 · 기간 / 한 줄 / 사실 몇 개). 게임 결산 글(COURSE CLEAR! 등)은 넘기는 판에만 남김.
     다: 붙어 있는 점수판 + 월드마다 글 | 그 코스 장면(나란히), 장면이 화면에 들어온 만큼 고스트가 해내고(mbAct) 점수판이 지금 읽는 월드까지 오름.
     나: 코스 아홉(메시지 블록 한 장씩)이 왼쪽 모래 길을 따라 이어지고, 고스트가 스크롤만큼 길을 내려가며 길을 그리고 지나간 점을 켬("맨 위 맵은 없어도 될 듯" — 섬 지도는 뺌) */
  var LTICKS = [];
  /* 목록판 한 칸의 글 — 넘기는 판(mbMid · swClear)의 게임 결산(COURSE CLEAR! · READY! · NEXT · 잠긴 '? ? ?' · QUEST/CLEAR 칩)은 빼고
     시기 하나 = 짧은 덩어리 하나: 이름 · 기간 / 한 줄 / 사실 몇 개(인원 · 큰 숫자 · 퀘스트 결과). 나 · 다 목록판이 함께 씀 — 글을 고칠 때는 여기 한 곳 */
  var LQUEST = { lod: 1 };            /* 퀘스트 결과는 큰 숫자와 겹치지 않는 것만(리그 오브 디펜스 — 3일 차 이탈) */
  function lNum(v, unit, lab) {
    return '<span><b class="ps" data-l-count="' + esc(v) + '">' + esc(v) + '</b>' + (unit ? '<small>' + esc(unit) + '</small>' : '') + ' ' + esc(lab) + '</span>';
  }
  function lCourse(cs, short) {        /* 기획자 과정 몇 달째 + 막대 — 집(배운 곳)에서는 짧게, 깃발(다음 목표)에서는 '가는 길' 로 */
    return '<span>' + (short ? '' : T('가는 길: ', 'On the way: ') + esc(t(cs.c.role)) + ' · ') + (L === 'en' ? 'month ' + cs.el + ' of ' + cs.tot : cs.tot + '개월 중 ' + cs.el + '개월째') +
      '<i class="l-bar" aria-hidden="true"><i style="width:' + (cs.el / cs.tot * 100).toFixed(1) + '%"></i></i></span>';
  }
  function lItem(i) {
    var n = WN[i], c = n.c && n.c(), p = n.p && n.p(), cs = wCourse(), f = [];
    if (n.k === 'start') return { title: esc(NAME), sub: T('게임 기획자', 'Game designer'), when: '2016 – ' + new Date().getFullYear(), line: esc(plain(t(C.hero && C.hero.titleHtml))),
      facts: stats.map(function (s) { var u = t(s.unit), lb = t(s.label); return lNum(s.num, lb.toLowerCase().indexOf(u.toLowerCase()) < 0 ? (/^[a-z]/i.test(u) ? ' ' : '') + u : '', lb); }) };
    if (n.k === 'flag') return { title: 'PD', sub: T('다음 목표', 'Next goal'), when: '', line: esc(t(WGOAL)), facts: cs ? [lCourse(cs)] : [] };
    var team = p && p.headcount ? t(p.headcount) + (p.myRole ? ' · ' + t(p.myRole) : '') : c && c.org ? t(c.org) : '';
    if (team) f.push('<span>' + esc(team) + '</span>');
    if (n.big) f.push(lNum(n.big[0], '', t(n.big[1])));
    if (p && p.quest && p.quest.goal && LQUEST[n.id]) f.push('<span>' + esc(t(p.quest.goal)) + ' <b>' + esc(t(p.quest.result)) + '</b></span>');
    if (n.k === 'house' && cs) f.push(lCourse(cs, 1));
    return { title: esc(wTitle(n)), sub: '', when: esc(wPeriod(n)) + (wNow(n) && !/현재/.test((c && c.date && c.date.ko) || '') ? ' · ' + T('진행 중', 'ongoing') : ''),
      line: esc(c && c.body ? t(c.body) : p && p.learned && p.learned[0] ? t(p.learned[0]) : ''), facts: f };
  }
  function lCount(el, vh) {           /* 숫자는 그 칸이 화면 아래 4분의 1 을 지나는 동안 0 → 값(읽을 자리에서는 다 올라가 있음) */
    var cu = clamp01((vh - el.getBoundingClientRect().top) / (vh * .25));
    [].forEach.call(el.querySelectorAll('[data-l-count]'), function (x) { x.textContent = countUp(x.getAttribute('data-l-count'), cu); });
  }
  function lFacts(it) { return it.facts.length ? '<p class="l-facts">' + it.facts.join('') + '</p>' : ''; }

  function draftL2() {
    function col(label, val, cap) { return '<p class="mb__col"><span>' + label + '</span>' + val + '<small>' + cap + '</small></p>'; }
    var hud = '<div class="mb__hud mbl__hud">' + col('<b class="ps">1P</b> <span class="mb__nm">' + esc(NAME) + '</span>', '<b class="ps" data-mbl-score>000000</b>', T('누적 다운로드', 'downloads')) +
      col('&nbsp;', '<b class="ps"><i class="mb-s s-coin-s in"></i><span data-mbl-coin>×00</span></b>', T('출시작', 'titles shipped')) +
      col('<span class="ps">WORLD</span>', '<b class="ps" data-mbl-world>START</b>', T('시기 하나 = 월드 하나', 'one period = one world')) +
      col('<span class="ps">TIME</span>', '<b class="ps" data-mbl-time>2016</b>', T('그 해', 'the year')) + '</div>';
    var list = MBW.map(function (e, i) {
      var it = lItem(i);
      return '<article class="mbl-w" data-mbl-i="' + i + '"><div class="mbl-w__text"><p class="mbl-w__w"><b class="ps">' + (i ? 'WORLD ' + esc(e.w) : 'START') + '</b><em>' + it.when + '</em></p>' +
        '<h4 class="mb__t">' + it.title + (it.sub ? '<small>' + it.sub + '</small>' : '') + '</h4><p class="mbl-w__line">' + it.line + '</p>' + lFacts(it) + '</div>' +
        '<div class="mb__scene mbl-w__scene" aria-hidden="true">' + mbScene(e) + '</div></article>';
    }).join('');
    return '<section class="mb mbl" data-mbl aria-label="' + T('코스 시작 화면 목록 — 10년 이력', 'Course start screens, listed — ten years') + '">' + hud + '<div class="mbl__list">' + list + '</div></section>';
  }
  function wireL2() {
    var root = document.querySelector('[data-mbl]'); if (!root) return;
    var items = [].slice.call(root.querySelectorAll('[data-mbl-i]')), vw = 0;
    items.forEach(function (el, i) { var n = MBW[i].n; el.querySelector('.mb-pts').textContent = n && n.big ? n.big[0] : !n && i ? 'PD' : ''; });
    function tick() {
      if (!root.offsetParent) return;
      if (innerWidth !== vw) { vw = innerWidth; var tb = document.querySelector('.top'); root.style.setProperty('--mbl-top', (tb && getComputedStyle(tb).position === 'sticky' ? tb.offsetHeight : 0) + 'px'); }
      var vh = innerHeight, cur = 0, curAct = 1;
      items.forEach(function (el, i) {
        var sc = el.querySelector('.mb__scene'), t = clamp01((vh - sc.getBoundingClientRect().top) / (vh * .75)), act = mbAct(root, sc, MBW[i], t);
        lCount(el, vh);
        if (el.getBoundingClientRect().top < vh * .5) { cur = i; curAct = act; }
      });
      var e = MBW[cur], n = e.n, tot = mbTot(cur), f = n ? curAct : 1;
      root.querySelector('[data-mbl-score]').textContent = ('000000' + Math.round(tot.before.dl + (tot.after.dl - tot.before.dl) * f)).slice(-6);
      root.querySelector('[data-mbl-coin]').textContent = '×' + ('0' + (f >= .5 ? tot.after.ti : tot.before.ti)).slice(-2);
      root.querySelector('[data-mbl-world]').textContent = n ? e.w : cur === 0 ? 'START' : '8-1';
      root.querySelector('[data-mbl-time]').textContent = n ? wYear(n) : cur === 0 ? '2016' : '2027';
    }
    LTICKS.push(tick);
  }

  function draftL3(opt) {                /* opt.skipStart — 전체 흐름(플레이어블)에서는 첫 화면이 '나'를 맡아 START 칸을 뺌 */
    if (!document.documentElement.style.getPropertyValue('--sw-map')) draftE3();          /* 점 · 성 · 깃발 그림(--sw-*)은 나′ 것을 그대로 */
    var list = WN.map(function (n, i) {
      if (opt && opt.skipStart && n.k === 'start') return '';
      var node = n.k === 'castle' ? 'wm-castle' : n.k === 'flag' ? 'sw-pip--flag' : 'sw-dot' + (n.k === 'house' ? 'B' : n.k === 'start' ? 'R' : 'Y'), it = lItem(i);
      return '<li class="swl-c swl-c--' + n.k + '" data-swl-i="' + i + '"><span class="swl-c__node" aria-hidden="true"><i class="sw-s ' + node + '"></i></span><div class="swl-c__box">' +
        '<p class="swl-c__head"><span class="swl-c__t">' + it.title + (it.sub ? '<small>' + it.sub + '</small>' : '') + '</span><em>' + it.when + '</em></p>' +
        '<p class="swl-c__line">' + it.line + '</p>' + lFacts(it) + '</div></li>';
    }).join('');
    return '<section class="sw swl" data-swl aria-label="' + T('모래 길을 따라 코스 목록 — 10년 이력', 'Courses along the sand road — ten years') + '">' +
      '<ol class="swl__list"><li class="swl__rail" aria-hidden="true"><i class="swl__road"></i><i class="swl-me"></i>' + (opt && opt.pipe ? '<i class="swl-pipe"></i>' : '') + '</li>' + list + '</ol></section>';
  }
  function wireL3() {
    var root = document.querySelector('[data-swl]'); if (!root) return;
    var rail = root.querySelector('.swl__rail'), road = root.querySelector('.swl__road'), me = root.querySelector('.swl-me'), items = [].slice.call(root.querySelectorAll('[data-swl-i]')), hit = {};
    function tick() {
      if (!root.offsetParent) return;
      /* 길은 레일 기준 — 레일이 위로 늘어나 관을 품으면(전체 흐름) 관 입구 아래(rail.__r0)부터 그림 */
      var vh = innerHeight, rr = rail.getBoundingClientRect(), r0 = rail.__r0 || 0, gy = Math.max(0, Math.min(rr.height - 56, vh * .45 - rr.top)), line = vh * .45 + 28;
      road.style.height = Math.max(0, Math.round((gy + 28 - r0) / 4) * 4) + 'px';
      me.style.transform = Math.floor(gy / 12) % 2 && gy > r0 && gy < rr.height - 56 ? 'translateY(-4px)' : '';
      items.forEach(function (el, i) {
        var node = el.querySelector('.swl-c__node'), reached = el.getBoundingClientRect().top + 34 < line;
        node.classList.toggle('done', reached);
        if (reached && !hit[i]) { hit[i] = 1; if (!RM) { node.classList.remove('is-hit'); void node.offsetWidth; node.classList.add('is-hit'); } } else if (!reached) hit[i] = 0;
        lCount(el, vh);
      });
    }
    LTICKS.push(tick);
  }

  /* ════ 이력 — 슈퍼 마리오 RPG(슈퍼 패미컴) 상태 메뉴 ════
     둥근 창 여러 장(파란 그라데이션 면 · 흰 테 · 검은 바깥선)에 한 사람의 상태를 다 펼침:
     왼쪽 = 나(사진 · 직업 · LV = 해 · EXP = 누적 다운로드 · 다음 레벨까지 = 기획자 과정 몇 달째),
     가운데 위 = 능력치 여섯(모두 4 — 고르게 자란 '육각형'), 오른쪽 위 = 장비(핵심역량 다섯 칸 · 실제 도구 로고),
     가운데 아래 = 기술(자기소개서 강점 셋), 오른쪽 아래 = 기록(출시한 프로젝트 셋 · 퀘스트 → 결과 CLEAR), 맨 아래 = 도움말 창(▶ 커서가 선 항목의 설명).
     누르지 않아도 전부 읽히고, 마우스 · 초점 · ← → 로 커서를 옮기면 도움말이 바뀜 */
  function IMG(p) { return (window.__IMG && window.__IMG[p]) || p; }          /* 아티팩트에서는 그림을 안에 넣어 둠 */
  var TOOLS = { office: ['MS Office'], figma: ['Figma'], obsidian: ['Obsidian'], agent: ['Agent', 'claude'], hermes: ['Hermes'], flow: ['Flow', 'flow', 'png'], github: ['GitHub'], notion: ['Notion'], jira: ['Jira'], sheets: ['Google Sheets'], unity: ['Unity'], godot: ['Godot'], gamemaker: ['GameMaker'], firebase: ['Firebase'], cloudflare: ['Cloudflare'] };
  function toolSrc(k) { var it = TOOLS[k] || [k]; return 'assets/img/tools/' + (it[1] || k) + '.' + (it[2] || 'svg'); }
  var RP_HELP = [];               /* 커서 칸마다 [제목, 설명] */
  function rpItem(cls, inner, help) {
    RP_HELP.push(help);
    return '<button type="button" class="rp-i ' + cls + '" data-rp-i="' + (RP_HELP.length - 1) + '">' + inner + '</button>';
  }
  function draftE4() {
    RP_HELP = [];
    var photo = (C.home && C.home.player && C.home.player.photo) || 'assets/img/profile.jpg', dl = stats[0] ? String(stats[0].num).replace(/K$/i, ',000') : '0', cs = wCourse();
    var who = '<div class="rp-w rp-who"><p class="rp-w__h ps">STATUS</p>' +
      rpItem('rp-me', '<span class="rp-ph"><img src="' + esc(IMG(photo)) + '" alt="" width="120" height="150"></span><span class="rp-me__t"><b>' + esc(NAME) + '</b><small>' + esc(t(CLS)) + '</small></span>',
        [NAME + ' · ' + t(CLS), plain(t(C.hero && C.hero.titleHtml))]) +
      '<dl class="rp-lv"><div><dt class="ps">LV</dt><dd><b class="ps">' + esc(YRS) + '</b><span>' + T('년째 · 2016 → 2026', 'yrs · 2016 → 2026') + '</span></dd></div>' +
      '<div><dt class="ps">EXP</dt><dd><b class="ps">' + esc(dl) + '</b><span>' + T('누적 다운로드', 'downloads') + '</span></dd></div>' +
      '<div><dt class="ps">OUT</dt><dd><b class="ps">' + esc((stats[1] && stats[1].num) || '7') + '</b><span>' + T('종 · 스토어 · 스팀', 'titles · stores · Steam') + '</span></dd></div>' +
      '<div><dt class="ps">CREW</dt><dd><b class="ps">' + esc((stats[2] && stats[2].num) || '60K') + '</b><span>' + T('커뮤니티 회원', 'community members') + '</span></dd></div></dl>' +
      rpItem('rp-next', '<span class="rp-next__h"><b class="ps">NEXT LV</b><span>PD</span></span>' + (cs ? '<span class="rp-bar"><i style="--p:' + (cs.el / cs.tot * 100).toFixed(1) + '%"></i></span><small>' + esc(t(cs.c.role)) + ' · ' + (L === 'en' ? 'month ' + cs.el + ' of ' + cs.tot : cs.tot + '개월 중 ' + cs.el + '개월째') + '</small>' : ''),
        [T('다음 레벨 · PD', 'Next level · PD'), t(WGOAL) + (cs ? ' — ' + t(cs.c.role) + ' ' + t(cs.c.date) : '')]) + '</div>';
    var stat = '<div class="rp-w rp-stat"><p class="rp-w__h"><b class="ps">STATS</b><span>' + T('능력치 · 고르게 4', 'Even at 4') + '</span></p>' + AX.map(function (a, i) {
      var v = sumOf(upTo(GAIN.length - 1))[i], bar = '';
      for (var k = 0; k < MAX; k++) bar += '<i' + (k < v ? ' class="on"' : '') + '></i>';
      return rpItem('rp-st', '<span class="rp-st__n"><b>' + esc(t(a.n)) + '</b><small>' + esc(t(a.ev)) + '</small></span><span class="rp-pips" aria-label="' + v + ' / ' + MAX + '">' + bar + '</span><b class="ps">' + v + '</b>', [t(a.n) + ' ' + v + ' / ' + MAX, t(a.ev)]);
    }).join('') + '</div>';
    var cards = (C.resume && C.resume.skills && C.resume.skills.cards) || [];
    var slot = ['WEAPON', 'ARMOR', 'ITEM', 'ITEM', 'ITEM'];
    var eq = '<div class="rp-w rp-eq"><p class="rp-w__h"><b class="ps">EQUIP</b><span>' + T('장비 · 실제로 쓰는 도구', 'Gear · tools I use') + '</span></p>' + cards.map(function (c, i) {
      return rpItem('rp-eq__i', '<span class="rp-eq__t"><small class="ps">' + slot[i % slot.length] + '</small>' + esc(t(c.title)) + '</span><span class="rp-logos">' + (c.tools || []).map(function (k) { return '<img src="' + esc(IMG(toolSrc(k))) + '" alt="' + esc((TOOLS[k] || [k])[0]) + '" width="24" height="24">'; }).join('') + '</span>', [t(c.title), t(c.body)]);
    }).join('') + '</div>';
    var sum = (C.coverLetter && C.coverLetter.summary) || { items: [] };
    var sp = '<div class="rp-w rp-sp"><p class="rp-w__h"><b class="ps">SPECIAL</b><span>' + T('기술 · 일하는 방식', 'Moves · how I work') + '</span></p>' + sum.items.map(function (s) {
      var tag = String(s.tag || '').split('/'), num = (tag[0] || '').trim(), word = (tag[1] || '').trim();
      return rpItem('rp-sp__i', '<b class="ps">' + esc(num) + '</b><span class="rp-sp__t"><span>' + esc(t(s.title)) + '<small class="ps">' + esc(word) + '</small></span><small>' + esc(t(s.body)) + '</small></span>', [t(s.title), t(s.body)]);
    }).join('') + '</div>';
    var log = '<div class="rp-w rp-log"><p class="rp-w__h"><b class="ps">QUESTS</b><span>' + T('기록 · 출시한 프로젝트', 'Log · shipped projects') + '</span></p>' + ['indie-games', 'league-of-defense', 'comstock'].map(function (id) {
      var p = proj(id), q = p.quest || {};
      return rpItem('rp-log__i', '<span class="rp-log__t"><b>' + esc(t(p.title)) + '</b><small>' + esc(t(p.period)) + ' · ' + esc(t(p.headcount)) + '</small></span><span class="rp-log__q">' + esc(t(q.goal)) + ' → <strong>' + esc(t(q.result)) + '</strong></span>' + (q.cleared ? '<em class="ps">CLEAR</em>' : ''),
        [t(p.title) + ' · ' + t(p.myRole), (p.learned || []).slice(0, 2).map(t).join(' ')]);
    }).join('') + '</div>';
    var tabs = '<div class="rp-tabs" aria-hidden="true">' + ['who', 'stat', 'eq', 'sp', 'log'].map(function (k, i) { return '<span class="ps" data-rp-tab="' + k + '">' + ['STATUS', 'STATS', 'EQUIP', 'SPECIAL', 'QUESTS'][i] + '</span>'; }).join('') + '</div>';
    return '<section class="rp" data-rp aria-label="' + T('상태 메뉴 — 10년 이력', 'Status menu — ten years') + '"><div class="rp__grid">' + tabs + who + stat + eq + sp + log +
      '<div class="rp-w rp-help" aria-live="polite"><p class="rp-help__t" data-rp-ht></p><p class="rp-help__b" data-rp-hb></p></div></div></section>';
  }
  function wireE4() {
    var root = document.querySelector('[data-rp]'); if (!root) return;
    root.tabIndex = 0;
    var items = [].slice.call(root.querySelectorAll('[data-rp-i]')), cur = 0;
    var wins = [].slice.call(root.querySelectorAll('.rp-w:not(.rp-help)'));
    function sel(i, quiet) {
      cur = (i + items.length) % items.length;
      items.forEach(function (b, j) { b.classList.toggle('on', j === cur); b.setAttribute('aria-pressed', String(j === cur)); });
      var h = RP_HELP[+items[cur].getAttribute('data-rp-i')], w = items[cur].closest('.rp-w'), k = (/rp-(who|stat|eq|sp|log)\b/.exec(w.className) || [])[1];
      wins.forEach(function (x) { x.classList.toggle('is-cur', x === w); });
      [].forEach.call(root.querySelectorAll('[data-rp-tab]'), function (x) { x.classList.toggle('on', x.getAttribute('data-rp-tab') === k); });
      root.querySelector('[data-rp-ht]').textContent = h[0]; root.querySelector('[data-rp-hb]').textContent = h[1];
      pop(root.querySelector('.rp-help'), quiet);
    }
    function req(i) { (root.__req || sel)((i + items.length) % items.length); }
    items.forEach(function (b, j) { b.addEventListener('click', function () { req(j); }); });
    root.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return; e.preventDefault(); req(cur + d);
    });
    sel(0, true);
    scrubWire('e4', { root: root, n: items.length, go: sel, levels: ['is-tight', 'is-tight is-tab'], step: .2 });
  }

  /* ════ 전체 흐름 — 플레이어블 ════
     사용자: "홈에서 사진 및 간단한 인적사항 - 나 이력 확정 - 그리고 아랫부분에 게임기와 프로젝트 카드로 이어지는 흐름으로 하자" → "전체 플레이어블 시안 뽑아봐".
     drafts.html?play (아티팩트는 window.__PLAY) 로 열면 시안 모음 대신 홈 한 장을 그대로 그림 — 스크롤만으로 끝까지 놀 수 있음:
     WORLD 1-1 하늘 = 사진 · 간단한 인적사항 · 숫자 넷 → 땅 블록 → 1-2 지하 = 나 이력(모래 길 목록 l3 — START 는 첫 화면이 맡아 뺌) →
     1-3 = 벽돌 휴대기 + 프로젝트 카트리지: 게임기가 화면에 붙은 채 내리는 만큼 카트리지가 하나씩 진열판에서 올라와 게임기 아래로 꽂히고 화면에 개요가 켜짐.
     카트리지 · 화면 속 목록 · 십자 버튼(◀ ▶) · B(꺼내기)는 그 자리까지 스크롤만, A 는 자세히 보기(사이트에서), 고무 버튼은 메일.
     게임기 그림은 사이트의 도트 데이터(fc-level-art-brick.js)를 칸 하나 = 정수 기기 픽셀로, 누르는 자리는 console-controls.json 의 b 를 칸 좌표로 옮긴 PF_KEYS. */
  var PLAY = !!window.__PLAY || /[?&]play(=|&|$)/.test(location.search);
  var SITE = !window.__IMG;                 /* 저장소에서 연 화면 — 사이트 페이지 링크가 살아 있음(아티팩트에서는 뺌) */
  var LIVE = !!window.__SITE;               /* 실제 사이트(index.html) — 시안 모음으로 가는 링크를 달지 않음 */
  var PF_SKIN = 'skin=pixel-fc-level-brick';
  var PF_LEAD = .35;                        /* 첫 카트리지 전에 잠깐 비어 있는 화면(고르기 목록) */
  /* 벽돌 휴대기의 누르는 자리 — tools/fc-pixel/console-controls.json 의 b(그림 좌표)를 칸으로: (v − map) / 6.993 */
  var PF_KEYS = { dpad: [5.26, 27.02, 16, 16], rubber: [5.84, 61.33, 14.9, 7.4], b: [177.71, 27.02, 16, 16], a: [177.71, 52.77, 16, 16],
    lDpad: [6.41, 46.47, 13.7, 3.4], lRubber: [6.41, 71.07, 13.7, 3.4], lB: [179.43, 45.33, 12.6, 3.4], lA: [179.43, 71.07, 12.6, 3.4] };
  var PROJ = (C.projects && C.projects.items) || [], TABS = (C.projects && C.projects.tabs) || {};
  /* 관 — tools/fc-pixel/stage-props.py 의 pipe 와 같은 칸(머리 10칸 + 몸통 한 줄을 세로로 되풀이). 땅 위에 서서 땅 블록을 뚫고 지하 천장 아래로 입구가 열림 */
  var PF_LIPIN = 'GggG' + 'g'.repeat(14) + 'GGgGGGgGGGGG', PF_BODYIN = 'GggG' + 'g'.repeat(12) + 'GGgGGGgGGG';
  var PF_LIP = ['K'.repeat(32)].concat(Array(8).fill('K' + PF_LIPIN + 'K'), ['K'.repeat(32)]), PF_BODY = ['..K' + PF_BODYIN + 'K..'];
  var PF_ABOVE = 64, PF_FADE = 192;           /* 관이 땅 위로 선 높이 · 땅 블록이 지하 검정으로 어두워지는 띠 */
  function pfSeed(s) { var h = 5381; s = String(s || ''); for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function pfGen(h) {                        /* render.js 의 genArt 와 같은 그림(사진 없는 프로젝트 = id 로 늘 같은 무늬) */
    var kind = h % 4, g = '', i, x, y;
    if (kind === 0) for (i = 0; i < 5; i++) g += '<circle cx="50" cy="50" r="' + (13 + i * 13) + '" fill="none" stroke="currentColor" stroke-width="1.1" opacity="' + (0.32 - i * 0.05).toFixed(2) + '"/>';
    else if (kind === 1) { for (i = 0; i < 10; i++) g += '<rect x="' + (-46 + i * 17) + '" y="-40" width="6" height="190" fill="currentColor" opacity="' + (i % 2 ? 0.09 : 0.17) + '"/>'; g = '<g transform="rotate(' + (18 + (h >> 3) % 30) + ' 50 50)">' + g + '</g>'; }
    else if (kind === 2) { for (y = 0; y < 7; y++) for (x = 0; x < 7; x++) g += '<circle cx="' + (8 + x * 14) + '" cy="' + (8 + y * 14) + '" r="' + (1.5 + ((x + y + h) % 3) * 0.8).toFixed(1) + '" fill="currentColor" opacity="0.17"/>'; }
    else for (i = 0; i < 4; i++) g += '<path d="M50 ' + (5 + i * 11) + 'L' + (95 - i * 11) + ' 50L50 ' + (95 - i * 11) + 'L' + (5 + i * 11) + ' 50Z" fill="none" stroke="currentColor" stroke-width="1.1" opacity="' + (0.30 - i * 0.055).toFixed(2) + '"/>';
    return g;
  }
  function pfArt(p, big) {
    var h = pfSeed(p.id);
    return '<span class="pf-art pf-art--' + (h % 3) + '" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">' + pfGen(h) + '</svg><i class="pf-art__gh' + (big ? ' is-big' : '') + '"></i></span>';
  }
  function pfGrade(p) { var g = String(p.grade || 'A').toUpperCase(); return /^(SSR|SR|R|A)$/.test(g) ? g : 'A'; }
  function pfCat(p) { var c = TABS[p.category]; return c ? t(c) : ''; }
  function pfTitleHtml() {                   /* hero.titleHtml 의 강조(span.accent) · 줄바꿈만 살리고 나머지는 글자로 */
    var s = t(C.hero && C.hero.titleHtml).replace(/<span class="accent">([\s\S]*?)<\/span>/g, '\u0001$1\u0002').replace(/\s*<br\s*\/?>\s*/g, '\u0003').replace(/<[^>]+>/g, '');
    return esc(s).replace(/\u0001/g, '<em>').replace(/\u0002/g, '</em>').replace(/\u0003/g, '<br>');
  }
  function pfDetail(p) { return '#/p/' + encodeURIComponent(p.id); }          /* 자세히 보기 = 같은 테마의 하위 페이지(해시 주소라 저장소 · 아티팩트 어디서나 한 장 안에서 넘어감) */
  var PF_PAGES = [['resume', '2'], ['cover', '3'], ['projects', '4'], ['play', '5']];      /* 페이지 = 월드: 홈 1 · 이력서 2 · 자기소개서 3 · 프로젝트 4(자세히 4-n) · 게임플레이 5 */
  function pfNm(k) { return t(C.nav && C.nav[k]); }
  function pfRoute() {
    var h = (location.hash || '').replace(/^#\/?/, ''), m = /^p\/(.+)$/.exec(h);
    if (m) { var id = decodeURIComponent(m[1]); for (var i = 0; i < PROJ.length; i++) if (PROJ[i].id === id) return { pg: 'detail', i: i, key: 'p/' + id }; }
    if (/^(resume|cover|projects|play)$/.test(h)) return { pg: h, key: h };
    return { pg: 'home', key: '' };
  }
  function pfMore(href, label) { return '<p class="pf-more"><a href="' + href + '">' + label + ' →</a></p>'; }

  function pfTop(pg) {
    var nav = PF_PAGES.map(function (n) {
      return '<a href="#/' + n[0] + '"' + (pg === n[0] || (pg === 'detail' && n[0] === 'projects') ? ' aria-current="page"' : '') + '>' + esc(pfNm(n[0])) + '</a>'; }).join('');
    return '<header class="pf-top"><div class="pf-top__in"><a class="pf-logo" href="#/"><i aria-hidden="true"></i><b>' + esc(NAME) + '</b><small>' + esc(t(C.meta && C.meta.role)) + '</small></a>' +
      '<nav class="pf-nav" id="pf-nav"><a href="#/"' + (pg === 'home' ? ' aria-current="page"' : '') + '>' + esc(pfNm('home')) + '</a>' + nav + (SITE && !LIVE ? '<a class="pf-nav__drafts" href="drafts.html#play-part">' + T('시안 모음', 'Drafts') + '</a>' : '') + '</nav><span class="pf-sp"></span><p class="pf-world"><b class="ps" data-pf-world></b><span data-pf-wname></span></p>' +
      '<button type="button" class="pf-tbtn" data-pf-lang>' + (L === 'en' ? 'KR' : 'EN') + '</button>' +
      '<button type="button" class="pf-tbtn pf-mbtn" data-pf-mbtn aria-expanded="false" aria-controls="pf-nav">MENU</button>' + (SITE && !LIVE ? '<a class="pf-tbtn pf-tbtn--drafts" href="drafts.html#play-part">' + T('시안 모음', 'Drafts') + '</a>' : '') + '</div></header>';
  }
  function pfHero() {                          /* WORLD 1-1 = 타이틀 화면: 1000px 한 기둥에 점수판 · 제목 판(벽돌 테 + 크림 판: 큰 사진 | 직무 · 이름 · 한 줄 / 메뉴 · 연락처) — 그 판 왼쪽 아래 땅 위에 관과 1P */
    var m = C.meta || {}, ph = C.home && C.home.player;
    var hud = stats.map(function (s) { return '<p><span>' + esc(t(s.label)) + '</span><b class="ps">' + esc(s.num) + '<small>' + esc(t(s.unit)) + '</small></b></p>'; }).join('');
    /* 사진이 판의 주인공("사진이 너무 작으면 안 돼") · 글은 크림 판 위 남색("가독성 · 시인성") */
    var menu = [['#pf-career', T('이력 보기', 'Career')], ['#pf-proj', T('프로젝트 보기', 'Projects')]];
    if (SITE && m.resumeUrl) menu.push([m.resumeUrl, T('이력서 PDF', 'Résumé PDF'), 1]);
    if (m.email) menu.push(['mailto:' + m.email, T('메일 보내기', 'Send an email')]);
    var contact = [];
    if (m.email) contact.push([T('이메일', 'Email'), '<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a>']);
    if (m.github) contact.push(['GitHub', '<a href="' + esc(m.github) + '" target="_blank" rel="noopener">' + esc(m.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')) + '</a>']);
    return '<section class="pf-hero" id="pf-hero" data-pf-sec="1-1" data-pf-nm="' + T('나', 'Me') + '"><i class="pf-s s-cloud pf-hero__cloud" style="left:calc(50% - 640px);top:20px"></i><i class="pf-s s-cloud pf-hero__cloud" style="right:calc(50% - 640px);top:28px"></i>' +
      '<div class="pf-in"><div class="pf-ts"><div class="pf-hud">' + hud + '</div>' +
      '<div class="pf-plaque"><i class="pf-rv" aria-hidden="true"></i><div class="pf-plaque__in">' +
      (ph && ph.photo ? '<figure class="pf-photo"><img src="' + esc(IMG(ph.photo)) + '" alt="' + esc(t(ph.photoAlt) || NAME) + '"></figure>' : '') +
      '<div class="pf-plaque__txt"><div class="pf-id"><p class="pf-role">' + esc(t(m.role)) + '<span class="ps">PLAYER 1</span></p><h1 class="pf-name">' + esc(NAME) + '</h1><p class="pf-line">' + pfTitleHtml().replace('<br>', ' ') + '</p></div>' +
      '<div class="pf-act"><ul class="pf-menu" data-pf-menu>' + menu.map(function (it, j) {
        var jump = it[0].charAt(0) === '#';
        return '<li' + (j === 0 ? ' class="on"' : '') + '><a href="' + esc(it[0]) + '"' + (jump ? ' data-pf-jump' : it[2] ? ' target="_blank" rel="noopener"' : '') + '>' + it[1] + '</a></li>';
      }).join('') + '</ul>' + (contact.length ? '<dl class="pf-contact">' + contact.map(function (c) { return '<div><dt>' + c[0] + '</dt><dd>' + c[1] + '</dd></div>'; }).join('') + '</dl>' : '') + '</div></div></div></div></div></div>' +
      '<i class="pf-s s-bush" style="left:38%"></i><i class="pf-s s-hill pf-hide-s" style="right:20%"></i><i class="pf-s s-bush" style="right:3%"></i><i class="pf-ground"></i></section>';
  }
  function pfWorld(code, h, p, left) { return '<header class="pf-wc' + (left ? ' pf-wc--l' : '') + '"><p class="ps pf-wc__w">WORLD ' + code + '</p><h2>' + h + '</h2>' + (p ? '<p class="pf-wc__s">' + p + '</p>' : '') + '</header>'; }
  function pfCareer() {
    return '<section class="pf-ug pf-career" id="pf-career" data-pf-sec="1-2" data-pf-nm="' + T('이력', 'Career') + '"><i class="pf-fade" aria-hidden="true"></i><div class="pf-in">' +
      pfWorld('1-2', T('이력', 'Career'), T('2016 → 지금 · 관을 나온 고스트가 모래 길을 따라 내려갑니다', '2016 → now · out of the pipe, the ghost follows the sand road down')) + draftL3({ skipStart: true, pipe: true }) +
      '<div class="pf-col">' + pfMore('#/resume', T('이력서 전체 보기', 'See the full résumé')) + '</div></div></section>';
  }
  /* 1-3 보유 기술 — 이력과 프로젝트 사이(사용자: "보유기술 이력과 프로젝트 카드 사이에 추가하자"). 인벤토리 창 한 장: 분류마다 물음표 블록 · 이름 ×도구 수 · 한 줄 · 실제 로고(판은 흰색) */
  function pfIts(tl) {                          /* 로고 줄 — 흰 판에 실제 로고, 판 아래 도구 이름 */
    return '<ul class="pf-its">' + tl.map(function (k, j) {
      return '<li class="pf-it" style="--k:' + j + '"><span class="pf-it__box"><img src="' + esc(IMG(toolSrc(k))) + '" alt="" width="34" height="34"></span><span class="pf-it__n">' + esc((TOOLS[k] || [k])[0]) + '</span></li>';
    }).join('') + '</ul>';
  }
  function pfSkills() {                         /* 아이템 창 — 한 분류 = 한 칸(이름 · 어떻게 썼는지 resume.skills.cards[].body · 로고 줄). 홈 · 이력서 같은 창
                                                   (사용자: "저걸 어떻게 써봤는지는 나와야 해" · "레이아웃이 개판" — 표 대신 같은 높이 칸막이, 위 줄 셋 · 남는 칸은 넓게) */
    var cards = (C.resume && C.resume.skills && C.resume.skills.cards) || [], n = 0, N = cards.length, cols = N % 3 && N % 2 === 0 ? 2 : 3, rem = cols === 3 ? N % 3 : 0;   /* 넷 · 둘이면 두 칸씩, 아니면 세 칸씩(남는 칸은 넓게) */
    cards.forEach(function (c) { n += (c.tools || []).length; });
    return '<div class="pf-win"><p class="pf-win__h"><b class="ps">ITEMS</b><span>' + T('분류 ' + N + ' · 도구 ' + n + '개', N + ' kinds · ' + n + ' tools') + '</span></p><div class="pf-sk">' + cards.map(function (c, i) {
      var w = cols === 2 ? ' is-w3' : rem && i >= N - rem ? (rem === 2 ? ' is-w3' : ' is-w6') : '';
      return '<section class="pf-sk__c' + w + '" data-pf-rv><h3>' + esc(t(c.title)) + '</h3><p>' + esc(t(c.body)) + '</p>' + pfIts(c.tools || []) + '</section>';
    }).join('') + '</div></div>';
  }
  function pfSkillSec() {
    var sk = (C.resume && C.resume.skills) || {};
    return '<section class="pf-ug pf-skill" id="pf-skill" data-pf-sec="1-3" data-pf-nm="' + T('보유 기술', 'Skills') + '"><div class="pf-in">' + pfWorld('1-3', T('보유 기술', 'Skills'), esc(t(sk.lead)), 1) +
      '<div class="pf-col">' + pfSkills() + '</div></div></section>';
  }
  function pfCart(p, i) {                     /* 진열판 칸(.pf-slot) 위의 카트리지 — 꽂으러 떠나면 빈 칸이 남음 */
    return '<span class="pf-slot">' + '<button type="button" class="pf-cart" data-pf-go="' + i + '" data-grade="' + pfGrade(p) + '" aria-label="' + esc(t(p.title)) + '"><span class="pf-cart__lab"><b>' + esc(t(p.title)) + '</b>' +
      '<span class="pf-cart__meta"><i>' + esc(pfCat(p)) + '</i><em class="ps">' + pfGrade(p) + '</em></span>' + pfArt(p) + '</span></button></span>';
  }
  function pfKey(cls, attr, label, k) { return '<' + (attr.indexOf('href') === 0 ? 'a ' + attr : 'button type="button" ' + attr) + ' class="pf-key ' + cls + '" data-pf-k="' + k + '" aria-label="' + label + '"></' + (attr.indexOf('href') === 0 ? 'a' : 'button') + '>'; }
  function pfProj() {
    var m = C.meta || {};
    var keys = pfKey('pf-key--l', 'data-pf-step="-1"', T('이전 카트리지', 'Previous cartridge'), 'dpadL') + pfKey('pf-key--r', 'data-pf-step="1"', T('다음 카트리지', 'Next cartridge'), 'dpadR') +
      pfKey('pf-key--b', 'data-pf-b', T('B 꺼내기', 'B eject'), 'b') + pfKey('pf-key--a', 'data-pf-a', T('A 자세히 보기', 'A read more'), 'a') +
      (m.email ? pfKey('pf-key--m', 'href="mailto:' + esc(m.email) + '"', T('메일', 'Mail'), 'rubber') : '');
    var lbls = [['lDpad', T('◀ ▶ 고르기', '◀ ▶ SELECT')], ['lRubber', T('메일', 'MAIL')], ['lB', T('B 꺼내기', 'B EJECT')], ['lA', T('A 자세히', 'A OPEN')]].map(function (l) { return '<span class="pf-lbl" data-pf-k="' + l[0] + '">' + l[1] + '</span>'; }).join('');
    return '<section class="pf-ug pf-proj" id="pf-proj" data-pf-sec="1-4" data-pf-nm="' + T('프로젝트', 'Projects') + '"><div class="pf-in">' +
      pfWorld('1-4', T('프로젝트', 'Projects'), T('카트리지 ' + PROJ.length + '개 · 내리면 하나씩 꽂혀 화면이 켜집니다', PROJ.length + ' cartridges · scroll and they go in one by one')) + '</div>' +
      '<div class="pf-run" data-pf-run><div class="pf-stick"><div class="pf-dev"><canvas class="pf-art-cv" role="img" aria-label="' + T('벽돌 휴대기', 'Brick handheld') + '"></canvas>' +
      '<div class="pf-scr" data-pf-scr aria-live="polite"></div>' + keys + lbls + '</div><i class="pf-gap" aria-hidden="true"></i>' +
      '<div class="pf-dock" data-pf-dock></div><div class="pf-tray">' + PROJ.map(pfCart).join('') + '</div></div></div>' +
      '<div class="pf-in"><div class="pf-col">' + pfMore('#/projects', T('프로젝트 전체 보기', 'All projects')) + '</div></div></section>';
  }
  function pfFoot() {
    var m = C.meta || {};
    var pages = '<p class="pf-foot__pages"><a href="#/">' + esc(pfNm('home')) + '</a>' + PF_PAGES.map(function (n) { return '<a href="#/' + n[0] + '">' + esc(pfNm(n[0])) + '</a>'; }).join('') + '</p>';
    return '<footer class="pf-foot"><div class="pf-in"><p class="pf-foot__me"><b>' + esc(NAME) + '</b> · ' + esc(t(m.role)) + '</p><p>' + (m.email ? '<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a>' : '') +
      (m.github ? ' · <a href="' + esc(m.github) + '" target="_blank" rel="noopener">GitHub</a>' : '') + '</p>' + pages + '</div><i class="pf-uground" aria-hidden="true"></i></footer>';
  }

  /* 게임기 화면 — 고르기 목록(아무것도 안 꽂힘 · 꽂는 중) / 읽는 중 / 개요 */
  function pfSel(cur, busy) {
    return '<div class="pf-sel"><p class="pf-sel__h"><b class="ps">1P</b>' + T('카트리지 고르기', 'Select a cartridge') + '</p><ol>' + PROJ.map(function (p, j) {
      return '<li' + (j === cur ? ' class="on"' : '') + '><button type="button" data-pf-go="' + j + '">' + esc(t(p.title)) + '</button>' + (j === cur && busy ? '<em>' + T('꽂는 중', 'inserting') + '</em>' : '') + '</li>';
    }).join('') + '</ol><p class="pf-sel__f">' + T('▼ 내리면 하나씩 꽂힙니다', '▼ Scroll and they go in one by one') + '</p></div>';
  }
  function pfBoot() { return '<div class="pf-boot"><p>' + T('읽는 중', 'Loading') + '<span class="pf-dots"></span></p></div>'; }
  function pfOv(i, notes) {
    var p = PROJ[i], q = p.quest;
    var rows = [[T('기간', 'Period'), p.period], [T('인원', 'Team'), p.headcount], [T('역할', 'Role'), p.myRole], [T('상태', 'Status'), p.status]].filter(function (r) { return r[1] && t(r[1]); });
    var tail = notes && p.learned && p.learned.length ? '<ul class="pf-ov__learn">' + p.learned.slice(0, 3).map(function (x) { return '<li>' + esc(t(x)) + '</li>'; }).join('') + '</ul>' :
      '<dl>' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(t(r[1])) + '</dd></div>'; }).join('') + '</dl>' +
      (q && q.goal ? '<p class="pf-ov__q"><b>' + T('퀘스트', 'Quest') + '</b>' + esc(t(q.goal)) + ' → <strong>' + esc(t(q.result)) + '</strong></p>' : '');
    return '<div class="pf-ov" data-grade="' + pfGrade(p) + '">' + pfArt(p, 1) + '<div class="pf-ov__txt"><p class="pf-ov__meta"><i>' + esc(pfCat(p)) + '</i><span>' + esc(t(p.tag)) + '</span><em class="ps">' + pfGrade(p) + '</em></p>' +
      '<h3>' + esc(t(p.title)) + '</h3><p class="pf-ov__sub">' + esc(t(p.sub)) + '</p>' + tail +
      '<p class="pf-ov__go"><span class="ps">A</span><a href="' + esc(pfDetail(p)) + '">' + T('자세히 보기', 'Read more') + ' →</a></p></div></div>';
  }

  var PF = null;                              /* 지금 그린 화면의 상태(재는 값 · 고른 칸) */
  function pfDraw(cv, d, sd) {
    cv.width = d.w * sd; cv.height = d.h * sd;
    var g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
    d.rows.forEach(function (row, y) {
      var x = 0, re = /([.,A-Za-z])(\d*)/g, m;
      while ((m = re.exec(row))) {
        var n = m[2] ? +m[2] : 1, c = m[1];
        if (c !== '.') { g.fillStyle = c === ',' ? 'rgba(0,0,0,.45)' : d.pal[c <= 'Z' ? c.charCodeAt(0) - 65 : c.charCodeAt(0) - 71]; g.fillRect(x * sd, y * sd, n * sd, sd); }
        x += n;
      }
    });
  }
  function pfLayout() {
    pfDive();
    var root = document.querySelector('[data-pf]'), d = (window.__ART || {}).brick; if (!root || !d || !root.querySelector('.pf-stick')) return;
    var top = root.querySelector('.pf-top').offsetHeight, st = root.querySelector('.pf-stick'), dev = root.querySelector('.pf-dev'), cv = root.querySelector('.pf-art-cv');
    var H = innerHeight - top, W = st.clientWidth, mob = W < 760, dpr = window.devicePixelRatio || 1;
    var ch = mob ? 84 : Math.round(Math.max(128, Math.min(176, H * .21)) / 4) * 4, cw = Math.round(ch * (mob ? .8 : .76) / 4) * 4;
    if (mob) { var fitW = Math.floor((W - 16 - (PROJ.length - 1) * 8) / PROJ.length / 4) * 4; if (fitW < cw) { cw = fitW; ch = Math.round(cw / .8 / 4) * 4; } }   /* 좁은 휴대폰(360px)에서도 진열판이 한 줄에 */
    var gap = Math.round(ch * .42 / 4) * 4 + (mob ? 12 : 24);
    var dockH = mob ? 220 : 0, availW = Math.min(W - (mob ? 16 : 64), 1120), availH = H - ch - gap - dockH - (mob ? 32 : 56);
    var sd = Math.max(1, Math.floor(Math.min(availW / d.w, availH / d.h) * dpr)), cell = sd / dpr;
    pfDraw(cv, d, sd); cv.style.width = d.w * cell + 'px'; cv.style.height = d.h * cell + 'px';
    dev.style.width = d.w * cell + 'px'; dev.style.height = d.h * cell + 'px';
    function at(el, c) { el.style.left = (c[0] - d.x) * cell + 'px'; el.style.top = (c[1] - d.y) * cell + 'px'; el.style.width = c[2] * cell + 'px'; el.style.height = c[3] * cell + 'px'; }
    at(root.querySelector('.pf-scr'), d.screen);
    [].forEach.call(root.querySelectorAll('[data-pf-k]'), function (el) {
      var k = el.getAttribute('data-pf-k'), c = PF_KEYS[k === 'dpadL' || k === 'dpadR' ? 'dpad' : k];
      if (k === 'dpadL') c = [c[0], c[1], c[2] / 2, c[3]]; else if (k === 'dpadR') c = [c[0] + c[2] / 2, c[1], c[2] / 2, c[3]];
      if (c) at(el, c);
    });
    st.style.top = top + 'px'; st.style.height = H + 'px';
    if (mob) root.querySelector('[data-pf-dock]').style.height = Math.round(Math.max(220, Math.min(296, H - ch - gap - d.h * cell - 48)) / 4) * 4 + 'px';
    root.style.setProperty('--pf-cw', cw + 'px'); root.style.setProperty('--pf-ch', ch + 'px'); root.style.setProperty('--pf-gapH', gap + 'px'); root.style.setProperty('--pf-top', top + 'px');
    root.classList.toggle('is-mob', mob); root.classList.toggle('is-s3', !mob && cell < 4); root.classList.toggle('is-nolbl', cell < 4);          /* 인쇄 글자는 게임기가 칸 4px 이상일 때만(작으면 화면 테로 넘침) */
    var run = root.querySelector('[data-pf-run]'); run.style.height = Math.round(H * (1 + (PROJ.length + PF_LEAD) * .75)) + 'px';
    /* 카트리지 자리(진열판에 놓인 자리) · 꽂는 자리(게임기 몸 아래 가운데) — 판(.pf-stick) 기준 좌표 */
    var cards = [].slice.call(root.querySelectorAll('.pf-cart'));
    root.classList.add('pf-measure'); cards.forEach(function (c) { c.style.transform = ''; }); void root.offsetWidth;   /* 되돌아가는 중인 카트리지도 제자리에서 잼 */
    var sr = st.getBoundingClientRect(), dr = dev.getBoundingClientRect(), bodyB = dr.top - sr.top + (100 - d.y) * cell;
    PF = { root: root, st: st, cards: cards, base: cards.map(function (c) { var r = c.getBoundingClientRect(); return [r.left - sr.left, r.top - sr.top]; }),
      slotX: dr.left - sr.left + (100 - d.x) * cell - cw / 2, preY: bodyB + 4, insY: bodyB - Math.round(ch * .6 / 4) * 4, key: '', i: -2, notes: false, mob: mob };
    root.classList.remove('pf-measure');
    /* 관: 첫 화면 땅 위(머리) → 땅 블록 · 어두워지는 띠를 뚫고 → 지하 띠 끝에서 입구. 이력 레일을 그 머리 위(고스트 서는 자리)까지 위로 늘려 고스트 · 길 · 관을 한 줄에 */
    var hero = root.querySelector('.pf-hero'), rail = root.querySelector('.swl__rail'), list = root.querySelector('.swl__list');
    if (hero && rail && list) {
      var heroB = hero.getBoundingClientRect().bottom + scrollY, lipTop = heroB - 128 - PF_ABOVE, mouthB = heroB + PF_FADE - 16;
      var listTop = list.getBoundingClientRect().top + scrollY, pipeH = Math.round((mouthB - lipTop) / 4) * 4;
      rail.style.top = Math.round(lipTop - 56 - listTop) + 'px';
      rail.querySelector('.swl-pipe').style.height = pipeH + 'px';
      rail.__r0 = 56 + pipeH; rail.style.setProperty('--r0', rail.__r0 + 'px');
    }
    pfTick(true);
  }
  function pfProg() {                          /* 카트리지 칸 번호 i(-1 = 아직) · 칸 안 진행 t */
    var run = PF.root.querySelector('[data-pf-run]'), r = run.getBoundingClientRect(), sh = PF.st.offsetHeight, top = parseFloat(PF.st.style.top) || 0;
    var n = PROJ.length, u = (top - r.top) / Math.max(1, r.height - sh) * (n + PF_LEAD) - PF_LEAD;
    if (u < 0) return [-1, 0];
    var i = Math.min(n - 1, Math.floor(u)); return [i, Math.min(1, u - i)];
  }
  function pfGo(i, tt) {                        /* 누르기는 그 자리까지 스크롤만 — 칸은 늘 스크롤이 바꿈 */
    var run = PF.root.querySelector('[data-pf-run]'), sh = PF.st.offsetHeight, top = parseFloat(PF.st.style.top) || 0, n = PROJ.length;
    i = Math.max(0, Math.min(n - 1, i));
    var y = run.getBoundingClientRect().top + scrollY - top + (i + tt + PF_LEAD) / (n + PF_LEAD) * (run.offsetHeight - sh);
    window.scrollTo({ top: Math.round(y), behavior: RM ? 'auto' : 'smooth' });
  }
  function pfScreen(key, html, dock) {
    if (PF.key === key) return;
    var first = PF.key === '';
    PF.key = key;
    var scr = PF.root.querySelector('[data-pf-scr]'); scr.innerHTML = html; if (!first) pop(scr);
    var dk = PF.root.querySelector('[data-pf-dock]'); dk.innerHTML = dock; if (!first && dock) pop(dk);
  }
  function pfTick(force) {
    if (!PF || !PF.root.offsetParent) return;
    var pr = pfProg(), i = pr[0], tt = pr[1], q = function (v) { return Math.round(v / 4) * 4; };
    if (i !== PF.i) { PF.notes = false; PF.i = i; }
    PF.cards.forEach(function (c, j) {
      var live = j === i && tt > 0;
      c.classList.toggle('is-live', live); c.classList.toggle('is-in', live && tt >= .6);
      c.setAttribute('aria-pressed', String(j === i && tt >= .6));
      if (!live) { c.style.transform = ''; return; }
      var b = PF.base[j], x, y;
      if (tt < .12) { x = b[0]; y = b[1] - 12 * tt / .12; }
      else if (tt < .45) { var f = (tt - .12) / .33, e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2; x = b[0] + (PF.slotX - b[0]) * e; y = b[1] - 12 + (PF.preY - b[1] + 12) * e - Math.sin(Math.PI * f) * 24; }
      else if (tt < .6) { x = PF.slotX; y = PF.preY + (PF.insY - PF.preY) * (tt - .45) / .15; }
      else { x = PF.slotX; y = PF.insY; }
      c.style.transform = 'translate(' + q(x - b[0]) + 'px,' + q(y - b[1]) + 'px)';
    });
    var hint = '<p class="pf-dock__hint">' + T('▼ 내리면 카트리지가 하나씩 꽂힙니다', '▼ Scroll and the cartridges go in one by one') + '</p>';
    if (i < 0) pfScreen('sel:0', pfSel(0, false), hint);
    else if (tt < .6) pfScreen('sel:' + i + ':' + (tt >= .12), pfSel(i, tt >= .12), hint);
    else if (tt < .68) pfScreen('boot:' + i, pfBoot(), PF.mob ? pfBoot() : '');
    else pfScreen('ov:' + i + ':' + PF.notes, pfOv(i, PF.notes), PF.mob ? pfOv(i, PF.notes) : '');
  }
  function pfWorldTick() {                      /* 위 띠의 WORLD — 지금 머리 아래에 걸린 칸(data-pf-sec · data-pf-nm) */
    var root = document.querySelector('[data-pf]'); if (!root) return;
    var top = root.querySelector('.pf-top').offsetHeight, cur = null;
    [].forEach.call(root.querySelectorAll('[data-pf-sec]'), function (s) { if (!cur || s.getBoundingClientRect().top <= top + 8) cur = s; });
    if (!cur || root.__w === cur) return;
    root.__w = cur;
    root.querySelector('[data-pf-world]').textContent = 'WORLD ' + cur.getAttribute('data-pf-sec');
    root.querySelector('[data-pf-wname]').textContent = cur.getAttribute('data-pf-nm') || '';
  }
  function pfRvTick() {                         /* 화면에 들어온 창 · 줄 · 카트리지는 한 번 올라옴(인벤토리 줄은 블록이 튀고 도구가 나옴) · 숫자는 0 → 값 */
    var vh = innerHeight;
    [].forEach.call(document.querySelectorAll('.pf [data-pf-rv]:not(.is-in)'), function (el) { if (el.getBoundingClientRect().top < vh * (el.classList.contains('pf-sk__c') ? .85 : .92)) el.classList.add('is-in'); });
    [].forEach.call(document.querySelectorAll('.pf [data-pf-count]'), function (el) { lCount(el, vh); });
  }
  /* ════ 하위 페이지 — 같은 테마 ════
     사용자: "다른 페이지들도 비슷한 테마로 맞춰야할듯 자세하게 보러가는 페이지들".
     한 페이지 = 한 월드(홈 1 · 이력서 2 · 자기소개서 3 · 프로젝트 4 · 자세히 4-n · 게임플레이 5): 하늘 머리(홈 제목 판과 같은 벽돌 테 + 크림 판) → 땅 블록 → 어두워지는 띠 →
     지하의 창(검은 메시지 블록 — 이력 목록과 같은 재료) · 긴 글은 크림 종이(밝은 판 위 어두운 글자). 페이지 끝은 앞뒤 월드로 가는 단추.
     주소는 해시(#/resume · #/cover · #/projects · #/p/<id> · #/play) — 위 띠 · 바닥 · 홈의 '전체 보기' · 게임기 A 가 여기로 옴. 가려 둔 인적사항 값은 넣지 않음 */
  function pfHead(o) {
    return '<section class="pf-ph" data-pf-sec="' + o.w + '" data-pf-nm="' + o.nm + '"><i class="pf-s s-cloud pf-hero__cloud" style="left:calc(50% - 640px);top:16px"></i><i class="pf-s s-cloud pf-hero__cloud" style="right:calc(50% - 640px);top:28px"></i>' +
      '<div class="pf-in"><div class="pf-ts">' + (o.back ? '<a class="pf-back" href="' + o.back[0] + '"><span aria-hidden="true">◀</span>' + o.back[1] + '</a>' : '') +
      '<div class="pf-plaque"><i class="pf-rv" aria-hidden="true"></i><div class="pf-plaque__in' + (o.side ? '' : ' pf-plaque__in--solo') + '">' + (o.side || '') +
      '<div class="pf-ph__txt"><p class="pf-role">' + o.eyebrow + '<span class="ps">WORLD ' + o.w + '</span></p><h1 class="pf-ph__t">' + o.title + '</h1>' +
      (o.line ? '<p class="pf-line">' + o.line + '</p>' : '') + (o.lead ? '<p class="pf-ph__lead">' + o.lead + '</p>' : '') + (o.extra || '') + '</div></div></div></div></div>' +
      '<i class="pf-s s-bush pf-hide-s" style="right:42%"></i><i class="pf-s s-hill pf-hide-s" style="right:16%"></i><i class="pf-s s-bush" style="right:3%"></i><i class="pf-ground"></i></section>';
  }
  function pfUnder(html) {                       /* 지하 — 머리 땅 위에 선 관(1P 가 그 머리 위)에서 내려가는 길 .pf-dive 를 함께 둠(자리는 pfDive) */
    return '<div class="pf-ug pf-sub"><i class="pf-fade" aria-hidden="true"></i><i class="pf-dive" aria-hidden="true"><i class="swl-pipe"></i><i class="pf-dive__road"></i><i class="swl-me pf-dive__me"></i></i><div class="pf-in">' + html + '</div></div>';
  }
  /* 하위 페이지의 관 — 홈 첫 화면과 같은 문법: 머리 판 왼쪽 아래 땅 위에 관 머리 · 그 위에 1P. 내리면 1P 가 관 속으로 들어가
     땅 블록 · 어두워지는 띠를 지나 지하 입구로 나와 모래 길을 따라 첫 절 머리 옆까지 내려감. 관 가운데 = 1000px 기둥 왼쪽 + 64px(홈과 같은 x) */
  var PFD = null;
  function pfDive() {
    var dv = document.querySelector('.pf-dive'), ph = document.querySelector('.pf-ph'), ts = ph && ph.querySelector('.pf-ts'); PFD = null;
    if (!dv || !ts) return;
    var ug = dv.parentNode, ugr = ug.getBoundingClientRect(), x = Math.round(ts.getBoundingClientRect().left - ugr.left);
    var ground = ph.getBoundingClientRect().bottom - ugr.top - 128;                   /* 지하 기준 땅 윗면(음수) */
    var lip = ground - PF_ABOVE, mouth = PF_FADE - 16, top = lip - 56, h = Math.round((mouth + 72 - top) / 4) * 4;
    dv.style.left = x + 'px'; dv.style.top = Math.round(top) + 'px'; dv.style.height = h + 'px';
    dv.querySelector('.swl-pipe').style.height = Math.round((mouth - lip) / 4) * 4 + 'px';
    PFD = { dv: dv, me: dv.querySelector('.pf-dive__me'), road: dv.querySelector('.pf-dive__road'), r0: 56 + Math.round((mouth - lip) / 4) * 4, h: h, y0: Math.round(top) + ugr.top + scrollY };
    pfDiveTick();
  }
  function pfDiveTick() {                        /* 1P 는 처음 선 자리(화면 45% 보다 위면 그 자리)에 붙은 채, 관 · 길이 그 밑으로 지나감 */
    if (!PFD || !PFD.dv.isConnected) return;
    var line = Math.min(innerHeight * .45, PFD.y0), gy = Math.max(0, Math.min(PFD.h - 56, scrollY + line - PFD.y0));
    gy = Math.round(gy / 4) * 4;
    PFD.me.style.top = gy + 'px';                 /* transform 은 모션 최소화 규칙이 지우므로 top 으로 */
    PFD.road.style.top = PFD.r0 + 'px'; PFD.road.style.height = Math.max(0, gy + 28 - PFD.r0) + 'px';
  }
  function pfSec(w, nm, h, p, body, label) {         /* w = 월드 칸(위 띠에 뜸) · label = 칸 번호 대신 쓰는 영어 이름표(자세히 페이지) */
    var head = label ? '<header class="pf-wc pf-wc--l"><p class="ps pf-sec__l">' + label + '</p><h2>' + h + '</h2>' + (p ? '<p class="pf-wc__s">' + p + '</p>' : '') + '</header>' : pfWorld(w, h, p, 1);
    return '<section class="pf-sec"' + (w ? ' data-pf-sec="' + w + '" data-pf-nm="' + nm + '"' : '') + '>' + head + '<div class="pf-col">' + body + '</div></section>';
  }
  function pfPager(a, b) {                            /* [주소, 이름표, 제목] 둘 — 앞 · 뒤 */
    return '<nav class="pf-pager" aria-label="' + T('앞뒤로 가기', 'Previous and next') + '">' + [a, b].map(function (x) {
      return x ? '<a class="pf-win" href="' + x[0] + '"><span class="ps pf-pager__d">' + x[1] + '</span><span class="pf-pager__t">' + x[2] + '</span></a>' : '<span></span>'; }).join('') + '</nav>';
  }
  function pfWorldNav(pg) {                           /* 페이지 끝 — 앞 월드 · 다음 월드(게임플레이 다음은 홈) */
    var order = ['', 'resume', 'cover', 'projects', 'play'], i = order.indexOf(pg), pv = order[i - 1], nx = order[i + 1];
    function nm(k) { return esc(pfNm(k || 'home')); }
    return '<section class="pf-sec pf-sec--next"><div class="pf-col">' + pfPager(['#/' + pv, 'WORLD ' + i, '◀ ' + nm(pv)], nx ? ['#/' + nx, 'WORLD ' + (i + 2), nm(nx) + ' ▶'] : ['#/', 'WORLD 1', nm('') + ' ▶']) + '</div></section>';
  }
  function pfContact(pdf) {
    var m = C.meta || {}, rows = [];
    if (m.email) rows.push([T('이메일', 'Email'), '<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a>']);
    if (m.github) rows.push(['GitHub', '<a href="' + esc(m.github) + '" target="_blank" rel="noopener">' + esc(m.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')) + '</a>']);
    if (pdf && SITE && m.resumeUrl) rows.push([T('이력서', 'Résumé'), '<a href="' + esc(m.resumeUrl) + '" target="_blank" rel="noopener">PDF ↓</a>']);
    return rows.length ? '<dl class="pf-contact">' + rows.map(function (c) { return '<div><dt>' + c[0] + '</dt><dd>' + c[1] + '</dd></div>'; }).join('') + '</dl>' : '';
  }
  function pfChips(a) { a = (a || []).map(function (x) { return t(x && x.text != null ? x.text : x); }).filter(Boolean); return a.length ? '<ul class="pf-chips">' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; }
  function pfParas(f) { return t(f).split(/\n{2,}/).filter(function (x) { return x.trim(); }).map(function (x) { return '<p>' + esc(x.trim()) + '</p>'; }).join(''); }
  function pfPhoto(src) { var ph = C.home && C.home.player; return src ? '<figure class="pf-photo"><img src="' + esc(IMG(src)) + '" alt="' + esc(t(ph && ph.photoAlt) || NAME) + '"></figure>' : ''; }

  /* WORLD 2 이력서 — 머리(사진 · 이름 · 한 줄 · 연락처) → 숫자 넷 → 핵심역량(홈과 같은 인벤토리) → 경력 · 활동(날짜 칸 | 내용) */
  function pfResume() {
    var r = C.resume || {}, ph = C.home && C.home.player, sk = r.skills || {}, ca = r.career || {}, nm = esc(pfNm('resume'));
    var head = pfHead({ w: '2', nm: nm, eyebrow: nm, title: esc(NAME), line: pfTitleHtml().replace('<br>', ' '), side: pfPhoto(String(r.photo || (ph && ph.photo) || '').trim()), back: ['#/', esc(pfNm('home'))], extra: pfContact(true) });
    var st = stats.length ? pfSec('2-1', T('숫자', 'Numbers'), T('숫자로 보는 ' + YRS + '년', YRS + ' years in numbers'), T('출시작 · 다운로드 · 커뮤니티 · 해', 'Titles, downloads, community and years'),
      '<div class="pf-win" data-pf-count data-pf-rv><div class="pf-stats">' + stats.map(function (s) {
        return '<p><span class="pf-stats__l">' + esc(t(s.label)) + '</span><b class="ps"><span data-l-count="' + esc(s.num) + '">' + esc(s.num) + '</span><small>' + esc(t(s.unit)) + '</small></b></p>'; }).join('') + '</div></div>') : '';
    var tl = (ca.items || []).map(function (c) {
      return '<div class="pf-tl__i' + (c.now ? ' is-now' : '') + '" data-pf-rv><p class="pf-tl__d"><span>' + esc(t(c.date)) + '</span>' + (c.now ? '<span class="pf-tl__now">' + T('진행 중', 'Ongoing') + '</span>' : '') + '</p>' +
        '<div><h3 class="pf-tl__t">' + esc(t(c.role)) + '</h3><p class="pf-tl__o">' + esc(t(c.org)) + '</p><p class="pf-tl__b">' + esc(t(c.body)) + '</p>' + pfChips(c.tags) + '</div></div>';
    }).join('');
    return head + pfUnder(st + pfSec('2-2', esc(t(sk.title)), esc(t(sk.title)), esc(t(sk.lead)), pfSkills()) +
      (tl ? pfSec('2-3', esc(t(ca.title)), esc(t(ca.title)), esc(t(ca.lead)), '<div class="pf-win pf-tl">' + tl + '</div>') : '') + pfWorldNav('resume'));
  }

  /* WORLD 3 자기소개서 — 머리(요약 제목) → 강점(업적 칸) → 글(크림 종이 한 장 = 한 편) */
  function pfCover() {
    var cl = C.coverLetter || {}, sm = cl.summary || {}, items = sm.items || [], bl = cl.blocks || [], nm = esc(pfNm('cover'));
    var head = pfHead({ w: '3', nm: nm, eyebrow: nm, title: esc(t(sm.title) || t(cl.title)), lead: T('강점 ' + items.length + '가지 · 글 ' + bl.length + '편', items.length + ' strengths · ' + bl.length + ' short pieces'), back: ['#/', esc(pfNm('home'))] });
    var ach = items.length ? pfSec('3-1', T('강점', 'Strengths'), T('일하는 방식', 'How I work'), T('함께 일할 때 기대할 수 있는 것', 'What to expect when we work together'), '<div class="pf-ach">' + items.map(function (it) {
      var tg = String(it.tag || '').split('/');
      return '<article class="pf-win" data-pf-rv><p class="pf-ach__n"><b class="ps">' + esc((tg[0] || '').trim()) + '</b><span class="ps">' + esc((tg[1] || '').trim()) + '</span></p><h3>' + esc(t(it.title)) + '</h3><p>' + esc(t(it.body)) + '</p></article>';
    }).join('') + '</div>') : '';
    var let_ = bl.length ? pfSec('3-2', T('자기소개', 'In my words'), T('자기소개', 'In my words'), T('짧은 글 ' + bl.length + '편', bl.length + ' short pieces'), '<div class="pf-letter">' + bl.map(function (b, i) {
      return '<article class="pf-paper" data-pf-rv><p class="ps pf-letter__n">PAGE ' + (i + 1) + ' / ' + bl.length + '</p>' + (t(b.heading) ? '<h3>' + esc(t(b.heading)) + '</h3>' : '') + pfParas(b.body) + '</article>';
    }).join('') + '</div>') : pfSec('3-2', T('자기소개', 'In my words'), T('자기소개', 'In my words'), '', '<div class="pf-paper">' + esc(t(cl.lead)) + '</div>');
    return head + pfUnder(ach + let_ + pfWorldNav('cover'));
  }

  /* WORLD 4 프로젝트 — 분류마다 진열판 위 카트리지(누르면 그 카트리지의 자세히 페이지) */
  function pfCart2(p) {
    return '<a class="pf-cart2" href="' + esc(pfDetail(p)) + '" data-grade="' + pfGrade(p) + '" data-pf-rv><span class="pf-cart2__lab"><span class="pf-cart__meta"><i>' + esc(pfCat(p)) + '</i><em class="ps">' + pfGrade(p) + '</em></span>' + pfArt(p) +
      '<b class="pf-cart2__t">' + esc(t(p.title)) + '</b><span class="pf-cart2__tag">' + esc(t(p.tag)) + '</span><span class="pf-cart2__s">' + esc(t(p.sub)) + '</span><span class="pf-cart2__p">' + esc(t(p.period)) + '</span></span></a>';
  }
  function pfProjects() {
    var pr = C.projects || {}, nm = esc(pfNm('projects'));
    var head = pfHead({ w: '4', nm: nm, eyebrow: nm, title: esc(t(pr.title) || pfNm('projects')), lead: T('카트리지 ' + PROJ.length + '개 · 하나를 누르면 자세히 봅니다', PROJ.length + ' cartridges · open one to read more'), back: ['#/', esc(pfNm('home'))] });
    var secs = [['game', 'GAMES'], ['planning', 'PLANNING']].map(function (c) {
      var list = PROJ.filter(function (p) { return p.category === c[0]; }); if (!list.length) return '';
      var cn = esc(t(TABS[c[0]]) || c[0]);
      return pfSec('4', cn, cn, T('카트리지 ' + list.length + '개', list.length + ' cartridges'), '<div class="pf-shelf">' + list.map(pfCart2).join('') + '</div>', c[1]);
    }).join('');
    return head + pfUnder(secs + pfWorldNav('projects'));
  }

  /* WORLD 4-n 프로젝트 자세히 — 머리(그림 · 분류 · 이름 · 한 줄 · 등급 · 기간) → 한눈에(목표 → 결과 · 표 · 장르) → 플레이 화면 → 배운 것 → (만든 과정) → 앞뒤 카트리지 */
  function pfDetailPg(i) {
    var p = PROJ[i], q = p.quest || {}, nm = esc(t(p.title)), lk = p.links || {}, md = p.media || {}, d = p.detailBlocks || {}, n = PROJ.length;
    var head = pfHead({ w: '4-' + (i + 1), nm: nm, eyebrow: esc(pfCat(p)) + ' · ' + esc(t(p.tag)), title: nm, lead: esc(t(p.sub)), side: '<div class="pf-ph__art">' + pfArt(p, 1) + '</div>', back: ['#/projects', T('프로젝트 목록', 'All projects')],
      extra: '<p class="pf-ph__meta"><em class="ps pf-grade" data-grade="' + pfGrade(p) + '">' + pfGrade(p) + '</em><span>' + esc(t(p.period)) + '</span></p>' });
    var kv = [[T('기간', 'Period'), p.period], [T('인원', 'Team'), p.headcount], [T('맡은 역할', 'My role'), p.myRole], [T('상태', 'Status'), p.status]].filter(function (r) { return r[1] && t(r[1]); });
    var stores = [['Google Play', lk.googlePlay], ['Steam', lk.steam]].filter(function (x) { return x[1] && String(x[1]).trim(); });
    var glance = (t(q.goal) || t(q.result) ? '<dl class="pf-q">' + (t(q.goal) ? '<dt>' + T('목표', 'Goal') + '</dt><dd>' + esc(t(q.goal)) + '</dd>' : '') + (t(q.result) ? '<dt>' + T('결과', 'Result') + '</dt><dd><strong>' + esc(t(q.result)) + '</strong></dd>' : '') + '</dl>' : '') +
      (kv.length ? '<dl class="pf-kv">' + kv.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(t(r[1])) + '</dd></div>'; }).join('') + '</dl>' : '') + pfChips(p.genres) +
      (stores.length ? '<p class="pf-stores">' + stores.map(function (x) { return '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener noreferrer">' + x[0] + ' ↗</a>'; }).join('') + '</p>' : '');
    var emb = String(md.embed || '').trim();
    var secs = pfSec('', '', T('한눈에', 'At a glance'), '', '<div class="pf-win" data-pf-rv>' + glance + '</div>', 'STATUS') +
      pfSec('', '', T('플레이 화면', 'Gameplay'), '', '<div class="pf-screen' + (emb ? '' : ' pf-screen--empty') + '" data-pf-rv>' + (emb ? '<iframe src="' + esc(emb) + '" title="' + nm + '" loading="lazy" allowfullscreen referrerpolicy="no-referrer"></iframe>' :
        '<b class="ps">NO SIGNAL</b><p>' + esc(t(md.note) || (L === 'en' ? 'Space for gameplay video and images.' : '게임 영상·이미지가 들어갈 자리입니다.')) + '</p>') + '</div>', 'SCREEN');
    if (p.learned && p.learned.length) secs += pfSec('', '', T('배운 것', 'What I learned'), '', '<div class="pf-paper" data-pf-rv><ul class="pf-notes">' + p.learned.map(function (x) { return '<li>' + esc(t(x)) + '</li>'; }).join('') + '</ul></div>', 'NOTES');
    var bl = [['문제', 'The problem', 'PROBLEM', d.problem], ['접근', 'The approach', 'APPROACH', d.approach], ['다시 한다면', 'Retrospective', 'RETRO', d.retrospective]].filter(function (b) { return t(b[3]); });
    if (bl.length) secs += pfSec('', '', T('만든 과정', 'How it was made'), '', '<div class="pf-paper pf-blk" data-pf-rv>' + bl.map(function (b) { return '<section><h3>' + T(b[0], b[1]) + '<small>' + b[2] + '</small></h3>' + pfParas(b[3]) + '</section>'; }).join('') + '</div>', 'LOG');
    var pv = PROJ[i - 1], nx = PROJ[i + 1];
    secs += '<section class="pf-sec pf-sec--next"><div class="pf-col">' + pfPager(pv ? [esc(pfDetail(pv)), 'WORLD 4-' + i, '◀ ' + esc(t(pv.title))] : ['#/projects', 'WORLD 4', '◀ ' + T('프로젝트 목록', 'All projects')],
      nx ? [esc(pfDetail(nx)), 'WORLD 4-' + (i + 2), esc(t(nx.title)) + ' ▶'] : ['#/play', 'WORLD 5', esc(pfNm('play')) + ' ▶']) + '</div></section>';
    return head + pfUnder(secs);
  }

  /* WORLD 5 게임플레이 — 장르별 플레이 시간(스팀 · 계열 하나라 강조색 하나 · 범례 없음 · 제곱근 눈금 · 같은 값을 표로 한 번 더) → 저장 슬롯(기획서를 바꾼 게임) */
  function pfSteam() {
    var d = window.PORTFOLIO_STEAM, s = (C.play && C.play.steam) || {}, axes = (d && d.axes) || [];
    if (!axes.length) return '';
    var names = s.genreNames || {}, hU = t(s.hourUnit), cU = t(s.countUnit);
    function gname(a) { var x = names[String(a.id)]; return x ? t(x) : (a.name || String(a.id)); }
    function nf(v) { return String(Math.round(v || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function hrs(v) { return nf(v) + hU; }
    function f1(v) { return v.toFixed(1); }
    var CX = 200, CY = 168, R = 104, N = axes.length, max = 1;
    axes.forEach(function (a) { max = Math.max(max, a.hours || 0); });
    function pt(i, r) { var an = Math.PI * 2 * i / N - Math.PI / 2; return [CX + Math.cos(an) * r, CY + Math.sin(an) * r]; }
    function ring(r) { var q = []; for (var i = 0; i < N; i++) q.push(pt(i, r).map(f1).join(',')); return '<polygon class="g" points="' + q.join(' ') + '"/>'; }
    var grid = ring(R) + ring(R * 2 / 3) + ring(R / 3), sp = '', lab = '', dots = '', shape = [];
    axes.forEach(function (a, i) {
      var r = R * Math.sqrt(Math.max(0, a.hours || 0) / max), e = pt(i, R), p = pt(i, r), l = pt(i, R + 18);
      sp += '<line class="s" x1="' + CX + '" y1="' + CY + '" x2="' + f1(e[0]) + '" y2="' + f1(e[1]) + '"/>';
      shape.push(f1(p[0]) + ',' + f1(p[1]));
      dots += '<g><title>' + esc(gname(a) + ' ' + hrs(a.hours)) + '</title><circle class="hit" cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="16"/><rect class="d" x="' + f1(p[0] - 5) + '" y="' + f1(p[1] - 5) + '" width="10" height="10"/></g>';
      var anc = Math.abs(l[0] - CX) < 2 ? 'middle' : l[0] > CX ? 'start' : 'end', dy = l[1] < CY - R * .6 ? -6 : l[1] > CY + R * .6 ? 14 : 0;
      lab += '<text class="n" x="' + f1(l[0]) + '" y="' + f1(l[1] + dy) + '" text-anchor="' + anc + '">' + esc(gname(a)) + '</text><text class="v" x="' + f1(l[0]) + '" y="' + f1(l[1] + dy + 17) + '" text-anchor="' + anc + '">' + esc(hrs(a.hours)) + '</text>';
    });
    var alt = axes.map(function (a) { return gname(a) + ' ' + hrs(a.hours); }).join(', ');
    var svg = '<svg class="pf-sr" viewBox="0 0 400 336" role="img" aria-label="' + esc(t(s.title) + ': ' + alt) + '">' + grid + sp +
      '<g data-pf-grow data-c="' + CX + ' ' + CY + '"><polygon class="a" points="' + shape.join(' ') + '"/>' + dots + '</g>' + lab + '</svg>';
    var tot = d.totals || {}, rec = (d.recent || []).slice(0, 2).map(function (x) { return x.name; }).join(' · ');
    var st = '<dl class="pf-steam__stats"><div><dt>' + esc(t(s.totalLabel)) + '</dt><dd>' + esc(hrs(tot.hours)) + '</dd></div><div><dt>' + esc(t(s.gamesLabel)) + '</dt><dd>' + esc(nf(tot.games) + cU) + '</dd></div>' +
      (rec ? '<div><dt>' + esc(t(s.recentLabel)) + '</dt><dd class="pf-steam__recent">' + esc(rec) + '</dd></div>' : '') +
      (s.making && s.making.hours ? '<div><dt>' + esc(t(s.making.label)) + '</dt><dd>' + esc(hrs(s.making.hours)) + '</dd></div>' : '') + '</dl>';
    var rows = axes.map(function (a) { return '<tr><th scope="row">' + esc(gname(a)) + '</th><td>' + esc(hrs(a.hours)) + '</td><td>' + esc(nf(a.games) + cU) + '</td></tr>'; }).join('') +
      (d.restHours > 0 ? '<tr class="rest"><th scope="row">' + esc(t(s.restLabel)) + '</th><td>' + esc(hrs(d.restHours)) + '</td><td>' + esc(nf(d.restGenres) + cU) + '</td></tr>' : '');
    var table = '<table><caption class="sr-only">' + esc(t(s.title)) + '</caption><thead><tr><th scope="col">' + esc(t(s.tableGenre)) + '</th><th scope="col" style="text-align:right">' + esc(t(s.tableHours)) + '</th><th scope="col" style="text-align:right">' + esc(t(s.tableGames)) + '</th></tr></thead><tbody>' + rows + '</tbody></table>';
    return '<div class="pf-win pf-steam" data-pf-rv><div class="pf-steam__h"><h3>' + T('장르별 시간', 'Hours by genre') + '</h3>' + (d.sample ? '<span class="pf-steam__sample">' + esc(t(s.sampleLabel)) + '</span>' : '') +
      '<p class="pf-steam__note">' + esc(t(s.note) + (d.generatedAt ? ' · ' + t(s.updatedLabel) + ' ' + d.generatedAt : '')) + '</p></div><div class="pf-steam__b"><figure>' + svg + '</figure><div>' + st + table + '</div></div></div>';
  }
  function pfSteamTick() {                     /* 그래프 모양은 화면에 들어온 만큼 가운데에서 자라남(모션 최소화면 처음부터 다) */
    var g = document.querySelector('.pf [data-pf-grow]'); if (!g) return;
    var f = RM ? 1 : clamp01((innerHeight * .95 - g.ownerSVGElement.getBoundingClientRect().top) / (innerHeight * .4)), c = g.getAttribute('data-c').split(' ');
    if (g.__f === f) return; g.__f = f;
    g.setAttribute('transform', 'translate(' + c[0] + ' ' + c[1] + ') scale(' + f.toFixed(3) + ') translate(-' + c[0] + ' -' + c[1] + ')');
  }
  function pfPlayPg() {
    var pl = C.play || {}, s = pl.steam || {}, nm = esc(pfNm('play')), cards = pl.cards || [], steam = pfSteam();
    var head = pfHead({ w: '5', nm: nm, eyebrow: nm, title: esc(t(pl.title)), lead: esc(t(pl.lead)), back: ['#/', esc(pfNm('home'))] });
    var secs = (steam ? pfSec('5-1', esc(t(s.title)), esc(t(s.title)), T('장르별로 묶은 시간', 'Hours grouped by genre'), steam) : '') +
      (cards.length ? pfSec(steam ? '5-2' : '5-1', T('저장 슬롯', 'Save files'), T('기획서를 바꾼 게임', 'Games that changed my docs'), T('저장 슬롯 ' + cards.length + '개', cards.length + ' save files'), '<div class="pf-slots">' + cards.map(function (g) {
        var ic = String(g.icon || '').trim();
        return '<article class="pf-win pf-save" data-pf-rv><span class="pf-save__ic">' + (ic ? '<img src="' + esc(IMG(ic)) + '" alt="">' : '<i aria-hidden="true"></i>') + '</span><div><p class="pf-save__top"><b>' + esc(t(g.name)) + '</b><em>' + esc(t(g.hours)) + '</em></p>' +
          '<p class="pf-save__g">' + esc(t(g.genre)) + '</p><p class="pf-save__n">' + esc(t(g.note)) + '</p></div></article>';
      }).join('') + '</div>') : '');
    return head + pfUnder(secs + pfWorldNav('play'));
  }

  var PF_R = null, PF_POS = {}, PF_CLICK = 0;     /* 지금 페이지 · 페이지마다 마지막 스크롤 자리(뒤로 가면 그 자리로) · 링크를 눌러 온 것인지 */
  function renderPlay() {
    document.body.classList.add('is-play');
    document.documentElement.lang = L;
    if (typeof MINIG !== 'undefined') document.documentElement.style.setProperty('--mb-mini', spr(MINIG));
    document.documentElement.style.setProperty('--pf-lip', spr(PF_LIP)); document.documentElement.style.setProperty('--pf-body', spr(PF_BODY));
    var r = pfRoute(); PF_R = r;
    var body = r.pg === 'resume' ? pfResume() : r.pg === 'cover' ? pfCover() : r.pg === 'projects' ? pfProjects() : r.pg === 'play' ? pfPlayPg() : r.pg === 'detail' ? pfDetailPg(r.i) : pfHero() + pfCareer() + pfSkillSec() + pfProj();
    var root = document.getElementById('play');
    root.innerHTML = '<div class="pf' + (RM ? '' : ' rv-on') + '" data-pf data-pg="' + r.pg + '">' + pfTop(r.pg) + body + pfFoot() + '</div>';
    var who = NAME + ' · ' + t(C.meta && C.meta.role);
    document.title = r.pg === 'home' ? who + (LIVE ? (L === 'en' ? ' — Portfolio' : ' 포트폴리오') : ' — ' + (L === 'en' ? 'Home flow draft' : '홈 흐름 시안')) : (r.pg === 'detail' ? t(PROJ[r.i].title) : pfNm(r.pg)) + ' · ' + who;
    SCROLLERS = []; SCRUBS = []; LTICKS = []; PF = null;
    var pf = root.querySelector('[data-pf]');
    pf.querySelector('[data-pf-lang]').addEventListener('click', function () { L = L === 'en' ? 'ko' : 'en'; try { localStorage.setItem('portfolio:lang', L); } catch (e) {} var y = scrollY; render(); window.scrollTo(0, y); });
    var top = pf.querySelector('.pf-top'), mb = pf.querySelector('[data-pf-mbtn]');
    mb.addEventListener('click', function () { var o = !top.classList.contains('is-open'); top.classList.toggle('is-open', o); mb.setAttribute('aria-expanded', String(o)); });
    LTICKS.push(pfWorldTick, pfRvTick, pfDiveTick);
    if (r.pg === 'play') LTICKS.push(pfSteamTick);
    var menu = pf.querySelector('[data-pf-menu]');
    if (menu) {
      wireL3();
      LTICKS.push(function () { pfTick(); });
      var menuOn = function (li) { [].forEach.call(menu.children, function (x) { x.classList.toggle('on', x === li); }); };
      menu.addEventListener('mouseover', function (e) { var li = e.target.closest('li'); if (li) menuOn(li); });
      menu.addEventListener('focusin', function (e) { var li = e.target.closest('li'); if (li) menuOn(li); });
    }
    pf.addEventListener('click', function (e) {
      var jm = e.target.closest('[data-pf-jump]');
      if (jm) { e.preventDefault(); var tg = pf.querySelector(jm.getAttribute('href')); if (tg) window.scrollTo({ top: tg.getBoundingClientRect().top + scrollY - (jm.getAttribute('href') === '#pf-career' ? 0 : 40), behavior: RM ? 'auto' : 'smooth' }); return; }
      var g = e.target.closest('[data-pf-go]'); if (g) { pfGo(+g.getAttribute('data-pf-go'), .8); return; }
      var s = e.target.closest('[data-pf-step]'); if (s) { var c = pfProg(); pfGo(c[0] < 0 ? 0 : c[0] + +s.getAttribute('data-pf-step'), .8); return; }
      if (e.target.closest('[data-pf-b]')) { var c2 = pfProg(); if (c2[0] >= 0) pfGo(c2[0], .04); return; }
      if (e.target.closest('[data-pf-a]')) {
        var c3 = pfProg(); if (c3[0] < 0 || c3[1] < .68) { pfGo(Math.max(0, c3[0]), .8); return; }
        PF_CLICK = 1; location.hash = pfDetail(PROJ[c3[0]]);
        return;
      }
    });
    if (!window.__pfKeys) {
      window.__pfKeys = 1;
      document.addEventListener('keydown', function (e) {
        if (!PF || e.altKey || e.ctrlKey || e.metaKey || /input|textarea/i.test((e.target.tagName || ''))) return;
        var r = PF.root.querySelector('[data-pf-run]').getBoundingClientRect(); if (r.top > innerHeight * .5 || r.bottom < innerHeight * .5) return;
        var c = pfProg();
        if (e.key === 'ArrowRight') { e.preventDefault(); pfGo(c[0] < 0 ? 0 : c[0] + 1, .8); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); pfGo(c[0] - 1, .8); }
      });
    }
    window.PFDBG = function () { return PF && PF.key; };     /* 확인용(지금 화면 상태) */
    pfLayout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { pfLayout(); scrollTick(); });
    scrollTick();
  }

  if (PLAY) {
    try { history.scrollRestoration = 'manual'; } catch (e) {}
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#/"]'); if (!a) return;
      var h = a.getAttribute('href');
      if (PF_R && (h === location.hash || (h === '#/' && PF_R.pg === 'home'))) { e.preventDefault(); window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); return; }
      PF_CLICK = 1;
    }, true);
    window.addEventListener('hashchange', function () {
      var nr = pfRoute(); if (PF_R && nr.key === PF_R.key) return;
      if (PF_R) PF_POS[PF_R.key] = scrollY;
      var y = !PF_CLICK && PF_POS[nr.key] != null ? PF_POS[nr.key] : 0; PF_CLICK = 0;
      render(); window.scrollTo(0, y); scrollTick();
    });
  }

  var DRAFTS4 = [
    { id: 'l3', label: '나', plain: true, f: draftL3, wire: wireL3, badge: { ko: '목록판 · 짧게', en: 'List · short' }, name: { ko: '모래 길 — 길을 따라 내려가며 읽는 코스 아홉', en: 'Sand road — nine courses read down the road' }, sub: { ko: '슈퍼 마리오 월드 지도의 모래 길 · 점 + 코스마다 메시지 블록 한 장', en: 'The Super Mario World map road and dots + one message block per course' },
      pitch: { ko: '지도 그림은 빼고 슈퍼 마리오 월드 지도의 모래 길과 점만 가져와 왼쪽에 세로로 놓고, 아홉 코스를 시간 순서대로 이었습니다. 빨간 점 = 나(START), 노란 점 = 경력 · 활동, 돌 성 = 출시한 프로젝트, 파란 점 = 배운 곳, 깃발 = 다음 목표(PD). 코스 하나 = 검은 메시지 블록 한 장 — 이름 · 기간 / 한 줄 / 사실 몇 개(인원 · 큰 숫자 · 퀘스트 결과). 내리는 만큼 고스트가 길을 내려가며 길을 그리고, 지나간 점이 켜지며 그 코스의 숫자가 올라갑니다.',
               en: 'No map picture — just the sand road and dots from the Super Mario World map, set vertically on the left, with the nine courses running down it in time order. Red dot = me (START), yellow dots = career and activities, stone castles = shipped projects, blue dot = learning, flag = the next goal (PD). One course = one black message block: name and period, one line, a few facts (team, the big number, the quest result). The ghost walks down the road as far as you scroll, drawing the road behind it; each dot it passes lights up and that course\'s numbers count up.' },
      map: [['구조', 'Structure', '왼쪽 모래 길 + 메시지 블록 아홉', 'Sand road on the left + nine message blocks'], ['내리면', 'Scroll', '고스트가 길을 내려가며 길을 그리고 지나간 점이 켜짐', 'The ghost walks down, drawing the road; dots it passes light up'], ['한 칸', 'One course', '이름 · 기간 / 한 줄 / 사실 몇 개', 'Name and period / one line / a few facts']],
      hint: { ko: '▼ 그냥 내리며 읽으세요 — 고스트가 길을 따라 내려옵니다.', en: '▼ Just scroll and read — the ghost follows the road down.' },
      pros: { ko: ['가장 짧음 — 지도 없이 블록 아홉만', '모래 길 · 점 · 메시지 블록으로 테마는 남기고 읽기는 보통 페이지처럼', '휴대폰에서도 옆으로 밀 것 없이 위에서 아래로'], en: ['The shortest — no map, just nine blocks', 'The road, dots and message blocks keep the theme while it reads like a normal page', 'Straight top to bottom on a phone too, with no sideways swipe'] },
      cons: { ko: ['10년 전체를 한 장에 보는 그림은 없어짐', '배운 것 · 태그는 빠짐(한 줄만)', '연출은 길 그리기 · 점 켜기 · 숫자 올리기뿐'], en: ['No single picture of the whole ten years any more', 'What I learned and the tags are left out (one line only)', 'The only staging is drawing the road, lighting dots and counting up'] } },
    { id: 'l2', label: '다', plain: true, f: draftL2, wire: wireL2, badge: { ko: '목록판 · 짧게', en: 'List · short' }, name: { ko: '코스 시작 화면 — 월드 아홉을 위에서 아래로', en: 'Course start — nine worlds, top to bottom' }, sub: { ko: '슈퍼 마리오브라더스 점수판(따라 붙음) + 월드마다 글 | 그 코스', en: 'Super Mario Bros. HUD (pinned) + each world\'s text beside its course' },
      pitch: { ko: '월드 아홉을 위에서 아래로 이었습니다. 맨 위 점수판은 따라 붙어 지금 읽는 월드까지 쌓인 점수(누적 다운로드) · 동전(출시작)을 보여 주고, 월드마다 왼쪽에 글(WORLD 3-4 · 이름 · 기간 / 한 줄 / 사실 몇 개), 오른쪽에 그 코스 장면을 나란히 두어 월드 한 칸 = 장면 높이입니다. 장면이 화면에 들어온 만큼 고스트가 블록을 치거나 깃대를 탑니다. 잠긴 물음표 · QUEST / CLEAR 칩 같은 게임 결산은 뺐습니다.',
               en: 'The nine worlds run top to bottom. The HUD stays pinned and shows the score (downloads) and coins (titles) piled up to the world you are reading. Each world puts its text on the left (WORLD 3-4, name and period, one line, a few facts) and its course on the right, so a world is only as tall as its scene. As a scene comes into view the ghost hits the block or rides the flagpole. The game tally bits — question-mark locks, QUEST and CLEAR chips — are gone.' },
      map: [['구조', 'Structure', '붙어 있는 점수판 + 월드 아홉(글 | 장면)', 'Pinned HUD + nine worlds (text | scene)'], ['내리면', 'Scroll', '장면이 보이는 만큼 고스트가 그 코스를 깸 · 점수판이 오름', 'As each scene comes into view the ghost clears it; the HUD climbs'], ['한 칸', 'One world', '이름 · 기간 / 한 줄 / 사실 몇 개', 'Name and period / one line / a few facts']],
      hint: { ko: '▼ 그냥 내리며 읽으세요 — 장면이 화면에 들어오면 고스트가 움직입니다.', en: '▼ Just scroll and read — the ghost moves as each scene comes into view.' },
      pros: { ko: ['짧음 — 글과 장면이 나란히라 월드 한 칸이 장면 높이(전 판의 절반 이하)', '점수판이 따라와 지금까지 쌓인 숫자가 늘 보임', '고스트가 그 코스를 해내는 장면은 그대로'], en: ['Short — the text sits beside the scene, so a world is only as tall as its scene (under half the previous length)', 'The pinned HUD always shows what has piled up so far', 'The ghost still plays out each course'] },
      cons: { ko: ['휴대폰에서는 장면이 글 아래로 가서 덜 짧아짐', '배운 것 · 태그는 빠짐(한 줄만)', '장면은 종류만 구분(경력 · 프로젝트 · 배운 곳)'], en: ['On a phone the scene drops below the text, so it shortens less', 'What I learned and the tags are left out (one line only)', 'The scene only tells the kinds apart (career, project, learning)'] } }
  ];
  var DRAFTS_OLD = [
    { id: 'e3', scrub: true, label: '나′', plain: true, f: draftE3, wire: wireE3, badge: { ko: '지난 판 · 한 칸씩 넘기기', en: 'Earlier · one step at a time' }, name: { ko: '섬 지도 — 길을 따라 깨 온 코스들', en: 'Island map — courses cleared along the road' }, sub: { ko: '슈퍼 마리오 월드 지도 + 메시지 블록 + COURSE CLEAR!', en: 'Super Mario World map + message block + COURSE CLEAR!' },
      pitch: { ko: '슈퍼 마리오 월드의 섬 지도처럼 10년을 바다 위 섬 하나에 놓았습니다. 빨간 점 = 나(START), 노란 점 = 경력 · 활동, 돌 성 = 출시한 프로젝트, 파란 점 = 배운 곳, 깃발 = 다음 목표(PD). 내리면 고스트가 다음 점으로 걸어가고 그 뒤로 모래 길이 그려지며(아직 안 간 길은 점선), 닿는 순간 위 띠에 코스 이름이 바뀌고 아래 검은 메시지 블록에 그 시기의 한 줄이 한 자씩 써지며, 오른쪽 결산 화면(COURSE CLEAR! · 기간 · 숫자 · 보너스 = 퀘스트 결과)의 숫자가 올라갑니다.',
               en: 'Ten years on one island in the sea, like the Super Mario World map. The red dot is me (START); yellow dots are career and activities; stone castles are shipped projects; the blue dot is where I am learning; the flag is the next goal (PD). Scroll and the ghost walks to the next dot while the sand road draws in behind it (roads not yet taken are dotted); the moment it arrives, the course name in the top bar changes, the black message block types out that period in one line, and the numbers on the right-hand tally (COURSE CLEAR!, time, score, bonus = the quest result) count up.' },
      map: [['구조', 'Structure', '섬 한 장 = 10년 · 모래 길 = 시간', 'One island = ten years · sand road = time'], ['내리면', 'Scroll', '걸어가며 길이 그려짐 → 닿으면 이름 · 메시지(한 자씩) · 결산(숫자가 올라감)', 'Walk and the road draws → on arrival: name, message (typed), tally (counting up)'], ['처음 화면', 'At rest', 'START(나) — 숫자 넷이 결산 화면에', 'START (me) — the four numbers on the tally']],
      hint: { ko: '▼ 그냥 내리세요 — 한 칸의 앞쪽에서는 그 코스의 글과 숫자가 채워지고, 뒤쪽에서는 고스트가 다음 점으로 걸어갑니다. 휴대폰에서는 지도가 고스트를 따라 움직입니다.', en: '▼ Just scroll — in the first part of each step the course text and numbers fill in; in the last part the ghost walks to the next dot. On a phone the map pans with the ghost.' },
      pros: { ko: ['지나온 길만 그려져 10년이 쌓이는 게 눈에 보임 — 스크롤 = 걷기', '닿는 순간 이름 · 한 줄 · 숫자가 차례로 뜸 — 무엇이 언제 바뀌는지 분명', '물가 물거품 · 반짝이는 물결 · 풀 포기로 16비트 섬 느낌'], en: ['Only the road travelled is drawn, so the ten years visibly pile up — scrolling is walking', 'On arrival the name, the line and the numbers appear in turn — it is clear what changes when', 'Foam at the shore, twinkling waves and grass tufts give a 16-bit island feel'] },
      cons: { ko: ['섬 모양이 아직 단순함(둥근 덩어리 여섯)', '휴대폰에서는 지도 일부만 보임(카메라가 고스트를 따라감)', '결산 화면은 한 번에 한 코스'], en: ['The island shape is still simple (six round blobs)', 'A phone shows only part of the map (the camera follows the ghost)', 'One course on the tally at a time'] } },
    { id: 'e2', scrub: true, label: '다′', plain: true, f: draftE2, wire: wireE2, badge: { ko: '지난 판 · 한 칸씩 넘기기', en: 'Earlier · one step at a time' }, name: { ko: '코스 시작 화면 — 점수판에 쌓이는 10년', en: 'Course start — ten years on the scoreboard' }, sub: { ko: '슈퍼 마리오브라더스 점수판 + WORLD 화면 + 코스 미리보기', en: 'Super Mario Bros. HUD + WORLD card + course preview' },
      pitch: { ko: '슈퍼 마리오브라더스에서 코스가 시작될 때 나오는 검은 화면과 그 코스를 썼습니다. 시기 하나 = 월드 하나(출시한 프로젝트는 성이 있는 x-4), 마지막 월드 8 = 다음 목표 PD. 내리면 고스트가 그 코스를 직접 깹니다 — 경력은 물음표 블록을 쳐서 동전과 함께 그 시기의 숫자(200K · 60K …)가 튀어나오고, 출시 프로젝트는 계단을 올라 깃대를 타고 내려오면 깃발이 내려오고, 배운 곳은 관 속으로, 다음 목표는 빈 깃대에 깃발이 오릅니다. 그 순간 점수판(점수 = 누적 다운로드 · 동전 = 출시작)이 올라가고, 물음표로 잠겨 있던 결과(큰 숫자 · 퀘스트 CLEAR)가 열립니다.',
               en: 'The black screen Super Mario Bros. shows before each course, plus the course itself. One period = one world (shipped projects are castle levels, x-4), and the last, World 8, is the next goal: PD. Scroll and the ghost plays the course — for career it bumps the ? block and the period\'s number (200K, 60K …) pops out with a coin; for a shipped project it climbs the stairs and slides down the flagpole as the flag drops; for learning it goes down the pipe; for the next goal a flag rises on the empty pole. At that moment the scoreboard (score = downloads, coins = titles) climbs and the results locked behind question marks (the big number, the quest CLEAR) open up.' },
      map: [['구조', 'Structure', '월드 하나 = 시기 하나 · 9장', 'One world = one period · 9 screens'], ['내리면', 'Scroll', '고스트가 그 코스를 깸 → 점수판이 오르고 잠긴 결과(???)가 열림', 'The ghost clears the course → the scoreboard climbs and locked results (???) open'], ['처음 화면', 'At rest', 'WORLD 1-1 · 나 — 숫자 0 에서 출발', 'WORLD 1-1 · me — the numbers start at 0']],
      hint: { ko: '▼ 그냥 내리세요 — 한 칸 안에서 고스트가 달려가 블록 · 깃대 · 관을 해내고, 그 순간 점수판과 결과가 바뀝니다.', en: '▼ Just scroll — within each step the ghost runs up and hits the block, the flagpole or the pipe, and the scoreboard and results change at that moment.' },
      pros: { ko: ['이력의 결과가 게임 동작의 결과로 뜸 — 블록을 쳐야 200K 가 튀어나옴', '점수판이 쌓이는 모습 = 10년의 성장이 숫자로 보임(값 밑에 뜻을 적어 둠)', '마리오 1편을 아는 사람은 바로 알아봄(WORLD · TIME · 동전 · 깃대)'], en: ['Career results appear as the results of game actions — 200K pops out only when the block is hit', 'The climbing scoreboard shows ten years of growth in numbers (each value is labelled underneath)', 'Anyone who knows the first Mario recognises it (WORLD, TIME, coins, flagpole)'] },
      cons: { ko: ['한 번에 한 시기만 — 전체 흐름은 아래 진행 막대로만 보임', '처음 화면은 숫자가 0 — 끝까지 내려야 300000', '낮은 화면에서는 땅 한 단 · 계단 두 단으로 줄어듦'], en: ['One period at a time — the whole flow only shows in the progress bar', 'The first screen starts at 0 — you reach 300000 only at the end', 'On short screens the ground drops to one row and the stairs to two'] } },
    { id: 'e1', scrub: true, label: '가', plain: true, f: draftE1, wire: wireE1, badge: { ko: '새 안 · 마리오 시리즈 · 월드 지도', en: 'New · Mario series · world map' }, name: { ko: '월드 지도 — 10년을 지도 한 장으로', en: 'World map — ten years on one map' }, sub: { ko: '슈퍼 마리오브라더스 3 지도 + 슈퍼 마리오 월드 이름 띠', en: 'SMB3 map + Super Mario World name strip' },
      pitch: { ko: '슈퍼 마리오브라더스 3 의 지도 화면처럼 10년을 지도 한 장에 놓았습니다. 길 = 시간 순서, START = 나(프로필), 번호 칸 = 경력 · 활동(주황 = 깬 곳, 검정 = 진행 중), 성 = 출시한 프로젝트(리그 오브 디펜스 · 컴스톡), 집 = 배운 곳(기획자 과정), 강을 건너는 다리 = 혼자에서 팀으로 넘어간 순간, 점선 끝 깃발 = 다음 목표 PD. 칸을 누르거나 ◀ ▶ 로 고르면 고스트(1P)가 그 칸에 서고, 위 띠에 코스 이름(슈퍼 마리오 월드), 오른쪽 카드에 기간 · 인원 · 역할 · 대표 숫자 · 퀘스트 목표 → 결과 · 배운 것이 뜹니다. 아래 상태 막대는 슈퍼 마리오브라더스 3 처럼 월드 · 10년 P 막대 · 점수(누적 다운로드) · 출시작 · 커뮤니티와 카드 세 칸(대표 결과).',
               en: 'Ten years laid out like the Super Mario Bros. 3 map screen. The road is time; START is me (profile); numbered panels are career and activities (orange = cleared, black = ongoing); castles are shipped projects (League of Defense, Comstock); the house is where I am learning (design course); the bridge over the river is the move from solo to team; the flag past the dotted road is the next goal, PD. Tap a space or use ◀ ▶: the ghost (1P) stands on it, the strip on top names the course (Super Mario World), and the card shows dates, team, role, the key number, quest goal → result and what I learned. The status bar below works like SMB3: world, a ten-year P meter, score (downloads), titles, community and three cards for the top results.' },
      map: [['구조', 'Structure', '지도 한 장 = 10년 · 길 = 시간', 'One map = ten years · road = time'], ['내리면', 'Scroll', '고스트가 다음 칸으로 · 이름 띠 · 코스 카드가 바뀜', 'The ghost walks on; name strip and card update'], ['처음 화면', 'At rest', 'START(나)가 골라진 채 — 누르지 않아도 읽힘', 'START (me) selected — readable without tapping']],
      hint: { ko: '▼ 그냥 내리세요 — 화면이 붙은 채 내리는 만큼 고스트가 다음 칸으로 갑니다. 칸 · ◀ ▶ 를 누르면 그 자리까지 스크롤합니다.', en: '▼ Just scroll — the screen stays put and the ghost walks one space per scroll step. Tapping a space or ◀ ▶ scrolls there.' },
      pros: { ko: ['게임 화면 그대로 — 지도 · 이름 띠 · 상태 막대 · 카드가 모두 마리오 시리즈의 문법', '한 장으로 10년의 순서 · 종류(경력 · 성 · 집)가 한눈에, 고르면 자세히', '숫자는 상태 막대(점수 · 카드)에 늘 떠 있음'], en: ['A real game screen — map, name strip, status bar and cards all follow the Mario series', 'One picture shows the order and kind of every period; select for detail', 'The numbers always sit in the status bar (score, cards)'] },
      cons: { ko: ['지도 폭 800px — 휴대폰에서는 옆으로 밀어야 함', '코스 카드는 하나씩만 보임(고르는 동작 필요)', '그림은 아직 초안 — 마음에 들면 칸 · 성 · 덤불을 더 다듬음'], en: ['The map is 800px wide — swipe sideways on a phone', 'One course card at a time (needs a selection)', 'The art is a first pass — refine panels, castles and bushes once the direction is right'] } },
    { id: 'e4', scrub: true, label: '라', plain: true, f: draftE4, wire: wireE4, badge: { ko: '새 안 · 마리오 시리즈 · 상태 메뉴', en: 'New · Mario series · status menu' }, name: { ko: '상태 메뉴 — 한 화면에 펼친 한 사람', en: 'Status menu — one person on one screen' }, sub: { ko: '슈퍼 마리오 RPG 의 상태 · 장비 · 기술 창', en: 'Super Mario RPG status, equip and specials windows' },
      pitch: { ko: '슈퍼 마리오 RPG 의 메뉴처럼 둥근 파란 창 여섯 장에 한 사람의 상태를 다 펼쳤습니다. 왼쪽 = 나(사진 · 육각형 기획자 · LV 10 = 10년 · EXP = 누적 다운로드 · 다음 레벨 PD 까지 = 기획자 과정 몇 달째), 능력치 여섯은 모두 4(고르게 자람), 장비 = 핵심역량 다섯 칸과 실제 도구 로고, 기술 = 자기소개서 강점 셋, 기록 = 출시한 프로젝트 셋의 퀘스트 결과. ▶ 커서를 옮기면 아래 도움말 창에 근거가 나옵니다.',
               en: 'Like the Super Mario RPG menu, six rounded blue windows lay out one person\'s whole status. Left: me (photo, hexagon game designer, LV 10 = ten years, EXP = downloads, next level PD = how far into the design course). Six stats all at 4 (grown evenly); EQUIP = five core-skill slots with the real tool logos; SPECIAL = the three strengths from the cover letter; QUESTS = the quest results of three shipped projects. Move the ▶ cursor and the help window below gives the evidence.' },
      map: [['구조', 'Structure', '창 여섯 = 상태 · 능력치 · 장비 · 기술 · 기록 · 도움말', 'Six windows = status, stats, gear, moves, log, help'], ['내리면', 'Scroll', '▶ 커서가 한 칸씩 · 도움말 창이 바뀜', 'The ▶ cursor moves one entry; the help window changes'], ['처음 화면', 'At rest', '다 펼쳐져 있어 누르지 않아도 읽힘', 'Everything is open — readable without input']],
      hint: { ko: '▼ 그냥 내리세요 — 내리는 만큼 ▶ 커서가 다음 항목으로 가고 도움말 창에 근거가 나옵니다. 좁은 화면에서는 창이 한 장씩 넘어갑니다.', en: '▼ Just scroll — each step moves the ▶ cursor to the next entry and the help window shows the evidence. On narrow screens the windows turn one at a time.' },
      pros: { ko: ['한 화면에 이력 전체 — 고르지 않아도 다 보임', '장비 = 실제 도구 로고라 RPG 문법이 억지스럽지 않음', '슈퍼 패미컴 창(그라데이션 · 둥근 테)이라 도트 화면 셋과 결이 다름'], en: ['The whole career on one screen — nothing to select first', 'EQUIP holds real tool logos, so the RPG grammar does not feel forced', 'Super Famicom windows (gradient, rounded frame) — a different texture from the three pixel screens'] },
      cons: { ko: ['시간 순서는 약함 — 기록 창의 프로젝트 셋만 시간 순', '능력치 숫자는 아직 예시(모두 4)', '휴대폰에서는 창을 한 장씩만 보여 줌(위 이름표로 어디인지 표시)'], en: ['Weak on chronology — only the three projects in the log are in order', 'The stat values are still placeholders (all 4)', 'A phone shows one window at a time (the tabs above say which)'] } },
    { id: 's', f: draftS6, w: wireS6, scroll: 3200, extra: function () { return palBar('s'); }, badge: { ko: '고른 안 · 팔레트 8벌', en: 'Chosen · 8 palettes' }, name: { ko: '지어지는 월드 — 완공될 때마다 튀어나오는 이력', en: 'A world being built — the career pops out at each build' }, sub: { ko: '스크롤 = 시간', en: 'Scroll = time' },
      pitch: { ko: '스크롤하면 빨강 고스트가 다음 공사장으로 걸어가 닿고, 그 순간 그 시기의 소품(관과 동전 다섯 · 고스트 무리 · 구름 · 단상 · 깃발)이 솟아 지어집니다. 화면이 흔들리고 꼭대기에서 숫자와 큰 글씨 대화창이 튀어나와 옆에 머문 뒤(본문은 스크롤만큼 써짐) 위의 잠긴 팻말(?)로 접혀 들어갑니다. 기본은 밝은 낮(1-1)이고, 위 \'팔레트\' 줄로 월드 색을 바꿔 볼 수 있습니다(\'시간 따라\'를 고르면 시기마다 1-1 낮 → 1-2 지하 → 노을 → 밤 → 1-4 성). 휴대폰에서는 카메라가 고스트를 따라가고 대화창은 장면 아래에 원래 크기로 뜹니다.',
               en: 'Scrolling walks the red ghost to the next site; the moment it arrives, that period\'s props (a pipe and five coins, a crowd of ghosts, clouds, a podium, a flag) rise into place. The screen shakes and a number and a big-type dialog window spring from its top and stay beside it (the text writes as you scroll), then fold into the locked sign (?) above. The default is a bright daytime world (1-1); the palette row recolours it (\'by period\' runs 1-1 day → 1-2 underground → sunset → night → 1-4 castle). On a phone the camera follows the ghost and the window appears full-size under the scene.' },
      map: [['손동작', 'Gesture', '스크롤만', 'Scroll only'], ['저절로', 'Automatic', '걷기 · 짓기 · 대화창 · 접기', 'Walk, build, dialog, fold'], ['읽게 되는 곳', 'What you read', '방금 지어진 곳에서 튀어나온 대화창 → 켜진 팻말', 'The dialog from what was just built → the lit sign']],
      hint: { ko: '▶ 그냥 아래로 스크롤하세요.', en: '▶ Just scroll down.' },
      pros: { ko: ['가장 눈이 즐거움 — 내리는 만큼 월드가 자람', '소품 = 이력의 은유라 장식이 아님', '끝 화면 = 왼쪽 → 오른쪽 연표 한 장'], en: ['The most fun to watch — the world grows as you scroll', 'Props are career metaphors, not decoration', 'End screen = one left-to-right timeline'] },
      cons: { ko: ['2026 에 두 시기가 겹쳐 마지막이 몰림', '은유를 팻말이 꼭 받쳐야 함'], en: ['Two periods start in 2026, so the end bunches up', 'The metaphors need their signs'] } }
  ];
  var RULES4 = [
    { h: { ko: '게임 화면처럼 강하게', en: 'A strong game screen' }, b: { ko: '창 이름만 게임 말로 바꾸는 게 아니라 화면 자체가 마리오 시리즈의 한 화면 — 섬 지도(슈퍼 마리오 월드) · 코스 시작 화면(슈퍼 마리오브라더스).', en: 'Not just game words on windows: each screen is a Mario-series screen — the island map (Super Mario World) and the course start (Super Mario Bros.).' } },
    { h: { ko: '이력이 주인공', en: 'The career leads' }, b: { ko: '칸 하나 = 경력 · 프로젝트 하나. 숫자 · 기간 · 퀘스트 결과는 content.js(이력서 · 프로젝트 · 자기소개서) 값 그대로.', en: 'One space = one period or project. Numbers, dates and quest results come straight from content.js.' } },
    { h: { ko: '베끼지 않고 같은 문법으로', en: 'Same grammar, not copied' }, b: { ko: '4px 칸 · 검은 외곽선 · NES 팔레트로 새로 찍음. 캐릭터 · 아이템(버섯 · 별) · 로고는 그리지 않고 1P 는 사이트 고스트.', en: 'Redrawn on the 4px grid with black outlines and the NES palette. No characters, items or logos; 1P is the site ghost.' } },
    { h: { ko: '스크롤만으로 끝까지', en: 'Scroll is the only input' }, b: { ko: '아래로 쭉 펼쳐 놓고 내리며 읽습니다 — 누를 것이 없고, 내리는 만큼 고스트가 걷고 장면이 움직입니다.', en: 'Everything is laid out to scroll and read — nothing to press; the ghost walks and the scenes move as you scroll.' } }
  ];

  var FIT = { w: 0, h: 0 }, CAM_W = 680;
  function fit() {
    /* 휴대폰 주소창이 접히고 펴질 때마다 높이가 바뀌어 스크롤이 튀지 않게 — 폭이 바뀌거나 높이가 크게 바뀔 때만 다시 잼 */
    if (window.innerWidth !== FIT.w || Math.abs(window.innerHeight - FIT.h) > 160) { FIT.w = window.innerWidth; FIT.h = window.innerHeight; }
    var vh = FIT.h;
    Array.prototype.forEach.call(document.querySelectorAll('.mockbox'), function (box) {
      if (box.classList.contains('mockbox--scroll')) {
        var m2 = box.querySelector('.mock'), st2 = box.querySelector('.sstick'), dk = st2.querySelector('.bc-dock'), bw = box.clientWidth, mob = !!dk && bw <= 760, cw = +box.getAttribute('data-camw') || CAM_W;      /* 휴대폰: 장면은 cw 폭만(기본 680) */
        st2.classList.toggle('is-mob', mob); st2.style.setProperty('--camw', cw + 'px');
        var z2 = mob ? Math.min(1, bw / cw) : Math.min(1, bw / 1200, (vh - (window.innerWidth <= 640 ? 24 : 96)) / 750), zz = z2 < 1 ? +z2.toFixed(4) : 1;
        m2.style.zoom = zz < 1 ? zz : '';
        var mh = 750 * zz, dh = 0;
        if (mob) { dh = Math.max(260, Math.round(vh - 16 - mh)); dk.style.height = dh + 'px'; }
        box.style.height = Math.round(mh + dh + (+box.getAttribute('data-len'))) + 'px';
        var sw = st2.clientWidth;
        box.__geo = { z: zz, mob: mob, sw: sw, mh: mh, dock: dh, sh: mh + dh, offX: mob ? 0 : Math.max(0, (sw - 1200 * zz) / 2), camX: 0, camW: cw };
        return;
      }
      var m = box.firstElementChild, z = Math.max(.5, Math.min(1, (box.clientWidth) / 1200));
      m.style.zoom = z < 1 ? z.toFixed(4) : '';
    });
    fitScrubs();
    SCROLLERS.forEach(function (sc) { sc.p = undefined; });
    scrollTick();
  }
  /* 스크롤 시안: 상자가 화면을 지나가는 만큼 = 진행(0 ~ 1) */
  var SCROLLERS = [], stTick = 0;
  function scrollTick() {
    SCROLLERS.forEach(function (sc) {
      if (!sc.box.offsetParent) return;
      var r = sc.box.getBoundingClientRect(), h = sc.stick.getBoundingClientRect().height;
      var st = parseFloat(getComputedStyle(sc.stick).top) || 0, p = Math.max(0, Math.min(1, (st - r.top) / Math.max(1, r.height - h)));
      if (sc.p === undefined || Math.abs(p - sc.p) > 1e-4) { sc.p = p; sc.prog(p); }
    });
    LTICKS.forEach(function (f) { f(); });          /* 목록판 — 보이는 자리만큼 장면 · 길 */
  }
  window.addEventListener('scroll', function () { if (!stTick) stTick = requestAnimationFrame(function () { stTick = 0; scrollTick(); }); }, { passive: true });
  function draftHTML(d) {
    return '<article class="draft" id="story-' + d.id + '"><div class="draft__head"><span class="draft__id">' + esc(d.label || d.id.toUpperCase()) + '</span><h4>' + esc(t(d.name)) + '</h4><small>' + esc(t(d.sub)) + '</small>' + (d.badge ? '<span class="draft__badge">' + esc(t(d.badge)) + '</span>' : '') + '</div>' +
        '<p class="draft__pitch">' + esc(t(d.pitch)) + '</p>' +
        '<dl class="map">' + d.map.map(function (m) { return '<div><dt>' + esc(L === 'en' ? m[1] : m[0]) + '</dt><dd>' + esc(L === 'en' ? m[3] : m[2]) + '</dd></div>'; }).join('') + '</dl>' +
        (d.flow ? '<p class="flow">' + d.flow.map(function (f) { return '<b' + (f === 'story' ? ' class="on"' : '') + '>' + esc(t(FLOW[f])) + '</b>'; }).join(' → ') + '</p>' : '') +
        (d.extra ? d.extra() : '') + (d.plain ? (d.scrub ? scrubHTML(d) : d.f()) : d.scroll ? '<div class="mockbox mockbox--scroll" data-draft="' + d.id + '" data-len="' + d.scroll + '"' + (d.camW ? ' data-camw="' + d.camW + '"' : '') + '><div class="sstick">' + d.f() + '</div></div>' : '<div class="mockbox" data-draft="' + d.id + '">' + d.f() + '</div>') + '<p class="hint">' + esc(t(d.hint)) + '</p>' +
        '<div class="notes"><div><h5>' + T('좋은 점', 'Strengths') + '</h5><ul>' + d.pros[L].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
        '<div><h5>' + T('고려할 점', 'Trade-offs') + '</h5><ul>' + d.cons[L].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div></article>';
  }
  function renderDrafts() {
    document.getElementById('toc').innerHTML = '<a href="#play-part">' + T('전체 흐름 · 플레이', 'Whole flow · play') + '</a>' + DRAFTS4.map(function (d) { return '<a href="#story-' + d.id + '">' + esc(t(d.name).split(' — ')[0]) + '</a>'; }).join('') + '<a href="#older">' + T('지난 안 · 나′ · 다′ · 가 · 라 · S', 'Earlier · 나′ · 다′ · 가 · 라 · S') + '</a><a href="#consoles">' + T('게임기 — 벽돌 휴대기', 'Console — brick handheld') + '</a>';
    document.getElementById('rules').innerHTML = RULES4.map(function (r) { return '<li><b>' + esc(t(r.h)) + '</b>' + esc(t(r.b)) + '</li>'; }).join('');
    document.getElementById('drafts4').innerHTML = DRAFTS4.map(draftHTML).join('');
    document.getElementById('drafts-old').innerHTML = DRAFTS_OLD.map(draftHTML).join('');
    SCROLLERS = []; SCRUBS = []; LTICKS = [];
    DRAFTS4.concat(DRAFTS_OLD).forEach(function (d) {
      if (d.plain) { if (d.wire) d.wire(); return; }
      var box = document.querySelector('.mockbox[data-draft="' + d.id + '"]'), r = d.w(box);
      if (d.scroll && r && r.prog) SCROLLERS.push({ box: box, stick: box.querySelector('.sstick'), prog: r.prog });
    });
    fit();
  }

  /* ── 게임기 그림: 사이트 도트 데이터를 정수 배율로 ──────────────────────── */
  var CONSOLES = [
    { art: 'brick', name: { ko: '벽돌 휴대기', en: 'Brick handheld' }, hero: true, badge: { ko: '고른 안 · 화면을 키우고 부품을 덜어 다시 그림', en: 'Chosen · redrawn with a bigger screen, fewer parts' },
      desc: { ko: '1989년 벽돌 같은 휴대기 — 두툼한 빨강 몸통 · 금색 줄 두른 좁은 검은 화면 테 · 아래 두께 한 단. 화면을 게임기 면적의 약 4할에서 6할로 키우고, 나사 · 스피커 구멍 · 턱 · 카트리지 입구 · 전원등 · 따로 붙은 손잡이 판은 뺐습니다.', en: 'A 1989 brick of a handheld — a chunky red case, a narrow black bezel with a gold pinstripe and one thickness band along the bottom. The screen grew from about 40 % to 60 % of the console, and the screws, speaker slots, chin, cartridge mouth, power lamp and raised grip panels are gone.' } }
  ];
  var PAGES = [{ f: 'index.html', ko: '홈', en: 'Home', main: true }, { f: 'resume.html', ko: '이력서', en: 'Résumé' }, { f: 'projects.html', ko: '프로젝트', en: 'Projects' }];
  function drawArt(cv, d) {
    var box = cv.parentNode.getBoundingClientRect().width || 600, dpr = window.devicePixelRatio || 1;
    var s = Math.max(1, Math.floor(box * dpr / d.w));          /* 칸 하나 = 정수 기기 픽셀 */
    cv.width = d.w * s; cv.height = d.h * s; cv.style.width = (d.w * s / dpr) + 'px'; cv.style.height = (d.h * s / dpr) + 'px';
    var g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
    d.rows.forEach(function (row, y) {
      var x = 0, re = /([.,A-Za-z])(\d*)/g, m;
      while ((m = re.exec(row))) {
        var n = m[2] ? +m[2] : 1, c = m[1];
        if (c !== '.') { g.fillStyle = c === ',' ? 'rgba(6,16,58,.32)' : d.pal[c <= 'Z' ? c.charCodeAt(0) - 65 : c.charCodeAt(0) - 71]; g.fillRect(x * s, y * s, n * s, s); }
        x += n;
      }
    });
  }
  function renderConsoles() {
    var A = window.__ART || {};
    document.getElementById('cgrid').innerHTML = CONSOLES.map(function (c, i) {
      var id = 'pixel-fc-level-' + c.art;
      var links = PAGES.map(function (p) { return '<a href="' + p.f + '?skin=' + id + '"' + (p.main ? ' class="main"' : '') + '>' + esc(L === 'en' ? p.en : p.ko) + (p.main ? ' →' : '') + '</a>'; }).join('');
      var d = A[c.art];
      return '<article class="cart' + (c.hero ? ' cart--hero' : '') + '"><a class="cart__art" href="index.html?skin=' + id + '" aria-label="' + esc(t(c.name)) + '"><canvas data-art="' + c.art + '" role="img" aria-label="' + esc(t(c.name)) + '"></canvas></a>' +
        '<div class="cart__body"><div class="cart__title"><b>' + esc(t(c.name)) + '</b><small>' + esc(id) + (d ? ' · ' + d.pal.length + T('색', ' colours') : '') + '</small>' + (c.badge ? '<span class="badge">' + esc(t(c.badge)) + '</span>' : '') + '</div>' +
        '<p class="cart__desc">' + esc(t(c.desc)) + '</p><div class="links">' + links + '</div></div></article>';
    }).join('');
    Array.prototype.forEach.call(document.querySelectorAll('canvas[data-art]'), function (cv) { var d = A[cv.getAttribute('data-art')]; if (d) drawArt(cv, d); });
  }

  function applyLang() {
    document.documentElement.setAttribute('lang', L);
    var st = document.getElementById('i18n-style') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'i18n-style' }));
    st.textContent = L === 'en' ? '.i18n-ko{display:none}' : '.i18n-en{display:none}';
  }
  function render() { applyLang(); if (PLAY) renderPlay(); else { renderDrafts(); renderConsoles(); } }
  render();
  var older = document.getElementById('older'); if (older) older.addEventListener('toggle', fit);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (PLAY) { pfLayout(); scrollTick(); } else { fit(); renderConsoles(); } }, 150); });
  if (document.querySelector('[data-lang]')) document.querySelector('[data-lang]').addEventListener('click', function () { L = L === 'en' ? 'ko' : 'en'; try { localStorage.setItem('portfolio:lang', L); } catch (e) {} render(); });
  if (document.querySelector('[data-dark]')) document.querySelector('[data-dark]').addEventListener('click', function () {
    var d = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', d); try { localStorage.setItem('portfolio:theme', d); } catch (e) {}
  });
})();
