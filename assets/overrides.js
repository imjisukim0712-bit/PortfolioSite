/* ============================================================================
   overrides.js — 시각 편집기(edit.html)가 저장하는 "겉모습" 값들.
   ----------------------------------------------------------------------------
   · theme  : 색 토큰 덮어쓰기 (light / dark)
   · styles : 요소별 CSS 덮어쓰기 (키 = 편집기가 만든 안정적인 CSS 선택자)
   · layout : 요소별 이동(px) — transform 으로 적용
   · hidden : 숨긴 요소 키 목록
   글로 직접 고쳐도 되지만, 보통은 edit.html 에서 화면을 눌러 수정합니다.
   ========================================================================== */
window.PORTFOLIO_OVERRIDES = {
  rev: "",
  theme: { light: {}, dark: {} },
  styles: {},
  layout: {},
  hidden: []
};

/* ---- 적용기: 이 파일 하나만 읽어도 화면에 반영됩니다 ---------------------- */
(function () {
  'use strict';
  var O = window.PORTFOLIO_OVERRIDES || {};
  var CAMEL = /[A-Z]/g;
  function kebab(k) { return k.indexOf('--') === 0 ? k : k.replace(CAMEL, function (m) { return '-' + m.toLowerCase(); }); }

  function themeVars(map) {
    var out = '';
    for (var k in map) { if (map[k]) out += '  ' + (k.indexOf('--') === 0 ? k : '--' + k) + ': ' + map[k] + ';\n'; }
    return out;
  }
  function ruleFor(sel, decl) {
    var body = '';
    for (var k in decl) {
      var v = decl[k];
      if (v === '' || v === null || v === undefined) continue;
      body += kebab(k) + ':' + v + ' !important;';
    }
    return body ? sel + '{' + body + '}\n' : '';
  }

  function build() {
    var css = '';
    var lt = themeVars((O.theme && O.theme.light) || {});
    var dk = themeVars((O.theme && O.theme.dark) || {});
    if (lt) css += ':root{\n' + lt + '}\n';
    if (dk) css += ':root[data-theme="dark"]{\n' + dk + '}\n';
    var st = O.styles || {};
    for (var sel in st) css += ruleFor(sel, st[sel]);
    var lay = O.layout || {};
    for (var s2 in lay) {
      var p = lay[s2] || {};
      if (p.x || p.y) css += s2 + '{transform:translate(' + (p.x || 0) + 'px,' + (p.y || 0) + 'px) !important;}\n';
    }
    (O.hidden || []).forEach(function (s3) { css += s3 + '{display:none !important;}\n'; });
    return css;
  }

  function apply() {
    var css = build();
    var tag = document.getElementById('pf-overrides');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'pf-overrides';
      (document.head || document.documentElement).appendChild(tag);
    }
    tag.textContent = css;
  }

  apply();
  window.PORTFOLIO_OVERRIDES.apply = apply;   // 편집기에서 실시간 갱신용
})();
