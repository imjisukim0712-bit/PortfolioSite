# 18회차 — 스테이지 게임기 그림: Codex 가 '도트가 아닌 그림'을 먼저 그리고, Claude 가 도트로 옮김

사용자 지시: "codex 한테 내가 준 레퍼런스 이미지들이랑 이미지 몇 개 찾아서 주고, 걔한테 일단 픽셀이 아닌 그림으로 만들어 보라 하고,
그걸 가져오면 너가 그 이미지들을 픽셀화하는 작업으로 진행해 봐. 너는 너무 큰 그림을 못 봐." · "아예 그런 실사 말고" ·
"좀 화풍도 있고 색깔도 코어하고 이런 것들로 보내"

- 참고 그림(저장소에는 넣지 않음 — 남의 작품): 사용자가 준 도트 그림 3장 · 리소 판화 콘솔 포스터 · 팬이 만든 패미컴 카트리지 라벨(Famicase).
- 자리 안내도: `layout-guide.png`(지금 게임기 그림의 칸 좌표 그대로 — 화면 · 십자 · 고무 버튼 · B · A · 글자 자리).
- 결과 이미지는 `scratchpad/r18-codex/out/` 에 받고, 도트로 옮긴 결과만 저장소에 넣습니다.

---

## Brief for Codex (English)

You are an illustrator. Make **five non-pixel illustrations** (drawn / painted, NOT pixel art, NOT photoreal) of one handheld game console.
Claude will afterwards convert each illustration into pixel art on a 200 × 100 grid (about 4 px per cell), so design for that:
strong readable silhouettes, bold colour blocks, a few strong value steps, clear shapes, no tiny noisy detail, **no text anywhere**.

### The console
A Famicom-themed handheld for a game designer's portfolio site. A wide screen in the middle, and one Famicom-style controller as the grip on each side
(left: D-pad + one rubber key; right: two round buttons B (upper) and A (lower)). Top edge: two small slide switches, a power lamp, vents.
Bottom: a band with a cartridge slot (cartridges slide UP into it from below). It lives in a Super Mario Bros. 1-1 style world (flat sky blue #5c94fc,
brick ground) on the site, so it must look great on that sky.

Current pixel version: `refs/current-console-pixel-art.png` — the user finds it too flat and plain ("1차원적"). A previous attempt at a 3/4 box view was
mocked as "a cassette tape", so it must clearly read as a **handheld game console with controllers on both sides**, not a box or a tape.

### References (in `refs/`)
- `user-ref-1-snes-pixel.png`, `user-ref-2-controllers-pixel.png`, `user-ref-3-iso-pixel.png` — **the user's own picks, the main direction**:
  soft multi-step volume and warm palette (1), bold flat shapes with a thickness band + hard drop shadow + striped faceplate (2), isometric diagram feel with cyan guide lines (3).
- `style-riso-*.jpg` — risograph console prints: strong line style, limited bold inks, halftone.
- `style-famicase-*.jpg` — fan-made Famicom cartridge labels: bold, saturated, playful colour.
- The user explicitly wants **a strong art style and bold, "hardcore" colours** — not realistic product renders, not generic stock-icon flat art.

### Hard constraints (all five)
1. Front view, landscape. Follow `layout-guide.png` exactly: canvas **1536 × 1024**, console body at x 68–1426, y 162–820.
   Keep the positions/sizes of **SCREEN, D-pad, rubber key, B, A** and leave the four **blue label zones empty** (live text is placed there).
2. SCREEN rectangle: flat plain light cream **#fff6dd**, nothing inside, no glare.
3. Depth / thickness / shadow only to the right and bottom (purple zone in the guide). The top-left silhouette must stay where the guide puts it.
4. Background: one flat colour, **#5c94fc**, edge to edge (it will be keyed out).
5. No logos, brand names, trademarks, characters, or any lettering (the B / A in the guide are only markers — draw plain buttons).

### Five directions (make them clearly different)
- **A · 16-bit render** — like a 1990s console-magazine painted illustration (ref 1): soft rounded volume, glossy highlights, warm saturated palette, coloured (not black) outlines.
- **B · Graphic poster** — bold flat shapes, no outlines, a darker thickness band, hard offset shadow on the sky, striped faceplates, punchy red / cream / navy (ref 2).
- **C · Riso print** — two- or three-ink risograph look: bold line art, halftone shading, slight misregistration, fluorescent pink-red + blue + yellow (riso refs).
- **D · Pop sticker** — saturated pop palette (hot pink, teal, yellow, violet), thick outline, sticker-like, playful (Famicase refs). Still a Famicom-style controller layout.
- **E · Diagram** — technical illustration (ref 3): clean line work, flat fills, cyan guide lines and small dimension ticks **outside** the body, the console itself intact.

### Deliverables
- `out/A-render.png`, `out/B-graphic.png`, `out/C-riso.png`, `out/D-pop.png`, `out/E-diagram.png` — each 1536 × 1024, made with your image-generation tool
  (save or copy the final images to exactly these paths).
- After each one, open it and compare with `layout-guide.png`; if the screen or buttons drifted a lot, regenerate.
- `out/NOTES.md` — for each image: one line on the idea and its main palette (hex).
- Do not touch anything outside this folder.
