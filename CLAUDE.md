# PortfolioSite — 작업 규칙

빌드 도구 없는 정적 사이트. 내용(`assets/content.js`)과 화면(`assets/js/render.js`)이
분리되어 있고, 모든 문장은 `{ ko, en }` 형태입니다.

## 이중언어(KO/EN) 유지 규칙 — 필수

`assets/content.js`(또는 다른 곳)의 **한국어(ko) 텍스트를 추가·수정·삭제할 때마다**,
그 즉시 대응하는 **영어(en) 텍스트도 함께 검수·수정**한다. 다음을 지킨다:

1. ko 를 바꾸면 같은 항목의 en 을 바로 새 의미에 맞게 갱신한다 (빈 값·옛 문구 방치 금지).
2. 편집을 마치기 전에 `content.js` 전체의 `{ ko, en }` 쌍을 훑어 **의미가 어긋나거나
   오래된 en 이 없는지 검수**한다. 특히 로그라인·소개 문구처럼 자주 바뀌는 항목.
3. en 은 ko 의 뜻·톤을 살린 자연스러운 번역으로 쓴다 (기계적 직역·미완성 문장 금지).
4. 새 `{ ko, en }` 항목을 만들 때 en 을 비워 두지 않는다.

> en 을 비우면 영어 화면에서 한국어가 그대로 노출되므로, 항상 채워 둔다.

## 시각 편집기 (edit.html)

화면을 직접 눌러 고치는 편집기입니다. 저장 위치는 셋으로 나뉩니다:

| 무엇을 | 어디에 | 키 |
|---|---|---|
| 글자 | `assets/content.js` | `data-e` 앵커 경로 (예: `projects.items.0.title`) |
| 색·크기·여백·위치·숨김 | `assets/overrides.js` → `styles` / `layout` / `hidden` / `theme` | 편집기가 만든 CSS 선택자 |
| 새로 만든 요소 (제목·문단·이미지·버튼·상자·구분선·여백) | `assets/overrides.js` → `blocks` | `data-blk` id · `after`/`before` 앵커 |
| 올린 사진 | `assets/img/ve-*.jpg\|png` | 저장 시 data URI → 파일로 변환해 함께 업로드 |

- 파일 역할: `overrides.js` = **순수 데이터**(편집기가 통째로 덮어씀) · `skin.js` = 그 데이터를 적용하는 코드
  (토큰·규칙 주입 + `blocks` 렌더). 모든 페이지가 `content.js → overrides.js → skin.js → render.js → main.js` 순으로 읽습니다.
- `render.js` 의 `ep(path)` 가 `data-e` 앵커를 심습니다. 텍스트 요소를 새로 추가하면 `ep('경로')` 를
  함께 붙여야 편집기에서 글자를 고칠 수 있고, 목록 항목은 콜백에 인덱스(`i`)를 받아 경로에 넣습니다.
- 사진 자리(프로필·프로젝트/활동 썸네일·게임 아이콘)는 content 의 `photo` / `thumb` / `icon` 필드입니다.
  새 이미지 필드를 추가하면 `visual-editor.js` 의 `photoSlotFor()` 에도 매핑을 넣어 주세요.
- `main.js` 는 편집기가 프레임을 실시간으로 다시 그릴 수 있도록 `window.PortfolioApp`
  (`setContent` / `rerender` / `setLang` / `setTheme`) 을 노출하고, `render()` 끝에서 `renderBlocks()` 를 부릅니다.
- 편집기에서 한국어를 고치면 같은 항목의 English 칸도 함께 채워야 합니다 (위 이중언어 규칙).

## 디자인 테마(스킨) — `assets/js/themes.js` · `assets/css/themes/`

기본 디자인(`style.css`) 위에 덧입히는 스킨 체계입니다. 테마 8종 · 시안 49개.
(`pixel` · `brutal` · `brand` · `concept` · `editorial` · `hud` · `storybook` · `fantasy`)
`pixel-fc-3d`(제품 사진) · `pixel-fc-8bit`(도트 아트) · `pixel-fc-boxart`(박스아트) 는 패미컴 콘셉트(게임기 화면·카트리지 꽂기·빨강)는 지키고 **디자인 언어를 새로 만든 안**입니다(각자 `pixel-fc-*.css` + `pixel-fc-*.js`, 원본 `famicom.js` 와 별개 · 카트리지 1클릭 꽂기 후 바로 상세).
`pixel-fc-clay` · `pixel-fc-toon` · `pixel-fc-airbrush` 는 제품 사진 안과 같은 구도(기울어진 게임기 + 그 밑 같은 기울기의 카트리지 진열판 `.ps-rig`)에 그림체만 바꾼 안이고,
`pixel-fc-pixel` 은 제품 사진 안을 실제로 렌더해 **픽셀 아트로 변환한 그림**(`assets/img/themes/fc-pixel/*.png`)을 입힌 안입니다 —
원본 그림이 바뀌면 `tools/fc-pixel/capture.js`(부품 따기) → `pixelize.py`(4px 격자·12색·외곽선) 두 줄로 다시 뽑습니다(사용법은 파일 맨 위 주석, 글자·사진은 변환하지 않음).
`pixel-fc-classic`(정돈) · `pixel-fc-px3d`(3D 픽셀) · `pixel-fc-voxel`(복셀) 은 **원본 패미컴 디자인**을 공용 `assets/js/themes/fc-stage.js` 의 기울인 구도(왼쪽 큰 제목 · 오른쪽 기울어진 게임기 · 그 밑 같은 기울기의 카트리지 진열판 `.fcs-rig`)에 올린 안입니다(카트리지 꽂기·개요 흐름은 famicom.js 복제본 그대로).
3D 픽셀(`pixel-fc-px3d`)은 자동 변환이 아니라 `tools/fc-pixel/sprites.py` 가 도트를 규칙대로 찍어 만든 **스프라이트**이고(입체는 그림 안 3/4 시점 — 도트가 깨지지 않게 이 안만 판을 CSS 로 기울이지 않음, 도트 한 칸 = 4px),
복셀의 그림은 `tools/fc-pixel/capture-fc.js` → `render3d.py voxel` 로 만들고, 게임기는 화면 높이에 따라 크기가 바뀌므로 9조각 border-image 로 붙이며 붙이는 CSS(`pixel-fc-<안>-parts.css`)도 자동 생성됩니다. 시안 항목의 `scripts` 는 테마 공통 스크립트 뒤에 그 시안에서만 읽힙니다.
`pixel-fc-icon`(픽셀 아이콘) · `pixel-fc-dot`(도트) · `pixel-fc-blueprint`(설명서) · `pixel-fc-flat`(플랫 일러스트) · `pixel-fc-ukiyo`(레트로 판화) · `pixel-fc-iso`(아이소) · `pixel-fc-line`(컬러 선화) · `pixel-fc-snes`(고해상 도트) · `pixel-fc-kraft`(크라프트) · `pixel-fc-level`(스테이지) 는 정돈 안을 복제해 **사용자가 준 참고 그림 한 장씩의 색·화풍**을 입힌 안입니다 — 구도(fc-stage.js 의 기울인 판)·패미컴 실루엣·빨강 중심 색·꽂기 동작은 그대로이고, 화풍은 첫 화면만이 아니라 메뉴·절·카드·표·푸터·하위 페이지까지 **사이트 전체의 디자인 규칙**으로 입힙니다(그림 속 소품을 그대로 붙이지 않음 · 상표/기존 게임 캐릭터 금지). 장식 DOM 은 각 안의 JS 가 시안 id 일 때만 붙입니다.
이 중 `pixel-fc-dot` · `pixel-fc-kraft` · `pixel-fc-level` 은 900px 이상에서 게임기 몸통을 상자 조각 대신 **SVG 그림 한 장**(`assets/js/themes/fc-body.js`, viewBox 1000×500)으로 그립니다 — 손잡이·화면 자리는 각 안 CSS 가 같은 숫자(cqw, 판 `.fcs-rig` 가 크기 기준)로 맞추고, 도트 그림은 칸 격자에 칠한 뒤 외곽선을 실루엣 가장자리로 계산해 모서리에서 선이 끊기지 않게 합니다. 그림 숫자를 바꾸면 CSS 의 손잡이 폭(13cqw)·화면 여백도 함께 바꾸세요.
`pixel-fc-gold`(기념판) · `pixel-fc-metal`(하드웨어) · `pixel-fc-museum`(전시) 는 닌텐도 · 패미컴 레트로 감성 R&D 로 새로 만든 안입니다(조사 · 근거는 `docs/rnd-claude-retro.md`). 정돈 안을 복제해 시작했고 게임기 몸통은 `fc-body.js` 의 벡터 그림, 첫 화면 왼쪽 장식(월계관 엠블럼 · 사양 명판 · 작품 캡션)은 각 안의 JS 가 붙입니다.
같은 R&D 를 Codex 가 따로 진행한 결과가 `pixel-fc-laureate`(기념 선집) · `pixel-fc-gallery`(소장품 전시) · `pixel-fc-rally`(랠리 프린트) 이고(조사 노트 `docs/rnd-codex-retro.md`), 게임기 몸통 SVG 는 fc-body.js 가 아니라 각 안의 JS 안에 따로 있습니다.
`hud-launcher` 는 `assets/js/themes/hud.js` 로 상단 시계·하단 컨트롤러 바(Ⓐ 프로젝트 · Ⓑ 맨 위로 · Ⓨ 화면 모드)를 붙입니다.

