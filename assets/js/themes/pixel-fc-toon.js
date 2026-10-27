/* Product Shot · glossy injection-moulded hardware; one-click 680ms cartridge insertion. */
(function () {
  'use strict';
  if (window.__portfolioFCProductShot) return;
  window.__portfolioFCProductShot = true;
  var SKIN = 'pixel-fc-toon';
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
  /* Product specification sections use their original content and edit anchors. */
  function menus() {
    each('.hp-block, .cover-block, .skill-card, .play-card, .detail__blocks .block', function (el, i) {
      el.setAttribute('data-ps-number', ('0' + (i + 1)).slice(-2));
    });
    each('.hp > .wrap', function (wrap) {
      var activities = wrap.querySelector(':scope > .hp-block .hpl');
      var skills = wrap.querySelector(':scope > .hp-block .hp-skills');
      if (!activities || !skills) return;
      wrap.classList.add('ps-capabilities');
      [activities, skills].forEach(function (body, i) {
        var block = body.closest('.hp-block');
        block.classList.add('ps-feature-card');
        if (!block.querySelector('.ps-feature-label')) {
          var label = i === 0 ? { ko: '01 / 경험', en: '01 / EXPERIENCE' } : { ko: '02 / 도구', en: '02 / TOOLKIT' };
          block.insertBefore(node('p', 'ps-feature-label', t(label)), block.firstChild);
        }
      });
    });
    each('.hp-games', function (games) {
      games.classList.add('ps-play-spec');
      if (!games.parentNode.querySelector('.ps-play-heading')) {
        var heading = node('h2', 'hp-h ps-play-heading', t(content().play && content().play.title));
        games.parentNode.insertBefore(heading, games);
      }
      each('.hp-game', function (game, i) {
        var item = content().play && content().play.cards && content().play.cards[i];
        if (item && t(item.note) && !game.querySelector('.ps-game-note')) {
          var note = node('p', 'ps-game-note', t(item.note));
          note.title = t(item.note); game.appendChild(note);
        }
      }, games);
    });
  }

  function productShot(hero) {
    if (!hero || hero.closest('.ps-stage')) return;
    var grid = hero.querySelector('.hero__grid'), lead = grid && grid.firstElementChild;
    if (!lead) return;
    var stage = node('div', 'ps-stage'), intro = node('div', 'ps-intro'), rig = node('div', 'ps-rig');
    hero.parentNode.insertBefore(stage, hero); stage.appendChild(intro); stage.appendChild(rig); rig.appendChild(hero);
    /* 홈: 카트리지 진열판을 게임기 바로 밑, 같은 기울기 판(ps-rig) 위에 올립니다 */
    var tray = stage.parentNode.querySelector(':scope > .draw');
    if (tray) { rig.appendChild(tray); stage.classList.add('ps-stage--rig'); }
    var actions = lead.querySelector('.btn-row');
    while (lead.firstChild) intro.appendChild(lead.firstChild);
    lead.className = 'ps-lcd-info';
    var portrait = hero.querySelector('.hero__portrait');
    if (portrait) {
      var quip = portrait.querySelector('.quip'), more = portrait.querySelector('.quip__more'), cap = portrait.querySelector('.portrait__cap');
      if (cap) lead.appendChild(cap);
      if (quip) lead.appendChild(quip);
      if (more) lead.appendChild(more);
    } else {
      lead.appendChild(node('p', 'portrait__nm', t(content().meta.name)));
      lead.appendChild(node('p', 'portrait__role', t(content().meta.role)));
      var note = intro.querySelector('.hero__note'); if (note) lead.appendChild(note);
    }
    if (actions) lead.appendChild(actions);
    hero.appendChild(node('div', 'ps-speaker'));
    var mark = node('span', 'ps-device-mark', 'KJS / 01'); mark.setAttribute('aria-hidden', 'true'); hero.appendChild(mark);
    var slot = node('div', 'ps-socket'); slot.setAttribute('aria-hidden', 'true'); hero.appendChild(slot);
    var caption = node('p', 'ps-caption', t({ko:'김지수의 포트폴리오 · 프로젝트를 꽂아 시작하세요',en:'JISU KIM’S PORTFOLIO · INSERT A PROJECT TO START'}));
    (tray ? intro : stage).appendChild(caption);
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
    var heroWrap = document.querySelector('.hero > .wrap');
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
    each('.hero.is-slot', function (el) { el.classList.remove('is-slot'); });
  }
  function insert(a) {
    var face = a.classList.contains('gcard') ? a : a.querySelector('.gcard');
    if (!face || !face.animate) { window.location.assign(a.href); return; }
    cleanup();
    var aux = document.querySelector('.fcr-preview--aux'); if (aux) aux.hidden = true;
    var r = a.getBoundingClientRect(), hero = document.querySelector('.hero.fc-console');
    var hr = hero && hero.getBoundingClientRect();
    var useHero = !!(hr && hr.bottom > navH() + 30 && hr.bottom < window.innerHeight - 40);
    var line, cx, slot;
    if (useHero) {
      hero.classList.add('is-slot');
      var socket = hero.querySelector('.ps-socket');
      var socketRect = socket ? socket.getBoundingClientRect() : hr;
      line = socketRect.bottom - 3; cx = socketRect.left + socketRect.width / 2;
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
  var applied = false;
  function scan() {
    if (!active()) {
      if (applied) {
        cleanup(); resetPreview(false);
        each('.fcr-preview--aux', function (el) { el.remove(); });
        if (deckObserver) deckObserver.disconnect();
      }
      applied = false; return;
    }
    applied = true;
    cleanup(); resetPreview(false);
    each('.fcr-preview--aux', function (el) { el.remove(); });
    if (deckObserver) deckObserver.disconnect();
    var h = document.querySelector('.hero'); if (h) { build(h); productShot(h); }
    menus(); setupSelection(); status();
    var deck = document.querySelector('[data-draw-cards]');
    if (deck && window.MutationObserver) {
      deckObserver = new MutationObserver(function () { cleanup(); resetPreview(false); setupSelection(); });
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
