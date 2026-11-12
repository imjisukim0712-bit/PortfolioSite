# tools/pixel-art — 생성 도트 그림(카트리지 그림 시안)

사용자가 준 가이드(pixelfx 설치 가이드 6절)의 방식입니다: **Codex 이미지 생성으로 도트풍 원화 → `pixelize.py` 로 진짜 픽셀 스프라이트**.
시안 모음 PART 03 의 '라-5 ＋ 생성 도트 그림'이 이 그림을 씁니다(실제 사이트에는 아직 넣지 않음).

- `pixelize.py` — 변환기(사용자가 준 파일 그대로). `python3 pixelize.py 원화 결과.png 너비 높이 [색수] [여백]`, 점검은 `--check`.
- `originals/*.webp` — 원화(무손실 WebP, 1254 × 1254). 다시 변환할 때 씁니다.
- 결과는 `assets/img/cart/<이름>-<크기>.png`.

## 만든 것 (2026-11-12 · codex-cli 0.167.2 · 모델 gpt-6.1-sol)

| 결과 | 원화 | 변환 | 쓰는 곳 |
|---|---|---|---|
| `<이름>-64.png` | `originals/<이름>-64.webp` (지시문의 격자 64) | `64 64 20` (탑은 22) | 큰 그림 칸 — 2배(128px) |
| `<이름>-32.png` | `originals/<이름>-32.webp` (지시문의 격자 16 → 실제 약 32칸) | `32 32 10` (탑 14 · 검 12) | 작은 카트리지 — 1배 |
| `<이름>-24.png` | 위와 같은 원화 | `24 24 9` | 휴대폰 크기 카드 · 디스켓 — 1배 |

이름: tower(리그 오브 디펜스) · pick(컴스톡) · dice(인디게임 5종) · sword(전투 기획서) · coin(BM 기획서). 15장 모두 `--check` 통과.

## 겪은 것

- 지시한 격자와 실제 굵기가 다릅니다: 64 → 약 64칸, 16 → 약 32칸, 12 → 약 14칸(고르지 않음). 변환 크기는 **원화의 실제 굵기에 맞춰야** 깨끗합니다
  (64칸 원화를 48 · 32 로 줄이면 뭉개짐).
- 12 ~ 16칸은 원화의 칸이 고르지 않아 변환하면 모양이 망가집니다(탑의 깃발 · 성가퀴가 사라짐). 이 도구는 32칸 이상에서 씁니다.
- 좁고 긴 물체(첫 탑)는 정사각 상자에 작게 들어가 뭉개졌습니다 — '가로세로가 비슷한' 모양으로 다시 묘사해 뽑았습니다.
- 작은 빨강(깃발)은 색수에 따라 갈색으로 합쳐집니다 — 색수를 바꿔 가며 빨강이 남는 값을 골랐습니다.
- 확대는 정수배 · `image-rendering: pixelated` 만. 생성 그림이라는 표기('그림: AI 이미지 생성 후 픽셀 변환')를 화면에 둡니다.

## 지시문 (원화 하나)

```
Use your built-in image generation tool to create ONE image and save it as <name>.png in the current directory. Do not write code to draw it; generate it with the image tool, using the attached image only as the STYLE reference.

Subject: <subject>. Single object, centered, filling about 85 percent of the canvas.
Style: authentic hand-made pixel art game sprite in the quality of a professional 16-bit era item icon, matching the attached reference exactly in pixel size, outline and shading approach. Chunky visible square pixels on a strict grid as if drawn at <grid>x<grid> pixels and scaled up. Limited palette of about 12 colors with hue-shifted shading (cool dark shadows, warm highlights). Light from the top-left. Clean very dark outline all the way around, clear form shading with big readable clusters, a few specular highlight pixels, no gradients, no blur, no anti-aliasing to the background, no text, no letters, no numbers, no drop shadow, no ground.
Background: perfectly flat solid magenta (#ff00ff) filling the whole square canvas, and do not use that background color anywhere on the object.
After saving, reply with only the file name and its pixel dimensions.
```

실행: `codex exec --skip-git-repo-check -s workspace-write -i style-ref.png -- "$(cat prompt.txt)" < /dev/null`
