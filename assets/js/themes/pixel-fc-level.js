/* ============================================================================
   pixel-fc-level.js — LEVEL 스테이지 전용 스크립트
   ----------------------------------------------------------------------------
   홈·이력서 상단(.hero)을 휴대용 게임기 한 대로 만듭니다. CSS(pixel-fc-level.css)가
   본체·그립·화면을 그리고, 이 파일은 손잡이의 버튼과 카트리지 꽂기 연출을 맡습니다.

     왼쪽 그립   SELECT ◀ ▶  — 홈에서는 사진 옆 '한마디'를 앞뒤로 넘깁니다 ('한 마디 더' 버튼 대신).
                              한마디가 없는 페이지(이력서)에서는 이전·다음 절로 이동합니다.
                 ✉ 메일 — content.js 의 meta.email 로 메일 쓰기 (값이 비어 있으면 키를 달지 않습니다).
     오른쪽 그립 B = 밝기(다크 · 라이트)  ·  A = 뽑기(홈: 프로젝트 덱을 누름) / 아래로(이력서)
                 카트리지가 꽂혀 있는 동안은 A = 자세히 보기 · B = 꺼내기
     카트리지    프로젝트 카드(.draw-card · .proj-card)를 누르면 바로 열리지 않고,
                 카트리지가 게임기 아래 슬롯(게임기가 안 보이면 화면 위에 내려오는 슬롯)으로
                 날아 들어간 뒤 화면이 켜집니다. 홈에서는 프로젝트 개요(타이틀 화면)가 뜨고,
                 '자세히 보기'를 누르면 화면 전체가 켜지며 상세로 넘어갑니다 ('꺼내기'는 카트리지를 도로 뺍니다).
                 프로젝트 목록 같은 다른 페이지에서는 개요 없이 곧바로 상세로 넘어갑니다.

   themes.js 의 pixel 테마 항목 `scripts` 로 읽히며, 다른 시안에서는 아무것도 하지 않습니다.
   페이지가 다시 그려질 때마다(언어 전환·갤러리 페이지 이동) 자동으로 다시 붙습니다.
   문구는 모두 { ko, en } 쌍입니다 — 한국어를 고치면 영어도 함께 고칩니다.
   ========================================================================== */