**포트폴리오 다듬기(10회차) — 도트 · 크라프트 · 스테이지 · 랠리 프린트** 네 안은 시안 CSS 뒤에 공용 파일
`assets/css/themes/pixel-fc-folio.css` 를 하나 더 읽습니다(시안 항목의 `css: [...]`). 이 파일이 네 안의 '포트폴리오다운' 뼈대를 같은 규칙으로 맞추고,
안별 조정도 파일 아래쪽 안 이름 절에 모았습니다(회차마다 덧쌓인 시안 CSS 를 고치는 대신 뒤에서 덮습니다 — 특이도는 `:root[data-skin…]` 로 맞춤).
- 첫 화면 왼쪽 = 눈썹 → 큰 제목 → 읽히는 안내 한 줄(15px) → **이력서 숫자 줄 `.fcs-facts`**. 숫자 줄은 `fc-stage.js` 가 `content.js` 의 `resume.stats`
  (`{num, unit, label}` ko/en)로 그리므로 숫자를 바꾸려면 이력서 쪽만 고치면 됩니다(`FOLIO` 목록의 안 · 홈에서만). 예전의 첫 화면 소품
  (도트 패드 · 크라프트 컨트롤러 스티커 · 스테이지 블록 줄 · 랠리 사선 엠블럼)은 빼고 다시 붙이지 않습니다.
- 정렬: 첫 화면 판(`.fcs-stage`)과 아래 모든 절(`main .section > .wrap`) · 푸터가 같은 폭 `--folio-max`(1240px) · 같은 왼쪽 선. 절의 `.wrap` 안쪽 여백은 건드리지 않습니다
  (스테이지만 시안 CSS 가 여백을 0 으로 두어 folio 쪽에서 `--gutter` 를 넣어 맞춥니다).
- 본문은 15px 이상, 도트 글꼴은 로고 · 큰 제목 · 이름표 · 숫자에만. 절 끝 '더 보기'(`.hp-more`)는 떠 있는 버튼이 아니라 오른쪽 글자 링크.
- 크라프트: 선로는 첫 절 제목부터 내려가는 가는 선 하나(첫 화면을 감던 고리 · 여백 스티커 없음). 스테이지: 절 사이 구름 없음, 큰 글자는 외곽선 없이 그림자 하나. 랠리: 절 사이 전폭 구분선 없음.

**게임 UI(11회차)** — 같은 파일의 '게임 UI' 절이 첫 화면 아래까지 게임 메뉴 화면의 문법으로 바꿉니다. 공용 절은 **배치만** 맡고,
창 · 이름표 · 칸을 그리는 **재료는 각 안이 원래 쓰던 카드 재료**로 채웁니다(1차에서 네 안을 '얇은 테 + 겹선 + 점선' 한 가지로 그렸다가 "디자인 퇴보" 평을 받음 — 재료를 한 가지로 통일하지 마세요).
- 창 = 절 하나(홈의 `.hpl` · `.hp-skills` · `.strengths` · `.hp-games`, 하위 페이지의 `.stat-grid` · `.profile` · `.skill-card` · `.timeline` · `.cover-block` · `.steam` · `.play` · 상세의 `.detail__learned` · `.quest-strip` · `.media-box` · `.block` · `.pager__item`).
  재료 토큰: 면 `--gui-face`(겹친 배경 가능) · 테 `--gui-frame` · 그림자 `--gui-shadow` · 안쪽 위 여백 `--gui-pad-top`(스테이지 벽돌 턱) · 구분선 `--gui-sep` ·
  이름표 `--gui-tab-*` · 항목 이름 `--gui-title-font` · 번호 `--gui-num-font` · 인벤토리 칸 `--gui-slot*`. 창 안 항목은 자기 상자 · 그림자 · 두께 면을 벗지만
  아이콘 칸 · 썸네일 · 태그 칩 · 표는 각 안의 원래 모양을 그대로 씁니다. 새 목록 · 패널을 추가하면 이 창 목록과 '창 안 항목' 목록에도 넣으세요.
- 이름표: 홈 절 제목 · 자기소개서 요약 제목은 바로 아래 창 윗변에 걸리고(`margin-bottom: -탭높이/2`), 하위 페이지 절 제목은 같은 모양의 독립 이름표
  (페이지 첫 절의 제목은 페이지 제목이라 이름표로 만들지 않음 — `main > .section:not(:first-of-type)`). 같은 말을 되풀이하던 하위 페이지 눈썹 칩은 접습니다.
