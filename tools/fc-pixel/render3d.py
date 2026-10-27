"""원본 패미컴 부품 → 3D 픽셀 / 복셀 그림 + 붙이는 CSS

capture-fc.js 가 딴 PNG 와 meta.json 을 받아
  bevel : 4px 도트로 줄이고 12색 → 한 칸 외곽선 + 안쪽 한 칸 명암(위·왼쪽 밝게, 아래·오른쪽 어둡게) + 딱딱한 그림자
  voxel : 8px 블록으로 줄이고 → 블록마다 앞면(이음매 선) + 위로 보이는 윗면(밝게) + 오른쪽 옆면(어둡게)을 쌓아 올림
으로 그린 뒤 assets/img/themes/<폴더>/ 에 저장하고, 그 그림을 페이지에 붙이는 CSS 를
assets/css/themes/pixel-fc-<스킨>-parts.css 로 함께 씁니다(스킨 CSS 맨 위에서 @import).

사용: python3 tools/fc-pixel/render3d.py bevel <capture 폴더> assets/img/themes/fc-px3d
      python3 tools/fc-pixel/render3d.py voxel <capture 폴더> assets/img/themes/fc-voxel
"""
import json
import os
import sys
from collections import deque

from PIL import Image, ImageDraw

MODE = {
    'bevel': {'cell': 4, 'colors': 24, 'skin': 'pixel-fc-px3d', 'margin': (1, 3, 3, 1), 'repeat': 'stretch', 'small': 3},
    'voxel': {'cell': 10, 'colors': 20, 'skin': 'pixel-fc-voxel', 'margin': (3, 3, 2, 1), 'repeat': 'round', 'small': 4},
}
DEPTH = 2.6   # 복셀 깊이(블록 수) — 윗면·옆면이 보이는 두께
SMALL = ('key-', 'cart', 'deck')   # 작은 부품은 더 잘게 (버튼이 네모 한 덩어리가 되지 않도록)


def clamp(v):
    return max(0, min(255, int(v)))


def shade(c, k):
    return (clamp(c[0] * k), clamp(c[1] * k), clamp(c[2] * k))


