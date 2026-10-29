"""스테이지 게임기 그림 갈래(18회차) — 그림마다 다른 화면 · 버튼 자리에 사이트 쪽(화면 속 내용 · 누르는 키 · 인쇄 글자)을 맞추는 CSS 를 뽑습니다.

입력: Codex 가 잰 부품 자리 controls.json(그림 px — 십자 · 고무 버튼 · 위 / 아래 둥근 버튼 · 글자 자리 넷)
      + assets/js/themes/fc-level-art-<이름>.js 의 screen(칸) · map(px → 칸) · 팔레트(글자 색 고르기)
출력: assets/css/themes/pixel-fc-level-art.css (그림은 건드리지 않고, 사이트의 자리만 그림에 맞춤)
사용: python3.13 tools/fc-pixel/console-art-css.py <controls.json> 1:riso 2:cutpaper 3:ink 4:gouache 5:mecha
"""
import json
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
INKS = ['#141114', '#f0cb6a', '#fff6dd']      # 글자 색 후보: 검정 · 금색 · 크림


def lum(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4 for v in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]


def contrast(a, b):
    x, y = sorted([lum(a), lum(b)], reverse=True)
    return (x + .05) / (y + .05)


def load(name):
    t = open(os.path.join(ROOT, 'assets', 'js', 'themes', 'fc-level-art-%s.js' % name)).read()
    m = re.search(r"x: (-?\d+), y: (-?\d+), w: (\d+), h: (\d+), screen: \[([\d, ]+)\], map: \[([\d., -]+)\]", t)
    gx, gy = int(m.group(1)), int(m.group(2))
    scr = [int(v) for v in m.group(5).split(',')]; ox, oy, cell = [float(v) for v in m.group(6).split(',')]
    pal = re.search(r"pal: \[([^\]]*)\]", t).group(1).replace("'", '').split(', ')
    grid = []
    for row in re.findall(r"^    '([^']*)'", t, re.M):
        r = []
        for c, n in re.findall(r"([.,A-Za-z])(\d*)", row):
            r += [None if c in '.,' else pal[ord(c) - 65 if c <= 'Z' else ord(c) - 71]] * (int(n) if n else 1)
        grid.append(r)
    return gx, gy, scr, (ox, oy, cell), grid


def main():
    ctl = json.load(open(sys.argv[1]))
    out = ['/* 스테이지 게임기 그림 갈래(18회차) — tools/fc-pixel/console-art-css.py 가 뽑음 · 손으로 고치지 마세요.',
           '   그림은 그대로 두고, 사이트 쪽 자리(화면 속 내용 .wrap · 투명 키 .fc-key · 인쇄 글자 .fc-lbl)만 그림의 화면 · 버튼 자리에 맞춥니다.',
           '   한 칸 = 0.5cqw(판 .fcs-rig 폭 기준). 900px 미만(세운 휴대기)은 스테이지의 CSS 게임기 그대로. */', '@media (min-width: 900px) {']
    for pair in sys.argv[2:]:
        key, name = pair.split(':')
        c = ctl[key]; gx, gy, scr, (ox, oy, cell), grid = load(name)
        P = ':root[data-skin-theme="pixel"][data-skin="pixel-fc-level"][data-skin-art="%s"] .fcs-rig > .hero.fc-console' % name
        cq = lambda v: '%.2fcqw' % (v * .5)
        def box(b, pad=0):     # 그림 px 상자 → 칸
            x, y, w, h = b
            return (x - ox) / cell - pad, (y - oy) / cell - pad, w / cell + 2 * pad, h / cell + 2 * pad
        def pos(x, y, w, h):
            return 'left: %s; top: %s; width: %s; height: %s;' % (cq(x), cq(y), cq(w), cq(h))
        def ink_for(b):        # 글자 자리의 가장 흔한 색 → 대비가 가장 큰 글자 색
            x, y, w, h = box(b); cols = {}
            for yy in range(int(y), int(y + h) + 1):
                for xx in range(int(x), int(x + w) + 1):
                    v = grid[yy - gy][xx - gx] if 0 <= yy - gy < len(grid) and 0 <= xx - gx < len(grid[0]) else None
                    if v: cols[v] = cols.get(v, 0) + 1
            bg = max(cols, key=cols.get) if cols else '#141114'
            return max(INKS, key=lambda i: contrast(i, bg)), bg
        out.append('  /* %s */' % name)
        out.append('  %s > .wrap { position: absolute; margin: 0; %s }' % (P, pos(*scr)))
        k = min(1, scr[2] / 128, (scr[3] - 2) / 68)   # 화면이 예전 게임기(128 × 68칸 — 아래 두 칸 여유)보다 작으면 화면 속 내용을 같은 비율로 줄임(꽂기 개요가 잘리지 않게)
        if k < .995:
            out.append('  %s > .wrap > :not(.fc-boot), %s > .wrap > .fc-boot > * { zoom: %.3f; }' % (P, P, k))
        dx, dy, dw, dh = box(c['dpad'])
        out.append('  %s .fc-key[data-fc-step="-1"] { %s }' % (P, pos(dx, dy + dh * .3, dw * .38, dh * .4)))
        out.append('  %s .fc-key[data-fc-step="1"] { %s }' % (P, pos(dx + dw * .62, dy + dh * .3, dw * .38, dh * .4)))
        out.append('  %s .fc-key--mail { %s border-radius: 1cqw; }' % (P, pos(*box(c['rubber'], 1))))
        out.append('  %s [data-fc-b] { %s }' % (P, pos(*box(c['btnUpper']))))
        out.append('  %s [data-fc-a] { %s }' % (P, pos(*box(c['btnLower']))))
        small = False
        for sel, k in (('> .fc-grip--l > .fc-lbl', 'labelDpad'), ('> .fc-grip--l .fc-ab > .fc-lbl', 'labelRubber'), ('[data-fc-lbl="b"]', 'labelUpper'), ('[data-fc-lbl="a"]', 'labelLower')):
            x, y, w, h = box(c[k]); ink, bg = ink_for(c[k]); small = small or h < 4.4
            out.append('  %s %s { %s line-height: %s; text-align: center; color: %s; }   /* 바탕 %s */' % (P, sel, pos(x, y, w, h), cq(h), ink, bg))
        if small:      # 글자 자리가 낮으면 커진 메뉴 화면에서도 11px 그대로(22px 가 넘침)
            out.append('  @container (min-width: 1000px) { %s .fc-lbl { font-size: 11px; letter-spacing: .04em; } }' % P)
    out.append('}')
    path = os.path.join(ROOT, 'assets', 'css', 'themes', 'pixel-fc-level-art.css')
    open(path, 'w').write('\n'.join(out) + '\n')
    print(path, file=sys.stderr)


if __name__ == '__main__':
    main()
