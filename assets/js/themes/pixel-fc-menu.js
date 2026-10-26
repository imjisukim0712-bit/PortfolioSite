/* Select Menu: persistent cursor + preview; all cartridges on a shelf.
   Only pixel-fc-menu is transformed. Main rerenders are observed, never patched. */
(function () {
  'use strict';
  if (window.__portfolioFCMenu) return;
  window.__portfolioFCMenu = true;
  var SKIN = 'pixel-fc-menu', state = null, pending = null, observer;
  var T = {
    select: {ko:'게임 선택', en:'SELECT GAME'}, contents: {ko:'페이지 목차', en:'SELECT CHAPTER'},
    profile: {ko:'프로필', en:'PROFILE'}, projects: {ko:'프로젝트', en:'PROJECTS'}, shortcuts: {ko:'바로가기', en:'SHORTCUTS'},
    shelf: {ko:'카트리지 선반', en:'CARTRIDGE LIBRARY'}, shelfHint: {ko:'모든 프로젝트 · 올리면 미리보기, 누르면 꽂기', en:'Every project · Hover to preview, select to insert'},
    hint: {ko:'↑ ↓ 선택 · A / Enter 실행', en:'↑ ↓ Select · A / Enter Open'},
    mobileHint: {ko:'목록을 스크롤해 선택 · 누르면 실행', en:'Scroll the list · Tap to open'},
    prev: {ko:'이전 항목 선택', en:'Select previous item'}, next: {ko:'다음 항목 선택', en:'Select next item'},
    open: {ko:'선택한 항목 열기', en:'Open selected item'}, insert: {ko:'카트리지 꽂고 상세 보기', en:'Insert cartridge · Open details'},
    back: {ko:'처음', en:'Reset'}, backA: {ko:'첫 항목으로 돌아가기', en:'Return to first item'},
    start: {ko:'열기', en:'Open'}, all: {ko:'전체 프로젝트', en:'All projects'},
    preview: {ko:'선택한 항목 미리보기', en:'Selected item preview'},
    period: {ko:'기간', en:'Period'}, role: {ko:'역할', en:'Role'}, quest: {ko:'퀘스트', en:'Quest'}, result: {ko:'결과', en:'Result'},
    chapter: {ko:'선택한 절', en:'SELECTED CHAPTER'}, read: {ko:'이 절 읽기', en:'Read this chapter'},
    chapterHint: {ko:'목차를 고르면 이곳에 요약이 표시됩니다.', en:'Choose a chapter to preview its summary here.'},
    chapters: {ko:'개의 절', en:'chapters'}, nextQuip: {ko:'다음 한마디', en:'Next quip'},
    inserting: {ko:'카트리지 삽입 중…', en:'Inserting cartridge…'},
    saves: {ko:'세이브 슬롯', en:'SAVE SLOTS'}, inventory: {ko:'아이템', en:'ITEMS'},
    status: {ko:'상태', en:'STATUS'}, record: {ko:'기록', en:'LOG'},
    media: {ko:'플레이 화면', en:'GAMEPLAY'}, emptyMedia: {ko:'미디어 준비 중', en:'MEDIA PENDING'},
    overview: {ko:'개요', en:'Overview'}, stats: {ko:'주요 수치', en:'Key figures'},
    missing: {ko:'프로젝트를 찾을 수 없습니다', en:'Project not found'}
  };
  function active() { return document.documentElement.getAttribute('data-skin') === SKIN; }
  function content() { return window.PORTFOLIO_CONTENT || {}; }
  function lang() { return window.PortfolioApp ? window.PortfolioApp.getLang() : document.documentElement.lang; }
  function t(v) { return typeof v === 'string' ? v : (v && (v[lang()] || v.ko)) || ''; }
  function esc(v) { return window.PortfolioRender.esc(String(v == null ? '' : v)); }
  function reduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function base() { return document.body.dataset.page === 'detail' ? '../' : ''; }
  function href(page) { return base() + window.PortfolioRender.HREF[page]; }
  function projects() { return (content().projects && content().projects.items) || []; }
  function status(message) { var el = document.getElementById('fcm-status'); if (el) el.textContent = message; }
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


  function cardHtml(p) { return window.PortfolioRender.drawCardHtml(content(), lang(), base(), p, 0); }
  function projectFor(a) {
    if (!a || !a.href) return null;
    var id = new URL(a.href, location.href).searchParams.get('p');
    return projects().filter(function(p) { return p.id === id; })[0];
  }
  function profileHtml() {
    var c = content(), h = c.home || {}, pl = h.player || {}, qs = h.quips || [];
    var q = qs.length ? qs[(window.PortfolioRender.quip.i || 0) % qs.length] : '';
    return '<div class="fcm-profile"><p class="fcm-kicker">PLAYER 1 / '+esc(t(c.meta.role))+'</p>'+
      '<h2 class="fcm-profile-title">'+t(c.hero.titleHtml)+'</h2>'+
      '<figure class="fcm-photo">'+(pl.photo ? '<img src="'+esc(base()+pl.photo)+'" alt="'+esc(t(pl.photoAlt)||t(c.meta.name))+'">' : '')+
      '<figcaption>'+esc(t(c.meta.name))+'<span>'+esc(t(c.meta.role))+'</span></figcaption></figure>'+
      '<div class="fcm-quote"><p data-quip aria-live="polite">'+esc(t(q))+'</p>'+
      (qs.length > 1 ? '<button type="button" data-fcm-quip aria-label="'+esc(t(T.nextQuip))+'">↻</button>' : '')+'</div>'+
      '<div class="fcm-actions"><a class="btn btn--primary" href="'+esc(href('resume'))+'">'+esc(t(h.ctaResume))+'</a>'+
      '<a class="btn btn--outline" href="'+esc(href('projects'))+'">'+esc(t(h.ctaProjects))+'</a></div></div>';
  }
  function artHtml(p) {
    var holder = document.createElement('div'); holder.innerHTML = cardHtml(p);
    var art = holder.querySelector('.gcard__art');
    return '<div class="fcm-art" aria-hidden="true">'+(art ? art.innerHTML : '')+'</div>';
  }
  function projectHtml(p) {
    var tabs = content().projects.tabs || {}, q = p.quest || {};
    return '<div class="fcm-project"><div class="fcm-project-top">'+artHtml(p)+
      '<div><p class="fcm-kicker">'+esc(t(tabs[p.category]))+' / '+esc(p.grade||'A')+'</p>'+
      '<h2>'+esc(t(p.title))+'</h2><p class="fcm-sub">'+esc(t(p.sub))+'</p></div></div>'+
      '<dl class="fcm-facts"><div><dt>'+esc(t(T.period))+'</dt><dd>'+esc(t(p.period))+'</dd></div>'+
      '<div><dt>'+esc(t(T.role))+'</dt><dd>'+esc(t(p.myRole))+'</dd></div></dl>'+
      '<div class="fcm-quest"><p><span>'+esc(t(T.quest))+'</span>'+esc(t(q.goal))+'</p>'+
      (t(q.result) ? '<p><span>'+esc(t(T.result))+'</span><strong>'+esc(t(q.result))+'</strong></p>' : '')+'</div>'+
      '<a class="fcm-launch" data-fcm-launch href="'+esc(base()+'projects/detail.html?p='+encodeURIComponent(p.id))+'"><kbd>A</kbd> '+esc(t(T.insert))+' →</a></div>';
  }
  function summaryFor(page) {
    var c = content();
    if (page === 'resume') return t(c.resume.heroNote);
    if (page === 'cover') return t(c.coverLetter.lead) || t(c.coverLetter.summary.title);
    if (page === 'play') return t(c.play.lead);
    return t(c.projects.lead) || t(T.shelfHint);
  }
  function pageHtml() {
    var s = state, item = s.entries[s.index], c = content();
    return '<div class="fcm-page"><p class="fcm-kicker">'+esc(t(c.nav[s.page] || c.nav.projects))+' / '+('0'+s.entries.length).slice(-2)+' '+esc(t(T.chapters))+'</p>'+
      '<h2 class="fcm-page-title">'+esc(s.title)+'</h2><p class="fcm-page-lead">'+esc(s.summary)+'</p>'+
      '<div class="fcm-chapter"><p class="fcm-kicker">'+esc(t(T.chapter))+' / '+('0'+(s.index+1)).slice(-2)+'</p>'+
      '<h2>'+esc(item.label)+'</h2><p>'+esc(item.summary || t(T.chapterHint))+'</p></div>'+
      '<button type="button" class="fcm-launch" data-fcm-read><kbd>A</kbd> '+esc(t(T.read))+' ↓</button></div>';
  }
  function shortcutHtml(item) {
    return '<div class="fcm-page"><p class="fcm-kicker">'+esc(t(T.shortcuts))+'</p><h2 class="fcm-shortcut-title">'+esc(item.label)+'</h2>'+
      '<p class="fcm-page-lead">'+esc(summaryFor(item.page))+'</p><a class="fcm-launch" href="'+esc(item.url)+'"><kbd>A</kbd> '+esc(item.label)+' →</a></div>';
  }
  function entryHtml(item, i) {
    var tag = item.url ? 'a' : 'button', p = item.project;
    return '<'+tag+' class="fcm-option'+(item.page ? ' fcm-option--shortcut' : '')+'" data-fcm-index="'+i+'" '+
      (item.url ? 'href="'+esc(item.url)+'"' : 'type="button"')+' aria-current="'+(i === 0 ? 'true' : 'false')+'">'+
      '<span class="fcm-cursor" aria-hidden="true">▶</span><span class="fcm-option-copy"><span class="fcm-option-title">'+esc(item.label)+'</span>'+
      (p ? '<span class="fcm-option-meta"><span>'+esc(t(content().projects.tabs[p.category]))+'</span><b data-grade="'+esc(p.grade||'A')+'">'+esc(p.grade||'A')+'</b></span>' :
        '<span class="fcm-option-meta">'+esc(item.meta || ('0'+(i+1)).slice(-2))+'</span>')+'</span>'+ (item.page ? '<span aria-hidden="true">↗</span>' : '')+'</'+tag+'>';
  }
  function buildConsole(hero) {
    var s = state, c = content(), wrap = hero.querySelector(':scope > .wrap');
    hero.classList.add('fc-console', 'fcm-console');
    wrap.innerHTML = '<div class="fcm-screen-head"><span>▸ '+esc(t(s.page === 'home' ? T.select : T.contents))+'</span><span>1P · '+esc(t(c.meta.name))+'</span><h1 class="sr-only">'+esc(s.page === 'home' ? t(c.meta.name)+' · '+t(c.meta.role)+' Portfolio' : s.title)+'</h1></div>'+
      '<div class="fcm-screen-body"><nav class="fcm-menu" aria-label="'+esc(t(s.page === 'home' ? T.select : T.contents))+'">'+
      s.entries.map(function(item, i) { return (i === 1 && s.page === 'home' ? '<p class="fcm-group">'+esc(t(T.projects))+' / '+('0'+projects().length).slice(-2)+'</p>' : '')+
      (item.page && (i === 0 || !s.entries[i-1].page) ? '<p class="fcm-group">'+esc(t(T.shortcuts))+'</p>' : '')+entryHtml(item,i); }).join('')+
      '</nav><div class="fcm-preview" role="region" aria-label="'+esc(t(T.preview))+'"></div></div>'+
      '<div class="fcm-screen-foot"><span class="fcm-desktop-hint">'+esc(t(T.hint))+'</span><span class="fcm-mobile-hint">'+esc(t(T.mobileHint))+'</span><span data-fcm-count></span></div>';
    var left = node('div', 'fc-grip fc-grip--l');
    left.innerHTML = '<span class="fc-lbl">SELECT</span><button type="button" class="fc-key" data-fcm-step="-1" aria-label="'+esc(t(T.prev))+'">◀</button>'+
      '<button type="button" class="fc-key" data-fcm-step="1" aria-label="'+esc(t(T.next))+'">▶</button>';
    var right = node('div','fc-grip fc-grip--r');
    right.innerHTML = '<span class="fc-ab"><button type="button" class="fc-key" data-fcm-reset aria-label="'+esc(t(T.backA))+'">B</button><span class="fc-lbl">'+esc(t(T.back))+'</span></span>'+
      '<span class="fc-ab"><button type="button" class="fc-key" data-fcm-open aria-label="'+esc(t(T.open))+'">A</button><span class="fc-lbl">'+esc(t(T.start))+'</span></span>';
    hero.insertBefore(left, wrap); hero.appendChild(right);
    var slot = node('div','fcm-slot'); slot.setAttribute('aria-hidden','true'); hero.appendChild(slot);
    select(0, false);
  }
  function shelf() {
    var old = document.querySelector('.draw'); if (!old) return;
    var el = node('section','fcm-shelf');
    el.innerHTML = '<div class="wrap"><header class="fcm-shelf-head"><div><p class="fcm-kicker">LIBRARY / '+('0'+projects().length).slice(-2)+'</p><h2>'+esc(t(T.shelf))+'</h2></div>'+
      '<a href="'+esc(href('projects'))+'">'+esc(t(T.all))+' →</a></header><p class="fcm-shelf-hint">'+esc(t(T.shelfHint))+'</p>'+
      '<div class="fcm-cartridges">'+projects().map(function(p) { return cardHtml(p); }).join('')+'</div></div>';
    old.replaceWith(el);
  }
  function excerpt(target) {
    var p = target && target.querySelector('.section__lead, .card__body, .play-card__note, .block__body p, .tl-body, .quest-strip__v, p:not(.eyebrow):not(.fcr-title)');
    return p ? p.textContent.trim() : '';
  }
  function chapters(main, page) {
    var list = [], targets;
    if (page === 'projects') {
      var grid = main.querySelector('[data-proj-grid]');
      each('[data-proj-tab]', function(tab) { list.push({label:tab.textContent, target:grid, filter:tab.dataset.projTab, summary:t(T.shelfHint)}); }, main);
      return list;
    }
    var selectors = {
      resume: ':scope > .section', cover: '.cl-summary, .cover-block',
      detail: '.detail__info, .detail__media, .detail__blocks .block', play: '.steam, .play-card'
    };
    targets = main.querySelectorAll(selectors[page] || ':scope > .section');
    Array.prototype.forEach.call(targets, function(target, i) {
      var heading = target.querySelector('h2, h3, .block__label');
      var label = heading ? heading.textContent.trim() : t(page === 'resume' ? T.stats : T.overview);
      if (page === 'detail' && i === 0) label = t(T.overview);
      if (page === 'detail' && target.classList.contains('detail__media')) label = t(T.media);
      if (target.querySelector('.block__label small')) label = target.querySelector('.block__label').firstChild.textContent.trim();
      if (!target.id) target.id = 'fcm-chapter-'+i;
      list.push({label:label, target:target, summary:excerpt(target)});
    });
    return list;
  }
  function scan() {
    if (!active() || !window.PortfolioRender || !window.PORTFOLIO_CONTENT) return;
    var main = document.querySelector('[data-slot="main"]');
    if (!main || main.querySelector('.fcm-console')) return;
    cleanup();
    var page = document.body.dataset.page || 'home', hero = main.querySelector('.hero'), c = content(), entries = [];
    if (page === 'home') {
      entries.push({label:'PLAYER 1 · '+t(c.meta.name), meta:t(T.profile)});
      projects().forEach(function(p) { entries.push({label:t(p.title), project:p, url:base()+'projects/detail.html?p='+encodeURIComponent(p.id)}); });
      ['resume','cover','play'].forEach(function(p) { entries.push({label:t(c.nav[p]), page:p, url:href(p)}); });
      shelf();
    } else {
      if (hero) hero.remove();
      entries = chapters(main, page);
      if (!entries.length) entries.push({label:t(T.overview), target:main.querySelector('.section')});
      hero = node('section','hero'); hero.innerHTML = '<div class="wrap"></div>'; main.insertBefore(hero, main.firstChild);
      each('h1', function(h) { var h2 = document.createElement('h2'); Array.prototype.forEach.call(h.attributes,function(a){h2.setAttribute(a.name,a.value);}); h2.innerHTML=h.innerHTML; h.replaceWith(h2); }, main);
    }
    var project = page === 'detail' ? projects().filter(function(p) { return p.id === new URLSearchParams(location.search).get('p'); })[0] : null;
    state = {page:page, hero:hero, entries:entries, index:0, title:project ? t(project.title) : t(c.nav[page]) || t(T.missing),
      summary:project ? t(project.sub) : summaryFor(page)};
    menus(); buildConsole(hero);
    if (!document.getElementById('fcm-status')) { var live = node('div','sr-only'); live.id='fcm-status'; live.setAttribute('role','status'); document.body.appendChild(live); }
  }
  function select(i, announce, reveal) {
    if (!state || pending) return;
    var s = state; s.index = (i + s.entries.length) % s.entries.length;
    var entry = s.entries[s.index];
    each('[data-fcm-index]',function(el) { el.setAttribute('aria-current', String(Number(el.dataset.fcmIndex) === s.index)); },s.hero);
    var preview = s.hero.querySelector('.fcm-preview');
    preview.innerHTML = s.page !== 'home' ? pageHtml() : entry.project ? projectHtml(entry.project) : entry.page ? shortcutHtml(entry) : profileHtml();
    preview.scrollTop = 0;
    s.hero.querySelector('[data-fcm-count]').textContent = ('0'+(s.index+1)).slice(-2)+' / '+('0'+s.entries.length).slice(-2);
    each('.fcm-shelf .draw-card, .proj-card', function(a) { var p = projectFor(a); a.classList.toggle('is-fcm-selected', !!(p && entry.project && p.id === entry.project.id)); });
    if (announce) status(entry.label + (entry.project ? '. '+t(entry.project.sub) : ''));
    if (reveal) {
      var option = s.hero.querySelector('[data-fcm-index="'+s.index+'"]'), menu = s.hero.querySelector('.fcm-menu');
      if (option.offsetTop < menu.scrollTop) menu.scrollTop = option.offsetTop;
      else if (option.offsetTop + option.offsetHeight > menu.scrollTop + menu.clientHeight) menu.scrollTop = option.offsetTop + option.offsetHeight - menu.clientHeight;
    }
  }
  function previewProject(p, announce) {
    if (!state || !p || pending) return;
    if (state.page === 'home') {
      var idx = state.entries.findIndex(function(e) {return e.project && e.project.id === p.id;});
      if (idx >= 0 && state.index !== idx) select(idx, announce, true);
    } else if (state.page === 'projects') {
      state.hero.querySelector('.fcm-preview').innerHTML = projectHtml(p);
      if (announce) status(t(p.title)+'. '+t(p.sub));
    }
  }
  function readChapter() {
    if (!state) return;
    var item = state.entries[state.index];
    if (item.filter) { var tab = document.querySelector('[data-proj-tab="'+item.filter+'"]'); if (tab) tab.click(); }
    if (!item.target) return;
    item.target.setAttribute('tabindex','-1'); item.target.focus({preventScroll:true});
    var nav = document.querySelector('.nav');
    window.scrollTo({top:Math.max(0, item.target.getBoundingClientRect().top + window.scrollY - (nav ? nav.offsetHeight : 60) - 20), behavior:reduced()?'auto':'smooth'});
  }
  function openSelected() {
    if (!state || pending) return;
    var launch = state.hero.querySelector('.fcm-preview [data-fcm-launch]');
    if (launch) { launch.click(); return; }
    if (state.page !== 'home') { readChapter(); return; }
    var entry = state.entries[state.index];
    if (entry.url) state.hero.querySelector('[data-fcm-index="'+state.index+'"]').click();
    else { var resume = state.hero.querySelector('.fcm-actions a'); if (resume) resume.click(); }
  }
  /* A single 680ms insert, then the real detail URL. No second confirmation screen.
     The console slot is used whenever visible; a compact dock is used offscreen. */
  function cleanup() {
    if (pending) { clearTimeout(pending.timer); pending.animations.forEach(function(a){a.cancel();}); pending = null; }
    each('.fc-fly, .fc-slot',function(el){el.remove();});
    each('.fcm-console[aria-busy]',function(el){el.removeAttribute('aria-busy');});
  }
  function insert(a, p) {
    if (pending) return;
    if (reduced()) { window.location.assign(a.href); return; }
    var s = state, source = a.matches('.draw-card, .proj-card') ? a : null;
    if (!source && s) source = Array.prototype.find.call(document.querySelectorAll('.fcm-shelf .draw-card, .proj-card'),function(card){var cp=projectFor(card);return cp && cp.id===p.id;});
    var temp = document.createElement('div'); temp.innerHTML = cardHtml(p);
    var face = (source && (source.matches('.gcard') ? source : source.querySelector('.gcard'))) || temp.querySelector('.gcard');
    if (!face || !face.animate) { window.location.assign(a.href); return; }
    var slot = s && s.hero.querySelector('.fcm-slot'), sr = slot && slot.getBoundingClientRect(), dock;
    var nav = document.querySelector('.nav'), top = (nav ? nav.getBoundingClientRect().bottom : 60) + 8;
    if (!sr || sr.top < top || sr.bottom > innerHeight - 12) {
      dock = node('div','fc-slot'); dock.setAttribute('aria-hidden','true'); dock.style.top=top+'px'; dock.style.transform='translate(-50%,0)'; document.body.appendChild(dock);
      sr = dock.getBoundingClientRect();
    }
    var r = source && source.getBoundingClientRect(), w = Math.min(160, innerWidth * .32), h = w * 4/3;
    var visible = r && r.top < innerHeight && r.bottom > top;
    var x = visible ? r.left + r.width/2 - w/2 : Math.max(8, sr.left + sr.width/2 - w/2), y = visible ? Math.min(innerHeight-h-12, Math.max(top, r.top)) : Math.min(innerHeight-h-12, sr.bottom+30);
    var fly = node('div','fc-fly'); fly.setAttribute('aria-hidden','true'); fly.setAttribute('inert','');
    fly.style.cssText='left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px';
    var clone = face.cloneNode(true); clone.removeAttribute('style'); clone.removeAttribute('href'); clone.className='gcard fc-fly__card';
    each('[id]',function(el){el.removeAttribute('id');},clone); fly.appendChild(clone); document.body.appendChild(fly);
    if(s) s.hero.setAttribute('aria-busy','true'); status(t(T.inserting));
    var me = pending = {animations:[],timer:null}, url=a.href;
    function finish() { if(pending!==me) return; cleanup(); window.location.assign(url); }
    me.timer=setTimeout(finish,800);
    var dx=sr.left+sr.width/2-x-w/2, dy=(dock ? sr.bottom-5 : sr.top+5)-y;
    try {
      var animation=fly.animate([
        {transform:'translate(0,0)',clipPath:'inset(0 0 0 0)',offset:0},
        {transform:'translate('+dx+'px,'+dy+'px)',clipPath:'inset(0 0 0 0)',offset:420/680},
        {transform:'translate('+dx+'px,'+(dy-h)+'px)',clipPath:'inset(100% 0 0 0)',offset:1}
      ],{duration:680,fill:'forwards',easing:'cubic-bezier(.3,.65,.3,1)'});
      me.animations.push(animation); animation.onfinish=finish;
    } catch(e) { finish(); }
  }
  document.addEventListener('pointerover', function(e) {
    if(!active() || !state || pending || e.pointerType==='touch' || !e.target.closest) return;
    var option=e.target.closest('[data-fcm-index]');
    if(option && (!e.relatedTarget || !option.contains(e.relatedTarget)) && state.index!==Number(option.dataset.fcmIndex)) select(Number(option.dataset.fcmIndex),false);
    var card=e.target.closest('.fcm-shelf .draw-card, .proj-card'); if(card && (!e.relatedTarget || !card.contains(e.relatedTarget))) previewProject(projectFor(card),false);
  });
  document.addEventListener('focusin',function(e) {
    if(!active() || !state || !e.target.closest) return;
    var option=e.target.closest('[data-fcm-index]'); if(option && state.index!==Number(option.dataset.fcmIndex)) select(Number(option.dataset.fcmIndex),true,true);
    var card=e.target.closest('.fcm-shelf .draw-card, .proj-card'); if(card) previewProject(projectFor(card),true);
  });
  document.addEventListener('click',function(e) {
    if(!active() || !state || !e.target.closest) return;
    var a=e.target.closest('a'), p=projectFor(a);
    if(p && (a.matches('.draw-card, .proj-card, [data-fcm-launch]') || a.hasAttribute('data-fcm-index')) && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.button) {
      e.preventDefault(); e.stopImmediatePropagation(); insert(a,p); return;
    }
    var option=e.target.closest('[data-fcm-index]');
    if(option) { select(Number(option.dataset.fcmIndex),true); if(state.page!=='home') readChapter(); return; }
    var step=e.target.closest('[data-fcm-step]'); if(step) {select(state.index+Number(step.dataset.fcmStep),true,true);return;}
    if(e.target.closest('[data-fcm-reset]')) {cleanup();select(0,true,true);return;}
    if(e.target.closest('[data-fcm-open]')) {openSelected();return;}
    if(e.target.closest('[data-fcm-read]')) {readChapter();return;}
    if(e.target.closest('[data-fcm-quip]') && window.PortfolioApp) window.PortfolioApp.cycleQuip(1);
  },true);
  document.addEventListener('keydown',function(e) {
    if(!active() || !state || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
    if(e.key==='Escape') {cleanup(); select(0,true,true);return;}
    if(!state.hero.contains(e.target) && e.target!==document.body) return;
    if(e.key==='ArrowDown' || e.key==='ArrowUp' || e.key==='Home' || e.key==='End') {
      e.preventDefault(); var i=e.key==='Home'?0:e.key==='End'?state.entries.length-1:state.index+(e.key==='ArrowDown'?1:-1);
      select(i,true,true); state.hero.querySelector('[data-fcm-index="'+state.index+'"]').focus({preventScroll:true});
    } else if(e.key.toLowerCase()==='a') {e.preventDefault();openSelected();}
    else if(e.key==='Enter' && (e.target===document.body || e.target.hasAttribute('data-fcm-step') || e.target.hasAttribute('data-fcm-reset'))) {e.preventDefault();openSelected();}
  });
  window.addEventListener('pagehide',cleanup);
  window.addEventListener('pageshow',function(e){if(e.persisted)cleanup();});
  function init() {
    var main=document.querySelector('[data-slot="main"]');
    if(main) {observer=new MutationObserver(scan);observer.observe(main,{childList:true});}
    new MutationObserver(function(){if(!active()) {cleanup();state=null;} else scan();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-skin']});
    scan();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
