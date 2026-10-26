/* Console chrome for hud-launcher. Content, links and card markup stay with render.js. */
(function () {
  'use strict';
  if (window.__portfolioHudLoaded) return;
  window.__portfolioHudLoaded = true;
  var root = document.documentElement;
  var copy = {
    featured: { ko: '대표 타이틀', en: 'FEATURED TITLE' },
    library: { ko: '프로젝트 라이브러리', en: 'Project library' },
    browse: { ko: '카드를 선택해 자세히 보기', en: 'Select a card to explore' },
    projects: { ko: '프로젝트', en: 'Projects' },
    top: { ko: '맨 위로', en: 'Top' },
    display: { ko: '화면 모드', en: 'Display' },
    controls: { ko: '콘솔 컨트롤', en: 'Console controls' },
    clock: { ko: '현재 시각', en: 'Current time' },
    previous: { ko: '이전 프로젝트 보기', en: 'Scroll to previous projects' },
    next: { ko: '다음 프로젝트 보기', en: 'Scroll to next projects' },
    profile: { ko: '플레이어 프로필', en: 'PLAYER PROFILE' },
    edition: { ko: '01 / 포트폴리오', en: '01 / PORTFOLIO' },
    status: { ko: '김지수의 포트폴리오', en: 'JISU KIM / PORTFOLIO' }
  };
  function active() { return root.dataset.skin === 'hud-launcher'; }
  function t(key) { return copy[key][root.lang === 'en' ? 'en' : 'ko']; }
  function reduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function node(tag, className, text) {
    var el = document.createElement(tag); el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  function clock() {
    if (!active()) return;
    var el = document.querySelector('.hud-clock');
    if (!el) return;
    var now = new Date();
    var time = now.toLocaleTimeString(root.lang === 'en' ? 'en-GB' : 'ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (el.textContent !== time) el.textContent = time;
    el.dateTime = now.toISOString(); el.setAttribute('aria-label', t('clock') + ': ' + time);
  }
  function key(tag, letter, label) {
    var el = node(tag, 'hud-key');
    var symbol = node('span', 'hud-key__button', letter); symbol.setAttribute('aria-hidden', 'true');
    el.appendChild(symbol); el.appendChild(node('span', '', t(label)));
    return el;
  }
  function enhance() {
    if (!active()) {
      document.querySelectorAll('[data-hud-chrome]').forEach(function (el) { el.remove(); });
      return;
    }
    var nav = document.querySelector('[data-slot="nav"]');
    if (nav && !nav.querySelector('.hud-system')) {
      var system = node('div', 'hud-system'); system.dataset.hudChrome = '';
      var signal = node('span', 'hud-system__signal'); signal.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 3; i++) signal.appendChild(document.createElement('i'));
      system.appendChild(signal); system.appendChild(node('time', 'hud-clock'));
      nav.insertBefore(system, nav.querySelector('.nav__actions')); clock();
    }
    var hero = document.querySelector('.hero');
    if (hero && !hero.querySelector('.hud-feature')) {
      var feature = node('div', 'hud-feature'); feature.dataset.hudChrome = '';
      feature.appendChild(node('span', 'hud-feature__label', t(document.querySelector('.home-screen') ? 'featured' : 'profile')));
      feature.appendChild(node('span', '', t('edition')));
      hero.appendChild(feature);
    }
    var draw = document.querySelector('.draw > .wrap');
    if (draw && !draw.querySelector('.hud-library')) {
      var library = node('div', 'hud-library'); library.dataset.hudChrome = '';
      library.appendChild(node('h2', 'hud-library__title', t('library')));
      library.appendChild(node('span', 'hud-library__meta', t('browse')));
      draw.insertBefore(library, draw.firstChild);
    }
    var grid = document.querySelector('.proj-grid');
    var head = document.querySelector('.proj-head');
    if (grid && head && !head.querySelector('.hud-rail-buttons')) {
      var buttons = node('div', 'hud-rail-buttons'); buttons.dataset.hudChrome = '';
      [-1, 1].forEach(function (direction) {
        var button = node('button', 'hud-rail-button', direction === -1 ? '←' : '→');
        button.type = 'button'; button.setAttribute('aria-label', t(direction === -1 ? 'previous' : 'next'));
        button.addEventListener('click', function () {
          if (!active()) return;
          grid.scrollBy({ left: direction * grid.clientWidth * .75, behavior: reduced() ? 'auto' : 'smooth' });
        });
        buttons.appendChild(button);
      });
      head.appendChild(buttons);
    }
    var controls = document.querySelector('.hud-controls');
    if (controls && controls.dataset.language !== root.lang) { controls.remove(); controls = null; }
    if (!controls) {
      controls = node('nav', 'hud-controls'); controls.dataset.hudChrome = ''; controls.dataset.language = root.lang;
      controls.setAttribute('aria-label', t('controls'));
      controls.appendChild(node('span', 'hud-controls__status', t('status')));
      var keys = node('div', 'hud-controls__keys');
      var projects = key('a', 'A', 'projects');
      projects.href = (window.PortfolioSkin ? window.PortfolioSkin.assets.replace(/assets\/$/, '') : '') + 'projects.html';
      keys.appendChild(projects);
      var top = key('button', 'B', 'top'); top.type = 'button';
      top.addEventListener('click', function () {
        if (!active()) return;
        var target = document.querySelector('#main');
        if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
        window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
      });
      keys.appendChild(top);
      var display = key('button', 'Y', 'display'); display.type = 'button';
      display.addEventListener('click', function () {
        if (!active()) return;
        var toggle = document.querySelector('[data-theme-toggle]'); if (toggle) toggle.click();
      });
      keys.appendChild(display); controls.appendChild(keys); document.body.appendChild(controls);
    }
  }
  function init() {
    var main = document.querySelector('[data-slot="main"]');
    var nav = document.querySelector('[data-slot="nav"]');
    // Watch direct children only: adding labels or updating the clock cannot trigger a loop.
    if (main) new MutationObserver(enhance).observe(main, { childList: true });
    if (nav) new MutationObserver(enhance).observe(nav, { childList: true });
    new MutationObserver(enhance).observe(root, { attributes: true, attributeFilter: ['data-skin', 'lang'] });
    enhance();
    window.setInterval(clock, 30000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
