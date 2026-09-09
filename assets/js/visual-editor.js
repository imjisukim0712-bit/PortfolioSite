/* ============================================================================
   visual-editor.js — 화면에서 바로 고치는 시각 편집기
   ----------------------------------------------------------------------------
   · 글자   : data-e 앵커 → assets/content.js 의 해당 경로에 저장 (KO/EN 각각)
   · 겉모습 : CSS 선택자 키 → assets/overrides.js 의 styles / layout / hidden
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- 상수 ---------------- */
  var SETTINGS_KEY = 'portfolio:editor-settings';
  var UNLOCK_KEY   = 'portfolio:editor-unlocked';
  var DRAFT_KEY    = 'portfolio:ve-draft';
  var LOCK_SALT    = 'portfolio-editor:';
  var LOCK_SHA256  = 'efea977ad00f57d7aa0504b6678da901eb9ea1284dc204807c8106fe71e376c4';
  var LOCK_WEAK    = '2ea1a9c9';
  var REPO_DEFAULTS = { branch: 'claude/game-planner-portfolio-landing-ote57w' };

  var PAGES = [
    { k:'home',   f:'index.html',        n:'홈' },
    { k:'resume', f:'resume.html',       n:'이력서' },
    { k:'cover',  f:'cover-letter.html', n:'자기소개서' },
    { k:'projects',f:'projects.html',    n:'프로젝트' },
    { k:'play',   f:'play.html',         n:'게임플레이' }
  ];
  var DEVICES = [ {k:'mobile',n:'모바일',w:390}, {k:'tablet',n:'태블릿',w:834}, {k:'desktop',n:'데스크톱',w:1280} ];

  /* 팔레트가 건드리는 토큰 (라벨 = 편집기 표시용) */
  var TOKENS = [
    ['--bg','배경'], ['--surface','카드 면'], ['--bg-elev','섹션 면'],
    ['--text','본문 글자'], ['--heading','제목'], ['--text-muted','흐린 글자'],
    ['--accent','강조 · 버튼'], ['--accent-soft','강조 보조'],
    ['--aubergine','상단 바 · 덱'], ['--paper','바 위 글자'],
    ['--cta','칩 배경'], ['--cta-text','칩 글자'], ['--border','테두리']
  ];

  /* ---------------- 유틸 ---------------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt !== undefined) n.textContent = txt; return n; }
  function status(msg, kind) { var s = $('#veStatus'); if (!s) return; s.textContent = msg; s.className = 've-status' + (kind ? ' is-' + kind : ''); }

  function getPath(obj, path) {
    var parts = String(path).split('.'), cur = obj;
    for (var i = 0; i < parts.length; i++) { if (cur === null || cur === undefined) return undefined; cur = cur[parts[i]]; }
    return cur;
  }
  function setPath(obj, path, val) {
    var parts = String(path).split('.'), cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var k = parts[i];
      if (cur[k] === null || typeof cur[k] !== 'object') cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      cur = cur[k];
    }
    cur[parts[parts.length - 1]] = val;
  }

  /* ---------------- 잠금 ---------------- */
  function sha256Hex(str) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve(null);
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    }).catch(function () { return null; });
  }
  function weakHash(s) { var h = 0x811c9dc5; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); }
  function checkPw(pw) {
    var salted = LOCK_SALT + pw;
    return sha256Hex(salted).then(function (hex) { return hex ? hex === LOCK_SHA256 : weakHash(salted) === LOCK_WEAK; });
  }

  /* ---------------- 상태 ---------------- */
  var S = {
    content: clone(window.PORTFOLIO_CONTENT || {}),
    ov: null,
    page: 'home', device: 'desktop', theme: 'light', lang: 'ko',
    sel: null, selKey: null, selPath: null,
    hist: [], future: [], dirty: false
  };
  var ORIG = { content: clone(window.PORTFOLIO_CONTENT || {}), ov: null };
  (function initOv() {
    var base = window.PORTFOLIO_OVERRIDES || {};
    ORIG.ov = { theme: clone(base.theme || { light:{}, dark:{} }), styles: clone(base.styles || {}),
                layout: clone(base.layout || {}), hidden: clone(base.hidden || []), blocks: clone(base.blocks || []) };
    S.ov = { theme: clone(base.theme || { light:{}, dark:{} }), styles: clone(base.styles || {}),
             layout: clone(base.layout || {}), hidden: clone(base.hidden || []), blocks: clone(base.blocks || []) };
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (raw) { var d = JSON.parse(raw); if (d && d.content && d.ov) { S.content = d.content; S.ov = d.ov; S.ov.blocks = S.ov.blocks || []; S.dirty = true; } }
    } catch (e) {}
  })();
  function saveDraft() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ content: S.content, ov: S.ov })); } catch (e) {} }

  function snapshot() {
    S.hist.push(JSON.stringify({ c: S.content, o: S.ov }));
    if (S.hist.length > 60) S.hist.shift();
    S.future.length = 0;
    S.dirty = true;
    syncUndo();
  }
  function restore(str) { var d = JSON.parse(str); S.content = d.c; S.ov = d.o; saveDraft(); pushToFrame(true); buildTokens(); syncUndo(); }
  function undo() { if (!S.hist.length) return; S.future.push(JSON.stringify({ c:S.content, o:S.ov })); restore(S.hist.pop()); status('실행 취소'); }
  function redo() { if (!S.future.length) return; S.hist.push(JSON.stringify({ c:S.content, o:S.ov })); restore(S.future.pop()); status('다시 실행'); }
  function syncUndo() { $('#veUndo').disabled = !S.hist.length; $('#veRedo').disabled = !S.future.length; }

  /* ---------------- 프레임 ---------------- */
  var frame, fwin, fdoc;

  function frameUrl() {
    var pg = PAGES.filter(function (p) { return p.k === S.page; })[0] || PAGES[0];
    return pg.f + '?ve=1&t=' + Date.now();
  }
  function loadFrame() {
    frame = $('#veFrame');
    frame.src = frameUrl();
    frame.onload = onFrameReady;
  }
  function onFrameReady() {
    fwin = frame.contentWindow; fdoc = frame.contentDocument;
    try {
      fwin.PortfolioApp.setTheme(S.theme);
      fwin.PortfolioApp.setLang(S.lang);
      pushToFrame(true);
      injectRuntime();
      buildTree();
      clearSel();
    } catch (e) { status('미리보기를 불러오지 못했습니다: ' + e.message, 'error'); }
  }
  /* 편집 중인 내용/겉모습을 프레임에 반영 */
  function pushToFrame(rerender) {
    if (!fwin || !fwin.PortfolioApp) return;
    fwin.PortfolioApp.setContent(S.content);
    var O = fwin.PORTFOLIO_OVERRIDES;
    if (O) { O.theme = S.ov.theme; O.styles = S.ov.styles; O.layout = S.ov.layout; O.hidden = S.ov.hidden; O.blocks = S.ov.blocks; if (O.apply) O.apply(); }
    if (rerender) { fwin.PortfolioApp.rerender(); setTimeout(function(){ injectRuntime(); reselect(); }, 0); }
  }
  function sizeFrame() {
    var d = DEVICES.filter(function (x) { return x.k === S.device; })[0] || DEVICES[2];
    var wrap = $('#veWrap'), canvas = $('#veCanvas');
    var avail = canvas.clientWidth - 36;
    var w = Math.min(d.w, Math.max(320, avail));
    wrap.style.width = w + 'px';
    wrap.style.height = (canvas.clientHeight - 36) + 'px';
  }

  /* ---------------- 선택자 키 ---------------- */
  function keyFor(node) {
    if (!node || node.nodeType !== 1) return null;
    var bk = node.getAttribute && node.getAttribute('data-blk');
    if (bk) return '[data-blk="' + bk + '"]';
    var de = node.getAttribute && node.getAttribute('data-e');
    if (de) return '[data-e="' + de + '"]';
    var parts = [], n = node, guard = 0;
    while (n && n.nodeType === 1 && n !== fdoc.body && guard++ < 12) {
      var seg = n.tagName.toLowerCase();
      var cls = (n.getAttribute('class') || '').trim().split(/\s+/).filter(function (c) {
        return c && !/^(is-|has-|ve-)/.test(c) && c !== 'reveal';
      });
      if (cls.length) seg += '.' + cls.slice(0, 2).map(function (c) { return c.replace(/([^\w-])/g, '\\$1'); }).join('.');
      var idx = 1, sib = n;
      while ((sib = sib.previousElementSibling)) if (sib.tagName === n.tagName) idx++;
      seg += ':nth-of-type(' + idx + ')';
      parts.unshift(seg);
      n = n.parentElement;
    }
    parts.unshift('body');
    return parts.join('>');
  }

  /* ---------------- 프레임 안 편집 런타임 ---------------- */
  var RUNTIME_CSS =
    '.ve-hover{outline:2px dashed rgba(59,130,246,.55)!important;outline-offset:1px!important}' +
    '.ve-selected{outline:2px solid #3b82f6!important;outline-offset:1px!important}' +
    '.ve-editing{outline:2px solid #3fbf7f!important}' +
    '.ve-drop{outline:2px dashed #e0a94f!important;outline-offset:2px!important}' +
    '#ve-handle{position:absolute;width:14px;height:14px;background:#3b82f6;border:2px solid #fff;border-radius:3px;' +
      'z-index:2147483647;cursor:nwse-resize;box-shadow:0 1px 4px rgba(0,0,0,.4);display:none}' +
    'html.ve-on{scroll-behavior:auto!important}' +
    'html.ve-on *{-webkit-user-drag:none!important}' +
    'html.ve-on img,html.ve-on a{-webkit-user-drag:none!important;user-select:none!important}' +
    '.ve-selected{cursor:move!important}' +
    'html.ve-dragging,html.ve-dragging *{cursor:grabbing!important;user-select:none!important;-webkit-user-select:none!important}' +
    'html.ve-dragging .ve-hover{outline:none!important}' +
    '#ve-handle{width:16px;height:16px}';

  function injectRuntime() {
    if (!fdoc) return;
    if (!fdoc.getElementById('ve-runtime')) {
      var st = fdoc.createElement('style'); st.id = 've-runtime'; st.textContent = RUNTIME_CSS;
      fdoc.head.appendChild(st);
    }
    if (!fdoc.getElementById('ve-handle')) {
      var h = fdoc.createElement('div'); h.id = 've-handle'; fdoc.body.appendChild(h);
      h.addEventListener('mousedown', startResize);
    }
    fdoc.documentElement.classList.add('ve-on');
    if (fdoc.__veBound) return;
    fdoc.__veBound = true;
    fdoc.addEventListener('dragstart', function (e) { e.preventDefault(); }, true);
    fdoc.addEventListener('selectstart', function (e) { if (drag || rez) e.preventDefault(); }, true);
    fdoc.addEventListener('mouseover', onOver, true);
    fdoc.addEventListener('mouseout',  onOut,  true);
    fdoc.addEventListener('click',     onClick, true);
    fdoc.addEventListener('dblclick',  onDbl,  true);
    fdoc.addEventListener('mousedown', onDown, true);
    fdoc.addEventListener('keydown',   onKey);
    fwin.addEventListener('scroll', placeHandle, true);
  }

  function editable(node) {
    if (!node || node.nodeType !== 1) return null;
    if (node === fdoc.body || node === fdoc.documentElement) return null;
    if (node.id === 've-handle') return null;
    return node;
  }
  var hoverEl = null;
  function onOver(e) { if (drag || rez) return; var n = editable(e.target); if (!n || n === hoverEl) return; if (hoverEl) hoverEl.classList.remove('ve-hover'); hoverEl = n; n.classList.add('ve-hover'); }
  function onOut(e) { if (hoverEl) { hoverEl.classList.remove('ve-hover'); hoverEl = null; } }

  function onClick(e) {
    if (editingEl) return;
    e.preventDefault(); e.stopPropagation();
    select(editable(e.target));
  }
  function onKey(e) {
    if (editingEl) { if (e.key === 'Escape') stopTextEdit(true); return; }
    if (e.key === 'Escape') { clearSel(); return; }
    if ((e.key === 'Delete' || e.key === 'Backspace') && S.sel) { e.preventDefault(); hideSelected(); }
    if (e.key === 'r' || e.key === 'R') { if (!e.metaKey && !e.ctrlKey) shufflePalette(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  }

  /* ---- 선택 ---- */
  function select(node) {
    if (!node) { clearSel(); return; }
    if (S.sel) S.sel.classList.remove('ve-selected');
    S.sel = node; S.selKey = keyFor(node);
    S.selPath = node.getAttribute('data-e') || null;
    node.classList.add('ve-selected');
    placeHandle();
    buildInspector();
    markTree();
  }
  function reselect() {
    if (!S.selKey || !fdoc) return;
    var n = null; try { n = fdoc.querySelector(S.selKey); } catch (e) {}
    if (n) { S.sel = n; n.classList.add('ve-selected'); placeHandle(); } else clearSel();
  }
  function clearSel() {
    if (S.sel) S.sel.classList.remove('ve-selected');
    S.sel = null; S.selKey = null; S.selPath = null;
    var h = fdoc && fdoc.getElementById('ve-handle'); if (h) h.style.display = 'none';
    buildInspector(); markTree();
  }
  function placeHandle() {
    var h = fdoc && fdoc.getElementById('ve-handle'); if (!h) return;
    if (!S.sel) { h.style.display = 'none'; return; }
    var r = S.sel.getBoundingClientRect();
    h.style.display = 'block';
    h.style.left = (r.right + fwin.pageXOffset - 7) + 'px';
    h.style.top  = (r.bottom + fwin.pageYOffset - 7) + 'px';
  }

  /* ---- 글자 편집 ---- */
  var editingEl = null, editingBefore = '';
  function onDbl(e) {
    var n = editable(e.target); if (!n) return;
    e.preventDefault(); e.stopPropagation();
    select(n);
    startTextEdit(n);
  }
  function startTextEdit(n) {
    if (!n.getAttribute('data-e')) { status('이 부분은 글자 저장 위치가 없어 오른쪽 패널에서 스타일만 바꿀 수 있습니다.', 'warn'); return; }
    editingEl = n; editingBefore = n.innerHTML;
    n.setAttribute('contenteditable', 'true');
    n.classList.add('ve-editing');
    n.focus();
    try { var r = fdoc.createRange(); r.selectNodeContents(n); var sel = fwin.getSelection(); sel.removeAllRanges(); sel.addRange(r); } catch (e) {}
    n.addEventListener('blur', onEditBlur);
  }
  function onEditBlur() { stopTextEdit(false); }
  function stopTextEdit(cancel) {
    if (!editingEl) return;
    var n = editingEl, path = n.getAttribute('data-e');
    n.removeEventListener('blur', onEditBlur);
    n.removeAttribute('contenteditable');
    n.classList.remove('ve-editing');
    editingEl = null;
    if (cancel) { n.innerHTML = editingBefore; return; }
    var html = n.innerHTML.trim();
    var isHtmlField = /titleHtml$/.test(path);
    var val = isHtmlField ? html : n.textContent.trim();
    var cur = getPath(S.content, path);
    var before = (cur && typeof cur === 'object') ? cur[S.lang] : cur;
    if (String(before || '') === String(val)) return;
    snapshot();
    if (cur && typeof cur === 'object' && ('ko' in cur || 'en' in cur)) { cur[S.lang] = val; }
    else setPath(S.content, path, val);
    saveDraft();
    status('글자를 바꿨습니다 · ' + path + ' (' + S.lang.toUpperCase() + ')', 'ok');
    buildInspector();
    if (S.lang === 'ko') warnEn(path);
  }
  function warnEn(path) {
    var cur = getPath(S.content, path);
    if (cur && typeof cur === 'object' && 'en' in cur && !String(cur.en || '').trim()) {
      status('한국어를 바꿨습니다 — 영어(EN)도 채워 주세요: ' + path, 'warn');
    }
  }

  /* ---- 드래그: 이동 / 순서 바꾸기 ---- */
  var drag = null;
  function onDown(e) {
    if (editingEl || e.button !== 0) return;
    var n = editable(e.target); if (!n) return;
    if (e.target.id === 've-handle') return;
    var alt = e.altKey;
    e.preventDefault();                       // 링크 포커스·네이티브 드래그 방지
    if (n !== S.sel) select(n);
    drag = { n: n, x0: e.clientX, y0: e.clientY, alt: alt, moved: false,
             base: (S.ov.layout[keyFor(n)] || { x:0, y:0 }) };
    fdoc.addEventListener('mousemove', onMove, true);
    fdoc.addEventListener('mouseup', onUp, true);
  }
  function onMove(e) {
    if (!drag) return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    if (!drag.moved) { fdoc.documentElement.classList.add('ve-dragging'); if (hoverEl) { hoverEl.classList.remove('ve-hover'); hoverEl = null; } }
    drag.moved = true;
    e.preventDefault();
    if (drag.alt) {
      var over = fdoc.elementFromPoint(e.clientX, e.clientY);
      var tgt = drag.n.hasAttribute('data-blk') ? editable(over) : (over && over.closest ? over.closest('[data-e]') : null);
      if (tgt && drag.n.contains(tgt)) tgt = null;
      if (drag.dropEl && drag.dropEl !== tgt) drag.dropEl.classList.remove('ve-drop');
      if (tgt && tgt !== drag.n) { tgt.classList.add('ve-drop'); drag.dropEl = tgt; }
    } else {
      drag.n.style.transform = 'translate(' + (drag.base.x + dx) + 'px,' + (drag.base.y + dy) + 'px)';
    }
  }
  function onUp(e) {
    fdoc.removeEventListener('mousemove', onMove, true);
    fdoc.removeEventListener('mouseup', onUp, true);
    if (!drag) return;
    var d = drag; drag = null;
    fdoc.documentElement.classList.remove('ve-dragging');
    if (d.dropEl) d.dropEl.classList.remove('ve-drop');
    if (!d.moved) return;
    if (d.alt) { if (d.dropEl) { if (d.n.hasAttribute('data-blk')) placeBlockAfter(d.n.getAttribute('data-blk'), d.dropEl); else reorder(d.n, d.dropEl); } return; }
    var dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    var key = keyFor(d.n);
    snapshot();
    S.ov.layout[key] = { x: Math.round(d.base.x + dx), y: Math.round(d.base.y + dy) };
    saveDraft(); pushToFrame(false);
    d.n.style.transform = '';
    placeHandle(); buildInspector();
    status('위치를 옮겼습니다 (' + S.ov.layout[key].x + ', ' + S.ov.layout[key].y + ')', 'ok');
  }
  /* data-e 경로가 같은 배열 안이면 순서 바꾸기 */
  function arrayInfo(path) {
    var m = String(path || '').match(/^(.*)\.(\d+)(?:\.|$)/);
    return m ? { arr: m[1], idx: parseInt(m[2], 10) } : null;
  }
  function reorder(fromEl, toEl) {
    var a = arrayInfo(fromEl.getAttribute('data-e')), b = arrayInfo(toEl.getAttribute('data-e'));
    if (!a || !b || a.arr !== b.arr || a.idx === b.idx) { status('같은 목록 안에서만 순서를 바꿀 수 있습니다.', 'warn'); return; }
    var list = getPath(S.content, a.arr);
    if (!Array.isArray(list)) return;
    snapshot();
    var item = list.splice(a.idx, 1)[0];
    list.splice(b.idx, 0, item);
    saveDraft(); pushToFrame(true);
    status('순서를 바꿨습니다 · ' + a.arr + ' ' + (a.idx + 1) + '→' + (b.idx + 1), 'ok');
  }

  /* ---- 크기 조절 ---- */
  var rez = null;
  function startResize(e) {
    if (!S.sel) return;
    e.preventDefault(); e.stopPropagation();
    var r = S.sel.getBoundingClientRect();
    rez = { x0: e.clientX, y0: e.clientY, w: r.width, h: r.height };
    fdoc.documentElement.classList.add('ve-dragging');
    fdoc.addEventListener('mousemove', onRez, true);
    fdoc.addEventListener('mouseup', endRez, true);
  }
  function onRez(e) {
    if (!rez || !S.sel) return;
    var w = Math.max(24, Math.round(rez.w + e.clientX - rez.x0));
    var h = Math.max(16, Math.round(rez.h + e.clientY - rez.y0));
    S.sel.style.width = w + 'px'; S.sel.style.height = h + 'px';
    placeHandle();
  }
  function endRez() {
    fdoc.removeEventListener('mousemove', onRez, true);
    fdoc.removeEventListener('mouseup', endRez, true);
    fdoc.documentElement.classList.remove('ve-dragging');
    if (!rez || !S.sel) { rez = null; return; }
    var w = S.sel.style.width, h = S.sel.style.height;
    S.sel.style.width = ''; S.sel.style.height = '';
    rez = null;
    if (!w) return;
    snapshot();
    setStyle('width', w); setStyle('height', h);
    status('크기를 바꿨습니다 (' + w + ' × ' + h + ')', 'ok');
  }

  function setStyle(prop, val) {
    var key = S.selKey; if (!key) return;
    var m = S.ov.styles[key] || (S.ov.styles[key] = {});
    if (val === '' || val === null || val === undefined) delete m[prop]; else m[prop] = val;
    if (!Object.keys(m).length) delete S.ov.styles[key];
    saveDraft(); pushToFrame(false); placeHandle();
  }
  function hideSelected() {
    if (!S.selKey) return;
    var bid = S.sel && S.sel.getAttribute('data-blk');
    if (bid) { deleteBlock(bid); return; }
    snapshot();
    if (S.ov.hidden.indexOf(S.selKey) < 0) S.ov.hidden.push(S.selKey);
    saveDraft(); pushToFrame(false); clearSel();
    status('숨겼습니다. 되돌리려면 실행 취소를 누르세요.', 'ok');
  }

  /* ---------------- 새 요소(blocks) ---------------- */
  function uid() { return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function blockById(id) { for (var i = 0; i < S.ov.blocks.length; i++) if (S.ov.blocks[i].id === id) return S.ov.blocks[i]; return null; }
  function selectedBlock() { var id = S.sel && S.sel.getAttribute('data-blk'); return id ? blockById(id) : null; }
  function addBlock(type, extra) {
    var b = { id: uid(), page: S.page, type: type, after: (S.sel && !editingEl) ? S.selKey : null };
    if (type === 'heading') b.text = { ko: '새 제목', en: 'New heading' };
    if (type === 'text')    b.text = { ko: '새 문단입니다. 더블클릭해서 고치세요.', en: 'New paragraph. Double-click to edit.' };
    if (type === 'button')  { b.text = { ko: '버튼', en: 'Button' }; b.href = '#'; }
    if (type === 'image')   { b.src = extra && extra.src || ''; b.alt = { ko: '', en: '' }; }
    snapshot();
    S.ov.blocks.push(b);
    saveDraft(); pushToFrame(true);
    setTimeout(function () {
      var n = fdoc && fdoc.querySelector('[data-blk="' + b.id + '"]');
      if (n) { select(n); n.scrollIntoView({ block: 'center' }); }
    }, 60);
    status('요소를 추가했습니다. 드래그로 옮기고, 더블클릭으로 글자를 고치세요.', 'ok');
  }
  function deleteBlock(id) {
    var i = S.ov.blocks.map(function (b) { return b.id; }).indexOf(id);
    if (i < 0) return;
    snapshot();
    S.ov.blocks.splice(i, 1);
    var key = '[data-blk="' + id + '"]';
    delete S.ov.styles[key]; delete S.ov.layout[key];
    var h = S.ov.hidden.indexOf(key); if (h >= 0) S.ov.hidden.splice(h, 1);
    saveDraft(); clearSel(); pushToFrame(true);
    status('요소를 삭제했습니다.', 'ok');
  }
  /* 흐름 안에서 앞/뒤 형제와 자리 바꾸기 */
  function moveBlock(id, dir) {
    var n = fdoc.querySelector('[data-blk="' + id + '"]'); if (!n) return;
    var b = blockById(id); if (!b) return;
    var sib = dir < 0 ? n.previousElementSibling : n.nextElementSibling;
    if (!sib || sib.id === 've-handle') { status('더 이상 옮길 수 없습니다.', 'warn'); return; }
    snapshot();
    if (dir < 0) { b.before = keyFor(sib); b.after = null; }
    else         { b.after = keyFor(sib);  b.before = null; }
    saveDraft(); pushToFrame(true);
    setTimeout(function () { var m = fdoc.querySelector('[data-blk="' + id + '"]'); if (m) select(m); }, 60);
  }
  /* 드롭한 자리 뒤로 새 요소 옮기기 (Alt+드래그) */
  function placeBlockAfter(id, target) {
    var b = blockById(id); if (!b || !target) return;
    snapshot();
    b.after = keyFor(target); b.before = null;
    saveDraft(); pushToFrame(true);
    setTimeout(function () { var m = fdoc.querySelector('[data-blk="' + id + '"]'); if (m) select(m); }, 60);
    status('요소를 옮겼습니다.', 'ok');
  }

  /* ---------------- 사진 ---------------- */
  function pickImage(cb) {
    var inp = $('#veFile'); inp.value = '';
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      status('이미지를 줄이는 중…');
      shrinkImage(f, 1600).then(function (dataUrl) { cb(dataUrl, f); }).catch(function (e) { status('이미지를 읽지 못했습니다: ' + e.message, 'error'); });
    };
    inp.click();
  }
  /* 긴 변 max px 로 축소 (PNG 는 그대로, 그 외 JPEG 0.86) */
  function shrinkImage(file, max) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h));
        var cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        var png = /png|gif|webp/i.test(file.type);
        res(png ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('형식을 지원하지 않습니다')); };
      img.src = url;
    });
  }
  /* 선택 요소가 사진 자리인지 — content 경로 또는 block */
  function photoSlotFor(node) {
    if (!node) return null;
    var blk = node.closest('[data-blk]');
    if (blk) { var b = blockById(blk.getAttribute('data-blk')); if (b && b.type === 'image') return { kind: 'block', block: b, label: '이미지 요소' }; return null; }
    if (node.closest('.portrait, .hero__portrait')) return { kind: 'content', path: 'home.player.photo', label: '프로필 사진' };
    var row = node.closest('.hpl-row');
    if (row) {
      var de = row.querySelector('[data-e]'); var ai = de && arrayInfo(de.getAttribute('data-e'));
      if (ai) return { kind: 'content', path: ai.arr + '.' + ai.idx + '.thumb', label: '대표 사진' };
    }
    var game = node.closest('.hp-game');
    if (game) { var ge = game.querySelector('[data-e]'); var gi = ge && arrayInfo(ge.getAttribute('data-e')); if (gi) return { kind: 'content', path: gi.arr + '.' + gi.idx + '.icon', label: '게임 아이콘' }; }
    var gc = node.closest('.gcard');
    if (gc) {
      var ce = gc.querySelector('[data-e]'); var ci = ce && arrayInfo(ce.getAttribute('data-e'));
      if (ci) return { kind: 'content', path: ci.arr + '.' + ci.idx + '.thumb', label: '카드 그림' };
    }
    var pc = node.closest('.play-card');
    if (pc) { var pe = pc.querySelector('[data-e]'); var pi = pe && arrayInfo(pe.getAttribute('data-e')); if (pi) return { kind: 'content', path: pi.arr + '.' + pi.idx + '.icon', label: '게임 아이콘' }; }
    return null;
  }
  function setPhoto(slot, value) {
    snapshot();
    if (slot.kind === 'block') slot.block.src = value || '';
    else setPath(S.content, slot.path, value || '');
    saveDraft(); pushToFrame(true); setTimeout(buildInspector, 80);
    status(value ? '사진을 바꿨습니다. 저장하면 파일이 함께 올라갑니다.' : '사진을 지웠습니다.', 'ok');
  }

  /* ---------------- 목록 항목 추가 · 복제 · 삭제 ---------------- */
  function selectedArrayItem() {
    if (!S.selPath) return null;
    var ai = arrayInfo(S.selPath); if (!ai) return null;
    var list = getPath(S.content, ai.arr);
    return Array.isArray(list) ? { arr: ai.arr, idx: ai.idx, list: list } : null;
  }
  function blankLike(v) {
    if (Array.isArray(v)) return [];
    if (v && typeof v === 'object') {
      if ('ko' in v || 'en' in v) return { ko: '', en: '' };
      var o = {}; for (var k in v) o[k] = blankLike(v[k]); return o;
    }
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return 0;
    return '';
  }
  function itemOp(op) {
    var it = selectedArrayItem(); if (!it) return;
    snapshot();
    var src = it.list[it.idx];
    if (op === 'dup') { it.list.splice(it.idx + 1, 0, clone(src)); if (it.list[it.idx + 1].id) it.list[it.idx + 1].id = String(src.id) + '-copy'; }
    if (op === 'add') { var nb = blankLike(src); if ('id' in nb) nb.id = 'new-' + Date.now().toString(36); if ('category' in nb) nb.category = src.category; it.list.splice(it.idx + 1, 0, nb); }
    if (op === 'del') { if (it.list.length <= 1) { status('마지막 항목은 삭제할 수 없습니다.', 'warn'); S.hist.pop(); return; } it.list.splice(it.idx, 1); clearSel(); }
    saveDraft(); pushToFrame(true);
    status({ dup: '항목을 복제했습니다.', add: '빈 항목을 추가했습니다. 글자를 채우세요.', del: '항목을 삭제했습니다.' }[op], 'ok');
  }

  /* ---------------- 인스펙터 ---------------- */
  function sec(title, extraBtn) {
    var s = el('section', 've-sec');
    var h = el('div', 've-sec__h'); h.appendChild(el('span', null, title));
    if (extraBtn) h.appendChild(extraBtn);
    var b = el('div', 've-sec__b');
    s.appendChild(h); s.appendChild(b);
    return { root: s, body: b };
  }
  function row(label, node, wide) {
    var r = el('div', 've-row' + (wide ? ' ve-row--wide' : ''));
    if (label) r.appendChild(el('label', null, label));
    r.appendChild(node); return r;
  }
  function input(val, on, ph) {
    var i = el('input', 've-in'); i.type = 'text'; i.value = val || ''; if (ph) i.placeholder = ph;
    i.addEventListener('change', function () { snapshot(); on(i.value.trim()); });
    return i;
  }
  function colorRow(label, cur, on) {
    var wrap = el('div', 've-color');
    var c = el('input'); c.type = 'color'; c.value = toHex(cur) || '#000000';
    var t = el('input', 've-in'); t.type = 'text'; t.value = cur || ''; t.placeholder = '비우면 기본값';
    c.addEventListener('input', function () { t.value = c.value; });
    c.addEventListener('change', function () { snapshot(); on(c.value); });
    t.addEventListener('change', function () { snapshot(); on(t.value.trim()); });
    wrap.appendChild(c); wrap.appendChild(t);
    return row(label, wrap);
  }
  function toHex(v) {
    if (!v) return null;
    v = String(v).trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) return v;
    if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + v[1]+v[1]+v[2]+v[2]+v[3]+v[3];
    var m = v.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (m) return '#' + [1,2,3].map(function (i) { return ('0' + (+m[i]).toString(16)).slice(-2); }).join('');
    return null;
  }

  function buildInspector() {
    var box = $('#veInspector'); box.innerHTML = '';
    if (!S.sel) {
      var s0 = sec('선택된 요소 없음');
      s0.body.appendChild(el('p', 've-hint', '가운데 화면에서 아무 곳이나 클릭하면 그 부분을 고칠 수 있습니다. 글자는 더블클릭하세요.'));
      box.appendChild(s0.root); return;
    }
    var st = S.ov.styles[S.selKey] || {};
    var cs = fwin.getComputedStyle(S.sel);

    /* 헤더 */
    var reset = el('button', 've-btn', '초기화'); reset.style.cssText = 'padding:3px 8px;font-size:11px';
    reset.addEventListener('click', function () {
      snapshot();
      delete S.ov.styles[S.selKey]; delete S.ov.layout[S.selKey];
      var i = S.ov.hidden.indexOf(S.selKey); if (i >= 0) S.ov.hidden.splice(i, 1);
      saveDraft(); pushToFrame(false); buildInspector(); status('이 요소를 원래대로 되돌렸습니다.', 'ok');
    });
    var head = sec(S.sel.tagName.toLowerCase() + (S.selPath ? ' · ' + S.selPath.split('.').slice(-1)[0] : ''), reset);
    var kk = el('p', 've-hint', S.selPath || S.selKey);
    kk.style.cssText = 'font-family:ui-monospace,Menlo,monospace;word-break:break-all';
    head.body.appendChild(kk);
    box.appendChild(head.root);

    /* 새 요소 속성 */
    var blk = selectedBlock();
    if (blk) {
      var bs = sec('요소 속성');
      if (blk.text !== undefined) {
        ['ko','en'].forEach(function (lg) {
          var ta = el('textarea', 've-in'); ta.value = (blk.text && blk.text[lg]) || '';
          ta.placeholder = lg === 'en' ? 'English' : '한국어';
          ta.addEventListener('change', function () { snapshot(); blk.text = blk.text || {}; blk.text[lg] = ta.value; saveDraft(); pushToFrame(true); });
          bs.body.appendChild(row(lg === 'ko' ? '한국어' : 'English', ta, true));
        });
      }
      if (blk.type === 'button') bs.body.appendChild(row('링크', input(blk.href || '', function (v) { blk.href = v; saveDraft(); pushToFrame(true); }, '예: resume.html 또는 https://…')));
      var ord = el('div', 've-3');
      var up = el('button', 've-btn', '↑ 앞으로'); up.addEventListener('click', function () { moveBlock(blk.id, -1); });
      var dn = el('button', 've-btn', '↓ 뒤로');  dn.addEventListener('click', function () { moveBlock(blk.id, 1); });
      var rm = el('button', 've-btn ve-danger', '삭제'); rm.addEventListener('click', function () { deleteBlock(blk.id); });
      ord.appendChild(up); ord.appendChild(dn); ord.appendChild(rm);
      bs.body.appendChild(row('', ord, true));
      box.appendChild(bs.root);
    }

    /* 사진 */
    var slot = photoSlotFor(S.sel);
    if (slot) {
      var ps = sec('사진 · ' + slot.label);
      var curSrc = slot.kind === 'block' ? slot.block.src : getPath(S.content, slot.path);
      if (curSrc) { var im = el('img', 've-thumb'); im.src = /^data:|^https?:/.test(curSrc) ? curSrc : (curSrc); im.alt = ''; ps.body.appendChild(im); }
      var pb = el('div', 've-2');
      var upl = el('button', 've-btn ve-btn--go', curSrc ? '사진 바꾸기' : '사진 올리기');
      upl.addEventListener('click', function () { pickImage(function (dataUrl) { setPhoto(slot, dataUrl); }); });
      var clr = el('button', 've-btn', '지우기'); clr.disabled = !curSrc;
      clr.addEventListener('click', function () { setPhoto(slot, ''); });
      pb.appendChild(upl); pb.appendChild(clr);
      ps.body.appendChild(pb);
      ps.body.appendChild(row('주소', input(/^data:/.test(curSrc || '') ? '' : (curSrc || ''), function (v) { setPhoto(slot, v); }, '파일 경로나 URL 직접 입력')));
      ps.body.appendChild(el('p', 've-hint', '올린 사진은 저장할 때 assets/img/ 에 파일로 함께 올라갑니다.'));
      box.appendChild(ps.root);
    }

    /* 목록 항목 */
    var ai = selectedArrayItem();
    if (ai) {
      var isec = sec('목록 항목 · ' + (ai.idx + 1) + '/' + ai.list.length);
      var ib = el('div', 've-3');
      [['add','＋ 새 항목'],['dup','복제'],['del','삭제']].forEach(function (o) {
        var b = el('button', 've-btn' + (o[0] === 'del' ? ' ve-danger' : ''), o[1]);
        b.addEventListener('click', function () { itemOp(o[0]); });
        ib.appendChild(b);
      });
      isec.body.appendChild(ib);
      isec.body.appendChild(el('p', 've-hint', ai.arr + ' — 새 항목은 이 항목 바로 뒤에 들어갑니다. Alt+드래그로 순서를 바꿀 수 있습니다.'));
      box.appendChild(isec.root);
    }

    /* 글자 */
    if (S.selPath) {
      var f = getPath(S.content, S.selPath);
      var tsec = sec('글자');
      ['ko','en'].forEach(function (lg) {
        var val = (f && typeof f === 'object') ? (f[lg] || '') : (lg === 'ko' ? (f || '') : '');
        var ta = el('textarea', 've-in'); ta.value = val;
        ta.placeholder = lg === 'en' ? '영어 (비우면 한국어가 그대로 나옵니다)' : '한국어';
        ta.addEventListener('change', function () {
          snapshot();
          var cur = getPath(S.content, S.selPath);
          if (cur && typeof cur === 'object' && ('ko' in cur || 'en' in cur)) cur[lg] = ta.value;
          else setPath(S.content, S.selPath, ta.value);
          saveDraft(); pushToFrame(true);
          status('글자를 바꿨습니다 · ' + S.selPath + ' (' + lg.toUpperCase() + ')', 'ok');
        });
        tsec.body.appendChild(row(lg === 'ko' ? '한국어' : 'English', ta, true));
      });
      tsec.body.appendChild(el('p', 've-hint', '한국어를 고치면 영어도 함께 검수해 주세요 (사이트 규칙).'));
      box.appendChild(tsec.root);
    }

    /* 타이포 */
    var ty = sec('글자 모양');
    ty.body.appendChild(colorRow('색', st.color || '', function (v) { setStyle('color', v); buildInspector(); }));
    ty.body.appendChild(row('크기', input(st.fontSize || '', function (v) { setStyle('fontSize', v); }, cs.fontSize)));
    var wsel = el('select', 've-sel');
    ['', '300','350','400','500','600','700','800'].forEach(function (w) {
      var o = el('option', null, w || '기본'); o.value = w; if (st.fontWeight === w) o.selected = true; wsel.appendChild(o);
    });
    wsel.addEventListener('change', function () { snapshot(); setStyle('fontWeight', wsel.value); });
    ty.body.appendChild(row('굵기', wsel));
    ty.body.appendChild(row('행간', input(st.lineHeight || '', function (v) { setStyle('lineHeight', v); }, cs.lineHeight)));
    ty.body.appendChild(row('자간', input(st.letterSpacing || '', function (v) { setStyle('letterSpacing', v); }, cs.letterSpacing)));
    var al = el('div', 've-chips');
    [['left','왼쪽'],['center','가운데'],['right','오른쪽']].forEach(function (p) {
      var b = el('button', 've-chip' + (st.textAlign === p[0] ? ' on' : ''), p[1]);
      b.addEventListener('click', function () { snapshot(); setStyle('textAlign', st.textAlign === p[0] ? '' : p[0]); buildInspector(); });
      al.appendChild(b);
    });
    ty.body.appendChild(row('정렬', al));
    box.appendChild(ty.root);

    /* 면 */
    var bg = sec('배경 · 테두리');
    bg.body.appendChild(colorRow('배경', st.background || '', function (v) { setStyle('background', v); buildInspector(); }));
    bg.body.appendChild(row('둥글기', input(st.borderRadius || '', function (v) { setStyle('borderRadius', v); }, cs.borderRadius)));
    bg.body.appendChild(row('테두리', input(st.border || '', function (v) { setStyle('border', v); }, '예: 1px solid #ddd')));
    var shsel = el('select', 've-sel');
    [['','기본'],['none','없음'],['0 1px 2px rgba(0,0,0,.06)','약하게'],['0 8px 24px rgba(0,0,0,.10)','보통'],['0 18px 48px rgba(0,0,0,.18)','강하게']]
      .forEach(function (p) { var o = el('option', null, p[1]); o.value = p[0]; if ((st.boxShadow||'') === p[0]) o.selected = true; shsel.appendChild(o); });
    shsel.addEventListener('change', function () { snapshot(); setStyle('boxShadow', shsel.value); });
    bg.body.appendChild(row('그림자', shsel));
    box.appendChild(bg.root);

    /* 여백 · 크기 · 위치 */
    var sp = sec('여백 · 크기 · 위치');
    sp.body.appendChild(row('안쪽 여백', input(st.padding || '', function (v) { setStyle('padding', v); }, cs.padding)));
    sp.body.appendChild(row('바깥 여백', input(st.margin || '', function (v) { setStyle('margin', v); }, cs.margin)));
    var wh = el('div', 've-2');
    wh.appendChild(input(st.width || '', function (v) { setStyle('width', v); }, '너비'));
    wh.appendChild(input(st.height || '', function (v) { setStyle('height', v); }, '높이'));
    sp.body.appendChild(row('크기', wh));
    var lay = S.ov.layout[S.selKey] || { x:0, y:0 };
    var xy = el('div', 've-2');
    [['x','X'],['y','Y']].forEach(function (p) {
      var i = el('input', 've-in'); i.type = 'number'; i.value = lay[p[0]] || 0; i.title = p[1];
      i.addEventListener('change', function () {
        snapshot();
        var cur = S.ov.layout[S.selKey] || { x:0, y:0 };
        cur[p[0]] = parseInt(i.value, 10) || 0;
        if (!cur.x && !cur.y) delete S.ov.layout[S.selKey]; else S.ov.layout[S.selKey] = cur;
        saveDraft(); pushToFrame(false); placeHandle();
      });
      xy.appendChild(i);
    });
    sp.body.appendChild(row('이동', xy));
    sp.body.appendChild(row('투명도', input(st.opacity || '', function (v) { setStyle('opacity', v); }, '0 ~ 1')));
    var hideBtn = el('button', 've-btn', '이 요소 숨기기');
    hideBtn.addEventListener('click', hideSelected);
    sp.body.appendChild(hideBtn);
    box.appendChild(sp.root);
  }

  /* ---------------- 아웃라인 ---------------- */
  function buildTree() {
    var tree = $('#veTree'); tree.innerHTML = '';
    if (!fdoc) return;
    var nodes = fdoc.querySelectorAll('main section, main .hp-block, footer');
    Array.prototype.forEach.call(nodes, function (n, i) {
      var h = n.querySelector('h1,h2,h3');
      var name = (h && h.textContent.trim().slice(0, 22)) || (n.className || n.tagName).toString().split(' ')[0] || ('블록 ' + (i + 1));
      var b = el('button', null, name);
      b.addEventListener('click', function () {
        n.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function () { select(n); }, 260);
      });
      b.__node = n;
      tree.appendChild(b);
    });
  }
  function markTree() {
    Array.prototype.forEach.call($('#veTree').children, function (b) {
      b.classList.toggle('on', !!(S.sel && b.__node === S.sel));
    });
  }

  /* ---------------- 팔레트 (Pigment 식) ---------------- */
  var PAL = { colors: [], locks: [false,false,false,false,false] };
  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    var a = s * Math.min(l, 1 - l);
    function f(n) { var k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))); }
    return '#' + [f(0), f(8), f(4)].map(function (v) { return ('0' + Math.round(v * 255).toString(16)).slice(-2); }).join('');
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function shufflePalette() {
    var mode = $('#vePalMode').value;
    if (mode === 'auto') mode = ['analogous','complement','triad','mono','warm','cool'][Math.floor(Math.random() * 6)];
    var base = Math.random() * 360;
    if (mode === 'warm') base = rnd(-20, 60);
    if (mode === 'cool') base = rnd(170, 280);
    var h2 = base, h3 = base;
    if (mode === 'analogous') { h2 = base + rnd(20, 40); h3 = base - rnd(20, 40); }
    if (mode === 'complement') { h2 = base + 180; h3 = base + rnd(160, 200); }
    if (mode === 'triad') { h2 = base + 120; h3 = base + 240; }
    var next = [
      hsl(base, rnd(14, 30), rnd(93, 97)),   // 배경
      hsl(base, rnd(10, 24), rnd(97, 99)),   // 카드 면
      hsl(h2,   rnd(18, 42), rnd(20, 32)),   // 상단 바
      hsl(h3,   rnd(45, 72), rnd(40, 52)),   // 강조
      hsl(base, rnd(6, 16),  rnd(11, 17))    // 글자
    ];
    PAL.colors = next.map(function (c, i) { return (PAL.locks[i] && PAL.colors[i]) ? PAL.colors[i] : c; });
    renderPalette();
  }
  var PAL_ROLE = ['배경','카드 면','상단 바','강조','글자'];
  function renderPalette() {
    var box = $('#vePal'); box.innerHTML = '';
    PAL.colors.forEach(function (c, i) {
      var d = el('div', 've-pal__c' + (PAL.locks[i] ? ' lock' : ''));
      d.style.background = c;
      d.title = PAL_ROLE[i] + ' ' + c + ' (클릭 = 잠금)';
      d.appendChild(el('span', null, c));
      d.addEventListener('click', function () { PAL.locks[i] = !PAL.locks[i]; renderPalette(); });
      box.appendChild(d);
    });
  }
  function lum(hex) { var m = hex.match(/\w\w/g).map(function (x) { return parseInt(x, 16) / 255; }); return 0.2126*m[0] + 0.7152*m[1] + 0.0722*m[2]; }
  function mix(a, b, t) {
    var A = a.match(/\w\w/g).map(function (x) { return parseInt(x, 16); });
    var B = b.match(/\w\w/g).map(function (x) { return parseInt(x, 16); });
    return '#' + A.map(function (v, i) { return ('0' + Math.round(v + (B[i] - v) * t).toString(16)).slice(-2); }).join('');
  }
  function applyPalette() {
    if (!PAL.colors.length) shufflePalette();
    var bg = PAL.colors[0], surf = PAL.colors[1], bar = PAL.colors[2], acc = PAL.colors[3], txt = PAL.colors[4];
    snapshot();
    S.ov.theme.light = {
      '--bg': bg, '--surface': surf, '--bg-elev': mix(bg, txt, .06), '--surface-2': mix(bg, txt, .05),
      '--border': mix(bg, txt, .13), '--border-2': mix(bg, txt, .22),
      '--text': txt, '--heading': mix(txt, '#000000', .25), '--text-muted': mix(txt, bg, .48),
      '--accent': acc, '--accent-soft': mix(acc, '#ffffff', .18),
      '--aubergine': bar, '--paper': mix(bg, '#ffffff', .55),
      '--cta': mix(acc, bg, .84), '--cta-text': mix(acc, '#000000', .22),
      '--ghost-c': acc, '--periwinkle': mix(acc, '#ffffff', .35),
      '--btn-primary-text': lum(acc) > .6 ? '#141413' : '#ffffff',
      '--glow': 'rgba(0,0,0,.14)'
    };
    var dbg = mix(txt, '#000000', .12), dsurf = mix(dbg, '#ffffff', .07), dacc = mix(acc, '#ffffff', .34);
    S.ov.theme.dark = {
      '--bg': dbg, '--surface': dsurf, '--bg-elev': dsurf, '--surface-2': mix(dbg, '#ffffff', .11),
      '--border': mix(dbg, '#ffffff', .16), '--border-2': mix(dbg, '#ffffff', .26),
      '--text': mix(bg, '#ffffff', .35), '--heading': '#ffffff', '--text-muted': mix(bg, dbg, .55),
      '--accent': dacc, '--accent-soft': mix(dacc, '#ffffff', .12),
      '--aubergine': mix(dbg, '#000000', .35), '--paper': mix(bg, '#ffffff', .5),
      '--cta': mix(dacc, dbg, .82), '--cta-text': mix(dacc, '#ffffff', .25),
      '--ghost-c': dacc, '--periwinkle': dacc,
      '--btn-primary-text': dbg, '--glow': 'rgba(0,0,0,.4)'
    };
    saveDraft(); pushToFrame(false); buildTokens();
    status('추천 색을 적용했습니다. 마음에 안 들면 실행 취소(Ctrl+Z).', 'ok');
  }

  /* ---------------- 색 토큰 ---------------- */
  function buildTokens() {
    var box = $('#veTokens'); box.innerHTML = '';
    var map = S.ov.theme[S.theme] || (S.ov.theme[S.theme] = {});
    TOKENS.forEach(function (t) {
      var cur = map[t[0]] || '';
      var placeholderVal = '';
      try { if (fdoc) placeholderVal = fwin.getComputedStyle(fdoc.documentElement).getPropertyValue(t[0]).trim(); } catch (e) {}
      var wrap = el('div', 've-color');
      var c = el('input'); c.type = 'color'; c.value = toHex(cur || placeholderVal) || '#888888';
      var tx = el('input', 've-in'); tx.type = 'text'; tx.value = cur; tx.placeholder = placeholderVal || '기본값';
      function commit(v) {
        snapshot();
        if (v) map[t[0]] = v; else delete map[t[0]];
        saveDraft(); pushToFrame(false); buildTokens();
      }
      c.addEventListener('change', function () { commit(c.value); });
      tx.addEventListener('change', function () { commit(tx.value.trim()); });
      wrap.appendChild(c); wrap.appendChild(tx);
      box.appendChild(row(t[1], wrap));
    });
  }

  /* ---------------- 저장 / 내보내기 ---------------- */
  function toBase64(str) {
    var bytes = new TextEncoder().encode(str), bin = '', chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return btoa(bin);
  }
  function contentSource(rev) {
    return '/* ============================================================================\n' +
      '   포트폴리오 내용 파일 · 시각 편집기에서 저장했습니다.\n' +
      '   rev: ' + rev + '\n' +
      '   ========================================================================== */\n\n' +
      'window.PORTFOLIO_CONTENT = ' + JSON.stringify(S.content, null, 2) + ';\n';
  }
  function overridesSource(rev) {
    var data = { rev: rev, theme: S.ov.theme, styles: S.ov.styles, layout: S.ov.layout, hidden: S.ov.hidden, blocks: S.ov.blocks };
    return '/* ============================================================================\n' +
      '   overrides.js — 시각 편집기(edit.html)가 저장하는 "겉모습" 데이터.\n' +
      '   적용은 assets/js/skin.js 가 합니다. 편집기에서 저장하면 이 파일이 통째로 바뀝니다.\n' +
      '   rev: ' + rev + '\n' +
      '   ========================================================================== */\n' +
      'window.PORTFOLIO_OVERRIDES = ' + JSON.stringify(data, null, 2) + ';\n';
  }
  /* data:image 로 들어있는 사진을 저장소 파일로 바꿔 넣고, 올릴 파일 목록을 돌려준다 */
  function materializeAssets(rev) {
    var files = [], seen = {}, n = 0;
    function walk(o) {
      if (Array.isArray(o)) { for (var i = 0; i < o.length; i++) o[i] = walk(o[i]); return o; }
      if (o && typeof o === 'object') { for (var k in o) o[k] = walk(o[k]); return o; }
      if (typeof o === 'string' && o.indexOf('data:image/') === 0) {
        if (seen[o]) return seen[o];
        var m = o.match(/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/i);
        if (!m) return o;
        var ext = m[1].toLowerCase().replace('jpeg', 'jpg');
        var path = 'assets/img/ve-' + rev + '-' + (++n) + '.' + ext;
        files.push({ path: path, b64: m[2] });
        seen[o] = path; return path;
      }
      return o;
    }
    walk(S.content); walk(S.ov.blocks);
    return files;
  }

  function readSettings() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch (e) {}
    var owner = saved.owner || '', repo = saved.repo || '';
    var m = String(location.hostname).match(/^([^.]+)\.github\.io$/i);
    if (m && !owner) { owner = m[1]; var seg = location.pathname.split('/').filter(Boolean); repo = repo || (seg.length ? seg[0] : owner + '.github.io'); }
    return { owner: owner, repo: repo, branch: saved.branch || REPO_DEFAULTS.branch, token: saved.token || '' };
  }
  function putFile(cfg, path, source, headers) {
    var api = 'https://api.github.com/repos/' + encodeURIComponent(cfg.owner) + '/' + encodeURIComponent(cfg.repo) +
              '/contents/' + path.split('/').map(encodeURIComponent).join('/');
    return fetch(api + '?ref=' + encodeURIComponent(cfg.branch), { headers: headers })
      .then(function (r) { return r.status === 200 ? r.json().then(function (j) { return j.sha; }) : null; })
      .then(function (sha) {
        var body = { message: '시각 편집기에서 수정', content: toBase64(source), branch: cfg.branch };
        if (sha) body.sha = sha;
        return fetch(api, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
      })
      .then(function (r) {
        if (r.ok) return true;
        return r.json().catch(function () { return {}; }).then(function (j) { throw new Error(path + ' 저장 실패 (' + r.status + ') ' + (j.message || '')); });
      });
  }
  function putRaw(cfg, path, b64, headers) {
    var api = 'https://api.github.com/repos/' + encodeURIComponent(cfg.owner) + '/' + encodeURIComponent(cfg.repo) +
              '/contents/' + path.split('/').map(encodeURIComponent).join('/');
    return fetch(api + '?ref=' + encodeURIComponent(cfg.branch), { headers: headers })
      .then(function (r) { return r.status === 200 ? r.json().then(function (j) { return j.sha; }) : null; })
      .then(function (sha) {
        var body = { message: '사진 추가 (시각 편집기)', content: b64, branch: cfg.branch };
        if (sha) body.sha = sha;
        return fetch(api, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
      })
      .then(function (r) { if (r.ok) return true; return r.json().catch(function () { return {}; }).then(function (j) { throw new Error(path + ' 업로드 실패 (' + r.status + ') ' + (j.message || '')); }); });
  }
  var saving = false;
  function save() {
    if (saving) return;
    var cfg = readSettings();
    if (!cfg.token || !cfg.owner || !cfg.repo) {
      var tok = prompt('GitHub 토큰을 입력해 주세요 (Contents: Read and write).\n이 브라우저에만 저장됩니다.', cfg.token || '');
      if (!tok) { status('저장하려면 GitHub 토큰이 필요합니다.', 'warn'); return; }
      var ow = cfg.owner || prompt('GitHub 사용자 이름', 'imjisukim0712-bit') || '';
      var rp = cfg.repo  || prompt('저장소 이름', 'PortfolioSite') || '';
      cfg.token = tok.trim(); cfg.owner = ow.trim(); cfg.repo = rp.trim();
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(cfg)); } catch (e) {}
    }
    saving = true;
    var rev = String(Date.now());
    var headers = { 'Authorization': 'Bearer ' + cfg.token, 'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' };
    var files = materializeAssets(rev);
    saveDraft();
    status(files.length ? '사진 ' + files.length + '장을 올리는 중…' : '저장하는 중…');
    files.reduce(function (pr, f) {
      return pr.then(function () { return putRaw(cfg, f.path, f.b64, headers); });
    }, Promise.resolve())
      .then(function () { status('내용을 저장하는 중…'); return putFile(cfg, 'assets/content.js', contentSource(rev), headers); })
      .then(function () { return putFile(cfg, 'assets/overrides.js', overridesSource(rev), headers); })
      .then(function () {
        saving = false; S.dirty = false;
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        status('저장했습니다. 배포되면 사이트에 반영됩니다 (보통 1분 내외).', 'ok');
      })
      .catch(function (e) { saving = false; status(e.message || String(e), 'error'); });
  }
  function exportFiles() {
    var rev = String(Date.now());
    [['content.js', contentSource(rev)], ['overrides.js', overridesSource(rev)]].forEach(function (f) {
      var blob = new Blob([f[1]], { type: 'text/javascript;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = f[0];
      document.body.appendChild(a); a.click(); a.remove();
    });
    status('content.js · overrides.js 두 파일을 내려받았습니다. assets/ 에 덮어쓰세요.', 'ok');
  }

  /* ---------------- 상단바 ---------------- */
  function segment(host, items, cur, on) {
    host.innerHTML = '';
    items.forEach(function (it) {
      var b = el('button', it.k === cur ? 'on' : '', it.n);
      b.addEventListener('click', function () { on(it.k); });
      host.appendChild(b);
    });
  }
  function buildTop() {
    rebuildPages();
    segment($('#veDevice'), DEVICES, S.device, function (k) { S.device = k; buildTop(); sizeFrame(); });
    segment($('#veTheme'), [{k:'light',n:'라이트'},{k:'dark',n:'다크'}], S.theme, function (k) {
      S.theme = k; buildTop(); buildTokens();
      if (fwin && fwin.PortfolioApp) fwin.PortfolioApp.setTheme(k);
    });
    var lg = $('#veTheme');
    // 언어 토글을 테마 옆에 붙인다
    if (!$('#veLang')) {
      var host = el('div', 've-seg'); host.id = 'veLang';
      lg.parentNode.insertBefore(host, lg.nextSibling);
    }
    segment($('#veLang'), [{k:'ko',n:'KR'},{k:'en',n:'EN'}], S.lang, function (k) {
      S.lang = k; buildTop();
      if (fwin && fwin.PortfolioApp) { fwin.PortfolioApp.setLang(k); pushToFrame(true); }
    });
  }
  /* 페이지 세그먼트는 arguments.callee 없이 다시 그린다 */
  function rebuildPages() {
    segment($('#vePages'), PAGES, S.page, function (k) { S.page = k; rebuildPages(); loadFrame(); });
  }

  /* ---------------- 시작 ---------------- */
  function boot() {
    $('#veLock').hidden = true;
    $('#veApp').hidden = false;
    buildTop(); rebuildPages();
    buildTokens(); buildInspector(); shufflePalette();
    sizeFrame(); loadFrame();
    syncUndo();
    if (S.dirty) status('저장하지 않은 편집 내용을 이어서 불러왔습니다.', 'warn');

    window.addEventListener('resize', sizeFrame);
    Array.prototype.forEach.call($('#veAdd').querySelectorAll('[data-add]'), function (b) {
      b.addEventListener('click', function () {
        var type = b.getAttribute('data-add');
        if (type === 'image') pickImage(function (dataUrl) { addBlock('image', { src: dataUrl }); });
        else addBlock(type);
      });
    });
    $('#vePalShuffle').addEventListener('click', shufflePalette);
    $('#vePalApply').addEventListener('click', applyPalette);
    $('#vePalMode').addEventListener('change', shufflePalette);
    $('#veThemeReset').addEventListener('click', function () {
      snapshot(); S.ov.theme[S.theme] = {}; saveDraft(); pushToFrame(false); buildTokens();
      status('색 토큰을 원래대로 되돌렸습니다.', 'ok');
    });
    $('#veResetAll').addEventListener('click', function () {
      if (!confirm('모든 편집(글자·색·위치·새 요소·사진)을 지우고 현재 배포된 상태로 되돌릴까요?\n실행 취소(Ctrl+Z)로 다시 돌아올 수 있습니다.')) return;
      snapshot();
      S.content = clone(ORIG.content); S.ov = clone(ORIG.ov);
      try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
      S.dirty = false;
      clearSel(); pushToFrame(true); buildTokens();
      status('처음 상태로 되돌렸습니다.', 'ok');
    });
    $('#veUndo').addEventListener('click', undo);
    $('#veRedo').addEventListener('click', redo);
    $('#veSave').addEventListener('click', save);
    $('#veExport').addEventListener('click', exportFiles);
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
      else if (e.key === 'Escape') { clearSel(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && S.sel) { e.preventDefault(); hideSelected(); }
      else if (e.key === 'r' || e.key === 'R') shufflePalette();
    });
    window.addEventListener('beforeunload', function (e) { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });
  }

  /* 잠금 처리 */
  var unlocked = false;
  try { unlocked = sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch (e) {}
  if (unlocked) boot();
  else {
    $('#veLockForm').addEventListener('submit', function (e) {
      e.preventDefault();
      checkPw($('#vePw').value).then(function (ok) {
        if (!ok) { $('#veErr').textContent = '비밀번호가 맞지 않습니다.'; $('#vePw').select(); return; }
        try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch (e2) {}
        boot();
      });
    });
  }
})();
