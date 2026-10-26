/* 개선안 B · 진열장. 원본 기기/카드 구조는 유지하고 선택과 읽기 단계를 줄입니다.
   부모 테마 famicom.js도 함께 로드되므로 동작용 data-fcs-* / fcs-fly를 따로 씁니다. */
(function () {
  'use strict';
  var SKIN = 'pixel-fc-shelf';
  var T = {
    select: 'SELECT',
    prevQ:  { ko: '이전 한마디',   en: 'Previous quip' },
    nextQ:  { ko: '다음 한마디',   en: 'Next quip' },
    prevS:  { ko: '이전 절로',     en: 'Previous section' },
    nextS:  { ko: '다음 절로',     en: 'Next section' },
    light:  { ko: '밝기',          en: 'Light' },
    lightA: { ko: '다크 · 라이트 전환', en: 'Toggle dark mode' },
    draw:   { ko: '랜덤',          en: 'Random' },
    drawA:  { ko: '진열장에서 랜덤 한 장 고르기', en: 'Pick a random cartridge from the shelf' },
    down:   { ko: '아래로',        en: 'Down' },
    downA:  { ko: '아래 내용으로',  en: 'Scroll to the content' },
    mail:   { ko: '메일',          en: 'Mail' },
    mailA:  { ko: '이메일 보내기',  en: 'Send me an email' },
    view:   { ko: '전체 문서 보기', en: 'Read full document' },
    viewS:  { ko: '문서',          en: 'Document' },
    eject:  { ko: '꺼내기',        en: 'Eject' },
    team:   { ko: '인원',          en: 'Team' },
    role:   { ko: '역할',          en: 'Role' },
    status: { ko: '상태',          en: 'Status' },
    quest:  { ko: '퀘스트',        en: 'Quest' }
  };
  /* 손잡이 메일 키 아이콘 (봉투) */
  var MAIL_SVG = '<svg viewBox="0 0 18 14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">' +
    '<rect x="1" y="1.6" width="16" height="11" /><path d="m1.6 2.4 7.4 5.6 7.4-5.6" stroke-linejoin="round"/></svg>';

  function lang() {
    var v = window.PortfolioApp && window.PortfolioApp.getLang ? window.PortfolioApp.getLang() : document.documentElement.getAttribute('lang');
    return v === 'en' ? 'en' : 'ko';
  }
  function t(o) { var L = lang(); return typeof o === 'string' ? o : (o && (o[L] || o.ko)) || ''; }
  function esc(s) { return window.PortfolioRender.esc(s); }
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
    var hasDeck = !!document.querySelector('[data-fcs-shelf]');
    var mail = ((content().meta && content().meta.email) || '').trim();   /* content.js 의 meta.email */

    var left = document.createElement('div');
    left.className = 'fc-grip fc-grip--l';
    left.innerHTML =
      '<span class="fc-lbl">' + T.select + '</span>' +
      '<button type="button" class="fc-key" data-fcs-step="-1" aria-label="' + esc(t(hasQuip ? T.prevQ : T.prevS)) + '"><span aria-hidden="true">◀</span></button>' +
      '<button type="button" class="fc-key" data-fcs-step="1" aria-label="' + esc(t(hasQuip ? T.nextQ : T.nextS)) + '"><span aria-hidden="true">▶</span></button>' +
      /* 메일 키 — 누르면 메일 앱이 열립니다 (이메일은 content.js 의 meta.email 한 곳에서) */
      (mail ? '<span class="fc-ab"><a class="fc-key fc-key--mail" href="mailto:' + esc(mail) + '" aria-label="' + esc(t(T.mailA) + ' — ' + mail) + '">' + MAIL_SVG + '</a>' +
              '<span class="fc-lbl">' + esc(t(T.mail)) + '</span></span>' : '');

    var right = document.createElement('div');
    right.className = 'fc-grip fc-grip--r';
    right.innerHTML =
      '<span class="fc-ab"><button type="button" class="fc-key fc-key--ab" data-fcs-b aria-label="' + esc(t(T.lightA)) + '">B</button><span class="fc-lbl" data-fcs-lbl="b">' + esc(t(T.light)) + '</span></span>' +
      '<span class="fc-ab"><button type="button" class="fc-key fc-key--ab" data-fcs-a="' + (hasDeck ? 'draw' : 'down') + '" aria-label="' + esc(t(hasDeck ? T.drawA : T.downA)) + '">A</button><span class="fc-lbl" data-fcs-lbl="a">' + esc(t(hasDeck ? T.draw : T.down)) + '</span></span>';

    hero.classList.add('fc-console');
    hero.insertBefore(left, wrap);
    hero.appendChild(right);
  }
  /* 카트리지가 꽂혀 있는 동안 A/B 라벨을 바꿉니다 */
  function setAB(a, b) {
    var la = document.querySelector('[data-fcs-lbl="a"]'), lb = document.querySelector('[data-fcs-lbl="b"]');
    if (la) { if (!la.getAttribute('data-orig')) la.setAttribute('data-orig', la.textContent); la.textContent = a || la.getAttribute('data-orig'); }
    if (lb) { if (!lb.getAttribute('data-orig')) lb.setAttribute('data-orig', lb.textContent); lb.textContent = b || lb.getAttribute('data-orig'); }
    [[document.querySelector('[data-fcs-a]'), a ? t(T.view) : null],
     [document.querySelector('[data-fcs-b]'), b ? t(T.eject) : null]].forEach(function (pair) {
      var key = pair[0]; if (!key) return;
      if (!key.hasAttribute('data-orig-label')) key.setAttribute('data-orig-label', key.getAttribute('aria-label'));
      key.setAttribute('aria-label', pair[1] || key.getAttribute('data-orig-label'));
    });
  }

  /* 페이지의 절(section) 목록 — 히어로를 뺀 나머지 */
  function sections() {
    return Array.prototype.filter.call(document.querySelectorAll('main section'), function (s) { return !s.classList.contains('hero'); });
  }
  function step(dir) {
    var hero = document.querySelector('.hero.fc-console'); if (!hero) return;
    var app = window.PortfolioApp;
    if (hero.querySelector('[data-quip]') && app && app.cycleQuip) { app.cycleQuip(dir); return; }   /* 홈: 한마디 넘기기 */
    var secs = sections(); if (!secs.length) return;                                                  /* 그 밖: 절 이동 */
    var y = window.pageYOffset + navH() + 2, cur = -1;
    for (var i = 0; i < secs.length; i++) if (secs[i].getBoundingClientRect().top + window.pageYOffset <= y) cur = i;
    var nxt = Math.max(0, Math.min(secs.length - 1, cur + dir));
    scrollToY(secs[nxt].getBoundingClientRect().top + window.pageYOffset - navH());
  }
  var UI = {
    collection: { ko: '01 / 카트리지', en: '01 / COLLECTION' },
    shelf: { ko: '카트리지 진열장', en: 'Cartridge shelf' },
    instruction: { ko: '한 장을 꽂으면, 화면에서 바로 읽습니다.', en: 'Insert a cartridge. Read the project on screen.' },
    random: { ko: '랜덤 한 장', en: 'Pick one' },
    filter: { ko: '프로젝트 분류', en: 'Project categories' },
    count: { ko: '장 진열', en: 'cartridges on display' },
    hint: { ko: '카트리지 선택 → 액정에서 읽기', en: 'Choose a cartridge → read on screen' },
    empty: { ko: '아직 진열된 카트리지가 없습니다.', en: 'No cartridges on this shelf yet.' },
    selected: { ko: '랜덤 선택', en: 'Random pick' },
    inserting: { ko: '꽂는 중 · 아무 곳이나 누르면 바로 보기', en: 'Inserting · click anywhere to skip' },
    reading: { ko: '읽는 중', en: 'READING' },
    learned: { ko: '무엇을 배웠는지', en: 'What I learned' },
    result: { ko: '결과', en: 'Result' },
    summary: { ko: '요약 상세', en: 'Project summary' },
    play: { ko: '플레이에서 얻은 관점', en: 'Lessons from playing' }
  };
  var pending = null, mainRoot = null, lastPick = '';
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function items() { return (content().projects && content().projects.items) || []; }
  function base() { return document.body.getAttribute('data-page') === 'detail' ? '../' : ''; }
  function projectOf(a) {
    try {
      var id = new URL(a.href, location.href).searchParams.get('p');
      return items().filter(function (p) { return p.id === id; })[0];
    } catch (e) { return null; }
  }
  function pressA(kind) {
    if (pending) { if (pending.ready) location.href = pending.a.href; else finishInsert(); return; }
    if (kind === 'draw') { randomPick(); return; }
    var secs = sections();
    if (secs.length) scrollToY(secs[0].getBoundingClientRect().top + window.pageYOffset - navH());
  }
  function pressB() {
    if (pending) { cleanup(true); return; }
    var b = document.querySelector('[data-theme-toggle]'); if (b) b.click();
  }
  function filterButtons() {
    var tabs = (content().projects && content().projects.tabs) || {};
    return '<div class="fcs-filters" role="group" aria-label="' + esc(t(UI.filter)) + '">' +
      ['all', 'game', 'planning'].filter(function (key) { return tabs[key]; }).map(function (key) {
        return '<button type="button" data-fcs-filter="' + key + '" aria-pressed="' + (key === 'all') + '">' + esc(t(tabs[key])) + '</button>';
      }).join('') + '</div>';
  }
  function randomButton() { return '<button type="button" class="fcs-random" data-fcs-random><span aria-hidden="true">↻</span> ' + esc(t(UI.random)) + '</button>'; }
  function shelfFoot() {
    return '<div class="fcs-shelf__foot"><span data-fcs-count></span><span>' + esc(t(UI.hint)) + '</span></div>' +
      '<p class="sr-only" role="status" aria-live="polite" data-fcs-status></p>';
  }
  function prepareShelf() {
    var draw = document.querySelector('.draw'), grid = document.querySelector('[data-proj-grid]');
    if (draw && !draw.hasAttribute('data-fcs-shelf')) {
      draw.setAttribute('data-fcs-shelf', '');
      draw.innerHTML = '<div class="wrap"><div class="fcs-library-head fcs-library-head--home"><h2 class="hp-h">' + esc(t(UI.shelf)) + '</h2><div class="fcs-library-label"><p class="fcs-kicker">' + esc(t(UI.collection)) + '</p>' +
        '<p class="fcs-instruction">' + esc(t(UI.instruction)) + '</p></div></div>' +
        '<div class="fcs-toolbar">' + filterButtons() + randomButton() + '</div>' +
        '<div class="fcs-shelf"><div class="fcs-shelf__cards" data-fcs-cards>' + items().map(function (p, i) {
          return window.PortfolioRender.drawCardHtml(content(), lang(), base(), p, i);
        }).join('') + '</div>' + shelfFoot() + '</div></div>';
      all('a.draw-card', draw).forEach(function (a) {
        var p = projectOf(a); if (p) a.setAttribute('data-cat', p.category || '');
      });
    } else if (grid && !grid.hasAttribute('data-fcs-cards')) {
      var section = grid.closest('.section'), head = section.querySelector('.proj-head'), oldTabs = head.querySelector('.tabs');
      section.setAttribute('data-fcs-shelf', ''); section.classList.add('fcs-project-library');
      if (oldTabs) oldTabs.remove();
      head.classList.add('fcs-library-head');
      var kicker = document.createElement('p'); kicker.className = 'fcs-kicker'; kicker.textContent = t(UI.collection); head.prepend(kicker);
      var instruction = document.createElement('p'); instruction.className = 'fcs-instruction'; instruction.textContent = t(UI.instruction); head.appendChild(instruction);
      head.insertAdjacentHTML('afterend', '<div class="fcs-toolbar">' + filterButtons() + randomButton() + '</div>');
      var shelf = document.createElement('div'); shelf.className = 'fcs-shelf'; grid.before(shelf); shelf.appendChild(grid);
      grid.classList.add('fcs-shelf__cards'); grid.setAttribute('data-fcs-cards', '');
      shelf.insertAdjacentHTML('beforeend', shelfFoot());
      // Cards remain the renderer's original cartridge markup, including period labels.
      all('.proj-card', grid).forEach(function (a) { a.classList.add('is-visible'); });
      var empty = section.querySelector('[data-proj-empty]'); if (empty) empty.remove();
    }
    var shelf = document.querySelector('[data-fcs-shelf]');
    if (shelf) {
      shelf.style.setProperty('--fcs-columns', Math.max(1, items().length));
      filterShelf('all');
    }
  }
  function filterShelf(cat) {
    var shelf = document.querySelector('[data-fcs-shelf]'); if (!shelf) return;
    all('[data-fcs-filter]', shelf).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-fcs-filter') === cat)); });
    var count = 0;
    all('[data-fcs-cards] > a', shelf).forEach(function (a) {
      a.hidden = cat !== 'all' && a.getAttribute('data-cat') !== cat;
      a.classList.remove('is-picked');
      if (!a.hidden) count++;
    });
    var rail = shelf.querySelector('[data-fcs-cards]');
    rail.scrollLeft = 0;
    var empty = rail.querySelector('.fcs-empty');
    if (!empty) { empty = document.createElement('p'); empty.className = 'fcs-empty'; empty.textContent = t(UI.empty); rail.appendChild(empty); }
    empty.hidden = count > 0;
    shelf.querySelector('[data-fcs-count]').textContent = String(count).padStart(2, '0') + ' / ' + items().length + ' ' + t(UI.count);
    shelf.querySelector('[data-fcs-random]').disabled = count === 0;
    shelf.querySelector('[data-fcs-status]').textContent = '';
  }
  function randomPick() {
    var shelf = document.querySelector('[data-fcs-shelf]'); if (!shelf) return;
    var cards = all('[data-fcs-cards] > a', shelf).filter(function (a) { return !a.hidden; });
    if (!cards.length) return;
    var pool = cards.filter(function (a) { return a.href !== lastPick; }); if (!pool.length) pool = cards;
    var a = pool[Math.floor(Math.random() * pool.length)]; lastPick = a.href;
    cards.forEach(function (c) { c.classList.remove('is-picked'); });
    a.classList.add('is-picked'); a.focus({ preventScroll: true });
    a.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'nearest', inline: 'center' });
    var p = projectOf(a); shelf.querySelector('[data-fcs-status]').textContent = t(UI.selected) + ': ' + (p ? t(p.title) : a.textContent);
  }
  function summaryHtml(p, a) {
    var tabs = (content().projects && content().projects.tabs) || {}, q = p.quest || {};
    var idx = items().indexOf(p) + 1;
    var rows = [[T.team, p.headcount], [T.role, p.myRole], [T.status, p.status]].filter(function (row) { return t(row[1]); });
    var links = p.links || {};
    var external = [['Google Play', links.googlePlay], ['Steam', links.steam]].filter(function (row) { return /^https?:\/\//i.test(row[1] || ''); });
    var art = a.querySelector('.gcard__art');
    return '<div class="fcs-screen__bar"><span>' + String(idx).padStart(2, '0') + ' / ' + esc(t(UI.summary)) + '</span>' +
      '<button type="button" data-fcs-eject><b>B</b> ' + esc(t(T.eject)) + '</button></div>' +
      '<div class="fcs-screen__layout' + (art ? ' fcs-screen__layout--art' : '') + '">' +
      (art ? '<div class="fcs-screen__art" aria-hidden="true">' + art.innerHTML + '</div>' : '') +
      '<div class="fcs-screen__body"><p class="fcs-screen__meta">' + esc(t(tabs[p.category])) + ' <span aria-hidden="true">/</span> ' + esc(t(p.period)) + '</p>' +
      '<h2 id="fcs-summary-title" tabindex="-1">' + esc(t(p.title)) + '</h2>' +
      '<p class="fcs-screen__sub">' + esc(t(p.sub)) + '</p>' +
      '<dl class="fcs-screen__facts">' + rows.map(function (row) { return '<div><dt>' + esc(t(row[0])) + '</dt><dd>' + esc(t(row[1])) + '</dd></div>'; }).join('') + '</dl>' +
      ((t(q.goal) || t(q.result)) ? '<dl class="fcs-screen__quest">' +
        (t(q.goal) ? '<div><dt>' + esc(t(T.quest)) + '</dt><dd>' + esc(t(q.goal)) + '</dd></div>' : '') +
        (t(q.result) ? '<div><dt>' + (q.cleared ? '✓ ' : '') + esc(t(UI.result)) + '</dt><dd>' + esc(t(q.result)) + '</dd></div>' : '') + '</dl>' : '') +
      ((p.learned || []).length ? '<div class="fcs-screen__learned"><h3>' + esc(t(UI.learned)) + '</h3><p>' + p.learned.slice(0, 3).map(function (line) {
        return esc(t(line).replace(/<[^>]*>/g, ''));
      }).join(' ') + '</p></div>' : '') +
      '<div class="fcs-screen__tags">' + (p.genres || []).map(function (g) { return '<span>' + esc(t(g)) + '</span>'; }).join('') + '</div>' +
      '<div class="fcs-screen__links">' + external.map(function (row) { return '<a href="' + esc(row[1]) + '" target="_blank" rel="noopener noreferrer">' + esc(row[0]) + ' ↗</a>'; }).join('') +
      '<a class="fcs-screen__document" href="' + esc(a.getAttribute('href')) + '">' + esc(t(T.view)) + ' →</a></div></div></div>';
  }
  function readerConsole() {
    var hero = document.querySelector('.hero.fc-console'); if (hero) return hero;
    hero = document.createElement('section'); hero.className = 'hero fcs-reader-console';
    hero.innerHTML = '<div class="wrap"></div>';
    var main = document.querySelector('[data-slot="main"]'); main.insertBefore(hero, main.firstChild);
    build(hero); return hero;
  }
  function cleanup(restoreFocus) {
    var me = pending; pending = null; if (!me) return;
    clearTimeout(me.timer);
    if (me.animation) me.animation.cancel();
    if (me.fly) me.fly.remove();
    if (me.notice) me.notice.remove();
    if (me.load) me.load.remove();
    if (me.screen) me.screen.remove();
    me.a.classList.remove('is-loaded'); me.a.removeAttribute('aria-current');
    me.a.removeAttribute('aria-controls'); me.a.removeAttribute('aria-expanded');
    if (me.grid) me.grid.hidden = me.wasHidden;
    me.hero.classList.remove('is-fcs-slot', 'fcs-has-summary');
    me.wrap.style.removeProperty('--fcs-reader-h');
    if (me.hero.classList.contains('fcs-reader-console')) me.hero.remove();
    setAB(null, null);
    if (restoreFocus && me.a.isConnected) { me.a.focus({ preventScroll: true }); me.a.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' }); }
  }
  function finishInsert() {
    var me = pending; if (!me || me.ready) return;
    clearTimeout(me.timer); if (me.animation) me.animation.cancel();
    if (me.fly) me.fly.remove(); if (me.notice) me.notice.remove();
    if (me.load) me.load.remove();
    me.ready = true; me.screen.hidden = false;
    setAB(t(T.viewS), t(T.eject));
    me.screen.querySelector('h2').focus({ preventScroll: true });
  }
  function insert(a) {
    var p = projectOf(a); if (!p) return false;
    cleanup(false);
    all('[data-fcs-cards] > a.is-picked').forEach(function (card) { card.classList.remove('is-picked'); });
    var face = a.classList.contains('gcard') ? a : a.querySelector('.gcard');
    var from = a.getBoundingClientRect(), sx = window.pageXOffset, sy = window.pageYOffset;
    var fromLeft = Math.max(10, Math.min(from.left, window.innerWidth - from.width - 10));
    var hero = readerConsole(), wrap = hero.querySelector(':scope > .wrap'), grid = wrap.querySelector('.hero__grid');
    var oldHidden = grid && grid.hidden;
    // Give the reader a bounded LCD, with its own scroll area on short screens.
    wrap.style.setProperty('--fcs-reader-h', Math.max(300, Math.min(560, window.innerHeight - navH() - (window.innerWidth < 900 ? 150 : 120))) + 'px');
    if (grid) grid.hidden = true;
    hero.classList.add('fcs-has-summary', 'is-fcs-slot');
    var screen = document.createElement('div'); screen.className = 'fcs-screen'; screen.id = 'fcs-summary'; screen.hidden = true;
    screen.setAttribute('role', 'region'); screen.setAttribute('aria-labelledby', 'fcs-summary-title'); screen.innerHTML = summaryHtml(p, a); wrap.appendChild(screen);
    a.classList.add('is-loaded'); a.setAttribute('aria-current', 'true'); a.setAttribute('aria-controls', screen.id); a.setAttribute('aria-expanded', 'true');
    pending = { a: a, hero: hero, wrap: wrap, grid: grid, wasHidden: oldHidden, screen: screen, ready: false };
    var me = pending;
    var load = document.createElement('div'); load.className = 'fcs-screen-load'; load.setAttribute('aria-hidden', 'true');
    load.innerHTML = '<span>' + esc(t(UI.reading)) + ' <span class="fcs-screen-load__dots">▮▮▮</span></span>';
    wrap.appendChild(load); me.load = load;
    var hr = hero.getBoundingClientRect(), top = hr.top + window.pageYOffset - navH();
    if (reduced() || !face || !face.animate) { window.scrollTo({ top: Math.max(0, top), behavior: 'instant' }); finishInsert(); return true; }
    var fly = document.createElement('div'); fly.className = 'fcs-fly'; fly.setAttribute('aria-hidden', 'true');
    fly.style.cssText = 'position:absolute;left:' + (fromLeft + sx) + 'px;top:' + (from.top + sy) + 'px;width:' + from.width + 'px;height:' + from.height + 'px';
    var clone = face.cloneNode(true); clone.classList.remove('is-tilt', 'reveal', 'is-visible'); clone.classList.add('fcs-fly__card');
    clone.removeAttribute('style'); clone.removeAttribute('href'); clone.removeAttribute('hidden'); clone.removeAttribute('tabindex');
    fly.appendChild(clone); document.body.appendChild(fly); me.fly = fly;
    var dx = hr.left + hr.width / 2 + window.pageXOffset - (fromLeft + sx + from.width / 2);
    var dy = hr.bottom + window.pageYOffset - 3 - (from.top + sy), H = from.height;
    function at(x, y, rot) { return 'translate(' + x + 'px,' + y + 'px) rotate(' + rot + 'deg)'; }
    me.animation = fly.animate([
      { transform: at(0, 0, 0), clipPath: 'inset(0)', offset: 0 },
      { transform: at(dx * .15, -18, -3), clipPath: 'inset(0)', offset: .18 },
      { transform: at(dx, dy, 0), clipPath: 'inset(0)', offset: .58 },
      { transform: at(dx, dy - H, 0), clipPath: 'inset(100% 0 0 0)', offset: 1 }
    ], { duration: 680, easing: 'cubic-bezier(.25,.65,.3,1)', fill: 'forwards' });
    me.animation.onfinish = function () { if (pending === me) finishInsert(); };
    // Timer also completes in engines that do not dispatch the animation event.
    me.timer = setTimeout(function () { if (pending === me) finishInsert(); }, 720);
    var notice = document.createElement('p'); notice.className = 'fcs-inserting'; notice.setAttribute('role', 'status'); notice.textContent = t(UI.inserting); document.body.appendChild(notice); me.notice = notice;
    scrollToY(top); return true;
  }
  function decoratePages() {
    var preview = document.querySelector('.hp .hpl'); if (preview) preview.closest('.hp').classList.add('fcs-resume-preview');
    var games = document.querySelector('.hp-games');
    if (games && !games.closest('.fcs-play-panel')) {
      var panel = document.createElement('div'); panel.className = 'hp-block fcs-play-panel';
      games.before(panel); panel.innerHTML = '<h2 class="hp-h">' + esc(t(UI.play)) + '</h2>'; panel.appendChild(games);
      all('.hp-game', games).forEach(function (card, i) {
        var a = document.createElement('a'); a.className = card.className; a.href = base() + 'play.html#fcs-play-' + i;
        while (card.firstChild) a.appendChild(card.firstChild); card.replaceWith(a);
        var record = (content().play && content().play.cards || [])[i];
        if (record && t(record.note)) { var note = document.createElement('p'); note.className = 'fcs-game-note'; note.textContent = t(record.note); note.setAttribute('data-e', 'play.cards.' + i + '.note'); a.appendChild(note); }
      });
    }
    all('.play-card').forEach(function (card, i) { card.id = 'fcs-play-' + i; });
    all('.cover-block').forEach(function (block, i) { block.setAttribute('data-fcs-index', String(i + 1).padStart(2, '0')); });
  }
  document.addEventListener('click', function (e) {
    if (!active() || !e.target.closest) return;
    if (pending && !pending.ready) { e.preventDefault(); e.stopImmediatePropagation(); finishInsert(); return; }
    var a = e.target.closest('a.draw-card, a.proj-card');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    if (projectOf(a)) { e.preventDefault(); e.stopImmediatePropagation(); insert(a); }
  }, true);
  document.addEventListener('click', function (e) {
    if (!active() || !e.target.closest) return;
    var b = e.target.closest('[data-fcs-filter]'); if (b) { filterShelf(b.getAttribute('data-fcs-filter')); return; }
    if (e.target.closest('[data-fcs-random]')) { randomPick(); return; }
    if (e.target.closest('[data-fcs-eject]')) { cleanup(true); return; }
    b = e.target.closest('[data-fcs-step]'); if (b) { step(parseInt(b.getAttribute('data-fcs-step'), 10) || 1); return; }
    b = e.target.closest('[data-fcs-a]'); if (b) { pressA(b.getAttribute('data-fcs-a')); return; }
    if (e.target.closest('[data-fcs-b]')) pressB();
  });
  document.addEventListener('keydown', function (e) {
    if (!active() || !pending) return;
    if (e.key === 'Escape') { e.preventDefault(); cleanup(true); }
    else if (!pending.ready && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); finishInsert(); }
  });
  window.addEventListener('pagehide', function () { cleanup(false); });
  function scan() {
    cleanup(false); if (!active()) return;
    var main = document.querySelector('[data-slot="main"]'); if (!main) return;
    mainRoot = main.firstElementChild;
    prepareShelf(); var h = main.querySelector('.hero'); if (h) build(h); decoratePages();
  }
  function init() {
    var main = document.querySelector('[data-slot="main"]');
    if (main && window.MutationObserver) new MutationObserver(function () {
      if (!mainRoot || mainRoot.parentNode !== main) scan();
    }).observe(main, { childList: true });
    if (window.MutationObserver) new MutationObserver(function () { scan(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] });
    scan();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
