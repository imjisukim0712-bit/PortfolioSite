/* ============================================================================
   main.js — 페이지 조립과 동작
   내용은 assets/content.js · 화면 구성은 assets/js/render.js
   ========================================================================== */
(function () {
  'use strict';
  var R = window.PortfolioRender;
  var LANG_KEY = 'portfolio:lang', THEME_KEY = 'portfolio:theme', DRAFT_KEY = 'portfolio:draft';

  document.documentElement.classList.remove('no-js');
  var $  = function (s,c){ return (c||document).querySelector(s); };
  var $$ = function (s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };

  /* ---------- 내용 (편집기 미리보기 지원) ---------- */
  function loadContent() {
    var params = new URLSearchParams(location.search);
    if (params.get('preview') === '1') {
      try { var raw = localStorage.getItem(DRAFT_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    }
    return window.PORTFOLIO_CONTENT;
  }
  var content = loadContent();
  if (!content || !R) {
    document.body.innerHTML = '<p style="padding:40px;font:16px system-ui">content.js / render.js 를 불러오지 못했습니다.</p>';
    return;
  }

  var page = document.body.getAttribute('data-page') || 'home';
  var base = page === 'detail' ? '../' : '';
  var lang = readLang();
  var projectId = new URLSearchParams(location.search).get('p') || '';

  function readLang(){ try{ var v=localStorage.getItem(LANG_KEY); if(v==='ko'||v==='en') return v; }catch(e){} return 'ko'; }
  function saveLang(v){ try{ localStorage.setItem(LANG_KEY,v); }catch(e){} }

  /* ---------- 테마 ---------- */
  function currentTheme(){ return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function applyThemeIcon(){
    var span = $('[data-theme-icon]');
    if (!span) return;
    // 다크면 해(밝게 전환), 라이트면 달(어둡게 전환)
    span.innerHTML = currentTheme()==='dark'
      ? '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10" cy="10" r="4"/><path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M16.5 3.5l-1.4 1.4M4.9 15.1l-1.4 1.4" stroke-linecap="round"/></svg>'
      : '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M16 11.5A6.5 6.5 0 0 1 8.5 4a6.5 6.5 0 1 0 7.5 7.5z" stroke-linejoin="round"/></svg>';
  }
  function toggleTheme(){
    var next = currentTheme()==='dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch(e){}
    applyThemeIcon();
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next==='dark' ? '#16121f' : '#fdfcfe');
  }

  /* ---------- 렌더 ---------- */
  function render() {
    var slots = { nav:'[data-slot="nav"]', sheet:'[data-slot="sheet"]', main:'[data-slot="main"]', footer:'[data-slot="footer"]' };
    var navEl = $(slots.nav), sheetEl = $(slots.sheet), mainEl = $(slots.main), footEl = $(slots.footer);
    if (navEl)  navEl.innerHTML  = R.navHtml(content, lang, base, page);
    if (sheetEl) sheetEl.innerHTML = R.sheetHtml(content, lang, base, page);
    if (footEl) footEl.innerHTML = R.footerHtml(content, lang, base);
    if (mainEl) {
      mainEl.innerHTML =
        page==='home'     ? R.renderHome(content, lang, base) :
        page==='resume'   ? R.renderResume(content, lang, base) :
        page==='cover'    ? R.renderCover(content, lang, base) :
        page==='projects' ? R.renderProjects(content, lang, base) :
        page==='detail'   ? R.renderDetail(content, lang, base, projectId) :
        page==='play'     ? R.renderPlay(content, lang, base) : '';
    }
    document.documentElement.setAttribute('lang', lang);
    applyThemeIcon();
    updateTitle();
    initObservers();
    initProjTabs();
    // 언어 바뀌면 이미 뽑아둔 카드도 다시 그림
    if (drawnIds) dealCards(drawnIds);
    if (window.PORTFOLIO_OVERRIDES && window.PORTFOLIO_OVERRIDES.renderBlocks) window.PORTFOLIO_OVERRIDES.renderBlocks(page, lang);
  }

  function updateTitle() {
    var name = R.t(content.meta.name, lang);
    var map = {
      home:   R.t(content.meta.role, lang) + ' 포트폴리오',
      resume: R.t(content.nav.resume, lang),
      cover:  R.t(content.nav.cover, lang),
      projects: R.t(content.nav.projects, lang),
      play:   R.t(content.nav.play, lang)
    };
    var title;
    if (page==='detail') {
      var items = (content.projects && content.projects.items) || [];
      var p = items.filter(function(x){return x.id===projectId;})[0];
      title = (p ? R.t(p.title, lang) : R.t(content.nav.projects, lang)) + ' · ' + name;
    } else {
      title = name + ' · ' + (map[page] || '');
    }
    document.title = title;
  }

  /* ---------- 접이식 헤더 ---------- */
  function initHeader() {
    // 헤더는 항상 펼쳐진 상태 — 접힘 동작 제거.
    var handle = $('[data-nav-handle]');
    if (handle) handle.remove();
  }

  /* ---------- 카드 뽑기 ---------- */
  var drawnIds = null, drawResize = null, drawResizeBound = false;
  function pickRandom(n) {
    var items = (content.projects && content.projects.items) || [];
    var pool = items.slice();
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random()*(i+1)); var t=pool[i]; pool[i]=pool[j]; pool[j]=t; }
    return pool.slice(0, Math.min(n, pool.length)).map(function(p){ return p.id; });
  }
  function dealCards(ids) {
    var box = $('[data-draw-cards]');
    if (!box) return;
    var items = (content.projects && content.projects.items) || [];
    var byId = {}; items.forEach(function(p){ byId[p.id]=p; });
    var cards = ids.map(function(id){ return byId[id]; }).filter(Boolean);
    if (!cards.length) {
      box.innerHTML = '<div class="draw__empty">' + (lang==='en'?'Add projects in the editor to draw them here.':'편집기에서 프로젝트를 추가하면 여기에 나옵니다.') + '</div>';
      return;
    }
    /* 덱에서 한 장씩 뒷면으로 날아온 뒤, 순서대로 뒤집히는 연출.
       카드가 덱 자리에서 출발하도록 두 위치의 차이를 재서 --dx/--dy 로 넘긴다. */
    box.classList.remove('is-dealing');
    box.innerHTML = cards.map(function(p, i){ return R.drawCardHtml(content, lang, base, p, i); }).join('');
    var deckEl = $('[data-draw]');
    if (deckEl) {
      $$('.draw-card', box).forEach(function (el, i) {
        el.style.setProperty('--dx', (deckEl.offsetLeft - el.offsetLeft) + 'px');
        el.style.setProperty('--dy', (deckEl.offsetTop - el.offsetTop) + 'px');
        el.style.setProperty('--dr', (-10 + (i % 3) * 5) + 'deg');
      });
    }
    void box.offsetWidth;              // 리플로우 후에 애니메이션 시작
    box.classList.add('is-dealing');
  }
  // 화면 폭에 맞춰 한 줄에 들어갈 카드 수 (덱 + N장). CSS 그리드 열 수와 동일한 분기.
  function fitCount(max) {
    var w = window.innerWidth || document.documentElement.clientWidth;
    var n = w >= 980 ? 4 : w >= 690 ? 3 : w >= 470 ? 2 : 1;
    return Math.max(1, Math.min(max, n));
  }
  function initDraw() {
    var deck = $('[data-draw]');
    if (!deck) return;
    var cfg = (content.home && content.home.draw) || {};
    var max = cfg.count || 4;
    var shown = -1;
    function render() {
      shown = fitCount(max);
      dealCards(drawnIds.slice(0, shown));
    }
    // 첫 화면에서 한 벌이 이미 펼쳐져 있도록 자동으로 한 번 뽑아 둔다
    if (!drawnIds) drawnIds = pickRandom(max);
    render();
    deck.addEventListener('click', function () {
      deck.classList.remove('is-draw');
      void deck.offsetWidth;          // 리플로우로 애니메이션 재시작
      deck.classList.add('is-draw');
      drawnIds = pickRandom(max);
      render();
    });
    // 폭이 바뀌어 들어갈 장수가 달라질 때만 다시 그린다 (뽑은 결과는 유지)
    drawResize = function () { if (fitCount(max) !== shown) render(); };
    if (!drawResizeBound) {
      drawResizeBound = true;
      var t = null;
      window.addEventListener('resize', function () {
        clearTimeout(t);
        t = setTimeout(function () { if (drawResize) drawResize(); }, 150);
      });
    }
  }

  /* ---------- 프로젝트 탭 ---------- */
  function initProjTabs() {
    var tabs = $$('[data-proj-tab]');
    if (!tabs.length) return;
    var grid = $('[data-proj-grid]'), empty = $('[data-proj-empty]');
    function apply(cat) {
      var shown = 0;
      $$('.proj-card', grid).forEach(function (card) {
        var ok = cat==='all' || card.getAttribute('data-cat')===cat;
        card.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    }
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function(t){ t.classList.toggle('is-active', t===tab); });
        apply(tab.getAttribute('data-proj-tab'));
      });
    });
  }

  /* ---------- 관찰자 (리빌) ---------- */
  var revObs = null;
  function initObservers() {
    if (revObs) revObs.disconnect();
    var els = $$('.reveal');
    if ('IntersectionObserver' in window && els.length) {
      revObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); revObs.unobserve(e.target); } });
      }, { rootMargin:'0px 0px -8% 0px', threshold:0.08 });
      els.forEach(function (el){ revObs.observe(el); });
    } else { els.forEach(function (el){ el.classList.add('is-visible'); }); }
  }

  /* ---------- 모바일 메뉴 ---------- */
  var sheet = null, scrollY = 0;
  function setMenu(open) {
    sheet = sheet || $('[data-menu]');
    if (!sheet) return;
    sheet.classList.toggle('is-open', open);
    sheet.setAttribute('aria-hidden', String(!open));
    var burger = $('[data-menu-toggle]');
    if (burger) burger.setAttribute('aria-expanded', String(open));
    if (open) {
      scrollY = window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.top = (-scrollY)+'px'; document.body.style.position='fixed'; document.body.style.width='100%';
      document.body.classList.add('is-locked');
    } else {
      document.body.classList.remove('is-locked');
      document.body.style.position=''; document.body.style.top=''; document.body.style.width='';
      window.scrollTo(0, scrollY);
    }
  }

  /* ---------- 부드러운 스크롤 폴백 ---------- */
  var supportsSmooth = 'scrollBehavior' in document.documentElement.style;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animateTo(top) {
    var start = window.pageYOffset, delta = top - start, dur = Math.min(700, Math.max(300, Math.abs(delta)*0.4)), t0 = null;
    function step(now){ if(t0===null)t0=now; var p=Math.min(1,(now-t0)/dur); var e=p<0.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2; window.scrollTo(0,start+delta*e); if(p<1)requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  function scrollToTop(top){ if(reduced)window.scrollTo(0,top); else if(supportsSmooth)window.scrollTo({top:top,behavior:'smooth'}); else animateTo(top); }
  function navOffset(){ var n=$('.nav'); return (n?n.getBoundingClientRect().height:60)+24; }

  /* ---------- 이벤트 위임 ---------- */
  /* '한 마디 더' — 말풍선 문장을 다음으로 넘깁니다 (다시 그리지 않고 글자만 바꿈) */
  function cycleQuip(dir) {   /* dir: 1 = 다음(기본), -1 = 이전 */
    var el = $('[data-quip]'); if (!el) return;
    var qs = (content.home && content.home.quips || []).map(function (q, i) { return { q: q, i: i }; })
      .filter(function (o) { var v = o.q && (typeof o.q === 'string' ? o.q : (o.q[lang] || o.q.ko)); return !!(v && String(v).trim()); });
    if (qs.length < 2) return;
    R.quip.i = (R.quip.i + (dir === -1 ? -1 : 1) + qs.length) % qs.length;
    var cur = qs[R.quip.i], v = typeof cur.q === 'string' ? cur.q : (cur.q[lang] || cur.q.ko);
    var span = document.createElement('span'); span.setAttribute('data-e', 'home.quips.' + cur.i); span.textContent = v;
    el.innerHTML = ''; el.appendChild(span);
    el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop');
    // 사진 카드도 한 번씩 자세를 바꿉니다 (기울기·높이) — 기본 CSS 의 --pose-d / --pose-y
    var card = $('.hero__portrait');
    if (card) { var poses = [[-5, 0], [3, -6], [1.5, -2]], pz = poses[R.quip.i % poses.length]; card.style.setProperty('--pose-d', pz[0] + 'deg'); card.style.setProperty('--pose-y', pz[1] + 'px'); }
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-quip-more]')) { cycleQuip(); return; }
    var langBtn = e.target.closest('[data-lang-btn]');
    if (langBtn) { lang = langBtn.getAttribute('data-lang-btn')==='en'?'en':'ko'; saveLang(lang); var y=window.pageYOffset; render(); window.scrollTo(0,y); return; }
    if (e.target.closest('[data-theme-toggle]')) { toggleTheme(); return; }
    if (e.target.closest('[data-menu-toggle]')) { sheet = sheet || $('[data-menu]'); setMenu(!sheet.classList.contains('is-open')); return; }
    if (e.target.closest('[data-to-top]')) { scrollToTop(0); return; }
    sheet = sheet || $('[data-menu]');
    if (sheet && sheet.classList.contains('is-open') && e.target === sheet) { setMenu(false); return; }
    var link = e.target.closest('a[href^="#"]');
    if (link) {
      var id = link.getAttribute('href'); if (!id || id==='#') return;
      var target = document.getElementById(id.slice(1)); if (!target) return;
      e.preventDefault();
      var run = function(){ var top=Math.max(0, target.getBoundingClientRect().top+window.pageYOffset-navOffset()); scrollToTop(top); if(history.replaceState)history.replaceState(null,'',id); };
      if (sheet && sheet.classList.contains('is-open')) { setMenu(false); setTimeout(run,60); } else run();
    }
  });
  document.addEventListener('keydown', function (e){ if(e.key==='Escape'){ sheet=sheet||$('[data-menu]'); if(sheet&&sheet.classList.contains('is-open'))setMenu(false); } });
  window.addEventListener('resize', function (){ sheet=sheet||$('[data-menu]'); if(window.innerWidth>=1000&&sheet&&sheet.classList.contains('is-open'))setMenu(false); });

  /* ---------- 맨 위로 ---------- */
  function initToTop() {
    var btn = $('[data-to-top]'); if (!btn) return;
    var ticking = false;
    var onScroll = function(){ if(ticking)return; ticking=true; requestAnimationFrame(function(){ btn.classList.toggle('is-shown', window.pageYOffset>window.innerHeight*0.9); ticking=false; }); };
    window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  }

  /* ---------- 시작 ---------- */
  render();
  initHeader();
  initDraw();
  initToTop();
  initTilt();

  /* ---------- 카드 기울기 + 빛 반사 ----------
     커서를 올리면 그 방향으로 살짝 기울고, 테두리의 금속·홀로그램 반사와
     표면의 하이라이트가 커서를 따라 움직입니다. (한 번만 등록 · 다시 그려도 유지) */
  function initTilt() {
    if (initTilt.done) return; initTilt.done = true;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (new URLSearchParams(location.search).get('ve') === '1') return;   /* 시각 편집기 안에서는 끔 */
    var cur = null, box = null, raf = 0, pend = null;
    function reset() {
      if (cur) {
        cur.classList.remove('is-tilt');
        cur.style.removeProperty('--rx'); cur.style.removeProperty('--ry');
        cur.style.removeProperty('--px'); cur.style.removeProperty('--py');
        cur.style.removeProperty('--sx'); cur.style.removeProperty('--sy');
      }
      cur = null; box = null;
    }
    function apply() {
      raf = 0;
      if (!pend || !cur || !box) return;
      var x = (pend.x - box.left) / box.width, y = (pend.y - box.top) / box.height;
      x = x < 0 ? 0 : x > 1 ? 1 : x;
      y = y < 0 ? 0 : y > 1 ? 1 : y;
      cur.style.setProperty('--ry', ((x - .5) * 20).toFixed(2) + 'deg');
      cur.style.setProperty('--rx', ((.5 - y) * 15).toFixed(2) + 'deg');
      cur.style.setProperty('--px', (x * 100).toFixed(1) + '%');
      cur.style.setProperty('--py', (y * 100).toFixed(1) + '%');
      cur.style.setProperty('--sx', ((.5 - x) * 26).toFixed(1) + 'px');
      cur.style.setProperty('--sy', ((.5 - y) * 20 + 16).toFixed(1) + 'px');
    }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      /* 기울어진 카드 위에서는 히트 판정이 흔들리므로, 들어올 때 잰 사각형을 계속 씁니다. */
      if (cur && box &&
          e.clientX >= box.left && e.clientX <= box.right &&
          e.clientY >= box.top  && e.clientY <= box.bottom) {
        pend = { x: e.clientX, y: e.clientY };
        if (!raf) raf = requestAnimationFrame(apply);
        return;
      }
      var host = e.target.closest ? e.target.closest('.draw-card, .gcard') : null;
      var el = host ? (host.classList.contains('gcard') ? host : host.querySelector('.gcard')) : null;
      if (el !== cur) reset();
      if (!el) return;
      cur = el; box = host.getBoundingClientRect();
      cur.classList.add('is-tilt');
      pend = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', reset, { passive: true });
    window.addEventListener('resize', reset);
  }

  /* ---------- 시각 편집기(edit.html) 연동 훅 ---------- */
  window.PortfolioApp = {
    page: page,
    getLang: function () { return lang; },
    setLang: function (v) { lang = (v === 'en' ? 'en' : 'ko'); saveLang(lang); },
    setTheme: function (v) {
      document.documentElement.setAttribute('data-theme', v === 'dark' ? 'dark' : 'light');
      applyThemeIcon();
    },
    setContent: function (next) { if (next) content = next; },
    cycleQuip: cycleQuip,   /* 테마 스크립트가 '한마디'를 넘길 때 (예: 패미컴 SELECT ◀ ▶) */
    rerender: function () { render(); initHeader(); initDraw(); initToTop(); initTilt(); }
  };

  if (new URLSearchParams(location.search).get('preview')==='1') {
    var b = document.createElement('div'); b.className='preview-banner';
    b.innerHTML = (lang==='en'?'Editor preview — unsaved. ':'편집기 미리보기 — 저장 안 됨. ') + '<a href="'+base+'edit.html">'+(lang==='en'?'Back to editor':'편집기로')+'</a>';
    document.body.appendChild(b);
  }
})();
