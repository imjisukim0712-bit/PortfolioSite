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
- 카드 뒷면(`.card-back`)은 덱과 뒤집기가 공유합니다. 초록 바탕 + 은은한 블룸 + 아주 옅은 점 격자 +
  가운데 큰 고스트 구성이며, 이 역시 카드 폭 비율로 그려집니다.
- 시각 편집기에서 카드 그림을 누르면 `projects.items.<i>.thumb` 슬롯으로 연결됩니다
  (`visual-editor.js` 의 `photoSlotFor()`).
