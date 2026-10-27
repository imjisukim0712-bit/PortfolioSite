"""3D 픽셀 안(pixel-fc-px3d) — 도트를 한 칸씩 규칙으로 찍어 만든 스프라이트

자동 변환(해상도 낮추기)이 아니라, 원본 패미컴의 부품을 도트 그림으로 다시 그립니다.
기울기는 CSS 로 돌리지 않고(돌리면 도트 격자가 깨짐) 그림 안에 3/4 시점으로 넣습니다 —
앞면은 화면과 나란한 직사각형, 위쪽 면은 밝게 · 오른쪽 옆면은 어둡게 D 칸 두께로.
도트 한 칸 = 화면 4px. 게임기·진열판은 크기가 변하므로 9조각(border-image)으로 붙이고,
붙이는 CSS 를 assets/css/themes/pixel-fc-px3d-parts.css 로 함께 씁니다.

사용: python3 tools/fc-pixel/sprites.py   (저장소 맨 위에서)
"""
import os

from PIL import Image

PX = 4                      # 도트 한 칸 = 화면 4px
OUT_DIR = 'assets/img/themes/fc-px3d'
SKIN = 'pixel-fc-px3d'

# ── 색 ────────────────────────────────────────────────────────────────────
INK = (22, 19, 19)
SHELL, SHELL_HI, SHELL_HI2, SHELL_LO = (46, 46, 46), (78, 78, 78), (60, 60, 60), (33, 33, 33)
SHELL_TOP, SHELL_TOP_HI, SHELL_SIDE = (88, 88, 88), (112, 112, 112), (24, 24, 24)
GRIP, GRIP_HI, GRIP_HI2, GRIP_LO = (140, 29, 34), (184, 50, 56), (160, 38, 44), (108, 20, 25)
GRIP_TOP, GRIP_TOP_HI, GRIP_SIDE = (196, 66, 72), (222, 98, 102), (84, 13, 17)
GOLD, GOLD_HI, GOLD_LO, GOLD_TOP, GOLD_SIDE = (233, 182, 74), (252, 220, 140), (178, 130, 44), (252, 220, 140), (140, 98, 30)
SCREW, SCREW_HI = (128, 128, 128), (196, 196, 196)
LED, LED_HI, LED_RING = (255, 86, 86), (255, 196, 196), (120, 18, 22)
KEY, KEY_HI, KEY_HI2, KEY_RING, KEY_LO = (43, 43, 43), (122, 122, 122), (80, 80, 80), (109, 109, 109), (22, 22, 22)
CART, CART_HI, CART_LO, CART_TOP, CART_SIDE = (58, 58, 58), (92, 92, 92), (40, 40, 40), (104, 104, 104), (30, 30, 30)
CHECK_A, CHECK_B, STRIPE = (48, 48, 48), (64, 64, 64), (140, 29, 34)
CREAM, CREAM_HI, CREAM_LO, CREAM_TOP, CREAM_SIDE = (236, 226, 201), (250, 244, 228), (214, 202, 172), (250, 244, 228), (176, 160, 124)
SHADOW = (22, 19, 19, 70)


class Canvas:
    def __init__(self, w, h, ml, mt, mr, mb):
        self.ml, self.mt, self.mr, self.mb = ml, mt, mr, mb
        self.W, self.H = w + ml + mr, h + mt + mb
        self.im = Image.new('RGBA', (self.W, self.H), (0, 0, 0, 0))
        self.px = self.im.load()

    def put(self, x, y, c):          # 앞면 좌표로 찍기
        X, Y = x + self.ml, y + self.mt
        if 0 <= X < self.W and 0 <= Y < self.H:
            self.px[X, Y] = c if len(c) == 4 else c + (255,)

    def get(self, x, y):
        X, Y = x + self.ml, y + self.mt
        return self.px[X, Y] if 0 <= X < self.W and 0 <= Y < self.H else (0, 0, 0, 0)

    def save(self, name):
        os.makedirs(OUT_DIR, exist_ok=True)
        self.im.resize((self.W * PX, self.H * PX), Image.NEAREST).save(os.path.join(OUT_DIR, name), optimize=True)
        return {'w': self.W * PX, 'h': self.H * PX,
                'out': {'top': self.mt * PX, 'right': self.mr * PX, 'bottom': self.mb * PX, 'left': self.ml * PX}}


