/* ============================================================================
   fc-stage.js — 패미컴 '기울인 구도' (정돈 · 3D 픽셀 · 복셀 안이 함께 씀)
   ----------------------------------------------------------------------------
   첫 화면을 [왼쪽 큰 제목] + [오른쪽에 살짝 기울어진 게임기 + 그 바로 밑, 같은 기울기의 카트리지 진열판]
   으로 다시 놓습니다. 게임기 자체(손잡이·버튼·꽂기 연출)는 famicom.js 를 복제한 각 안의 스크립트가 그대로 맡고,
   이 파일은 자리만 옮깁니다:
     · .fcs-stage  = .fcs-intro(눈썹 글자·큰 제목·한 줄) + .fcs-rig(기울이는 판)
     · .fcs-rig    = .hero(게임기) + 홈이면 .draw(카트리지 진열판)   ← CSS 가 판 전체를 한 번에 기울임
     · 게임기 화면 안 = 사진 + .fcs-info(이름 · 한마디 · 버튼)
   SKINS 에 든 시안일 때만 동작하고, [data-slot="main"] 이 다시 그려지면(언어 전환 등) 다시 붙습니다.
   문구는 { ko, en } 쌍입니다.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__portfolioFcStage) return;
  window.__portfolioFcStage = true;
  var SKINS = { 'pixel-fc-classic': 1, 'pixel-fc-px3d': 1, 'pixel-fc-voxel': 1,
                'pixel-fc-icon': 1, 'pixel-fc-dot': 1, 'pixel-fc-blueprint': 1, 'pixel-fc-flat': 1, 'pixel-fc-ukiyo': 1,
                'pixel-fc-iso': 1, 'pixel-fc-line': 1, 'pixel-fc-snes': 1, 'pixel-fc-kraft': 1, 'pixel-fc-level': 1,
                'pixel-fc-gold': 1, 'pixel-fc-metal': 1, 'pixel-fc-museum': 1,
                'pixel-fc-laureate': 1, 'pixel-fc-gallery': 1, 'pixel-fc-rally': 1,
                'pixel-fc-dot-cx': 1, 'pixel-fc-kraft-cx': 1, 'pixel-fc-level-cx': 1, 'pixel-fc-rally-cx': 1 };
  var CAPTION = { ko: '카트리지를 골라 꽂으면 게임기 화면에 프로젝트가 켜집니다', en: 'Pick a cartridge and slot it in to boot the project on screen' };
  /* 포트폴리오 다듬기(10회차) 안: 홈 제목 아래에 이력서 숫자(content.js 의 resume.stats)를 한 줄로 */
  var FOLIO = { 'pixel-fc-dot': 1, 'pixel-fc-kraft': 1, 'pixel-fc-level': 1, 'pixel-fc-rally': 1 };

  function active() { return !!SKINS[document.documentElement.getAttribute('data-skin')]; }
  function lang() {
    var v = window.PortfolioApp && window.PortfolioApp.getLang ? window.PortfolioApp.getLang() : document.documentElement.getAttribute('lang');
    return v === 'en' ? 'en' : 'ko';
  }
  function node(tag, cls, text) { var el = document.createElement(tag); el.className = cls; if (text) el.textContent = text; return el; }
  function pick(o) { var L = lang(); return typeof o === 'string' ? o : (o && (o[L] || o.ko)) || ''; }

  function facts() {
    var c = window.PORTFOLIO_CONTENT || {}, stats = (c.resume && c.resume.stats) || [];
    if (!stats.length) return null;
    var list = node('dl', 'fcs-facts');
    stats.forEach(function (s) {
      var item = node('div', 'fcs-fact'), unit = pick(s.unit), value = node('dd', 'fcs-fact__v', s.num || '');
      /* 영어 단위(titles · yrs)는 숫자와 띄우고, 기호·한글 단위(+ · 종 · 년)는 붙입니다 */
      if (unit) value.appendChild(node('span', 'fcs-fact__u' + (/^[A-Za-z]/.test(unit) ? ' fcs-fact__u--word' : ''), unit));
      item.appendChild(node('dt', 'fcs-fact__k', pick(s.label)));
      item.appendChild(value);
      list.appendChild(item);
    });
    return list;
  }

  function stage() {
    if (!active()) return;
    var hero = document.querySelector('.hero');
    if (!hero || hero.closest('.fcs-stage')) return;
    var grid = hero.querySelector('.hero__grid'), lead = grid && grid.firstElementChild;
    if (!lead || lead.classList.contains('hero__media')) return;
    var box = node('div', 'fcs-stage'), intro = node('div', 'fcs-intro'), rig = node('div', 'fcs-rig');
    hero.parentNode.insertBefore(box, hero);
    box.appendChild(intro); box.appendChild(rig); rig.appendChild(hero);
    var tray = box.parentNode.querySelector(':scope > .draw');
    if (tray) { rig.appendChild(tray); box.classList.add('fcs-stage--home'); }

    /* 제목 쪽은 왼쪽으로, 버튼은 화면 안에 남김 */
    var actions = lead.querySelector('.btn-row');
    while (lead.firstChild) intro.appendChild(lead.firstChild);
    lead.className = 'fcs-info';
    var portrait = hero.querySelector('.hero__portrait');
    if (portrait) {
      ['.portrait__cap', '.quip', '.quip__more'].forEach(function (sel) {
        var el = portrait.querySelector(sel); if (el) lead.appendChild(el);
      });
    }
    var note = intro.querySelector('.hero__note'); if (note) lead.appendChild(note);
    if (actions) lead.appendChild(actions);
    if (tray) intro.appendChild(node('p', 'fcs-caption', CAPTION[lang()]));
    if (tray && FOLIO[document.documentElement.getAttribute('data-skin')]) { var list = facts(); if (list) intro.appendChild(list); }
  }

  function scan() { if (active()) stage(); }
  function start() {
    scan();
    var main = document.querySelector('[data-slot="main"]');
    if (main && window.MutationObserver) new MutationObserver(scan).observe(main, { childList: true });
    if (window.MutationObserver) new MutationObserver(scan).observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