- 창 안 배치: 대외 활동 = 퀘스트 목록 · 보유 기술 = 인벤토리 세 칸(줄이 덜 차면 `::before/::after` 로 빈 칸 — 칸 수는 `:nth-child(… of .hp-skill):last-of-type` 로 셈, 도트는 창 끝에 두께 면 span 이 붙기 때문) · 강점 = 업적 세 칸 · 게임플레이 = 번호(`counter`) 붙은 저장 슬롯 · 경력의 진행 중인 줄과 프로젝트 분류 탭의 고른 칸에 ▶.
- 게임기 화면: `fc-stage.js` 의 `screenBar()` 가 '1P · 플레이어 선택 / 플레이어 정보' 띠(`.gui-scr`, 문구는 `SCREEN` 의 ko/en)를 붙이고, 한마디는 대화창(끝에 ▼),
  버튼 두 개는 ▶ 커서 세로 메뉴(첫 줄 기본 선택, 마우스 · 초점이 가면 커서가 옮겨 감). 깜빡임 · 흔들림은 모션 최소화 설정에서 끕니다. 액정은 다크에서도 밝아 글자색은 `--gui-scr-*`
  (스테이지만 900px 미만 다크에서 액정이 어두워져 밝은 글자).
- 진열판은 980px 이상에서 덱 + 3장(`.draw__cards > :nth-child(n+4)` 숨김) — 카트리지가 커지고 판이 조용해집니다. 카드 안쪽 칸은 그대로.
- 안별 창(원래 재료): 도트 = 흰 면 + 검은 4px 테 + 게임기 · 카드와 같은 회색 두께 면(`pixel-fc-dot.js` 의 `faces` 목록에 창도 들어 있음) · 굵은 도트 글꼴 검은 이름표 왼쪽에 크림 번호 칸
  (`.fcd-part-no`, 제목이 있는 절에만) · 다크는 어두운 들판 위 크림 부품 /
  크라프트 = 외곽선 없는 둥근 크림 라벨(오른쪽 위 타공) · 이름표는 라벨에서 이어져 올라온 폴더 탭(진홍 라벨 활자) · 업적 칸 위 거대한 진홍 숫자 /
  스테이지 = 벽돌 턱 한 줄 + 크림 판 + 남색 테 발판 · 인벤토리 칸은 주황 물음표 블록(빈 칸 = 다 쓴 블록) · 남색 이름표 + 물음표 블록(하늘 위 작은 글자는 `--gui-sky-ink` 남색) /
  랠리 = 빨강 8px 윗띠 + 검은 2px 테 + 노랑 판화 그림자 · 사선으로 자른 검은 이름표 + 노랑 줄 · 업적 태그는 검은 칩.
- **스테이지 땅 위 · 땅 밑(12회차)**: 하늘은 첫 화면(하위 페이지는 페이지 머리)까지만이고, 그 아래는 지면(슈퍼 마리오 브라더스의 **땅 블록** 두 단) → 검은 지하가 푸터까지 이어집니다.
  지면 높이는 `pixel-fc-level.js` 맨 아래 블록이 재서 `main` 의 `--lv-surface` 로 넣고(첫 화면 `.home-screen`/`.fcs-stage` 아래, 없으면 첫 절 머리 아래 + 144px — 그 사이 128px 띠에 언덕 · 덤불 · 관, 상세는 0),
  `main::before` 가 그립니다. 홈은 같은 블록이 개요 절들을 `.lv-menu` 하나에 담아 위 줄 퀘스트(7) + 인벤토리(5), 아래 줄 업적 · 저장 슬롯(각자 한 줄 전체)으로 놓습니다(15회차부터 홈에서는 숨김 — 아래 타이틀 화면).
  지하의 창 밖 글자는 밝은 토큰(`--lv-under-*`), 하늘 위 페이지 머리만 남색입니다. 하위 페이지는 인적사항 두 단 · 핵심역량 한 줄 · 경력 날짜 칸 | 내용 · 자기소개서 2 × 2.
- **스테이지 월드 문법(13회차)**: 첫 화면 맨 위 점수판(이력서 숫자 줄을 `pixel-fc-level.js` 의 `hud()` 가 `.home-screen` 맨 앞으로 옮김, `.lv-hud`) ·
  구름 둘(`.home-screen::before`) · 제목 밑 떠 있는 벽돌 · 물음표 블록 + 동전(`.fcs-intro::after`, 900px 이상) · 지면 위 언덕 · 덤불 · 관(`.home-screen::after`) ·
  지하 바닥의 파란 지하 땅 블록 + 나가는 관(`main::after`, main 아래 여백 안) · 인벤토리 블록이 올리면 튀어 오름. 소품 그림(`--lv-ground` · `--lv-uground` · `--lv-bricks` · `--lv-brick` · `--lv-qblock` · `--lv-pipe` · `--lv-hill` · `--lv-bush` · `--lv-cloud` · `--lv-coin` · `--lv-coin-s`)은
  `tools/fc-pixel/stage-props.py` 의 문자 격자(한 칸씩 찍은 그림)로 뽑습니다. **스테이지는 내 마음대로 만들지 않고 슈퍼 마리오 브라더스(1985) 1-1 · 1-2 의 문법을 따릅니다**(사용자 지시):
  색은 원작 롬의 팔레트 묶음(GroundPaletteData · UndergroundPaletteData — 초록 $29/$1A, 땅 · 벽돌 $36/$17, 구름 $30/$21, 물음표 블록 $27/$17, 지하 $3C/$1C, 하늘 $22, 지하 바탕 검정),
  모든 그림 = 같은 4px 칸(원작 1픽셀) + 검은 외곽선, 땅은 벽돌이 아니라 땅 블록, 관 = 땅 블록 두 개 폭. 원작 그림을 베끼지 않고 같은 문법으로 새로 찍습니다. 그림은 원래 크기(1배)로만 쓰고 줄이거나 늘리지 않습니다. 도트 글꼴도 제 격자 배수로만
  (Press Start 2P 8의 배수 · Galmuri14 14의 배수 · Galmuri11 11의 배수), 그림자 · 음영은 4px 단위. 고친 뒤에는 `tools/fc-pixel/stage-audit.mjs`(로컬 서버 8822)로 어긋난 곳이 0건인지 확인하세요. **마리오 · 굼바 등 캐릭터, 버섯 · 별 등 아이템, 닌텐도 · 마리오 로고는 그리지 않습니다** — 지형 · 소품 · 점수판 같은 월드 문법만.
  소품은 글자와 겹치지 않는 자리에만 둡니다.
- **스테이지 본문 시인성(14회차)**: 창은 땅 블록이 다 어두워진 뒤의 검정 위에서 시작합니다(지면 그라데이션 112 → 216px, 홈 `.lv-menu` 위 여백 200px,
  하위 페이지 첫 절 머리 아래 336px — `pixel-fc-level.js` 의 지면 = 머리 아래 144px 과 짝). 본문 16px / 1.75 · 항목 이름 20~22px · 작은 이름표 13~15px 굵게,
  흐린 글자 `--level-panel-muted` #3d4050(다크 #dfe5f0). 좁은 칸에 글을 나란히 놓지 않습니다 — 홈 업적 · 저장 슬롯은 한 줄 전체, 이력서 핵심역량은 한 장 = 한 줄(이름 | 설명 | 로고).
