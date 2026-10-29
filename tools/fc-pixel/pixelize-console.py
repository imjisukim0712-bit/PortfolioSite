"""스테이지 게임기 그림(18회차) — Codex 가 그린 '도트가 아닌 그림'을 그대로 게임기 격자 도트로 옮깁니다(그림에 손대지 않음).

입력: 1536 × 1024 그림(배경 #5c94fc · 화면 #fff6dd 평평한 사각형 — 지시서 docs/design-log/briefs/r18-console-art/BRIEF-2.md 의 규격)
      + 그 그림의 화면 사각형 px(--screen x,y,w,h — Codex 가 NOTES.md 에 적어 줌)
출력: assets/js/themes/fc-level-art-<이름>.js (칸 격자를 팔레트 + 줄 단위 길이 부호로 담은 데이터 — fc-level-art.js 가 SVG 로 그림)
      + 화면 칸 자리(screen: 왼 · 위 · 폭 · 높이, 칸 단위 — 사이트 CSS 가 화면 속 내용을 여기에 얹음) · 그림 px → 칸 변환(map: 칸 (0,0)의 x, y px · 한 칸 px)
      + 확인용 PNG(--preview, 한 칸 = 4px)

  ① 격자: 한 칸 ≈ 7px. 화면 폭이 칸 수 정수가 되도록 칸 크기를 조금 맞추고, 화면 왼쪽 위를 칸 경계에 둔 채 게임기가 200 × 100칸 가운데 오게 놓음
  ② 배경(하늘색)은 투명, 하늘에 떨어진 그림자(배경보다 어두운 같은 색 계열)는 반투명 검정 한 단계로 — 다크 화면의 남색 하늘에서도 맞게
  ③ 그림 전체를 --colors 색으로 줄인 뒤 칸마다 '가장 많이 차지한 색'(--sample mode) 또는 칸 평균 → 색 줄이기(mean).
     질감 · 망점이 있는 그림은 --smooth 로 먼저 중간값 거르개, 굵은 선이 끊기면 --ink 로 어두운 선 색을 먼저 고름
  ④ 외딴 한 칸만 이웃 색으로(잡티), 화면 칸은 정확한 크림 #fff6dd(평평한 화면 규격 그대로)
사용: python3.13 tools/fc-pixel/pixelize-console.py <그림.png> <이름> --screen 334,246,867,455 [--colors 28] [--smooth 5] [--ink 0.3] [--preview 폴더]
      (Pillow · numpy 가 있는 파이썬이 필요합니다)
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

GX0, GY0, GW, GH = -8, -8, 216, 116    # 내보낼 칸 범위(200 × 100 판 + 둘레 여유 — 두께 · 그림자 자리)
LCD = (0xff, 0xf6, 0xdd)
BG = np.array([0x5c, 0x94, 0xfc], float)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('name')
    ap.add_argument('--screen', required=True, help='그림 속 화면 사각형 px: 왼,위,폭,높이')
    ap.add_argument('--cell', type=float, default=7.0, help='한 칸의 대략 크기(px)')
    ap.add_argument('--colors', type=int, default=28)
    ap.add_argument('--smooth', type=int, default=0, help='먼저 이 크기(홀수 px)의 중간값 거르개로 망점 · 붓결을 지움')
    ap.add_argument('--sample', default='mode', choices=['mode', 'mean'], help='mode: 칸마다 가장 많은 색 · mean: 칸 평균을 낸 뒤 색 줄이기')
    ap.add_argument('--ink', type=float, default=0, help='어두운 선 색(밝기 70 미만)이 칸의 이 비율 이상이면 그 색으로 — 굵은 선이 끊기지 않게(예: 0.3)')
    ap.add_argument('--preview', default='')
    ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'js', 'themes'))
    a = ap.parse_args()

    im = Image.open(a.src).convert('RGB')
    if a.smooth > 1:
        im = im.filter(ImageFilter.MedianFilter(a.smooth | 1))
    rgb = np.array(im); H_, W_ = rgb.shape[:2]
    f = rgb.astype(float)

    # ② 배경 · 그림자
    dist = np.sqrt(((f - BG) ** 2).sum(axis=2))
    lum = f.mean(axis=2); bl = BG.mean()
    is_bg = dist < 38
    is_sh = ~is_bg & ((f[..., 2] - f[..., 0]) > 40) & (lum < bl * 0.86) & (np.abs(f[..., 2] / np.maximum(f[..., 0], 1) - BG[2] / BG[0]) < 1.6)
    obj = ~(is_bg | is_sh)

    # ① 격자: 화면 폭을 정수 칸으로, 화면 왼쪽 위를 칸 경계에, 게임기를 판 가운데에
    sx, sy, sw, sh = [float(v) for v in a.screen.split(',')]
    cols = max(1, round(sw / a.cell)); cell = sw / cols; rows_ = round(sh / cell)
    ys, xs = np.where(obj)
    ccx, ccy = (xs.min() + xs.max() + 1) / 2, (ys.min() + ys.max() + 1) / 2     # 게임기(배경 · 그림자 밖) 가운데
    L = round(100 + (sx - ccx) / cell); T = round(50 + (sy - ccy) / cell)
    ox, oy = sx - L * cell, sy - T * cell                                          # 칸 (0, 0)의 px
    print('칸 %.3fpx · 화면 칸 %d, %d, %d × %d · 게임기 %d × %d 칸' % (cell, L, T, cols, rows_, round((xs.max() - xs.min()) / cell), round((ys.max() - ys.min()) / cell)), file=sys.stderr)

    # ③ 색 줄이기 → 칸마다
    strip = Image.fromarray(rgb[obj].reshape(1, -1, 3).astype(np.uint8))
    pq = strip.quantize(colors=a.colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    qi = np.array(im.quantize(palette=pq, dither=Image.Dither.NONE))
    pal = np.array(pq.getpalette()[:3 * a.colors]).reshape(-1, 3)
    inks = np.array([i for i in range(len(pal)) if pal[i].mean() < 70], int)
    grid = np.full((GH, GW), -1, int)      # -1 투명, -2 그림자, 0.. 팔레트
    means = {}
    for gy in range(GH):
        for gx in range(GW):
            cx, cy = GX0 + gx, GY0 + gy
            x0, y0 = ox + cx * cell, oy + cy * cell
            X0, Y0, X1, Y1 = int(round(x0 + 1)), int(round(y0 + 1)), int(round(x0 + cell - 1)), int(round(y0 + cell - 1))   # 칸 가장자리 1px 는 빼고
            if X1 <= X0 or Y1 <= Y0 or X0 < 0 or Y0 < 0 or X1 > W_ or Y1 > H_:
                continue
            o = obj[Y0:Y1, X0:X1]; s = is_sh[Y0:Y1, X0:X1]; n = o.size
            if o.sum() > n * 0.5:
                if a.sample == 'mean':
                    means[(gy, gx)] = rgb[Y0:Y1, X0:X1][o].mean(axis=0); grid[gy, gx] = 0
                else:
                    vals = qi[Y0:Y1, X0:X1][o]
                    cnt = np.bincount(vals, minlength=len(pal)); pick = cnt.argmax()
                    if a.ink and len(inks):
                        ic = cnt[inks]
                        if ic.sum() >= a.ink * len(vals): pick = inks[ic.argmax()]
                    grid[gy, gx] = pick
            elif s.sum() > n * 0.5:
                grid[gy, gx] = -2
    if a.sample == 'mean' and means:
        keys_ = list(means.keys()); arr = np.array([means[k] for k in keys_]).astype(np.uint8).reshape(1, -1, 3)
        pq2 = Image.fromarray(arr).quantize(colors=a.colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        idx = np.array(pq2).reshape(-1); pal = np.array(pq2.getpalette()[:3 * a.colors]).reshape(-1, 3)
        for k, v in zip(keys_, idx): grid[k] = int(v)
    colors = [tuple(int(v) for v in pal[i]) for i in range(len(pal))]

    # ④ 외딴 한 칸(네 이웃이 모두 같은 다른 색)만 이웃 색으로 — 그 밖의 칸은 그림 그대로
    g2 = grid.copy()
    for gy in range(1, GH - 1):
        for gx in range(1, GW - 1):
            nb = [grid[gy - 1, gx], grid[gy + 1, gx], grid[gy, gx - 1], grid[gy, gx + 1]]
            if nb.count(nb[0]) == 4 and nb[0] != grid[gy, gx]:
                g2[gy, gx] = nb[0]
    grid = g2
    colors.append(LCD); grid[T - GY0:T - GY0 + rows_, L - GX0:L - GX0 + cols] = len(colors) - 1

    # 내보내기: 쓴 색만 다시 번호, 줄마다 (색 글자 + 길이)
    keys = sorted(set(grid[grid >= 0].tolist())); remap = {k: i for i, k in enumerate(keys)}
    hexes = ['#%02x%02x%02x' % colors[k] for k in keys]
    rows = []
    for gy in range(GH):
        r, gx = [], 0
        while gx < GW:
            v = grid[gy, gx]; n = 1
            while gx + n < GW and grid[gy, gx + n] == v:
                n += 1
            code = '.' if v == -1 else ',' if v == -2 else chr(65 + remap[v]) if remap[v] < 26 else chr(97 + remap[v] - 26)
            r.append(code + (str(n) if n > 1 else '')); gx += n
        rows.append(''.join(r))
    js = ('/* 스테이지 게임기 그림 — %s (18회차, Codex 그림을 tools/fc-pixel/pixelize-console.py 가 도트로 옮김 · 손으로 고치지 마세요) */\n'
          'window.FcLevelArt && window.FcLevelArt.add(%r, { x: %d, y: %d, w: %d, h: %d, screen: [%d, %d, %d, %d], map: [%.3f, %.3f, %.4f],\n  pal: %s,\n  rows: [\n%s\n  ] });\n') % (
        a.name, a.name, GX0, GY0, GW, GH, L, T, cols, rows_, ox, oy, cell, '[' + ', '.join("'%s'" % c for c in hexes) + ']',
        ',\n'.join("    '%s'" % r for r in rows))
    path = os.path.join(a.out, 'fc-level-art-%s.js' % a.name)
    open(path, 'w').write(js)
    print(path, len(js), '바이트 ·', len(hexes), '색', file=sys.stderr)

    if a.preview:
        os.makedirs(a.preview, exist_ok=True)
        out = np.zeros((GH, GW, 3), np.uint8); out[...] = BG
        for gy in range(GH):
            for gx in range(GW):
                v = grid[gy, gx]
                if v >= 0: out[gy, gx] = colors[v]
                elif v == -2: out[gy, gx] = (BG * 0.68).astype(np.uint8)
        Image.fromarray(out).resize((GW * 4, GH * 4), Image.NEAREST).save(os.path.join(a.preview, a.name + '.png'))


if __name__ == '__main__':
    main()
