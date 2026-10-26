/* Famicom C: original hardware, LCD panels, one-click on-screen details. */
(function () {
  'use strict';
  var SKIN = 'pixel-fc-screen';
  var T = {
    select: 'SELECT',
    prevQ:  { ko: '이전 한마디',   en: 'Previous quip' },
    nextQ:  { ko: '다음 한마디',   en: 'Next quip' },
    prevS:  { ko: '이전 절로',     en: 'Previous section' },
    nextS:  { ko: '다음 절로',     en: 'Next section' },
    light:  { ko: '밝기',          en: 'Light' },
    lightA: { ko: '다크 · 라이트 전환', en: 'Toggle dark mode' },
    draw:   { ko: '칩 선택',       en: 'Select' },
    drawA:  { ko: '프로젝트 칩 선택', en: 'Select a project cartridge' },
    down:   { ko: '아래로',        en: 'Down' },
    downA:  { ko: '아래 내용으로',  en: 'Scroll to the content' },
    mail:   { ko: '메일',          en: 'Mail' },
    mailA:  { ko: '이메일 보내기',  en: 'Send me an email' }
  };
  /* 손잡이 메일 키 아이콘 (봉투) */
  var MAIL_SVG = '<svg viewBox="0 0 18 14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">' +
    '<rect x="1" y="1.6" width="16" height="11" /><path d="m1.6 2.4 7.4 5.6 7.4-5.6" stroke-linejoin="round"/></svg>';

  function lang() {
    var v = window.PortfolioApp && window.PortfolioApp.getLang ? window.PortfolioApp.getLang() : document.documentElement.getAttribute('lang');
    return v === 'en' ? 'en' : 'ko';
  }
  function t(o) { var L = lang(); return typeof o === 'string' ? o : (o && (o[L] || o.ko)) || ''; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
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
  /* 카트리지가 꽂혀 있는 동안 A/B 라벨을 바꿉니다 */
  function setAB(a, b) {
    var la = document.querySelector('[data-fc-lbl="a"]'), lb = document.querySelector('[data-fc-lbl="b"]');
    if (la) { if (!la.getAttribute('data-orig')) la.setAttribute('data-orig', la.textContent); la.textContent = a || la.getAttribute('data-orig'); }
    if (lb) { if (!lb.getAttribute('data-orig')) lb.setAttribute('data-orig', lb.textContent); lb.textContent = b || lb.getAttribute('data-orig'); }
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
  function pressA(kind) {
    if (kind === 'draw') { chooseChip(); return; }
    var secs = sections();
    if (secs.length) scrollToY(secs[0].getBoundingClientRect().top + window.pageYOffset - navH());
  }
  function pressB() {
    if (reader) { requestClose(); return; }
    var b = document.querySelector('[data-theme-toggle]'); if (b) b.click();
  }

  var UI = {
    log: { ko: '01 / 진행 로그', en: '01 / ACTIVITY LOG' },
    tools: { ko: '02 / 도구함', en: '02 / TOOLKIT' },
    style: { ko: '03 / 작업 방식', en: '03 / WORK STYLE' },
    play: { ko: '04 / 플레이 기록', en: '04 / PLAY LOG' },
    playTitle: { ko: '플레이에서 쌓은 관찰', en: 'Observations from play' },
    shelf: { ko: '프로젝트 칩', en: 'PROJECT CARTRIDGES' },
    shelfHint: { ko: '옆으로 넘겨 선택 · 한 번 누르면 상세 전체', en: 'Scroll to choose · One click opens full details' },
    library: { ko: '칩 보관함', en: 'Chip library' },
    libraryHint: { ko: '프로젝트 목록 열기 →', en: 'Open project list →' },
    choose: { ko: '원하는 칩을 선택하세요', en: 'Choose a cartridge' },
    close: { ko: '꺼내기', en: 'Eject' },
    newPage: { ko: '새 페이지로 열기 ↗', en: 'Open in new page ↗' },
    newPageShort: { ko: '새 페이지', en: 'New page' },
    loading: { ko: '읽는 중', en: 'LOADING' },
    screen: { ko: '프로젝트 상세 화면', en: 'Project detail screen' },
    scroll: { ko: '상세 내용 · 아래로 스크롤', en: 'Full details · Scroll to read' },
    stats: { ko: '기록 / 요약', en: 'RECORD / SUMMARY' },
    profile: { ko: '01 / 프로필', en: '01 / PROFILE' },
    skills: { ko: '02 / 핵심역량', en: '02 / CORE SKILLS' },
    career: { ko: '03 / 활동 이력', en: '03 / EXPERIENCE' },
    cover: { ko: '자기소개서 / 읽기 화면', en: 'ABOUT ME / READING SCREEN' },
    projects: { ko: '칩 보관함 / 프로젝트', en: 'CARTRIDGE LIBRARY / PROJECTS' },
    detail: { ko: '프로젝트 / 상세 기록', en: 'PROJECT / DETAIL LOG' },
    playPage: { ko: '플레이 / 관찰 기록', en: 'PLAY / OBSERVATIONS' }
  };
  function each(selector, fn, root) { Array.prototype.forEach.call((root || document).querySelectorAll(selector), fn); }
  function base() { return document.body.getAttribute('data-page') === 'detail' ? '../' : ''; }
  function projects() { return (content().projects && content().projects.items) || []; }
  function findProject(id) { return projects().filter(function (p) { return p.id === id; })[0]; }
  function detailURL(id) {
    var url = new URL(base() + 'projects/detail.html', location.href);
    url.searchParams.set('p', id); url.searchParams.set('skin', SKIN);
    return url.href;
  }

  /* Wrap actual renderer nodes; retain all text, data-e anchors and logo images. */
  function panel(node, label) {
    if (!node || node.classList.contains('fc-panel')) return;
    node.classList.add('fc-panel');
    var body = document.createElement('div'); body.className = 'fc-panel__body';
    while (node.firstChild) body.appendChild(node.firstChild);
    var rail = document.createElement('div'); rail.className = 'fc-panel__rail';
    rail.innerHTML = '<span>' + esc(t(label)) + '</span><span class="fc-panel__led" aria-hidden="true"></span>';
    node.appendChild(rail); node.appendChild(body);
  }
  function decorate() {
    var main = document.querySelector('[data-slot="main"]'); if (!main) return;
    var page = document.body.getAttribute('data-page');
    if (page === 'home') {
      each('.hp-block', function (node, i) { panel(node, [UI.log, UI.tools, UI.style][i] || UI.style); }, main);
      var games = main.querySelector('.hp-games');
      if (games && !games.closest('.fc-panel')) {
        var box = document.createElement('div'); games.parentNode.insertBefore(box, games);
        var title = document.createElement('h2'); title.className = 'hp-h'; title.textContent = t(UI.playTitle);
        box.appendChild(title); box.appendChild(games); panel(box, UI.play);
      }
    } else {
      var labels = page === 'resume' ? [UI.stats, UI.profile, UI.skills, UI.career] :
        [UI[page === 'play' ? 'playPage' : page] || UI.detail];
      each(':scope > .section > .wrap', function (wrap, i) {
        if (wrap.querySelector(':scope > .fc-panel')) return;
        var box = document.createElement('div'); box.className = 'fc-panel--' + page;
        while (wrap.firstChild) box.appendChild(wrap.firstChild);
        wrap.appendChild(box); panel(box, labels[i] || labels[0]);
      }, main);
    }
    each('.hp-game', function (row) {
      if (row.querySelector('.fc-play-time')) return;
      var allGames = (content().play && content().play.cards) || [];
      var i = Array.prototype.indexOf.call(row.parentNode.children, row), g = allGames[i];
      if (!g) return;
      var time = document.createElement('span'); time.className = 'fc-play-time'; time.textContent = t(g.hours);
      row.appendChild(time);
      var meta = row.querySelector('.hp-game__b');
      if (meta) meta.textContent = t(g.genre);
    }, main);
  }

  /* All chips, always in content order. Main's random draw never hides a project. */
  var deckObserver = null;
  function fillShelf() {
    var box = document.querySelector('[data-draw-cards]'), R = window.PortfolioRender;
    if (!box || !R) return;
    if (deckObserver) deckObserver.disconnect();
    box.innerHTML = projects().map(function (p, i) { return R.drawCardHtml(content(), lang(), base(), p, i); }).join('');
    box.classList.remove('is-dealing');
    var deck = document.querySelector('[data-draw]');
    if (deck) {
      if (deck.tagName !== 'A') {
        var library = document.createElement('a'); library.className = deck.className;
        library.setAttribute('data-draw', '');
        while (deck.firstChild) library.appendChild(deck.firstChild);
        deck.parentNode.insertBefore(library, deck); deck.remove(); deck = library;
      }
      var libraryURL = new URL(base() + 'projects.html', location.href);
      libraryURL.searchParams.set('skin', SKIN); deck.href = libraryURL.href;
      deck.setAttribute('aria-label', t(UI.library) + ' · ' + t(UI.libraryHint));
      var title = deck.querySelector('.draw__deck-label'), hint = deck.querySelector('.draw__deck-hint');
      if (title) title.textContent = t(UI.library);
      if (hint) hint.textContent = t(UI.libraryHint);
    }
    var stage = box.closest('.draw__stage');
    if (stage && !stage.previousElementSibling) {
      var head = document.createElement('div'); head.className = 'fc-shelf-head';
      head.innerHTML = '<h2>' + esc(t(UI.shelf)) + ' <span>' + ('0' + projects().length).slice(-2) + '</span></h2><p>' + esc(t(UI.shelfHint)) + '</p>';
      stage.parentNode.insertBefore(head, stage);
      stage.setAttribute('aria-label', t(UI.shelf));
    }
    if (!deckObserver) deckObserver = new MutationObserver(fillShelf);
    deckObserver.observe(box, { childList: true });
  }
  function chooseChip() {
    var first = document.querySelector('.draw-card');
    if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduced() ? 'instant' : 'smooth' }); }
  }

  /* A native modal supplies top-layer rendering and background inertness.
     The explicit Tab boundary also covers the independently scrolling LCD. */
  var reader = null;
  function hashId() {
    try { return new URLSearchParams(location.hash.slice(1)).get('p') || ''; } catch (e) { return ''; }
  }
  function writeHash(id, replace) {
    var url = new URL(location.href); url.searchParams.set('skin', SKIN); url.hash = 'p=' + encodeURIComponent(id);
    var state = Object.assign({}, history.state, { fcScreen: location.pathname });
    history[replace ? 'replaceState' : 'pushState'](state, '', url.href);
  }
  function drawDetail(id) {
    var me = reader, p = findProject(id); if (!me || !p) return;
    me.id = id;
    me.dialog.setAttribute('aria-label', t(UI.screen));
    me.dialog.querySelector('.fc-reader__label').textContent = t(UI.screen);
    me.dialog.querySelector('[data-fc-new-page]').setAttribute('aria-label', t(UI.newPage));
    me.dialog.querySelector('[data-fc-close]').setAttribute('aria-label', t(UI.close));
    me.dialog.querySelector('[data-fc-reader-label="b"]').textContent = t(UI.close);
    me.dialog.querySelector('[data-fc-reader-label="a"]').textContent = t(UI.newPageShort);
    me.dialog.querySelector('[data-fc-load-text]').textContent = t(UI.loading);
    me.screen.setAttribute('aria-label', t(UI.scroll));
    me.dialog.querySelector('.fc-reader__name').textContent = t(p.title);
    me.dialog.querySelector('[data-fc-new-page]').href = detailURL(id);
    me.screen.innerHTML = window.PortfolioRender.renderDetail(content(), lang(), base(), id);
    each('.reveal', function (node) { node.classList.add('is-visible'); }, me.screen);
    each('a[href]', function (link) {
      var href = link.getAttribute('href');
      if (link.getAttribute('aria-disabled') === 'true') { link.tabIndex = -1; return; }
      var match = href.match(/(?:\?|&)p=([^&#]+)/);
      if (match) {
        var nextId = decodeURIComponent(match[1]);
        link.href = detailURL(nextId); link.setAttribute('data-fc-project', nextId);
      } else if (/projects\.html(?:$|\?)/.test(href)) {
        link.setAttribute('data-fc-close', '');
      }
    }, me.screen);
    var title = me.screen.querySelector('.detail__title');
    if (title) { title.id = 'fc-reader-title'; title.tabIndex = -1; me.dialog.setAttribute('aria-labelledby', title.id); }
    var pager = me.screen.querySelector('.pager'); if (pager) pager.setAttribute('aria-label', lang() === 'en' ? 'Project navigation' : '프로젝트 이동');
    me.screen.scrollTop = 0;
    document.title = t(p.title) + ' · ' + t(content().meta.name);
  }
  function finishInsert(me) {
    if (reader !== me) return;
    clearTimeout(me.timer);
    if (me.fly) { me.fly.remove(); me.fly = null; }
    me.dialog.classList.remove('is-inserting');
    me.screen.removeAttribute('aria-busy');
    var title = me.screen.querySelector('.detail__title');
    if (title) title.focus({ preventScroll: true });
  }
  function insertAnimation(me, source) {
    var face = source && (source.classList.contains('gcard') ? source : source.querySelector('.gcard'));
    if (!face || reduced() || !face.animate) { finishInsert(me); return; }
    var r = source.getBoundingClientRect(), slot = me.dialog.querySelector('.fc-reader__slot').getBoundingClientRect();
    var fly = document.createElement('div'); fly.className = 'fc-reader__fly'; fly.setAttribute('aria-hidden', 'true');
    fly.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
    var clone = face.cloneNode(true); clone.classList.remove('is-tilt', 'reveal'); clone.removeAttribute('href'); clone.removeAttribute('style');
    each('[id]', function (node) { node.removeAttribute('id'); }, clone);
    fly.appendChild(clone); me.dialog.appendChild(fly); me.fly = fly;
    var dx = slot.left + slot.width / 2 - r.left - r.width / 2, dy = slot.bottom - r.top;
    function at(x, y) { return 'translate(' + x + 'px,' + y + 'px)'; }
    var animation = fly.animate([
      { transform: at(0, 0), clipPath: 'inset(0)', offset: 0 },
      { transform: at(dx * .15, -18) + ' rotate(-3deg)', clipPath: 'inset(0)', offset: .18 },
      { transform: at(dx, dy), clipPath: 'inset(0)', offset: .55 },
      { transform: at(dx, dy - r.height), clipPath: 'inset(100% 0 0)', offset: 1 }
    ], { duration: 580, easing: 'cubic-bezier(.25,.7,.3,1)', fill: 'forwards' });
    me.animations.push(animation);
    /* Loading feedback shares the 580ms insertion; 120ms LCD reveal follows. */
    me.timer = setTimeout(function () { finishInsert(me); }, 580);
  }
  function openReader(id, source, fromHistory) {
    if (!findProject(id) || !window.PortfolioRender) return;
    if (reader) { drawDetail(id); if (!fromHistory) writeHash(id, true); finishInsert(reader); return; }
    var dialog = document.createElement('dialog'); dialog.className = 'fc-reader';
    dialog.setAttribute('aria-label', t(UI.screen));
    dialog.innerHTML = '<div class="fc-reader__frame">' +
      '<div class="fc-reader__grip fc-reader__grip--l"><span class="fc-ab">' +
      '<button type="button" class="fc-key fc-key--ab" data-fc-close aria-keyshortcuts="B" autofocus>B</button>' +
      '<span class="fc-lbl" data-fc-reader-label="b"></span></span></div>' +
      '<div class="fc-reader__display"><header class="fc-reader__toolbar">' +
      '<span class="fc-reader__slot" aria-hidden="true"></span>' +
      '<div class="fc-reader__identity"><span class="fc-reader__label">' + esc(t(UI.screen)) + '</span><strong class="fc-reader__name"></strong></div></header>' +
      '<div class="fc-reader__viewport"><div class="fc-reader__screen" tabindex="0" role="region" aria-label="' + esc(t(UI.scroll)) + '"></div>' +
      '<div class="fc-reader__loading" role="status"><span class="fc-reader__load-chip" aria-hidden="true"></span>' +
      '<p><span data-fc-load-text></span><span class="fc-reader__dots" aria-hidden="true"><i></i><i></i><i></i></span></p></div></div></div>' +
      '<div class="fc-reader__grip fc-reader__grip--r"><span class="fc-ab">' +
      '<a class="fc-key fc-key--ab" data-fc-new-page aria-keyshortcuts="A" target="_blank" rel="noopener">A</a>' +
      '<span class="fc-lbl" data-fc-reader-label="a"></span></span></div></div>';
    var me = reader = { dialog: dialog, screen: dialog.querySelector('.fc-reader__screen'), id: id,
      opener: source || document.activeElement, title: document.title,
      overflow: document.body.style.overflow, padding: document.body.style.paddingRight,
      animations: [], timer: null, fly: null };
    document.body.appendChild(dialog); drawDetail(id);
    if (!fromHistory) writeHash(id, false);
    var gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden'; if (gap > 0) document.body.style.paddingRight = gap + 'px';
    if (source && !reduced()) { dialog.classList.add('is-inserting'); me.screen.setAttribute('aria-busy', 'true'); }
    dialog.showModal();
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); requestClose(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) requestClose(); });
    setAB(null, t(UI.close)); insertAnimation(me, source);
  }
  function closeReader() {
    var me = reader; if (!me) return;
    reader = null; clearTimeout(me.timer);
    me.animations.forEach(function (a) { a.cancel(); });
    me.dialog.close(); me.dialog.remove();
    document.body.style.overflow = me.overflow; document.body.style.paddingRight = me.padding;
    document.title = me.title; setAB(null, null);
    var target = me.opener && me.opener.isConnected ? me.opener : null;
    if (!target && me.opener && me.opener.getAttribute) {
      var href = me.opener.getAttribute('href');
      each('a.draw-card, a.proj-card', function (link) { if (link.getAttribute('href') === href) target = link; });
    }
    if (!target || target === document.body) {
      target = document.querySelector('main h1, main h2');
      if (target) target.tabIndex = -1;
    }
    if (target) target.focus({ preventScroll: true });
  }
  function requestClose() {
    if (!reader) return;
    var owned = history.state && history.state.fcScreen === location.pathname;
    closeReader();
    if (owned) history.back();
    else { var url = new URL(location.href); url.hash = ''; history.replaceState(history.state, '', url.href); }
  }
  function syncHash() {
    if (!active()) return;
    var id = hashId();
    if (findProject(id)) { if (!reader || reader.id !== id) openReader(id, null, true); }
    else closeReader();
  }
  window.addEventListener('popstate', syncHash);
  window.addEventListener('hashchange', syncHash);
  window.addEventListener('pageshow', function (e) { if (e.persisted) { closeReader(); syncHash(); } });
  document.addEventListener('keydown', function (e) {
    if (!active() || !reader) return;
    if (e.key === 'Escape' || (e.key.toLowerCase() === 'b' && !e.ctrlKey && !e.metaKey && !e.altKey && !/input|textarea|select/i.test(e.target.tagName) && !e.target.isContentEditable)) {
      e.preventDefault(); requestClose(); return;
    }
    if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey && !e.altKey && !/input|textarea|select/i.test(e.target.tagName) && !e.target.isContentEditable) {
      e.preventDefault(); reader.dialog.querySelector('[data-fc-new-page]').click(); return;
    }
    if (e.key !== 'Tab') return;
    var list = Array.prototype.filter.call(reader.dialog.querySelectorAll('button, a[href], iframe, [tabindex]'), function (el) {
      return !el.disabled && el.tabIndex >= 0 && el.getClientRects().length && el.getAttribute('aria-disabled') !== 'true';
    });
    var first = list[0], last = list[list.length - 1], focus = document.activeElement;
    if (e.shiftKey && (focus === first || list.indexOf(focus) === -1)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (focus === last || list.indexOf(focus) === -1)) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (!active() || !e.target.closest) return;
    var disabled = e.target.closest('a[aria-disabled="true"]');
    if (reader && disabled) { e.preventDefault(); e.stopPropagation(); return; }
    var close = e.target.closest('[data-fc-close]');
    if (close) { e.preventDefault(); e.stopPropagation(); requestClose(); return; }
    var link = e.target.closest('a.draw-card, a.proj-card, a[data-fc-project]');
    if (link && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.button) {
      var id = link.getAttribute('data-fc-project');
      if (!id) { try { id = new URL(link.href).searchParams.get('p'); } catch (ignore) {} }
      if (findProject(id)) { e.preventDefault(); e.stopPropagation(); openReader(id, link, false); }
      return;
    }
    /* Preserve native link navigation, including Enter and modified clicks. */
    if (e.target.closest('[data-draw]')) { e.stopImmediatePropagation(); return; }
    var stepKey = e.target.closest('[data-fc-step]');
    if (stepKey) { e.preventDefault(); step(parseInt(stepKey.getAttribute('data-fc-step'), 10) || 1); return; }
    var a = e.target.closest('[data-fc-a]'); if (a) { e.preventDefault(); pressA(a.getAttribute('data-fc-a')); return; }
    if (e.target.closest('[data-fc-b]')) { e.preventDefault(); pressB(); }
  }, true);

  function scan() {
    if (!active()) { if (deckObserver) deckObserver.disconnect(); closeReader(); return; }
    var hero = document.querySelector('.hero'); if (hero) build(hero);
    decorate(); fillShelf();
    if (reader) { drawDetail(reader.id); finishInsert(reader); }
    else syncHash();
  }
  function init() {
    var main = document.querySelector('[data-slot="main"]');
    if (main) new MutationObserver(scan).observe(main, { childList: true });
    new MutationObserver(function () { if (!active()) closeReader(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] });
    scan();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
