/* Box Art: flat package graphics. All DOM changes are scoped to this skin.
   Existing single-click 680ms cartridge insertion and content APIs are preserved. */
(function () {
  'use strict';
  if (window.__portfolioFCBoxArt) return;
  window.__portfolioFCBoxArt = true;
  var SKIN = 'pixel-fc-boxart';
  var T = {
    select: 'SELECT',
    prevQ: { ko: '이전 한마디', en: 'Previous quip' },
    nextQ: { ko: '다음 한마디', en: 'Next quip' },
    prevS: { ko: '이전 절로', en: 'Previous section' },
    nextS: { ko: '다음 절로', en: 'Next section' },
    light: { ko: '밝기', en: 'Light' },
    lightA: { ko: '다크 · 라이트 전환', en: 'Toggle dark mode' },
    draw: { ko: '뽑기', en: 'Draw' },
    drawA: { ko: '프로젝트 카드 뽑기', en: 'Draw project cards' },
    down: { ko: '아래로', en: 'Down' },
    downA: { ko: '아래 내용으로', en: 'Scroll to the content' },
    mail: { ko: '메일', en: 'Mail' },
    mailA: { ko: '이메일 보내기', en: 'Send me an email' },
    saves: { ko: '세이브 슬롯', en: 'SAVE SLOTS' },
    inventory: { ko: '아이템', en: 'ITEMS' },
    status: { ko: '상태', en: 'STATUS' },
    record: { ko: '기록', en: 'LOG' },
    selection: { ko: '게임 선택', en: 'GAME SELECT' },
    hoverHint: { ko: '올리거나 포커스하면 미리보기 · 누르면 바로 상세로', en: 'Hover or focus to preview · Select to open details' },
    touchHint: { ko: '카트리지를 누르면 바로 상세로 이동합니다.', en: 'Tap a cartridge to open its details.' },
    openHint: { ko: '카트리지를 누르면 상세로 이동합니다.', en: 'Select the cartridge to open its details.' },
    insert: { ko: '꽂기', en: 'Insert' },
    insertHint: { ko: '누르면 꽂기 · 상세 보기', en: 'Insert · Open details' },
    insertA: { ko: '선택한 프로젝트 꽂고 열기', en: 'Insert and open the selected project' },
    all: { ko: '전체 프로젝트', en: 'All projects' },
    restore: { ko: '첫 화면으로', en: 'Home screen' },
    preview: { ko: '프로젝트 미리보기', en: 'Project preview' },
    period: { ko: '기간', en: 'Period' },
    role: { ko: '역할', en: 'Role' },
    quest: { ko: '퀘스트', en: 'Quest' },
    result: { ko: '결과', en: 'Result' },
    media: { ko: '플레이 화면', en: 'GAMEPLAY' },
    emptyMedia: { ko: '미디어 준비 중', en: 'MEDIA PENDING' }
  };
  var MAIL_SVG = '<svg viewBox="0 0 18 14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="1.6" width="16" height="11"/><path d="m1.6 2.4 7.4 5.6 7.4-5.6"/></svg>';
  function lang() {
    var v = window.PortfolioApp && window.PortfolioApp.getLang ? window.PortfolioApp.getLang() : document.documentElement.getAttribute('lang');
    return v === 'en' ? 'en' : 'ko';
  }
  function t(o) { var L = lang(); return typeof o === 'string' ? o : (o && (o[L] || o.ko)) || ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function active() { return document.documentElement.getAttribute('data-skin') === SKIN; }
  function reduced() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function navH() { var n = document.querySelector('.nav'); return (n ? n.getBoundingClientRect().height : 60) + 16; }
  function scrollToY(y) { try { window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, Math.max(0, y)); } }
  function content() { return window.PORTFOLIO_CONTENT || {}; }

  /* ── 손잡이 버튼 ─────────────────────────────────────────────────────── */
  function build(hero) {
    if (!active() || hero.querySelector('.fc-grip')) return;
    var wrap = hero.querySelector('.wrap'); if (!wrap) return;
    var hasQuip = !!hero.querySelector('[data-quip]');
    var hasDeck = !!document.querySelector('[data-draw]');
    var mail = ((content().meta && content().meta.email) || '').trim();   /* content.js 의 meta.email */

    var left = document.createElement('div');
    left.className = 'fc-grip fc-grip--l';
    left.innerHTML =
      '<span class="fc-lbl">' + T.select + '</span>' +
      '<button type="button" class="fc-key" data-fc-step="-1" aria-label="' + esc(t(hasQuip ? T.prevQ : T.prevS)) + '"><span aria-hidden="true">◀</span></button>' +
      '<button type="button" class="fc-key" data-fc-step="1" aria-label="' + esc(t(hasQuip ? T.nextQ : T.nextS)) + '"><span aria-hidden="true">▶</span></button>' +
      /* 메일 키 — 누르면 메일 앱이 열립니다 (이메일은 content.js 의 meta.email 한 곳에서) */
      (mail ? '<span class="fc-ab"><a class="fc-key fc-key--mail" href="mailto:' + esc(mail) + '" aria-label="' + esc(t(T.mailA) + ' — ' + mail) + '">' + MAIL_SVG + '</a>' +
              '<span class="fc-lbl">' + esc(t(T.mail)) + '</span></span>' : '');

    var right = document.createElement('div');
    right.className = 'fc-grip fc-grip--r';
    right.innerHTML =
      '<span class="fc-ab"><button type="button" class="fc-key fc-key--ab" data-fc-b aria-label="' + esc(t(T.lightA)) + '">B</button><span class="fc-lbl" data-fc-lbl="b">' + esc(t(T.light)) + '</span></span>' +
      '<span class="fc-ab"><button type="button" class="fc-key fc-key--ab" data-fc-a="' + (hasDeck ? 'draw' : 'down') + '" aria-label="' + esc(t(hasDeck ? T.drawA : T.downA)) + '">A</button><span class="fc-lbl" data-fc-lbl="a">' + esc(t(hasDeck ? T.draw : T.down)) + '</span></span>';

    hero.classList.add('fc-console');
    hero.insertBefore(left, wrap);
    hero.appendChild(right);
  }

  function sections() {
    return Array.prototype.filter.call(document.querySelectorAll('main section'), function (s) {
      return !s.classList.contains('hero');
    });
  }
  function step(dir) {
    resetPreview(false);
    var hero = document.querySelector('.hero.fc-console'); if (!hero) return;
    var app = window.PortfolioApp;
    if (hero.querySelector('[data-quip]') && app && app.cycleQuip) { app.cycleQuip(dir); return; }
    var secs = sections(); if (!secs.length) return;
    var y = window.pageYOffset + navH() + 2, cur = -1;
    for (var i = 0; i < secs.length; i++) if (secs[i].getBoundingClientRect().top + window.pageYOffset <= y) cur = i;
    var next = secs[Math.max(0, Math.min(secs.length - 1, cur + dir))];
    scrollToY(next.getBoundingClientRect().top + window.pageYOffset - navH());
  }
  function pressA(kind) {
    if (selected && selected.isConnected) { selected.click(); return; }
    if (kind === 'draw') {
      var deck = document.querySelector('[data-draw]'); if (!deck) return;
      deck.click();
      var r = deck.getBoundingClientRect();
      if (r.top < navH() || r.bottom > window.innerHeight) scrollToY(r.top + window.pageYOffset - navH() - 8);
    } else {
      var secs = sections();
      if (secs.length) scrollToY(secs[0].getBoundingClientRect().top + window.pageYOffset - navH());
    }
  }
  function each(selector, fn, root) { Array.prototype.forEach.call((root || document).querySelectorAll(selector), fn); }
  function node(tag, cls, value) {
    var el = document.createElement(tag); el.className = cls;
    if (value !== undefined) el.textContent = value;
    return el;
  }
  // The package front and the device are separate planes; no window chrome.
  function packageHero(hero) {
    if (hero.querySelector('.ba-console')) return;
    var wrap = hero.querySelector('.wrap'), title = hero.querySelector('.hero__title');
    if (!wrap || !title) return;
    var mast = node('div', 'ba-masthead');
    var series = node('div', 'ba-series');
    series.innerHTML = '<span>' + esc(t({ko:'기획자 시리즈',en:'DESIGNER SERIES'})) + '</span><span>01 / KIM JISU</span>';
    mast.appendChild(series); mast.appendChild(title);
    var seal = node('span', 'ba-seal', t({ko:'정면 돌파\n액션 시리즈',en:'HEAD-ON\nACTION SERIES'}));
    mast.appendChild(seal);
    var device = node('div', 'ba-console');
    var left = hero.querySelector('.fc-grip--l'), right = hero.querySelector('.fc-grip--r');
    hero.appendChild(mast); hero.appendChild(device);
    if (left) device.appendChild(left); device.appendChild(wrap); if (right) device.appendChild(right);
    var cap = hero.querySelector('.portrait__cap'), quip = hero.querySelector('.quip');
    var info = wrap.querySelector('.hero__grid > div');
    if (cap && info) info.insertBefore(cap, info.querySelector('.btn-row'));
    if (quip && info) info.insertBefore(quip, info.querySelector('.btn-row'));
    var stripe = node('div', 'ba-device-brand');
    stripe.innerHTML = '<span>' + esc(t({ko:'패미컴 · 기획자의 기록',en:'FAMILY COMPUTER · DESIGN ARCHIVE'})) + '</span><span>● PORTFOLIO / 01</span>';
    device.appendChild(stripe);
  }
  function artSvg(index) {
    // Original project-specific vector drawings, using only the package inks.
    var scenes = [
      '<circle cx="200" cy="80" r="66" fill="#edbb4a"/><path d="M0 148 75 80 115 126 170 65 260 150 320 96V200H0Z" fill="#941f2b"/>' +
      '<path d="M45 166V88H64V108H82V88H101V166M220 167V73H239V94H257V73H276V167" fill="#f8efd8" stroke="#211b19" stroke-width="5"/>' +
      '<path d="m121 180 25-62 30-15 30 15 24 62Z" fill="#211b19"/><path d="m153 112 23-53 23 53-23 19Z" fill="#f8efd8" stroke="#211b19" stroke-width="5"/><path d="m175 144 35-58 8 5-32 61" fill="#edbb4a"/>',
      '<path d="M0 0H320V200H0Z" fill="#211b19"/><circle cx="175" cy="105" r="67" fill="#b92432" stroke="#f8efd8" stroke-width="4"/><ellipse cx="175" cy="105" rx="122" ry="25" transform="rotate(-27 175 105)" fill="none" stroke="#edbb4a" stroke-width="16"/><path d="m70 33 30 43-28-7-16 26Z" fill="#f8efd8" stroke="#211b19" stroke-width="4"/><path d="m40 143 4 10 12 3-11 5-3 12-4-12-11-4 11-3M274 22l5 12 12 3-12 4-5 13-4-13-13-4 13-3" fill="#edbb4a"/>',
      '<circle cx="244" cy="50" r="35" fill="#b92432"/><path d="M0 180 90 45 155 146 207 89 320 200H0Z" fill="#211b19"/><path d="m65 84 25-39 26 40-25-10Z" fill="#f8efd8"/><path d="M0 196q130-85 206-37l-12 41H0" fill="#edbb4a"/><path d="m156 158 15-61 17-9 17 11-8 62Z" fill="#b92432" stroke="#f8efd8" stroke-width="4"/><circle cx="183" cy="75" r="12" fill="#f8efd8" stroke="#211b19" stroke-width="4"/>',
      '<path d="M0 0H320V200H0Z" fill="#b92432"/><path d="m10 180 100-156 54 49 89-61 59 75-110 112Z" fill="#edbb4a"/><path d="m89 144 12-61 28-18 13-33 23 6 2 37 22-32 20 12-13 42 27-23 18 17-26 37 17-8 14 21-49 44-48-1Z" fill="#f8efd8" stroke="#211b19" stroke-width="7"/><path d="m134 112 69 39" stroke="#b92432" stroke-width="7"/>',
      '<path d="M0 0H320V200H0Z" fill="#edbb4a"/><path d="M0 180 320 20M0 220 320 60" stroke="#f8efd8" stroke-width="22"/><path d="M58 152V99H99V152M126 152V65H167V152M194 152V30H235V152" fill="#b92432" stroke="#211b19" stroke-width="5"/><circle cx="251" cy="138" r="42" fill="#f8efd8" stroke="#211b19" stroke-width="5"/><path d="M251 112v51m14-42c-30-17-39 17-12 17s18 28-15 14" fill="none" stroke="#211b19" stroke-width="6"/>'
    ];
    return '<svg class="ba-art" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path fill="#f8efd8" d="M0 0h320v200H0z"/>' + scenes[index % scenes.length] + '</svg>';
  }
  function cartridgeArt() {
    var items = (content().projects && content().projects.items) || [];
    each('a.draw-card, a.proj-card', function (a) {
      var p = projectOf(a), index = items.indexOf(p), face = a.querySelector('.gcard') || a;
      face.setAttribute('data-ba-series', t({ko:'기획자 시리즈',en:'DESIGNER SERIES'}) + ' / ' + ('0' + (index + 1)).slice(-2));
      var art = a.querySelector('.gcard__art');
      if (art && !art.querySelector('img') && !art.querySelector('.ba-art')) art.innerHTML = artSvg(Math.max(0, index));
    });
  }
  function playPreviewArt() {
    // Small decorative stickers only; preserve supplied game icons and all copy.
    var scenes = [
      '<path fill="#211b19" d="M0 0h80v80H0z"/><circle cx="42" cy="40" r="22" fill="#b92432" stroke="#f8efd8" stroke-width="2"/><ellipse cx="42" cy="40" rx="35" ry="9" transform="rotate(-30 42 40)" fill="none" stroke="#edbb4a" stroke-width="6"/><path d="m13 10 2 5 5 2-5 2-2 5-2-5-5-2 5-2" fill="#f8efd8"/>',
      '<path fill="#b92432" d="M0 0h80v80H0z"/><path d="M20 66V12h40v54" fill="#211b19" stroke="#f8efd8" stroke-width="3"/><circle cx="46" cy="34" r="8" fill="none" stroke="#edbb4a" stroke-width="4"/><path d="M46 42v16m0-4h8M0 68h80m-80 7h80" stroke="#edbb4a" stroke-width="4"/>',
      '<path fill="#edbb4a" d="M0 0h80v80H0z"/><path d="M0 10h80M0 70h80" stroke="#211b19" stroke-width="5"/><path d="M40 23v34M23 40h34" stroke="#b92432" stroke-width="7"/>'
    ];
    each('.hp-games .hp-game__ic', function (icon, i) {
      if (icon.querySelector('img, .ba-play-art')) return;
      icon.innerHTML = '<svg class="ba-play-art" viewBox="0 0 80 80" aria-hidden="true">' + scenes[i % scenes.length] + '</svg>';
    });
  }
  function menus() {
    each('.hero', packageHero);
    each('.hp-h, .section__title, .cover-block h3, .cl-summary__t, .block__label', function (heading, i) {
      heading.setAttribute('data-ba-number', ('0' + (i + 1)).slice(-2));
    });
    cartridgeArt(); playPreviewArt();
  }

  var selected = null, pending = null, deckObserver = null, restoringFocus = false, rearmingDeck = false;
  function projectOf(a) {
    var m = (a.getAttribute('href') || '').match(/[?&]p=([^&#]+)/), id;
    try { id = m ? decodeURIComponent(m[1]) : ''; } catch (e) { return null; }
    var items = (content().projects && content().projects.items) || [];
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }
  function previewHtml(p, a) {
    var tabs = (content().projects && content().projects.tabs) || {};
    var q = p.quest || {};
    var rows = [[T.period, p.period], [T.role, p.myRole]].filter(function (r) { return t(r[1]); }).map(function (r) {
      return '<div><dt>' + esc(t(r[0])) + '</dt><dd>' + esc(t(r[1])) + '</dd></div>';
    }).join('');
    // 카드의 실제 아트 DOM을 재사용합니다. 원본 .gcard와 사진은 바꾸지 않습니다.
    var art = a.querySelector('.gcard__art');
    return (art ? '<div class="fcr-preview__art" aria-hidden="true">' + art.innerHTML + '</div>' : '') +
      '<div class="fcr-preview__info"><div class="fcr-preview__intro"><p class="fcr-preview__category">' + esc(t(tabs[p.category])) +
      (t(p.tag) ? ' · ' + esc(t(p.tag)) : '') + '</p><h2 class="fcr-preview__title">' + esc(t(p.title)) + '</h2>' +
      '<p class="fcr-preview__sub">' + esc(t(p.sub)) + '</p></div>' +
      '<dl class="fcr-preview__facts">' + rows + '</dl>' +
      (t(q.goal) || t(q.result) ? '<div class="fcr-preview__quest">' +
        (t(q.goal) ? '<p><span>' + esc(t(T.quest)) + '</span>' + esc(t(q.goal)) + '</p>' : '') +
        (t(q.result) ? '<p><span>' + esc(t(T.result)) + '</span><b>' + esc(t(q.result)) + '</b></p>' : '') + '</div>' : '') +
      '</div>';
  }
  function makePreview(inHero) {
    var el = node('div', 'fcr-preview' + (inHero ? ' fcr-preview--lcd' : ' fcr-preview--list fcr-window'));
    el.setAttribute('role', 'region'); el.setAttribute('aria-label', t(T.preview));
    el.innerHTML = '<div class="fcr-preview__bar"><span>▶ ' + esc(t(T.selection)) + '</span>' +
      (inHero ? '<button type="button" data-fcr-reset>' + esc(t(T.restore)) + ' <span aria-hidden="true">×</span></button>' : '') +
      '</div><div class="fcr-preview__body"></div>' +
      '<div class="fcr-preview__footer"><button type="button" data-fcr-open><kbd>A</kbd> ' + esc(t(T.insertHint)) + ' →</button></div>';
    el.hidden = true;
    return el;
  }
  function status() {
    var el = document.getElementById('fcr-status');
    if (!el) {
      el = node('div', 'sr-only'); el.id = 'fcr-status';
      el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); el.setAttribute('aria-atomic', 'true');
      document.body.appendChild(el);
    }
    return el;
  }
  function previewA(enabled) {
    var key = document.querySelector('[data-fc-a]'), label = document.querySelector('[data-fc-lbl="a"]');
    if (!key) return;
    var draw = key.getAttribute('data-fc-a') === 'draw';
    key.setAttribute('aria-label', t(enabled ? T.insertA : draw ? T.drawA : T.downA));
    if (label) label.textContent = t(enabled ? T.insert : draw ? T.draw : T.down);
  }
  function fadePreview(el) {
    if (el && el.animate && !reduced()) el.animate([{ opacity: .7 }, { opacity: 1 }], { duration: 140, easing: 'ease-out' });
  }
  function resetPreview(returnFocus, switching) {
    var old = selected; selected = null;
    if (old) old.classList.remove('is-fcr-preview');
    each('.fcr-preview', function (el) { el.hidden = true; });
    each('.hero.is-fcr-previewing', function (hero) {
      hero.classList.remove('is-fcr-previewing');
      var grid = hero.querySelector('.hero__grid');
      if (grid) {
        grid.removeAttribute('inert'); grid.removeAttribute('aria-hidden');
        if (!switching) fadePreview(grid.querySelector(':scope > div'));
      }
    });
    previewA(false);
    var live = document.getElementById('fcr-status'); if (live) live.textContent = '';
    if (returnFocus && old && old.isConnected) {
      restoringFocus = true; old.focus({ preventScroll: true }); restoringFocus = false;
    }
  }
  function preview(a, announce) {
    if (pending) return;
    var p = projectOf(a);
    if (selected === a) { if (announce && p) announceProject(p); return; }
    var el = document.querySelector('.fcr-preview--lcd, .fcr-preview--list'); if (!p || !el) return;
    resetPreview(false, true); selected = a; a.classList.add('is-fcr-preview');
    el.querySelector('.fcr-preview__body').innerHTML = previewHtml(p, a); el.hidden = false;
    fadePreview(el.querySelector('.fcr-preview__body'));
    var hero = el.closest('.hero');
    if (hero) {
      hero.classList.add('is-fcr-previewing');
      var grid = hero.querySelector('.hero__grid');
      if (grid) { grid.setAttribute('inert', ''); grid.setAttribute('aria-hidden', 'true'); }
      previewA(true);
      var aux = document.querySelector('.fcr-preview--aux');
      if (aux) aux.querySelector('.fcr-preview__body').innerHTML = previewHtml(p, a);
      positionAux();
    }
    if (announce) announceProject(p);
  }
  function announceProject(p) {
    status().textContent = [t(p.title), t(p.sub), t(T.period) + ': ' + t(p.period), t(T.role) + ': ' + t(p.myRole), t(p.quest && p.quest.goal), t(p.quest && p.quest.result)].filter(Boolean).join('. ');
  }
  // 액정이 잘릴 때만 카드 바로 위(공간이 없으면 아래)에 읽기 전용 보조 창을 표시합니다.
  // 카드 행의 문서 위치와 스크롤은 바꾸지 않습니다.
  function positionAux() {
    var aux = document.querySelector('.fcr-preview--aux'), lcd = document.querySelector('.fcr-preview--lcd');
    if (!aux || !lcd) return;
    aux.hidden = true;
    if (!active() || !selected || !selected.isConnected || lcd.hidden || pending) return;
    var viewH = window.innerHeight, viewW = window.innerWidth || document.documentElement.clientWidth;
    var top = navH(), screen = lcd.getBoundingClientRect(), card = selected.getBoundingClientRect();
    if ((screen.top >= top && screen.bottom <= viewH - 12) || card.bottom <= top || card.top >= viewH - 12) return;
    aux.hidden = false;
    var box = aux.getBoundingClientRect(), y = card.top - box.height - 12;
    if (y < top && card.bottom + 12 + box.height <= viewH - 12) y = card.bottom + 12;
    y = Math.max(top, Math.min(y, viewH - box.height - 12));
    aux.style.left = Math.max(12, Math.min(card.left, viewW - box.width - 12)) + 'px';
    aux.style.top = y + 'px';
  }
  var auxFrame = false;
  function scheduleAux() {
    if (!active() || !selected || auxFrame) return;
    if (!window.requestAnimationFrame) { positionAux(); return; }
    auxFrame = true;
    window.requestAnimationFrame(function () { auxFrame = false; positionAux(); });
  }
  function setupSelection() {
    var draw = document.querySelector('.draw .wrap'), head = document.querySelector('.proj-head');
    if (!draw && !head) return;
    var hint = document.getElementById('fcr-selection-hint');
    if (!hint) {
      var row = node('div', 'fcr-select-guide');
      hint = node('p', '', t(window.matchMedia && window.matchMedia('(hover: none)').matches ? T.touchHint : T.hoverHint));
      hint.id = 'fcr-selection-hint'; row.appendChild(hint);
      if (draw) {
        var link = node('a', 'fcr-all-link', t(T.all) + ' →'); link.href = 'projects.html';
        row.appendChild(link); draw.insertBefore(row, draw.firstChild);
      } else head.insertAdjacentElement('afterend', row);
    }
    var heroWrap = document.querySelector('.ba-console > .wrap');
    if (heroWrap && !heroWrap.querySelector('.fcr-preview')) heroWrap.appendChild(makePreview(true));
    if (heroWrap && !document.querySelector('.fcr-preview--aux')) {
      var aux = node('div', 'fcr-preview fcr-preview--aux fcr-window');
      aux.setAttribute('aria-hidden', 'true'); aux.setAttribute('inert', ''); aux.hidden = true;
      aux.innerHTML = '<div class="fcr-preview__bar">▶ ' + esc(t(T.selection)) + '</div>' +
        '<div class="fcr-preview__body"></div><p class="fcr-preview__aux-hint">' + esc(t(T.openHint)) + '</p>';
      // body 바로 아래에 두어 게임기의 overflow:hidden에 잘리지 않게 합니다.
      document.body.appendChild(aux);
    }
    if (head && !document.querySelector('.fcr-preview--list')) {
      var pane = makePreview(false), grid = document.querySelector('[data-proj-grid]');
      if (grid) grid.insertAdjacentElement('afterend', pane);
    }
    each('a.draw-card, a.proj-card', function (a) {
      var ids = (a.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      if (ids.indexOf(hint.id) < 0) { ids.push(hint.id); a.setAttribute('aria-describedby', ids.join(' ')); }
    });
  }

  /* 420ms 이동 + 260ms 밀어 넣기. 로딩·중간 개요·전체 화면 켜기 없이 이동합니다.
     800ms 타이머는 WAAPI 완료 이벤트가 누락되어도 링크가 멈추지 않도록 하는 상한입니다. */
  function cleanup() {
    var me = pending; pending = null;
    if (me) {
      clearTimeout(me.timer);
      (me.animations || []).forEach(function (a) { a.cancel(); });
      if (me.a) { me.a.style.visibility = ''; me.a.removeAttribute('aria-busy'); }
    }
    each('.fc-fly, .fc-slot', function (el) { el.remove(); });
    each('.ba-console.is-slot', function (el) { el.classList.remove('is-slot'); });
  }
  function insert(a) {
    var face = a.classList.contains('gcard') ? a : a.querySelector('.gcard');
    if (!face || !face.animate) { window.location.assign(a.href); return; }
    cleanup();
    var aux = document.querySelector('.fcr-preview--aux'); if (aux) aux.hidden = true;
    var r = a.getBoundingClientRect(), hero = document.querySelector('.hero.fc-console');
    var device = hero && hero.querySelector('.ba-console');
    var hr = device && device.getBoundingClientRect();
    var useHero = !!(hr && hr.bottom > navH() + 30 && hr.bottom < window.innerHeight - 40);
    var line, cx, slot;
    if (useHero) {
      device.classList.add('is-slot'); line = hr.bottom - 3; cx = hr.left + hr.width / 2;
    } else {
      slot = node('div', 'fc-slot'); slot.setAttribute('aria-hidden', 'true');
      slot.style.top = navH() - 12 + 'px'; slot.style.transform = 'translate(-50%, 0)';
      document.body.appendChild(slot);
      var sr = slot.getBoundingClientRect(); line = sr.bottom - 3; cx = sr.left + sr.width / 2;
    }
    var fly = node('div', 'fc-fly'); fly.setAttribute('aria-hidden', 'true'); fly.setAttribute('inert', '');
    fly.style.cssText = 'position:' + (useHero ? 'absolute' : 'fixed') + ';left:' +
      (r.left + (useHero ? window.pageXOffset : 0)) + 'px;top:' +
      (r.top + (useHero ? window.pageYOffset : 0)) + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
    var clone = face.cloneNode(true);
    clone.classList.remove('is-tilt', 'reveal', 'is-visible', 'is-fcr-preview'); clone.classList.add('fc-fly__card');
    clone.removeAttribute('style'); clone.removeAttribute('href'); clone.removeAttribute('aria-describedby');
    fly.appendChild(clone); document.body.appendChild(fly);
    a.style.visibility = 'hidden'; a.setAttribute('aria-busy', 'true');
    var me = pending = { a: a, animations: [] };
    function finish() {
      if (pending !== me) return;
      var url = a.href; cleanup(); window.location.assign(url);
    }
    me.timer = setTimeout(finish, 800);
    var dx = cx - r.left - r.width / 2, dy = line - r.top;
    function at(x, y) { return 'translate(' + x + 'px,' + y + 'px)'; }
    try {
      if (slot) me.animations.push(slot.animate([
        { transform: 'translate(-50%, -100%)' }, { transform: 'translate(-50%, 0)' }
      ], { duration: 120, fill: 'forwards', easing: 'ease-out' }));
      var animation = fly.animate([
        { transform: at(0, 0), clipPath: 'inset(0 0 0 0)', offset: 0 },
        { transform: at(dx * .2, -20), clipPath: 'inset(0 0 0 0)', offset: .2 },
        { transform: at(dx, dy), clipPath: 'inset(0 0 0 0)', offset: 420 / 680 },
        { transform: at(dx, dy - r.height), clipPath: 'inset(100% 0 0 0)', offset: 1 }
      ], { duration: 680, fill: 'forwards', easing: 'cubic-bezier(.3,.65,.3,1)' });
      me.animations.push(animation); animation.onfinish = finish;
    } catch (e) { finish(); }
  }

  document.addEventListener('pointerover', function (e) {
    if (!active() || e.pointerType === 'touch' || !e.target.closest) return;
    var a = e.target.closest('a.draw-card, a.proj-card');
    if (a && (!e.relatedTarget || !a.contains(e.relatedTarget))) preview(a, false);
  });
  document.addEventListener('focusin', function (e) {
    if (!active() || restoringFocus || !e.target.closest) return;
    var a = e.target.closest('a.draw-card, a.proj-card'); if (a) preview(a, true);
  });
  document.addEventListener('click', function (e) {
    if (!active() || !e.target.closest) return;
    if (e.target.closest('[data-draw]')) {
      var cards = document.querySelector('[data-draw-cards]');
      e.fcrDrawBefore = cards && cards.firstChild; return;
    }
    var a = e.target.closest('a.draw-card, a.proj-card');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    if (reduced()) { cleanup(); return; }
    e.preventDefault(); e.stopPropagation(); insert(a);
  }, true);
  document.addEventListener('click', function (e) {
    if (!active() || !e.target.closest) return;
    var deck = e.target.closest('[data-draw]');
    if (deck && !rearmingDeck) {
      var cards = document.querySelector('[data-draw-cards]'), app = window.PortfolioApp;
      // main의 언어 전환은 새 덱을 그리지만 click 바인딩을 다시 하지 않습니다.
      // 실제 뽑기가 없었을 때만 공개 API로 재바인딩하여 원래의 무작위 뽑기를 실행합니다.
      if (cards && cards.firstChild === e.fcrDrawBefore && app && app.rerender) {
        var hadFocus = document.activeElement === deck;
        var aHadFocus = document.activeElement && document.activeElement.hasAttribute('data-fc-a');
        rearmingDeck = true;
        try {
          app.rerender(); scan();
          if (aHadFocus) {
            var aKey = document.querySelector('[data-fc-a]'); if (aKey) aKey.focus({ preventScroll: true });
          }
          var rebound = document.querySelector('[data-draw]');
          if (rebound) { if (hadFocus) rebound.focus({ preventScroll: true }); rebound.click(); }
        } finally { rearmingDeck = false; }
      }
      return;
    }
    if (e.target.closest('[data-fcr-reset]')) { resetPreview(true); return; }
    if (e.target.closest('[data-fcr-open]')) { if (selected && selected.isConnected) selected.click(); return; }
    var stepKey = e.target.closest('[data-fc-step]');
    if (stepKey) { step(parseInt(stepKey.getAttribute('data-fc-step'), 10) || 1); return; }
    var aKey = e.target.closest('[data-fc-a]');
    if (aKey) { pressA(aKey.getAttribute('data-fc-a')); return; }
    if (e.target.closest('[data-fc-b]')) { var b = document.querySelector('[data-theme-toggle]'); if (b) b.click(); }
    var tab = e.target.closest('[data-proj-tab]');
    if (tab && selected && selected.hidden) {
      var first = document.querySelector('a.proj-card:not([hidden])');
      if (first) preview(first, false);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!active() || e.key !== 'Escape') return;
    if (pending || selected) { e.preventDefault(); cleanup(); resetPreview(false); }
  });
  window.addEventListener('pagehide', cleanup);
  window.addEventListener('scroll', scheduleAux, { passive: true });
  window.addEventListener('resize', scheduleAux);
  window.addEventListener('pageshow', function (e) { if (e.persisted) { cleanup(); resetPreview(false); } });
  function scan() {
    cleanup(); resetPreview(false);
    each('.fcr-preview--aux', function (el) { el.remove(); });
    if (deckObserver) deckObserver.disconnect();
    if (!active()) return;
    var h = document.querySelector('.hero'); if (h) build(h);
    menus(); setupSelection(); status();
    var deck = document.querySelector('[data-draw-cards]');
    if (deck && window.MutationObserver) {
      deckObserver = new MutationObserver(function () { cleanup(); resetPreview(false); cartridgeArt(); setupSelection(); });
      deckObserver.observe(deck, { childList: true });
    }
  }
  function init() {
    var main = document.querySelector('[data-slot="main"]');
    if (main && window.MutationObserver) new MutationObserver(scan).observe(main, { childList: true });
    if (window.MutationObserver) new MutationObserver(scan).observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] });
    scan();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
