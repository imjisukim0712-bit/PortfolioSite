/* ============================================================================
   render.js — content.js 의 내용을 각 페이지 화면으로 그립니다.
   내용을 바꾸려면 이 파일이 아니라 assets/content.js 를 고치세요.
   ========================================================================== */
(function (global) {
  'use strict';

  function t(field, lang) {
    if (field === null || field === undefined) return '';
    if (typeof field === 'string') return field;
    var v = field[lang];
    if (v === undefined || v === null || v === '') v = field.ko;
    return v === undefined || v === null ? '' : String(v);
  }
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function arr(a) { return Array.isArray(a) ? a : []; }
  function has(field, lang) { return t(field, lang).trim() !== ''; }
  function toneClass(tone) { return ({lavender:1,butter:1,blush:1,cornflower:1}[tone]) ? ' tag--' + tone : ''; }

  var GHOST = '<svg class="ghost" viewBox="0 0 32 36" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16 2c-7.2 0-13 5.8-13 13v19l4.3-3.2 4.3 3.2 4.4-3.2 4.3 3.2 4.3-3.2 4.4 3.2V15c0-7.2-5.8-13-13-13z"/><ellipse cx="11.5" cy="15" rx="2.2" ry="2.7" fill="#1c1a15"/><ellipse cx="20.5" cy="15" rx="2.2" ry="2.7" fill="#1c1a15"/></svg>';
  var CHEV = '<svg class="chev" viewBox="0 0 4 8" aria-hidden="true"><path d="M.6 1 3 4 .6 7" fill="none" stroke="currentColor" stroke-width=".9" stroke-linecap="round"/></svg>';
  var ARROW = '<svg class="arrow" width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M4.2 3H9v4.8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SUN = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10" cy="10" r="4"/><path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M16.5 3.5l-1.4 1.4M4.9 15.1l-1.4 1.4" stroke-linecap="round"/></svg>';
  var MOON = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M16 11.5A6.5 6.5 0 0 1 8.5 4a6.5 6.5 0 1 0 7.5 7.5z" stroke-linejoin="round"/></svg>';
  var CLEAR_ICON = '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2.5 6.2 5 8.6l4.6-5.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M4 3.5c0-.8.9-1.3 1.6-.9l14 8.5c.7.4.7 1.4 0 1.8l-14 8.5c-.7.4-1.6-.1-1.6-.9V3.5z"/></svg>';
  var STEAM_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-9.9 8.6l5.3 2.2a2.8 2.8 0 0 1 1.6-.5h.2l2.4-3.4v-.1a3.8 3.8 0 1 1 3.8 3.8h-.1l-3.4 2.4v.2a2.8 2.8 0 0 1-5.6.2l-3.8-1.6A10 10 0 1 0 12 2zM7.6 17.5a2.2 2.2 0 0 1-1.3-2.9l1.2.5a1.6 1.6 0 1 0 1.2-3l-1.3-.5a2.2 2.2 0 0 1 2.9 2.9 2.2 2.2 0 0 1-2.7 3zm8.2-6.1a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>';

  /* 도구 아이콘 (단색, currentColor). label 은 화면에 함께 표기 */
  var TOOL_ICONS = {
    figma:{n:"Figma",s:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.5 3h3.5v6H8.5a3 3 0 1 1 0-6z"/><path d="M12 3h3.5a3 3 0 1 1 0 6H12V3z" opacity=".72"/><path d="M8.5 9H12v6H8.5a3 3 0 1 1 0-6z" opacity=".55"/><circle cx="15.5" cy="12" r="3" opacity=".85"/><path d="M8.5 15H12v3a3 3 0 1 1-3.5-3z" opacity=".4"/></svg>'},
    office:{n:"MS Office",s:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 3 4 6.5v11L14 21l6-1.8V4.8L14 3zm-1 3.4v11.2l-6 1.5V8L13 6.4z"/></svg>'},
    obsidian:{n:"Obsidian",s:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 5 8l3 12 8 2 3-9-5-3-2-8zm-1 4 1.5 6L9 18l-1-8 3-4z" opacity=".9"/></svg>'},
    ai:{n:"AI",s:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.8 4.8L18.5 8l-4.7 1.2L12 14l-1.8-4.8L5.5 8l4.7-1.2L12 2z"/><path d="M18 14l.9 2.3 2.3.7-2.3.9L18 20l-.9-2.1-2.3-.9 2.3-.7L18 14z" opacity=".7"/></svg>'},
    github:{n:"GitHub",s:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.3-1.1.6-1.4-2.2-.300-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.4 4.6-4.6 4.9.3.3.6.9.6 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>'},
    notion:{n:"Notion",s:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8.5 16V9l7 7V9" stroke-linecap="round" stroke-linejoin="round"/></svg>'},
    jira:{n:"Jira",s:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l7 7-7 7-3-3 4-4-4-4 3-3z"/><path d="M12 9l3 3-3 3-7-7 3-3 4 4z" opacity=".55"/></svg>'},
    sheets:{n:"스프레드시트",s:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M4 14h16M10 4v16"/></svg>'},
    unity:{n:"Unity",s:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l6 3.4v7.2L12 21l-6-7.4V6.4L12 3zm0 2.6L8 8v6l4 2.4L16 14V8l-4-2.4z" opacity=".9"/></svg>'},
    godot:{n:"Godot",s:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 7h12v6a6 6 0 0 1-12 0V7z"/><circle cx="9.5" cy="10.5" r="1.4" fill="#fff"/><circle cx="14.5" cy="10.5" r="1.4" fill="#fff"/><path d="M7 5h3v2H7zM14 5h3v2h-3z"/></svg>'},
    gamemaker:{n:"GameMaker",s:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="3"/><circle cx="8" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="16" cy="10.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="13.5" r="1.1" fill="currentColor" stroke="none"/></svg>'},
    firebase:{n:"Firebase",s:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 18L8 4l3 5 2-3 6 12-7 3-7-3z" opacity=".85"/><path d="M5 18l3-14 2 8-5 6z" opacity=".55"/></svg>'}
  };
  function toolsHtml(list, lang){
    var arr2 = Array.isArray(list) ? list : [];
    if (!arr2.length) return '';
    return '<div class="tool-grid">' + arr2.map(function(key){
      var it = TOOL_ICONS[key]; if (!it) return '';
      return '<span class="tool" title="' + esc(it.n) + '"><span class="tool__ic">' + it.s + '</span><span class="tool__nm">' + esc(it.n) + '</span></span>';
    }).join('') + '</div>';
  }

  var PAGES = ['home','resume','cover','projects','play'];
  var HREF = { home:'index.html', resume:'resume.html', cover:'cover-letter.html', projects:'projects.html', play:'play.html' };

  /* ---------- 공통 조각 ---------- */
  function navHtml(c, lang, base, active) {
    var links = PAGES.map(function (k) {
      var isActive = (k === active) || (active === 'detail' && k === 'projects');
      return '<li><a class="nav__link' + (isActive ? ' is-active' : '') + '" href="' + esc(base + HREF[k]) + '">' +
        '<span>' + esc(t(c.nav[k], lang)) + '</span>' + CHEV + '</a></li>';
    }).join('');
    return '<a class="nav__logo" href="' + esc(base + HREF.home) + '">' + GHOST +
        '<span>' + esc(t(c.meta.name, lang)) + '</span>' +
        '<span class="nav__logo-en">' + esc(t(c.meta.role, lang)) + '</span></a>' +
      '<ul class="nav__menu">' + links + '</ul>' +
      '<div class="nav__actions">' +
        '<div class="lang-toggle" role="group" aria-label="언어 / Language">' +
          '<button type="button" class="lang-toggle__btn" data-lang-btn="ko" aria-pressed="' + (lang==='ko') + '">KR</button>' +
          '<button type="button" class="lang-toggle__btn" data-lang-btn="en" aria-pressed="' + (lang==='en') + '">EN</button>' +
        '</div>' +
        '<button type="button" class="icon-btn" data-theme-toggle aria-label="' + (lang==='en'?'Toggle dark mode':'다크모드 전환') + '"><span data-theme-icon></span></button>' +
        '<a class="btn btn--primary btn--sm nav__cta" href="' + esc(base + c.meta.resumeUrl) + '">' + (lang==='en'?'Résumé':'이력서') + '</a>' +
        '<button type="button" class="nav__burger" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="' + (lang==='en'?'Open menu':'메뉴 열기') + '"><span class="nav__burger-lines" aria-hidden="true"></span></button>' +
      '</div>';
  }
  function sheetHtml(c, lang, base, active) {
    var links = PAGES.map(function (k, i) {
      var isActive = (k === active) || (active === 'detail' && k === 'projects');
      return '<a class="sheet__link' + (isActive ? ' is-active' : '') + '" href="' + esc(base + HREF[k]) + '">' +
        '<span class="sheet__num">' + ('0'+(i+1)) + '</span><span>' + esc(t(c.nav[k], lang)) + '</span></a>';
    }).join('');
    return links + '<div class="sheet__foot"><a class="btn btn--primary" href="' + esc(base + c.meta.resumeUrl) + '">' +
      (lang==='en'?'Download résumé (PDF)':'이력서 다운로드 (PDF)') + '</a></div>';
  }
  function footerHtml(c, lang, base) {
    var mail = (c.meta.email||'').trim(), gh = (c.meta.github||'').trim();
    var links = '<a class="btn btn--outline btn--sm" href="' + esc(base + c.meta.resumeUrl) + '">' + (lang==='en'?'Résumé (PDF)':'이력서 (PDF)') + '</a>' +
      (mail ? '<a class="btn btn--outline btn--sm" href="mailto:' + esc(mail) + '">' + (lang==='en'?'Email':'이메일') + '</a>'
            : '<span class="btn btn--outline btn--sm is-placeholder">' + (lang==='en'?'Email — TBA':'이메일 — 입력 예정') + '</span>') +
      (gh ? '<a class="btn btn--outline btn--sm" href="' + esc(gh) + '" target="_blank" rel="noopener noreferrer">GitHub</a>' : '');
    return '<div class="footer__inner">' +
      '<div><div class="footer__brand">' + GHOST + '<span>' + esc(t(c.meta.name, lang)) + ' · ' + esc(t(c.meta.role, lang)) + '</span></div>' +
        '<p class="footer__tagline">' + esc(t(c.footer && c.footer.tagline, lang)) + '</p></div>' +
      '<div class="footer__links">' + links + '</div>' +
      '</div><p class="footer__copy">© ' + new Date().getFullYear() + ' ' + esc(t(c.meta.name, lang)) + '</p>';
  }

  function tagsHtml(tags, lang, style) {
    if (!arr(tags).length) return '';
    return '<div class="tags"' + (style?' style="'+style+'"':'') + '>' + arr(tags).map(function (tag) {
      var text = tag.text !== undefined ? tag.text : tag;
      return '<span class="tag' + toneClass(tag.tone) + '">' + esc(t(text, lang)) + '</span>';
    }).join('') + '</div>';
  }
  function statsHtml(stats, lang) {
    return arr(stats).map(function (s) {
      var u = t(s.unit, lang);
      return '<div class="stat reveal"><p class="stat__num">' + esc(s.num) + (u?'<span class="unit">'+esc(u)+'</span>':'') + '</p>' +
        '<p class="stat__label">' + esc(t(s.label, lang)) + '</p></div>';
    }).join('');
  }
  function paragraphs(field, lang, cls) {
    var todo = lang==='en' ? 'To be written.' : '작성 예정.';
    if (!has(field, lang)) return '<p class="' + (cls||'muted') + '">' + todo + '</p>';
    return t(field, lang).split(/\n{2,}|\n/).filter(function (s){return s.trim();}).map(function (s){return '<p>' + s + '</p>';}).join('');
  }

  /* ---------- HOME ---------- */
  function renderHome(c, lang, base) {
    var h = c.home || {};
    var pl = h.player || {};
    var playerCard =
      '<aside class="player">' +
        '<span class="player__tag">' + esc(pl.cardLabel || 'PLAYER CARD') + '</span>' +
        '<div class="player__who">' +
          '<span class="player__av">' + GHOST + '</span>' +
          '<span><span class="player__nm">' + esc(t(c.meta.name, lang)) + '</span>' +
          '<span class="player__cl">CLASS <b>' + esc(t(pl.class, lang)) + '</b> · ' + esc(t(pl.meta, lang)) + '</span></span>' +
        '</div>' +
        '<div class="player__stats">' + arr(pl.stats).map(function (st) {
          var v = Math.max(0, Math.min(100, parseInt(st.value, 10) || 0));
          return '<div class="pstat"><span class="pstat__l">' + esc(t(st.label, lang)) + '</span>' +
            '<span class="pstat__bar"><i style="width:' + v + '%"></i></span>' +
            '<span class="pstat__v">' + v + '</span></div>';
        }).join('') + '</div>' +
      '</aside>';
    var hero =
      '<section class="hero"><div class="wrap"><div class="hero__grid">' +
        '<div><p class="hero__eyebrow">' + GHOST + '<span>' + esc(t(c.meta.role, lang)) + ' · Portfolio</span></p>' +
          '<h1 class="hero__title">' + t(c.hero.titleHtml, lang) + '</h1>' +
          '<p class="hero__sub">' + esc(t(h.sub, lang)) + '</p>' +
          '<div class="btn-row">' +
            '<a class="btn btn--primary" href="' + esc(base+HREF.resume) + '">' + esc(t(h.ctaResume, lang)) + '</a>' +
            '<a class="btn btn--outline" href="' + esc(base+HREF.projects) + '">' + esc(t(h.ctaProjects, lang)) + '</a>' +
          '</div></div>' +
        '<div class="hero__media">' + playerCard + '</div>' +
      '</div></div></section>';

    var draw = c.home && c.home.draw || {};
    var drawSec =
      '<section class="draw"><div class="wrap"><div class="draw__stage">' +
        '<button type="button" class="draw__deck" data-draw aria-label="' + esc(t(draw.label, lang) || '프로젝트 뽑기') + '">' +
          '<span class="draw__deck-card" aria-hidden="true"></span>' +
          '<span class="draw__deck-card" aria-hidden="true"></span>' +
          '<span class="draw__deck-card"><span class="draw__deck-face">' + GHOST +
            '<span class="draw__deck-label">' + esc(t(draw.label, lang) || '프로젝트 뽑기') + '</span>' +
            '<span class="draw__deck-hint">' + esc(t(draw.hint, lang)) + '</span></span></span>' +
        '</button>' +
        '<div class="draw__cards" data-draw-cards></div>' +
      '</div></div></section>';

    return '<div class="home-screen">' + hero + drawSec + '</div>';
  }

  // 카드 뽑기 결과 카드 (main.js 에서 호출)
  function drawCardHtml(c, lang, base, p, delay) {
    var cat = c.projects && c.projects.tabs && c.projects.tabs[p.category];
    return '<a class="draw-card" href="' + esc(base + 'projects/detail.html?p=' + encodeURIComponent(p.id)) + '" style="--d:' + (delay||0) + 'ms">' +
      '<span class="draw-card__inner">' +
        '<span class="draw-card__back" aria-hidden="true">' + GHOST + '</span>' +
        '<span class="draw-card__front">' +
          '<span class="draw-card__cat">' + esc(cat ? t(cat, lang) : '') + '</span>' +
          '<span class="draw-card__title">' + esc(t(p.title, lang)) + '</span>' +
          '<span class="draw-card__sub">' + esc(t(p.sub, lang)) + '</span>' +
          '<span class="draw-card__go">' + (lang==='en'?'Open →':'열기 →') + '</span>' +
        '</span>' +
      '</span></a>';
  }

  /* ---------- RESUME ---------- */
  function renderResume(c, lang, base) {
    var r = c.resume || {};
    var hero =
      '<section class="hero"><div class="wrap"><div class="hero__grid">' +
        '<div><p class="hero__eyebrow">' + (lang==='en'?'RÉSUMÉ':'이력서') + '</p>' +
          '<h1 class="hero__title">' + t(c.hero.titleHtml, lang) + '</h1>' +
          '<p class="hero__note"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M7 2v9M3 7.2 7 11l4-3.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' + esc(t(r.heroNote, lang)) + '</p></div>' +
        '<div class="hero__media"><div class="ghost-art" aria-hidden="true">' + GHOST.replace('class="ghost"','class="ghost ghost--float"') + '</div></div>' +
      '</div></div></section>';

    var stats = arr(r.stats).length ? '<section class="section section--elev"><div class="wrap"><div class="stat-grid">' + statsHtml(r.stats, lang) + '</div></div></section>' : '';

    var pf = r.profile || {};
    var profile = arr(pf.items).length ? '<section class="section"><div class="wrap"><header class="section__head reveal">' +
      '<p class="eyebrow">' + (lang==='en'?'PROFILE':'인적사항') + '</p>' +
      '<h2 class="section__title">' + esc(t(pf.title, lang)) + '</h2>' +
      (has(pf.note, lang) ? '<p class="section__lead">' + esc(t(pf.note, lang)) + '</p>' : '') + '</header>' +
      '<dl class="profile reveal">' + arr(pf.items).map(function (it) {
        return '<div class="profile__row"><dt class="profile__k">' + esc(t(it.label, lang)) + '</dt>' +
          '<dd class="profile__v">' + esc(t(it.value, lang)) + '</dd></div>';
      }).join('') + '</dl></div></section>' : '';

    var sk = r.skills || {};
    var skillCards = arr(sk.cards).map(function (card) {
      return '<article class="card skill-card reveal"><h3 class="card__title">' + esc(t(card.title, lang)) + '</h3>' +
        '<p class="card__body">' + esc(t(card.body, lang)) + '</p>' + toolsHtml(card.tools, lang) + '</article>';
    }).join('');
    var skills = '<section class="section"><div class="wrap"><header class="section__head reveal">' +
      '<p class="eyebrow">' + (lang==='en'?'CORE SKILLS':'핵심역량') + '</p>' +
      '<h2 class="section__title">' + esc(t(sk.title, lang)) + '</h2>' +
      '<p class="section__lead">' + esc(t(sk.lead, lang)) + '</p></header>' +
      '<div class="grid grid--3">' + skillCards + '</div></div></section>';

    var ca = r.career || {};
    var careerItems = arr(ca.items).map(function (it) {
      return '<li class="tl-item' + (it.now?' tl-item--now':'') + ' reveal">' +
        '<p class="tl-date">' + esc(t(it.date, lang)) + '</p>' +
        '<h3 class="tl-role">' + esc(t(it.role, lang)) + '</h3>' +
        '<p class="tl-org">' + esc(t(it.org, lang)) + '</p>' +
        '<p class="tl-body">' + esc(t(it.body, lang)) + '</p>' +
        tagsHtml(it.tags, lang).replace('class="tags"','class="tags tl-tags"') + '</li>';
    }).join('');
    var career = '<section class="section section--elev"><div class="wrap"><header class="section__head reveal">' +
      '<p class="eyebrow">' + (lang==='en'?'CAREER':'경력') + '</p>' +
      '<h2 class="section__title">' + esc(t(ca.title, lang)) + '</h2>' +
      '<p class="section__lead">' + esc(t(ca.lead, lang)) + '</p></header>' +
      '<ol class="timeline">' + careerItems + '</ol></div></section>';

    return hero + stats + profile + skills + career;
  }

  /* ---------- COVER LETTER ---------- */
  function renderCover(c, lang, base) {
    var cl = c.coverLetter || {};
    var blocks = arr(cl.blocks);
    var body;
    if (!blocks.length) {
      body = '<div class="cover-empty">' + GHOST + '<p>' + esc(t(cl.lead, lang) || (lang==='en'?'Coming soon.':'곧 채울 예정입니다.')) + '</p></div>';
    } else {
      body = blocks.map(function (b) {
        return '<div class="cover-block reveal">' + (has(b.heading, lang) ? '<h3>' + esc(t(b.heading, lang)) + '</h3>' : '') + paragraphs(b.body, lang) + '</div>';
      }).join('');
    }
    return '<section class="section"><div class="wrap"><header class="section__head reveal">' +
      '<p class="eyebrow">' + (lang==='en'?'ABOUT ME':'자기소개서') + '</p>' +
      '<h2 class="section__title">' + esc(t(cl.title, lang)) + '</h2></header>' + body + '</div></section>';
  }

  /* ---------- PROJECTS ---------- */
  function renderProjects(c, lang, base) {
    var pr = c.projects || {};
    var tabs = pr.tabs || {};
    var tabsHtmlStr = ['all','game','planning'].filter(function (k){return tabs[k];}).map(function (k, i) {
      return '<button type="button" class="tab' + (i===0?' is-active':'') + '" data-proj-tab="' + k + '">' + esc(t(tabs[k], lang)) + '</button>';
    }).join('');
    var head = '<div class="proj-head reveal"><h1 class="proj-title">' + esc(t(pr.title, lang)) + '</h1>' +
      '<div class="tabs" role="tablist">' + tabsHtmlStr + '</div></div>';
    var grid = '<div class="proj-grid" data-proj-grid>' + arr(pr.items).map(function (p, i) { return projCardHtml(c, lang, base, p, i); }).join('') + '</div>';
    return '<section class="section"><div class="wrap">' + head + grid +
      '<div class="proj-empty" data-proj-empty hidden>' + (lang==='en'?'No projects in this category yet.':'이 분류에는 아직 프로젝트가 없습니다.') + '</div>' +
      '</div></section>';
  }
  function projCardHtml(c, lang, base, p, idx) {
    var cat = c.projects.tabs && c.projects.tabs[p.category];
    var q = p.quest || {};
    var stage = ('0' + ((idx || 0) + 1)).slice(-2);
    var cleared = q.cleared
      ? '<span class="clr">' + CLEAR_ICON + (lang==='en'?'CLEARED':'클리어') + '</span>'
      : '';
    return '<a class="proj-card reveal" data-cat="' + esc(p.category||'') + '" href="' + esc(base + 'projects/detail.html?p=' + encodeURIComponent(p.id)) + '">' +
      '<span class="proj-card__top"><span class="proj-card__stage">STAGE ' + stage + '</span>' + cleared + '</span>' +
      '<span class="proj-card__cat">' + esc(cat ? t(cat, lang) : '') + '</span>' +
      '<span class="proj-card__title">' + esc(t(p.title, lang)) + '</span>' +
      '<span class="proj-card__sub">' + esc(t(p.sub, lang)) + '</span>' +
      '<span class="proj-card__period">' + esc(t(p.period, lang)) + '</span></a>';
  }

  /* ---------- PROJECT DETAIL ---------- */
  function renderDetail(c, lang, base, id) {
    var items = arr(c.projects && c.projects.items);
    var idx = -1; items.forEach(function (p,i){ if (p.id===id) idx=i; });
    if (idx < 0) {
      return '<section class="section"><div class="wrap"><a class="back-link" href="' + esc(base+'projects.html') + '"><span>' + (lang==='en'?'← Projects':'← 프로젝트') + '</span></a>' +
        '<h1 class="section__title">' + (lang==='en'?'Project not found':'프로젝트를 찾을 수 없습니다') + '</h1></div></section>';
    }
    var p = items[idx];
    var m = p.media || {};
    var media;
    if ((m.embed||'').trim()) {
      media = '<div class="media-box media-box--embed"><iframe src="' + esc(m.embed) + '" title="' + esc(t(p.title, lang)) + '" loading="lazy" allowfullscreen referrerpolicy="no-referrer"></iframe></div>';
    } else {
      media = '<div class="media-box media-box--empty">' + esc(t(m.note, lang) || (lang==='en'?'Space for gameplay video and images.':'게임 영상·이미지가 들어갈 자리입니다.')) + '</div>';
    }
    var genres = arr(p.genres).slice(0,3);
    var learned = arr(p.learned);
    var links = p.links || {};
    var stores = '<div class="detail__stores">' +
      '<a class="store-link" ' + ((links.googlePlay||'').trim() ? 'href="'+esc(links.googlePlay)+'" target="_blank" rel="noopener noreferrer"' : 'aria-disabled="true" href="#"') + ' aria-label="Google Play">' + PLAY_ICON + '</a>' +
      '<a class="store-link" ' + ((links.steam||'').trim() ? 'href="'+esc(links.steam)+'" target="_blank" rel="noopener noreferrer"' : 'aria-disabled="true" href="#"') + ' aria-label="Steam">' + STEAM_ICON + '</a>' +
      '</div>';

    var info = '<div class="detail__info">' +
      '<a class="back-link" href="' + esc(base+'projects.html') + '"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M7.5 2 3.5 6l4 4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + (lang==='en'?'Projects':'프로젝트 목록') + '</span></a>' +
      '<h1 class="detail__title">' + esc(t(p.title, lang)) + '</h1>' +
      '<p class="detail__period">' + esc(t(p.period, lang)) + '</p>' +
      questStrip(p.quest, lang) +
      (genres.length ? '<div class="detail__genres">' + tagsHtml(genres.map(function(g){return {text:g,tone:'lavender'};}), lang) + '</div>' : '') +
      '<div class="detail__meta">' +
        metaRow(lang==='en'?'Headcount':'인원', t(p.headcount, lang)) +
        metaRow(lang==='en'?'My role':'맡은 역할', t(p.myRole, lang)) +
        metaRow(lang==='en'?'Status':'상태', t(p.status, lang)) +
      '</div>' +
      (learned.length ? '<div class="detail__learned"><p class="detail__learned-title">' + (lang==='en'?'What I learned':'무엇을 배웠는지') + '</p><ul class="bullets">' + learned.map(function (b){return '<li>' + t(b, lang) + '</li>';}).join('') + '</ul></div>' : '') +
      stores + '</div>';

    var mediaCol = '<div class="detail__media">' + media + '</div>';

    // 선택 상세 블록 (있을 때만)
    var d = p.detailBlocks || {};
    var blocks = '';
    if (has(d.problem, lang) || has(d.approach, lang) || has(d.retrospective, lang)) {
      blocks = '<div class="detail__blocks">' +
        block(lang, '문제', 'The problem', 'PROBLEM', d.problem) +
        block(lang, '접근', 'The approach', 'APPROACH', d.approach) +
        block(lang, '다시 한다면', 'Retrospective', 'RETROSPECTIVE', d.retrospective) +
      '</div>';
    }

    var prev = idx>0 ? items[idx-1] : null, next = idx<items.length-1 ? items[idx+1] : null;
    var pager = '<nav class="pager" aria-label="프로젝트 이동">' +
      (prev ? pagerItem('detail.html?p='+encodeURIComponent(prev.id), lang==='en'?'← Previous':'← 이전', t(prev.title, lang)) : pagerItem(base+'projects.html', lang==='en'?'← Projects':'← 목록', lang==='en'?'All projects':'전체 보기')) +
      (next ? pagerItem('detail.html?p='+encodeURIComponent(next.id), lang==='en'?'Next →':'다음 →', t(next.title, lang), 1) : pagerItem(base+'play.html', lang==='en'?'Play log →':'게임플레이 →', t(c.play&&c.play.title, lang), 1)) +
    '</nav>';

    return '<section class="section"><div class="wrap"><div class="detail">' + info + mediaCol + '</div>' + blocks + pager + '</div></section>';
  }
  function metaRow(k, v) {
    if (!v) return '';
    return '<div class="detail__meta-row"><p class="detail__meta-k">' + esc(k) + '</p><p class="detail__meta-v">' + esc(v) + '</p></div>';
  }
  function questStrip(q, lang) {
    q = q || {};
    var goal = t(q.goal, lang), result = t(q.result, lang);
    if (!goal && !result) return '';
    return '<div class="quest-strip">' +
      (q.cleared ? '<span class="quest-strip__badge">' + CLEAR_ICON + (lang==='en'?'CLEARED':'클리어') + '</span>' : '') +
      (goal ? '<span class="quest-strip__row"><span class="quest-strip__k">' + (lang==='en'?'QUEST':'퀘스트') + '</span><span class="quest-strip__v">' + esc(goal) + '</span></span>' : '') +
      (result ? '<span class="quest-strip__row"><span class="quest-strip__k">' + (lang==='en'?'RESULT':'결과') + '</span><span class="quest-strip__v quest-strip__v--hi">' + esc(result) + '</span></span>' : '') +
      '</div>';
  }
  function block(lang, ko, en, small, field) {
    var todo = lang==='en'?'To be written.':'작성 예정.';
    var body = has(field, lang) ? t(field, lang).split(/\n{2,}|\n/).filter(function(s){return s.trim();}).map(function(s){return '<p>'+s+'</p>';}).join('') : '<p class="muted">'+todo+'</p>';
    return '<div class="block reveal"><div class="block__label">' + (lang==='en'?en:ko) + '<small>' + small + '</small></div><div class="block__body">' + body + '</div></div>';
  }
  function pagerItem(href, dir, title, right) {
    return '<a class="pager__item" href="' + esc(href) + '"' + (right?' style="text-align:right"':'') + '><p class="pager__dir">' + dir + '</p><p class="pager__title">' + esc(title) + '</p></a>';
  }

  /* ---------- PLAY ---------- */
  function renderPlay(c, lang, base) {
    var pl = c.play || {};
    var cards = arr(pl.cards).map(function (card) {
      return '<article class="play-card reveal"><div class="play-card__top"><h3 class="play-card__name">' + esc(t(card.name, lang)) + '</h3>' +
        '<span class="play-card__hours">' + esc(t(card.hours, lang)) + '</span></div>' +
        '<p class="play-card__genre">' + esc(t(card.genre, lang)) + '</p>' +
        '<p class="play-card__note">' + esc(t(card.note, lang)) + '</p></article>';
    }).join('');
    return '<section class="section"><div class="wrap"><header class="section__head reveal">' +
      '<p class="eyebrow">' + (lang==='en'?'PLAY LOG':'게임플레이') + '</p>' +
      '<h2 class="section__title">' + esc(t(pl.title, lang)) + '</h2>' +
      '<p class="section__lead">' + esc(t(pl.lead, lang)) + '</p></header>' +
      '<div class="play">' + cards + '</div></div></section>';
  }

  global.PortfolioRender = {
    t: t, esc: esc, HREF: HREF,
    navHtml: navHtml, sheetHtml: sheetHtml, footerHtml: footerHtml,
    renderHome: renderHome, renderResume: renderResume, renderCover: renderCover,
    renderProjects: renderProjects, renderDetail: renderDetail, renderPlay: renderPlay,
    drawCardHtml: drawCardHtml
  };
})(window);
