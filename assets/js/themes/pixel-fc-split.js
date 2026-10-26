/* Docked · fixed console + scrolling cartridge library. Scoped to this skin. */
(function () {
  'use strict';
  if (window.__portfolioFCSplit) return;
  window.__portfolioFCSplit = true;
  var SKIN = 'pixel-fc-split';
  var T = {
    select: 'SELECT',
    dock: { ko: '고정 게임기', en: 'DOCKED CONSOLE' },
    library: { ko: '프로젝트 보관함', en: 'PROJECT LIBRARY' },
    choose: { ko: '다음에 꽂을 프로젝트는?', en: 'What will you play next?' },
    rackHint: { ko: '올리거나 포커스하면 액정에 미리보기 · 한 번 눌러 상세로', en: 'Hover or focus to preview on the console · Select once to open details' },
    random: { ko: '랜덤 선택', en: 'Random pick' },
    dockNote: { ko: '카트리지를 올려 보세요. 이 화면에서 바로 확인할 수 있습니다.', en: 'Hover over a cartridge. Your preview stays right here.' },
    slot: { ko: '카트리지 슬롯', en: 'CARTRIDGE SLOT' },
    ready: { ko: '선택 대기', en: 'READY' },
    prevQ: { ko: '이전 한마디', en: 'Previous quip' },
    nextQ: { ko: '다음 한마디', en: 'Next quip' },
    prevS: { ko: '이전 절로', en: 'Previous section' },
    nextS: { ko: '다음 절로', en: 'Next section' },
    light: { ko: '밝기', en: 'Light' },
    lightA: { ko: '다크 · 라이트 전환', en: 'Toggle dark mode' },
    draw: { ko: '랜덤', en: 'Random' },
    drawA: { ko: '프로젝트 무작위 선택', en: 'Pick a random project' },
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
  function navH() {
    var n = document.querySelector('.nav');
    return (n ? n.getBoundingClientRect().height : 60) + (window.innerWidth < 1100 ? 180 : 16);
  }
  function scrollToY(y) { try { window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, Math.max(0, y)); } }
  function content() { return window.PORTFOLIO_CONTENT || {}; }

  /* ── 손잡이 버튼 ─────────────────────────────────────────────────────── */
  function build(hero) {
    if (!active() || hero.querySelector('.fc-grip')) return;
    var wrap = hero.querySelector('.wrap'); if (!wrap) return;
    var hasQuip = !!hero.querySelector('[data-quip]');
    var hasDeck = !!document.querySelector('[data-fcs-random]');
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
    return Array.prototype.filter.call(document.querySelectorAll('.fcs-reader section'), function (s) {
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
      var deck = document.querySelector('[data-fcs-random]'); if (!deck) return;
      deck.click();
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
      each('.fcs-reader > .section', function (section) {
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

  var selected = null, pending = null, restoringFocus = false;
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
    }
    if (announce) announceProject(p);
  }
  function announceProject(p) {
    status().textContent = [t(p.title), t(p.sub), t(T.period) + ': ' + t(p.period), t(T.role) + ': ' + t(p.myRole), t(p.quest && p.quest.goal), t(p.quest && p.quest.result)].filter(Boolean).join('. ');
  }
  function setupSelection() {
    var heroWrap = document.querySelector('.fcs-dock .hero > .wrap');
    if (heroWrap && !heroWrap.querySelector('.fcr-preview')) heroWrap.appendChild(makePreview(true));
    each('a.draw-card, a.proj-card', function (a) {
      a.setAttribute('aria-describedby', 'fcs-rack-hint');
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
    var r = a.getBoundingClientRect(), hero = document.querySelector('.fcs-dock .hero.fc-console');
    var target = hero && hero.querySelector('.fcs-slot');
    if (!target) { window.location.assign(a.href); return; }
    var sr = target.getBoundingClientRect();
    hero.classList.add('is-slot');
    var line = sr.top + sr.height / 2, cx = sr.left + sr.width / 2;
    var fly = node('div', 'fc-fly'); fly.setAttribute('aria-hidden', 'true'); fly.setAttribute('inert', '');
    fly.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
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
    var scale = Math.min(1, (sr.width - 12) / r.width);
    var dx = cx - r.left - r.width / 2, dy = line - r.top;
    function at(x, y, sc) { return 'translate(' + x + 'px,' + y + 'px) scale(' + (sc || 1) + ')'; }
    fly.style.transformOrigin = 'top center';
    try {
      var animation = fly.animate([
        { transform: at(0, 0), clipPath: 'inset(0 0 0 0)', offset: 0 },
        { transform: at(dx * .25, dy * .15), clipPath: 'inset(0 0 0 0)', offset: .2 },
        { transform: at(dx, dy, scale), clipPath: 'inset(0 0 0 0)', offset: 420 / 680 },
        { transform: at(dx, dy - r.height * scale, scale), clipPath: 'inset(100% 0 0 0)', offset: 1 }
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
    var a = e.target.closest('a.draw-card, a.proj-card');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    if (reduced()) { cleanup(); return; }
    e.preventDefault(); e.stopPropagation(); insert(a);
  }, true);
  document.addEventListener('click', function (e) {
    if (!active() || !e.target.closest) return;
    if (e.target.closest('[data-fcs-random]')) {
      var cards = Array.prototype.filter.call(document.querySelectorAll('.fcs-reader a.proj-card'), function (a) { return !a.hidden; });
      if (cards.length) {
        var card = cards[Math.floor(Math.random() * cards.length)];
        card.focus({ preventScroll: true }); preview(card, true);
        card.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
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
      if (first) preview(first, false); else resetPreview(false);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!active() || e.key !== 'Escape') return;
    if (pending || selected) { e.preventDefault(); cleanup(); resetPreview(false); }
  });
  window.addEventListener('pagehide', function () { if (active() || pending) cleanup(); });
  window.addEventListener('pageshow', function (e) { if (active() && e.persisted) { cleanup(); resetPreview(false); } });
  /* Build one app shell per main render. Only the shell changes; card faces and
     editor anchors are retained. The observer is paused during our own moves. */
  function layout(main) {
    if (main.querySelector(':scope > .fcs-app')) return;
    var page = document.body.getAttribute('data-page') || 'home';
    var base = page === 'detail' ? '../' : '';
    var c = content(), R = window.PortfolioRender;
    var app = node('div', 'fcs-app'), dock = node('aside', 'fcs-dock'), reader = node('div', 'fcs-reader');
    var hero = main.querySelector('.hero');
    var home = main.querySelector('.home-screen');
    if (home) { while (home.firstChild) main.insertBefore(home.firstChild, home); home.remove(); }
    var draw = main.querySelector('.draw');
    if (draw && R) {
      var rack = node('section', 'fcs-library fcr-window');
      rack.innerHTML = '<header class="fcs-library-head"><p class="fcs-kicker">' + esc(t(T.library)) + ' / ' + ('0' + ((c.projects && c.projects.items) || []).length).slice(-2) + '</p>' +
        '<div><h2>' + esc(t(T.choose)) + '</h2><button type="button" data-fcs-random>↻ ' + esc(t(T.random)) + '</button></div></header>' +
        '<p class="fcs-rack-hint" id="fcs-rack-hint">' + esc(t(T.rackHint)) + '</p><div class="fcs-rack proj-grid"></div>';
      var grid = rack.querySelector('.fcs-rack');
      ((c.projects && c.projects.items) || []).forEach(function (p, i) {
        var temp = node('div', ''); temp.innerHTML = R.drawCardHtml(c, lang(), base, p, i);
        var a = temp.firstElementChild, face = a.querySelector('.gcard');
        a.className = 'proj-card gcard'; a.removeAttribute('style');
        a.setAttribute('data-grade', face.getAttribute('data-grade'));
        a.setAttribute('data-cat', p.category || '');
        a.innerHTML = face.innerHTML; grid.appendChild(a);
      });
      draw.replaceWith(rack);
    }
    var title = main.querySelector('.proj-title, .detail__title, .section__title');
    var lead = main.querySelector('.section__lead');
    if (!hero) {
      hero = node('section', 'hero');
      hero.innerHTML = '<div class="wrap"><div class="hero__grid"><div><p class="hero__eyebrow">' + esc(t((c.nav || {})[page === 'detail' ? 'projects' : page])) + '</p></div><div class="hero__media"></div></div></div>';
      var intro = hero.querySelector('.hero__grid > div');
      var heading = node('h1', 'hero__title');
      if (title) {
        // Moving the real heading preserves its content-editing anchor.
        heading.innerHTML = title.innerHTML;
        Array.prototype.forEach.call(title.attributes, function (attr) { if (attr.name !== 'class') heading.setAttribute(attr.name, attr.value); });
        title.replaceWith(heading); intro.appendChild(heading);
      } else { heading.textContent = t((c.nav || {})[page]) || t(T.dock); intro.appendChild(heading); }
      var summary = lead ? lead.textContent : page === 'cover' ? t(c.coverLetter && c.coverLetter.summary && c.coverLetter.summary.title) : '';
      if (page === 'detail') {
        var p = ((c.projects && c.projects.items) || []).filter(function (item) { return item.id === new URLSearchParams(location.search).get('p'); })[0];
        if (p) {
          summary = t(p.sub);
          var temp = node('div', ''); temp.innerHTML = R.drawCardHtml(c, lang(), base, p, 0);
          var art = temp.querySelector('.gcard__art');
          if (art) { var artBox = node('div', 'fcs-page-art fcr-preview__art'); artBox.innerHTML = art.innerHTML; hero.querySelector('.hero__media').appendChild(artBox); }
        }
      }
      if (summary) intro.appendChild(node('p', 'hero__sub', summary));
      if (!hero.querySelector('.hero__media').firstChild) {
        var photo = c.home && c.home.player && c.home.player.photo;
        if (photo) hero.querySelector('.hero__media').innerHTML = '<figure class="portrait"><img src="' + esc(base + photo) + '" alt="' + esc(t(c.meta.name)) + '"></figure>';
      }
    } else if (page === 'resume') {
      var heading = hero.querySelector('.hero__title');
      heading.textContent = t(c.nav.resume); heading.removeAttribute('data-e');
      hero.querySelector('.hero__note').classList.add('fcs-page-summary');
    }
    dock.innerHTML = '<div class="fcs-dock-head"><span>01 / ' + esc(t(T.dock)) + '</span><span class="fcs-ready">● ' + esc(t(T.ready)) + '</span></div>';
    dock.appendChild(hero);
    var slot = node('div', 'fcs-slot'); slot.setAttribute('aria-hidden', 'true');
    slot.innerHTML = '<span>' + esc(t(T.slot)) + '</span>'; hero.appendChild(slot);
    dock.appendChild(node('p', 'fcs-dock-note', t(T.dockNote)));
    while (main.firstChild) reader.appendChild(main.firstChild);
    var projectHead = reader.querySelector('.proj-head');
    if (projectHead) {
      var hint = node('p', 'fcs-rack-hint', t(T.rackHint)); hint.id = 'fcs-rack-hint';
      projectHead.insertAdjacentElement('afterend', hint);
      var random = node('button', 'fcs-random', '↻ ' + t(T.random)); random.type = 'button'; random.setAttribute('data-fcs-random', ''); projectHead.appendChild(random);
    }
    // Resume skills and all other windows now use the width of the reading column.
    app.appendChild(dock); app.appendChild(reader); main.appendChild(app);
    if (!reader.querySelector('#fcs-rack-hint')) {
      var hint = node('span', 'sr-only', t(T.rackHint)); hint.id = 'fcs-rack-hint'; reader.appendChild(hint);
    }
    build(hero);
  }
  var mainObserver;
  function scan() {
    if (mainObserver) mainObserver.disconnect();
    var main = document.querySelector('[data-slot="main"]');
    try {
      if (active() && main) {
        cleanup(); resetPreview(false);
        layout(main); menus(); setupSelection(); status();
      } else if (pending) cleanup();
    } finally {
      if (mainObserver && main) mainObserver.observe(main, { childList: true });
    }
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
