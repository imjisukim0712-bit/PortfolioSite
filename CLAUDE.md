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

기본 디자인(`style.css`) 위에 덧입히는 스킨 체계입니다. 테마 4종 · 시안 7개.
(`pixel` · `brutal` · `brand` · `concept`)

- `themes.js` 는 `<head>` 에서 `style.css` **바로 다음**에 읽습니다 (모든 페이지 + `projects/detail.html`).
  `?skin=<id>` 파라미터 → `localStorage['portfolio:skin']` → `DEFAULT_SKIN` 순으로 시안을 정하고,
  `<html data-skin="pixel-gameboy" data-skin-theme="pixel">` 를 찍은 뒤 CSS 두 개(`<테마>.css` + `<테마>-<시안>.css`)와 글꼴 링크를 넣습니다.
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

## 홈 말풍선 · 강점 요약 · 히어로 판

- 홈 히어로 사진 옆 말풍선은 `content.js` 의 `home.quips[]`(`{ko,en}`) 를 순서대로 보여 주고, `home.quipMore` 가 **한 마디 더** 버튼 글자입니다.
  현재 순번은 `render.js` 의 `QUIP.i`(export `quip`) 이고, `main.js` 의 `cycleQuip()` 이 버튼 클릭에 글자만 바꾸고 사진 카드(`.hero__portrait`)의 `--pose-d`/`--pose-y` 를 바꿔 살짝 움직입니다.
  테마는 `--pose-rest` 로 쉴 때 기울기를 정합니다 (transform 을 직접 쓰지 않습니다).
- 강점 세 장은 `coverLetter.summary` (`title` + `items[]{tag,title,body}`) 이고 `render.js` 의 `strengthCards()` 가 홈(덱 아래 `.hp--summary`)과 자기소개서 맨 위(`.cl-summary`)에 같은 `.strengths > .strength` 카드를 그립니다.
  `coverLetter.blocks[]` 의 `body` 는 문단을 `\n\n` 으로 나눈 `{ko,en}` 한 덩어리입니다 (`paragraphs()` 규약).
- 히어로 색면(판)은 기본 CSS 의 `.hero::before` 가 `--hero-slab`(색) · `--hero-slab-r`(모서리) 토큰으로 그립니다. 화면이 넓어도 본문 폭(`--page-max`)+20px 까지만 깔립니다. 테마 시안 파일이 토큰과 판 위 글자색을 정하고, 기본 디자인은 판이 없습니다.
- `themes.js` 의 테마 항목은 `scripts: ['js/….js']` 로 스크립트를 함께 읽을 수 있습니다. 지금은 `pixel` 테마가
  `assets/js/themes/famicom.js` 를 씁니다: 홈·이력서의 `.hero` 를 휴대용 게임기로 만들어, 양옆 손잡이(`.fc-grip`)에
  SELECT ◀ ▶ · B · A 버튼을 붙입니다. SELECT ◀ ▶ 는 홈에서 사진 옆 '한마디'를 앞뒤로 넘기고
  (`PortfolioApp.cycleQuip(dir)` · '한 마디 더' 버튼은 이 시안에서 숨김), 한마디가 없는 페이지에서는 이전·다음 절로 이동합니다.
  B 는 다크·라이트 전환(헤더의 `[data-theme-toggle]` 을 누름), A 는 홈에서 덱 뽑기(`[data-draw]`), 그 밖에서는 아래 내용으로 스크롤.
  이 시안의 카드는 카트리지입니다: 셸(`.gcard` 배경) · 단자(위)와 귀(아래)(`.gcard::before`) · 라벨(`.gcard__frame`) 이고,
  등급은 테두리 대신 라벨 위 띠 색 `--stripe` 로 구분합니다. 다크 모드에서도 라벨은 크림색이라 라벨 안 글자색 토큰을 다시 정합니다.
  카드(`a.draw-card` · `a.proj-card`)를 누르면 바로 이동하지 않고 **꽂기 연출**이 먼저 나옵니다: 카드 복제본(`.fc-fly`)이
  집어 올려져 화면에 보이는 게임기 아래 슬롯(`.hero.is-slot::after`)으로 가서 clip-path 로 잘리며 밀려 들어가고(중간에 한 번
  걸렸다가 딸깍 — 게임기가 안 보이면 화면 위에서 슬롯 띠 `.fc-slot` 이 내려옴), 화면이 켜져 '읽는 중' 뒤에 **프로젝트 개요**
  (`.fc-boot > .fc-ov`: 그림 · 분류/태그/등급 · 제목 · 한 줄 · 기간/인원/역할/상태 · 퀘스트 — 모두 `projects.items[]` 에서)가
  뜹니다. **자세히 보기**(또는 손잡이 A)가 원래 링크를 `data-fc-go` 표시와 함께 다시 눌러 이동하고(갤러리의 링크 가로채기도
  그대로 동작), **꺼내기**(손잡이 B · Esc)는 카트리지가 도로 나와 제자리로 돌아갑니다. 모션 최소화 설정·수식키 클릭은 바로 이동합니다.
  `[data-slot="main"]` 의 자식이 바뀔 때마다(언어 전환·갤러리 페이지 이동) 다시 붙고, 다른 시안에서는 아무것도 하지 않습니다.
  페이지 한 줄 설명은 그 파일의 `PAGES[].desc` 에 `{ ko, en }` 으로 있습니다 (이중언어 규칙 적용).
