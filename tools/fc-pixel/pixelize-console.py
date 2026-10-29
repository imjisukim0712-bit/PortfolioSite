"""스테이지 게임기 그림(18회차) — Codex 가 그린 '도트가 아닌 그림'을 도트 그림으로 옮깁니다.

해상도만 낮추면(칸마다 색을 고르기만 하면) 붓결 · 망점이 얼룩으로 남고 색이 수십 개로 흩어져 '흐린 사진'이 됩니다.
그래서 모양 · 색 배치는 그림에서 그대로 읽되, 칠하는 법은 도트 그림의 문법으로 다시 칠합니다.

  ① 단계색: 그림 px 마다 재료(검정 · 빨강 · 금색 · 흰 반짝임)를 읽고 재료마다 정해 둔 단계색(RAMPS — 검빨금 각 6 ~ 7단계)으로 나눔.
     넓은 음영은 같은 재료 안에서 한 칸쯤 편 밝기로(붓결 · 망점 얼룩 → 계단), 부품 가장자리처럼 확 다른 곳은 펴지 않음.
     그 재료에서 가장 넓게 칠한 밝기가 단계 하나에 딱 맞게 조금 밀어 줌(바탕이 두 단계 사이에 걸리지 않게)
  ② 칸: 칸마다 가장 많은 재료 · 단계. 칸보다 가는 테 · 잉크 선 · 검은 부품의 빛선은 그림에서 중심선을 따서 한 칸 굵기로 다시 찍음(끊기지 않게)
  ③ 덩어리: 잡티 재료 → 이웃 재료, 두 칸에 걸친 선 → 한 칸, 한 칸 선의 ㄱ자 모서리 칸 빼기, 3 × 3 다수결로 가장자리 펴기, 한 칸 가시 깎기
  ④ 음영: 작은 단계 조각 → 이웃 단계, 가는 덩어리(테 · 띠)는 한 색, 부품마다 '바탕 ± bands 단계'로 줄임 →
     화풍마다 두 단계 사이를 바둑판 디더로(리소 망점 · 과슈 붓결 · 잉크 빗금의 도트식 표현)
  ⑤ 부품 테두리 한 칸: 위 · 왼쪽 한 단계 밝게, 아래 · 오른쪽 한 단계 어둡게(17회차 스테이지 규칙) → 실루엣 외곽선 한 칸 검정, 화면 칸은 크림 #fff6dd
  격자 · 화면 자리 · 출력 형식은 앞과 같습니다(한 칸 ≈ 7px, 화면 폭 = 정수 칸, 게임기는 200 × 100칸 판 가운데).
사용: python3.13 tools/fc-pixel/pixelize-console.py <그림.png> <이름> --screen 334,246,867,455 --look riso [--preview 폴더]
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

# 재료별 단계색(어두움 → 밝음). 검정은 따뜻한 검정, 빨강은 패미컴 빨강(밝을수록 주황 쪽으로 조금), 금색은 놋쇠(밝을수록 노랑 쪽으로 조금)
MATS = ['K', 'R', 'G', 'W']
RAMPS = {
    'K': ['#0e090b', '#1b1316', '#291e23', '#3b2e33', '#55464b', '#77676b', '#a09093'],
    'R': ['#3a0610', '#640b1a', '#930f24', '#c8102e', '#e3302f', '#f5614a', '#ffa07e'],
    'G': ['#3d290c', '#6b4a15', '#9a7023', '#c8983c', '#e6bd5b', '#f6da8a', '#fff3c4'],
    'W': ['#ffffff'],
}
# 화풍별 칠하는 법 — median: 질감 지우는 거르개(px) · soft: 넓은 음영을 펴는 폭(칸) · edge: 이만큼(L) 넘게 다르면 펴지 않음 · dither: 두 단계 사이 띠에서 바둑판으로 칠하는 폭(0 ~ .5, 0 = 없음) · dmats: 바둑판을 쓰는 재료
#                     straight: 가장자리 펴기(3 × 3 다수결) 횟수 · bands: 부품마다 바탕에서 이만큼 단계까지만(0 = 줄이지 않음) · rim: 부품 테두리 빛 · 그늘
#                     band: 이보다 작은 단계 조각은 이웃 단계로(칸) · outline: K = 검정 외곽선, sel = 재료의 가장 어두운 색
LOOKS = {
    'riso':     dict(median=9, soft=1.2, edge=9, dither=.3, dmats='RG', straight=2, band=6, bands=1, rim=1, outline='K'),
    'cutpaper': dict(median=5, soft=.6, edge=6, dither=0, straight=2, band=5, bands=1, rim=1, outline='K'),
    'ink':      dict(median=7, soft=.9, edge=4, dither=.22, dmats='K', straight=2, band=5, bands=2, rim=1, outline='K'),
    'gouache':  dict(median=9, soft=1.2, edge=6, dither=.28, dmats='KRG', straight=2, band=6, bands=2, rim=1, outline='K'),
    'mecha':    dict(median=5, soft=.7, edge=5, dither=0, straight=2, band=4, bands=2, rim=1, outline='K'),
}


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)


def classify(f):
    """px 마다 재료 번호: 0 검정 · 1 빨강 · 2 금색 · 3 흰색."""
    mx, mn = f.max(2), f.min(2); v = mx / 255; s = (mx - mn) / np.maximum(mx, 1)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]; d = np.maximum(mx - mn, 1e-6)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    m = np.where((h >= 18) & (h < 200), 2, 1)
    m = np.where(s < .26, 0, m)                    # 채도 낮은 회색 = 검정 재료의 밝은 단계(빛선)
    m = np.where((s < .2) & (v > .84), 3, m)
    m = np.where((v < .26) | ((s < .46) & (v < .56)), 0, m)
    return m


def nb_major(mat, y, x, exclude, allow):
    """(y, x) 둘레 8칸에서 exclude 가 아닌, allow 에 드는 가장 흔한 값(없으면 None)."""
    vals = {}
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dy or dx:
                yy, xx = y + dy, x + dx
                if 0 <= yy < mat.shape[0] and 0 <= xx < mat.shape[1]:
                    v = mat[yy, xx]
                    if v != exclude and allow(v):
                        vals[v] = vals.get(v, 0) + (2 if dy == 0 or dx == 0 else 1)
    return max(vals, key=vals.get) if vals else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('name')
    ap.add_argument('--screen', required=True, help='그림 속 화면 사각형 px: 왼,위,폭,높이')
    ap.add_argument('--look', required=True, choices=sorted(LOOKS), help='화풍별 칠하는 법(LOOKS)')
    ap.add_argument('--cell', type=float, default=7.0, help='한 칸의 대략 크기(px)')
    ap.add_argument('--thin', type=float, default=.3, help='가는 선 · 테: 칸의 이 비율만 차지해도 살림(이웃에서 드문 재료일 때)')
    ap.add_argument('--line', type=float, default=.22, help='그림의 잉크 선: 칸의 이 비율만 지나가도 선 칸으로')
    ap.add_argument('--preview', default='')
    ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'js', 'themes'))
    a = ap.parse_args(); L = LOOKS[a.look]

    im = Image.open(a.src).convert('RGB')
    raw = np.array(im).astype(float); H_, W_ = raw.shape[:2]
    sm = np.array(im.filter(ImageFilter.MedianFilter(L['median'] | 1))).astype(float)

    # 배경 · 하늘에 떨어진 그림자 · 게임기(실루엣은 살짝 흐려 자른 뒤 — 칸 가장자리가 들쭉날쭉하지 않게)
    dist = np.sqrt(((raw - BG) ** 2).sum(axis=2)); lum = raw.mean(axis=2); bl = BG.mean()
    is_bg = dist < 38
    is_sh = ~is_bg & ((raw[..., 2] - raw[..., 0]) > 40) & (lum < bl * 0.86) & (np.abs(raw[..., 2] / np.maximum(raw[..., 0], 1) - BG[2] / BG[0]) < 1.6)
    obj = ndi.gaussian_filter((~(is_bg | is_sh)).astype(float), 2) > .5
    shad = ndi.gaussian_filter(is_sh.astype(float), 2) > .5
    mpx = classify(sm)
    lpx = rgb2lab(sm / 255)[..., 0]
    # 그림의 잉크 선: 둘레(약 두 칸)보다 확 어둡고 그 자체도 어두운 px — 검은 몸 위 검은 선도 살림
    sm3 = np.array(im.filter(ImageFilter.MedianFilter(3))).astype(float)
    lraw = rgb2lab(sm3 / 255)[..., 0]; mpx3 = classify(sm3)      # 가는 테 · 선은 질감 거르개를 약하게 건 쪽에서 읽음
    inkpx = (lraw < ndi.median_filter(lraw, 15) - 7) & (lraw < 30)
    lab, n = ndi.label(inkpx, structure=np.ones((3, 3)))           # 망점 · 붓 자국 같은 작은 점은 선이 아님(두 칸 길이 넘는 것만)
    if n:
        inkpx &= (ndi.sum(np.ones_like(lab), lab, np.arange(n + 1)) >= 60)[lab]
    #    검은 부품의 빛선(십자 버튼 모서리 등): 둘레보다 확 밝은 검정 재료 px — 검은 몸 위 검은 부품의 생김새를 살림
    litpx = (lraw > ndi.median_filter(lraw, 15) + 10) & (mpx3 == 0)
    lab, n = ndi.label(litpx, structure=np.ones((3, 3)))
    if n:
        litpx &= (ndi.sum(np.ones_like(lab), lab, np.arange(n + 1)) >= 40)[lab]

    # 격자: 화면 폭을 정수 칸으로, 화면 왼쪽 위를 칸 경계에, 게임기를 판 가운데에(앞과 같음 — CSS 자리가 그대로 맞게)
    sx, sy, sw, sh = [float(v) for v in a.screen.split(',')]
    cols = max(1, round(sw / a.cell)); cell = sw / cols; rows_ = round(sh / cell)
    ys, xs = np.where(obj)
    ccx, ccy = (xs.min() + xs.max() + 1) / 2, (ys.min() + ys.max() + 1) / 2
    Lc0 = round(100 + (sx - ccx) / cell); Tc0 = round(50 + (sy - ccy) / cell)
    ox, oy = sx - Lc0 * cell, sy - Tc0 * cell
    sl, st = Lc0 - GX0, Tc0 - GY0      # 화면 칸(격자 배열 기준)
    print('칸 %.3fpx · 화면 칸 %d, %d, %d × %d' % (cell, Lc0, Tc0, cols, rows_), file=sys.stderr)

    # ① 그림 px 마다 (재료, 단계) — 칸으로 줄이기 전에 먼저 단계색으로 나눔(가는 빛선 · 테가 칸 평균에 묻히지 않게)
    rl = {k: rgb2lab(np.array([[rgb(h) / 255 for h in RAMPS[k]]]))[0, :, 0] for k in MATS}
    #    단계는 두 가지로 읽음: 넓은 음영 = 같은 재료 안에서 한 칸쯤 흐린 밝기(붓결 · 망점 얼룩이 계단으로 정리됨) · 가는 빛선 = 흐리지 않은 밝기
    lvpx = np.zeros(mpx.shape, int); lvsoft = np.zeros(mpx.shape, int); tpx = np.zeros(mpx.shape); TC = {}
    for m, k in enumerate(MATS):
        sel = mpx == m
        if not sel.any(): continue
        soft = ndi.gaussian_filter(lpx * sel, a.cell * L['soft']) / np.maximum(ndi.gaussian_filter(sel.astype(float), a.cell * L['soft']), 1e-6)
        soft = np.where(np.abs(lpx - soft) > L['edge'], lpx, soft)    # 부품 가장자리 · 빛선처럼 확 다른 곳은 흐리지 않음(질감만 폄)
        #  그 재료에서 가장 넓게 칠한 밝기가 단계색 하나에 딱 맞게 조금 밀어 줌(넓은 바탕이 두 단계 사이에 걸려 온통 바둑판이 되지 않게)
        hist = np.bincount(np.clip(soft[sel & obj], 0, 100).astype(int), minlength=101)
        tm = np.interp(hist.argmax() + .5, rl[k], np.arange(len(rl[k]))); dl = np.round(tm) - tm
        tc = lambda v, r=rl[k], d=dl: np.clip(np.interp(v, r, np.arange(len(r))) + d, 0, len(r) - 1)
        q = lambda v, tc=tc: np.round(tc(v)).astype(int)
        lvpx[sel] = q(lpx[sel]); lvsoft[sel] = q(soft[sel]); tpx[sel] = tc(soft[sel]); TC[m] = tc
    lvpx[inkpx] = 0; lvsoft[inkpx] = 0; mpx = np.where(inkpx, 0, mpx)
    cpx = mpx * 8 + lvpx                         # 색 번호 = 재료 × 8 + 단계
    cps = mpx * 8 + lvsoft
    NC = 32

    # ② 칸마다 가장 많은 색 — 단, 칸의 30% 이상인데 이웃 칸들에서는 드문 색(가는 선 · 테 · 빛선)이면 그 색
    mat = np.full((GH, GW), -1, int)            # -1 투명, -2 그림자, 0.. 재료
    lev = np.zeros((GH, GW), int)
    H = np.zeros((NC, GH, GW)); HS = np.zeros((NC, GH, GW)); F = np.zeros((4, GH, GW)); TS = np.zeros((4, GH, GW)); FL = np.zeros((GH, GW))
    for gy in range(GH):
        for gx in range(GW):
            x0, y0 = ox + (GX0 + gx) * cell, oy + (GY0 + gy) * cell
            X0, Y0, X1, Y1 = int(round(x0 + 1)), int(round(y0 + 1)), int(round(x0 + cell - 1)), int(round(y0 + cell - 1))
            if X1 <= X0 or Y1 <= Y0 or X0 < 0 or Y0 < 0 or X1 > W_ or Y1 > H_:
                continue
            o = obj[Y0:Y1, X0:X1]; n = o.size
            if o.sum() > n * .5:
                cc = cpx[Y0:Y1, X0:X1][o]
                H[:, gy, gx] = np.bincount(cc, minlength=NC)[:NC] / len(cc)
                HS[:, gy, gx] = np.bincount(cps[Y0:Y1, X0:X1][o], minlength=NC)[:NC] / len(cc)
                mm = mpx[Y0:Y1, X0:X1][o]; tv = tpx[Y0:Y1, X0:X1][o]
                FL[gy, gx] = inkpx[int(y0):int(np.ceil(y0 + cell)), int(x0):int(np.ceil(x0 + cell))].mean()   # 선은 칸 가장자리까지 다 봄(가는 선이 칸 경계에 걸려도)
                for m in range(4):
                    if (mm == m).any(): TS[m, gy, gx] = tv[mm == m].mean()
                mat[gy, gx] = 9
            elif shad[Y0:Y1, X0:X1].sum() > n * .5:
                mat[gy, gx] = -2
    on = mat == 9
    for m in range(4):
        F[m] = H[m * 8:m * 8 + 8].sum(0)
    den = np.maximum(ndi.uniform_filter(on.astype(float), 3), 1e-6)
    NBc = np.stack([ndi.uniform_filter(H[c] * on, 3) / den for c in range(NC)])
    NBm = np.stack([ndi.uniform_filter(F[m] * on, 3) / den for m in range(4)])
    NL = ndi.uniform_filter(FL * on, 3) / den
    tt = np.zeros((GH, GW))                    # 넓은 음영의 이어지는 단계값(바둑판 자리 고르기)
    alt = np.full((GH, GW, 2), -1, int)        # 가는 테 · 선 규칙으로 바꾼 칸의 원래 (재료, 단계)
    for gy, gx in zip(*np.where(on)):
        h = H[:, gy, gx]; f = F[:, gy, gx]
        pm = int(f.argmax())                                    # 재료: 가장 많은 재료, 가는 재료는 우선
        thin = [m for m in range(4) if m != pm and f[m] >= a.thin * (.75 if m == 3 else 1) and NBm[m, gy, gx] < .4]
        tm_ = bool(thin); base = pm
        if thin: pm = max(thin, key=lambda m: f[m])
        if tm_: alt[gy, gx] = (base, int(HS[base * 8:base * 8 + 8, gy, gx].argmax()))
        hs = HS[pm * 8:pm * 8 + 8, gy, gx]; pl = int(hs.argmax())   # 단계: 넓은 음영에서 가장 많은 단계 — 가는 빛선(흐리지 않은 쪽, 두 단계 이상 차이)은 우선
        hh = h[pm * 8:pm * 8 + 8]
        thl = [l for l in range(8) if hh[l] >= a.thin * (.75 if l >= 4 else 1) and NBc[pm * 8 + l, gy, gx] < .3 and abs(l - pl) >= 2]
        tt[gy, gx] = TS[pm, gy, gx]
        if thl: pl = max(thl, key=lambda l: hh[l]); tt[gy, gx] = pl
        if (FL[gy, gx] >= .5 or (FL[gy, gx] >= a.line and NL[gy, gx] < .45)) and not (tm_ and f[pm] >= FL[gy, gx]):   # 그림의 잉크 선(굵어도) = 가장 어두운 검정 — 더 굵게 찬 가는 테(금테 등)는 테로
            if alt[gy, gx, 0] < 0: alt[gy, gx] = (pm, pl)
            pm, pl = 0, 0; tt[gy, gx] = 0; F[0, gy, gx] = max(F[0, gy, gx], FL[gy, gx]); H[0, gy, gx] = max(H[0, gy, gx], FL[gy, gx])
        mat[gy, gx] = pm; lev[gy, gx] = pl

    #    가는 테 · 선은 그림에서 중심선을 따서 칸마다 한 칸 굵기로 다시 찍음(칸 경계에 걸려 끊기거나 두 칸으로 번지지 않게)
    #    — 잉크 선 → 검은 부품의 빛선 → 빨강 → 금색 → 흰 반짝임 순으로 덮음(금테가 그 바깥 잉크 선보다 앞)
    scr = np.zeros((GH, GW), bool); scr[st:st + rows_, sl:sl + cols] = True
    sk_cell = np.full((GH, GW), -1, int)
    for m, Mp in ((0, inkpx), (0, litpx & obj), (1, (mpx3 == 1) & obj & ~inkpx), (2, (mpx3 == 2) & obj & ~inkpx), (3, (mpx3 == 3) & obj & ~inkpx)):
        ink_ = Mp is inkpx
        if not Mp.any(): continue
        dist = ndi.distance_transform_edt(Mp)
        sk = skeletonize(Mp) & (dist <= cell * .62) & (dist >= 1)
        lab, n = ndi.label(sk, structure=np.ones((3, 3)))
        if not n: continue
        sk &= (ndi.sum(np.ones_like(lab), lab, np.arange(n + 1)) >= cell * 1.5)[lab]
        yy, xx = np.where(sk)
        cy = np.floor((yy - oy) / cell).astype(int) - GY0; cx = np.floor((xx - ox) / cell).astype(int) - GX0
        ok = (cy >= 0) & (cy < GH) & (cx >= 0) & (cx < GW)
        acc = {}
        for y_, x_, l_ in zip(cy[ok], cx[ok], lraw[yy[ok], xx[ok]]):
            acc.setdefault((y_, x_), []).append(l_)
        for (y_, x_), ls in acc.items():
            if mat[y_, x_] < 0 or scr[y_, x_]: continue
            if alt[y_, x_, 0] < 0 and mat[y_, x_] != m: alt[y_, x_] = (mat[y_, x_], lev[y_, x_])
            mat[y_, x_] = m; lev[y_, x_] = 0 if ink_ else int(np.round(TC[m](np.median(ls)))) if m in TC else 0
            tt[y_, x_] = lev[y_, x_]; sk_cell[y_, x_] = m
    #    중심선 옆에서 가는 테 · 선 규칙으로 같은 재료가 된 칸은 원래대로(테가 두 칸으로 번지지 않게)
    for gy, gx in zip(*np.where((alt[..., 0] >= 0) & (sk_cell < 0))):
        m = mat[gy, gx]
        y0_, y1_, x0_, x1_ = max(gy - 1, 0), gy + 2, max(gx - 1, 0), gx + 2
        if (sk_cell[y0_:y1_, x0_:x1_] == m).any():
            mat[gy, gx], lev[gy, gx] = alt[gy, gx]; tt[gy, gx] = lev[gy, gx]
    mat[scr] = 3

    def adopt(gy, gx, excl):
        """(gy, gx) 를 둘레에서 가장 흔한 다른 재료로 — 단계도 그 재료 이웃 칸의 가장 흔한 단계로."""
        v = nb_major(mat, gy, gx, excl, lambda q: q >= 0)
        if v is None: return False
        sub = np.where(mat == v, lev, -1); w = nb_major(sub, gy, gx, -99, lambda q: q >= 0)
        mat[gy, gx] = v; lev[gy, gx] = w if w is not None else lev[gy, gx]; tt[gy, gx] = lev[gy, gx]
        return True

    # ③ 덩어리: 잡티 재료 → 이웃 재료
    for _ in range(2):
        for m in (0, 1, 2, 3):
            lab, k = ndi.label(mat == m, structure=np.ones((3, 3)))
            sizes = ndi.sum(np.ones_like(lab), lab, range(1, k + 1))
            for i, sz in enumerate(sizes, 1):
                if sz < (2 if m == 3 else 4):
                    for gy, gx in zip(*np.where(lab == i)):
                        if not scr[gy, gx]: adopt(gy, gx, m)
    #    두 칸에 걸친 가는 선 → 한 칸(정확히 두 칸 두께로 이어지는 곳에서 덜 찬 칸을 뺌) — 재료 선과 잉크 선(검정 0단계) 모두
    def thin2(M, frac, swap):
        for gy in range(1, GH - 2):
            for gx in range(1, GW - 2):
                if not M[gy, gx] or scr[gy, gx]: continue
                for dy, dx in ((0, 1), (1, 0)):
                    y2, x2 = gy + dy, gx + dx
                    if M[y2, x2] and not M[gy - dy, gx - dx] and not M[y2 + dy, x2 + dx]:
                        run = sum(M[gy + s * dx, gx + s * dy] and M[y2 + s * dx, x2 + s * dy] for s in (-1, 1))
                        if run == 0: continue
                        lo = (gy, gx) if frac[gy, gx] <= frac[y2, x2] else (y2, x2)
                        if frac[lo] < .62 and swap(*lo): M[lo] = False
    for m in (0, 1, 2):
        thin2(mat == m, F[m], lambda y, x, m=m: adopt(y, x, m))
    def unline(y, x):
        sub = np.where((mat == mat[y, x]) & ~((mat == 0) & (lev == 0)), lev, -1)
        w = nb_major(sub, y, x, -99, lambda q: q >= 0)
        if w is None: return False
        lev[y, x] = w; return True
    thin2((mat == 0) & (lev == 0), H[0], unline)
    #    한 칸 선의 ㄱ자 모서리 칸 빼기(두 이웃이 직각이고 그 둘이 대각선으로 이어지면)
    def corners(M, swap):
        for gy in range(1, GH - 1):
            for gx in range(1, GW - 1):
                if not M[gy, gx] or scr[gy, gx]: continue
                n4 = [M[gy - 1, gx], M[gy, gx + 1], M[gy + 1, gx], M[gy, gx - 1]]
                n8 = M[gy - 1:gy + 2, gx - 1:gx + 2].sum() - 1
                if n8 == 2 and sum(n4) == 2 and ((n4[0] and n4[1]) or (n4[1] and n4[2]) or (n4[2] and n4[3]) or (n4[3] and n4[0])):
                    if swap(gy, gx): M[gy, gx] = False
    for m in (0, 1, 2):
        corners(mat == m, lambda y, x, m=m: adopt(y, x, m))
    corners((mat == 0) & (lev == 0), unline)

    #    면 가장자리 펴기: 재료 지도 · 단계 지도에 3 × 3 다수결(8칸 중 5칸 이상이 같으면 따름) — 손그림의 울퉁불퉁한 가장자리를 반듯한 도트 가장자리로
    #    (중심선으로 찍은 테 · 잉크 선 · 화면은 그대로 두고, 표에도 넣지 않음)
    for _ in range(L['straight']):
        fixed = (sk_cell >= 0) | ((mat == 0) & (lev == 0)) | scr
        vote = np.where(fixed | (mat < 0), -9, mat); votel = np.where(fixed | (mat < 0), -9, mat * 8 + lev)
        nm, nl = mat.copy(), lev.copy()
        for gy, gx in zip(*np.where(~fixed & (mat >= 0))):
            y0_, x0_ = max(gy - 1, 0), max(gx - 1, 0)
            w = vote[y0_:gy + 2, x0_:gx + 2].ravel(); w = w[w >= 0]
            if w.size:
                v, c = np.unique(w, return_counts=True); k = c.argmax()
                if c[k] >= 5 and v[k] != mat[gy, gx]:
                    wl = votel[y0_:gy + 2, x0_:gx + 2].ravel(); wl = wl[(wl >= 0) & (wl // 8 == v[k])]
                    nm[gy, gx] = v[k]; nl[gy, gx] = np.bincount(wl % 8).argmax(); continue
            wl = votel[y0_:gy + 2, x0_:gx + 2].ravel(); wl = wl[(wl >= 0) & (wl // 8 == mat[gy, gx])]
            if wl.size:
                v, c = np.unique(wl % 8, return_counts=True); k = c.argmax()
                if c[k] >= 5 and v[k] != lev[gy, gx]: nl[gy, gx] = v[k]
        ch = (nm != mat) | (nl != lev); mat, lev = nm, nl; tt[ch] = lev[ch]
    #    면 가장자리 다듬기: 넓은 면에서 튀어나온 한 칸짜리 가시를 깎음(두 번 — 두 칸 가시까지, 둥근 버튼 · 몸 가장자리가 들쭉날쭉하지 않게)
    keep = (sk_cell >= 0) | ((mat == 0) & (lev == 0)) | scr
    for _ in range(2):
        for m in (0, 1, 2):
            M = mat == m
            n4 = sum(np.roll(M, s, ax) for s in (1, -1) for ax in (0, 1))
            for gy, gx in zip(*np.where(M & (n4 == 1) & ~keep)):
                nb = [(gy + dy, gx + dx) for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= gy + dy < GH and 0 <= gx + dx < GW and M[gy + dy, gx + dx]]
                if nb and n4[nb[0]] >= 3: adopt(gy, gx, m)

    # ④ 음영 정리: 같은 재료 안의 작은 단계 조각 → 이웃 단계(계단 음영), 가는 덩어리(테 · 띠)는 한 색
    for m, k in enumerate(MATS):
        M = (mat == m) & ~scr
        if not M.any(): continue
        for _ in range(2):
            for v in range(len(RAMPS[k])):
                if m == 0 and v == 0 and _ == 0: continue   # 잉크 선은 길이 4칸 이상만 남김(아래)
                lab, n = ndi.label(M & (lev == v), structure=np.ones((3, 3)))
                if not n: continue
                sizes = ndi.sum(np.ones_like(lab), lab, range(1, n + 1))
                for i, sz in enumerate(sizes, 1):
                    if sz < (4 if m == 0 and v == 0 else L['band']):
                        for gy, gx in zip(*np.where(lab == i)):
                            w = nb_major(np.where(M, lev, -1), gy, gx, v, lambda q: q >= 0)
                            if w is not None: lev[gy, gx] = w; tt[gy, gx] = w
        lab, n = ndi.label(M, structure=np.ones((3, 3)))
        for i in range(1, n + 1):
            C = lab == i
            if C.sum() >= 3 and ndi.distance_transform_cdt(np.pad(C, 1), metric='taxicab')[1:-1, 1:-1].max() <= 2:
                vals = lev[C]; lev[C] = int(np.bincount(vals).argmax()); tt[C] = lev[C]
    #    부품(같은 재료로 이어진 면 — 잉크 선 · 다른 재료로 갈림)마다 음영을 '바탕 ± 1단계'로 줄임(도트 그림은 면마다 서너 색) — 중심선으로 찍은 빛선은 그대로
    objm = mat >= 0
    edge = objm & ~(np.roll(objm, 1, 0) & np.roll(objm, -1, 0) & np.roll(objm, 1, 1) & np.roll(objm, -1, 1))
    parts = []
    for m in (0, 1, 2):
        lab, n = ndi.label((mat == m) & ~((mat == 0) & (lev == 0)) & ~edge & ~scr)
        for i in range(1, n + 1):
            C = lab == i
            if C.sum() < 12: continue
            base = int(np.bincount(lev[C]).argmax()); parts.append((m, C, base))
            if L['bands']:
                free = C & (sk_cell != m)
                lev[free] = np.clip(lev[free], max(base - L['bands'], 1 if m == 0 else 0), base + L['bands'])
                tt[free] = np.clip(tt[free], base - L['bands'], base + L['bands'])
    #    두 단계 사이(넓은 음영이 바뀌는 띠)를 바둑판으로 — 화풍이 허락할 때(리소 망점 · 과슈 붓결 · 잉크 빗금의 도트식 표현)
    if L['dither']:
        inner = np.ones((GH, GW), bool)
        for dy in range(-2, 3):                 # 둘레 5 × 5 가 같은 재료인 넓은 면만(가는 테 · 띠에는 바둑판을 넣지 않음)
            for dx in range(-2, 3):
                inner &= np.roll(mat, (dy, dx), (0, 1)) == mat
        fr = tt - np.floor(tt)
        D = inner & np.isin(mat, [MATS.index(k) for k in L['dmats']]) & ~scr & ~((mat == 0) & (lev == 0)) & (np.abs(fr - .5) < L['dither']) & (np.abs(lev - tt) <= 1)
        lab, n = ndi.label(D, structure=np.ones((3, 3)))
        for i in range(1, n + 1):
            C = lab == i
            if C.sum() >= 8:
                yy, xx = np.where(C); lev[yy, xx] = np.floor(tt[yy, xx]).astype(int) + ((xx + yy) & 1)

    # ⑤ 부품 테두리 빛 · 그늘: 부품 가장자리 한 칸을 위 · 왼쪽은 한 단계 밝게, 아래 · 오른쪽은 한 단계 어둡게(17회차 스테이지 규칙 — 한 번에 칠함)
    if L['rim']:
        for m, C, base in parts:
            top = rp_n = len(RAMPS[MATS[m]]) - 1
            out = ~C
            up, lf = np.roll(out, 1, 0), np.roll(out, 1, 1); dn, rt = np.roll(out, -1, 0), np.roll(out, -1, 1)
            lit = C & (up | lf) & ~(dn | rt); shd = C & (dn | rt) & ~(up | lf)
            lit &= sk_cell != m; shd &= sk_cell != m
            lev[lit] = np.minimum(np.maximum(lev[lit], base) + 1, top)
            lev[shd] = np.maximum(np.minimum(lev[shd], base) - 1, 1 if m == 0 else 0)
    #    실루엣 외곽선
    col = np.full((GH, GW), '', object)
    for gy, gx in zip(*np.where(objm)):
        m = mat[gy, gx]
        if scr[gy, gx]: col[gy, gx] = LCD; continue
        if edge[gy, gx]:
            col[gy, gx] = RAMPS['K'][0] if L['outline'] == 'K' or m == 3 else RAMPS[MATS[m]][0]; continue
        rp = RAMPS[MATS[m]]; col[gy, gx] = rp[int(np.clip(lev[gy, gx], 0, len(rp) - 1))]

    # 내보내기: 쓴 색만, 줄마다 (색 글자 + 길이)
    hexes = sorted({c for c in col.ravel() if c}); idx = {h: i for i, h in enumerate(hexes)}
    code = lambda gy, gx: '.' if mat[gy, gx] == -1 else ',' if mat[gy, gx] == -2 else (chr(65 + idx[col[gy, gx]]) if idx[col[gy, gx]] < 26 else chr(97 + idx[col[gy, gx]] - 26))
    rows = []
    for gy in range(GH):
        r, gx = [], 0
        while gx < GW:
            c = code(gy, gx); n = 1
            while gx + n < GW and code(gy, gx + n) == c:
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
