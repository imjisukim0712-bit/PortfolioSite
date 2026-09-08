/* ============================================================================
   main.js — 페이지 조립과 동작
   · 내용은 assets/content.js  · 화면 구성은 assets/js/render.js
   ========================================================================== */
(function () {
  'use strict';

  var R = window.PortfolioRender;
  var LANG_KEY  = 'portfolio:lang';
  var DRAFT_KEY = 'portfolio:draft';

  document.documentElement.classList.remove('no-js');

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 내용 결정: ?preview=1 이면 편집기 임시 저장본을 사용 ---------- */
  function loadContent() {
    var params = new URLSearchParams(location.search);
    if (params.get('preview') === '1') {
      try {
        var raw = localStorage.getItem(DRAFT_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) { /* 손상된 임시본은 무시하고 원본 사용 */ }
    }
    return window.PORTFOLIO_CONTENT;
  }

  var content = loadContent();
  if (!content || !R) {
    document.body.innerHTML = '<p style="padding:40px;font:16px system-ui">' +
      'content.js 또는 render.js 를 불러오지 못했습니다. 파일 경로를 확인해 주세요.</p>';
    return;
  }

  /* ---------- 언어 ---------- */
  function readLang() {
    try { var v = localStorage.getItem(LANG_KEY); if (v === 'ko' || v === 'en') return v; } catch (e) {}
    return 'ko';
  }
  function saveLang(v) { try { localStorage.setItem(LANG_KEY, v); } catch (e) {} }

  var lang = readLang();
  var page = document.body.getAttribute('data-page') || 'index';
  var base = page === 'detail' ? '../' : '';
  var projectId = new URLSearchParams(location.search).get('p') || '';

  /* ---------- 렌더 ---------- */
  function render() {
    var navEl    = $('[data-slot="nav"]');
    var sheetEl  = $('[data-slot="sheet"]');
    var mainEl   = $('[data-slot="main"]');
    var footerEl = $('[data-slot="footer"]');
    var opts = { detail: page === 'detail', active: page === 'detail' ? 'projects' : null };

    if (navEl)    navEl.innerHTML    = R.navHtml(content, lang, base, opts);
    if (sheetEl)  sheetEl.innerHTML  = R.sheetHtml(content, lang, base, opts);
    if (footerEl) footerEl.innerHTML = R.footerHtml(content, lang, base, opts);
    if (mainEl) {
      mainEl.innerHTML = page === 'detail'
        ? R.renderDetail(content, lang, base, projectId)
        : R.renderIndex(content, lang, base);
    }

    document.documentElement.setAttribute('lang', lang);
    var title = R.t(content.meta.pageTitle, lang);
    if (page === 'detail') {
      var p = (content.projects || []).filter(function (x) { return x.id === projectId; })[0];
      if (p) title = R.t(p.title, lang) + ' · ' + R.t(content.meta.name, lang);
    }
    document.title = title;
    var desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', R.t(content.meta.description, lang));

    initObservers();
  }

  /* ---------- 스크롤 리빌 · 스크롤 스파이 ---------- */
  var revealObserver = null, spyObserver = null;

  function initObservers() {
    if (revealObserver) revealObserver.disconnect();
    if (spyObserver) spyObserver.disconnect();

    var revealables = $$('.reveal');
    if ('IntersectionObserver' in window && revealables.length) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealables.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    }

    var links = $$('[data-spy]');
    var sections = links.map(function (l) { return document.getElementById(l.getAttribute('data-spy')); }).filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
      var ratios = {};
      spyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { ratios[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
        var best = null, top = 0;
        Object.keys(ratios).forEach(function (id) { if (ratios[id] > top) { top = ratios[id]; best = id; } });
        if (best) links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-spy') === best); });
      }, { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.15, 0.4, 0.75, 1] });
      sections.forEach(function (s) { spyObserver.observe(s); });
    }
  }

  /* ---------- 모바일 메뉴 ---------- */
  var sheet = $('[data-menu]');
  var scrollY = 0;

  function setMenu(open) {
    if (!sheet) return;
    sheet.classList.toggle('is-open', open);
    sheet.setAttribute('aria-hidden', String(!open));
    var burger = $('[data-menu-toggle]');
    if (burger) burger.setAttribute('aria-expanded', String(open));
    if (open) {
      scrollY = window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.top = (-scrollY) + 'px';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.classList.add('is-locked');
    } else {
      document.body.classList.remove('is-locked');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }
  }

  /* ---------- 부드러운 스크롤 (Safari 폴백 포함) ---------- */
  var supportsSmooth = 'scrollBehavior' in document.documentElement.style;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateTo(top) {
    var start = window.pageYOffset;
    var delta = top - start;
    var dur = Math.min(700, Math.max(300, Math.abs(delta) * 0.4));
    var t0 = null;
    function step(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / dur);
      var eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, start + delta * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function scrollToTop(top) {
    if (reduced) { window.scrollTo(0, top); }
    else if (supportsSmooth) { window.scrollTo({ top: top, behavior: 'smooth' }); }
    else { animateTo(top); }
  }
  function navOffset() {
    var nav = $('.nav');
    return (nav ? nav.getBoundingClientRect().height : 64) + 24;
  }

  /* ---------- 이벤트 위임 (다시 렌더해도 계속 동작) ---------- */
  document.addEventListener('click', function (e) {
    var langBtn = e.target.closest('[data-lang-btn]');
    if (langBtn) {
      lang = langBtn.getAttribute('data-lang-btn') === 'en' ? 'en' : 'ko';
      saveLang(lang);
      var y = window.pageYOffset;
      render();
      window.scrollTo(0, y);
      return;
    }

    if (e.target.closest('[data-menu-toggle]')) {
      setMenu(!sheet.classList.contains('is-open'));
      return;
    }

    if (e.target.closest('[data-to-top]')) { scrollToTop(0); return; }

    if (sheet && sheet.classList.contains('is-open') && e.target === sheet) { setMenu(false); return; }

    var link = e.target.closest('a[href^="#"]');
    if (link) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      var run = function () {
        var top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - navOffset());
        scrollToTop(top);
        if (history.replaceState) history.replaceState(null, '', id);
      };
      if (sheet && sheet.classList.contains('is-open')) { setMenu(false); setTimeout(run, 60); }
      else { run(); }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet && sheet.classList.contains('is-open')) setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1000 && sheet && sheet.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- 맨 위로 버튼 ---------- */
  var toTop = $('[data-to-top]');
  if (toTop) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        toTop.classList.toggle('is-shown', window.pageYOffset > window.innerHeight * 0.9);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 시작 ---------- */
  render();

  // 편집기 미리보기 배너
  if (new URLSearchParams(location.search).get('preview') === '1') {
    var banner = document.createElement('div');
    banner.className = 'preview-banner';
    banner.innerHTML = '편집기 미리보기 — 저장하지 않은 임시 내용입니다. ' +
      '<a href="' + base + 'edit.html">편집기로 돌아가기</a>';
    document.body.appendChild(banner);
  }

  // 첫 진입 시 해시가 있으면 헤더 높이만큼 보정
  if (location.hash && page !== 'detail') {
    var el = document.getElementById(location.hash.slice(1));
    if (el) setTimeout(function () {
      window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - navOffset()));
    }, 80);
  }
})();
