/* ============================================================================
   themes.js — 디자인 테마(스킨) 목록 + 로더
   ----------------------------------------------------------------------------
   · 기본 디자인(style.css) 위에 assets/css/themes/<테마>.css + <테마>-<시안>.css 를 덧입힙니다.
   · 시안 고르기 :  ?skin=pixel-gameboy  (주소에 붙이면 그 뒤로 모든 페이지에 유지)
                    ?skin=default        (기본 디자인으로 되돌리기)
   · 확정하기   :  아래 DEFAULT_SKIN 에 시안 id 를 적으면 방문자 모두에게 그 디자인이 보입니다.
   · 전체 시안 목록 : themes.html
   이 파일은 <head> 에서 style.css 바로 다음에 읽습니다 (깜빡임 없이 덧입히기 위해).
   ========================================================================== */
(function () {
  'use strict';

  /* ── 확정한 시안 (예: 'pixel-famicom'). 비우면 기본 디자인 ───────────────── */
  var DEFAULT_SKIN = 'pixel-famicom';

  var G = 'https://fonts.googleapis.com/css2?display=swap&family=';

  /* ── 테마 4종 · 시안 7개 ─────────────────────────────────────────────── */
  var THEMES = [
    {
      id: 'pixel',
      name: { ko: '레트로 픽셀 아케이드', en: 'Retro Pixel Arcade' },
      desc: { ko: '도트 글꼴 · 각진 테두리 · 딱딱한 그림자. 8비트 게임기 화면의 어법.',
              en: 'Pixel fonts, hard edges and blunt shadows — the language of an 8-bit screen.' },
      fonts: ['https://cdn.jsdelivr.net/npm/galmuri@latest/dist/galmuri.css',
              G + 'Press+Start+2P&family=Noto+Sans+KR:wght@400;500;700;900'],
      scripts: ['js/themes/famicom.js'],   /* 홈·이력서 상단을 휴대용 게임기로 (손잡이 버튼 + 카트리지 꽂기 연출) */
      variants: [
        { id: 'famicom', name: { ko: '패미컴', en: 'Famicom' },
          desc: { ko: '첫 화면이 휴대용 게임기 한 대. 자주색 손잡이의 SELECT ◀ ▶ 로 한마디를 넘기고 A 로 카드를 뽑습니다. 프로젝트 카드는 카트리지 — 누르면 슬롯에 꽂히고 액정에 개요가 뜹니다.',
                  en: 'The first screen is a handheld console: flip through the quips with SELECT ◀ ▶ on the burgundy grips and draw cards with A. Project cards are cartridges — press one and it slides into the slot, then its overview lights up the screen.' },
          swatch: ['#efe6d2', '#b8252b', '#2b2b2b', '#e9b64a'] }
      ]
    },
    {
      id: 'brutal',
      name: { ko: '네오 브루탈리즘', en: 'Neo-Brutalism' },
      desc: { ko: '두꺼운 테두리 · 딱딱한 그림자 · 거대한 제목. 직설적인 판.',
              en: 'Thick borders, hard shadows and huge type — blunt by design.' },
      fonts: [G + 'Black+Han+Sans&family=IBM+Plex+Sans+KR:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600&family=Archivo+Black'],
      variants: [
        { id: 'cyberpunk', name: { ko: '게임 사이버펑크', en: 'Game Cyberpunk' },
          desc: { ko: '검정 + 애시드 옐로 · 색수차로 어긋난 제목 · 위험 표시 사선 · 모서리를 깎은 칩.',
                  en: 'Black and acid yellow, chromatic-split headings, hazard stripes and chipped-corner tags.' },
          swatch: ['#08080a', '#f6ff3c', '#00e5ff', '#ff2e7e'] },
        { id: 'newsprint', name: { ko: '뉴스프린트', en: 'Newsprint' },
          desc: { ko: '신문지 회백 · 1면 배너 헤드라인 · 반전 빨강 kicker · 드롭캡 · 제호 띠.',
                  en: 'Newsprint grey with a front-page banner headline, an inverted red kicker, a drop cap and a folio line.' },
          swatch: ['#ecebe4', '#1a1a1a', '#c8102e', '#5b5b5b'] }
      ]
    },
    {
      id: 'brand',
      name: { ko: '브랜드 홈페이지', en: 'Brand Homepage' },
      desc: { ko: '세계적인 회사들이 제품을 무대에 올리는 방식. 넓은 여백 · 큰 타이포 · 테두리 대신 그림자로 뜬 판 · 알약 버튼.',
              en: 'How great companies stage a product: generous space, big type, panels lifted by shadow instead of borders, pill buttons.' },
      fonts: [G + 'Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600'],
      variants: [
        { id: 'keynote', name: { ko: '키노트', en: 'Keynote' },
          desc: { ko: '무채색만. 히어로를 화면 한가운데 세우고 제목을 화면 폭까지 키웁니다 — 발표 슬라이드 첫 장.',
                  en: 'Greyscale only: the hero stands centre stage and the headline runs the width of the screen, like the opening slide of a keynote.' },
          swatch: ['#ffffff', '#f5f5f7', '#1d1d1f', '#0071e3'] },
      ]
    },
    {
      id: 'concept',
      name: { ko: '컨셉 무대', en: 'Concept Sets' },
      desc: { ko: '사이트 전체를 하나의 물건으로 바꿔 놓는 시안들. 게임 기획서 · 라이브 패치 노트 · 보드게임 테이블.',
              en: 'Drafts that turn the whole site into a single object: a game design document, live patch notes, a board-game table.' },
      fonts: [G + 'Noto+Sans+KR:wght@400;500;700;800;900'],
      variants: [
        { id: 'spec', name: { ko: '명세서', en: 'Spec Sheet' },
          desc: { ko: '사이트가 한 권의 게임 기획서. 종이 한 장 위에 번호 매긴 절, 개정 표, 빨간 펜 교정, 체크박스. 카드 뽑기는 부록 A.',
                  en: 'The site as a game design document: numbered sections on a sheet of paper, a revision table, red-pen marks and checkboxes. The card draw is Appendix A.' },
          fonts: [G + 'IBM+Plex+Sans+KR:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600'],
          swatch: ['#fdfcf9', '#1f2328', '#c8102e', '#fff3a3'] },
        { id: 'patch', name: { ko: '패치 노트', en: 'Patch Notes' },
          desc: { ko: '라이브 게임의 패치 노트. LIVE 표시등, 버전 칩, NEW·BUFF·FIX 태그, 경력은 변경 이력으로. 카드 뽑기는 이번 시즌 픽업 배너.',
                  en: 'Patch notes for a live game: a LIVE indicator, version chips, NEW / BUFF / FIX tags, a career written as a changelog. The card draw becomes this season\'s pick-up banner.' },
          fonts: [G + 'Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700'],
          swatch: ['#0f1115', '#5cf2a4', '#ffab40', '#171a20'] },
        { id: 'tabletop', name: { ko: '보드게임 테이블', en: 'Tabletop' },
          desc: { ko: '보드게임 밤. 남색 펠트 테이블 위에 크라프트 상자 뚜껑, 두꺼운 종이 카드, 나무 토큰. 덱을 누르면 진짜 카드처럼 펼쳐집니다.',
                  en: 'Board-game night: a kraft box lid on a navy felt table, thick cardboard cards and wooden tokens. Press the deck and the cards fan out like the real thing.' },
          fonts: [G + 'Outfit:wght@500;600;700;800'],
          swatch: ['#1e2a4a', '#d9c3a0', '#fbf3e3', '#8a5a34'] }
      ]
    }
  ];

  var KEY = 'portfolio:skin';
  function load() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function save(v) { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) {} }
  function find(id) {
    if (!id) return null;
    for (var i = 0; i < THEMES.length; i++) {
      var th = THEMES[i];
      for (var j = 0; j < th.variants.length; j++) {
        if (th.id + '-' + th.variants[j].id === id) return { theme: th, variant: th.variants[j], id: id };
      }
    }
    return null;
  }

  /* 이 스크립트 위치 → assets/css/themes/ 경로 (index.html 과 projects/detail.html 모두) */
  var me = document.currentScript || (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var src = (me && me.getAttribute('src')) || 'assets/js/themes.js';
  var ASSETS = src.replace(/js\/themes\.js.*$/, '');          /* 'assets/' 또는 '../assets/' */
  var ROOT = ASSETS.replace(/assets\/$/, '');                 /* '' 또는 '../' */

  var params = new URLSearchParams(location.search);
  var q = params.get('skin');
  var inFrame = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var isEditor = params.get('ve') === '1';
  var previewing = false;   /* 시안을 '둘러보는 중'인지 (스위처 표시 여부) */
  var current = '';

  if (q !== null) {
    current = (q === 'default' || q === '') ? '' : q;
    if (!inFrame) save(current);
    previewing = true;
  } else {
    var saved = load();
    if (saved) { current = saved; previewing = true; }
    else current = DEFAULT_SKIN;
  }
  var hit = find(current);
  if (current && !hit) { current = ''; if (!inFrame) save(''); }

  function hrefs(sel) {
    if (!sel) return { css: [], fonts: [], js: [] };
    var css = [ASSETS + 'css/themes/' + sel.theme.id + '.css', ASSETS + 'css/themes/' + sel.theme.id + '-' + sel.variant.id + '.css'];
    var fonts = (sel.theme.fonts || []).concat(sel.variant.fonts || []);
    var js = (sel.theme.scripts || []).map(function (f) { return ASSETS + f; });   /* 홈 구성을 바꾸는 테마의 스크립트 */
    return { css: css, fonts: fonts, js: js };
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  /* ── 초기 적용: 파싱 중이면 document.write 로 렌더 차단 링크(깜빡임 방지) ── */
  function writeLinks(sel) {
    var h = hrefs(sel), html = '';
    h.fonts.forEach(function (u, i) { html += '<link rel="stylesheet" href="' + esc(u) + '" data-skin-font="' + i + '">'; });
    h.css.forEach(function (u, i) { html += '<link rel="stylesheet" href="' + esc(u) + '" data-skin-css="' + i + '">'; });
    if (document.readyState === 'loading' && typeof document.write === 'function') {
      h.js.forEach(function (u, i) { html += '<script src="' + esc(u) + '" charset="utf-8" data-skin-js="' + i + '"><\/script>'; });
      document.write(html);
    } else {
      var tmp = document.createElement('div'); tmp.innerHTML = html;
      while (tmp.firstChild) document.head.appendChild(tmp.firstChild);
      /* 실행 중 교체: 스크립트는 innerHTML 로 실행되지 않으므로 직접 만들어 붙이고, 다 읽히면 화면을 다시 그립니다 */
      var pending = h.js.filter(function (u) { return !document.querySelector('script[data-skin-js][src="' + u + '"]'); });
      var left = pending.length;
      var done = function () { if (--left <= 0 && window.PortfolioApp && window.PortfolioApp.rerender) window.PortfolioApp.rerender(); };
      if (!left) { if (window.PortfolioApp && window.PortfolioApp.rerender) window.PortfolioApp.rerender(); }
      pending.forEach(function (u) { var sc = document.createElement('script'); sc.src = u; sc.charset = 'utf-8'; sc.setAttribute('data-skin-js', '1'); sc.onload = done; sc.onerror = done; document.head.appendChild(sc); });
    }
  }
  function mark(sel) {
    var root = document.documentElement;
    if (sel) { root.setAttribute('data-skin', sel.id); root.setAttribute('data-skin-theme', sel.theme.id); }
    else { root.removeAttribute('data-skin'); root.removeAttribute('data-skin-theme'); }
  }
  if (hit) { mark(hit); writeLinks(hit); }

  /* ── 실행 중 교체 (스위처·갤러리에서 사용) ───────────────────────────── */
  function apply(id, persist) {
    var sel = find(id);
    Array.prototype.forEach.call(document.querySelectorAll('link[data-skin-css],link[data-skin-font]'), function (l) { l.parentNode.removeChild(l); });
    mark(sel);
    if (sel) writeLinks(sel); else if (window.PortfolioApp && window.PortfolioApp.rerender) window.PortfolioApp.rerender();
    current = sel ? sel.id : '';
    if (persist !== false && !inFrame) save(current);
    var u = new URL(location.href); u.searchParams.set('skin', current || 'default');
    if (history.replaceState) history.replaceState(null, '', u.toString());
    updateSwitcher();
  }

  /* ── 떠 있는 시안 스위처 (둘러보는 중일 때만) ───────────────────────── */
  var sw = null;
  function lang() { try { return localStorage.getItem('portfolio:lang') === 'en' ? 'en' : 'ko'; } catch (e) { return 'ko'; } }
  function T(f) { var L = lang(); return (f && (f[L] || f.ko)) || ''; }
  function updateSwitcher() {
    if (!sw) return;
    var sel = find(current), L = lang();
    sw.querySelector('.pf-sw__cur').textContent = sel ? (T(sel.theme.name) + ' · ' + T(sel.variant.name)) : (L === 'en' ? 'Original design' : '기본 디자인');
    Array.prototype.forEach.call(sw.querySelectorAll('[data-sw-pick]'), function (b) {
      b.setAttribute('aria-pressed', String((b.getAttribute('data-sw-pick') || '') === current));
    });
  }
  function buildSwitcher() {
    if (sw || inFrame || isEditor || !previewing) return;
    var L = lang();
    var css =
      '.pf-sw{position:fixed;left:max(16px,env(safe-area-inset-left,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 16px);z-index:150;font:13px/1.35 system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;letter-spacing:0;color:#f4f4f2}' +
      '.pf-sw__btn{display:inline-flex;align-items:center;gap:8px;max-width:calc(100vw - 32px);padding:9px 14px 9px 10px;border:0;border-radius:999px;background:#17171a;color:#f4f4f2;box-shadow:0 8px 24px rgba(0,0,0,.35);cursor:pointer;font:inherit}' +
      '.pf-sw__btn:hover{background:#26262b}.pf-sw__dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#ff6fa8,#ffd93d,#5ed6c0,#a78bfa);flex:none}' +
      '.pf-sw__cur{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pf-sw__lbl{opacity:.6}' +
      '.pf-sw__panel{position:absolute;left:0;bottom:calc(100% + 10px);width:min(320px,calc(100vw - 32px));max-height:min(70vh,560px);overflow:auto;padding:10px;border-radius:14px;background:#17171a;box-shadow:0 16px 40px rgba(0,0,0,.45);display:none}' +
      '.pf-sw.is-open .pf-sw__panel{display:block}' +
      '.pf-sw__th{margin:8px 6px 4px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#9a9aa3}' +
      '.pf-sw__pick{display:flex;align-items:center;gap:9px;width:100%;padding:8px 8px;border:0;border-radius:9px;background:none;color:#f4f4f2;font:inherit;text-align:left;cursor:pointer}' +
      '.pf-sw__pick:hover{background:#26262b}.pf-sw__pick[aria-pressed="true"]{background:#3a3a44}' +
      '.pf-sw__sw{display:inline-grid;grid-template-columns:repeat(4,1fr);width:36px;height:14px;border-radius:4px;overflow:hidden;flex:none;border:1px solid rgba(255,255,255,.15)}' +
      '.pf-sw__sw i{display:block}' +
      '.pf-sw__foot{display:flex;gap:6px;margin:10px 4px 2px}.pf-sw__foot a{flex:1;padding:8px 10px;border-radius:9px;background:#26262b;color:#f4f4f2;text-align:center;text-decoration:none;font-size:12px}.pf-sw__foot a:hover{background:#34343c}' +
      '@media print{.pf-sw{display:none}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    sw = document.createElement('div'); sw.className = 'pf-sw';
    var items = '<button type="button" class="pf-sw__pick" data-sw-pick=""><span class="pf-sw__sw" style="background:#f0eee6"><i style="background:#f0eee6"></i><i style="background:#344b40"></i><i style="background:#c15f3c"></i><i style="background:#262625"></i></span><span>' + (L === 'en' ? 'Original design' : '기본 디자인 (현재)') + '</span></button>';
    THEMES.forEach(function (th) {
      items += '<div class="pf-sw__th">' + esc(T(th.name)) + '</div>';
      th.variants.forEach(function (v) {
        items += '<button type="button" class="pf-sw__pick" data-sw-pick="' + th.id + '-' + v.id + '"><span class="pf-sw__sw">' +
          v.swatch.map(function (c) { return '<i style="background:' + esc(c) + '"></i>'; }).join('') + '</span><span>' + esc(T(v.name)) + '</span></button>';
      });
    });
    sw.innerHTML =
      '<button type="button" class="pf-sw__btn" aria-expanded="false"><span class="pf-sw__dot"></span><span class="pf-sw__lbl">' + (L === 'en' ? 'Theme' : '테마 시안') + '</span><span class="pf-sw__cur"></span></button>' +
      '<div class="pf-sw__panel">' + items +
      '<div class="pf-sw__foot"><a href="' + ROOT + 'themes.html">' + (L === 'en' ? 'All themes →' : '전체 시안 갤러리 →') + '</a></div></div>';
    document.body.appendChild(sw);
    var btn = sw.querySelector('.pf-sw__btn');
    btn.addEventListener('click', function () { var open = !sw.classList.contains('is-open'); sw.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); });
    sw.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sw-pick]'); if (!b) return;
      apply(b.getAttribute('data-sw-pick') || '');
    });
    document.addEventListener('click', function (e) { if (sw.classList.contains('is-open') && !sw.contains(e.target)) { sw.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
    updateSwitcher();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildSwitcher);
  else buildSwitcher();

  window.PORTFOLIO_THEMES = THEMES;
  window.PortfolioSkin = { current: function () { return current; }, apply: apply, find: find, list: THEMES, assets: ASSETS };
})();
