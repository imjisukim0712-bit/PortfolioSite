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
