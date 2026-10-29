# 18회차 2차 — 규격만 주고 그림은 Codex 에게

사용자: "야 너무 못 그렸어" · "기본 그림은 코덱스 맡기라고. 너가 그림에 직접 개입하지 말아 봐, 규격만 던져 주고"
→ 1차는 Claude 가 그린 자리 안내도(모양까지 그린 그림)를 따라 그리게 해서 그림이 Claude 의 배치에 묶였음.
2차는 **글로 된 규격만** 줍니다(안내도 · 지금 게임기 그림은 주지 않음). 사이트 쪽(누르는 키 · 글자 · 화면 속 내용)이 그림에 맞춰 옮겨 갑니다.

---

## Brief for Codex (English)

You are the illustrator and the designer here — the look, proportions and details of the console are **your call**.
Make **five illustrations** (drawn / painted, not pixel art, not photoreal) of one handheld game console, each in a clearly different, strong art style.
They will later be converted to pixel art faithfully (no redrawing), so make them **beautiful as illustrations first**: confident silhouette, appealing proportions,
a strong style and bold colour. Avoid generic clip-art / stock-icon looks.

### What the console is
A Famicom-inspired handheld for a game designer's portfolio site: a wide screen in the middle and a Famicom-style controller as the grip on each side.
It must clearly read as a handheld game console (an earlier attempt was laughed at for looking like a cassette tape).

### Specs (the only fixed things)
1. Canvas **1536 × 1024** PNG. Background: one flat colour **#5c94fc** edge to edge (it is keyed out; the site's sky is this colour).
2. Front view, the console centred and wide: about **88–92 % of the canvas width**, overall roughly 2 : 1.
   Depth, thickness and a cast shadow are welcome but keep the front face facing the viewer (no tilt, no perspective on the screen).
3. **Screen**: one axis-aligned rectangle, flat plain **#fff6dd**, nothing inside (no glare, no reflection, no UI) — live web content is placed on it.
   Aspect **1.88 : 1** (±5 %), width about **60–66 % of the console width**, centred horizontally.
4. Required controls: left grip — a D-pad and one small rubber key; right grip — two round buttons (one above or beside the other).
   Optional: slide switches / a power lamp / vents on top, a cartridge slot on the bottom edge (cartridges slide up into it from below).
5. Under the D-pad, under the rubber key and under each round button keep a small **plain area** (no ornament) where a short label is printed later — we add the text.
6. No text, letters, logos, brand names, trademarks or characters anywhere.

### References (in `refs/`)
- `user-ref-1-snes-pixel.png`, `user-ref-2-controllers-pixel.png`, `user-ref-3-iso-pixel.png` — **the user's own picks**: rich multi-step volume (1),
  bold flat graphic shapes with a thickness band and hard shadow (2), isometric diagram feel (3).
- `style-riso-*.jpg` (risograph console prints — strong line style, limited bold inks) and `style-famicase-*.jpg` (bold, saturated label art).
- The user wants **a strong art style and bold, "hardcore" colours**.
- Choose the five directions yourself from these references; make each one distinctive and well crafted.

### Deliverables
- `out2/1.png` … `out2/5.png` (1536 × 1024, made with your image-generation tool; save/copy to exactly these paths).
- Check each against the specs (screen colour / aspect / flatness, background colour, no text) and regenerate if needed.
- `out2/NOTES.md`: for each image, the style name in a few words and its main palette (hex).
- Do not touch anything outside this folder.

---

## 3차 — 색 규격: 검빨금

사용자: "색 자체는 검빨금으로 가는 게 맞음" → 2차 다섯 그림의 화풍 · 모양은 그대로, 색만 검정 · 빨강 · 금색으로(Codex 가 다시 그림, `out3/`).