def to_grid(im, cell, colors):
    """캔버스를 cell 배수로 맞춘 뒤 cell 칸 격자로 줄이고 색을 줄임. 반투명 그림자는 버림."""
    w, h = -(-im.width // cell) * cell, -(-im.height // cell) * cell
    canvas = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    canvas.paste(im, (0, 0))
    small = canvas.resize((w // cell, h // cell), Image.BOX)
    rgb = Image.new('RGB', small.size, (0, 0, 0))
    rgb.paste(small, mask=small.split()[3])
    pal = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB').load()
    a = small.split()[3].load()
    gw, gh = small.size
    grid = [[pal[x, y] if a[x, y] >= 140 else None for x in range(gw)] for y in range(gh)]
    return keep_largest(grid), (w, h)


def keep_largest(grid):
    """옆 부품이 살짝 걸려 들어온 조각을 지우고 가장 큰 덩어리만 남김."""
    gh, gw = len(grid), len(grid[0])
    seen = [[False] * gw for _ in range(gh)]
    best = []
    for sy in range(gh):
        for sx in range(gw):
            if grid[sy][sx] is None or seen[sy][sx]:
                continue
            comp, q = [], deque([(sx, sy)])
            seen[sy][sx] = True
            while q:
                x, y = q.popleft()
                comp.append((x, y))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < gw and 0 <= ny < gh and not seen[ny][nx] and grid[ny][nx] is not None:
                            seen[ny][nx] = True
                            q.append((nx, ny))
            if len(comp) > len(best):
                best = comp
    keep = set(best)
    return [[grid[y][x] if (x, y) in keep else None for x in range(gw)] for y in range(gh)]


def with_margin(grid, m):
    t, r, b, l = m
    gw = len(grid[0])
    row = lambda n: [None] * n
    out = [row(l + gw + r) for _ in range(t)]
    out += [row(l) + g + row(r) for g in grid]
    out += [row(l + gw + r) for _ in range(b)]
    return out


def solid(grid, x, y):
    return 0 <= y < len(grid) and 0 <= x < len(grid[0]) and grid[y][x] is not None


def render_bevel(grid, cell):
    gh, gw = len(grid), len(grid[0])
    out = Image.new('RGBA', (gw, gh), (0, 0, 0, 0))
    o = out.load()
    ink = (26, 18, 18)
    for y in range(gh):                                   # 딱딱한 그림자: 오른쪽 아래로 두 칸
        for x in range(gw):
            if solid(grid, x - 2, y - 2) and not solid(grid, x, y):
                o[x, y] = ink + (120,)
    ring1 = set()
    for y in range(gh):
        for x in range(gw):
            if grid[y][x] is not None and not all(solid(grid, x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                ring1.add((x, y))
    for y in range(gh):
        for x in range(gw):
            c = grid[y][x]
            if c is None:
                continue
            if (x, y) in ring1:
                o[x, y] = shade(c, .34) + (255,)
            elif (x, y - 1) in ring1 or (x - 1, y) in ring1:
                o[x, y] = shade(c, 1.32) + (255,)
            elif (x, y + 1) in ring1 or (x + 1, y) in ring1:
                o[x, y] = shade(c, .68) + (255,)
            else:
                o[x, y] = c + (255,)
    return out.resize((gw * cell, gh * cell), Image.NEAREST)


def render_voxel(grid, cell):
    gh, gw = len(grid), len(grid[0])
    out = Image.new('RGBA', (gw * cell, gh * cell), (0, 0, 0, 0))
    d = ImageDraw.Draw(out)
    off = int(round(DEPTH * cell / 2))
    # 바닥 그림자: 한 칸 아래
    for y in range(gh):
        for x in range(gw):
            if grid[y][x] is not None and not solid(grid, x, y + 1):
                d.rectangle([x * cell, (y + 1) * cell, x * cell + cell - 1, (y + 1) * cell + cell // 2 - 1], fill=(26, 18, 18, 70))
    # 윗면 · 옆면 — 먼 것(오른쪽 위)부터
    faces = []
    for y in range(gh):
        for x in range(gw):
            c = grid[y][x]
            if c is None:
                continue
            X, Y = x * cell, y * cell
            if not solid(grid, x, y - 1):
                faces.append((x, y, [(X, Y), (X + cell, Y), (X + cell + off, Y - off), (X + off, Y - off)], shade(c, 1.24)))
            if not solid(grid, x + 1, y):
                faces.append((x, y, [(X + cell, Y), (X + cell + off, Y - off), (X + cell + off, Y + cell - off), (X + cell, Y + cell)], shade(c, .6)))
    for _, _, poly, col in sorted(faces, key=lambda f: (-f[0], f[1])):
        d.polygon(poly, fill=col + (255,))
    # 앞면 + 블록 이음매
    for y in range(gh):
        for x in range(gw):
            c = grid[y][x]
            if c is None:
                continue
            X, Y = x * cell, y * cell
            d.rectangle([X, Y, X + cell - 1, Y + cell - 1], fill=c + (255,))
            if cell >= 6:   # 큰 블록만 이음매 (작은 블록은 이음매가 그물처럼 보임)
                d.line([(X, Y), (X + cell - 1, Y)], fill=shade(c, 1.2) + (255,))
                d.line([(X, Y), (X, Y + cell - 1)], fill=shade(c, 1.1) + (255,))
                d.line([(X + cell - 1, Y), (X + cell - 1, Y + cell - 1)], fill=shade(c, .76) + (255,))
                d.line([(X, Y + cell - 1), (X + cell - 1, Y + cell - 1)], fill=shade(c, .76) + (255,))
    return out


def snap(v, cell):
    return int(-(-v // cell) * cell)


def main():
    mode, raw, dest = sys.argv[1], sys.argv[2], sys.argv[3]
    cfg = MODE[mode]
    (mt, mr, mb, ml) = cfg['margin']
    os.makedirs(dest, exist_ok=True)
    meta = json.load(open(os.path.join(raw, 'meta.json')))['meta']
    parts = {}
    for m in meta:
        cell = cfg['small'] if m['file'].startswith(SMALL) else cfg['cell']
        im = Image.open(os.path.join(raw, m['file'])).convert('RGBA')
        grid, size = to_grid(im, cell, cfg['colors'])
        grid = with_margin(grid, cfg['margin'])
        out = (render_voxel if mode == 'voxel' else render_bevel)(grid, cell)
        out.save(os.path.join(dest, m['file']), optimize=True)
        info = {'w': out.width, 'h': out.height,
                'out': {'top': m['pad'] + mt * cell, 'right': m['pad'] + mr * cell + (size[0] - im.width),
                        'bottom': m['pad'] + mb * cell + (size[1] - im.height), 'left': m['pad'] + ml * cell}}
        if 'slice' in m:
            s = m['slice']
            info['slice'] = {'top': snap(s['top'] + mt * cell, cell), 'right': snap(s['right'] + mr * cell + (size[0] - im.width), cell),
                             'bottom': snap(s['bottom'] + mb * cell + (size[1] - im.height), cell), 'left': snap(s['left'] + ml * cell, cell)}
        if 'insetPct' in m:
            border = 3 if m['file'] == 'cart.png' else 0
            iw, ih = m['w'] - border * 2, m['h'] - border * 2
            o = info['out']
            info['inset'] = {k: round((o[k] + border) / (iw if k in ('left', 'right') else ih) * 100, 3) for k in o}
        parts[m['file']] = info
        print(m['file'], out.size)
    json.dump(parts, open(os.path.join(dest, 'parts.json'), 'w'), indent=1)
    write_css(cfg, parts, dest)


def write_css(cfg, parts, dest):
    skin = cfg['skin']
    S = ':root[data-skin="%s"]' % skin   # :root 로 특이도를 높여 스킨 CSS 의 원본 규칙보다 앞섬
    rel = '../../img/themes/' + os.path.basename(dest.rstrip('/'))
    L = ['/* 자동 생성 — tools/fc-pixel/render3d.py (손으로 고치지 마세요). 원본 패미컴 부품을 %s 그림으로 붙입니다. */' % skin]

    def border_image(p, file):
        s, o = p['slice'], p['out']
        return ("border-image: url('%s/%s') %d %d %d %d fill / %dpx %dpx %dpx %dpx / %dpx %dpx %dpx %dpx %s;"
                % (rel, file, s['top'], s['right'], s['bottom'], s['left'], s['top'], s['right'], s['bottom'], s['left'],
                   o['top'], o['right'], o['bottom'], o['left'], cfg['repeat']))

    def inset(p):
        i = p['inset']
        return 'top: -%s%%; right: -%s%%; bottom: -%s%%; left: -%s%%;' % (i['top'], i['right'], i['bottom'], i['left'])

    L.append('%s .hero, %s .home-screen .hero { %s }' % (S, S, border_image(parts['console.png'], 'console.png')))
    if 'console-m.png' in parts:
        L.append('@media (max-width: 700px) { %s .hero, %s .home-screen .hero { %s } }' % (S, S, border_image(parts['console-m.png'], 'console-m.png')))
    keys = {'key-prev.png': '.fc-key[data-fc-step="-1"]', 'key-next.png': '.fc-key[data-fc-step="1"]', 'key-mail.png': '.fc-key--mail',
            'key-b.png': '.fc-key[data-fc-b]', 'key-a.png': '.fc-key[data-fc-a]'}
    for f, sel in keys.items():
        if f in parts:
            L.append("%s %s::before { %s background-image: url('%s/%s'); }" % (S, sel, inset(parts[f]), rel, f))
    if 'cart.png' in parts:
        L.append("%s .gcard::before { %s background-image: url('%s/cart.png'); }" % (S, inset(parts['cart.png']), rel))
    if 'deck.png' in parts:
        L.append("%s .draw__deck::before { %s background-image: url('%s/deck.png'); }" % (S, inset(parts['deck.png']), rel))
    path = os.path.join('assets', 'css', 'themes', skin + '-parts.css')
    open(path, 'w').write('\n'.join(L) + '\n')
    print('css', path)


if __name__ == '__main__':
    main()