(function () {
  'use strict';
  var SKIN = 'pixel-fc-level';
  var T = {
    select: 'SELECT',
    prevQ:  { ko: '이전 한마디',   en: 'Previous quip' },
    nextQ:  { ko: '다음 한마디',   en: 'Next quip' },
    prevS:  { ko: '이전 절로',     en: 'Previous section' },
    nextS:  { ko: '다음 절로',     en: 'Next section' },
    light:  { ko: '밝기',          en: 'Light' },
    lightA: { ko: '다크 · 라이트 전환', en: 'Toggle dark mode' },
    draw:   { ko: '뽑기',          en: 'Draw' },
    drawA:  { ko: '프로젝트 카드 뽑기', en: 'Draw project cards' },
    down:   { ko: '아래로',        en: 'Down' },
    downA:  { ko: '아래 내용으로',  en: 'Scroll to the content' },
    mail:   { ko: '메일',          en: 'Mail' },
    mailA:  { ko: '이메일 보내기',  en: 'Send me an email' },
    boot:   { ko: '읽는 중',       en: 'LOADING' },
    view:   { ko: '자세히 보기',   en: 'View details' },
    viewS:  { ko: '보기',          en: 'View' },
    eject:  { ko: '꺼내기',        en: 'Eject' },
    period: { ko: '기간',          en: 'Period' },
    team:   { ko: '인원',          en: 'Team' },
    role:   { ko: '역할',          en: 'Role' },
    status: { ko: '상태',          en: 'Status' },
    quest:  { ko: '퀘스트',        en: 'Quest' },
    cleared:{ ko: '달성',          en: 'Cleared' },
    play:   { ko: '게임플레이',    en: 'Gameplay' }
  };
  var GRADES = { SSR: 1, SR: 1, R: 1, A: 1 };
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
    var hardware = document.createElement('span');
    hardware.className = 'fcc-hardware';
    hardware.setAttribute('aria-hidden', 'true');
    hardware.innerHTML = '<span class="fcc-led"></span><span class="fcc-speaker"><i></i><i></i><i></i><i></i><i></i></span>';
    hero.appendChild(hardware);
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
    if (window.__lvTitle && window.__lvTitle.step(dir)) return;                                       /* 홈 메뉴 화면: 커서 이동 */
    var app = window.PortfolioApp;
    if (hero.querySelector('[data-quip]') && app && app.cycleQuip) { app.cycleQuip(dir); return; }   /* 홈: 한마디 넘기기 */
    var secs = sections(); if (!secs.length) return;                                                  /* 그 밖: 절 이동 */
    var y = window.pageYOffset + navH() + 2, cur = -1;
    for (var i = 0; i < secs.length; i++) if (secs[i].getBoundingClientRect().top + window.pageYOffset <= y) cur = i;
    var nxt = Math.max(0, Math.min(secs.length - 1, cur + dir));
    scrollToY(secs[nxt].getBoundingClientRect().top + window.pageYOffset - navH());
  }
  function pressA(kind) {
    if (pending) { if (pending.ready) viewDetail(); return; }        /* 꽂혀 있으면 A = 자세히 보기 */
    if (window.__lvTitle && window.__lvTitle.a()) return;             /* 홈: 타이틀 = 시작, 메뉴 = 결정 */
    if (kind === 'draw') {
      var deck = document.querySelector('[data-draw]'); if (!deck) return;
      deck.click();
      var r = deck.getBoundingClientRect();
      if (r.top < navH() || r.bottom > window.innerHeight) scrollToY(r.top + window.pageYOffset - navH() - 8);
      return;
    }
    var secs = sections();
    if (secs.length) scrollToY(secs[0].getBoundingClientRect().top + window.pageYOffset - navH());
  }
  function pressB() {
    if (pending) { if (pending.ready) eject(); return; }               /* 꽂혀 있으면 B = 꺼내기 */
    if (window.__lvTitle && window.__lvTitle.b()) return;             /* 홈 메뉴 화면: B = 처음 화면 */
    var b = document.querySelector('[data-theme-toggle]'); if (b) b.click();
  }

  /* ── 카트리지 꽂기 연출 ────────────────────────────────────────────────
     ① 누른 카드를 집어 올려(살짝 기울며) ② 슬롯 아래까지 가져간 뒤 ③ 단자부터 슬롯 안으로 밀어 넣습니다
     (clip-path 로 슬롯 선 위쪽을 잘라 '안으로 들어가는' 것처럼 — 중간에 한 번 걸렸다가 딸깍 들어감)
     ④ 본체가 살짝 눌리고 ⑤ 화면이 켜지며 '읽는 중' → ⑥ 프로젝트 개요(타이틀 화면).
     '자세히 보기'(A) 로 이동, '꺼내기'(B) 로 카트리지가 도로 나와 제자리로 돌아갑니다.
     슬롯은 화면에 보이는 게임기(.hero.fc-console)의 아래쪽. 게임기가 안 보이면 화면 위에서 슬롯 띠가 내려옵니다.

     연출 도중 스크롤해도 어긋나지 않도록, 카트리지는 **슬롯과 같은 좌표계**에 둡니다:
     게임기 슬롯이면 문서에(absolute — 스크롤을 따라 게임기와 함께 움직임),
     화면 위 슬롯 띠면 화면에(fixed — 스크롤과 상관없이 띠와 함께 제자리).
     한쪽만 따라 움직이면 스크롤한 만큼 슬롯이 달아나 카트리지가 허공에 꽂힙니다. */
  var pending = null;   /* 꽂혀 있는 카트리지 { a, fly, slot, hero, useHero, dx, dy1, H, ready } */
  function projectOf(a) {
    var m = (a.getAttribute('href') || '').match(/[?&]p=([^&#]+)/), id = m ? decodeURIComponent(m[1]) : '';
    var items = (content().projects && content().projects.items) || [];
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }
  function cardTitle(a) { var n = a.querySelector('.gcard__name'); return n ? n.textContent : ''; }
  function go(a) { a.setAttribute('data-fc-go', '1'); a.click(); }
  function cleanup(restoreFocus) {
    var origin = pending && pending.a;
    pending = null;
    Array.prototype.forEach.call(document.querySelectorAll('.fc-fly, .fc-slot, .fc-boot'), function (el) { el.parentNode && el.parentNode.removeChild(el); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-fc-lifted]'), function (el) { el.style.visibility = ''; el.removeAttribute('data-fc-lifted'); });
    var h = document.querySelector('.hero.is-slot'); if (h) h.classList.remove('is-slot');
    setAB(null, null);
    if (restoreFocus && origin && origin.isConnected) {
      try { origin.focus({ preventScroll: true }); } catch (e) { origin.focus(); }
    }
  }

  /* 개요(타이틀 화면) 마크업 */
  function overviewHtml(a, p) {
    var c = content(), tabs = (c.projects && c.projects.tabs) || {};
    if (!p) return '<div class="fc-ov"><h2 class="fc-ov__t">' + esc(cardTitle(a)) + '</h2>' + buttons() + '</div>';
    var grade = GRADES[p.grade] ? p.grade : 'A';
    var art = a.querySelector('.gcard__art');
    var rows = [[T.period, p.period], [T.team, p.headcount], [T.role, p.myRole], [T.status, p.status]].filter(function (r) { return t(r[1]); })
      .map(function (r) { return '<span class="fc-ov__k">' + esc(t(r[0])) + '</span><span class="fc-ov__v">' + esc(t(r[1])) + '</span>'; }).join('');
    var q = p.quest || {};
    var quest = t(q.goal) ? '<p class="fc-ov__q"><span class="fc-ov__k">' + esc(t(T.quest)) + '</span> ' + esc(t(q.goal)) +
      (t(q.result) ? ' <span class="fc-ov__arrow" aria-hidden="true">→</span> <b>' + esc(t(q.result)) + '</b>' : '') +
      (q.cleared ? ' <span class="fc-ov__clear">✓ ' + esc(t(T.cleared)) + '</span>' : '') + '</p>' : '';
    return '<div class="fc-ov">' +
      '<div class="fc-ov__art" aria-hidden="true">' + (art ? art.innerHTML : '') + '</div>' +
      '<div class="fc-ov__body">' +
        '<p class="fc-ov__meta"><span class="fc-ov__cat">' + esc(t(tabs[p.category]) || '') + '</span><span class="fc-ov__tag">' + esc(t(p.tag)) + '</span><span class="fc-ov__grade" data-grade="' + grade + '">' + grade + '</span></p>' +
        '<h2 class="fc-ov__t">' + esc(t(p.title)) + '</h2>' +
        (t(p.sub) ? '<p class="fc-ov__sub">' + esc(t(p.sub)) + '</p>' : '') +
        (rows ? '<dl class="fc-ov__rows">' + rows + '</dl>' : '') +
        quest + buttons() +
      '</div></div>';
    function buttons() {
      return '<div class="fc-ov__btns">' +
        '<button type="button" class="fc-ov__btn fc-ov__btn--go" data-fc-view><b>A</b> ' + esc(t(T.view)) + ' →</button>' +
        '<button type="button" class="fc-ov__btn" data-fc-eject><b>B</b> ' + esc(t(T.eject)) + '</button></div>';
    }
  }

  function insert(a) {
    var face = a.classList.contains('gcard') ? a : a.querySelector('.gcard'); if (!face) { go(a); return; }
    var sx = window.pageXOffset, sy = window.pageYOffset;          /* 화면 좌표 → 문서 좌표로 옮길 때 더할 스크롤량 */
    var r = a.getBoundingClientRect(), H = r.height, W = r.width;

    /* 슬롯: 보이는 게임기 아래쪽, 없으면 화면 위 슬롯 띠 */
    var hero = document.querySelector('.hero.fc-console'), hb = hero && hero.getBoundingClientRect();
    var useHero = !!(hb && hb.bottom > navH() + 20 && hb.bottom < window.innerHeight - 40);
    var slot = null, lineY, cx;
    if (useHero) { hero.classList.add('is-slot'); lineY = hb.bottom - 3; cx = hb.left + hb.width / 2; }
    else {
      slot = document.createElement('div'); slot.className = 'fc-slot';
      /* 띠는 상단바 **아래**에 놓습니다 — 카트리지·띠 모두 상단바보다 아래 층이라, 화면 맨 위에 두면 바에 가립니다 */
      var nb = document.querySelector('.nav');
      slot.style.top = Math.max(0, nb ? nb.getBoundingClientRect().bottom + 4 : 0) + 'px';
      document.body.appendChild(slot);
      /* 띠는 화면 밖(translateY -100%)에서 시작하므로, 그대로 재면 꽂는 선이 띠 높이(58px)만큼 위로 잡혀
         카트리지가 띠보다 위, 허공에 꽂혔습니다 → 변형을 잠깐 꺼서 '내려온 뒤'의 자리를 재고 되돌립니다 */
      slot.style.transform = 'none';
      var sb = slot.getBoundingClientRect(); lineY = sb.bottom - 3; cx = sb.left + sb.width / 2;
      slot.style.transform = '';
      slot.animate([{ transform: 'translate(-50%, -100%)' }, { transform: 'translate(-50%, 0)' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
    }

    /* 날아가는 복제본 (원본은 자리만 비워 둠) — 슬롯이 문서에 있으면 복제본도 문서에 붙입니다 */
    var fly = document.createElement('div'); fly.className = 'fc-fly';
    fly.style.cssText = 'position:' + (useHero ? 'absolute' : 'fixed') +
      ';left:' + (r.left + (useHero ? sx : 0)) + 'px;top:' + (r.top + (useHero ? sy : 0)) + 'px' +
      ';width:' + W + 'px;height:' + H + 'px';
    var clone = face.cloneNode(true);
    clone.classList.remove('is-tilt', 'reveal', 'is-visible', 'fcc-pressed'); clone.classList.add('fc-fly__card');
    clone.removeAttribute('style'); clone.removeAttribute('href'); clone.removeAttribute('hidden');
    fly.appendChild(clone); document.body.appendChild(fly);
    a.style.visibility = 'hidden'; a.setAttribute('data-fc-lifted', '1');

    var dx = cx - (r.left + W / 2), dy1 = lineY - r.top;   /* 카드 윗변(단자)이 슬롯 선에 닿는 자리 */
    pending = { a: a, fly: fly, slot: slot, hero: hero, useHero: useHero, dx: dx, dy1: dy1, H: H, ready: false };
    var me = pending;
    var at = function (fx, fy, s, rot) { return 'translate(' + fx + 'px,' + fy + 'px) scale(' + s + ') rotate(' + rot + 'deg)'; };

    /* ① 집어 올리기 → ② 슬롯 아래로 가져가기 (살짝 기울었다가 바로 서며 자리를 잡음) */
    var lift = fly.animate(
      [{ transform: at(0, 0, 1, 0), offset: 0 },
       { transform: at(dx * .08, -26, 1.08, -3), offset: .28, easing: 'cubic-bezier(.2,.7,.3,1)' },
       { transform: at(dx * .82, dy1 * .8, 1.05, 1.5), offset: .78, easing: 'cubic-bezier(.3,.6,.3,1)' },
       { transform: at(dx, dy1, 1, 0), offset: 1 }],
      { duration: 980, easing: 'cubic-bezier(.35,.65,.25,1)', fill: 'forwards' });
    lift.onfinish = function () {
      if (pending !== me) return;
      /* ③ 슬롯 안으로: 절반쯤 들어가다 한 번 걸리고, 딸깍 끝까지 (transform 과 clip-path 를 같은 키프레임으로 → 슬롯 선에 딱 맞춤) */
      var push = fly.animate(
        [{ transform: at(dx, dy1, 1, 0),            clipPath: 'inset(0 0 0 0)',     offset: 0,   easing: 'cubic-bezier(.4,.1,.7,1)' },
         { transform: at(dx, dy1 - H * .58, 1, 0),  clipPath: 'inset(58% 0 0 0)',   offset: .58, easing: 'linear' },
         { transform: at(dx, dy1 - H * .60, 1, 0),  clipPath: 'inset(60% 0 0 0)',   offset: .74, easing: 'cubic-bezier(.6,0,.9,.6)' },
         { transform: at(dx, dy1 - H, 1, 0),        clipPath: 'inset(100% 0 0 0)',  offset: 1 }],
        { duration: 900, delay: 140, fill: 'forwards' });
      push.onfinish = function () {
        if (pending !== me) return;
        /* 연출 도중 스크롤해 게임기가 화면 밖으로 밀려났으면, 화면이 켜지기 전에 도로 데려옵니다 */
        if (useHero) {
          var hr = hero.getBoundingClientRect();
          var seen = Math.min(hr.bottom, window.innerHeight) - Math.max(hr.top, navH());
          if (seen < Math.min(hr.height, window.innerHeight - navH()) * .6) scrollToY(hr.top + window.pageYOffset - navH() - 8);
        }
        /* ④ 본체가 살짝 눌림 */
        var body = useHero ? hero : slot;
        if (body) body.animate([{ transform: useHero ? 'translateY(0)' : 'translate(-50%,0)' }, { transform: useHero ? 'translateY(4px)' : 'translate(-50%,4px)' }, { transform: useHero ? 'translateY(0)' : 'translate(-50%,0)' }], { duration: 220, easing: 'ease-out', fill: useHero ? 'none' : 'forwards' });
        /* ⑤ 화면 켜짐: 검은 화면 + '읽는 중' → ⑥ 개요 */
        var boot = document.createElement('div'); boot.className = 'fc-boot' + (useHero ? '' : ' fc-boot--full');
        boot.innerHTML = '<div class="fc-boot__load"><span>▶ ' + esc(t(T.boot)) + '</span><span class="fc-boot__c" aria-hidden="true">_</span></div>';
        (useHero ? hero.querySelector('.wrap') : document.body).appendChild(boot);
        setTimeout(function () {
          if (pending !== me) return;
          /* 개요는 홈에서만 — 프로젝트 목록 등 다른 페이지에서는 곧바로 상세로 넘어갑니다 */
          if ((document.body.getAttribute('data-page') || 'home') !== 'home') { go(a); return; }
          boot.innerHTML = overviewHtml(a, projectOf(a));
          boot.classList.add('is-on');
          me.ready = true; setAB(t(T.viewS), t(T.eject));
          var b = boot.querySelector('[data-fc-view]'); if (b) { try { b.focus({ preventScroll: true }); } catch (e) {} }
        }, 820);
      };
    };
  }

  /* 자세히 보기: 액정이 화면 전체를 덮으며 켜지고, 그 뒤에 상세 페이지로 넘어갑니다 */
  function viewDetail() {
    var me = pending; if (!me || !me.ready) return;
    me.ready = false; setAB(null, null);
    var full = document.createElement('div');
    full.className = 'fc-boot fc-boot--full is-on';
    full.innerHTML = '<div class="fc-boot__load"><span>▶ ' + esc(cardTitle(me.a) || t(T.boot)) + '</span><span class="fc-boot__c" aria-hidden="true">_</span></div>';
    document.body.appendChild(full);
    setTimeout(function () { go(me.a); }, 560);
  }

  /* 꺼내기: 화면이 꺼지고 카트리지가 슬롯에서 나와 제자리로 돌아갑니다 */
  function eject() {
    var me = pending; if (!me || !me.ready) return;
    me.ready = false; setAB(null, null);
    var boot = document.querySelector('.fc-boot'); if (boot) boot.parentNode.removeChild(boot);
    var fly = me.fly, H = me.H;
    /* 슬롯 띠(화면에 붙은 경우)는 그 사이 스크롤한 만큼 카드가 옮겨 갔을 수 있으니 기준점을 다시 잡습니다
       — 카트리지는 아직 완전히 잘려 보이지 않으므로 자리를 옮겨도 눈에 띄지 않습니다 */
    if (!me.useHero) {
      var r2 = me.a.getBoundingClientRect();
      var lx = parseFloat(fly.style.left) || 0, ly = parseFloat(fly.style.top) || 0;
      me.dx += lx - r2.left; me.dy1 += ly - r2.top;
      fly.style.left = r2.left + 'px'; fly.style.top = r2.top + 'px';
    }
    var dx = me.dx, dy1 = me.dy1;
    var at = function (fx, fy) { return 'translate(' + fx + 'px,' + fy + 'px)'; };
    var out = fly.animate(
      [{ transform: at(dx, dy1 - H), clipPath: 'inset(100% 0 0 0)' }, { transform: at(dx, dy1), clipPath: 'inset(0 0 0 0)' }],
      { duration: 520, easing: 'cubic-bezier(.3,.6,.3,1)', fill: 'forwards' });
    out.onfinish = function () {
      if (pending !== me) return;
      if (me.slot) me.slot.animate([{ transform: 'translate(-50%,0)' }, { transform: 'translate(-50%,-100%)' }], { duration: 300, delay: 320, easing: 'ease-in', fill: 'forwards' });
      var back = fly.animate(
        [{ transform: at(dx, dy1) + ' scale(1)' }, { transform: at(dx * .5, dy1 * .5 - 24) + ' scale(1.06)', offset: .5 }, { transform: at(0, 0) + ' scale(1)' }],
        { duration: 720, easing: 'cubic-bezier(.35,.65,.25,1)', fill: 'forwards' });
      back.onfinish = function () { if (pending === me) cleanup(true); };
    };
  }

  document.addEventListener('click', function (e) {
    if (!active()) return;
    var a = e.target.closest ? e.target.closest('a.draw-card, a.proj-card') : null;
    if (!a || a.getAttribute('data-fc-go') || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;   /* 새 탭 등은 그대로 */
    if (reduced()) return;                                                       /* 모션 최소화: 바로 이동 */
    e.preventDefault(); e.stopPropagation();
    if (pending) return;
    insert(a);
  }, true);
  window.addEventListener('pageshow', function (e) { if (e.persisted) cleanup(); });
  document.addEventListener('keydown', function (e) {
    if (!pending || !pending.ready) return;
    if (e.key === 'Escape') { e.preventDefault(); eject(); }
  });

  document.addEventListener('click', function (e) {
    if (!active() || !e.target.closest) return;
    if (e.target.closest('[data-fc-view]')) { e.preventDefault(); viewDetail(); return; }
    if (e.target.closest('[data-fc-eject]')) { e.preventDefault(); eject(); return; }
    var b = e.target.closest('[data-fc-step]'); if (b) { e.preventDefault(); step(parseInt(b.getAttribute('data-fc-step'), 10) || 1); return; }
    var ka = e.target.closest('[data-fc-a]'); if (ka) { e.preventDefault(); pressA(ka.getAttribute('data-fc-a')); return; }
    if (e.target.closest('[data-fc-b]')) { e.preventDefault(); pressB(); }
  });

  /* 언어 전환 시에도 원본 내용/편집 앵커는 그대로 두고 제목 한 줄만 덧붙입니다. */
  function finishMenus() {
    var games = document.querySelector('.hp-games');
    if (games && !games.parentNode.querySelector('.fcc-play-heading')) {
      var title = document.createElement('h2');
      title.className = 'hp-h fcc-play-heading';
      title.textContent = t(T.play);
      games.parentNode.insertBefore(title, games);
    }
    var heading = document.querySelector('.fcc-play-heading');
    if (heading) heading.textContent = t(T.play);
  }
  /* 링크의 Enter 입력에도 버튼과 같은 2px 눌림. 기본 키 동작은 유지합니다. */
  function releaseKeys() {
    Array.prototype.forEach.call(document.querySelectorAll('.fcc-pressed'), function (el) { el.classList.remove('fcc-pressed'); });
  }
  document.addEventListener('keydown', function (e) {
    if (!active() || e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
    var el = e.target.closest && e.target.closest('a[href], button');
    if (el && !el.disabled && el.getAttribute('aria-disabled') !== 'true' && (e.key === 'Enter' || el.tagName === 'BUTTON')) el.classList.add('fcc-pressed');
  });
  document.addEventListener('keyup', releaseKeys);
  document.addEventListener('focusout', releaseKeys);
  window.addEventListener('blur', releaseKeys);

  /* 다시 그려질 때마다 붙입니다 (main 의 직접 자식이 바뀌면). */
  function scan() { if (!active()) return; if (pending) cleanup(); var h = document.querySelector('.hero'); if (h) build(h); finishMenus(); }
  function init() {
    var main = document.querySelector('[data-slot="main"]');
    if (main && window.MutationObserver) new MutationObserver(scan).observe(main, { childList: true });
    scan();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* ROUND 4 — decoration only. The cartridge/controller code above is unchanged.
   Keep the HUD in sync with the native render cycle without replacing content,
   moving links, changing focus or introducing another interaction. */
(function () {
  'use strict';
  var SKIN = 'pixel-fc-level';
  var WORLDS = {
    home:     { number: '1-1', ko: '홈',             en: 'Home' },
    resume:   { number: '1-2', ko: '이력서',         en: 'Résumé' },
    cover:    { number: '1-3', ko: '자기소개서',     en: 'About me' },
    projects: { number: '1-4', ko: '프로젝트',       en: 'Projects' },
    play:     { number: '1-5', ko: '게임플레이',     en: 'Gameplay' },
    detail:   { number: '1-4', ko: '프로젝트 상세',  en: 'Project details' }
  };
  function paint() {
    if (document.documentElement.getAttribute('data-skin') !== SKIN) return;
    var app = window.PortfolioApp;
    var language = app && app.getLang ? app.getLang() : document.documentElement.lang;
    var en = language === 'en';
    var world = WORLDS[document.body.getAttribute('data-page')] || WORLDS.home;
    var nav = document.querySelector('[data-slot="nav"]');
    if (nav) {
      var hud = nav.querySelector('.level-hud-world');
      if (!hud) {
        hud = document.createElement('span');
        hud.className = 'level-hud-world';
        hud.setAttribute('aria-hidden', 'true');
        var number = document.createElement('b');
        var name = document.createElement('span');
        hud.appendChild(number); hud.appendChild(name); nav.appendChild(hud);
      }
      var numberText = 'WORLD ' + world.number;
      var pageText = en ? world.en : world.ko;
      if (hud.firstElementChild.textContent !== numberText) hud.firstElementChild.textContent = numberText;
      if (hud.lastElementChild.textContent !== pageText) hud.lastElementChild.textContent = pageText;
    }
    var footer = document.querySelector('[data-slot="footer"]');
    if (footer) {
      var end = footer.querySelector('.level-end');
      if (!end) {
        end = document.createElement('p'); end.className = 'level-end';
        end.setAttribute('aria-hidden', 'true'); footer.insertBefore(end, footer.firstChild);
      }
      var label = en ? 'THANKS FOR PLAYING' : '플레이해 주셔서 감사합니다';
      if (end.textContent !== label) end.textContent = label;
    }
  }
  function initStageDecor() {
    paint();
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(paint);
    ['nav', 'main', 'footer'].forEach(function (slot) {
      var target = document.querySelector('[data-slot="' + slot + '"]');
      if (target) observer.observe(target, { childList: true });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-skin'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initStageDecor);
  else initStageDecor();
})();

/* 12회차 — 땅 위 · 땅 밑. 하늘은 첫 화면(하위 페이지는 페이지 머리)까지만, 그 바로 아래가 지면(풀 · 흙)이고
   흙이 이어지다 어두운 지하로 내려갑니다. 지면 높이는 화면마다 달라 여기서 재어 main 의 --lv-surface 로 넘기고,
   그림은 CSS(pixel-fc-folio.css 의 스테이지 절, main::before)가 그립니다.
   홈은 지하의 네 창을 한 장의 메뉴 화면으로 묶으려고 개요 절들을 .lv-menu 하나에 담습니다(내용 · 순서는 그대로). */
(function () {
  'use strict';
  var SKIN = 'pixel-fc-level';
  function active() { return document.documentElement.getAttribute('data-skin') === SKIN; }
  function mainEl() { return document.querySelector('[data-slot="main"]'); }
  function groupMenu(main) {
    if (!main.querySelector(':scope > .home-screen') || main.querySelector(':scope > .lv-menu')) return;
    var parts = main.querySelectorAll(':scope > section.hp');
    if (!parts.length) return;
    var menu = document.createElement('div');
    menu.className = 'lv-menu';
    main.insertBefore(menu, parts[0]);
    Array.prototype.forEach.call(parts, function (s) { menu.appendChild(s); });
  }
  /* 13회차: 이력서 숫자 줄을 첫 화면 맨 위 점수판(HUD)으로 — 게임 화면 위쪽의 점수 · 동전 · 월드 · 시간 줄처럼 */
  function hud(main) {
    var home = main.querySelector(':scope > .home-screen');
    var facts = home && home.querySelector('.fcs-intro > .fcs-facts');
    if (!facts) return;
    facts.classList.add('lv-hud');
    home.insertBefore(facts, home.firstChild);
  }
  function measure() {
    var main = mainEl(); if (!main) return;
    if (!active()) { main.style.removeProperty('--lv-surface'); return; }
    var top = main.getBoundingClientRect().top, y = 0;
    var first = main.querySelector(':scope > .home-screen, :scope > .fcs-stage');
    var head = main.querySelector(':scope > .section:first-of-type :is(.section__head, .proj-head)');
    if (first) y = first.getBoundingClientRect().bottom - top;
    else if (head && !main.querySelector('.detail')) y = head.getBoundingClientRect().bottom - top + 144;   /* 머리 아래 16px 띄우고 128px 지면 소품 띠 */
    main.style.setProperty('--lv-surface', Math.round(y) + 'px');
  }
  var queued = false;
  function update() {
    if (queued) return; queued = true;
    requestAnimationFrame(function () {
      queued = false;
      var main = mainEl(); if (!main) return;
      if (active()) { groupMenu(main); hud(main); }
      measure();
    });
  }
  function init() {
    update();
    var main = mainEl();
    if (main && window.MutationObserver) new MutationObserver(update).observe(main, { childList: true });
    if (main && window.ResizeObserver) new ResizeObserver(update).observe(main);
    if (window.MutationObserver) new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin', 'lang'] });
    window.addEventListener('resize', update);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* 15회차 — 홈 = 타이틀 화면. 아래 내용 · 진열판 없이 첫 화면만 두고,
   게임기를 누르거나 · 아래로 밀거나(휠 · 끌기 · 쓸기) · A · ↓ 를 누르면 기울어 있던 게임기가 똑바로 서며 화면 가득 커지고,
   게임기 화면에는 페이지 메뉴, 그 아래에는 카트리지(프로젝트 카드)가 놓입니다. B · Esc · 맨 위에서 위로 밀기 = 타이틀로.
   상태는 body[data-lv="title" | "menu"] 하나(언어 전환으로 main 이 다시 그려져도 유지), 그림은 pixel-fc-folio.css 의 15회차 절.
   크기가 커지는 연출은 판(.fcs-rig)의 처음 · 나중 상자를 재서 되돌려 그리는 방식(FLIP)이라 글자는 늘 실제 크기로 선명합니다. */
(function () {
  'use strict';
  var SKIN = 'pixel-fc-level';
  var T = {
    start:  { ko: '눌러서 시작', en: 'PRESS START' },
    hint:   { ko: '게임기를 누르거나 아래로 밀면 시작합니다', en: 'Press the console or scroll down to start' },
    menu:   { ko: '메뉴', en: 'MENU' },
    title:  { ko: '플레이어 선택', en: 'PLAYER SELECT' },
    keys:   { ko: '◀ ▶ 고르기 · A 결정 · B 처음 화면', en: '◀ ▶ select · A enter · B title' },
    navA:   { ko: '페이지 메뉴', en: 'Page menu' },
    powerA: { ko: '게임기 켜기 — 메뉴 열기', en: 'Power on — open the menu' },
    goL:    { ko: '시작', en: 'Start' },
    pickL:  { ko: '결정', en: 'Enter' },
    pickA:  { ko: '고른 메뉴로 가기', en: 'Open the selected page' },
    backL:  { ko: '처음', en: 'Title' },
    backA:  { ko: '처음 화면으로', en: 'Back to the title screen' },
    lightL: { ko: '밝기', en: 'Light' },
    lightA: { ko: '다크 · 라이트 전환', en: 'Toggle dark mode' },
    mail:   { ko: '연락하기', en: 'Contact' },
    desc: {
      'resume.html':       { ko: '경력 · 핵심역량 · 인적사항', en: 'Career, skills and profile' },
      'cover-letter.html': { ko: '함께 일하면 어떤 기획자인지', en: 'What I am like to work with' },
      'projects.html':     { ko: '게임 · 기획 프로젝트 전체', en: 'Every game and design project' },
      'play.html':         { ko: '장르별 플레이 기록', en: 'What I play, by genre' }
    }
  };
  var ID = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
  var sel = 0, busy = false;

  function lang() {
    var v = window.PortfolioApp && window.PortfolioApp.getLang ? window.PortfolioApp.getLang() : document.documentElement.getAttribute('lang');
    return v === 'en' ? 'en' : 'ko';
  }
  function t(o) { return (o && (o[lang()] || o.ko)) || ''; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function reduced() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function on() { return document.documentElement.getAttribute('data-skin') === SKIN && document.body.getAttribute('data-page') === 'home' && !!document.querySelector('.home-screen .fcs-rig .hero'); }
  function state() { return document.body.getAttribute('data-lv'); }
  function rig() { return document.querySelector('.home-screen .fcs-rig'); }
  function items() { return Array.prototype.slice.call(document.querySelectorAll('.lv-msel .lv-mi')); }
  function inserted() { return !!document.querySelector('.fc-fly, .fc-boot'); }

  /* 게임기 화면에 붙는 것: 타이틀의 '눌러서 시작', 메뉴 화면의 페이지 목록 · 키 안내 */
  function build() {
    var info = document.querySelector('.home-screen .fcs-info'); if (!info) return;
    if (!info.querySelector('.lv-start')) {
      var st = document.createElement('p'); st.className = 'lv-start'; st.setAttribute('aria-hidden', 'true');
      info.appendChild(st);
    }
    info.querySelector('.lv-start').textContent = '▶ ' + t(T.start);
    var nav = info.querySelector('.lv-msel');
    if (!nav) { nav = document.createElement('nav'); nav.className = 'lv-msel'; info.appendChild(nav); }
    var rows = [];
    Array.prototype.forEach.call(document.querySelectorAll('.nav__menu .nav__link'), function (a) {
      var href = a.getAttribute('href') || '', file = href.split('/').pop().split('?')[0];
      if (!T.desc[file]) return;   /* 홈은 빼고 */
      rows.push({ href: href, label: a.textContent.trim(), desc: t(T.desc[file]) });
    });
    var c = window.PORTFOLIO_CONTENT || {}, mail = ((c.meta && c.meta.email) || '').trim();
    if (mail) rows.push({ href: 'mailto:' + mail, label: t(T.mail), desc: mail });
    nav.setAttribute('aria-label', t(T.navA));
    nav.innerHTML = '<ol>' + rows.map(function (r, i) {
      return '<li><a class="lv-mi" href="' + esc(r.href) + '" data-i="' + i + '"><b class="lv-mi__t">' + esc(r.label) + '</b><span class="lv-mi__d">' + esc(r.desc) + '</span></a></li>';
    }).join('') + '</ol><p class="lv-msel__keys" aria-hidden="true">' + esc(t(T.keys)) + '</p>';
    sel = Math.min(sel, rows.length - 1);
    mark();
    var intro = document.querySelector('.home-screen .fcs-intro');
    if (intro) {
      var hint = intro.querySelector('.lv-hint');
      if (!hint) { hint = document.createElement('p'); hint.className = 'lv-hint'; intro.appendChild(hint); }
      hint.textContent = t(T.hint);
    }
  }
  function mark() {
    items().forEach(function (a, i) { a.parentNode.classList.toggle('is-sel', i === sel); });
  }
  function label(which, text, aria) {
    var l = document.querySelector('[data-fc-lbl="' + which + '"]'), k = document.querySelector(which === 'a' ? '[data-fc-a]' : '[data-fc-b]');
    if (l) { l.textContent = text; l.setAttribute('data-orig', text); }   /* 카트리지를 뺄 때 이 글자로 돌아오도록 data-orig 도 */
    if (k) k.setAttribute('aria-label', aria);
  }
  /* 상태에 맞춰 글자 · 접근성 속성을 맞춤 (그림은 CSS) */
  function apply() {
    var st = state(), hero = document.querySelector('.home-screen .fcs-rig .hero');
    var bar = document.querySelector('.home-screen .gui-scr__t');
    if (bar) bar.textContent = t(st === 'menu' ? T.menu : T.title);
    if (hero) {
      if (st === 'title') { hero.setAttribute('tabindex', '0'); hero.setAttribute('role', 'button'); hero.setAttribute('aria-label', t(T.powerA)); }
      else { hero.removeAttribute('tabindex'); hero.removeAttribute('role'); hero.removeAttribute('aria-label'); }
    }
    if (st === 'menu') { label('a', t(T.pickL), t(T.pickA)); label('b', t(T.backL), t(T.backA)); }
    else { label('a', t(T.goL), t(T.powerA)); label('b', t(T.lightL), t(T.lightA)); }
    var nav = document.querySelector('.nav-wrap') || document.querySelector('.nav');   /* 위에 붙은 상단바 높이 — 첫 화면을 한 화면에 맞추는 데 씀 */
    document.documentElement.style.setProperty('--lv-nav', (nav ? Math.round(nav.getBoundingClientRect().height) : 64) + 'px');
  }

  /* 판의 실제 상자(기울기를 뺀) */
  function box(el) { var keep = el.style.transform; el.style.transform = 'none'; var r = el.getBoundingClientRect(); el.style.transform = keep; return r; }
  function go(next) {
    if (busy || state() === next || inserted()) return;
    var r = rig(); if (!r) return;
    var anim = !reduced() && !!r.animate && window.innerWidth >= 900;
    window.scrollTo(0, 0);
    var oldT = getComputedStyle(r).transform, before = box(r), origin = getComputedStyle(r).transformOrigin.split(' ').map(parseFloat);
    /* 메뉴로 갈 때 사라지는 점수판 · 제목은 그 자리에 붙잡아 두고 흐리게(아래 판이 위로 당겨져도 튀지 않게) */
    var pinned = [], fades = [];
    if (anim && next === 'menu') {
      Array.prototype.forEach.call(document.querySelectorAll('.home-screen > .lv-hud, .home-screen .fcs-intro'), function (el) {
        var b = el.getBoundingClientRect();
        el.style.cssText += ';position:fixed;left:' + b.left + 'px;top:' + b.top + 'px;width:' + b.width + 'px;margin:0;z-index:0;display:' + getComputedStyle(el).display;
        pinned.push(el);
      });
    }
    document.body.classList.add('lv-moving');
    document.body.setAttribute('data-lv', next);
    apply();
    var done = function () {
      busy = false;
      pinned.forEach(function (el) { ['position', 'left', 'top', 'width', 'margin', 'z-index', 'display'].forEach(function (k) { el.style.removeProperty(k); }); });
      fades.forEach(function (f) { f.cancel(); });
      document.body.classList.remove('lv-moving');
      if (next === 'menu') {
        var deck = document.querySelector('[data-draw]'); if (deck) deck.click();   /* 카트리지를 한 장씩 깔아 놓음 */
        var first = items()[sel]; if (first) { try { first.focus({ preventScroll: true }); } catch (e) {} }
      } else {
        var h = document.querySelector('.home-screen .fcs-rig .hero'); if (h) { try { h.focus({ preventScroll: true }); } catch (e) {} }
      }
    };
    if (!anim) { done(); return; }
    busy = true;
    var newT = getComputedStyle(r).transform, after = box(r);
    /* 처음 상자의 기준점(transform-origin)이 나중 상자의 기준점에 오도록 옮기고, 폭 비율만큼 줄여 처음 모습에서 출발 */
    var fx = origin[0] / after.width, fy = origin[1] / after.height;
    var dx = (before.left + before.width * fx) - (after.left + after.width * fx);
    var dy = (before.top + before.height * fy) - (after.top + after.height * fy);
    var s = before.width / after.width;
    var a = r.animate([
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ') ' + (oldT === 'none' ? ID : oldT) },
      { transform: 'translate(0px,0px) scale(1) ' + (newT === 'none' ? ID : newT) }
    ], { duration: 980, easing: 'cubic-bezier(.65,0,.35,1)' });   /* 천천히 들어 올려 똑바로 세운 뒤 내려놓듯 */
    if (next === 'menu') pinned.forEach(function (el) { fades.push(el.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 -24px' }], { duration: 360, easing: 'ease-in', fill: 'forwards' })); });
    a.onfinish = a.oncancel = done;
  }
  function move(dir) {
    var list = items(); if (!list.length) return;
    sel = (sel + dir + list.length) % list.length; mark();
    try { list[sel].focus({ preventScroll: true }); } catch (e) {}
  }

  /* 기존 손잡이 키(pixel-fc-level.js 위쪽)가 먼저 물어봄 — 처리했으면 true */
  window.__lvTitle = {
    step: function (dir) { if (!on() || state() !== 'menu') return false; move(dir); return true; },
    a: function () {
      if (!on()) return false;
      if (state() === 'title') { go('menu'); return true; }
      var it = items()[sel]; if (it) it.click(); return true;
    },
    b: function () { if (!on() || state() !== 'menu') return false; go('title'); return true; }
  };

  /* 게임기 누르기(손잡이 키 · 메일 키는 제 기능 그대로) */
  document.addEventListener('click', function (e) {
    if (!on() || state() !== 'title' || !e.target.closest) return;
    var hero = e.target.closest('.home-screen .fcs-rig .hero'); if (!hero) return;
    if (e.target.closest('.fc-key, .fc-ab, .fc-grip a')) return;
    e.preventDefault(); e.stopPropagation(); go('menu');
  }, true);
  document.addEventListener('mouseover', function (e) {
    if (!on() || state() !== 'menu' || !e.target.closest) return;
    var a = e.target.closest('.lv-mi'); if (a) { sel = +a.getAttribute('data-i') || 0; mark(); }
  });
  document.addEventListener('focusin', function (e) {
    var a = e.target.closest && e.target.closest('.lv-mi'); if (a) { sel = +a.getAttribute('data-i') || 0; mark(); }
  });
  document.addEventListener('keydown', function (e) {
    if (!on() || e.altKey || e.ctrlKey || e.metaKey || inserted()) return;
    var tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    var st = state(), onHero = e.target.closest && e.target.closest('.home-screen .fcs-rig .hero');
    if (st === 'title') {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || ((e.key === 'Enter' || e.key === ' ') && (onHero || e.target === document.body))) { e.preventDefault(); go('menu'); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); go('title'); return; }
    var inMenu = e.target.closest && e.target.closest('.lv-msel');
    if (inMenu || e.target === document.body) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    }
  });
  /* 아래로 밀기: 휠 · 손가락 쓸기 · 마우스 끌기. 타이틀은 페이지 맨 아래(보통 한 화면이라 곧바로)에서만, 메뉴 → 타이틀은 맨 위에서 위로 밀 때만 */
  function atBottom() { return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2; }
  window.addEventListener('wheel', function (e) {
    if (!on() || inserted()) return;
    if (busy) { e.preventDefault(); return; }
    if (state() === 'title' && e.deltaY > 6 && atBottom()) { e.preventDefault(); go('menu'); }
    else if (state() === 'menu' && e.deltaY < -6 && window.scrollY <= 0) { e.preventDefault(); go('title'); }
  }, { passive: false });
  var ty = null, tb = false;
  window.addEventListener('touchstart', function (e) { if (on() && state() === 'title') { ty = e.touches[0].clientY; tb = atBottom(); } }, { passive: true });
  window.addEventListener('touchend', function (e) {
    if (ty === null || !on()) return;
    var dy = ty - (e.changedTouches[0] || {}).clientY; ty = null;
    if (state() === 'title' && tb && dy > 50) go('menu');
  }, { passive: true });
  var py = null;
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || !on() || state() !== 'title' || !e.target.closest || !e.target.closest('.home-screen')) return;
    if (e.target.closest('a, button, input')) return;
    py = e.clientY;
  });
  document.addEventListener('pointerup', function (e) {
    if (py === null) return; var dy = py - e.clientY; py = null;
    if (dy > 60 && on() && state() === 'title') go('menu');
  });

  function scan() {
    if (!on()) { document.body.removeAttribute('data-lv'); return; }
    if (!state()) document.body.setAttribute('data-lv', 'title');
    build(); apply();
  }
  var queued = false;
  function later() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; scan(); }); }
  function init() {
    scan();
    var main = document.querySelector('[data-slot="main"]');
    if (main && window.MutationObserver) new MutationObserver(later).observe(main, { childList: true });
    var navs = document.querySelector('[data-slot="nav"]');
    if (navs && window.MutationObserver) new MutationObserver(later).observe(navs, { childList: true });
    if (window.MutationObserver) new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin', 'lang'] });
    window.addEventListener('resize', apply);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