### Brief for Codex — round 3 (English)
Keep each of your five round-2 designs and art styles (`out2/1.png` … `out2/5.png`: crimson risograph, cut-paper arcade, precision ink,
electric gouache, anime mecha cel) — same console shape, same rendering style — but **recolour every one to a black · red · gold palette**:
- Black: warm near-black for the body or outline (e.g. #141114 … #2a2226), Red: Famicom red family (e.g. #c8102e, #e0242f, deep #7a0e1c),
  Gold: brass / gold family (e.g. #d4a849, #f0cb6a, dark #8a6420). Use only tones of these three hues (plus white glints if the style needs them).
- No other hues (no turquoise, pink, orange, lime, purple, yellow-green). The screen stays flat **#fff6dd**, the background stays flat **#5c94fc**.
- Each image should still look clearly different from the others by its rendering style and by how it distributes black / red / gold.
- All round-2 specs still apply (1536 × 1024, front view, screen aspect 1.88 : 1 and flat, empty label spaces, no text or logos).
- Save as `out3/1.png` … `out3/5.png` and add the palette per image to `out3/NOTES.md`.

---

## 4차 — 도트로 옮기기 좋은 평평한 그림

사용자: (2판 도트에) "아직 좀 많이 깨져 보임. 이것보다는 더 단순하고 깔끔한 도트를 원해" → 원본의 질감(리소 망점 · 과슈 붓결 · 잉크 빗금)이 200 × 100칸에서 조각으로 남음.
디자인(모양 · 배치 · 검빨금 분포 · 화면 자리)은 3차 그대로, **칠하는 법만 평평하게** — 도트 팔레트 색만 · 면마다 세 단계 · 굵기 8px 외곽선 · 질감 없음(Codex 가 다시 그림, `out4/`).
변환은 `pixelize-console.py --flat`(색을 그대로 읽고 외곽선만 한 칸으로).

### Brief for Codex — round 4 (English): flat, clean versions for pixel-art conversion

The user wants the final pixel art to look **simple and clean** ("더 단순하고 깔끔한 도트"). Your round-3 drawings (`out3/1.png` … `out3/5.png`) carry
rich textures (risograph halftone, gouache brush strokes, ink hatching, speckle); when they are converted to a 200 × 100 pixel grid those textures turn
into broken, noisy pixels. So please **redraw each of the five as a flat, clean graphic version of the same design**:

Keep (per image):
- the same console design: silhouette, proportions, front view, part layout, how black / red / gold are distributed;
- the **screen rectangle at exactly the same pixel position and size** as in out3 (flat #fff6dd, nothing inside), background flat #5c94fc edge to edge;
- the controls (D-pad, small rubber key, two round buttons) at the same positions and sizes (within ± 4 px), and the plain label spaces under them;
- no text, letters, logos or characters.

Change (all five):
1. **Flat fills only**: no gradients, no texture of any kind (no halftone, stipple, grain, brush strokes, hatching, crosshatching, speckle, noise, scratches).
2. **Use only these exact colours** (they are the pixel palette):
   - outline `#0f0a0c`
   - black: shadow `#1e1519` · base `#30242a` · light `#4b3c42`
   - red: shadow `#8c0e22` · base `#c8102e` · light `#ea3a33`
   - gold: shadow `#9a6a1e` · base `#d4a23e` · light `#f0cc6a`
   - optional tiny specular `#ffffff`; screen `#fff6dd`; background `#5c94fc`.
   At most these three tones per colour; shading = a few large, clean shapes (for example a light band along top / left edges and a shadow band along
   bottom / right edges of each part), light from the top-left.
3. **Uniform outline**: a `#0f0a0c` outline of constant thickness **8 px** around the whole silhouette and around every part (D-pad, rubber key, buttons,
   screen frame / bezel, panels, slot). Gold rims, if the design has them, at least 8 px wide.
4. **Simple geometric shapes**: straight edges stay perfectly straight, curves smooth; no feature smaller than 14 px except outlines; drop tiny details.
5. Each version should still be recognisably the same design as its out3 original (riso, cut-paper, ink, gouache, mecha — now as clean flat graphics).

Deliverables:
- `out4/1.png` … `out4/5.png` (1536 × 1024 PNG, built with your image tool and/or code — exact flat colours matter more than painterly quality;
  after generating, snap every console pixel to the nearest palette colour and re-flatten background / screen if needed).
- `out4/controls.json` — same format as `out3/controls.json` (measure dpad, rubber, btnUpper, btnLower, labelDpad, labelRubber, labelUpper, labelLower in px).
- `out4/NOTES.md` — per image: the screen rect (x, y, w, h) and anything that changed.
- Do not touch anything outside `out4/`.
