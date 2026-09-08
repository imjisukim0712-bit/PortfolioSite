/* ============================================================================
   render.js — assets/content.js 의 내용을 화면으로 그려 주는 부분
   내용을 바꾸려면 이 파일이 아니라 assets/content.js 를 고치세요.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------- 도우미 ---------- */
  // 언어 선택: en 이 비어 있으면 ko 로 대체
  function t(field, lang) {
    if (field === null || field === undefined) return '';
    if (typeof field === 'string') return field;
    var v = field[lang];
    if (v === undefined || v === null || v === '') v = field.ko;
    return v === undefined || v === null ? '' : String(v);
  }
  // 속성값 이스케이프
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function arr(a) { return Array.isArray(a) ? a : []; }
  function has(field, lang) { return t(field, lang).trim() !== ''; }
  function toneClass(tone) {
    var allowed = { lavender: 1, butter: 1, blush: 1, cornflower: 1 };
    return tone && allowed[tone] ? ' tag--' + tone : '';
  }

  var GHOST =
    '<svg class="ghost" viewBox="0 0 32 36" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M16 2c-7.2 0-13 5.8-13 13v19l4.3-3.2 4.3 3.2 4.4-3.2 4.3 3.2 4.3-3.2 4.4 3.2V15c0-7.2-5.8-13-13-13z"/>' +
    '<ellipse cx="11.5" cy="15" rx="2.2" ry="2.7" fill="#3c315b"/>' +
    '<ellipse cx="20.5" cy="15" rx="2.2" ry="2.7" fill="#3c315b"/></svg>';
  var CHEV =
    '<svg class="chev" viewBox="0 0 4 8" aria-hidden="true"><path d="M.6 1 3 4 .6 7" fill="none" stroke="currentColor" stroke-width=".9" stroke-linecap="round"/></svg>';
  var ARROW =
    '<svg class="arrow" width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M4.2 3H9v4.8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var NAV_ORDER = ['about', 'projects', 'skills', 'career', 'play'];
  var SHEET_ORDER = ['about', 'projects', 'skills', 'career', 'play', 'contact'];

  /* ---------- 공통 조각 ---------- */

  function navHtml(c, lang, base, opts) {
    var o = opts || {};
    var links = NAV_ORDER.map(function (key) {
      var href = o.detail ? base + 'index.html#' + key : '#' + key;
      var active = o.active === key ? ' is-active' : '';
      var spy = o.detail ? '' : ' data-spy="' + key + '"';
      return '<li><a class="nav__link' + active + '" href="' + esc(href) + '"' + spy + '>' +
        '<span>' + esc(t(c.nav[key], lang)) + '</span>' + CHEV + '</a></li>';
    }).join('');

    return '' +
      '<a class="nav__logo" href="' + (o.detail ? esc(base + 'index.html') : '#top') + '">' + GHOST +
        '<span>' + esc(t(c.meta.name, lang)) + '</span>' +
        '<span class="nav__logo-en">' + esc(t(c.meta.role, lang)) + '</span>' +
      '</a>' +
      '<ul class="nav__menu">' + links + '</ul>' +
      '<div class="nav__actions">' +
        '<div class="lang-toggle" role="group" aria-label="언어 선택 / Language">' +
          '<button type="button" class="lang-toggle__btn" data-lang-btn="ko" aria-pressed="' + (lang === 'ko') + '">KR</button>' +
          '<button type="button" class="lang-toggle__btn" data-lang-btn="en" aria-pressed="' + (lang === 'en') + '">EN</button>' +
        '</div>' +
        '<a class="btn btn--primary btn--sm nav__cta" href="' + esc(base + c.meta.resumeUrl) + '">' +
          (lang === 'en' ? 'Résumé' : '이력서') + '</a>' +
        '<button type="button" class="nav__burger" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" ' +
          'aria-label="' + (lang === 'en' ? 'Open menu' : '메뉴 열기') + '">' +
          '<span class="nav__burger-lines" aria-hidden="true"></span></button>' +
      '</div>';
  }

  function sheetHtml(c, lang, base, opts) {
    var o = opts || {};
    var links = SHEET_ORDER.map(function (key, i) {
      var href = o.detail ? base + 'index.html#' + key : '#' + key;
      return '<a class="sheet__link" href="' + esc(href) + '">' +
        '<span class="sheet__num">' + ('0' + (i + 1)) + '</span>' +
        '<span>' + esc(t(c.nav[key], lang)) + '</span></a>';
    }).join('');
    return links +
      '<div class="sheet__foot"><a class="btn btn--primary" href="' + esc(base + c.meta.resumeUrl) + '">' +
      (lang === 'en' ? 'Download résumé (PDF)' : '이력서 다운로드 (PDF)') + '</a></div>';
  }

  function footerHtml(c, lang, base, opts) {
    var o = opts || {};
    var backHref = o.detail ? base + 'index.html#projects' : '#top';
    var backText = o.detail
      ? (lang === 'en' ? 'Back to the project list' : '프로젝트 목록으로')
      : (lang === 'en' ? 'Back to top' : '맨 위로 돌아가기');
    return '<p>&copy; ' + new Date().getFullYear() + ' ' +
      esc(t(c.meta.name, lang)) + ' · ' + esc(t(c.meta.role, lang)) + '</p>' +
      '<p><a href="' + esc(backHref) + '">' + backText + '</a></p>';
  }

  function eyebrowHtml(num, label) {
    return '<p class="eyebrow"><span class="eyebrow__num">' + num + '</span><span>' + esc(label) + '</span></p>';
  }

  function tagsHtml(tags, lang, style) {
    if (!arr(tags).length) return '';
    return '<div class="tags"' + (style ? ' style="' + style + '"' : '') + '>' +
      arr(tags).map(function (tag) {
        var text = tag.text !== undefined ? tag.text : tag;
        return '<span class="tag' + toneClass(tag.tone) + '">' + esc(t(text, lang)) + '</span>';
      }).join('') + '</div>';
  }

  function kvHtml(rows, lang) {
    return '<div class="kv">' + arr(rows).map(function (row) {
      return '<div class="kv__row"><span class="kv__k">' + esc(t(row.k, lang)) + '</span>' +
        '<span class="kv__v">' + esc(t(row.v, lang)) + '</span></div>';
    }).join('') + '</div>';
  }

  function resultsHtml(results, lang) {
    return '<div class="result-grid">' + arr(results).map(function (r) {
      var unit = t(r.unit, lang);
      return '<div class="result"><p class="result__num">' + esc(r.num) +
        (unit ? '<span style="font-size:.5em">' + esc(unit) + '</span>' : '') + '</p>' +
        '<p class="result__label">' + esc(t(r.label, lang)) + '</p></div>';
    }).join('') + '</div>';
  }

  function statsHtml(stats, lang) {
    return arr(stats).map(function (s) {
      var unit = t(s.unit, lang);
      return '<div class="stat reveal"><p class="stat__num">' + esc(s.num) +
        (unit ? '<span class="unit">' + esc(unit) + '</span>' : '') + '</p>' +
        '<p class="stat__label">' + esc(t(s.label, lang)) + '</p></div>';
    }).join('');
  }

  /* ---------- 랜딩 페이지 ---------- */

  function renderIndex(c, lang, base) {
    base = base || '';
    var mail = (c.meta.email || '').trim();
    var github = (c.meta.github || '').trim();

    /* 히어로 */
    var hero =
      '<section class="hero" id="top"><div class="wrap hero__inner">' +
        '<p class="hero__eyebrow">' + GHOST + '<span>' + esc(t(c.hero.eyebrow, lang)) + '</span></p>' +
        '<h1 class="hero__title">' + t(c.hero.titleHtml, lang) + '</h1>' +
        '<p class="hero__sub">' + esc(t(c.hero.sub, lang)) + '</p>' +
        '<div class="btn-row">' +
          '<a class="btn btn--primary" href="#projects">' + esc(t(c.hero.ctaPrimary, lang)) + '</a>' +
          '<a class="btn btn--on-dark" href="' + esc(base + c.meta.resumeUrl) + '">' + esc(t(c.hero.ctaSecondary, lang)) + '</a>' +
        '</div>' +
        '<p class="hero__meta">' +
          '<span class="badge"><span class="badge__dot" aria-hidden="true"></span><span>' + esc(t(c.hero.badge, lang)) + '</span></span>' +
          '<span class="hero__meta-text">' + esc(t(c.hero.updated, lang)) + '</span>' +
        '</p>' +
      '</div><span class="hero__cue" aria-hidden="true"><span class="hero__cue-line"></span>SCROLL</span></section>';

    /* 숫자 요약 */
    var stats = arr(c.stats).length
      ? '<section class="stat-strip"><div class="wrap"><div class="stat-grid">' + statsHtml(c.stats, lang) + '</div></div></section>'
      : '';

    /* 01 자기소개 */
    var aboutCards = arr(c.about.cards).map(function (card) {
      return '<article class="card reveal">' +
        (card.index ? '<span class="card__index">' + esc(card.index) + '</span>' : '') +
        '<h3 class="card__title">' + esc(t(card.title, lang)) + '</h3>' +
        '<p class="card__body">' + esc(t(card.body, lang)) + '</p></article>';
    }).join('');
    var about =
      '<section class="section" id="about"><div class="wrap">' +
        '<header class="section__head reveal">' + eyebrowHtml('01', t(c.nav.about, lang)) +
          '<h2 class="section__title">' + esc(t(c.about.title, lang)) + '</h2>' +
          '<p class="section__lead">' + esc(t(c.about.lead, lang)) + '</p></header>' +
        '<div class="grid grid--3">' + aboutCards + '</div>' +
        (has(c.about.quote, lang)
          ? '<blockquote class="quote reveal"><p>' + esc(t(c.about.quote, lang)) + '</p>' +
            (has(c.about.quoteBy, lang) ? '<cite>' + esc(t(c.about.quoteBy, lang)) + '</cite>' : '') + '</blockquote>'
          : '') +
      '</div></section>';

    /* 02 프로젝트 */
    var projectCards = arr(c.projects).map(function (p, i) {
      var no = 'PROJECT ' + ('0' + (i + 1)).slice(-2);
      var tags = arr(p.tags).map(function (tag) {
        return '<span class="tag' + toneClass(tag.tone) + '">' + esc(t(tag.text, lang)) + '</span>';
      }).join('');
      var bullets = arr(p.bullets).map(function (b) { return '<li>' + t(b, lang) + '</li>'; }).join('');
      return '<article class="project reveal">' +
        '<div class="project__top"><span class="project__no">' + no + '</span>' + tags + '</div>' +
        '<h3 class="project__title">' + esc(t(p.title, lang)) + '</h3>' +
        '<p class="project__sub">' + esc(t(p.sub, lang)) + '</p>' +
        '<div class="project__grid">' + kvHtml(p.kv, lang) +
          (bullets ? '<ul class="bullets">' + bullets + '</ul>' : '') + '</div>' +
        '<div class="project__foot">' +
          '<span class="muted" style="font-size:13px">' + esc(t(p.footNote, lang)) + '</span>' +
          '<a class="link-more" href="' + esc(base + 'projects/detail.html?p=' + encodeURIComponent(p.id)) + '">' +
            '<span>' + (lang === 'en' ? 'Full breakdown' : '자세히 보기') + '</span>' + ARROW + '</a>' +
        '</div></article>';
    }).join('');
    var notes = arr(c.projectNotes).map(function (n) {
      return '<div class="mini"><p class="mini__label">' + esc(t(n.label, lang)) + '</p>' +
        '<div class="mini__list"><p>' + t(n.body, lang) + '</p></div></div>';
    }).join('');
    var projects =
      '<section class="section section--bone" id="projects"><div class="wrap">' +
        '<header class="section__head reveal">' + eyebrowHtml('02', t(c.nav.projects, lang)) +
          '<h2 class="section__title">' + (lang === 'en' ? 'Made it, released it, learned from it' : '만들고, 출시하고, 배운 것들') + '</h2>' +
          '<p class="section__lead">' + (lang === 'en'
            ? 'Each one is written the same way: problem &rarr; approach &rarr; result &rarr; what I\'d redo.'
            : '모두 같은 순서로 정리했습니다. 문제 &rarr; 접근 &rarr; 결과 &rarr; 다시 한다면.') + '</p></header>' +
        '<div class="projects">' + projectCards + '</div>' +
        (notes ? '<div class="mini-grid reveal">' + notes + '</div>' : '') +
      '</div></section>';

    /* 03 핵심역량 */
    var skillCards = arr(c.skills.cards).map(function (card) {
      return '<article class="card reveal">' +
        '<h3 class="card__title">' + esc(t(card.title, lang)) + '</h3>' +
        '<p class="card__body">' + esc(t(card.body, lang)) + '</p>' +
        tagsHtml(card.tags, lang, 'margin-top:16px') + '</article>';
    }).join('');
    var skills =
      '<section class="section section--dark" id="skills"><div class="wrap">' +
        '<header class="section__head reveal">' + eyebrowHtml('03', t(c.nav.skills, lang)) +
          '<h2 class="section__title">' + esc(t(c.skills.title, lang)) + '</h2>' +
          '<p class="section__lead">' + esc(t(c.skills.lead, lang)) + '</p></header>' +
        '<div class="grid grid--3">' + skillCards + '</div>' +
      '</div></section>';

    /* 04 경력 · 활동 */
    var careerItems = arr(c.career.items).map(function (item) {
      return '<li class="tl-item' + (item.now ? ' tl-item--now' : '') + ' reveal">' +
        '<p class="tl-date">' + esc(t(item.date, lang)) + '</p>' +
        '<h3 class="tl-role">' + esc(t(item.role, lang)) + '</h3>' +
        '<p class="tl-org">' + esc(t(item.org, lang)) + '</p>' +
        '<p class="card__body tl-body">' + esc(t(item.body, lang)) + '</p>' +
        tagsHtml(item.tags, lang).replace('class="tags"', 'class="tags tl-tags"') + '</li>';
    }).join('');
    var career =
      '<section class="section" id="career"><div class="wrap">' +
        '<header class="section__head reveal">' + eyebrowHtml('04', t(c.career.heading, lang)) +
          '<h2 class="section__title">' + esc(t(c.career.title, lang)) + '</h2>' +
          '<p class="section__lead">' + esc(t(c.career.lead, lang)) + '</p></header>' +
        '<ol class="timeline">' + careerItems + '</ol>' +
      '</div></section>';

    /* 05 플레이 경험 */
    var playCards = arr(c.play.cards).map(function (card) {
      return '<article class="play-card reveal">' +
        '<div class="play-card__top"><h3 class="play-card__name">' + esc(t(card.name, lang)) + '</h3>' +
        '<span class="play-card__hours">' + esc(t(card.hours, lang)) + '</span></div>' +
        '<p class="play-card__genre">' + esc(t(card.genre, lang)) + '</p>' +
        '<p class="play-card__note"><span class="play-card__note-label">' + esc(t(card.noteLabel, lang)) + '</span>' +
        '<span>' + esc(t(card.note, lang)) + '</span></p></article>';
    }).join('');
    var play =
      '<section class="section section--bone" id="play"><div class="wrap">' +
        '<header class="section__head reveal">' + eyebrowHtml('05', t(c.nav.play, lang)) +
          '<h2 class="section__title">' + esc(t(c.play.title, lang)) + '</h2>' +
          '<p class="section__lead">' + esc(t(c.play.lead, lang)) + '</p></header>' +
        '<div class="play">' + playCards + '</div>' +
        tagsHtml(c.play.tags, lang, 'margin-top:32px') +
      '</div></section>';

    /* 06 연락처 */
    var contactButtons =
      '<a class="btn btn--primary" href="' + esc(base + c.meta.resumeUrl) + '">' +
        (lang === 'en' ? 'Download résumé (PDF)' : '이력서 다운로드 (PDF)') + '</a>' +
      (mail
        ? '<a class="btn btn--on-dark" href="mailto:' + esc(mail) + '">' + (lang === 'en' ? 'Send an email' : '이메일 보내기') + '</a>'
        : '<span class="btn btn--on-dark is-placeholder">' + (lang === 'en' ? 'Email — address to be added' : '이메일 — 주소 입력 예정') + '</span>') +
      (github ? '<a class="btn btn--on-dark" href="' + esc(github) + '" target="_blank" rel="noopener noreferrer">GitHub</a>' : '');
    var contact =
      '<section class="section section--dark contact" id="contact"><div class="wrap">' +
        eyebrowHtml('06', t(c.nav.contact, lang)).replace('class="eyebrow"', 'class="eyebrow reveal"') +
        '<h2 class="section__title reveal">' + esc(t(c.contact.title, lang)) + '</h2>' +
        '<p class="section__lead reveal">' + esc(t(c.contact.lead, lang)) + '</p>' +
        '<div class="btn-row reveal">' + contactButtons + '</div>' +
      '</div></section>';

    return hero + stats + about + projects + skills + career + play + contact;
  }

  /* ---------- 프로젝트 상세 페이지 ---------- */

  function renderDetail(c, lang, base, projectId) {
    base = base || '../';
    var index = -1;
    arr(c.projects).forEach(function (p, i) { if (p.id === projectId) index = i; });
    if (index < 0) {
      return '<section class="section"><div class="wrap"><h1 class="section__title">' +
        (lang === 'en' ? 'Project not found' : '프로젝트를 찾을 수 없습니다') + '</h1>' +
        '<p class="section__lead">' + (lang === 'en'
          ? 'This project id does not exist in content.js.'
          : 'content.js 에 해당 프로젝트 id 가 없습니다.') + '</p>' +
        '<div class="btn-row"><a class="btn btn--outline" href="' + esc(base + 'index.html#projects') + '">' +
        (lang === 'en' ? 'All projects' : '프로젝트 목록') + '</a></div></div></section>';
    }

    var p = c.projects[index];
    var d = p.detail || {};
    var no = 'PROJECT ' + ('0' + (index + 1)).slice(-2);

    var tags = '<span class="tag" style="background:rgba(253,252,254,.1);border-color:transparent;color:#e2dffe">' + no + '</span>' +
      arr(p.tags).map(function (tag) {
        return '<span class="tag' + toneClass(tag.tone) + '">' + esc(t(tag.text, lang)) + '</span>';
      }).join('');

    var heroSub = has(d.sub, lang) ? t(d.sub, lang) : t(p.sub, lang);
    var kvRows = arr(d.kv).length ? d.kv : p.kv;

    var hero =
      '<section class="detail-hero"><div class="wrap">' +
        '<a class="back-link" href="' + esc(base + 'index.html#projects') + '">' +
          '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M7.5 2 3.5 6l4 4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '<span>' + (lang === 'en' ? 'All projects' : '프로젝트 목록') + '</span></a>' +
        '<div class="tags" style="margin-bottom:20px">' + tags + '</div>' +
        '<h1 class="detail-hero__title">' + esc(t(p.title, lang)) + '</h1>' +
        '<p class="detail-hero__sub">' + esc(heroSub) + '</p>' +
        '<div class="detail-hero__kv kv">' + kvHtml(kvRows, lang).replace('<div class="kv">', '').replace(/<\/div>$/, '') + '</div>' +
      '</div></section>';

    var todo = lang === 'en' ? 'To be written.' : '작성 예정.';
    function block(labelKo, labelEn, small, bodyHtml) {
      return '<div class="block reveal"><div class="block__label"><span>' +
        (lang === 'en' ? labelEn : labelKo) + '</span><small>' + small + '</small></div>' +
        '<div class="block__body">' + bodyHtml + '</div></div>';
    }
    function paragraphs(field) {
      if (!has(field, lang)) return '<p class="muted">' + todo + '</p>';
      return t(field, lang).split(/\n{2,}|\n/).filter(function (s) { return s.trim(); })
        .map(function (s) { return '<p>' + s + '</p>'; }).join('');
    }

    var overview = arr(d.overview).length ? d.overview : p.bullets;
    var body =
      block('한눈에 보기', 'Overview', 'OVERVIEW',
        '<ul class="bullets">' + arr(overview).map(function (b) { return '<li>' + t(b, lang) + '</li>'; }).join('') + '</ul>') +
      block('문제 정의', 'The problem', 'PROBLEM', paragraphs(d.problem)) +
      block('접근', 'The approach', 'APPROACH', paragraphs(d.approach)) +
      block('결과', 'The result', 'RESULT', resultsHtml(d.results, lang)) +
      block('다시 한다면', 'If I did it again', 'RETROSPECTIVE',
        paragraphs(d.retrospective) +
        (has(d.quote, lang) ? '<blockquote class="quote" style="margin-top:8px"><p>' + esc(t(d.quote, lang)) + '</p></blockquote>' : ''));

    /* 이전 / 다음 */
    var prev = index > 0 ? c.projects[index - 1] : null;
    var next = index < c.projects.length - 1 ? c.projects[index + 1] : null;
    var pager = '<nav class="pager" aria-label="프로젝트 이동">' +
      (prev
        ? '<a class="pager__item" href="' + esc('detail.html?p=' + encodeURIComponent(prev.id)) + '">' +
          '<p class="pager__dir">' + (lang === 'en' ? '&larr; Previous project' : '&larr; 이전 프로젝트') + '</p>' +
          '<p class="pager__title">' + esc(t(prev.title, lang)) + '</p></a>'
        : '<a class="pager__item" href="' + esc(base + 'index.html#projects') + '">' +
          '<p class="pager__dir">' + (lang === 'en' ? '&larr; Back' : '&larr; 목록') + '</p>' +
          '<p class="pager__title">' + (lang === 'en' ? 'All projects' : '프로젝트 전체 보기') + '</p></a>') +
      (next
        ? '<a class="pager__item" href="' + esc('detail.html?p=' + encodeURIComponent(next.id)) + '" style="text-align:right">' +
          '<p class="pager__dir">' + (lang === 'en' ? 'Next project &rarr;' : '다음 프로젝트 &rarr;') + '</p>' +
          '<p class="pager__title">' + esc(t(next.title, lang)) + '</p></a>'
        : '<a class="pager__item" href="' + esc(base + 'index.html#contact') + '" style="text-align:right">' +
          '<p class="pager__dir">' + (lang === 'en' ? 'Contact &rarr;' : '연락처 &rarr;') + '</p>' +
          '<p class="pager__title">' + esc(t(c.contact.title, lang)) + '</p></a>') +
      '</nav>';

    return hero + '<section class="section"><div class="wrap">' + body + pager + '</div></section>';
  }

  global.PortfolioRender = {
    t: t, esc: esc,
    navHtml: navHtml, sheetHtml: sheetHtml, footerHtml: footerHtml,
    renderIndex: renderIndex, renderDetail: renderDetail
  };
})(window);
