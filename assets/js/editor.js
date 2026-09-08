/* ============================================================================
   editor.js — 브라우저에서 포트폴리오 내용을 고치는 편집기
   고친 내용은 자동으로 임시 저장되고, [content.js 내보내기] 로 파일을 받습니다.
   ========================================================================== */
(function () {
  'use strict';

  var DRAFT_KEY = 'portfolio:draft';
  var $  = function (s, c) { return (c || document).querySelector(s); };

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
    {
      key: 'meta', label: '기본 정보',
      desc: '이름과 연락처, 이력서 파일 위치입니다. 이메일을 비우면 연락처 버튼이 “주소 입력 예정” 상태로 표시됩니다.',
      fields: [
        { key: 'name', label: '이름', type: 'i18n' },
        { key: 'role', label: '직함', type: 'i18n' },
        { key: 'pageTitle', label: '브라우저 탭 제목', type: 'i18n' },
        { key: 'description', label: '검색 결과 설명', type: 'i18n', area: true },
        { key: 'resumeUrl', label: '이력서 파일 경로', type: 'text', hint: '예: assets/resume/jisu-kim-resume.pdf' },
        { key: 'email', label: '연락 이메일', type: 'text', hint: '비우면 이메일 버튼이 자리표시 상태가 됩니다.' },
        { key: 'github', label: 'GitHub 주소', type: 'text', hint: '비우면 GitHub 버튼이 사라집니다.' }
      ]
    },
    {
      key: 'nav', label: '헤더 목차',
      desc: '상단 메뉴와 모바일 메뉴에 쓰이는 이름입니다.',
      fields: [
        { key: 'about', label: '자기소개', type: 'i18n' },
        { key: 'projects', label: '프로젝트', type: 'i18n' },
        { key: 'skills', label: '핵심역량', type: 'i18n' },
        { key: 'career', label: '경력', type: 'i18n' },
        { key: 'play', label: '플레이 경험', type: 'i18n' },
        { key: 'contact', label: '연락처', type: 'i18n' }
      ]
    },
    {
      key: 'hero', label: '첫 화면',
      desc: '방문자가 가장 먼저 보는 화면입니다.',
      fields: [
        { key: 'eyebrow', label: '작은 라벨', type: 'i18n' },
        { key: 'titleHtml', label: '큰 제목', type: 'html', area: true, tall: true,
          hint: '<span class="accent">보라색</span> · <span class="name">밑줄</span> · <br> 줄바꿈 을 쓸 수 있습니다.' },
        { key: 'sub', label: '설명 문장', type: 'i18n', area: true },
        { key: 'ctaPrimary', label: '주 버튼 문구', type: 'i18n' },
        { key: 'ctaSecondary', label: '보조 버튼 문구', type: 'i18n' },
        { key: 'badge', label: '상태 배지', type: 'i18n' },
        { key: 'updated', label: '업데이트 표기', type: 'i18n' }
      ]
    },
    {
      key: 'stats', label: '숫자 요약', type: 'list',
      desc: '첫 화면 아래 네 칸의 숫자입니다. 개수는 자유롭게 늘리거나 줄일 수 있습니다.',
      itemName: function (it) { return (it.num || '') + ' ' + (it.label && it.label.ko || ''); },
      template: function () { return { num: '', unit: i18n(), label: i18n() }; },
      fields: [
        { key: 'num', label: '숫자', type: 'text', hint: '예: 300K, 7, 10' },
        { key: 'unit', label: '단위', type: 'i18n', hint: '예: 종 / titles, +, 년 / yrs' },
        { key: 'label', label: '설명', type: 'i18n' }
      ]
    },
    {
      key: 'about', label: '01 자기소개',
      fields: [
        { key: 'title', label: '섹션 제목', type: 'i18n', area: true },
        { key: 'lead', label: '섹션 설명', type: 'i18n', area: true },
        { key: 'cards', label: '카드', type: 'list',
          itemName: function (it) { return it.title && it.title.ko || '카드'; },
          template: function () { return { index: '', title: i18n(), body: i18n() }; },
          fields: [
            { key: 'index', label: '카드 위 영문 라벨', type: 'text', hint: '예: DEFINE' },
            { key: 'title', label: '제목', type: 'i18n' },
            { key: 'body', label: '내용', type: 'i18n', area: true }
          ] },
        { key: 'quote', label: '인용 문구', type: 'i18n', area: true },
        { key: 'quoteBy', label: '인용 출처', type: 'i18n' }
      ]
    },
    {
      key: 'projects', label: '02 프로젝트', type: 'list',
      desc: '프로젝트를 추가하면 상세 페이지가 자동으로 생깁니다. id 는 주소에 쓰이므로 영문 소문자와 하이픈을 권합니다.',
      itemName: function (it) { return it.title && it.title.ko || it.id || '프로젝트'; },
      template: function () {
        return {
          id: '', title: i18n(), sub: i18n(), tags: [], kv: [], bullets: [], footNote: i18n(),
          detail: { sub: i18n(), kv: [], problem: i18n(), approach: i18n(), results: [], retrospective: i18n(), quote: i18n() }
        };
      },
      fields: [
        { key: 'id', label: '주소용 id', type: 'text', hint: '예: league-of-defense (영문 소문자·하이픈)' },
        { key: 'title', label: '프로젝트 이름', type: 'i18n' },
        { key: 'sub', label: '한 줄 소개', type: 'i18n' },
        { key: 'tags', label: '태그', type: 'list',
          itemName: function (it) { return it.text && it.text.ko || '태그'; },
          template: function () { return { text: i18n(), tone: '' }; },
          fields: [
            { key: 'text', label: '태그 문구', type: 'i18n' },
            { key: 'tone', label: '색', type: 'select',
              options: [ ['', '기본 (흰색)'], ['lavender', '라벤더'], ['butter', '연노랑'], ['blush', '연분홍'], ['cornflower', '파랑'] ] }
          ] },
        { key: 'kv', label: '정보 표 (목록 카드)', type: 'list',
          itemName: function (it) { return (it.k && it.k.ko || '') + ' : ' + (it.v && it.v.ko || ''); },
          template: function () { return { k: i18n(), v: i18n() }; },
          fields: [ { key: 'k', label: '항목', type: 'i18n' }, { key: 'v', label: '내용', type: 'i18n' } ] },
        { key: 'bullets', label: '요약 문장', type: 'i18nList', area: true,
          hint: '<b>굵게</b> 를 쓸 수 있습니다.' },
        { key: 'footNote', label: '카드 하단 한 줄', type: 'i18n' },
        { key: 'detail', label: '상세 페이지', type: 'group',
          fields: [
            { key: 'sub', label: '상세 페이지 소개', type: 'i18n', area: true, hint: '비우면 위의 한 줄 소개를 씁니다.' },
            { key: 'kv', label: '상세 정보 표', type: 'list',
              itemName: function (it) { return (it.k && it.k.ko || '') + ' : ' + (it.v && it.v.ko || ''); },
              template: function () { return { k: i18n(), v: i18n() }; },
              fields: [ { key: 'k', label: '항목', type: 'i18n' }, { key: 'v', label: '내용', type: 'i18n' } ] },
            { key: 'problem', label: '문제 정의', type: 'i18n', area: true, tall: true, hint: '비우면 “작성 예정”으로 표시됩니다. 빈 줄로 문단을 나눕니다.' },
            { key: 'approach', label: '접근', type: 'i18n', area: true, tall: true, hint: '비우면 “작성 예정”으로 표시됩니다.' },
            { key: 'results', label: '결과 숫자', type: 'list',
              itemName: function (it) { return (it.num || '') + ' ' + (it.label && it.label.ko || ''); },
              template: function () { return { num: '', unit: i18n(), label: i18n() }; },
              fields: [
                { key: 'num', label: '숫자', type: 'text' },
                { key: 'unit', label: '단위', type: 'i18n' },
                { key: 'label', label: '설명', type: 'i18n' }
              ] },
            { key: 'retrospective', label: '다시 한다면', type: 'i18n', area: true, tall: true, hint: '비우면 “작성 예정”으로 표시됩니다.' },
            { key: 'quote', label: '마무리 인용', type: 'i18n', area: true, hint: '비우면 표시되지 않습니다.' }
          ] }
      ]
    },
    {
      key: 'projectNotes', label: '02-1 진행 중 카드', type: 'list',
      desc: '프로젝트 목록 아래의 작은 카드입니다. 필요 없으면 모두 삭제해도 됩니다.',
      itemName: function (it) { return it.label && it.label.ko || '카드'; },
      template: function () { return { label: i18n(), body: i18n() }; },
      fields: [
        { key: 'label', label: '작은 라벨', type: 'i18n' },
        { key: 'body', label: '내용', type: 'html', area: true, hint: '<b>굵게</b> 를 쓸 수 있습니다.' }
      ]
    },
    {
      key: 'skills', label: '03 핵심역량',
      fields: [
        { key: 'title', label: '섹션 제목', type: 'i18n', area: true },
        { key: 'lead', label: '섹션 설명', type: 'i18n', area: true },
        { key: 'cards', label: '역량 카드', type: 'list',
          itemName: function (it) { return it.title && it.title.ko || '역량'; },
          template: function () { return { title: i18n(), body: i18n(), tags: [] }; },
          fields: [
            { key: 'title', label: '제목', type: 'i18n' },
            { key: 'body', label: '설명', type: 'i18n', area: true },
            { key: 'tags', label: '도구 태그', type: 'i18nList' }
          ] }
      ]
    },
    {
      key: 'career', label: '04 경력 · 활동',
      fields: [
        { key: 'heading', label: '섹션 라벨', type: 'i18n' },
        { key: 'title', label: '섹션 제목', type: 'i18n', area: true },
        { key: 'lead', label: '섹션 설명', type: 'i18n', area: true },
        { key: 'items', label: '경력 항목', type: 'list',
          itemName: function (it) { return (it.date && it.date.ko || '') + ' · ' + (it.role && it.role.ko || ''); },
          template: function () { return { now: false, date: i18n(), role: i18n(), org: i18n(), body: i18n(), tags: [] }; },
          fields: [
            { key: 'now', label: '현재 진행 중 (초록 점 표시)', type: 'bool' },
            { key: 'date', label: '기간', type: 'i18n' },
            { key: 'role', label: '역할 · 제목', type: 'i18n' },
            { key: 'org', label: '소속 · 부제', type: 'i18n' },
            { key: 'body', label: '설명', type: 'i18n', area: true },
            { key: 'tags', label: '태그', type: 'i18nList' }
          ] }
      ]
    },
    {
      key: 'play', label: '05 플레이 경험',
      fields: [
        { key: 'title', label: '섹션 제목', type: 'i18n', area: true },
        { key: 'lead', label: '섹션 설명', type: 'i18n', area: true },
        { key: 'cards', label: '게임 카드', type: 'list',
          itemName: function (it) { return it.name && it.name.ko || '게임'; },
          template: function () { return { name: i18n(), hours: i18n(), genre: i18n(), noteLabel: { ko: '기획자의 메모', en: "DESIGNER'S NOTE" }, note: i18n() }; },
          fields: [
            { key: 'name', label: '게임 이름', type: 'i18n' },
            { key: 'hours', label: '플레이타임', type: 'i18n', hint: '예: 1,000h / 시리즈 전작' },
            { key: 'genre', label: '장르 · 플랫폼', type: 'i18n' },
            { key: 'noteLabel', label: '메모 라벨', type: 'i18n' },
            { key: 'note', label: '메모 내용', type: 'i18n', area: true }
          ] },
        { key: 'tags', label: '하단 태그', type: 'list',
          itemName: function (it) { return it.text && it.text.ko || '태그'; },
          template: function () { return { text: i18n(), tone: '' }; },
          fields: [
            { key: 'text', label: '태그 문구', type: 'i18n' },
            { key: 'tone', label: '색', type: 'select',
              options: [ ['', '기본 (흰색)'], ['lavender', '라벤더'], ['butter', '연노랑'], ['blush', '연분홍'], ['cornflower', '파랑'] ] }
          ] }
      ]
    },
    {
      key: 'contact', label: '06 연락처',
      desc: '버튼은 기본 정보의 이력서 경로 · 이메일 · GitHub 값에 따라 자동으로 만들어집니다.',
      fields: [
        { key: 'title', label: '섹션 제목', type: 'i18n', area: true },
        { key: 'lead', label: '섹션 설명', type: 'i18n', area: true }
      ]
    }
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
     4. 화면 그리기
     ====================================================================== */
  function rerender() {
    var side = $('#side');
    side.innerHTML = '';
    SCHEMA.forEach(function (sec) {
      var b = el('button', 'e-side__btn' + (sec.key === currentSection ? ' is-active' : ''), sec.label);
      b.type = 'button';
      b.addEventListener('click', function () { currentSection = sec.key; rerender(); window.scrollTo(0, 0); });
      side.appendChild(b);
    });

    var spec = SCHEMA.filter(function (s) { return s.key === currentSection; })[0] || SCHEMA[0];
    var panel = $('#panel');
    panel.innerHTML = '';

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
  function toSource(obj) {
    return '/* ============================================================================\n' +
      '   포트폴리오 내용 파일  ·  edit.html 에서 내보낸 파일입니다.\n' +
      '   이 파일을 assets/content.js 에 덮어쓰면 사이트에 반영됩니다.\n' +
      '   내보낸 시각: ' + new Date().toLocaleString('ko-KR') + '\n' +
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
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.PORTFOLIO_CONTENT) {
      document.body.innerHTML = '<p style="padding:40px">assets/content.js 를 불러오지 못했습니다.</p>';
      return;
    }

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

    rerender();
    setStatus(localStorage.getItem(DRAFT_KEY) ? '이전에 편집하던 내용을 불러왔습니다' : '준비됨', false);

    window.addEventListener('beforeunload', function () {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) {}
    });
  });
})();
