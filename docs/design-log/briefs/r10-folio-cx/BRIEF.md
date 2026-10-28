# 10회차 Codex 판 — 네 안을 '포트폴리오 사이트답게' 다듬기

당신은 게임 기획자 김지수의 포트폴리오(빌드 도구 없는 정적 사이트) 저장소의 **독립된 git worktree** 안에 있습니다
(지금 작업 폴더). 먼저 `CLAUDE.md` 를 끝까지 읽으세요(테마·패미컴 시안·카드·배포 규칙이 다 있습니다).
같은 요청을 Claude 도 따로 진행했고, 사용자는 두 판을 나란히 비교합니다 — **당신의 판단으로** 다듬어 주세요.

## 사용자의 말 (그대로)
1. (후보 9개 비교 화면을 보고) "좌상단부터 1239번이 괜찮은거 같은데 이거 기준으로 좀 더 포트폴리오 사이트답게 깎아볼래? 지금은 뭔가 조잡해"
   — 1 · 2 · 3 · 9번 = **도트 · 크라프트 · 스테이지 · 랠리 프린트**
2. "코덱스 버전 너 버전 각각 진행해봐"

## 당신이 다듬을 것 (이 파일들만)
원본 네 안을 그대로 복제해 둔 Codex 전용 시안입니다. 화면에서는 `index.html?skin=<id>` 로 열립니다.

| 시안 id | CSS | JS |
|---|---|---|
| `pixel-fc-dot-cx` | `assets/css/themes/pixel-fc-dot-cx.css` | `assets/js/themes/pixel-fc-dot-cx.js` |
| `pixel-fc-kraft-cx` | `assets/css/themes/pixel-fc-kraft-cx.css` | `assets/js/themes/pixel-fc-kraft-cx.js` |
| `pixel-fc-level-cx` | `assets/css/themes/pixel-fc-level-cx.css` | `assets/js/themes/pixel-fc-level-cx.js` |
| `pixel-fc-rally-cx` | `assets/css/themes/pixel-fc-rally-cx.css` | `assets/js/themes/pixel-fc-rally-cx.js` |

- 수정해도 되는 것: 위 8개 파일, 그리고 `assets/js/themes.js` 의 이 네 항목(`fc-*-cx` — 설명 `desc` 는 끝나면 당신이 한 일에 맞게 ko/en 둘 다 고쳐 주세요, 웹 글꼴이 필요하면 `fonts`).
- **수정 금지**: 다른 모든 파일 — 특히 원본(`pixel-fc-dot.css` 등 `-cx` 없는 파일), 공용 `fc-stage.js` · `fc-body.js`(읽기만; 바꾸고 싶은 동작은 당신 JS 안에 따로),
  `render.js` · `main.js` · `style.css` · `content.js`. 새 파일이 필요하면 `assets/css/themes/pixel-fc-*-cx*.css` / `assets/js/themes/pixel-fc-*-cx*.js` 이름으로만.
- **독립성**: Claude 판(`assets/css/themes/pixel-fc-folio.css`, `docs/design-log/README.md` 의 10회차 절, 원본 시안들의 최근 변경)은 **열어 보지 마세요**.
  출발점은 지금 `-cx` 파일들 그대로입니다.

## 지켜야 할 것 (지금까지 사용자와 정한 고정 조건)
- 빨강 · 검정 · 흰색의 닌텐도 / 패미컴 콘셉트, 패미컴 화면 콘셉트 + 카트리지(칩) 꽂기 동작 유지.
- 첫 화면 구도 고정: 왼쪽 큰 제목 · 오른쪽 살짝 3D 로 기울어진 게임기 · 그 바로 밑 같은 기울기의 카트리지 진열판(fc-stage.js 배치).
- 각 안의 정체성(색 · 화풍 · 게임기 그림)은 살립니다 — 다른 안으로 바꾸는 게 아니라 같은 안을 '포트폴리오답게, 덜 조잡하게'.
- 화려 · 감성보다 게임답게. 그림이 깨지거나 조잡하면 안 됨(모서리 외곽선 끊김 · 픽셀 한 칸 튀어나옴 금지).
- 상표 · 기존 게임 캐릭터(닌텐도 · 마리오 로고, 마리오 · 굼바 등) 그리지 않음.
- 저장소 규칙: 사진 무변형(filter · 오버레이 · 픽셀화 금지) · 카드(`.gcard`) 안쪽 cqw 고정 칸 · 카드 안 미디어 쿼리 금지 · 도구 로고 판 흰색 ·
  새 글자는 ko/en 둘 다 · 라이트/다크 둘 다 · 1440 / 1280 / 390 / 320px 가로 넘침 없음 · `prefers-reduced-motion` 존중.
- 6개 페이지 모두: 홈 · 이력서 · 자기소개서 · 프로젝트 · 게임플레이 · 프로젝트 상세(`projects/detail.html?p=comstock`).

## 검증
이 샌드박스에서는 브라우저 · 로컬 서버가 막힐 수 있습니다. 되면 직접 찍어 보고, 안 되면 건너뛰고 그렇다고 적으세요 —
Claude 가 당신 판을 찍어 다음 차례에 스크린샷으로 돌려드립니다(2차 손질). JS 를 고쳤다면 최소한 문법 검사(`node --check`)는 하세요.
갤러리 미리보기 그림은 Claude 가 다시 찍으니 신경 쓰지 않아도 됩니다.

## 산출물
- 위 파일들의 수정. **git commit / push 금지. 작업 폴더 밖 파일 수정 금지.**
- 끝나면 한국어로 짧게: 네 안 각각 ① 무엇이 조잡하다고 봤는지 ② 무엇을 바꿨는지 ③ 알려진 한계.
