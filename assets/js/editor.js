/* ============================================================================
   editor.js — 브라우저에서 포트폴리오 내용을 고치는 편집기
   고친 내용은 자동으로 임시 저장되고, [content.js 내보내기] 로 파일을 받습니다.
   ========================================================================== */
(function () {
  'use strict';

  var DRAFT_KEY    = 'portfolio:draft';
  var SETTINGS_KEY = 'portfolio:editor-settings';
  var UNLOCK_KEY   = 'portfolio:editor-unlocked';
  var $  = function (s, c) { return (c || document).querySelector(s); };

  /* ------------------------------------------------------------------
     편집기 잠금
     ------------------------------------------------------------------
     주의: 이 사이트는 정적 호스팅(GitHub Pages)이라 서버 검사가 없습니다.
     이 잠금은 "지나가는 사람이 못 열게" 하는 가림막이지 보안이 아닙니다.
     실제 보호는 GitHub 토큰이 담당합니다 — 토큰 없이는 저장이 안 됩니다.

     비밀번호를 바꾸려면 [저장 · 설정] 탭의 '비밀번호 바꾸기' 를 쓰세요.
     ------------------------------------------------------------------ */
  var LOCK_SALT   = 'portfolio-editor:';
  var LOCK_SHA256 = 'efea977ad00f57d7aa0504b6678da901eb9ea1284dc204807c8106fe71e376c4';
  var LOCK_WEAK   = '2ea1a9c9';   // crypto.subtle 을 쓸 수 없는 환경(file://)용

  function weakHash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
    return ('0000000' + h.toString(16)).slice(-8);
  }
  function sha256Hex(str) {
    if (!(window.crypto && window.crypto.subtle && window.TextEncoder)) return Promise.resolve(null);
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
      .then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ('0' + b.toString(16)).slice(-2);
        }).join('');
      })
      .catch(function () { return null; });
  }
  function hashesOf(pw) {
    var salted = LOCK_SALT + pw;
    return sha256Hex(salted).then(function (hex) { return { sha256: hex, weak: weakHash(salted) }; });
  }
  function checkPassword(pw) {
    return hashesOf(pw).then(function (h) {
      return h.sha256 ? h.sha256 === LOCK_SHA256 : h.weak === LOCK_WEAK;
    });
  }
  function isUnlocked() {
    try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch (e) { return false; }
  }
  function setUnlocked() {
    try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch (e) {}
  }

  function renderLock(onUnlock) {
    document.body.classList.add('is-locked-screen');
    var wrap = el('div', 'e-lock');
    var box  = el('form', 'e-lock__box');
    box.appendChild(el('p', 'e-lock__icon', '🔒'));
    box.appendChild(el('h1', 'e-lock__title', '내용 편집기'));
    box.appendChild(el('p', 'e-lock__desc', '비밀번호를 입력하세요.'));

    var input = el('input', 'e-input e-lock__input');
    input.type = 'password';
    input.inputMode = 'numeric';
    input.autocomplete = 'current-password';
    input.setAttribute('aria-label', '편집기 비밀번호');
    box.appendChild(input);

    var err = el('p', 'e-lock__error');
    err.hidden = true;
    box.appendChild(err);

    var go = el('button', 'e-btn e-btn--dark e-lock__go', '열기');
    go.type = 'submit';
    box.appendChild(go);

    box.appendChild(el('p', 'e-lock__note',
      '이 잠금은 정적 사이트의 가림막입니다. 실제 저장 권한은 GitHub 토큰이 관리합니다.'));

    box.addEventListener('submit', function (e) {
      e.preventDefault();
      go.disabled = true;
      checkPassword(input.value).then(function (ok) {
        go.disabled = false;
        if (ok) { setUnlocked(); wrap.remove(); document.body.classList.remove('is-locked-screen'); onUnlock(); }
        else {
          err.textContent = '비밀번호가 맞지 않습니다.';
          err.hidden = false;
          input.value = '';
          input.focus();
        }
      });
    });

    wrap.appendChild(box);
    document.body.appendChild(wrap);
    setTimeout(function () { input.focus(); }, 60);
  }

  /* ------------------------------------------------------------------
     GitHub 저장 설정
     ------------------------------------------------------------------ */
  var REPO_DEFAULTS = { branch: 'claude/game-planner-portfolio-landing-ote57w', path: 'assets/content.js' };

  function detectRepo() {
    var owner = '', repo = '';
    var m = String(location.hostname).match(/^([^.]+)\.github\.io$/i);
    if (m) {
      owner = m[1];
      var seg = location.pathname.split('/').filter(Boolean);
      repo = seg.length ? seg[0] : owner + '.github.io';
    }
    return { owner: owner, repo: repo };
  }
  function readSettings() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch (e) {}
    var det = detectRepo();
    return {
      owner:  saved.owner  || det.owner  || '',
      repo:   saved.repo   || det.repo   || '',
      branch: saved.branch || REPO_DEFAULTS.branch,
      path:   saved.path   || REPO_DEFAULTS.path,
      token:  saved.token  || ''
    };
  }
  function writeSettings(next) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch (e) {}
  }

  function toBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '', chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin);
  }

  var saveStatusEl = null;
  function setSaveStatus(msg, kind) {
    if (!saveStatusEl) return;
    saveStatusEl.textContent = msg;
    saveStatusEl.className = 'e-save__status' + (kind ? ' is-' + kind : '');
  }

  /* 저장된 내용이 실제 사이트에 반영됐는지 확인 */
  function waitForLive(rev) {
    var deadline = Date.now() + 240000;
    return new Promise(function (resolve) {
      (function poll() {
        fetch('assets/content.js?cb=' + Date.now(), { cache: 'no-store' })
          .then(function (r) { return r.text(); })
          .then(function (txt) {
            if (txt.indexOf('rev: ' + rev) >= 0) return resolve(true);
            if (Date.now() > deadline) return resolve(false);
            setTimeout(poll, 5000);
          })
          .catch(function () {
            if (Date.now() > deadline) return resolve(false);
            setTimeout(poll, 5000);
          });
      })();
    });
  }

  var saving = false;
  function saveToGitHub() {
    if (saving) return;
    var cfg = readSettings();
    if (!cfg.token || !cfg.owner || !cfg.repo) {
      currentSection = '__settings';
      rerender();
      setSaveStatus(!cfg.token
        ? 'GitHub 토큰을 먼저 입력해 주세요. 아래 안내를 참고하세요.'
        : '저장소 정보(owner / repo)를 채워 주세요.', 'warn');
      return;
    }

    saving = true;
    var rev = String(Date.now());
    var source = toSource(data, rev);
    var api = 'https://api.github.com/repos/' + encodeURIComponent(cfg.owner) + '/' +
              encodeURIComponent(cfg.repo) + '/contents/' +
              cfg.path.split('/').map(encodeURIComponent).join('/');
    var headers = {
      'Authorization': 'Bearer ' + cfg.token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    };

    setSaveStatus('현재 파일을 확인하는 중…');
    fetch(api + '?ref=' + encodeURIComponent(cfg.branch), { headers: headers })
      .then(function (r) {
        if (r.status === 200) return r.json().then(function (j) { return j.sha; });
        if (r.status === 404) return null;
        if (r.status === 401) throw new Error('토큰이 올바르지 않습니다 (401). 토큰을 다시 확인해 주세요.');
        if (r.status === 403) throw new Error('권한이 없습니다 (403). 토큰의 Contents 권한이 “Read and write” 인지 확인해 주세요.');
        throw new Error('파일을 확인하지 못했습니다 (' + r.status + ').');
      })
      .then(function (sha) {
        setSaveStatus('GitHub 에 저장하는 중…');
        var body = { message: '내용 수정 (편집기)', content: toBase64(source), branch: cfg.branch };
        if (sha) body.sha = sha;
        return fetch(api, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
      })
      .then(function (r) {
        if (r.ok) return r.json();
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (r.status === 409) throw new Error('다른 곳에서 먼저 저장돼 충돌했습니다 (409). 새로고침한 뒤 다시 시도해 주세요.');
          if (r.status === 422) throw new Error('브랜치 이름을 확인해 주세요 (422). ' + (j.message || ''));
          throw new Error('저장 실패 (' + r.status + ') ' + (j.message || ''));
        });
      })
      .then(function () {
        setSaveStatus('저장했습니다. 사이트에 반영되는 중… (보통 1분 내외)');
        return waitForLive(rev);
      })
      .then(function (ok) {
        saving = false;
        setSaveStatus(ok
          ? '반영 완료! 사이트를 새로고침하면 바뀐 내용이 보입니다.'
          : '저장은 됐지만 반영 확인이 늦어집니다. 잠시 후 사이트를 새로고침해 보세요.',
          ok ? 'ok' : 'warn');
      })
      .catch(function (e) {
        saving = false;
        setSaveStatus(e.message || String(e), 'error');
      });
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  /* ======================================================================
     1. 스키마 — 어떤 항목을 어떤 입력칸으로 보여줄지 정의
     ====================================================================== */
  var i18n = function () { return { ko: '', en: '' }; };

  var SCHEMA = [
    { key: 'meta', label: '기본 정보',
      desc: '이름·직함·연락처·이력서 파일 위치. 이메일을 비우면 푸터 이메일 버튼이 “입력 예정” 상태가 됩니다.',
      fields: [
        { key: 'name', label: '이름', type: 'i18n' },
        { key: 'role', label: '직함', type: 'i18n' },
        { key: 'resumeUrl', label: '이력서 파일 경로', type: 'text', hint: '예: assets/resume/jisu-kim-resume.pdf' },
        { key: 'email', label: '연락 이메일', type: 'text', hint: '비우면 자리표시 상태.' },
        { key: 'github', label: 'GitHub 주소', type: 'text', hint: '비우면 GitHub 버튼이 사라집니다.' }
      ] },

    { key: 'nav', label: '헤더 목차',
      desc: '상단 메뉴에 쓰이는 페이지 이름입니다.',
      fields: [
        { key: 'home', label: '홈', type: 'i18n' },
        { key: 'resume', label: '이력서', type: 'i18n' },
        { key: 'cover', label: '자기소개서', type: 'i18n' },
        { key: 'projects', label: '프로젝트', type: 'i18n' },
        { key: 'play', label: '게임플레이', type: 'i18n' }
      ] },

    { key: 'hero', label: '공통 히어로',
      desc: '홈·이력서 첫 화면의 큰 제목입니다.',
      fields: [
        { key: 'titleHtml', label: '큰 제목', type: 'html', area: true, tall: true,
          hint: '<span class="accent">보라색</span> · <br> 줄바꿈 을 쓸 수 있습니다.' }
      ] },

    { key: 'home', label: '홈',
      desc: '홈 화면. 하단 카드 뽑기는 프로젝트에서 랜덤으로 뽑아 옵니다.',
      fields: [
        { key: 'sub', label: '설명 문장', type: 'i18n', area: true },
        { key: 'ctaResume', label: '이력서 버튼 문구', type: 'i18n' },
        { key: 'ctaProjects', label: '포트폴리오 버튼 문구', type: 'i18n' },
        { key: 'draw', label: '카드 뽑기', type: 'group', fields: [
          { key: 'label', label: '버튼 문구', type: 'i18n' },
          { key: 'hint', label: '작은 안내', type: 'i18n' },
          { key: 'count', label: '한 번에 뽑을 카드 수', type: 'text', hint: '숫자만. 예: 4' }
        ] },
        { key: 'player', label: '플레이어 카드', type: 'group', fields: [
          { key: 'photo', label: '프로필 사진 경로', type: 'text', hint: '예: assets/img/profile.jpg — 비우면 고스트 자리표시.' },
          { key: 'photoAlt', label: '사진 대체 텍스트', type: 'i18n' },
          { key: 'class', label: '직군 (CLASS)', type: 'i18n' },
          { key: 'meta', label: '한 줄 요약', type: 'i18n', hint: '예: 개발 경력 10년 · 출시작 7종' },
          { key: 'specs', label: '실적 (실제 숫자)', type: 'list',
            itemName: function (it){ return (it.value&&it.value.ko||'') + ' ' + (it.label&&it.label.ko||''); },
            template: function (){ return { value:i18n(), label:i18n() }; },
            fields: [
              { key: 'value', label: '숫자', type: 'i18n', hint: '예: 30만+' },
              { key: 'label', label: '설명', type: 'i18n', hint: '예: 누적 다운로드' }
            ] }
        ] }
      ] },

    { key: 'resume', label: '이력서 페이지',
      desc: '히어로 아래로 숫자 요약 · 핵심역량 · 경력이 이어집니다.',
      fields: [
        { key: 'heroNote', label: '히어로 하단 안내', type: 'i18n' },
        { key: 'profile', label: '인적사항', type: 'group', fields: [
          { key: 'title', label: '제목', type: 'i18n' },
          { key: 'note', label: '안내 문구', type: 'i18n', area: true },
          { key: 'items', label: '항목', type: 'list',
            itemName: function (it){ return (it.label&&it.label.ko||'항목') + ' · ' + (it.value&&it.value.ko||''); },
            template: function (){ return { label:i18n(), value:i18n() }; },
            fields: [
              { key: 'label', label: '항목 이름', type: 'i18n', hint: '예: 연락처' },
              { key: 'value', label: '값', type: 'i18n', hint: '민감한 정보는 x 로 가려 두세요. 예: 010-xxxx-xxxx' }
            ] }
        ] },
        { key: 'stats', label: '숫자 요약', type: 'list',
          itemName: function (it){ return (it.num||'') + ' ' + (it.label&&it.label.ko||''); },
          template: function (){ return { num:'', unit:i18n(), label:i18n() }; },
          fields: [
            { key: 'num', label: '숫자', type: 'text' },
            { key: 'unit', label: '단위', type: 'i18n' },
            { key: 'label', label: '설명', type: 'i18n' }
          ] },
        { key: 'skills', label: '핵심역량', type: 'group', fields: [
          { key: 'title', label: '제목', type: 'i18n' },
          { key: 'lead', label: '설명', type: 'i18n', area: true },
          { key: 'cards', label: '역량 카드', type: 'list',
            itemName: function (it){ return it.title&&it.title.ko||'역량'; },
            template: function (){ return { title:i18n(), body:i18n(), tags:[] }; },
            fields: [
              { key: 'title', label: '제목', type: 'i18n' },
              { key: 'body', label: '설명 (이력서 원문)', type: 'i18n', area: true, hint: '도구 아이콘은 content.js 의 tools 배열에서 관리합니다 (예: figma, office, github …).' }
            ] }
        ] },
        { key: 'career', label: '경력 · 활동', type: 'group', fields: [
          { key: 'title', label: '제목', type: 'i18n' },
          { key: 'lead', label: '설명', type: 'i18n', area: true },
          { key: 'items', label: '경력 항목', type: 'list',
            itemName: function (it){ return (it.date&&it.date.ko||'') + ' · ' + (it.role&&it.role.ko||''); },
            template: function (){ return { now:false, date:i18n(), role:i18n(), org:i18n(), body:i18n(), tags:[] }; },
            fields: [
              { key: 'now', label: '현재 진행 중 (초록 점)', type: 'bool' },
              { key: 'date', label: '기간', type: 'i18n' },
              { key: 'role', label: '역할 · 제목', type: 'i18n' },
              { key: 'org', label: '소속 · 부제', type: 'i18n' },
              { key: 'body', label: '설명', type: 'i18n', area: true },
              { key: 'tags', label: '태그', type: 'i18nList' }
            ] }
        ] }
      ] },

    { key: 'coverLetter', label: '자기소개서',
      desc: 'blocks 를 추가하면 문단이 채워집니다. 비우면 “곧 채울 예정” 안내가 표시됩니다.',
      fields: [
        { key: 'title', label: '제목', type: 'i18n' },
        { key: 'lead', label: '비었을 때 안내 문구', type: 'i18n' },
        { key: 'blocks', label: '문단', type: 'list',
          itemName: function (it){ return it.heading&&it.heading.ko||'문단'; },
          template: function (){ return { heading:i18n(), body:i18n() }; },
          fields: [
            { key: 'heading', label: '소제목', type: 'i18n' },
            { key: 'body', label: '본문', type: 'i18n', area: true, tall: true, hint: '빈 줄로 문단을 나눕니다.' }
          ] }
      ] },

    { key: 'projects', label: '프로젝트',
      desc: '카테고리(게임/기획)로 탭 필터가 됩니다. 프로젝트를 추가하면 상세 페이지가 자동 생성됩니다.',
      fields: [
        { key: 'title', label: '페이지 제목', type: 'i18n' },
        { key: 'tabs', label: '탭 이름', type: 'group', fields: [
          { key: 'all', label: '전체', type: 'i18n' },
          { key: 'game', label: '게임', type: 'i18n' },
          { key: 'planning', label: '기획', type: 'i18n' }
        ] },
        { key: 'items', label: '프로젝트', type: 'list',
          itemName: function (it){ return it.title&&it.title.ko||it.id||'프로젝트'; },
          template: function (){ return { id:'', category:'game', title:i18n(), period:i18n(), sub:i18n(), quest:{goal:i18n(),result:i18n(),cleared:true}, genres:[], headcount:i18n(), myRole:i18n(), status:i18n(), learned:[], links:{googlePlay:'',steam:''}, media:{embed:'',note:i18n()}, detailBlocks:{problem:i18n(),approach:i18n(),retrospective:i18n()} }; },
          fields: [
            { key: 'id', label: '주소용 id', type: 'text', hint: '영문 소문자·하이픈. 예: league-of-defense' },
            { key: 'category', label: '분류', type: 'select', options: [ ['game','게임'], ['planning','기획'] ] },
            { key: 'title', label: '이름', type: 'i18n' },
            { key: 'period', label: '기간', type: 'i18n', hint: '예: 2025.01 ~ 2025.08' },
            { key: 'sub', label: '한 줄 소개', type: 'i18n' },
            { key: 'quest', label: '퀘스트 (목표 → 결과)', type: 'group', fields: [
              { key: 'goal', label: '목표', type: 'i18n', hint: '예: 3일 차 이탈 개선' },
              { key: 'result', label: '결과', type: 'i18n', hint: '예: 34% → 21%' },
              { key: 'cleared', label: '클리어 배지 표시', type: 'bool' }
            ] },
            { key: 'genres', label: '장르 (최대 3개 표시)', type: 'i18nList' },
            { key: 'headcount', label: '인원', type: 'i18n' },
            { key: 'myRole', label: '맡은 역할', type: 'i18n' },
            { key: 'status', label: '상태', type: 'i18n' },
            { key: 'learned', label: '무엇을 배웠는지', type: 'i18nList', area: true, hint: '<b>굵게</b> 가능.' },
            { key: 'links', label: '스토어 링크', type: 'group', fields: [
              { key: 'googlePlay', label: 'Google Play URL', type: 'text' },
              { key: 'steam', label: 'Steam URL', type: 'text' }
            ] },
            { key: 'media', label: '상세 미디어 (우측 큰 영역)', type: 'group', fields: [
              { key: 'embed', label: '임베드 URL', type: 'text', hint: '유튜브/영상/웹게임 임베드 주소. 비우면 안내 문구 표시.' },
              { key: 'note', label: '비었을 때 안내', type: 'i18n' }
            ] },
            { key: 'detailBlocks', label: '상세 서술 (선택)', type: 'group', fields: [
              { key: 'problem', label: '문제', type: 'i18n', area: true, tall: true, hint: '비우면 상세에 안 나옵니다.' },
              { key: 'approach', label: '접근', type: 'i18n', area: true, tall: true },
              { key: 'retrospective', label: '다시 한다면', type: 'i18n', area: true, tall: true }
            ] }
          ] }
      ] },

    { key: 'play', label: '게임플레이',
      fields: [
        { key: 'title', label: '제목', type: 'i18n' },
        { key: 'lead', label: '설명', type: 'i18n', area: true },
        { key: 'cards', label: '게임 카드', type: 'list',
          itemName: function (it){ return it.name&&it.name.ko||'게임'; },
          template: function (){ return { name:i18n(), hours:i18n(), genre:i18n(), note:i18n() }; },
          fields: [
            { key: 'name', label: '게임 이름', type: 'i18n' },
            { key: 'hours', label: '플레이타임', type: 'i18n' },
            { key: 'genre', label: '장르 · 플랫폼', type: 'i18n' },
            { key: 'note', label: '메모', type: 'i18n', area: true }
          ] }
      ] },

    { key: 'footer', label: '푸터',
      fields: [
        { key: 'tagline', label: '한 줄 문구', type: 'i18n' }
      ] }
  ];

  /* ======================================================================
     2. 상태
     ====================================================================== */
  var ORIGINAL = clone(window.PORTFOLIO_CONTENT || {});
  var data = loadDraft() || clone(ORIGINAL);
  var currentSection = SCHEMA[0].key;
  var saveTimer = null;

  function loadDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      // 원본에만 있는 새 항목이 있으면 보충
      Object.keys(ORIGINAL).forEach(function (k) { if (!(k in parsed)) parsed[k] = clone(ORIGINAL[k]); });
      return parsed;
    } catch (e) { return null; }
  }
  function markDirty() {
    setStatus('저장 중…', false);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        setStatus('임시 저장됨 · ' + new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), true);
      } catch (e) {
        setStatus('저장 실패 (브라우저 저장 공간)', false);
      }
    }, 350);
  }
  function setStatus(text, ok) {
    var s = $('#status');
    if (!s) return;
    s.textContent = text;
    s.classList.toggle('is-saved', !!ok);
  }

  /* ======================================================================
     3. 입력칸 만들기
     ====================================================================== */
  function textInput(obj, key, opts) {
    opts = opts || {};
    var node = opts.area ? el('textarea', 'e-textarea' + (opts.tall ? ' e-textarea--tall' : '')) : el('input', 'e-input');
    if (!opts.area) node.type = 'text';
    node.value = obj[key] === undefined || obj[key] === null ? '' : obj[key];
    if (opts.placeholder) node.placeholder = opts.placeholder;
    node.addEventListener('input', function () { obj[key] = node.value; markDirty(); });
    return node;
  }

  function i18nField(obj, key, opts) {
    opts = opts || {};
    if (!obj[key] || typeof obj[key] !== 'object') obj[key] = i18n();
    var wrap = el('div');
    [['ko', '한'], ['en', 'EN']].forEach(function (pair) {
      var row = el('div', 'e-row');
      var tag = el('span', 'e-row__tag' + (pair[0] === 'en' ? ' e-row__tag--en' : ''), pair[1]);
      row.appendChild(tag);
      row.appendChild(textInput(obj[key], pair[0], {
        area: opts.area, tall: opts.tall,
        placeholder: pair[0] === 'en' ? '비우면 한국어가 그대로 표시됩니다' : ''
      }));
      wrap.appendChild(row);
    });
    return wrap;
  }

  function fieldBlock(labelText, control, hint) {
    var f = el('div', 'e-field');
    if (labelText) f.appendChild(el('label', 'e-field__label', labelText));
    f.appendChild(control);
    if (hint) {
      var h = el('p', 'e-field__hint');
      h.textContent = hint;
      f.appendChild(h);
    }
    return f;
  }

  function selectField(obj, key, options) {
    var sel = el('select', 'e-select');
    options.forEach(function (opt) {
      var o = el('option', null, opt[1]);
      o.value = opt[0];
      sel.appendChild(o);
    });
    sel.value = obj[key] || '';
    sel.addEventListener('change', function () { obj[key] = sel.value; markDirty(); });
    return sel;
  }

  function boolField(obj, key, label) {
    var wrap = el('label', 'e-check');
    var box = el('input');
    box.type = 'checkbox';
    box.checked = !!obj[key];
    box.addEventListener('change', function () { obj[key] = box.checked; markDirty(); });
    wrap.appendChild(box);
    wrap.appendChild(el('span', null, label));
    return wrap;
  }

  /* 반복 항목 */
  function listField(obj, key, spec, nested) {
    if (!Array.isArray(obj[key])) obj[key] = [];
    var list = obj[key];
    var wrap = el('div', 'e-list');

    var head = el('div', 'e-list__head');
    // 최상위 목록은 패널 제목과 겹치므로 '전체'로 표기
    var title = el('p', 'e-list__title', nested ? (spec.label || '항목') : '전체');
    var count = el('span', 'e-list__count', '(' + list.length + '개)');
    title.appendChild(count);
    head.appendChild(title);

    var add = el('button', 'e-btn e-btn--primary', '+ 추가');
    add.type = 'button';
    add.addEventListener('click', function () {
      var item = spec.template ? spec.template() : {};
      if ('id' in item) item.id = 'new-item-' + (list.length + 1);
      list.push(item);
      markDirty();
      rerender();
    });
    head.appendChild(add);
    wrap.appendChild(head);

    if (spec.hint) wrap.appendChild(el('p', 'e-field__hint', spec.hint));

    if (!list.length) {
      wrap.appendChild(el('div', 'e-empty', '항목이 없습니다. [+ 추가] 를 눌러 만들어 주세요.'));
      return wrap;
    }

    list.forEach(function (item, i) {
      var card = el('div', 'e-item' + (nested ? ' e-item--nested' : ''));
      var bar = el('div', 'e-item__bar');
      bar.appendChild(el('span', 'e-item__no', String(i + 1)));
      var name = spec.itemName ? String(spec.itemName(item) || '').trim() : '';
      bar.appendChild(el('span', 'e-item__name', name || '(이름 없음)'));

      [['↑', i > 0, function () { list.splice(i - 1, 0, list.splice(i, 1)[0]); }],
       ['↓', i < list.length - 1, function () { list.splice(i + 1, 0, list.splice(i, 1)[0]); }]
      ].forEach(function (act) {
        var b = el('button', 'e-btn e-btn--icon', act[0]);
        b.type = 'button';
        b.disabled = !act[1];
        b.style.opacity = act[1] ? '1' : '.35';
        b.title = act[0] === '↑' ? '위로' : '아래로';
        if (act[1]) b.addEventListener('click', function () { act[2](); markDirty(); rerender(); });
        bar.appendChild(b);
      });

      var del = el('button', 'e-btn e-btn--icon e-btn--danger', '✕');
      del.type = 'button';
      del.title = '삭제';
      del.addEventListener('click', function () {
        if (!window.confirm('이 항목을 삭제할까요?')) return;
        list.splice(i, 1);
        markDirty();
        rerender();
      });
      bar.appendChild(del);
      card.appendChild(bar);

      var body = el('div', 'e-item__body');
      buildFields(body, item, spec.fields || [], true);
      card.appendChild(body);
      wrap.appendChild(card);
    });

    return wrap;
  }

  /* {ko,en} 로만 이루어진 단순 목록 (요약 문장, 태그 등) */
  function i18nListField(obj, key, spec) {
    if (!Array.isArray(obj[key])) obj[key] = [];
    var list = obj[key];
    var wrap = el('div', 'e-list');

    var head = el('div', 'e-list__head');
    var title = el('p', 'e-list__title', spec.label || '항목');
    title.appendChild(el('span', 'e-list__count', '(' + list.length + '개)'));
    head.appendChild(title);
    var add = el('button', 'e-btn e-btn--primary', '+ 추가');
    add.type = 'button';
    add.addEventListener('click', function () { list.push(i18n()); markDirty(); rerender(); });
    head.appendChild(add);
    wrap.appendChild(head);
    if (spec.hint) wrap.appendChild(el('p', 'e-field__hint', spec.hint));

    if (!list.length) {
      wrap.appendChild(el('div', 'e-empty', '항목이 없습니다. [+ 추가] 를 눌러 만들어 주세요.'));
      return wrap;
    }

    list.forEach(function (item, i) {
      if (!item || typeof item !== 'object') list[i] = item = { ko: String(item || ''), en: '' };
      var card = el('div', 'e-item e-item--nested');
      var bar = el('div', 'e-item__bar');
      bar.appendChild(el('span', 'e-item__no', String(i + 1)));
      bar.appendChild(el('span', 'e-item__name', (item.ko || '').replace(/<[^>]+>/g, '') || '(비어 있음)'));
      [['↑', i > 0, function () { list.splice(i - 1, 0, list.splice(i, 1)[0]); }],
       ['↓', i < list.length - 1, function () { list.splice(i + 1, 0, list.splice(i, 1)[0]); }]
      ].forEach(function (act) {
        var b = el('button', 'e-btn e-btn--icon', act[0]);
        b.type = 'button';
        b.disabled = !act[1];
        b.style.opacity = act[1] ? '1' : '.35';
        if (act[1]) b.addEventListener('click', function () { act[2](); markDirty(); rerender(); });
        bar.appendChild(b);
      });
      var del = el('button', 'e-btn e-btn--icon e-btn--danger', '✕');
      del.type = 'button';
      del.addEventListener('click', function () { list.splice(i, 1); markDirty(); rerender(); });
      bar.appendChild(del);
      card.appendChild(bar);

      var body = el('div', 'e-item__body');
      var holder = { v: item };
      body.appendChild(i18nField(holder, 'v', { area: spec.area }));
      card.appendChild(body);
      wrap.appendChild(card);
    });
    return wrap;
  }

  function buildFields(container, obj, fields, nested) {
    fields.forEach(function (f) {
      if (f.type === 'list') {
        container.appendChild(listField(obj, f.key, f, true));
      } else if (f.type === 'i18nList') {
        container.appendChild(i18nListField(obj, f.key, f));
      } else if (f.type === 'group') {
        if (!obj[f.key] || typeof obj[f.key] !== 'object') obj[f.key] = {};
        var sub = el('div', 'e-sub');
        sub.appendChild(el('p', 'e-sub__title', f.label));
        buildFields(sub, obj[f.key], f.fields || [], true);
        container.appendChild(sub);
      } else if (f.type === 'bool') {
        container.appendChild(fieldBlock(null, boolField(obj, f.key, f.label), f.hint));
      } else if (f.type === 'select') {
        container.appendChild(fieldBlock(f.label, selectField(obj, f.key, f.options || []), f.hint));
      } else if (f.type === 'text') {
        container.appendChild(fieldBlock(f.label, textInput(obj, f.key, { area: f.area, tall: f.tall }), f.hint));
      } else { // i18n · html
        container.appendChild(fieldBlock(f.label, i18nField(obj, f.key, { area: f.area, tall: f.tall }), f.hint));
      }
    });
  }

  /* ======================================================================
     3-1. 저장 · 설정 패널
     ====================================================================== */
  function renderSettings(panel) {
    var cfg = readSettings();
    function bind(key, label, hint, isPassword) {
      var input = el('input', 'e-input');
      input.type = isPassword ? 'password' : 'text';
      input.value = cfg[key] || '';
      if (isPassword) input.autocomplete = 'off';
      input.addEventListener('input', function () {
        cfg[key] = input.value;
        writeSettings(cfg);
      });
      panel.appendChild(fieldBlock(label, input, hint));
    }

    /* 저장 버튼 + 상태 */
    var box = el('div', 'e-save');
    box.appendChild(el('h3', 'e-save__title', 'GitHub 에 바로 저장'));
    box.appendChild(el('p', 'e-save__desc',
      '토큰을 한 번 넣어 두면, 버튼 한 번으로 저장 → 자동 배포까지 진행됩니다. ' +
      '복사해서 붙여넣을 필요가 없습니다.'));
    var go = el('button', 'e-btn e-btn--dark e-save__go', '저장하고 사이트에 반영');
    go.type = 'button';
    go.addEventListener('click', saveToGitHub);
    box.appendChild(go);
    saveStatusEl = el('p', 'e-save__status');
    box.appendChild(saveStatusEl);
    panel.appendChild(box);

    bind('owner', 'GitHub 사용자 이름', '주소가 github.io 면 자동으로 채워집니다.');
    bind('repo', '저장소 이름');
    bind('branch', '브랜치', '현재 배포 중인 브랜치 이름입니다.');
    bind('path', '저장할 파일 경로', '보통 바꿀 일이 없습니다.');
    bind('token', 'GitHub 토큰', '이 브라우저에만 저장됩니다. 공용 컴퓨터에서는 쓰지 마세요.', true);

    var clear = el('button', 'e-btn e-btn--danger', '이 브라우저에서 토큰 지우기');
    clear.type = 'button';
    clear.addEventListener('click', function () {
      cfg.token = '';
      writeSettings(cfg);
      rerender();
      setSaveStatus('토큰을 지웠습니다.', 'warn');
    });
    panel.appendChild(fieldBlock(null, clear));

    /* 토큰 만드는 법 */
    var help = el('div', 'e-help');
    help.appendChild(el('h3', 'e-save__title', '토큰 만드는 법 (한 번만)'));
    var ol = el('ol', 'e-help__list');
    [
      'GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens',
      '[Generate new token] 을 누릅니다.',
      'Repository access 에서 이 저장소 하나만 선택합니다.',
      'Permissions → Repository permissions → Contents 를 “Read and write” 로 바꿉니다.',
      '만들어진 토큰을 위 [GitHub 토큰] 칸에 붙여넣습니다.'
    ].forEach(function (line) { ol.appendChild(el('li', null, line)); });
    help.appendChild(ol);
    help.appendChild(el('p', 'e-field__hint',
      '토큰은 비밀번호와 같습니다. 다른 사람에게 보여주지 말고, 잃어버리면 GitHub 에서 삭제한 뒤 새로 만드세요.'));
    panel.appendChild(help);

    /* 비밀번호 바꾸기 */
    var pwBox = el('div', 'e-help');
    pwBox.appendChild(el('h3', 'e-save__title', '편집기 비밀번호 바꾸기'));
    pwBox.appendChild(el('p', 'e-save__desc',
      '새 비밀번호를 넣으면 아래에 두 줄이 나옵니다. 그 두 줄을 assets/js/editor.js 의 ' +
      'LOCK_SHA256 · LOCK_WEAK 줄과 바꿔치기하면 됩니다.'));
    var pwIn = el('input', 'e-input');
    pwIn.type = 'text';
    pwIn.placeholder = '새 비밀번호';
    pwBox.appendChild(pwIn);
    var pwOut = el('textarea', 'e-textarea e-help__out');
    pwOut.readOnly = true;
    pwOut.spellcheck = false;
    pwOut.hidden = true;
    var pwGo = el('button', 'e-btn', '해시 만들기');
    pwGo.type = 'button';
    pwGo.style.marginTop = '8px';
    pwGo.addEventListener('click', function () {
      if (!pwIn.value) return;
      hashesOf(pwIn.value).then(function (h) {
        pwOut.hidden = false;
        pwOut.value =
          "  var LOCK_SHA256 = '" + (h.sha256 || '(이 브라우저에서 계산 불가 — https 로 열어 주세요)') + "';\n" +
          "  var LOCK_WEAK   = '" + h.weak + "';";
      });
    });
    pwBox.appendChild(pwGo);
    pwBox.appendChild(pwOut);
    panel.appendChild(pwBox);

    /* 솔직한 안내 */
    var warn = el('div', 'e-warn');
    warn.appendChild(el('p', null,
      '알아두실 점: 이 사이트는 서버가 없는 정적 사이트라, 비밀번호 검사는 브라우저 안에서만 일어납니다. ' +
      '마음먹고 소스를 뜯어보는 사람은 편집기 화면을 열 수 있습니다. ' +
      '다만 저장은 GitHub 토큰이 있어야만 되므로, 남이 내용을 바꿔 저장할 수는 없습니다.'));
    panel.appendChild(warn);
  }

  /* ======================================================================
     4. 화면 그리기
     ====================================================================== */
  function rerender() {
    var side = $('#side');
    side.innerHTML = '';
    var menu = SCHEMA.concat([{ key: '__settings', label: '저장 · 설정' }]);
    menu.forEach(function (sec) {
      var b = el('button', 'e-side__btn' + (sec.key === currentSection ? ' is-active' : '') +
        (sec.key === '__settings' ? ' e-side__btn--settings' : ''), sec.label);
      b.type = 'button';
      b.addEventListener('click', function () { currentSection = sec.key; rerender(); window.scrollTo(0, 0); });
      side.appendChild(b);
    });

    var panel = $('#panel');
    panel.innerHTML = '';
    saveStatusEl = null;

    if (currentSection === '__settings') {
      var shead = el('div', 'e-panel__head');
      shead.appendChild(el('h2', 'e-panel__title', '저장 · 설정'));
      shead.appendChild(el('p', 'e-panel__desc',
        'GitHub 에 바로 저장하는 설정입니다. 한 번만 맞춰 두면 이후에는 버튼 한 번으로 끝납니다.'));
      panel.appendChild(shead);
      renderSettings(panel);
      return;
    }

    var spec = SCHEMA.filter(function (s) { return s.key === currentSection; })[0] || SCHEMA[0];

    var head = el('div', 'e-panel__head');
    head.appendChild(el('h2', 'e-panel__title', spec.label));
    if (spec.desc) head.appendChild(el('p', 'e-panel__desc', spec.desc));
    panel.appendChild(head);

    if (spec.type === 'list') {
      panel.appendChild(listField(data, spec.key, spec, false));
    } else {
      if (!data[spec.key] || typeof data[spec.key] !== 'object') data[spec.key] = {};
      buildFields(panel, data[spec.key], spec.fields || [], false);
    }
  }

  /* ======================================================================
     5. 내보내기 · 되돌리기
     ====================================================================== */
  function toSource(obj, rev) {
    rev = rev || String(Date.now());
    return '/* ============================================================================\n' +
      '   포트폴리오 내용 파일  ·  edit.html 에서 내보낸 파일입니다.\n' +
      '   이 파일을 assets/content.js 에 덮어쓰면 사이트에 반영됩니다.\n' +
      '   내보낸 시각: ' + new Date().toLocaleString('ko-KR') + '\n' +
      '   rev: ' + rev + '\n' +
      '   ========================================================================== */\n\n' +
      'window.PORTFOLIO_CONTENT = ' + JSON.stringify(obj, null, 2) + ';\n';
  }

  function openExport() {
    var src = toSource(data);
    $('#exportCode').value = src;
    $('#exportModal').hidden = false;
    $('#exportCode').focus();
    $('#exportCode').setSelectionRange(0, 0);
  }

  function download() {
    var blob = new Blob([toSource(data)], { type: 'text/javascript;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'content.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function copySource() {
    var ta = $('#exportCode');
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(function () { flash('복사했습니다'); }, function () {
        flash(ok ? '복사했습니다' : '복사에 실패했습니다. 직접 선택해 주세요');
      });
    } else {
      flash(ok ? '복사했습니다' : '복사에 실패했습니다. 직접 선택해 주세요');
    }
  }

  function flash(msg) {
    var s = $('#status');
    var prev = s.textContent;
    s.textContent = msg;
    setTimeout(function () { s.textContent = prev; }, 1800);
  }

  function importFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var sandbox = { PORTFOLIO_CONTENT: null };
        new Function('window', String(reader.result))(sandbox);
        if (!sandbox.PORTFOLIO_CONTENT) throw new Error('내용을 찾지 못했습니다');
        data = sandbox.PORTFOLIO_CONTENT;
        markDirty();
        rerender();
        flash('파일을 불러왔습니다');
      } catch (e) {
        window.alert('파일을 읽지 못했습니다.\n\n' + e.message);
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  /* ======================================================================
     6. 시작
     ====================================================================== */
  function boot() {
    $('#btnPreview').addEventListener('click', function () {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) {}
      window.open('index.html?preview=1', '_blank', 'noopener');
    });
    $('#btnExport').addEventListener('click', openExport);
    $('#btnDownload').addEventListener('click', download);
    $('#btnCopy').addEventListener('click', copySource);
    $('#btnCloseModal').addEventListener('click', function () { $('#exportModal').hidden = true; });
    $('#exportModal').addEventListener('click', function (e) {
      if (e.target === $('#exportModal')) $('#exportModal').hidden = true;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('#exportModal').hidden) $('#exportModal').hidden = true;
    });

    $('#btnReset').addEventListener('click', function () {
      if (!window.confirm('편집 중이던 내용을 모두 버리고 현재 사이트의 content.js 상태로 되돌립니다. 계속할까요?')) return;
      data = clone(ORIGINAL);
      try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
      rerender();
      setStatus('원본으로 되돌렸습니다', false);
    });

    $('#fileImport').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (file) importFile(file);
      e.target.value = '';
    });

    $('#btnSave').addEventListener('click', function () {
      if (currentSection !== '__settings') { currentSection = '__settings'; rerender(); window.scrollTo(0, 0); }
      saveToGitHub();
    });

    rerender();
    var hadDraft = false;
    try { hadDraft = !!localStorage.getItem(DRAFT_KEY); } catch (e) {}
    setStatus(hadDraft ? '이전에 편집하던 내용을 불러왔습니다' : '준비됨', false);

    window.addEventListener('beforeunload', function () {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) {}
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.PORTFOLIO_CONTENT) {
      document.body.innerHTML = '<p style="padding:40px">assets/content.js 를 불러오지 못했습니다.</p>';
      return;
    }
    var app = $('#app');
    if (isUnlocked()) { app.hidden = false; boot(); }
    else { app.hidden = true; renderLock(function () { app.hidden = false; boot(); }); }
  });
})();
