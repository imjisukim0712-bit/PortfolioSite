/* ============================================================================
   famicom.js — 패미컴 시안(pixel-famicom) 전용 스크립트
   ----------------------------------------------------------------------------
   홈·이력서 상단(.hero)을 휴대용 게임기 한 대로 만듭니다. CSS(pixel-famicom.css)가
   본체·그립·화면을 그리고, 이 파일은 손잡이의 버튼과 카트리지 꽂기 연출을 맡습니다.

     왼쪽 그립   SELECT ◀ ▶  — 홈에서는 사진 옆 '한마디'를 앞뒤로 넘깁니다 ('한 마디 더' 버튼 대신).
                              한마디가 없는 페이지(이력서)에서는 이전·다음 절로 이동합니다.
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
  var SKIN = 'pixel-famicom';
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
    boot:   { ko: '읽는 중',       en: 'LOADING' },
    view:   { ko: '자세히 보기',   en: 'View details' },
    viewS:  { ko: '보기',          en: 'View' },
    eject:  { ko: '꺼내기',        en: 'Eject' },
    period: { ko: '기간',          en: 'Period' },
    team:   { ko: '인원',          en: 'Team' },
    role:   { ko: '역할',          en: 'Role' },
    status: { ko: '상태',          en: 'Status' },
    quest:  { ko: '퀘스트',        en: 'Quest' },
    cleared:{ ko: '달성',          en: 'Cleared' }
  };
  var GRADES = { SSR: 1, SR: 1, R: 1, A: 1 };

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

    var left = document.createElement('div');
    left.className = 'fc-grip fc-grip--l';
    left.innerHTML =
      '<span class="fc-lbl">' + T.select + '</span>' +
      '<button type="button" class="fc-key" data-fc-step="-1" aria-label="' + esc(t(hasQuip ? T.prevQ : T.prevS)) + '"><span aria-hidden="true">◀</span></button>' +
      '<button type="button" class="fc-key" data-fc-step="1" aria-label="' + esc(t(hasQuip ? T.nextQ : T.nextS)) + '"><span aria-hidden="true">▶</span></button>';

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
    if (pending) { if (pending.ready) viewDetail(); return; }        /* 꽂혀 있으면 A = 자세히 보기 */
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
    var b = document.querySelector('[data-theme-toggle]'); if (b) b.click();
  }

  /* ── 카트리지 꽂기 연출 ────────────────────────────────────────────────
     ① 누른 카드를 집어 올려(살짝 기울며) ② 슬롯 아래까지 가져간 뒤 ③ 단자부터 슬롯 안으로 밀어 넣습니다
     (clip-path 로 슬롯 선 위쪽을 잘라 '안으로 들어가는' 것처럼 — 중간에 한 번 걸렸다가 딸깍 들어감)
     ④ 본체가 살짝 눌리고 ⑤ 화면이 켜지며 '읽는 중' → ⑥ 프로젝트 개요(타이틀 화면).
     '자세히 보기'(A) 로 이동, '꺼내기'(B) 로 카트리지가 도로 나와 제자리로 돌아갑니다.
     슬롯은 화면에 보이는 게임기(.hero.fc-console)의 아래쪽. 게임기가 안 보이면 화면 위에서 슬롯 띠가 내려옵니다. */
  var pending = null;   /* 꽂혀 있는 카트리지 { a, fly, slot, hero, useHero, dx, dy1, H, ready } */
  function projectOf(a) {
    var m = (a.getAttribute('href') || '').match(/[?&]p=([^&#]+)/), id = m ? decodeURIComponent(m[1]) : '';
    var items = (content().projects && content().projects.items) || [];
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }
  function cardTitle(a) { var n = a.querySelector('.gcard__name'); return n ? n.textContent : ''; }
  function go(a) { a.setAttribute('data-fc-go', '1'); a.click(); }
  function cleanup() {
    pending = null;
    Array.prototype.forEach.call(document.querySelectorAll('.fc-fly, .fc-slot, .fc-boot'), function (el) { el.parentNode && el.parentNode.removeChild(el); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-fc-lifted]'), function (el) { el.style.visibility = ''; el.removeAttribute('data-fc-lifted'); });
    var h = document.querySelector('.hero.is-slot'); if (h) h.classList.remove('is-slot');
    setAB(null, null);
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
    /* 진행 중인 부드러운 스크롤(CSS scroll-behavior)을 그 자리에서 멈춥니다 — 슬롯 위치를 화면 좌표로 재기 때문 */
    try { window.scrollTo({ top: window.pageYOffset, left: window.pageXOffset, behavior: 'instant' }); } catch (e) {}
    var r = a.getBoundingClientRect(), H = r.height, W = r.width;

    /* 슬롯: 보이는 게임기 아래쪽, 없으면 화면 위 슬롯 띠 */
    var hero = document.querySelector('.hero.fc-console'), hb = hero && hero.getBoundingClientRect();
    var useHero = !!(hb && hb.bottom > navH() + 20 && hb.bottom < window.innerHeight - 40);
    var slot = null, lineY, cx;
    if (useHero) { hero.classList.add('is-slot'); lineY = hb.bottom - 3; cx = hb.left + hb.width / 2; }
    else {
      slot = document.createElement('div'); slot.className = 'fc-slot'; document.body.appendChild(slot);
      var sb = slot.getBoundingClientRect(); lineY = sb.bottom - 3; cx = sb.left + sb.width / 2;
      slot.animate([{ transform: 'translate(-50%, -100%)' }, { transform: 'translate(-50%, 0)' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
    }

    /* 날아가는 복제본 (원본은 자리만 비워 둠) */
    var fly = document.createElement('div'); fly.className = 'fc-fly';
    fly.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + W + 'px;height:' + H + 'px';
    var clone = face.cloneNode(true);
    clone.classList.remove('is-tilt', 'reveal', 'is-visible'); clone.classList.add('fc-fly__card');
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
    var fly = me.fly, dx = me.dx, dy1 = me.dy1, H = me.H;
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
      back.onfinish = function () { if (pending === me) cleanup(); };
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
    if (!e.target.closest) return;
    if (e.target.closest('[data-fc-view]')) { e.preventDefault(); viewDetail(); return; }
    if (e.target.closest('[data-fc-eject]')) { e.preventDefault(); eject(); return; }
    var b = e.target.closest('[data-fc-step]'); if (b) { e.preventDefault(); step(parseInt(b.getAttribute('data-fc-step'), 10) || 1); return; }
    var ka = e.target.closest('[data-fc-a]'); if (ka) { e.preventDefault(); pressA(ka.getAttribute('data-fc-a')); return; }
    if (e.target.closest('[data-fc-b]')) { e.preventDefault(); pressB(); }
  });

  /* 다시 그려질 때마다 붙입니다 (main 의 자식이 바뀌면) */
  function scan() { cleanup(); var h = document.querySelector('.hero'); if (h) build(h); }
  function init() {
    var main = document.querySelector('[data-slot="main"]');
    if (main && window.MutationObserver) new MutationObserver(scan).observe(main, { childList: true });
    scan();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