- **스테이지 홈 = 타이틀 화면(15회차)**: 홈에서는 아래 개요(`.lv-menu`) · 진열판 · 푸터를 숨기고 첫 화면 한 장(점수판 · 제목 · 기울어진 게임기 · 지면)만 둡니다.
  게임기를 누르거나 · 아래로 밀거나(휠 · 마우스 끌기 · 손가락 쓸기 — 페이지 맨 아래에서만) · A · ↓ · Enter 를 누르면 게임기가 기울기 없이 똑바로 서며 화면 가득 커지고(FLIP — 판 `.fcs-rig` 의 처음 · 나중 상자를 재서 되돌려 그림),
  게임기 화면에는 페이지 메뉴(`.lv-msel`, 상단바 링크 + 연락하기 · ◀ ▶ / ↑ ↓ 고르기 · A 결정 · B · Esc · 맨 위에서 위로 밀기 = 타이틀), 그 아래 진열판에 카트리지가 깔립니다(덱을 눌러 뽑기 연출).
  상태는 `body[data-lv="title" | "menu"]` 하나(홈 · 스테이지에서만, 언어 전환에도 유지)이고 코드는 `pixel-fc-level.js` 맨 아래 블록 · 그림은 `pixel-fc-folio.css` 15회차 절입니다.
  손잡이 키는 위쪽 `step` · `pressA` · `pressB` 가 `window.__lvTitle` 에 먼저 물어봅니다. 메뉴 설명 문구는 같은 블록의 `T.desc`(ko/en). 모션 최소화면 바로 바뀝니다.
