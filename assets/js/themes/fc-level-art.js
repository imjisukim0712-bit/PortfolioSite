/* ============================================================================
   fc-level-art.js — 스테이지 게임기 그림의 화풍 갈래(18회차). 시안 항목의 art 가 <html data-skin-art> 로 찍히면
   fc-body.js 가 stageArt 대신 여기의 draw(art) 를 부릅니다.
   ----------------------------------------------------------------------------
   · 그림은 Codex 가 그린 '도트가 아닌 그림'을 tools/fc-pixel/pixelize-console.py 가 게임기 격자 도트로 옮긴 데이터입니다
     (갈래마다 fc-level-art-<이름>.js 한 개 — 팔레트 + 줄마다 '색 글자 + 이어지는 칸 수' 길이 부호).
   · 칸 = 5단위 = 판 폭 0.5cqw(정수 칸이면 4px), 부품 자리는 stageArt 와 같아 누르는 키 · 화면 속 내용이 그대로 맞습니다.
   · 데이터가 늦게 오면(스위처로 바꿀 때) 그린 그림을 지워 fc-body.js 가 다시 그리게 합니다.
   ========================================================================== */
(function () {
  'use strict';
  if (window.FcLevelArt) return;
  var U = 5, DATA = {};

  function add(name, d) {
    DATA[name] = d;
    Array.prototype.forEach.call(document.querySelectorAll('.fcb-art'), function (el) {
      if ((el.getAttribute('data-for') || '').split('|')[1] === name) el.parentNode.removeChild(el);
    });
  }
  function draw(name) {
    var d = DATA[name]; if (!d) return null;
    var paths = {}, shade = [];
    d.rows.forEach(function (row, j) {
      var y = (d.y + j) * U, x = d.x, re = /([.,A-Za-z])(\d*)/g, m;
      while ((m = re.exec(row))) {
        var n = m[2] ? +m[2] : 1, c = m[1];
        if (c !== '.') {
          var seg = 'M' + x * U + ' ' + y + 'h' + n * U + 'v' + U + 'h-' + n * U + 'z';
          if (c === ',') shade.push(seg);
          else { var col = d.pal[c <= 'Z' ? c.charCodeAt(0) - 65 : c.charCodeAt(0) - 71]; (paths[col] = paths[col] || []).push(seg); }
        }
        x += n;
      }
    });
    var s = shade.length ? '<path fill="#06103a" fill-opacity=".32" d="' + shade.join('') + '"/>' : '';
    Object.keys(paths).forEach(function (c) { s += '<path fill="' + c + '" d="' + paths[c].join('') + '"/>'; });
    return '<svg class="fcb-art" viewBox="0 0 1000 500" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + s + '</svg>';
  }
  window.FcLevelArt = { add: add, draw: draw };
})();
