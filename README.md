# 김지수 · 게임 기획자 포트폴리오

정적 HTML로 만든 게임 기획자 포트폴리오 랜딩 페이지입니다. 빌드 도구 없이 그대로 GitHub Pages에 올라갑니다.

- 폰트: **Pretendard Variable** (jsDelivr CDN, 동적 서브셋)
- 디자인 시스템: 첨부하신 **Phantom** 스타일 가이드(라벤더/오베르진 팔레트, 100px 알약 지오메트리, weight 350, -0.025em 자간)
- 반응형: 모바일 우선, 320px까지 가로 스크롤 없음
- iOS / Safari 대응: `viewport-fit=cover` + `env(safe-area-inset-*)`, `100svh`, `-webkit-backdrop-filter`, `-webkit-overflow-scrolling`, `scroll-behavior` 미지원 시 JS 폴백, 메뉴 오픈 시 배경 스크롤 잠금

## 구조

```
index.html                       랜딩 (히어로 + 6개 섹션)
projects/
  league-of-defense.html         PROJECT 01 리그 오브 디펜스
  comstock.html                  PROJECT 02 컴스톡
  indie-games.html               PROJECT 03 인디게임 개발 5종
assets/
  css/style.css                  디자인 토큰 + 전체 스타일
  js/main.js                     한/영 전환, 모바일 메뉴, 스크롤 스파이/리빌
  resume/jisu-kim-resume.pdf     ★ 자리 표시용 PDF — 교체 필요
.nojekyll                        GitHub Pages Jekyll 처리 비활성화
```

목차(헤더) 구성: 자기소개 · 프로젝트 · 핵심역량 · 경력 · 게임 플레이 경험 + 언어(KR/EN) · 이력서

## 로컬에서 보기

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## GitHub Pages 배포

저장소 **Settings → Pages → Source: Deploy from a branch** 에서 이 브랜치와 `/ (root)` 를 선택하면 됩니다.
`.nojekyll` 이 있어 `assets/` 같은 폴더가 그대로 서빙됩니다.

## 지금 직접 채워야 하는 곳

| 위치 | 내용 |
|---|---|
| `assets/resume/jisu-kim-resume.pdf` | 자리 표시용 PDF입니다. **공개용 이력서로 교체하세요.** 원본 PDF에는 전화번호·이메일·생년월일·거주지·병역·희망연봉·학력 이력이 들어 있어 그대로 올리지 않았습니다. |
| `index.html` 연락처 섹션 | 이메일 버튼이 자리 표시 상태입니다. 주석에 적힌 형태로 `<a href="mailto:...">` 로 바꾸면 활성화됩니다. |
| `projects/*.html` 의 `작성 예정` 블록 | 문제 정의 / 접근 / 회고 서술 자리입니다. |
| `index.html` 프로젝트 섹션 하단 | 기업협약 프로젝트, 개인 프로젝트 (내용 미정) |
| `index.html` 플레이 경험 3번째 카드 | 지원 직무·팀 관련 게임 자리 |

## 반영하지 않은 개인정보

공개 웹페이지 특성상 아래 항목은 의도적으로 제외했습니다.

전화번호 · 이메일 주소 · 생년월일 · 거주지 · 병역 사항 · 희망 연봉 · 입사 희망일 · 학력 이력 및 개인적 서사

## 내용 수정 방법

### 텍스트
한국어가 기본값이고, 영어는 속성으로 붙어 있습니다.

```html
<!-- 단순 텍스트 -->
<p data-en="English text">한국어 텍스트</p>

<!-- <b> 등 태그가 섞인 문장 -->
<li data-en-html="A <b>bold</b> line.">굵은 <b>강조</b>가 있는 문장.</li>

<!-- 아이콘 등 마크업이 통째로 다른 경우 -->
<span class="i18n-ko">한국어 블록</span><span class="i18n-en">English block</span>
```

JS가 없어도 한국어는 정상 표시됩니다. 선택한 언어는 `localStorage` 에 저장돼 페이지를 옮겨도 유지됩니다.

> 주의: `data-en` 이 붙은 요소의 텍스트는 통째로 교체되므로, **자식 태그(아이콘 SVG 등)가 있는 요소에는 `data-en` 을 붙이면 안 됩니다.** 안쪽 `<span>` 에 붙이거나 `data-en-html` 을 쓰세요.

### 색·간격·타이포
`assets/css/style.css` 최상단 `:root` 의 토큰만 바꾸면 전체에 반영됩니다.

## 디자인 가이드와 다르게 적용한 부분

| 항목 | 가이드 | 실제 | 이유 |
|---|---|---|---|
| 본문 `line-height` | 1.4 이하 | 1.6 | 한글은 1.4에서 가독성이 떨어져 "가독성 좋게" 요건을 우선했습니다. |
| 디스플레이 `line-height` | 1.0–1.1 | 1.12–1.14 | 한글 받침이 잘리지 않는 최소값입니다. |
| 다크 섹션 카드 배경 | Aubergine | `rgba(253,252,254,.05)` | 같은 색이면 카드 경계가 사라져 미세한 명도 차만 줬습니다. |

그 외 100px 알약 반경, weight 350, -0.025em 자간, 밝은/어두운 섹션 교차, 팔레트는 가이드를 그대로 따랐습니다.

## 브라우저 지원

Safari(iOS 포함) 14 이상, Chrome / Edge / Firefox 최신. `text-wrap: balance` 등 일부 최신 속성은 미지원 브라우저에서 자연스럽게 무시됩니다.