- **스테이지 게임기 = 패미컴 생김새(16회차)**: 900px 이상은 `fc-body.js` 의 `stageArt()`(200 × 100칸 격자 그림 한 장) — 크림 몸통 · 양옆 자주 컨트롤러(금색 앞판) · 십자 버튼 · 고무 버튼(메일) · 빨강 B A ·
  윗면 스위치 · 전원등 · 짙은 회색 화면 테 · 아래 자주 띠(카트리지 구멍 · 스피커) · 오른쪽 아래 두께. 누르는 키(`.fc-key`)는 그림의 같은 자리에 **투명하게 겹친 단추**(cqw)라,
  그림의 부품 자리를 옮기면 `pixel-fc-folio.css` 16회차 절의 키 · 인쇄 글자(`.fc-lbl`, 금색 앞판 위 자주 #6e1416 · 11px, 판 폭 1000px 이상 22px) 자리도 함께 옮기세요.
  900px 미만(세운 휴대기)은 같은 재료를 CSS 로 짓습니다 — 몸통 9조각 · 십자 · 고무 · B A 그림은 `tools/fc-pixel/stage-props.py` 의 `c-*`(→ `--lv-c-*`, 4px 칸 한 배),
  조작부 자리는 px(높이 92 = 테 4 · 자주 8 · 금색 판 68 · 자주 8 · 테 4, 360px 이하는 따로 좁힘). B · A 는 키 자신이 버튼 그림(누르면 `--lv-c-btn-dn`).
- **스테이지 게임기 픽셀 규칙(17회차)**: 그림은 200칸 폭이라 판(`.fcs-rig`) 폭이 '200 × 기기 픽셀 정수'가 아니면 칸 크기가 들쭉날쭉해 외곽선이 깨집니다 —
  `pixel-fc-level.js` 의 `snapRig()` 가 판 폭을 정수 칸에 맞춰 `--lv-rig-w` 로 넣고(메뉴는 늘 · 7%까지 커지는 쪽 허용, 메뉴는 왼쪽 끝도 기기 픽셀 경계로 `--lv-rig-dx`,
  타이틀은 옆 틈 40px 안에서 넓히되 10% 넘게 줄어야 하면 그대로), 상태가 바뀔 때는 FLIP 이 나중 상자를 재기 전에 부릅니다. 키 · 인쇄 글자 자리는 모두 칸(0.5cqw) 단위로.
  둥근 버튼처럼 원 공식으로 겹쳐 칠하면 테가 끊기니 문자 격자로 손으로 찍고(`stageArt` 의 `BTN` · `spr()`), 몸통 · 손잡이의 빛 · 그늘은 실루엣 외곽선 바로 안쪽 한 칸을
  따라 한 번에 칠합니다(위 · 왼쪽 밝게, 아래 · 오른쪽 어둡게 — 따로 줄을 긋지 않음). 좁은 화면 몸통 두께는 이음매 선 + 자주 2칸 + 바깥 선(9조각 28 · 32 · 32 · 28).
- **스테이지 게임기 그림 갈래(18회차)** — `pixel-fc-level-riso` · `-cutpaper` · `-ink` · `-gouache` · `-mecha` 는 스테이지 시안 그대로에 **게임기 그림만** 바꾼 안입니다.
  `themes.js` 시안 항목의 `base: 'fc-level'` 이 그 시안의 CSS · `data-skin` 을 그대로 쓰게 하고(파일 복제 없음), `art: '<이름>'` 이 `<html data-skin-art>` 로 찍혀
  `fc-body.js` 가 `fc-level-art.js`(도트 데이터 → SVG) + `fc-level-art-<이름>.js`(데이터) 로 그립니다. 그림은 **Codex 가 규격만 받고 그린 '도트가 아닌 그림'**
  (지시서 `docs/design-log/briefs/r18-console-art/BRIEF-2.md` — 색은 검정 · 빨강 · 금색, 4차부터 **도트 팔레트 색만 쓴 평평한 그림**: 면마다 세 단계 · 8px 외곽선 · 질감 없음)을
  Codex 가 함께 남긴 **벡터 원본(SVG)** 을 `tools/fc-pixel/svg-console.py` 가 칸 격자에 직접 찍은 것이고(부품마다 면 · 빛 · 그늘 면 · 한 칸 외곽선, 둥근 버튼은 대칭 원,
  손잡이 판은 몸 가장자리와 같은 간격 · 그림 1(리소)은 Codex 5차로 마감 품질을 올린 판 — PNG 만 있을 때는 `pixelize-console.py --look <이름> --flat`: 면 색은 칸 가운데에서 그대로, 외곽선은 그림 선의 한가운데를 따서 한 칸 · 디더 없음 —
  사용자: "더 단순하고 깔끔한 도트". 질감 있는 그림을 칸마다 고르면 "해상도만 낮춘 그림" · 조각난 그림이 되니 그림 쪽을 평평하게 받습니다. 팔레트는 파일의 `RAMPS`),
  화면 속 내용 · 투명 키 · 인쇄 글자 자리는 Codex 가 잰 부품 자리(controls.json)로 `tools/fc-pixel/console-art-css.py` 가 뽑은 `pixel-fc-level-art.css` 가 그림마다 맞춥니다
  (사용자 지시: "기본 그림은 Codex 에게, 너는 그림에 직접 개입하지 말고 규격만"). 그림을 바꾸려면 Codex 에게 다시 그리게 한 뒤 두 도구를 다시 돌리세요.
  900px 미만은 스테이지의 세운 휴대기 CSS 그대로입니다.
  `pixel-fc-level-retro`(레트로 컨트롤러) · `-brick`(벽돌 휴대기)은 19회차에 그림 1(리소)을 사용자 말("더 옛날 게임기 느낌 · 레트로 느낌 강하게")대로 Codex 6차가 두 갈래로 다시 그린 안입니다
  (지시서 `BRIEF-2.md` 6차 — 검빨금 · 같은 화면 자리 · 같은 SVG 구조, 변환 · CSS 도구는 그대로: `console-art-css.py` 의 키 `a:retro b:brick`).
  **벽돌 휴대기가 사용자가 고른 게임기**입니다 — 7차(같은 지시서)로 바깥 실루엣은 그대로 두고 화면을 게임기 면적의 약 4할 → 6할로 키우고(화면 자리 268, 212, 1000 × 600 —
  이 안만 `svg-console.py … --screen 268,212,1000,600`), 나사 · 스피커 구멍 · 턱 · 카트리지 입구 · 전원등 · 따로 붙은 손잡이 판은 뺐습니다(사용자: "화면 비중을 더 늘려야 함, 부가 요소가 너무 많아" — 덧붙은 부품을 다시 넣지 마세요).
  일곱 그림의 부품 자리는 `tools/fc-pixel/console-controls.json`(키 1 ~ 5 · a · b) 한 파일에 모아 두었으니 CSS 는 `console-art-css.py tools/fc-pixel/console-controls.json 1:riso 2:cutpaper 3:ink 4:gouache 5:mecha a:retro b:brick` 로 다시 뽑습니다.
- **스테이지 메뉴 확대 = 화면이 창 폭의 9할 이상**(사용자: "게임기 전체보다는 화면이 9할 이상") — 900px 이상 메뉴 상태에서는 `pixel-fc-level.js` 의 `zoomMenu()` 가
  화면 상자(`.fcs-rig > .hero > .wrap`)의 비율을 재서 판 폭을 정수 칸(200 × c 기기 픽셀)으로 키우고, 화면이 창 가운데 오도록 `--lv-rig-ml` · `--lv-rig-mt` 로 옮깁니다
  (손잡이는 창 밖 — `.home-screen { overflow: clip }`, 키보드 · 메뉴 클릭은 그대로). 화면 속 글자는 `.gui-scr` · `.lv-msel` 만 `--lv-scr-zoom`(0.5 단위, 넘치면 한 단계씩 줄임)으로 키우고,
  꽂기 개요(`.fc-boot`)는 키우지 않습니다(`pixel-fc-level.css` 의 `.fc-ov` 는 `max-width: none`).
- **시안 모음 `drafts.html`** — 아직 사이트에 넣지 않은 시안을 보는 페이지(`themes.html` 머리에서 링크). 홈 흐름 '이력 먼저' 1 ~ 4차 시안(A ~ U) 가운데 사용자가 고른
  **S 지어지는 월드** 하나만 남기고 나머지는 모두 폐기했습니다(사용자: "세 번째가 그나마 낫고 나머지는 쓰레기니 전부 폐기" — 옛 안은 git 기록에만 있음).
  PART 01 = S — **스크롤만**: 틀이 화면에 붙은 채(sticky) 진행(0 ~ 1)이 화면 속 움직임 · 글자 쓰기를 정하고 누를 것이 없습니다
  (사용자: "생각하고 누르는 건 안 돼 · 바로 작동 안 하면 꺼 버림 · 스크롤만 해도 알아서 상호작용되며 눈이 즐겁게" — 항목의 `scroll: 길이`, 틀 = `.sstick`, 진행은 `scrollTick()`).
  **고스트(1P 는 사이트 마스코트 모양 그대로 빨강 한 색 · 무리는 크림 `--d-ghostc`)가 공사장에 닿는 그 순간 그 시기의 소품이 솟고 화면이 흔들리며 숫자가 튀어 오르고, 그 자리에서 큰 글씨 게임 대화창(`gameCard()` · `gcFrame()`)이 튀어나와
  머무는 동안 본문이 스크롤만큼 써진 뒤 위의 잠긴 팻말로 접혀 들어감**(사용자: "상호작용에 바로 이력이 뜨는데 그 뜨는 방법이 확실히 인지돼야 함").
  장면은 늘 밝게 둡니다 — 고스트에 빛 · 고리를 두지 않고("유령에 하이라이트를 왜 걸어") 장면을 어둡게 덮지도 않음("평소에도 어두우면 안 되지"), 대화창은 제 남색 판 · 테 · 그림자로 띄움.
  대화창은 장면(`.mock`) 밖 무대(`.sstick`) 위에 원래 크기로 그리고(좌표는 `fit()` 이 재는 `box.__geo` · `stg()`), 760px 이하는 장면 680px 폭(`CAM_W`, 카메라가 고스트를 따라감 · `data-fix` 는 제자리) + 아래 크림 대화칸(`.bc-dock`).
  팔레트 8벌(`NESP` · 기본은 밝은 낮, '시간 따라' = 1-1 낮 → 1-2 지하 → 노을 → 밤 → 1-4 성은 고를 때만) — 소품 그림을 `palVars()` 가 팔레트마다 다시 찍습니다.
  소품은 장식이 아니라 쓰임으로(관과 동전 · 고스트 무리 · 구름 · 단상 · 깃발 = 그 시기의 은유) — 장식만 하는 언덕 · 덤불 · 채움 벽돌은 넣지 않습니다("장식으로만 쓰면 복잡해 보임").
  PART 02 = 고른 게임기 **벽돌 휴대기**(`pixel-fc-level-brick`) 하나. 설계 폭 1200px 고정(소품 1배). 글 · 숫자는 `content.js`, 게임기는 `fc-level-art-brick.js` 를 그대로 읽고,
  육각형 능력 여섯(`AX` · `GAIN`)만 아직 이 파일 안의 예시입니다 — 실제 홈에 넣을 때 `content.js` 로 옮기세요. 사이트 화면이라 `.assetsignore` 에 넣지 않습니다.
- **랠리는 기울임꼴을 쓰지 않습니다** — 한글 글꼴에는 기울임 꼴이 없어 브라우저가 억지로 눕힌 가짜 이탤릭이 됩니다. 사선은 `clip-path` 로 상자 모양에만(글자까지 눕히는 `skewX` 금지).
- `:is()` 안에는 가상 요소(`::before` 등)를 넣을 수 없습니다 — 넣으면 규칙 전체가 무시되니 `…::before, …::after` 로 따로 적으세요.

**같은 10회차의 Codex 판** — `pixel-fc-dot-cx` · `pixel-fc-kraft-cx` · `pixel-fc-level-cx` · `pixel-fc-rally-cx` 는 위 Claude 판과 나란히 비교하려고
다듬기 **전** 원본 네 안을 복제한 뒤 Codex 가 따로 다듬은 판입니다(지시서 · 2차 피드백 `docs/design-log/briefs/r10-folio-cx/`).
각자 `pixel-fc-<안>-cx.css` + `pixel-fc-<안>-cx.js` 로 완결되고(원본 · Claude 판 파일과 별개), 공용 다듬기 파일(`pixel-fc-folio.css`) · 숫자 줄은 쓰지 않습니다.
첫 화면 왼쪽은 '01 프로젝트 보기 / 02 이력서 읽기' 바로가기 줄입니다. 공용 `fc-stage.js` 의 `SKINS` · `fc-body.js` 의 `ART` 에 id 가 들어가 있으니,
안을 지우거나 이름을 바꿀 때 두 목록도 함께 고치세요.

- `themes.js` 는 `<head>` 에서 `style.css` **바로 다음**에 읽습니다 (모든 페이지 + `projects/detail.html`).
  `?skin=<id>` 파라미터 → `localStorage['portfolio:skin']` → `DEFAULT_SKIN` 순으로 시안을 정하고,
  `<html data-skin="pixel-gameboy" data-skin-theme="pixel">` 를 찍은 뒤 CSS 두 개(`<테마>.css` + `<테마>-<시안>.css`, 시안 항목에 `css` 가 있으면 그 파일까지)와 글꼴 링크를 넣습니다.
  둘러보는 중(파라미터나 저장값이 있을 때)에만 왼쪽 아래 스위처가 뜹니다. 편집기 프레임(`ve=1`)·iframe 안에서는 저장하지 않습니다.
- **확정**은 `DEFAULT_SKIN` 한 줄. 지금은 `'pixel-famicom'` 이 들어가 있어 방문자 모두에게 패미컴 시안이 보입니다. 시안 목록·이름·설명·색견본·글꼴 URL 도 같은 파일의 `THEMES` 배열에 있고, `themes.html` 갤러리가 이 배열로 그려집니다.
- 테마 CSS 규칙은 전부 `[data-skin-theme="…"]` / `[data-skin="…"]` 로 시작합니다. 기본 CSS 의 다크 규칙(`:root[data-theme="dark"] .x`)보다 우선해야 하는 카드 등급·아트 색 같은 규칙은 `:root[data-skin…]` 으로 특이도를 맞춥니다.
- 새 시안을 추가하려면: `THEMES` 에 항목 추가(ko/en 이름·설명 모두) → `assets/css/themes/<테마>-<시안>.css` 작성(라이트·다크 토큰 둘 다) → `assets/img/themes/<id>.jpg` 미리보기(1280×800 홈 상단, 800px 폭).
- **사진에는 어떤 변형도 걸지 않습니다** — 필터·오버레이·픽셀화 금지. 테두리·액자만 스킨이 정합니다.
- 카드 안쪽 고정 레이아웃 규칙은 스킨에서도 유지합니다 (크기·여백은 `cqw`, 미디어 쿼리 금지). 스킨은 테두리·색·글꼴·그림자만 바꿉니다.

## 프로젝트 카드 (홈 뽑기 · 프로젝트 목록 공용)

카드 한 장은 `assets/content.js` 의 `projects.items[]` 한 항목입니다. 구성은
**이름 / 분류·대표 태그·등급 / 그림 / 개요** 이고, 앞면은 `gcardFace()`,
뒷면(덱·뒤집기)은 `cardBackFace()` 가 그립니다(`assets/js/render.js`).

| 필드 | 뜻 | 비고 |
|---|---|---|
| `title` | 카드 이름 | 두 줄까지 표시 |
| `category` | 분류 (`game` / `planning`) | 왼쪽 칩. 이름은 `projects.tabs` 에서 가져옵니다 |
| `tag` | 대표 태그 `{ ko, en }` | 가운데. 한 줄, 길면 말줄임 |
| `grade` | 등급 `SSR` `SR` `R` `A` | 테두리: 홀로그램 · 금박 · 은박 · 기본 |
| `thumb` | 카드 그림 경로 | **비우면 `id` 로 자동 생성 아트**(패턴 4종 × 색 3종, 항상 같은 그림) |
| `sub` | 개요 한 줄 | 두 줄까지 표시 |

- 등급 테두리는 CSS 의 `.gcard[data-grade="…"]` 가 `--frame` 을 바꿔서 만듭니다.
  새 등급을 추가하려면 `render.js` 의 `GRADES` 와 style.css 의 `[data-grade]` 규칙을 함께 늘리세요.
- 카드 안쪽은 **고정 레이아웃**입니다. 모든 칸의 크기·여백·글자를 카드 폭 비율(`cqw`)로 못박아 두어
  이름이 한 줄이든 두 줄이든 칸 위치가 움직이지 않고, **카드 전체 크기만 비례해서** 커지고 작아집니다
  (이름 2줄 · 개요 2줄 자리를 항상 확보, 그림 칸은 항상 약 1.5:1). 여기에 미디어 쿼리를 넣지 마세요.
- 마우스를 올리면 커서 방향으로 살짝 기울고(3D), 테두리의 금박·홀로그램 반사와 표면 하이라이트가
  커서를 따라 움직입니다. `main.js` 의 `initTilt()` 가 `--rx/--ry/--px/--py` 를 채우고 CSS 가 그립니다
  (모션 최소화 설정·터치·편집기 안에서는 자동으로 꺼집니다).
- **뽑기 연출**: 덱을 누르면 카드가 한 장씩(`--i` 순번, 115ms 간격) **뒷면인 채로 덱 자리에서 날아와**
  자리에 앉고, 다 놓인 뒤 760ms부터 140ms 간격으로 **한 장씩 뒤집힙니다**(`dealSlide` → `flipOver`).
  출발 좌표(`--dx/--dy`)는 `main.js` 의 `dealCards()` 가 덱과 카드의 위치 차이를 재서 넣고,
  계산이 끝난 뒤 `.draw__cards.is-dealing` 을 붙여 애니메이션을 시작합니다(그 전까지는 `paused`).
- 카드 뒷면(`.card-back`)은 덱과 뒤집기가 공유합니다. 초록 바탕 + 은은한 블룸 + 아주 옅은 점 격자 +
  가운데 큰 고스트 구성이며, 이 역시 카드 폭 비율로 그려집니다.
- 시각 편집기에서 카드 그림을 누르면 `projects.items.<i>.thumb` 슬롯으로 연결됩니다
  (`visual-editor.js` 의 `photoSlotFor()`).

## 도구 로고 (보유 기술)

- 이력서 '핵심역량' 카드와 홈 개요의 도구 표시는 **실제 브랜드 로고**입니다 — `assets/img/tools/` 안의 파일
  (출처: SVG Logos CC0 · theSVG Color MIT · 구글 Flow 와 Hermes 는 공식 배포본.
  상표는 각 소유자의 것이고 '이 도구를 씁니다' 표시로만 씁니다).
- 새 도구를 더하려면 ① 같은 폴더에 `<키>.svg` 를 넣고 ② `render.js` 의 `TOOL_ICONS` 에 `키:{n:'이름'}` 한 줄
  ③ `content.js` 의 `resume.skills.cards[].tools` 에 키를 적습니다. 이름은 브랜드 이름이라 번역하지 않습니다.
- `TOOL_ICONS` 한 줄은 `n`(화면에 적는 이름) 말고 `f`·`x` 를 더 받습니다 — **`f`** 는 그림 파일 이름
  (없으면 키 그대로), **`x`** 는 확장자(없으면 `svg`). 그래서 **이름과 파일이 달라도 되고**
  (`agent:{n:'Agent', f:'claude'}` = 이름은 Agent, 그림은 클로드 로고), 공식 SVG 를 안 주는 로고는
  png 로 둡니다 (`flow:{n:'Flow', x:'png'}` — 구글이 Flow 마크를 png 로만 배포합니다).
  png 를 쓸 땐 타일이 30px(2배 화면 60px)이니 가로 160px 안팎으로 줄여서 넣으세요.
- **로고가 올라가는 판은 어느 시안에서도 흰색**입니다(`.tool__ic` · `.hp-skill__ic--logo` 에 `!important`).
  판에 색을 칠하면 깃허브·노션 같은 검은 마크가 묻히고 브랜드 색이 왜곡됩니다 — 이 규칙을 풀지 마세요.

## 사이트 아이콘 · 히어로 사진

- 파비콘은 **정사각형 파일 한 장**입니다 — `assets/img/favicon.svg`(빨강 바탕 + 크림 고스트)와
  홈 화면용 `assets/img/apple-touch-icon.png`(180px, SVG 에서 뽑음). 모든 페이지가 이 둘을 가리킵니다
  (`projects/detail.html` 만 `../` 경로). 색을 바꾸면 SVG 를 고친 뒤 PNG 도 다시 뽑아 주세요.
- 히어로 사진은 홈 `home.player.photo` 한 장을 이력서도 함께 씁니다. 이력서만 다른 사진을 쓰려면
  `resume.photo` 에 경로를 넣고, 둘 다 비우면 예전처럼 고스트 그림이 들어갑니다 (`render.js` 의 `heroPhoto()`).
  사진 크기는 패미컴 시안에서 `--fc-h` 에 묶여 있어 두 페이지 기기 크기가 어긋나지 않습니다.

## 게임플레이 — 스팀 연동 방사형 그래프

게임플레이 페이지 맨 위의 장르별 그래프는 **자동 수집**입니다 (자세한 사용법: `docs/steam-play-log.md`).

- 흐름: `.github/workflows/steam-sync.yml`(주 1회·수동) → `tools/steam-sync.mjs` → `assets/play-steam.js`
  (`window.PORTFOLIO_STEAM`) → `render.js` 의 `steamBlock()`. 데이터가 없으면 블록을 아예 그리지 않습니다.
- **무엇을 넣고 뺄지는 `content.js` 의 `play.steam` 한 곳**에서 정합니다 (`exclude` 에 appid·이름, `minMinutes`,
  `axes`, `topCount`, `excludeGenres`, `genreNames`). 수집 스크립트가 이 파일을 그대로 평가해 설정을 읽습니다 —
  `play.steam` 의 키 이름을 바꾸면 스크립트도 함께 고쳐야 합니다.
- **성인 콘텐츠·연령 제한·게임 아닌 소프트웨어는 집계 전에 걸러집니다** (콘텐츠 표시 1·3·4, 장르 71·72,
  `required_age ≥ 18`, 상점 정보 없음, 장르 51~60·84). 공개 파일에 이름조차 남기지 않습니다 — 이 규칙을 약하게 바꾸지 마세요.
- 그래프는 계열이 하나라 **강조색 하나 · 범례 없음 · 제곱근 눈금**이고, 같은 내용을 표로 한 번 더 둡니다
  (스크린 리더·색약·인쇄). 숫자는 축 라벨과 표에 그대로 적습니다.
- 깃허브 액션이 `GITHUB_TOKEN` 으로 push 한 커밋은 `deploy-pages.yml` 을 깨우지 않으므로, 배포 단계를
  `steam-sync.yml` 안에 이어 붙여 두었습니다.

## 배포 — GitHub Actions → Cloudflare Workers (자동)

`main` · `claude/game-planner-portfolio-landing-ote57w` 브랜치에 푸시하면 GitHub Pages 와 Cloudflare
두 곳에 **자동으로 같이 배포**됩니다. 둘 중 하나만 보고 "배포 안 됐네" 하지 말고, 이 흐름을 바꿀 땐 둘 다 확인하세요.

- 흐름: push → `.github/workflows/deploy-cloudflare.yml` → `wrangler deploy` (`wrangler.jsonc` 설정대로
  저장소를 통째로 정적 자산 삼아 업로드) → **https://portfoliosite.imjisukim0712.workers.dev**.
  같은 푸시가 기존 `deploy-pages.yml`(GitHub Pages)도 그대로 돌립니다 — 배포 대상은 두 곳 다 유지.
- **지금은 공개 전이라 Cloudflare 쪽(jisu.kim · workers.dev)에는 준비중 화면만 올라갑니다.** `wrangler.jsonc` 의
  `assets.directory` 가 `./coming-soon`(준비중 페이지 한 장)이고 `not_found_handling: "single-page-application"` 이라
  어떤 경로로 들어와도 그 한 장만 200 으로 보입니다(사이트 파일·README 등은 아예 올라가지 않음). 작업 확인은
  GitHub Pages(**https://imjisukim0712-bit.github.io/PortfolioSite/**)에서 합니다 — GitHub Pages 는 이 설정과 무관하게 전체 사이트를 올립니다.
  **공개할 때**는 `directory` 를 `"./"` 로 되돌리고 `not_found_handling` 줄을 지우면 됩니다(그 뒤로는 아래 `.assetsignore` 가 다시 적용).
  `.assetsignore` 는 assets 폴더 맨 위의 것만 읽히므로 준비중인 동안에는 쓰이지 않습니다.
  준비중 화면의 연락 이메일(`coming-soon/index.html` 의 `mailto:`)은 `content.js` 를 못 읽어 따로 적혀 있으니, `meta.email` 을 바꾸면 여기도 같이 바꾸세요.
- 인증은 저장소 Secrets `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` 두 개뿐입니다
  (Cloudflare 대시보드 → API Tokens 에서 발급). 토큰을 새로 만들면 이 값만 갱신하면 됩니다.
- **새 최상위 파일·폴더를 추가할 때, 사이트 화면이 아니면 `.assetsignore` 에도 추가하세요.**
  안 넣으면 다음 푸시 때 그 파일이 공개 URL에 그대로 열립니다. `CLAUDE.md`·`README.md`·`docs/`·`tools/`처럼
  내부용 문서·스크립트는 반드시 걸러야 합니다 — README 에는 편집기 비밀번호 같은 민감한 내용도 있으니
  이 규칙을 약하게 바꾸지 마세요.
- `wrangler.jsonc` 는 `main`(서버 코드) 없이 `assets.directory` 만 있는 게 정상입니다(순수 정적 사이트).
  Wrangler 는 반드시 4 이상이어야 합니다(`deploy-cloudflare.yml` 의 `wranglerVersion: "4"`) — 3 이하에서는
  `main` 없는 배포 자체가 안 됩니다.
- 실제 공개 주소는 **`https://jisu.kim`**(+ `www.jisu.kim`, 지금은 준비중 화면)입니다 — Cloudflare Registrar 로 산 도메인을 위 Worker 에
  Custom Domain 으로 연결해 뒀고, `workers.dev` 주소도 그대로 계속 살아 있습니다. `content.js` 의 `meta.email`
  (`contact@jisu.kim`)은 Cloudflare **Email Routing** 이 지메일로 전달하는 주소라 코드에는 진짜 받는 편지함이 없습니다 —
  전달 대상을 바꾸려면 Cloudflare 대시보드 Email Routing 쪽에서 바꿔야 합니다.

## 홈 말풍선 · 강점 요약 · 히어로 판

- 홈 히어로 사진 옆 말풍선은 `content.js` 의 `home.quips[]`(`{ko,en}`) 를 순서대로 보여 주고, `home.quipMore` 가 **한 마디 더** 버튼 글자입니다.
  현재 순번은 `render.js` 의 `QUIP.i`(export `quip`) 이고, `main.js` 의 `cycleQuip()` 이 버튼 클릭에 글자만 바꾸고 사진 카드(`.hero__portrait`)의 `--pose-d`/`--pose-y` 를 바꿔 살짝 움직입니다.
  테마는 `--pose-rest` 로 쉴 때 기울기를 정합니다 (transform 을 직접 쓰지 않습니다).
- 홈 덱 아래 개요(`homePreview()`)는 **이력서 → 자기소개서 → 게임플레이** 순서입니다. 프로젝트는 바로 위 덱의 카드가 맡으므로 개요에서는 다시 보여 주지 않습니다. 첫 절만 구분선(`hp--sep`) 없이 시작합니다.
- 강점 세 장은 `coverLetter.summary` (`title` + `items[]{tag,title,body}`) 이고 `render.js` 의 `strengthCards()` 가 홈(개요의 `.hp--summary`)과 자기소개서 맨 위(`.cl-summary`)에 같은 `.strengths > .strength` 카드를 그립니다.
  `coverLetter.blocks[]` 의 `body` 는 문단을 `\n\n` 으로 나눈 `{ko,en}` 한 덩어리입니다 (`paragraphs()` 규약).
- 히어로 색면(판)은 기본 CSS 의 `.hero::before` 가 `--hero-slab`(색) · `--hero-slab-r`(모서리) 토큰으로 그립니다. 화면이 넓어도 본문 폭(`--page-max`)+20px 까지만 깔립니다. 테마 시안 파일이 토큰과 판 위 글자색을 정하고, 기본 디자인은 판이 없습니다.
- `themes.js` 의 테마 항목은 `scripts: ['js/….js']` 로 스크립트를 함께 읽을 수 있습니다. 지금은 `pixel` 테마가
  `assets/js/themes/famicom.js` 를 씁니다: 홈·이력서의 `.hero` 를 휴대용 게임기로 만들어, 양옆 손잡이(`.fc-grip`)에
  SELECT ◀ ▶ · ✉ · B · A 버튼을 붙입니다. SELECT ◀ ▶ 는 홈에서 사진 옆 '한마디'를 앞뒤로 넘기고
  (`PortfolioApp.cycleQuip(dir)` · '한 마디 더' 버튼은 이 시안에서 숨김), 한마디가 없는 페이지에서는 이전·다음 절로 이동합니다.
  ✉(메일) 은 `content.js` 의 `meta.email` 로 메일 쓰기이고, 값이 비어 있으면 키를 달지 않습니다 (좁은 화면에서는 자리를 위해 'SELECT' 글자만 접습니다).
  B 는 다크·라이트 전환(헤더의 `[data-theme-toggle]` 을 누름), A 는 홈에서 덱 뽑기(`[data-draw]`), 그 밖에서는 아래 내용으로 스크롤.
  **기기 크기는 두 페이지가 같아야 합니다**: 본체 높이를 안에 든 내용이 아니라 `--fc-h`(화면 높이 기준 clamp)로 정하고,
  높이를 많이 먹는 사진(`.portrait`)·고스트 그림(`.ghost-art`)·큰 제목(`--text-display` · 홈 제목)을 `--fc-h` 에 묶어 두었습니다.
  액정 안 내용을 늘리거나 줄일 때는 이 세 개도 함께 보세요 (`min-height` 라서 내용이 넘치면 잘리는 대신 기기가 늘어납니다 — 그러면 페이지마다 크기가 달라집니다).
  이 시안의 카드는 카트리지입니다: 셸(`.gcard` 배경) · 단자(위)와 귀(아래)(`.gcard::before`) · 라벨(`.gcard__frame`) 이고,
  등급은 테두리 대신 라벨 위 띠 색 `--stripe` 로 구분합니다. 다크 모드에서도 라벨은 크림색이라 라벨 안 글자색 토큰을 다시 정합니다.
  카드(`a.draw-card` · `a.proj-card`)를 누르면 바로 이동하지 않고 **꽂기 연출**이 먼저 나옵니다: 카드 복제본(`.fc-fly`)이
  집어 올려져 화면에 보이는 게임기 아래 슬롯(`.hero.is-slot::after`)으로 가서 clip-path 로 잘리며 밀려 들어가고(중간에 한 번
  걸렸다가 딸깍 — 게임기가 안 보이면 화면 위에서 슬롯 띠 `.fc-slot` 이 내려옴), 화면이 켜져 '읽는 중' 뒤에 **프로젝트 개요**
  (`.fc-boot > .fc-ov`: 그림 · 분류/태그/등급 · 제목 · 한 줄 · 기간/인원/역할/상태 · 퀘스트 — 모두 `projects.items[]` 에서)가
  뜹니다. **자세히 보기**(또는 손잡이 A)가 원래 링크를 `data-fc-go` 표시와 함께 다시 눌러 이동하고(갤러리의 링크 가로채기도
  그대로 동작), **꺼내기**(손잡이 B · Esc)는 카트리지가 도로 나와 제자리로 돌아갑니다. 모션 최소화 설정·수식키 클릭은 바로 이동합니다.
  카트리지(`.fc-fly`)는 **상단바(`.nav-wrap` · z-index 100)보다 아래 층**입니다(85, 슬롯 띠 84) — 위에 두면 연출 중 메뉴가 가려집니다.
  그래서 슬롯 띠(`.fc-slot`)도 화면 맨 위가 아니라 **상단바 바로 아래**로 내려옵니다(`top` 은 famicom.js 가 상단바 높이를 재서 넣음).
  화면 전체를 덮는 `.fc-boot--full`(250)만 예외입니다.
  카트리지(`.fc-fly`)는 **슬롯과 같은 좌표계**에 둡니다 — 게임기 슬롯이면 문서에(`absolute` + 스크롤량), 화면 위 슬롯 띠면 화면에(`fixed`).
  한쪽만 스크롤을 따라가면 꽂는 자리가 어긋나 카트리지가 허공에 꽂힙니다. 슬롯 띠의 꽂는 선은 `transform` 을 잠깐 꺼서
  '내려온 뒤'의 자리로 재고, 연출 도중 게임기가 화면 밖으로 밀려났으면 화면이 켜지기 전에 도로 스크롤해 데려옵니다.
  `[data-slot="main"]` 의 자식이 바뀔 때마다(언어 전환·갤러리 페이지 이동) 다시 붙고, 다른 시안에서는 아무것도 하지 않습니다.
  페이지 한 줄 설명은 그 파일의 `PAGES[].desc` 에 `{ ko, en }` 으로 있습니다 (이중언어 규칙 적용).
