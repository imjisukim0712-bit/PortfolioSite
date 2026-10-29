"""스테이지 게임기 그림(18회차) — Codex 가 남긴 벡터 원본(SVG)을 도트 칸 격자 위에 직접 찍어 깔끔한 도트 그림으로 만듭니다.

그림(PNG)을 줄여 읽으면 곡선 · 선이 칸 경계에 걸려 들쭉날쭉해집니다. 벡터 원본에는 부품(면 + 그 안의 빛 · 그늘 면 + 외곽선)이
그대로 있으니, 모양은 그대로 두고 '찍는 법'만 도트 그림 규칙으로 정합니다.

  ① 부품마다 면을 칸 가운데에서 찍음(빛 · 그늘 면은 그 부품 안으로만 — SVG 의 clipPath 그대로). 뒤에 그린 부품이 앞을 덮음
  ② 외곽선 = 부품의 가장자리 칸 중 '먼저 그린 부품 · 배경'과 맞닿은 칸(한 칸, 위에 놓인 부품 쪽). SVG 의 8px 선이 칸에 걸려 두 칸이 되는 일이 없음
  ③ 도트 다듬기: 외곽선의 ㄱ자 모서리 칸 빼기(대각선으로 이어지게 — 바깥쪽이면 배경, 안쪽이면 그 부품 색),
     한 칸짜리 튀어나온 칸 · 외딴 칸 정리
  ④ 화면 칸은 크림 #fff6dd. 색은 SVG 의 색(도트 팔레트) 그대로
  격자 · 화면 자리 · 출력 형식은 pixelize-console.py 와 같습니다(같은 그림 PNG 로 격자를 잡음 — CSS 자리가 그대로 맞게).
사용: python3.13 tools/fc-pixel/svg-console.py <그림.svg> <같은 그림.png> <이름> --screen 334,246,867,455 [--preview 폴더]
"""
import argparse
import math
import os
import re
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.draw import polygon as fillpoly

GX0, GY0, GW, GH = -8, -8, 216, 116
LCD = '#fff6dd'
INK = '#0f0a0c'
BG = np.array([0x5c, 0x94, 0xfc], float)


def flatten(d, steps=24):
    """SVG 경로(M L H V Q A Z, 절대 좌표) → 닫힌 다각형들."""
    toks = re.findall(r'[MLHVQAZ]|-?\d*\.?\d+(?:e-?\d+)?', d)
    polys, cur, x, y, i, cmd = [], [], 0.0, 0.0, 0, None
    num = lambda: float(toks[i])
    while i < len(toks):
        t = toks[i]
        if re.match(r'[MLHVQAZ]', t):
            cmd = t; i += 1
            if cmd == 'Z':
                if cur: polys.append(cur); cur = []
                continue
        if cmd == 'M':
            x, y = float(toks[i]), float(toks[i + 1]); i += 2
            if cur: polys.append(cur)
            cur = [(x, y)]; cmd = 'L'
        elif cmd == 'L':
            x, y = float(toks[i]), float(toks[i + 1]); i += 2; cur.append((x, y))
        elif cmd == 'H':
            x = float(toks[i]); i += 1; cur.append((x, y))
        elif cmd == 'V':
            y = float(toks[i]); i += 1; cur.append((x, y))
        elif cmd == 'Q':
            cx, cy, ex, ey = [float(v) for v in toks[i:i + 4]]; i += 4
            for s in range(1, steps + 1):
                u = s / steps
                cur.append(((1 - u) ** 2 * x + 2 * (1 - u) * u * cx + u * u * ex, (1 - u) ** 2 * y + 2 * (1 - u) * u * cy + u * u * ey))
            x, y = ex, ey
        elif cmd == 'A':
            rx, ry, rot, la, sw, ex, ey = [float(v) for v in toks[i:i + 7]]; i += 7
            cur += arc(x, y, rx, ry, rot, int(la), int(sw), ex, ey, steps * 2); x, y = ex, ey
        else:
            i += 1
    if cur: polys.append(cur)
    return polys


