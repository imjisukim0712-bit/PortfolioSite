/* ==========================================================================
   김지수 · 게임 기획자 포트폴리오 — main.js
   - 한/영 전환 (localStorage 유지)
   - 모바일 메뉴 시트
   - 스크롤 스파이 / 스크롤 리빌 / 맨 위로
   - iOS Safari 대응: smooth scroll 폴백, 시트 오픈 시 배경 스크롤 잠금
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ----------------------------------------------------------------------
     1. 언어 전환 (KO / EN)
     ---------------------------------------------------------------------- */
  var STORAGE_KEY = 'jisu-portfolio-lang';
  var langButtons = $$('[data-lang-btn]');
  var currentLang = 'ko';

  function readStoredLang() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function storeLang(lang) {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* Safari 시크릿 모드 */ }
  }

  // 최초 1회: 마크업에 들어있는 한국어 원본을 data-ko / data-ko-html 로 보관
  function cacheKorean() {
    $$('[data-en]').forEach(function (el) {
      if (!el.hasAttribute('data-ko')) { el.setAttribute('data-ko', el.textContent); }
    });
    $$('[data-en-html]').forEach(function (el) {
      if (!el.hasAttribute('data-ko-html')) { el.setAttribute('data-ko-html', el.innerHTML); }
    });
    $$('[data-en-aria]').forEach(function (el) {
      if (!el.hasAttribute('data-ko-aria')) { el.setAttribute('data-ko-aria', el.getAttribute('aria-label') || ''); }
    });
  }

  function applyLang(lang) {
    currentLang = lang === 'en' ? 'en' : 'ko';

    $$('[data-en]').forEach(function (el) {
      var next = currentLang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-ko');
      if (next !== null) { el.textContent = next; }
    });
    $$('[data-en-html]').forEach(function (el) {
      var next = currentLang === 'en' ? el.getAttribute('data-en-html') : el.getAttribute('data-ko-html');
      if (next !== null) { el.innerHTML = next; }
    });
    $$('[data-en-aria]').forEach(function (el) {
      var next = currentLang === 'en' ? el.getAttribute('data-en-aria') : el.getAttribute('data-ko-aria');
      if (next) { el.setAttribute('aria-label', next); }
    });

    document.documentElement.setAttribute('lang', currentLang === 'en' ? 'en' : 'ko');
    langButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang-btn') === currentLang));
    });
    storeLang(currentLang);
  }

  cacheKorean();
  langButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { applyLang(btn.getAttribute('data-lang-btn')); });
  });

  var stored = readStoredLang();
  if (stored === 'en' || stored === 'ko') {
    applyLang(stored);
  } else {
    applyLang('ko');
  }

  /* ----------------------------------------------------------------------
     2. 모바일 메뉴 시트
     ---------------------------------------------------------------------- */
  var burger = $('[data-menu-toggle]');
  var sheet  = $('[data-menu]');
  var scrollY = 0;

  function lockScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
    document.body.style.top = (-scrollY) + 'px';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.classList.add('is-locked');
  }
  function unlockScroll() {
    document.body.classList.remove('is-locked');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
  }

  function setMenu(open) {
    if (!sheet || !burger) { return; }
    sheet.classList.toggle('is-open', open);
    sheet.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    if (open) { lockScroll(); } else { unlockScroll(); }
  }

  if (burger && sheet) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    sheet.addEventListener('click', function (e) {
      if (e.target === sheet || e.target.closest('a')) { setMenu(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('is-open')) { setMenu(false); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1000 && sheet.classList.contains('is-open')) { setMenu(false); }
    });
  }

  /* ----------------------------------------------------------------------
     3. 부드러운 스크롤 — scroll-behavior 미지원 Safari 폴백
     ---------------------------------------------------------------------- */
  var supportsSmooth = 'scrollBehavior' in document.documentElement.style;
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function navOffset() {
    var nav = $('.nav');
    return (nav ? nav.getBoundingClientRect().height : 64) + 24;
  }

  function animateScrollTo(top) {
    var start = window.pageYOffset;
    var delta = top - start;
    var dur = Math.min(700, Math.max(300, Math.abs(delta) * 0.4));
    var t0 = null;
    function step(ts) {
      if (t0 === null) { t0 = ts; }
      var p = Math.min(1, (ts - t0) / dur);
      var eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, start + delta * eased);
      if (p < 1) { window.requestAnimationFrame(step); }
    }
    window.requestAnimationFrame(step);
  }

  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') { return; }
      var target = document.getElementById(id.slice(1));
      if (!target) { return; }
      e.preventDefault();

      var run = function () {
        var top = target.getBoundingClientRect().top + window.pageYOffset - navOffset();
        if (top < 0) { top = 0; }
        if (prefersReduced || !supportsSmooth) {
          if (prefersReduced) { window.scrollTo(0, top); } else { animateScrollTo(top); }
        } else {
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
        if (history.replaceState) { history.replaceState(null, '', id); }
      };

      // 메뉴가 열려 있으면 잠금 해제 후 스크롤 (iOS 위치 튐 방지)
      if (sheet && sheet.classList.contains('is-open')) {
        setMenu(false);
        window.setTimeout(run, 60);
      } else {
        run();
      }
    });
  });

  /* ----------------------------------------------------------------------
     4. 스크롤 리빌
     ---------------------------------------------------------------------- */
  var revealables = $$('.reveal');
  if ('IntersectionObserver' in window && revealables.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ----------------------------------------------------------------------
     5. 스크롤 스파이 (헤더 목차 활성화)
     ---------------------------------------------------------------------- */
  var navLinks = $$('[data-spy]');
  var sections = navLinks
    .map(function (l) { return document.getElementById(l.getAttribute('data-spy')); })
    .filter(Boolean);

  function markActive(id) {
    navLinks.forEach(function (l) {
      l.classList.toggle('is-active', l.getAttribute('data-spy') === id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var visible = {};
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0; });
      var best = null, bestRatio = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; best = id; }
      });
      if (best) { markActive(best); }
    }, { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.15, 0.4, 0.75, 1] });
    sections.forEach(function (s) { spyObserver.observe(s); });
  }

  /* ----------------------------------------------------------------------
     6. 맨 위로 버튼
     ---------------------------------------------------------------------- */
  var toTop = $('[data-to-top]');
  if (toTop) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) { return; }
      ticking = true;
      window.requestAnimationFrame(function () {
        toTop.classList.toggle('is-shown', window.pageYOffset > window.innerHeight * 0.9);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', function () {
      if (prefersReduced || !supportsSmooth) { animateScrollTo(0); }
      else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
  }

  /* ----------------------------------------------------------------------
     7. 연도 자동 표기
     ---------------------------------------------------------------------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
