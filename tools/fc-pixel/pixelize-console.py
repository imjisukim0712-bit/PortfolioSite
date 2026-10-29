"""스테이지 게임기 그림(18회차) — Codex 가 그린 '도트가 아닌 그림'을 게임기 격자(200 × 100칸) 도트로 옮깁니다.

입력: 1536 × 1024 그림(자리 안내도 layout-guide 를 따름 — 몸통 x 68–1426, y 162–820, 한 칸 = 7px, 배경 #5c94fc)
출력: assets/js/themes/fc-level-art-<이름>.js (칸 격자를 팔레트 + 줄 단위 길이 부호로 담은 데이터 — fc-level-art.js 가 SVG 로 그림)
      + 확인용 PNG(--preview 폴더, 한 칸 = 4px)

  ① 그림은 안내도 자리 그대로라고 보고 격자를 얹음(--fit 을 주면 화면 크림 사각형을 찾아 축척 · 위치를 맞춤 —
     몸통 크림이 화면 색과 비슷하면 잘못 잡으니 어긋난 그림에만). 화면 칸(33–160 × 13–80)은 ④에서 정확한 크림으로 덮음
  ② 배경(하늘색)은 투명, 하늘에 떨어진 그림자(배경보다 어두운 같은 색 계열)는 반투명 검정 한 단계로 — 다크 화면의 남색 하늘에서도 맞게
  ③ 그림 전체를 COLORS 색으로 줄인 뒤, 칸마다 '가장 많이 차지한 색'을 고름(평균을 내지 않아 경계가 번지지 않음)
  ④ 외딴 한 칸 지우기 → (외곽선 있는 화풍만) 실루엣 둘레를 한 칸 외곽선으로 → 화면 칸을 정확한 크림으로
사용: python3.13 tools/fc-pixel/pixelize-console.py <그림.png> <이름> [--colors 20] [--outline auto|none|#rrggbb] [--fit] [--preview 폴더]
      (Pillow · numpy 가 있는 파이썬이 필요합니다)
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

CELL = 7                       # 안내도의 한 칸(px)
OX, OY = 68, 162               # 안내도에서 격자 (0, 0)의 자리
GX0, GY0, GW, GH = -6, -6, 214, 120   # 내보낼 칸 범위(왼쪽 위 여유 6칸 · 오른쪽 아래 두께 · 그림자 자리)
SCREEN = (33, 13, 128, 68)     # 화면 칸(x, y, w, h)
LCD, LCD_SH = (0xff, 0xf6, 0xdd), (0xe3, 0xc9, 0x90)
BG = np.array([0x5c, 0x94, 0xfc], float)


def find_screen(rgb, exp):
    """안내도의 화면 자리 둘레(±70px) 안에서 화면 크림(#fff6dd)이 가로 · 세로로 길게 이어진 줄들의 범위 → (x0, y0, x1, y1) px"""
    x0, y0, x1, y1 = exp[0] - 70, exp[1] - 70, exp[2] + 70, exp[3] + 70
    d = np.abs(rgb[y0:y1, x0:x1].astype(int) - np.array(LCD)).sum(axis=2)
    m = d < 24
    rows, cols = np.where(m.sum(axis=1) > (exp[2] - exp[0]) * .7)[0], np.where(m.sum(axis=0) > (exp[3] - exp[1]) * .7)[0]
    if not len(rows) or not len(cols):
        return None
    return x0 + cols.min(), y0 + rows.min(), x0 + cols.max() + 1, y0 + rows.max() + 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('name')
    ap.add_argument('--colors', type=int, default=20)
    ap.add_argument('--outline', default='none', help='none(기본 — 그림 그대로) · auto · #rrggbb: 실루엣 둘레에 한 칸 외곽선을 더함')
    ap.add_argument('--preview', default='')
    ap.add_argument('--smooth', type=int, default=0, help='먼저 이 크기(홀수 px)의 중간값 거르개로 망점 · 결을 지움')
    ap.add_argument('--sample', default='mode', choices=['mode', 'mean'], help='mode: 칸마다 가장 많은 색(평평한 그림) · mean: 칸 평균을 낸 뒤 색 줄이기(망점 · 질감 있는 그림)')
    ap.add_argument('--ink', type=float, default=0, help='어두운 선 색(밝기 70 미만)이 칸의 이 비율 이상이면 그 선 색으로 — 굵은 외곽선이 끊기지 않게(예: 0.3)')
    ap.add_argument('--line', default='', help='가는 선 색(#rrggbb) — 칸의 20%% 이상이면 그 색으로(도해의 하늘색 치수선처럼 배경 위 가는 선)')
    ap.add_argument('--frame', default='none', help='화면 둘레 한 칸 테 색(none 기본 — 그림 그대로 · auto = 가장 어두운 색)')
    ap.add_argument('--fit', action='store_true', help='화면 사각형을 찾아 축척 · 위치를 맞춤(그림이 안내도에서 어긋났을 때만)')
    ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'js', 'themes'))
    a = ap.parse_args()

    im = Image.open(a.src).convert('RGB')
    if im.size != (1536, 1024):
        im = im.resize((1536, 1024), Image.LANCZOS)
    if a.smooth > 1:
        im = im.filter(ImageFilter.MedianFilter(a.smooth | 1))
    rgb = np.array(im)

    # ① 축척 · 위치: 화면 사각형을 기준점 두 개로
    exp = (OX + SCREEN[0] * CELL, OY + SCREEN[1] * CELL, OX + (SCREEN[0] + SCREEN[2]) * CELL, OY + (SCREEN[1] + SCREEN[3]) * CELL)
    got = (find_screen(rgb, exp) if a.fit else None) or exp
    sx = (got[2] - got[0]) / (exp[2] - exp[0]); sy = (got[3] - got[1]) / (exp[3] - exp[1])
    if not (0.85 < sx < 1.15 and 0.85 < sy < 1.15):
        print('화면 크기가 많이 달라 맞춤을 쓰지 않음', got, file=sys.stderr); got, sx, sy = exp, 1, 1
    def px(cx, cy):  # 칸 좌표 → 그림 px (화면 왼쪽 위를 맞추고 축척 적용)
        return got[0] + (OX + cx * CELL - exp[0]) * sx, got[1] + (OY + cy * CELL - exp[1]) * sy
    print('화면 찾음', got, '축척', round(sx, 3), round(sy, 3), file=sys.stderr)

    # ② 배경 · 그림자 가르기
    f = rgb.astype(float)
    dist = np.sqrt(((f - BG) ** 2).sum(axis=2))
    lum = f.mean(axis=2); bl = BG.mean()
    hue_bg = (f[..., 2] - f[..., 0]) > 40                     # 파란 기운(하늘 계열)
    is_bg = dist < 38
    line = None
    if a.line:
        lc = np.array([int(a.line.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)], float)
        line = np.sqrt(((f - lc) ** 2).sum(axis=2)) < 40
        is_bg = is_bg & ~line
    is_sh = ~is_bg & hue_bg & (lum < bl * 0.86) & (np.abs(f[..., 2] / np.maximum(f[..., 0], 1) - BG[2] / BG[0]) < 1.6)

    # ③ 색 줄이기(그림 부분만) → 칸마다 최빈 색
    obj = ~(is_bg | is_sh)
    strip = Image.fromarray(rgb[obj].reshape(1, -1, 3).astype(np.uint8))          # 그림 부분 칸만 모아 팔레트를 뽑음
    pq = strip.quantize(colors=a.colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    qi = np.array(im.quantize(palette=pq, dither=Image.Dither.NONE))
    pal = np.array(pq.getpalette()[:3 * a.colors]).reshape(-1, 3)
    grid = np.full((GH, GW), -1, int)      # -1 투명, -2 그림자, 0.. 팔레트
    means = {}
    inks = np.array([i for i in range(len(pal)) if pal[i].mean() < 70], int)   # 어두운 선 색들
    for gy in range(GH):
        for gx in range(GW):
            cx, cy = GX0 + gx, GY0 + gy
            x0, y0 = px(cx, cy); x1, y1 = px(cx + 1, cy + 1)
            X0, Y0, X1, Y1 = int(round(x0 + 1)), int(round(y0 + 1)), int(round(x1 - 1)), int(round(y1 - 1))   # 칸 가장자리 1px 는 빼고(경계 번짐)
            if X1 <= X0 or Y1 <= Y0 or X0 < 0 or Y0 < 0 or X1 > 1536 or Y1 > 1024:
                continue
            o = obj[Y0:Y1, X0:X1]; s = is_sh[Y0:Y1, X0:X1]; n = o.size
            if line is not None and line[Y0:Y1, X0:X1].sum() >= n * 0.2 and o.sum() - line[Y0:Y1, X0:X1].sum() < n * 0.5:
                grid[gy, gx] = -3; continue
            if o.sum() > n * 0.5:
                if a.sample == 'mean':
                    means[(gy, gx)] = rgb[Y0:Y1, X0:X1][o].mean(axis=0); grid[gy, gx] = 0
                else:
                    vals = qi[Y0:Y1, X0:X1][o]
                    cnt = np.bincount(vals, minlength=len(pal))
                    pick = cnt.argmax()
                    if a.ink and len(inks):
                        ic = cnt[inks]
                        if ic.sum() >= a.ink * len(vals): pick = inks[ic.argmax()]
                    grid[gy, gx] = pick
            elif s.sum() > n * 0.5:
                grid[gy, gx] = -2

    # ④-1 잡티 지우기: 네 이웃 중 셋 이상이 같은 다른 색이고, 이 칸의 색이 둘레 여덟 칸에 한 번 이하로만 나오면 그 색으로
    #      (한 칸 굵기의 선은 제 방향 이웃 둘이 같은 색이라 남음)
    for _ in range(2):
        g2 = grid.copy()
        for gy in range(1, GH - 1):
            for gx in range(1, GW - 1):
                v = grid[gy, gx]
                nb = [grid[gy - 1, gx], grid[gy + 1, gx], grid[gy, gx - 1], grid[gy, gx + 1]]
                top = max(set(nb), key=nb.count)
                if top == v or nb.count(top) < 3:
                    continue
                ring = grid[gy - 1:gy + 2, gx - 1:gx + 2].flatten().tolist()
                if ring.count(v) <= 2:      # 자기 자신 포함 두 번 이하
                    g2[gy, gx] = top
        grid = g2

    if a.sample == 'mean' and means:   # 칸 평균들로 팔레트를 다시 뽑아 칸마다 가장 가까운 색
        keys_ = list(means.keys()); arr = np.array([means[k] for k in keys_]).astype(np.uint8).reshape(1, -1, 3)
        pq2 = Image.fromarray(arr).quantize(colors=a.colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        idx = np.array(pq2).reshape(-1); pal = np.array(pq2.getpalette()[:3 * a.colors]).reshape(-1, 3)
        for k, v in zip(keys_, idx): grid[k] = int(v)
    colors = [tuple(int(v) for v in pal[i]) for i in range(len(pal))]
    # ④-2 외곽선: 실루엣(그림 칸) 둘레 칸 → 가장 어두운 색(또는 지정 색)
    if a.outline != 'none':
        solid = grid >= 0
        if a.outline == 'auto':
            dark = min((i for i in set(grid[solid].tolist())), key=lambda i: sum(colors[i]))
        else:
            h = a.outline.lstrip('#'); colors.append(tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))); dark = len(colors) - 1
        edge = solid & ~(np.roll(solid, 1, 0) & np.roll(solid, -1, 0) & np.roll(solid, 1, 1) & np.roll(solid, -1, 1))
        grid[edge] = dark
    # ④-3 화면: 정확한 크림 + 위 · 왼 안쪽 한 칸 그늘, 둘레 한 칸은 가장 어두운 색 테(그림의 화면 가장자리와 한두 칸 어긋나 생긴 겹선 · 끊긴 선을 정리)
    x, y, w, h = SCREEN
    if a.frame != 'none':
        if a.frame == 'auto':
            fr = min(set(grid[grid >= 0].tolist()), key=lambda i: sum(colors[i]))
        else:
            hx = a.frame.lstrip('#'); colors.append(tuple(int(hx[i:i + 2], 16) for i in (0, 2, 4))); fr = len(colors) - 1
        X0, Y0 = x - 1 - GX0, y - 1 - GY0
        # 테 바깥 두 칸: 그 줄에서 가장 흔한 색으로 고르게(테 · 화면 크림이 섞여 생긴 잡티를 지움)
        for k in (1, 2):
            for side in ('t', 'b', 'l', 'r'):
                if side in 'tb':
                    yy = Y0 - k if side == 't' else Y0 + h + 1 + k
                    seg = grid[yy, X0 - k:X0 + w + 2 + k]
                    vals = [v for v in seg.tolist() if v >= 0 and v != fr]
                    if vals: grid[yy, X0 - k:X0 + w + 2 + k] = max(set(vals), key=vals.count)
                else:
                    xx = X0 - k if side == 'l' else X0 + w + 1 + k
                    seg = grid[Y0 - k:Y0 + h + 2 + k, xx]
                    vals = [v for v in seg.tolist() if v >= 0 and v != fr]
                    if vals: grid[Y0 - k:Y0 + h + 2 + k, xx] = max(set(vals), key=vals.count)
        grid[Y0, X0:X0 + w + 2] = fr; grid[Y0 + h + 1, X0:X0 + w + 2] = fr
        grid[Y0:Y0 + h + 2, X0] = fr; grid[Y0:Y0 + h + 2, X0 + w + 1] = fr
    colors += [LCD, LCD_SH]; li, ls = len(colors) - 2, len(colors) - 1
    grid[y - GY0:y - GY0 + h, x - GX0:x - GX0 + w] = li
    grid[y - GY0, x - GX0:x - GX0 + w] = ls; grid[y - GY0:y - GY0 + h, x - GX0] = ls

    if line is not None:
        colors.append(tuple(int(v) for v in lc)); grid[grid == -3] = len(colors) - 1
    # 내보내기: 실제로 쓴 색만 다시 번호 매기고, 줄마다 (색, 길이) 길이 부호
    keys = sorted(set(grid[grid >= 0].tolist()))
    remap = {k: i for i, k in enumerate(keys)}
    hexes = ['#%02x%02x%02x' % colors[k] for k in keys]
    rows = []
    for gy in range(GH):
        r, gx = [], 0
        while gx < GW:
            v = grid[gy, gx]; n = 1
            while gx + n < GW and grid[gy, gx + n] == v:
                n += 1
            code = '.' if v == -1 else ',' if v == -2 else chr(65 + remap[v]) if remap[v] < 26 else chr(97 + remap[v] - 26)
            r.append(code + (str(n) if n > 1 else ''))
            gx += n
        rows.append(''.join(r))
    js = ('/* 스테이지 게임기 그림 — %s (18회차, tools/fc-pixel/pixelize-console.py 가 뽑음 · 손으로 고치지 마세요) */\n'
          'window.FcLevelArt && window.FcLevelArt.add(%r, { x: %d, y: %d, w: %d, h: %d,\n  pal: %s,\n  rows: [\n%s\n  ] });\n') % (
        a.name, a.name, GX0, GY0, GW, GH, '[' + ', '.join("'%s'" % c for c in hexes) + ']',
        ',\n'.join("    '%s'" % r for r in rows))
    path = os.path.join(a.out, 'fc-level-art-%s.js' % a.name)
    open(path, 'w').write(js)
    print(path, len(js), '바이트 ·', len(hexes), '색', file=sys.stderr)

    if a.preview:
        os.makedirs(a.preview, exist_ok=True)
        out = np.zeros((GH, GW, 4), np.uint8)
        out[..., :3] = BG; out[..., 3] = 255
        for gy in range(GH):
            for gx in range(GW):
                v = grid[gy, gx]
                if v >= 0: out[gy, gx, :3] = colors[v]
                elif v == -2: out[gy, gx, :3] = (BG * 0.68).astype(np.uint8)
        Image.fromarray(out).resize((GW * 4, GH * 4), Image.NEAREST).save(os.path.join(a.preview, a.name + '.png'))


if __name__ == '__main__':
    main()
