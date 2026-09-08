/* ============================================================================
   skin.js — assets/overrides.js 의 값을 화면에 적용합니다.
   ----------------------------------------------------------------------------
   · theme  → :root 색 토큰          · styles → 요소별 CSS (!important)
   · layout → transform 이동         · hidden → display:none
   · blocks → 편집기에서 새로 만든 요소(글·제목·이미지·버튼·상자·구분선·여백)
   overrides.js 는 편집기가 덮어쓰는 데이터 파일이고, 이 파일은 손대지 않아도 됩니다.
   ========================================================================== */
(function () {
  'use strict';
  var O = window.PORTFOLIO_OVERRIDES = window.PORTFOLIO_OVERRIDES || {};
  O.theme  = O.theme  || { light:{}, dark:{} };
  O.styles = O.styles || {};
  O.layout = O.layout || {};
  O.hidden = O.hidden || [];
  O.blocks = O.blocks || [];

  var CAMEL = /[A-Z]/g;
  function kebab(k) { return k.indexOf('--') === 0 ? k : k.replace(CAMEL, function (m) { return '-' + m.toLowerCase(); }); }
  function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function t(f, lang) { if (f === null || f === undefined) return ''; if (typeof f === 'string') return f; var v = f[lang]; if (v === undefined || v === null || v === '') v = f.ko; return v == null ? '' : String(v); }

  /* ---- CSS 만들기 ---- */
  function themeVars(map) { var out = ''; for (var k in map) { if (map[k]) out += '  ' + (k.indexOf('--') === 0 ? k : '--' + k) + ': ' + map[k] + ';\n'; } return out; }
  function ruleFor(sel, decl) {
    var body = '';
    for (var k in decl) { var v = decl[k]; if (v === '' || v === null || v === undefined) continue; body += kebab(k) + ':' + v + ' !important;'; }
    return body ? sel + '{' + body + '}\n' : '';
  }
  var BASE_CSS =
    '.pf-blk{position:relative;box-sizing:border-box}\n' +
    'p.pf-blk{margin:0;font-size:var(--text-body);line-height:1.6;color:var(--text)}\n' +
    'h2.pf-blk{margin:0;font-size:var(--text-heading);line-height:1.2;letter-spacing:-.02em;color:var(--heading)}\n' +
    '.pf-blk--img{margin:0;width:min(100%,480px)}\n' +
    '.pf-blk--img img{display:block;width:100%;height:100%;object-fit:cover;border-radius:var(--radius-card,24px)}\n' +
    '.pf-blk--box{width:240px;height:140px;background:var(--surface-2);border-radius:var(--radius-card,24px)}\n' +
    '.pf-blk--hr{border:0;border-top:1px solid var(--border);margin:24px 0}\n' +
    '.pf-blk--spacer{height:48px}\n' +
    '.pf-blocks{padding-block:var(--section-pad-y,64px)}\n' +
    '.pf-blocks .wrap>.pf-blk+.pf-blk{margin-top:16px}\n';

  function build() {
    var css = BASE_CSS;
    var lt = themeVars(O.theme.light || {}), dk = themeVars(O.theme.dark || {});
    if (lt) css += ':root{\n' + lt + '}\n';
    if (dk) css += ':root[data-theme="dark"]{\n' + dk + '}\n';
    for (var sel in O.styles) css += ruleFor(sel, O.styles[sel]);
    for (var s2 in O.layout) { var p = O.layout[s2] || {}; if (p.x || p.y) css += s2 + '{transform:translate(' + (p.x || 0) + 'px,' + (p.y || 0) + 'px) !important;}\n'; }
    O.hidden.forEach(function (s3) { css += s3 + '{display:none !important;}\n'; });
    return css;
  }
  function apply() {
    var tag = document.getElementById('pf-overrides');
    if (!tag) { tag = document.createElement('style'); tag.id = 'pf-overrides'; (document.head || document.documentElement).appendChild(tag); }
    tag.textContent = build();
  }

  /* ---- 새 요소(blocks) 그리기 ---- */
  function blockHtml(b, lang) {
    var id = ' data-blk="' + esc(b.id) + '" class="pf-blk pf-blk--' + esc(b.type) + '"';
    switch (b.type) {
      case 'heading': return '<h2' + id + '>' + esc(t(b.text, lang)) + '</h2>';
      case 'text':    return '<p' + id + '>' + esc(t(b.text, lang)) + '</p>';
      case 'image':   return '<figure' + id + '><img src="' + esc(b.src || '') + '" alt="' + esc(t(b.alt, lang)) + '" loading="lazy"></figure>';
      case 'button':  return '<a' + id.replace('class="', 'class="btn btn--primary ') + ' href="' + esc(b.href || '#') + '">' + esc(t(b.text, lang) || '버튼') + '</a>';
      case 'box':     return '<div' + id + '></div>';
      case 'divider': return '<hr' + id.replace('pf-blk--divider', 'pf-blk--hr') + '>';
      case 'spacer':  return '<div' + id + '></div>';
    }
    return '';
  }
  function renderBlocks(page, lang) {
    page = page || document.body.getAttribute('data-page') || 'home';
    lang = lang || (function () { try { return localStorage.getItem('portfolio:lang') || 'ko'; } catch (e) { return 'ko'; } })();
    // 이전에 그린 것 정리
    Array.prototype.forEach.call(document.querySelectorAll('[data-blk]'), function (n) { n.parentNode && n.parentNode.removeChild(n); });
    var orphan = document.querySelector('.pf-blocks'); if (orphan) orphan.parentNode.removeChild(orphan);
    var main = document.querySelector('[data-slot="main"]') || document.querySelector('main') || document.body;
    var list = O.blocks.filter(function (b) { return b && (b.page || 'home') === page; });
    if (!list.length) return;
    var tmp = document.createElement('div'), orphanWrap = null;
    var pending = list.slice(), passes = 0;
    function find(sel) { if (!sel) return null; try { return main.querySelector(sel) || document.querySelector(sel); } catch (e) { return null; } }
    while (pending.length && passes++ < 6) {
      var left = [];
      pending.forEach(function (b) {
        var anchor = find(b.before) || find(b.after);
        if (!anchor && (b.before || b.after) && passes < 6) {
          // 앵커가 다른 새 요소면 다음 패스에서 다시 시도
          var isBlk = /^\[data-blk=/.test(b.before || b.after);
          if (isBlk) { left.push(b); return; }
        }
        tmp.innerHTML = blockHtml(b, lang);
        var node = tmp.firstElementChild; if (!node) return;
        if (anchor && anchor.parentNode) {
          if (b.before) anchor.parentNode.insertBefore(node, anchor);
          else anchor.parentNode.insertBefore(node, anchor.nextSibling);
          return;
        }
        if (!orphanWrap) {
          var sec = document.createElement('section'); sec.className = 'section pf-blocks';
          orphanWrap = document.createElement('div'); orphanWrap.className = 'wrap';
          sec.appendChild(orphanWrap); main.appendChild(sec);
        }
        orphanWrap.appendChild(node);
      });
      pending = left;
    }
  }

  apply();
  O.apply = apply;
  O.renderBlocks = renderBlocks;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { renderBlocks(); });
  else renderBlocks();
})();