def rounded(w, h, r):
    """둥근 직사각형 안쪽 판정 (도트 원 — 중심 기준 거리)."""
    def inside(x, y):
        if not (0 <= x < w and 0 <= y < h):
            return False
        cx = r - .5 if x < r else (w - r - .5 if x >= w - r else x)
        cy = r - .5 if y < r else (h - r - .5 if y >= h - r else y)
        return (x - cx) ** 2 + (y - cy) ** 2 <= (r - .25) ** 2 if (x < r or x >= w - r) and (y < r or y >= h - r) else True
    return inside


def extrude(cv, inside, w, h, depth, top_of, side_of):
    """앞면 실루엣을 오른쪽 위로 depth 칸 밀어 윗면·옆면을 찍고, 바깥 테두리를 잉크로."""
    for d in range(1, depth + 1):
        for y in range(h):
            for x in range(w):
                if not inside(x, y):
                    continue
                tx, ty = x + d, y - d
                if inside(tx, ty) or cv.get(tx, ty)[3]:
                    continue
                if not inside(x, y - 1):
                    cv.put(tx, ty, top_of(x, y, d))
                elif not inside(x + 1, y):
                    cv.put(tx, ty, side_of(x, y, d))
    # 대각선 모서리에서 생기는 바둑판 구멍 메우기 (양옆이나 위아래가 칠해진 빈칸)
    for _ in range(2):
        holes = []
        for y in range(-cv.mt, h + cv.mb):
            for x in range(-cv.ml, w + cv.mr):
                if cv.get(x, y)[3] or inside(x, y):
                    continue
                L, R, U, B = cv.get(x - 1, y), cv.get(x + 1, y), cv.get(x, y - 1), cv.get(x, y + 1)
                if L[3] == 255 and R[3] == 255:
                    holes.append((x, y, L[:3]))
                elif U[3] == 255 and B[3] == 255:
                    holes.append((x, y, B[:3]))
        for x, y, c in holes:
            cv.put(x, y, c)
    # 바깥 외곽선(면 포함 실루엣)
    sil = [[cv.get(x, y)[3] > 0 or inside(x, y) for x in range(-cv.ml, w + cv.mr)] for y in range(-cv.mt, h + cv.mb)]
    def solid(x, y):
        yy, xx = y + cv.mt, x + cv.ml
        return 0 <= yy < len(sil) and 0 <= xx < len(sil[0]) and sil[yy][xx]
    for y in range(-cv.mt, h + cv.mb):
        for x in range(-cv.ml, w + cv.mr):
            if solid(x, y) and not inside(x, y) and any(not solid(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                cv.put(x, y, INK)


def ground(cv, inside, w, h, dy=2):
    for y in range(h, h + dy):
        for x in range(1, w + 1):
            if inside(x - 1, y - dy) and not cv.get(x, y)[3]:
                cv.put(x, y, SHADOW)


def front_outline(cv, inside, w, h):
    for y in range(h):
        for x in range(w):
            if inside(x, y) and any(not inside(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                cv.put(x, y, INK)


def screw(cv, x, y):
    for dx, dy in ((0, 0), (1, 0), (2, 0), (0, 1), (2, 1), (0, 2), (1, 2), (2, 2)):
        cv.put(x + dx, y + dy, INK)
    cv.put(x + 1, y + 1, SCREW)
    cv.put(x, y, SCREW_HI)


# ── 게임기 (데스크톱) ─────────────────────────────────────────────────────
def console_desktop():
    W, H, R, D, G = 192, 100, 14, 5, 18           # 앞면 192×100 도트, 손잡이 18칸(금색 줄 포함)
    cv = Canvas(W, H, 1, D + 1, D + 1, 3)
    inside = rounded(W, H, R)
    def region(x):
        if x < G - 2 or x >= W - G + 2:
            return 'grip'
        if x < G or x >= W - G:
            return 'gold'
        return 'shell'
    for y in range(H):
        for x in range(W):
            if not inside(x, y):
                continue
            r = region(x)
            if r == 'grip':
                c = GRIP
                lx = x if x < W // 2 else W - 1 - x            # 바깥쪽에서 몇 칸
                if lx <= 2: c = GRIP_HI if (x < W // 2) else GRIP_LO
                elif lx <= 4 and (x + y) % 2 == 0: c = GRIP_HI2 if x < W // 2 else GRIP
                if y <= 2: c = GRIP_HI
                if y >= H - 3: c = GRIP_LO
            elif r == 'gold':
                c = GOLD_HI if x in (G - 2, W - G) else GOLD_LO
            else:
                c = SHELL
                if y <= 1: c = SHELL_HI
                elif y <= 3: c = SHELL_HI2
                elif y >= H - 3: c = SHELL_LO
            cv.put(x, y, c)
    front_outline(cv, inside, W, H)
    for sx in (5, W - 8):                            # 나사 네 개
        for sy in (4, H - 8):
            screw(cv, sx, sy)
    for dx, dy, c in ((0, 0, LED_RING), (1, 0, LED_RING), (0, 1, LED), (1, 1, LED), (0, 2, LED_RING), (1, 2, LED_RING)):   # 전원 LED
        cv.put(10 + dx, 3 + dy, c)
    cv.put(10, 4, LED_HI)
    for gx in range(W - 15, W - 5, 2):              # 오른쪽 손잡이 아래 스피커 구멍
        for gy in (H - 12, H - 10):
            cv.put(gx, gy, INK)
    def top_of(x, y, d):
        r = region(x)
        base = {'grip': GRIP_TOP, 'gold': GOLD_TOP, 'shell': SHELL_TOP}[r]
        return {'grip': GRIP_TOP_HI, 'gold': GOLD_HI, 'shell': SHELL_TOP_HI}[r] if d == 1 else base
    def side_of(x, y, d):
        return GRIP_SIDE if y > 3 else GRIP_TOP
    extrude(cv, inside, W, H, D, top_of, side_of)
    ground(cv, inside, W, H)
    info = cv.save('console.png')
    ml, mt = cv.ml, cv.mt
    info['slice'] = {'top': (mt + 12) * PX, 'right': (cv.mr + G) * PX, 'bottom': (cv.mb + 12) * PX, 'left': (ml + G) * PX}
    return info


# ── 게임기 (모바일: 화면 위 · 조작부 아래) ───────────────────────────────
def console_mobile():
    W, H, R, D, DECK = 94, 102, 10, 3, 28           # 아래 28칸이 조작부
    cv = Canvas(W, H, 1, D + 1, D + 1, 3)
    inside = rounded(W, H, R)
    for y in range(H):
        for x in range(W):
            if not inside(x, y):
                continue
            if y >= H - DECK + 4:
                c = GRIP
                if y == H - DECK + 4: c = GOLD_HI
                elif y == H - DECK + 5: c = GOLD_LO
                elif y == H - DECK + 6: c = GRIP_HI
                elif y >= H - 3: c = GRIP_LO
                elif x <= 1: c = GRIP_HI
            else:
                c = SHELL
                if y <= 1: c = SHELL_HI
                elif y <= 3: c = SHELL_HI2
            cv.put(x, y, c)
    front_outline(cv, inside, W, H)
    for sx in (4, W - 7):
        screw(cv, sx, H - 7)
    for dx, dy, c in ((0, 0, LED_RING), (1, 0, LED_RING), (0, 1, LED), (1, 1, LED)):
        cv.put(6 + dx, 2 + dy, c)
    def top_of(x, y, d):
        return SHELL_TOP_HI if d == 1 else SHELL_TOP
    def side_of(x, y, d):
        return GRIP_SIDE if y >= H - DECK + 4 else SHELL_SIDE
    extrude(cv, inside, W, H, D, top_of, side_of)
    ground(cv, inside, W, H)
    info = cv.save('console-m.png')
    info['slice'] = {'top': (cv.mt + 12) * PX, 'right': (cv.mr + 12) * PX, 'bottom': (cv.mb + DECK) * PX, 'left': (cv.ml + 12) * PX}
    return info


# ── 손잡이 버튼 (지름 9칸) ────────────────────────────────────────────────
def key():
    W = H = 9
    cv = Canvas(W, H, 1, 1, 1, 2)
    inside = rounded(W, H, 4)
    for y in range(H):
        for x in range(W):
            if inside(x, y):
                cv.put(x, y, KEY if y < 6 else KEY_LO)
    for x, y in ((3, 1), (4, 1), (2, 2), (5, 1)):
        cv.put(x, y, KEY_HI2)
    cv.put(2, 2, KEY_HI); cv.put(3, 2, KEY_HI)
    for y in range(H):
        for x in range(W):
            if inside(x, y) and any(not inside(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                cv.put(x, y, KEY_RING if y < 5 else INK)
    for y in range(H):                              # 아래로 한 칸 두께 (원 모양 그대로 한 칸 내려 그림)
        for x in range(W):
            if inside(x, y) and not inside(x, y + 1):
                cv.put(x, y + 1, INK)
    return cv.save('key.png')


# ── 카트리지 (앞면 34×45, 라벨은 화면 글자) ───────────────────────────────
def cartridge():
    W, H, D = 34, 45, 3
    cv = Canvas(W, H, 1, D + 1, D + 1, 3)
    inside = rounded(W, H, 2)
    for y in range(H):
        for x in range(W):
            if inside(x, y):
                c = CART
                if y <= 1 or x <= 1: c = CART_HI
                elif y >= H - 2 or x >= W - 2: c = CART_LO
                cv.put(x, y, c)
    front_outline(cv, inside, W, H)
    for x in range(6, W - 6):                       # 금색 단자
        cv.put(x, 1, GOLD_HI if x % 2 == 0 else INK)
        cv.put(x, 2, GOLD if x % 2 == 0 else INK)
    for x in range(4, W - 4, 3):                    # 위쪽 손잡이 홈
        cv.put(x, 4, CART_LO)
    def top_of(x, y, d):
        return CART_TOP
    def side_of(x, y, d):
        return CART_SIDE
    extrude(cv, inside, W, H, D, top_of, side_of)
    for ex in list(range(3, 9)) + list(range(W - 9, W - 3)):   # 아래 귀 두 개
        cv.put(ex, H, CART_LO); cv.put(ex, H + 1, INK)
    ground(cv, inside, W, H, 1)
    return cv.save('cart.png')


# ── 덱 (뒷면 세 장이 겹친 더미) ───────────────────────────────────────────
def deck():
    W, H, D, OFF = 34, 45, 3, 3
    cv = Canvas(W, H, 1, D + OFF * 2 + 1, D + OFF * 2 + 1, 3)
    inside = rounded(W, H, 2)
    for k in (2, 1, 0):                             # 뒤 카드부터
        ox, oy = k * OFF, -k * OFF
        for y in range(H):
            for x in range(W):
                if not inside(x, y):
                    continue
                c = CART if k else CART
                if y <= 1 or x <= 1: c = CART_HI
                elif y >= H - 2 or x >= W - 2: c = CART_LO
                if 2 <= x < W - 2 and 7 <= y < H - 3:     # 라벨: 체크 디더 + 빨간 띠
                    c = STRIPE if y < 9 else (CHECK_B if ((x // 2) + (y // 2)) % 2 else CHECK_A)
                cv.put(x + ox, y + oy, c)
        for y in range(H):
            for x in range(W):
                if inside(x, y) and any(not inside(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    cv.put(x + ox, y + oy, INK)
        for x in range(6, W - 6):
            cv.put(x + ox, 2 + oy, GOLD if x % 2 == 0 else INK)
    ground(cv, inside, W, H, 1)
    return cv.save('deck.png')


# ── 진열판 (크림 판, 9조각) ───────────────────────────────────────────────
def tray():
    W, H, R, D = 60, 40, 3, 4
    cv = Canvas(W, H, 1, D + 1, D + 1, 3)
    inside = rounded(W, H, R)
    for y in range(H):
        for x in range(W):
            if inside(x, y):
                c = CREAM
                if y <= 1 or x <= 1: c = CREAM_HI
                elif y >= H - 2: c = CREAM_LO
                cv.put(x, y, c)
    front_outline(cv, inside, W, H)
    extrude(cv, inside, W, H, D, lambda x, y, d: CREAM_TOP if d < D else CREAM_HI, lambda x, y, d: CREAM_SIDE)
    ground(cv, inside, W, H)
    info = cv.save('tray.png')
    info['slice'] = {'top': (cv.mt + 6) * PX, 'right': (cv.mr + 6) * PX, 'bottom': (cv.mb + 6) * PX, 'left': (cv.ml + 6) * PX}
    info['front'] = (W * PX, H * PX)
    return info


def css(parts):
    S = ':root[data-skin="%s"]' % SKIN
    rel = '../../img/themes/fc-px3d'
    L = ['/* 자동 생성 — tools/fc-pixel/sprites.py (손으로 고치지 마세요). 도트 스프라이트를 붙입니다. */']
    def bi(p, f, rep='stretch'):
        s, o = p['slice'], p['out']
        return ("border-image: url('%s/%s') %d %d %d %d fill / %dpx %dpx %dpx %dpx / %dpx %dpx %dpx %dpx %s;"
                % (rel, f, s['top'], s['right'], s['bottom'], s['left'], s['top'], s['right'], s['bottom'], s['left'],
                   o['top'], o['right'], o['bottom'], o['left'], rep))
    def pct(p, fw, fh):
        o = p['out']
        return 'top: -%.3f%%; right: -%.3f%%; bottom: -%.3f%%; left: -%.3f%%;' % (o['top'] / fh * 100, o['right'] / fw * 100, o['bottom'] / fh * 100, o['left'] / fw * 100)
    L.append('%s .hero, %s .home-screen .hero { %s }' % (S, S, bi(parts['console'], 'console.png')))
    L.append('@media (max-width: 700px) { %s .hero, %s .home-screen .hero { %s } }' % (S, S, bi(parts['console-m'], 'console-m.png')))
    L.append("%s .fc-key::before { %s background-image: url('%s/key.png'); }" % (S, pct(parts['key'], 9 * PX, 9 * PX), rel))
    L.append("%s .gcard::before { %s background-image: url('%s/cart.png'); }" % (S, pct(parts['cart'], 34 * PX, 45 * PX), rel))
    L.append("%s .draw__deck::before { %s background-image: url('%s/deck.png'); }" % (S, pct(parts['deck'], 34 * PX, 45 * PX), rel))
    L.append('%s .fcs-rig .draw__stage { %s }' % (S, bi(parts['tray'], 'tray.png')))
    open('assets/css/themes/%s-parts.css' % SKIN, 'w').write('\n'.join(L) + '\n')


def main():
    parts = {'console': console_desktop(), 'console-m': console_mobile(), 'key': key(),
             'cart': cartridge(), 'deck': deck(), 'tray': tray()}
    for k, v in parts.items():
        print(k, v['w'], v['h'])
    css(parts)


if __name__ == '__main__':
    main()