def arc(x1, y1, rx, ry, phi, fa, fs, x2, y2, n):
    """SVG 타원 호 → 점들(끝점 매개변수 → 중심 매개변수, SVG 명세 F.6.5)."""
    p = math.radians(phi); c, s = math.cos(p), math.sin(p)
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    x1p, y1p = c * dx + s * dy, -s * dx + c * dy
    lam = x1p ** 2 / rx ** 2 + y1p ** 2 / ry ** 2
    if lam > 1: rx, ry = rx * math.sqrt(lam), ry * math.sqrt(lam)
    num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
    co = math.sqrt(max(0, num / (rx * rx * y1p * y1p + ry * ry * x1p * x1p))) * (-1 if fa == fs else 1)
    cxp, cyp = co * rx * y1p / ry, -co * ry * x1p / rx
    cx, cy = c * cxp - s * cyp + (x1 + x2) / 2, s * cxp + c * cyp + (y1 + y2) / 2
    ang = lambda ux, uy, vx, vy: math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
    t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
    if not fs and dt > 0: dt -= 2 * math.pi
    if fs and dt < 0: dt += 2 * math.pi
    return [(cx + rx * math.cos(t1 + dt * k / n) * c - ry * math.sin(t1 + dt * k / n) * s,
             cy + rx * math.cos(t1 + dt * k / n) * s + ry * math.sin(t1 + dt * k / n) * c) for k in range(1, n + 1)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('svg'); ap.add_argument('png'); ap.add_argument('name')
    ap.add_argument('--screen', required=True); ap.add_argument('--cell', type=float, default=7.0)
    ap.add_argument('--preview', default='')
    ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'js', 'themes'))
    a = ap.parse_args()

    # 격자: pixelize-console.py 와 같은 계산(같은 PNG 의 게임기 가운데 · 화면 자리)
    raw = np.array(Image.open(a.png).convert('RGB')).astype(float)
    obj0 = np.sqrt(((raw - BG) ** 2).sum(axis=2)) >= 38
    sx, sy, sw, sh = [float(v) for v in a.screen.split(',')]
    cols = max(1, round(sw / a.cell)); cell = sw / cols; rows_ = round(sh / cell)
    ys, xs = np.where(obj0)
    ccx, ccy = (xs.min() + xs.max() + 1) / 2, (ys.min() + ys.max() + 1) / 2
    Lc0 = round(100 + (sx - ccx) / cell); Tc0 = round(50 + (sy - ccy) / cell)
    ox, oy = sx - Lc0 * cell, sy - Tc0 * cell
    sl, st = Lc0 - GX0, Tc0 - GY0

    ELL = re.compile(r'^M ([\d.-]+),([\d.-]+) A ([\d.]+),([\d.]+) 0 1 0 ([\d.-]+),([\d.-]+) A [\d.]+,[\d.]+ 0 1 0 [\d.-]+,[\d.-]+ Z$')
    gy_, gx_ = np.mgrid[0:GH, 0:GW] + .5          # 칸 가운데(칸 모서리 좌표)
    def mask(d):
        e = ELL.match(d.strip())
        if e:                                    # 타원(둥근 버튼 · 고리): 중심을 칸 반 칸 단위에 맞춰 좌우 · 상하 대칭인 도트 원으로
            x1, y1, rx, ry, x2, _ = [float(v) for v in e.groups()]
            cx = round(((x1 + x2) / 2 - ox) / cell * 2) / 2 - GX0; cy = round((y1 - oy) / cell * 2) / 2 - GY0
            k = 1 - .15 / max(rx / cell, ry / cell)    # 위 · 아래 · 옆 끝에 한 칸만 튀어나온 꼭지가 생기지 않게 살짝 안쪽으로
            return ((gx_ - cx) / (rx / cell)) ** 2 + ((gy_ - cy) / (ry / cell)) ** 2 <= k * k
        m = np.zeros((GH, GW), bool)
        for poly in flatten(d):
            if len(poly) < 3: continue
            P = np.array(poly)
            cx = (P[:, 0] - ox) / cell - GX0 - .5; cy = (P[:, 1] - oy) / cell - GY0 - .5   # 칸 가운데 = 정수 좌표
            rr, cc = fillpoly(cy, cx, (GH, GW))
            m[rr, cc] ^= True                    # 짝홀 규칙(구멍 있는 경로)
        return m

    # ① 부품: <defs><clipPath><path d=…/></clipPath></defs> → 바탕 면 → <g clip-path> 빛 · 그늘 면들 → 외곽선(stroke)
    #    부품마다 모양(mask) · 바탕색 · 빛 · 그늘 면(잘리기 전 모양)을 따로 들고 있다가, 모양을 다듬은 뒤 그린 순서대로 겹쳐 칠함
    svg = open(a.svg).read()
    clips = {cid: d for cid, d in re.findall(r'<clipPath id="([^"]+)"><path d="([^"]+)"/></clipPath>', svg)}
    body = re.sub(r'<defs>.*?</defs>', '', svg)
    parts, inclip = [], False
    for el in re.finditer(r'<g clip-path="url\(#([^)]+)\)">|</g>|<path d="([^"]+)"([^>]*)/>', body):
        if el.group(0).startswith('<g'): inclip = True; continue
        if el.group(0) == '</g>': inclip = False; continue
        d, attrs = el.group(2), el.group(3)
        fill = re.search(r'fill="([^"]+)"', attrs); fill = fill.group(1) if fill else '#000000'
        if fill == 'none':
            if 'stroke=' in attrs and parts: parts[-1]['line'] = True
            continue
        if inclip and parts: parts[-1]['shades'].append((mask(d), fill))
        else: parts.append(dict(mask=mask(d), fill=fill, shades=[], line='stroke=' in attrs))
    scr = np.zeros((GH, GW), bool); scr[st:st + rows_, sl:sl + cols] = True

    def compose():
        col = np.full((GH, GW), '', object); part = np.full((GH, GW), -1, int)
        for z, P in enumerate(parts):
            col[P['mask']] = P['fill']; part[P['mask']] = z
            for sm_, c in P['shades']: col[P['mask'] & sm_] = c
        col[scr] = LCD
        return col, part

    # ①-2 바탕 부품의 가장자리를 따라 붙은 부품(손잡이 판 · 테)은 그 가장자리와 같은 간격으로(띠가 한 칸 · 두 칸을 오가며 흔들리지 않게)
    for z in range(1, len(parts)):
        P = parts[z]['mask']
        if not P.any() or (P & scr).sum() > P.sum() * .5: continue
        under = np.full((GH, GW), -1, int)                       # z 밑에 깔린 부품 번호
        for k in range(z): under[parts[k]['mask']] = k
        ring = ndi.binary_dilation(P, np.ones((3, 3))) & ~P & (under >= 0)
        if not ring.any(): continue
        u = int(np.bincount(under[ring]).argmax())
        U = parts[u]['mask']
        if P.sum() < 600 or U.sum() < 1000: continue             # 몸 · 손잡이 판 · 테처럼 큰 부품끼리만(작은 버튼 · 십자는 그대로)
        D = ndi.distance_transform_cdt(np.pad(U, 1), metric='chessboard')[1:-1, 1:-1]   # 바탕 부품 가장자리 칸 = 1
        bd = P & ~ndi.binary_erosion(P, [[0, 1, 0], [1, 1, 1], [0, 1, 0]], border_value=0) & U
        hug = bd & (D >= 2) & (D <= 5)
        if hug.sum() < max(10, bd.sum() * .25): continue           # 가장자리의 4분의 1 이상이 바탕 가장자리를 따라갈 때만
        m = max(3, int(np.bincount(D[hug]).argmax()))           # 바탕 부품 외곽선과 이 부품 외곽선 사이에 띠 한 칸 이상
        R = ndi.binary_dilation(hug, np.ones((5, 5))) & (D <= m + 2) & U & ~scr
        newP = P.copy(); newP[R] = D[R] >= m
        newP[R & ~P & ~ndi.binary_dilation(P, np.ones((3, 3)))] = False   # 한 칸 넘게 넓히지는 않음
        parts[z]['mask'] = newP
    col, part = compose()
    # ② 외곽선: 외곽선이 있는 부품의 가장자리 칸 중 먼저 그린 부품 · 배경과 맞닿은 칸
    objm = part >= 0
    edge = np.zeros((GH, GW), bool)
    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nb = np.full((GH, GW), -1, int)
        ys_, xs_ = slice(max(dy, 0), GH + min(dy, 0)), slice(max(dx, 0), GW + min(dx, 0))
        yd, xd = slice(max(-dy, 0), GH + min(-dy, 0)), slice(max(-dx, 0), GW + min(-dx, 0))
        nb[yd, xd] = part[ys_, xs_]
        edge |= objm & (nb < part) & np.isin(part, [z for z, P in enumerate(parts) if P['line']])
    edge &= ~scr
    out = col.copy(); out[edge] = INK

    # ③ 도트 다듬기: 외곽선의 ㄱ자 모서리 칸 빼기(두 이웃이 직각이고 대각선으로 이어지면) — 바깥이면 배경, 안이면 그 부품 색
    for _ in range(2):
        K = out == INK
        for gy in range(1, GH - 1):
            for gx in range(1, GW - 1):
                if not K[gy, gx]: continue
                n4 = [K[gy - 1, gx], K[gy, gx + 1], K[gy + 1, gx], K[gy, gx - 1]]
                n8 = K[gy - 1:gy + 2, gx - 1:gx + 2].sum() - 1
                if n8 != 2 or sum(n4) != 2 or (n4[0] and n4[2]) or (n4[1] and n4[3]): continue
                # 모서리 칸의 바깥(선이 아닌 두 이웃)이 배경이면 지움, 아니면 그 칸 부품 색
                opp = [(gy + 1, gx) if n4[0] else (gy - 1, gx), (gy, gx - 1) if n4[1] else (gy, gx + 1)]
                if all(part[o] < 0 for o in opp): out[gy, gx] = ''; part[gy, gx] = -1
                elif all(part[o] >= 0 and not K[o] for o in opp): out[gy, gx] = col[gy, gx]
                K[gy, gx] = out[gy, gx] == INK
    #    외딴 칸(네 이웃이 모두 같은 다른 색) → 그 색
    for gy in range(1, GH - 1):
        for gx in range(1, GW - 1):
            nb = [out[gy - 1, gx], out[gy + 1, gx], out[gy, gx - 1], out[gy, gx + 1]]
            if out[gy, gx] and not scr[gy, gx] and nb.count(nb[0]) == 4 and nb[0] and nb[0] != out[gy, gx]: out[gy, gx] = nb[0]

    # 내보내기(pixelize-console.py 와 같은 형식)
    hexes = sorted({c for c in out.ravel() if c}); idx = {h: i for i, h in enumerate(hexes)}
    ch = lambda gy, gx: '.' if not out[gy, gx] else (chr(65 + idx[out[gy, gx]]) if idx[out[gy, gx]] < 26 else chr(97 + idx[out[gy, gx]] - 26))
    rows = []
    for gy in range(GH):
        r, gx = [], 0
        while gx < GW:
            c = ch(gy, gx); n = 1
            while gx + n < GW and ch(gy, gx + n) == c: n += 1
            r.append(c + (str(n) if n > 1 else '')); gx += n
        rows.append(''.join(r))
    js = ('/* 스테이지 게임기 그림 — %s (18회차, Codex 벡터 원본을 tools/fc-pixel/svg-console.py 가 칸 격자에 찍음 · 손으로 고치지 마세요) */\n'
          'window.FcLevelArt && window.FcLevelArt.add(%r, { x: %d, y: %d, w: %d, h: %d, screen: [%d, %d, %d, %d], map: [%.3f, %.3f, %.4f],\n  pal: %s,\n  rows: [\n%s\n  ] });\n') % (
        a.name, a.name, GX0, GY0, GW, GH, Lc0, Tc0, cols, rows_, ox, oy, cell, '[' + ', '.join("'%s'" % c for c in hexes) + ']',
        ',\n'.join("    '%s'" % r for r in rows))
    path = os.path.join(a.out, 'fc-level-art-%s.js' % a.name)
    open(path, 'w').write(js)
    print(path, len(js), '바이트 ·', len(hexes), '색', file=sys.stderr)
    if a.preview:
        os.makedirs(a.preview, exist_ok=True)
        img = np.zeros((GH, GW, 3), np.uint8); img[...] = BG
        for gy in range(GH):
            for gx in range(GW):
                if out[gy, gx]: img[gy, gx] = [int(out[gy, gx][k:k + 2], 16) for k in (1, 3, 5)]
        Image.fromarray(img).resize((GW * 4, GH * 4), Image.NEAREST).save(os.path.join(a.preview, a.name + '.png'))


if __name__ == '__main__':
    main()
