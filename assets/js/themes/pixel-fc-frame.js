/* Full Frame: 고정 하드웨어 / 스크롤 액정 / 700ms 카트리지 삽입.
   공개 렌더·뽑기 API를 보존하고 main이 다시 그려지면 구조를 복원합니다. */
(function () {
  'use strict';
  if (window.__portfolioFCFrame) return;
  window.__portfolioFCFrame = true;
  var SKIN = 'pixel-fc-frame';
  var T = {
    select: 'SELECT',
    title: { ko: '타이틀 화면', en: 'TITLE SCREEN' },
    ready: { ko: '카트리지 대기', en: 'CARTRIDGE READY' },
    loading: { ko: '카트리지 읽는 중', en: 'READING CARTRIDGE' },
    slot: { ko: '카트리지 슬롯', en: 'Cartridge slot' },
    screen: { ko: '포트폴리오 액정 · 이 안에서 스크롤', en: 'Portfolio display · Scroll inside' },
    scroll: { ko: '아래로 · 게임 선택', en: 'SCROLL · GAME SELECT' },
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
    prompt: { ko: '카트리지를 골라주세요.', en: 'Select a cartridge.' },
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
  function lcd() { return document.querySelector('.fcf-lcd'); }
  function navH() { var el = lcd(); return el ? el.getBoundingClientRect().top + 12 : 76; }
  function scrollToY(y) {
    var el = lcd(); if (!el) return;
    el.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'instant' : 'smooth' });
  }
  function scrollToElement(el) {
    var screen = lcd();
    if (el && screen) scrollToY(screen.scrollTop + el.getBoundingClientRect().top - screen.getBoundingClientRect().top - 18);
  }
  function content() { return window.PORTFOLIO_CONTENT || {}; }

  /* 하드웨어는 main 밖에 유지합니다. main을 다시 렌더해도 액정 스크롤과 슬롯은 남습니다. */
  function build() {
    var main = document.querySelector('[data-slot="main"]'); if (!main) return;
    var screen = lcd();
    if (!screen) {
      screen = node('div', 'fcf-lcd');
      screen.setAttribute('role', 'region'); screen.setAttribute('tabindex', '0');
      main.parentNode.insertBefore(screen, main); screen.appendChild(main);
      var footer = document.querySelector('.footer'); if (footer) screen.appendChild(footer);
      screen.addEventListener('scroll', function () {
        scheduleAux();
        var top = document.querySelector('[data-to-top]');
        if (top) top.classList.toggle('is-shown', screen.scrollTop > screen.clientHeight * .6);
      }, { passive: true });
    }
    screen.setAttribute('aria-label', t(T.screen));
    if (!document.querySelector('.fcf-shell')) {
      var shell = node('div', 'fcf-shell'); shell.setAttribute('aria-hidden', 'true'); document.body.appendChild(shell);
    }
    var bezel = document.querySelector('.fcf-bezel');
    if (!bezel) { bezel = node('div', 'fcf-bezel'); document.body.appendChild(bezel); }
    bezel.innerHTML = '<span class="fcf-power"><i aria-hidden="true"></i>POWER</span>' +
      '<div class="fcf-slot" role="img" aria-label="' + esc(t(T.slot)) + '"><span></span><small>' + esc(t(T.ready)) + '</small></div>' +
      '<button class="fcf-top" type="button" data-to-top aria-label="' + esc(t({ko:'액정 맨 위로', en:'Top of display'})) + '">↑ TOP</button>';
    each('.fc-grip', function (el) { el.remove(); });
    var hero = document.querySelector('.hero');
    var hasQuip = !!document.querySelector('[data-quip]');
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

    document.body.appendChild(left); document.body.appendChild(right);
    if (hero && !hero.querySelector('.fcf-title-actions')) {
      var row = hero.querySelector('.btn-row'), media = hero.querySelector('.hero__media'), wrap = hero.querySelector('.wrap');
      if (row && media && document.body.dataset.page === 'home') {
        var actions = node('div', 'fcf-title-actions'); wrap.appendChild(actions);
        actions.appendChild(media); actions.appendChild(row);
        var cue = node('button', 'fcf-scroll-cue', t(T.scroll) + ' ↓');
        cue.type = 'button'; cue.setAttribute('data-fcf-scroll', ''); wrap.appendChild(cue);
      }
    }
    var bar = main.querySelector('.fcf-screenbar');
    if (!bar) { bar = node('div', 'fcf-screenbar'); main.insertBefore(bar, main.firstChild); }
    var page = document.body.dataset.page;
    var labels = content().nav || {};
    bar.innerHTML = '<span>01 / ' + esc(page === 'home' ? t(T.title) : t(labels[page === 'detail' ? 'projects' : page])) +
      '</span><span>JISU · PORTFOLIO <b aria-hidden="true">●</b></span>';

  }

  function sections() {
    var page = document.body.dataset.page;
    var selector = page === 'cover' ? 'main .cl-summary, main .cover-block' :
      page === 'detail' ? 'main .detail, main .detail__blocks .block, main .pager' :
      page === 'play' ? 'main .steam, main .play-card' : 'main section';
    return Array.prototype.filter.call(document.querySelectorAll(selector), function (s) {
      return !s.classList.contains('hero');
    });
  }
  function step(dir) {
    resetPreview(false);
    var app = window.PortfolioApp;
    if (document.querySelector('[data-quip]') && app && app.cycleQuip) { app.cycleQuip(dir); return; }
    var secs = sections(); if (!secs.length) return;
    var cur = -1;
    for (var i = 0; i < secs.length; i++) if (secs[i].getBoundingClientRect().top <= navH() + 12) cur = i;
    scrollToElement(secs[Math.max(0, Math.min(secs.length - 1, cur + dir))]);
  }
  function pressA(kind) {
    if (selected && selected.isConnected) { selected.click(); return; }
    if (kind === 'draw') {
      var deck = document.querySelector('[data-draw]'); if (!deck) return;
      deck.click(); scrollToElement(document.querySelector('.draw'));
    } else {
      var secs = sections(), next = secs.filter(function (s) { return s.getBoundingClientRect().top > navH() + 20; })[0];
      if (next) scrollToElement(next); else scrollToY(0);
    }
  }
  function each(selector, fn, root) { Array.prototype.forEach.call((root || document).querySelectorAll(selector), fn); }
  function node(tag, cls, value) {
    var el = document.createElement(tag); el.className = cls;
    if (value !== undefined) el.textContent = value;
    return el;
  }
  function titlebar(el, code) {
    if (!el || el.classList.contains('fcr-title')) return;
    el.classList.add('fcr-title');
    var label = node('span', 'fcr-title__label');
    while (el.firstChild) label.appendChild(el.firstChild);
    el.appendChild(label);
    if (code) el.appendChild(node('span', 'fcr-code', code));
  }
  function panelAround(wrap) {
    if (!wrap || wrap.querySelector(':scope > .fcr-page-window')) return;
    var panel = node('div', 'fcr-window fcr-page-window');
    while (wrap.firstChild) panel.appendChild(wrap.firstChild);
    wrap.appendChild(panel);
    var head = panel.querySelector('.section__head');
    if (head) {
      head.classList.add('fcr-titlebar');
      var lead = head.querySelector('.section__lead');
      if (lead) head.insertAdjacentElement('afterend', lead);
    }
  }

  /* 메뉴 창: 원래 데이터·편집 앵커·브랜드 로고를 보존하며 바깥 구조만 정돈합니다. */
  function menus() {
    each('.hp-block', function (block) {
      block.classList.add('fcr-window');
      titlebar(block.querySelector('.hp-h'), t(block.querySelector('.hpl') ? T.saves : block.querySelector('.hp-skills') ? T.inventory : T.status));
    });
    var activities = document.querySelector('.hp .hpl');
    if (activities) activities.closest('.wrap').classList.add('fcr-home-resume');
    each('.hpl-row', function (row, i) {
      var thumb = row.querySelector('.hp-thumb');
      if (thumb) thumb.setAttribute('data-fcr-slot', ('0' + (i + 1)).slice(-2));
    });
    each('.hp-skills', function (grid) {
      if (!grid.querySelector('.fcr-inventory-empty')) {
        var empty = node('span', 'fcr-inventory-empty');
        empty.setAttribute('aria-hidden', 'true'); grid.appendChild(empty);
      }
    });
    each('.cl-summary', function (summary) {
      summary.classList.add('fcr-window'); titlebar(summary.querySelector('.cl-summary__t'), t(T.status));
    });
    each('.cover-block', function (block, i) {
      block.classList.add('fcr-window', 'fcr-story');
      titlebar(block.querySelector('h3'), ('0' + (i + 1)).slice(-2) + ' / ' + t(T.record));
    });
    each('.hp-games', function (games) {
      if (games.parentNode.classList.contains('fcr-play-window')) return;
      var panel = node('div', 'fcr-window fcr-play-window');
      var heading = node('h2', 'hp-h', t(content().play && content().play.title));
      titlebar(heading, t(T.record));
      games.parentNode.insertBefore(panel, games); panel.appendChild(heading); panel.appendChild(games);
      var items = (content().play && content().play.cards) || [];
      each('.hp-game', function (game, i) {
        var body = node('div', 'fcr-game-body');
        var title = game.querySelector('.hp-game__t'), sub = game.querySelector('.hp-game__b');
        if (title) body.appendChild(title);
        if (sub) body.appendChild(sub);
        if (items[i] && t(items[i].note)) body.appendChild(node('p', 'fcr-game-note', t(items[i].note)));
        game.appendChild(body);
      }, games);
    });
    if (document.body.getAttribute('data-page') === 'resume') {
      each('main > .section', function (section) {
        if (section.querySelector('.section__head')) panelAround(section.querySelector('.wrap'));
      });
    }
    each('.skill-card, .play-card', function (card, i) {
      card.classList.add('fcr-item-window');
      card.setAttribute('data-fcr-number', ('0' + (i + 1)).slice(-2));
    });
    each('.detail__learned', function (box) {
      box.classList.add('fcr-window', 'fcr-learned'); titlebar(box.querySelector('.detail__learned-title'), t(T.record));
    });
    each('.detail__media', function (box) {
      if (box.classList.contains('fcr-window')) return;
      box.classList.add('fcr-window');
      var media = box.querySelector('.media-box');
      var heading = node('h2', 'fcr-media-title', t(media && media.classList.contains('media-box--empty') ? T.emptyMedia : T.media));
      titlebar(heading); box.insertBefore(heading, box.firstChild);
    });
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
      var actions = hero.querySelector('.fcf-title-actions');
      if (actions) actions.removeAttribute('inert');
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
    el.querySelector('.fcr-preview__footer').hidden = false;
    fadePreview(el.querySelector('.fcr-preview__body'));
    previewA(true);
    var hero = el.closest('.hero');
    if (hero) {
      hero.classList.add('is-fcr-previewing');
      var actions = hero.querySelector('.fcf-title-actions');
      if (actions) actions.setAttribute('inert', '');
      var grid = hero.querySelector('.hero__grid');
      if (grid) { grid.setAttribute('inert', ''); grid.setAttribute('aria-hidden', 'true'); }
      var aux = document.querySelector('.fcr-preview--aux');
      if (aux) aux.querySelector('.fcr-preview__body').innerHTML = previewHtml(p, a);
      positionAux();
    }
    if (announce) announceProject(p);
  }
  function announceProject(p) {
    status().textContent = [t(p.title), t(p.sub), t(T.period) + ': ' + t(p.period), t(T.role) + ': ' + t(p.myRole), t(p.quest && p.quest.goal), t(p.quest && p.quest.result)].filter(Boolean).join('. ');
  }
  // 타이틀 화면이 스크롤 밖이면 액정 위쪽에 읽기 전용 미리보기를 표시합니다.
  function positionAux() {
    var aux = document.querySelector('.fcr-preview--aux'), pane = document.querySelector('.fcr-preview--lcd');
    if (!aux || !pane) return;
    aux.hidden = true;
    if (!active() || !selected || !selected.isConnected || pane.hidden || pending) return;
    var screen = lcd().getBoundingClientRect();
    var card = selected.getBoundingClientRect(), home = document.querySelector('.fcr-preview--lcd').getBoundingClientRect();
    if (home.top >= screen.top && home.bottom <= screen.bottom) return;
    if (card.bottom <= screen.top || card.top >= screen.bottom) return;
    aux.hidden = false;
    aux.style.left = (screen.left + 16) + 'px';
    aux.style.top = (screen.top + 12) + 'px';
    aux.style.maxHeight = Math.max(80, Math.min(screen.height * .46, card.top - screen.top - 24)) + 'px';
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
    var heroWrap = document.querySelector('.hero > .wrap');
    if (heroWrap && !heroWrap.querySelector('.fcr-preview')) heroWrap.appendChild(makePreview(true));
    if (heroWrap && !document.querySelector('.fcr-preview--aux')) {
      var aux = node('div', 'fcr-preview fcr-preview--aux fcr-window');
      aux.setAttribute('aria-hidden', 'true'); aux.setAttribute('inert', ''); aux.hidden = true;
      aux.innerHTML = '<div class="fcr-preview__bar">▶ ' + esc(t(T.selection)) + '</div>' +
        '<div class="fcr-preview__body"></div><p class="fcr-preview__aux-hint">' + esc(t(T.openHint)) + '</p>';
      // 고정 미리보기 좌표는 액정의 경계 안으로 제한합니다.
      document.body.appendChild(aux);
    }
    if (head && !document.querySelector('.fcr-preview--list')) {
      var pane = makePreview(false), grid = document.querySelector('[data-proj-grid]');
      if (grid) {
        var catalog = node('div', 'fcf-catalog'), shelf = node('div', 'fcf-shelf');
        grid.parentNode.insertBefore(catalog, grid); catalog.appendChild(shelf); shelf.appendChild(grid);
        var empty = document.querySelector('[data-proj-empty]'); if (empty) shelf.appendChild(empty);
        catalog.appendChild(pane);
        pane.hidden = false; pane.querySelector('.fcr-preview__body').textContent = t(T.prompt);
        pane.querySelector('.fcr-preview__footer').hidden = true;
      }
    }
    each('a.draw-card, a.proj-card', function (a) {
      var ids = (a.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      if (ids.indexOf(hint.id) < 0) { ids.push(hint.id); a.setAttribute('aria-describedby', ids.join(' ')); }
    });
  }

  /* 420ms 이동 + 200ms 삽입 + 80ms 액정 재점등 = 한 번 선택, 700ms 후 상세. */
  function cleanup() {
    var me = pending; pending = null;
    if (me) {
      clearTimeout(me.timer);
      (me.animations || []).forEach(function (a) { a.cancel(); });
      if (me.a) { me.a.style.visibility = ''; me.a.removeAttribute('aria-busy'); }
    }
    each('.fc-fly', function (el) { el.remove(); });
    document.documentElement.classList.remove('fcf-reading');
    var label = document.querySelector('.fcf-slot small'); if (label) label.textContent = t(T.ready);
  }
  function insert(a) {
    if (pending) return;
    var face = a.classList.contains('gcard') ? a : a.querySelector('.gcard');
    var slot = document.querySelector('.fcf-slot > span');
    if (!face || !face.animate || !slot || reduced()) { window.location.assign(a.href); return; }
    var aux = document.querySelector('.fcr-preview--aux'); if (aux) aux.hidden = true;
    var r = a.getBoundingClientRect(), sr = slot.getBoundingClientRect();
    var fly = node('div', 'fc-fly'); fly.setAttribute('aria-hidden', 'true'); fly.setAttribute('inert', '');
    fly.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
    var clone = face.cloneNode(true);
    clone.classList.remove('is-tilt', 'reveal', 'is-visible', 'is-fcr-preview'); clone.classList.add('fc-fly__card');
    clone.removeAttribute('style'); clone.removeAttribute('href'); clone.removeAttribute('aria-describedby');
    each('[id]', function (el) { el.removeAttribute('id'); }, clone);
    fly.appendChild(clone); document.body.appendChild(fly);
    a.style.visibility = 'hidden'; a.setAttribute('aria-busy', 'true');
    var me = pending = { a: a, animations: [] };
    document.documentElement.classList.add('fcf-reading');
    document.querySelector('.fcf-slot small').textContent = t(T.loading);
    status().textContent = t(T.loading);
    function finish() {
      if (pending !== me) return;
      var url = a.href; cleanup(); window.location.assign(url);
    }
    me.timer = setTimeout(finish, 750);
    var scale = Math.min(.68, (sr.width - 16) / r.width);
    var dx = sr.left + sr.width / 2 - r.left - r.width / 2;
    var dy = sr.top - r.top - r.height * scale - (r.height * (1 - scale) / 2);
    function at(x, y, sc) { return 'translate(' + x + 'px,' + y + 'px) scale(' + sc + ')'; }
    try {
      var animation = fly.animate([
        { transform: at(0, 0, 1), clipPath: 'inset(0)', offset: 0 },
        { transform: at(dx, dy, scale), clipPath: 'inset(0)', offset: .6 },
        { transform: at(dx, dy + r.height * scale, scale), clipPath: 'inset(0 0 100% 0)', offset: .886 },
        { transform: at(dx, dy + r.height * scale, scale), clipPath: 'inset(0 0 100% 0)', offset: 1 }
      ], { duration: 700, fill: 'forwards', easing: 'cubic-bezier(.3,.65,.3,1)' });
      me.animations.push(animation); animation.onfinish = finish;
      me.animations.push(lcd().animate([{ opacity: 1 }, { opacity: .2 }, { opacity: 1 }], { duration: 80, delay: 620, fill: 'both' }));
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
    var toTop = e.target.closest('[data-to-top]');
    var cue = e.target.closest('[data-fcf-scroll]');
    var anchor = e.target.closest('a[href^="#"]');
    if (toTop || cue || anchor) {
      var target = cue ? document.querySelector('.draw') : anchor ? document.getElementById(anchor.hash.slice(1)) : null;
      if (toTop || target) {
        e.preventDefault(); e.stopImmediatePropagation();
        if (toTop) scrollToY(0); else scrollToElement(target);
        if (anchor && target) { target.setAttribute('tabindex', '-1'); target.focus({preventScroll:true}); }
        return;
      }
    }
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
  var mainObserver = null;
  function unmount() {
    var screen = lcd();
    if (screen) {
      while (screen.firstChild) screen.parentNode.insertBefore(screen.firstChild, screen);
      screen.remove();
    }
    each('.fcf-shell, .fcf-bezel, .fc-grip, .fcr-preview--aux', function (el) { el.remove(); });
  }
  function scan() {
    var main = document.querySelector('[data-slot="main"]');
    if (mainObserver) mainObserver.disconnect();
    cleanup(); resetPreview(false);
    each('.fcr-preview--aux', function (el) { el.remove(); });
    if (deckObserver) deckObserver.disconnect();
    if (!active()) { unmount(); return; }
    build(); menus(); setupSelection(); status();
    var deck = document.querySelector('[data-draw-cards]');
    if (deck && window.MutationObserver) {
      deckObserver = new MutationObserver(function () { cleanup(); resetPreview(false); setupSelection(); });
      deckObserver.observe(deck, { childList: true });
    }
    if (main && mainObserver) mainObserver.observe(main, { childList: true });
  }
  function init() {
    if (window.MutationObserver) {
      mainObserver = new MutationObserver(scan);
      new MutationObserver(scan).observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] });
    }
    scan();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
