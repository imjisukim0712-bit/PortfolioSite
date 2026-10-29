"""스테이지 게임기 그림(18회차) — Codex 가 그린 '도트가 아닌 그림'을 단순하고 깔끔한 도트 그림으로 옮깁니다.

칸마다 그 자리 색을 고르면(해상도만 낮추면) 붓결 · 망점 · 손그림의 떨림이 그대로 칸에 찍혀 깨진 그림이 됩니다.
그래서 모양 · 색 배치는 그림에서 읽되, 먼저 그림을 '큰 면 몇 개'로 매끈하게 정리한 뒤 칸 가운데를 찍어 옮깁니다
(매끈한 경계를 칸 가운데에서 찍으면 계단이 규칙적으로 나옴 — 도트의 깔끔한 선).

  ① 면: 그림 px 마다 재료(검정 · 빨강 · 금색 · 흰 반짝임)와 세 단계(그늘 · 바탕 · 빛 — 그 재료에서 가장 넓게 칠한 밝기가 바탕)를 읽고,
     단계마다 흐린 '표'를 모아 가장 많은 쪽으로(질감 · 떨림이 사라지고 면 경계가 매끈해짐). 실루엣도 흐린 뒤 자름
  ② 칸: 칸 가운데 한 점을 찍음. 몇 칸짜리 조각은 이웃 면으로
  ③ 가는 것: 칸보다 가는 테(버튼 금테 등) · 그림의 잉크 선 · 검은 부품의 빛선 · 흰 반짝임은 그림에서 중심선을 따서 한 칸 굵기로
     (끊기지 않게 · 다섯 칸 미만 토막과 실루엣에 붙은 잉크 선은 버림 · ㄱ자 모서리 칸은 뺌)
  ④ 부품(같은 재료로 이어진 면)마다 테두리 한 칸을 위 · 왼쪽 한 단계 밝게, 아래 · 오른쪽 한 단계 어둡게(17회차 스테이지 규칙)
  ⑤ 실루엣 외곽선 한 칸 검정, 화면 칸은 크림 #fff6dd. 색은 RAMPS(재료마다 다섯 색)뿐 · 바둑판 디더 없음
  --flat(지금 쓰는 길): 그림이 이미 RAMPS 의 색으로만 평평하게 칠해져 있을 때(Codex 4차, 8px 외곽선) — ①의 단계 읽기 대신 px 마다 가장 가까운 팔레트 색,
     외곽선 px 는 면에서 걷어 내고(가장 가까운 면 색으로 채움) 선 한가운데를 따서 한 칸으로 다시 그음 · 사이가 검은 두 겹 선은 한 줄로 합침 ·
     곧은 선의 빗살(한 칸만 옆 줄로 튄 칸) 펴기 · ④ 테두리 빛 · 그늘은 그림의 것을 그대로 씀
  격자 · 화면 자리 · 출력 형식은 앞과 같습니다(한 칸 ≈ 7px, 화면 폭 = 정수 칸, 게임기는 200 × 100칸 판 가운데).
사용: python3.13 tools/fc-pixel/pixelize-console.py <그림.png> <이름> --screen 334,246,867,455 --look riso --flat [--preview 폴더]
      (Pillow · numpy · scipy · scikit-image 가 있는 파이썬이 필요합니다)
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
from skimage.color import rgb2lab
from skimage.morphology import skeletonize

GX0, GY0, GW, GH = -8, -8, 216, 116    # 내보낼 칸 범위(200 × 100 판 + 둘레 여유 — 두께 · 그림자 자리)
LCD = '#fff6dd'
BG = np.array([0x5c, 0x94, 0xfc], float)

# 재료별 다섯 색: 0 가장 어두움(선) · 1 그늘 · 2 바탕 · 3 빛 · 4 반짝임
MATS = ['K', 'R', 'G', 'W']
RAMPS = {
    'K': ['#0f0a0c', '#1e1519', '#30242a', '#4b3c42', '#6e5d63'],
    'R': ['#3a0610', '#8c0e22', '#c8102e', '#ea3a33', '#ff8a6a'],
    'G': ['#3d290c', '#9a6a1e', '#d4a23e', '#f0cc6a', '#fff2b8'],
    'W': ['#ffffff'],
}
# 화풍별 — median: 질감 지우는 거르개(px) · soft: 단계를 읽는 밝기를 펴는 폭(칸) · delta: 바탕에서 이만큼(L) 어둡/밝으면 그늘/빛
#          vote: 면 경계를 펴는 폭(칸 — 클수록 단순) · min: 이보다 작은 단계 조각은 이웃 단계로(재료 조각은 그 두 배, 칸)
LOOKS = {
    'riso':     dict(median=9, soft=1.4, delta=9, vote=1.1, min=10),
    'cutpaper': dict(median=5, soft=.7, delta=8, vote=.6, min=8),
    'ink':      dict(median=7, soft=1.0, delta=6, vote=.7, min=10),
    'gouache':  dict(median=9, soft=1.6, delta=9, vote=1.2, min=12),
    'mecha':    dict(median=5, soft=.8, delta=8, vote=.6, min=8),
}


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)


def classify(f):
    """px 마다 재료 번호: 0 검정 · 1 빨강 · 2 금색 · 3 흰색."""
    mx, mn = f.max(2), f.min(2); v = mx / 255; s = (mx - mn) / np.maximum(mx, 1)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]; d = np.maximum(mx - mn, 1e-6)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    m = np.where((h >= 18) & (h < 200), 2, 1)
    m = np.where(s < .26, 0, m)                    # 채도 낮은 회색 = 검정 재료의 밝은 단계
    m = np.where((s < .2) & (v > .84), 3, m)
    m = np.where((v < .26) | ((s < .46) & (v < .56)), 0, m)
    return m


def major(arr, y, x, skip, ok=lambda q: q >= 0):
    """(y, x) 둘레 8칸에서 skip 이 아닌 가장 흔한 값(4방향 이웃은 두 표)."""
    vals = {}
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if (dy or dx) and 0 <= y + dy < arr.shape[0] and 0 <= x + dx < arr.shape[1]:
                v = arr[y + dy, x + dx]
                if v != skip and ok(v): vals[v] = vals.get(v, 0) + (2 if not (dy and dx) else 1)
    return max(vals, key=vals.get) if vals else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('name')
    ap.add_argument('--screen', required=True, help='그림 속 화면 사각형 px: 왼,위,폭,높이')
    ap.add_argument('--look', required=True, choices=sorted(LOOKS), help='화풍별 읽는 법(LOOKS)')
    ap.add_argument('--cell', type=float, default=7.0, help='한 칸의 대략 크기(px)')
    ap.add_argument('--flat', action='store_true', help='그림이 이미 RAMPS 의 색으로만 평평하게 칠해져 있을 때(Codex 4차) — 면 색은 그대로 찍고, 외곽선은 중심선으로 한 칸')
    ap.add_argument('--preview', default='')
    ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'js', 'themes'))
    a = ap.parse_args(); L = LOOKS[a.look]

    im = Image.open(a.src).convert('RGB')
    raw = np.array(im).astype(float); H_, W_ = raw.shape[:2]
    sm = np.array(im.filter(ImageFilter.MedianFilter(L['median'] | 1))).astype(float)
    sm3 = np.array(im.filter(ImageFilter.MedianFilter(3))).astype(float)

    # 격자: 화면 폭을 정수 칸으로, 화면 왼쪽 위를 칸 경계에, 게임기를 판 가운데에(앞과 같음 — CSS 자리가 그대로 맞게)
    dist = np.sqrt(((raw - BG) ** 2).sum(axis=2)); lum = raw.mean(axis=2); bl = BG.mean()
    is_bg = dist < 38
    is_sh = ~is_bg & ((raw[..., 2] - raw[..., 0]) > 40) & (lum < bl * 0.86) & (np.abs(raw[..., 2] / np.maximum(raw[..., 0], 1) - BG[2] / BG[0]) < 1.6)
    obj0 = ~(is_bg | is_sh)
    sx, sy, sw, sh = [float(v) for v in a.screen.split(',')]
    cols = max(1, round(sw / a.cell)); cell = sw / cols; rows_ = round(sh / cell)
    ys, xs = np.where(obj0)
    ccx, ccy = (xs.min() + xs.max() + 1) / 2, (ys.min() + ys.max() + 1) / 2
    Lc0 = round(100 + (sx - ccx) / cell); Tc0 = round(50 + (sy - ccy) / cell)
    ox, oy = sx - Lc0 * cell, sy - Tc0 * cell
    sl, st = Lc0 - GX0, Tc0 - GY0
    print('칸 %.3fpx · 화면 칸 %d, %d, %d × %d' % (cell, Lc0, Tc0, cols, rows_), file=sys.stderr)

    # ① 면: 재료 × 세 단계(1 그늘 · 2 바탕 · 3 빛, 아주 밝은 곳은 4 반짝임) — 바탕 = 그 재료에서 가장 넓게 칠한 밝기
    obj = ndi.gaussian_filter(obj0.astype(np.float32), cell * .6) > .5
    shad = ndi.gaussian_filter(is_sh.astype(np.float32), cell * .6) > .5
    mpx = classify(sm); lpx = rgb2lab(sm / 255)[..., 0]
    cls = np.full(mpx.shape, -1, int)
    for m in (range(0) if a.flat else range(3)):
        sel = (mpx == m) & obj0
        if not sel.any(): continue
        sg = cell * L['soft']
        Ls = ndi.gaussian_filter(lpx * sel, sg) / np.maximum(ndi.gaussian_filter(sel.astype(float), sg), 1e-6)
        base = np.bincount(np.clip(Ls[sel], 0, 100).astype(int), minlength=101).argmax() + .5
        d = L['delta']; t = np.full(Ls.shape, 2)
        t[Ls < base - d] = 1; t[Ls > base + d] = 3; t[Ls > base + 2.8 * d] = 4
        cls[sel] = m * 5 + t[sel]
    if a.flat:      # 평평한 그림: px 마다 가장 가까운 팔레트 색 = (재료, 단계) 그대로
        pal = [(m * 5 + t, rgb(RAMPS[MATS[m]][t])) for m in range(3) for t in range(4)] + [(15, rgb('#ffffff')), (16, rgb(LCD))]
        dmin = np.full(mpx.shape, 1e9, np.float32)
        for k, c in pal:
            d = ((sm3 - c) ** 2).sum(axis=2).astype(np.float32); up = d < dmin; dmin[up] = d[up]; cls[up] = k
        cls[~obj0] = -1
        #    외곽선 px: 두꺼운 검정 면(폭 12px 넘음)은 면으로 두고, 가는 선만 면에서 걷어 내(가장 가까운 면 색으로 채움) 아래 ③에서 중심선으로 다시 그음.
        #    10px 안으로 붙은 선 두 줄(버튼의 두 겹 고리 등 — 사이가 검은 면)은 한 줄로 합침 — 200칸에서는 구슬처럼 끊김
        k0 = cls == 0
        disk = lambda r: (np.add.outer(np.arange(-r, r + 1) ** 2, np.arange(-r, r + 1) ** 2) <= r * r)
        thick = ndi.binary_opening(k0, disk(6))
        lab, n = ndi.label(thick)                # 선이 만나는 곳의 작은 덩어리는 두꺼운 면이 아님
        if n: thick &= (ndi.sum(np.ones_like(lab), lab, np.arange(n + 1)) >= 900)[lab]
        k0px = ndi.binary_closing(k0 & ~thick, disk(5)) & obj0 & ~thick & (k0 | (cls // 5 == 0))   # 사이가 검은 면일 때만(금테 · 빨강 테는 살림)
        idx = ndi.distance_transform_edt((cls <= 0) & ~thick | k0px | (cls == 16), return_distances=False, return_indices=True)   # 화면 크림은 채움 재료로 쓰지 않음(화면 칸은 아래에서 따로)
        cls = cls[idx[0], idx[1]]; cls[~obj0] = -1
    else:
        cls[(mpx == 3) & obj0] = 15
    #    단계마다 흐린 표를 모아 가장 많은 쪽으로(재료 경계 · 단계 경계가 매끈해짐)
    keys = sorted(set(cls[obj0].ravel().tolist()))
    best = np.full(mpx.shape, -1, int); bv = np.zeros(mpx.shape, np.float32)
    for k in keys:
        v = ndi.gaussian_filter((cls == k).astype(np.float32), cell * (.3 if a.flat else L['vote']))
        up = v > bv; best[up] = k; bv[up] = v[up]

    # ② 칸 가운데 한 점
    mat = np.full((GH, GW), -1, int); lev = np.zeros((GH, GW), int); FL = np.zeros((GH, GW))
    for gy in range(GH):
        for gx in range(GW):
            px, py = int(ox + (GX0 + gx + .5) * cell), int(oy + (GY0 + gy + .5) * cell)
            if not (0 <= px < W_ and 0 <= py < H_): continue
            if a.flat:
                x0, y0 = int(ox + (GX0 + gx) * cell), int(oy + (GY0 + gy) * cell)
                FL[gy, gx] = (cls[max(y0, 0):y0 + int(cell) + 1, max(x0, 0):x0 + int(cell) + 1] == 0).mean()
            if obj[py, px] and best[py, px] >= 0:
                k = best[py, px]; mat[gy, gx] = min(k // 5, 3); lev[gy, gx] = 0 if k == 15 else k % 5
            elif shad[py, px]:
                mat[gy, gx] = -2
    scr = np.zeros((GH, GW), bool); scr[st:st + rows_, sl:sl + cols] = True
    mat[scr] = 3; lev[scr] = 0
    #    반짝임(4단계)은 작은 점에만 — 넓게 번진 반짝임은 빛(3단계)으로
    for m in range(3):
        lab, n = ndi.label((mat == m) & (lev == 4), structure=np.ones((3, 3)))
        for i in range(1, n + 1):
            C = lab == i
            if C.sum() > 6: lev[C] = 3
    #    작은 조각 → 이웃 면(재료 조각 먼저, 그다음 같은 재료 안의 단계 조각)
    code = lambda: np.where(mat >= 0, mat * 5 + lev, -1)
    for _ in range(2):
        for by_mat in (True, False):
            c = code(); key = np.where(c >= 0, c // 5, -1) if by_mat else c
            for k in sorted(set(key[key >= 0].ravel().tolist())):
                if k == 3 and by_mat: continue
                lab, n = ndi.label(key == k, structure=np.ones((3, 3)))
                if not n: continue
                sizes = ndi.sum(np.ones_like(lab), lab, range(1, n + 1))
                for i, sz in enumerate(sizes, 1):
                    if sz >= (L['min'] * 2 if by_mat else L['min']): continue
                    for gy, gx in zip(*np.where(lab == i)):
                        if scr[gy, gx]: continue
                        same = (lambda q, m=mat[gy, gx]: q >= 0 and q // 5 == m) if not by_mat else (lambda q: q >= 0)
                        w = major(c, gy, gx, c[gy, gx], same)
                        if w is not None: mat[gy, gx], lev[gy, gx] = w // 5, w % 5
                c = code(); key = np.where(c >= 0, c // 5, -1) if by_mat else c

    # ③ 가는 것: 금테 · 빨강 띠 · 잉크 선 · 흰 반짝임은 그림의 중심선을 따서 한 칸 굵기로
    lraw = rgb2lab(sm3 / 255)[..., 0]; mpx3 = classify(sm3)
    inkpx = (lraw < ndi.median_filter(lraw, 15) - 7) & (lraw < 30)
    lab, n = ndi.label(inkpx, structure=np.ones((3, 3)))
    if n: inkpx &= (ndi.sum(np.ones_like(lab), lab, np.arange(n + 1)) >= 60)[lab]
    litpx = (lraw > ndi.median_filter(lraw, 15) + 10) & (mpx3 == 0)     # 검은 부품의 빛선(검은 몸 위 검은 십자 버튼의 모서리)
    lab, n = ndi.label(litpx, structure=np.ones((3, 3)))
    if n: litpx &= (ndi.sum(np.ones_like(lab), lab, np.arange(n + 1)) >= 40)[lab]
    fine = np.zeros((GH, GW), bool)            # 중심선으로 찍은 칸(아래 정리에서 건드리지 않음)
    objm = mat >= 0
    rim = objm & ~ndi.binary_erosion(objm, np.ones((3, 3)), border_value=0)   # 실루엣 둘레 두 칸 — 외곽선과 겹치는 잉크 선은 찍지 않음
    rim = (ndi.binary_dilation(rim, np.ones((3, 3))) & objm) if not a.flat else (ndi.binary_dilation(rim, [[0, 1, 0], [1, 1, 1], [0, 1, 0]]) & objm & ~rim)
    mat0, lev0 = mat.copy(), lev.copy()
    bases = {m: np.bincount(np.clip(lraw[(mpx3 == m) & obj0], 0, 100).astype(int), minlength=101).argmax() for m in range(3) if ((mpx3 == m) & obj0).any()}
    for m, Mp, kind in (((0, k0px & obj0, 'ink'),) if a.flat else ((0, inkpx & obj0, 'ink'), (0, litpx & obj0, 'lit'), (1, (mpx3 == 1) & obj0 & ~inkpx, ''), (2, (mpx3 == 2) & obj0 & ~inkpx, ''), (3, (mpx3 == 3) & obj0, ''))):
        if not Mp.any(): continue
        dd = ndi.distance_transform_edt(Mp)
        sk = skeletonize(Mp) & (dd <= cell * (2.6 if a.flat else .62)) & (dd >= (.5 if a.flat else 1))
        lab, n = ndi.label(sk, structure=np.ones((3, 3)))
        if not n: continue
        sk &= (ndi.sum(np.ones_like(lab), lab, np.arange(n + 1)) >= cell * (1.5 if a.flat else 3 if m == 0 else 2))[lab]
        yy, xx = np.where(sk)
        cy = np.floor((yy - oy) / cell).astype(int) - GY0; cx = np.floor((xx - ox) / cell).astype(int) - GX0
        ok = (cy >= 0) & (cy < GH) & (cx >= 0) & (cx < GW)
        acc = {}
        for y_, x_, l_ in zip(cy[ok], cx[ok], lraw[yy[ok], xx[ok]]):
            acc.setdefault((y_, x_), []).append(l_)
        for (y_, x_), ls in acc.items():
            if mat[y_, x_] < 0 or scr[y_, x_] or len(ls) < (3 if a.flat else 2) or (kind == 'ink' and rim[y_, x_]): continue
            if kind == 'ink' or m == 3: t = 0
            elif kind == 'lit': t = 3
            else:
                lm = np.median(ls); b = bases.get(m, lm); d = L['delta']
                t = 1 if lm < b - d else 3 if lm > b + d else 2
            mat[y_, x_] = m; lev[y_, x_] = t; fine[y_, x_] = True
    #    짧은 선 토막(다섯 칸 미만)은 지움 — 망점 · 붓 자국이 선으로 남지 않게
    for k in sorted(set((mat[fine] * 5 + lev[fine]).tolist())):
        lab, n = ndi.label(fine & (mat * 5 + lev == k), structure=np.ones((3, 3)))
        for i in range(1, n + 1):
            C = lab == i
            if C.sum() < (2 if k == 15 else 3 if a.flat else 6): mat[C], lev[C] = mat0[C], lev0[C]; fine[C] = False
    #    곧은 선의 빗살 펴기: 위아래(또는 좌우)는 옆 줄로 이어지는데 한 칸만 튀어나온 칸 → 옆 줄로 옮김
    for _ in range(2):
        Kf = fine & (mat == 0) & (lev == 0)
        for gy in range(1, GH - 1):
            for gx in range(1, GW - 1):
                if not Kf[gy, gx]: continue
                for s in (-1, 1):
                    for (ay, ax), (by_, bx), (ty, tx) in ((((gy - 1, gx), (gy + 1, gx), (gy, gx + s))), (((gy, gx - 1), (gy, gx + 1), (gy + s, gx)))):
                        if Kf[ay, ax] or Kf[by_, bx] or Kf[ty, tx] or scr[ty, tx] or mat[ty, tx] < 0: continue
                        if (ty, tx) == (gy, gx + s): a1, b1 = (gy - 1, gx + s), (gy + 1, gx + s)
                        else: a1, b1 = (gy + s, gx - 1), (gy + s, gx + 1)
                        if Kf[a1] and Kf[b1]:
                            w = major(np.where(fine, -1, np.where(mat >= 0, mat * 5 + lev, -1)), gy, gx, -1)
                            if w is None: continue
                            mat[gy, gx], lev[gy, gx] = w // 5, w % 5; fine[gy, gx] = Kf[gy, gx] = False
                            mat[ty, tx], lev[ty, tx] = 0, 0; fine[ty, tx] = Kf[ty, tx] = True
                            break
                    else: continue
                    break
    #    한 칸 선의 ㄱ자 모서리 칸 빼기(대각선으로 이어지게)
    for gy in range(1, GH - 1):
        for gx in range(1, GW - 1):
            if not fine[gy, gx]: continue
            c = mat[gy, gx] * 5 + lev[gy, gx]
            same = lambda y, x: fine[y, x] and mat[y, x] * 5 + lev[y, x] == c
            n4 = [same(gy - 1, gx), same(gy, gx + 1), same(gy + 1, gx), same(gy, gx - 1)]
            n8 = sum(same(gy + dy, gx + dx) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
            if n8 == 2 and sum(n4) == 2 and not (n4[0] and n4[2]) and not (n4[1] and n4[3]):
                w = major(np.where(fine, -1, np.where(mat >= 0, mat * 5 + lev, -1)), gy, gx, -1)
                if w is not None: mat[gy, gx], lev[gy, gx] = w // 5, w % 5; fine[gy, gx] = False

    # ④ 부품 테두리 빛 · 그늘(실루엣 외곽선 칸 · 중심선 칸 · 화면은 빼고)
    objm = mat >= 0
    edge = objm & ~(np.roll(objm, 1, 0) & np.roll(objm, -1, 0) & np.roll(objm, 1, 1) & np.roll(objm, -1, 1))
    for m in (range(0) if a.flat else range(3)):
        lab, n = ndi.label((mat == m) & ~fine & ~edge & ~scr)
        for i in range(1, n + 1):
            C = lab == i
            if C.sum() < 20: continue
            out = ~C
            up, lf, dn, rt = np.roll(out, 1, 0), np.roll(out, 1, 1), np.roll(out, -1, 0), np.roll(out, -1, 1)
            lit = C & (up | lf) & ~(dn | rt); shd = C & (dn | rt) & ~(up | lf)
            lev[lit] = np.where(lev[lit] >= 4, 4, np.minimum(lev[lit] + 1, 3)); lev[shd] = np.maximum(lev[shd] - 1, 1 if m == 0 else 0)

    # ⑤ 실루엣 외곽선 · 색
    col = np.full((GH, GW), '', object)
    for gy, gx in zip(*np.where(objm)):
        m = mat[gy, gx]
        if scr[gy, gx]: col[gy, gx] = LCD
        elif edge[gy, gx]: col[gy, gx] = RAMPS['K'][0]
        else: rp = RAMPS[MATS[m]]; col[gy, gx] = rp[int(np.clip(lev[gy, gx], 0, len(rp) - 1))]

    # 내보내기: 쓴 색만, 줄마다 (색 글자 + 길이)
    hexes = sorted({c for c in col.ravel() if c}); idx = {h: i for i, h in enumerate(hexes)}
    ch = lambda gy, gx: '.' if mat[gy, gx] == -1 else ',' if mat[gy, gx] == -2 else (chr(65 + idx[col[gy, gx]]) if idx[col[gy, gx]] < 26 else chr(97 + idx[col[gy, gx]] - 26))
    rows = []
    for gy in range(GH):
        r, gx = [], 0
        while gx < GW:
            c = ch(gy, gx); n = 1
            while gx + n < GW and ch(gy, gx + n) == c:
                n += 1
            r.append(c + (str(n) if n > 1 else '')); gx += n
        rows.append(''.join(r))
    js = ('/* 스테이지 게임기 그림 — %s (18회차, Codex 그림을 tools/fc-pixel/pixelize-console.py --look %s 가 도트로 옮김 · 손으로 고치지 마세요) */\n'
          'window.FcLevelArt && window.FcLevelArt.add(%r, { x: %d, y: %d, w: %d, h: %d, screen: [%d, %d, %d, %d], map: [%.3f, %.3f, %.4f],\n  pal: %s,\n  rows: [\n%s\n  ] });\n') % (
        a.name, a.look, a.name, GX0, GY0, GW, GH, Lc0, Tc0, cols, rows_, ox, oy, cell, '[' + ', '.join("'%s'" % c for c in hexes) + ']',
        ',\n'.join("    '%s'" % r for r in rows))
    path = os.path.join(a.out, 'fc-level-art-%s.js' % a.name)
    open(path, 'w').write(js)
    print(path, len(js), '바이트 ·', len(hexes), '색', file=sys.stderr)

    if a.preview:
        os.makedirs(a.preview, exist_ok=True)
        out = np.zeros((GH, GW, 3), np.uint8); out[...] = BG
        for gy in range(GH):
            for gx in range(GW):
                if col[gy, gx]: out[gy, gx] = rgb(col[gy, gx])
                elif mat[gy, gx] == -2: out[gy, gx] = (BG * 0.68).astype(np.uint8)
        Image.fromarray(out).resize((GW * 4, GH * 4), Image.NEAREST).save(os.path.join(a.preview, a.name + '.png'))


if __name__ == '__main__':
    main()
