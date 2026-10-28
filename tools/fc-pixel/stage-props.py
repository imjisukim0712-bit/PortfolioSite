# 스테이지(pixel-fc-level) 소품 — 슈퍼 마리오 브라더스(1985) 1-1 · 1-2 의 그림 문법을 따라 한 칸씩 찍은 격자 그림을 CSS data URI 로 뽑습니다.
# 사용법: python3 tools/fc-pixel/stage-props.py  → 출력된 --lv-* 줄을 assets/css/themes/pixel-fc-folio.css 의 스테이지 13회차 절에 붙여 넣기.
#
# 따르는 규칙(원작에서 확인한 것):
#   · 색은 원작 롬의 팔레트 묶음 그대로 — GroundPaletteData / UndergroundPaletteData (6502disassembly.com/nes-smb, $8CC8 · $8CEC)
#       초록 묶음 $29 $1A $0F (관 · 언덕 · 덤불)      땅 · 벽돌 묶음 $36 $17 $0F      구름 묶음 $30 $21 $0F
#       물음표 블록 · 동전 묶음 $27 $17 $0F            지하 땅 · 벽돌 묶음 $3C $1C $0F (바탕은 검정)      하늘 $22
#     (색 번호를 RGB 로 옮긴 값은 흔히 쓰는 NES 팔레트 — 하늘 #5c94fc · 벽돌 #c84c0c 와 같은 표)
#   · 모든 그림이 같은 크기의 칸(원작 1픽셀 = 4px)이고 검은 외곽선. 땅은 벽돌이 아니라 '땅 블록'(16×16칸)을 쌓은 것.
#   · 원작 그림을 그대로 베끼지 않고 같은 문법으로 새로 찍습니다. 캐릭터 · 아이템 · 로고는 그리지 않습니다.
#   · 그림은 원래 크기(1배)로만 씁니다. 줄이거나 늘리면 칸이 고르지 않게 됩니다.
import urllib.parse

U = 4   # 원작 1픽셀 = 4px
PAL = {
    'K': '#171c28',                        # 검정(사이트의 먹색 — 원작 $0F 자리)
    'g': '#80d010', 'G': '#00a800',        # 초록 묶음 $29 · $1A
    'l': '#fcbcb0', 'm': '#c84c0c',        # 땅 · 벽돌 묶음 $36 · $17
    'w': '#fcfcfc', 'c': '#3cbcfc',        # 구름 묶음 $30 · $21
    'o': '#fc9838',                        # 물음표 블록 · 동전 $27 (갈색은 $17 = 'm')
    'u': '#a4e4fc', 'v': '#008888',        # 지하 땅 · 벽돌 묶음 $3C · $1C
}

def svg(rows):
    w, h = len(rows[0]), len(rows)
    assert all(len(r) == w for r in rows), [len(r) for r in rows]
    body = []
    for y, row in enumerate(rows):
        x = 0
        while x < w:
            ch = row[x]
            if ch == '.': x += 1; continue
            n = 1
            while x + n < w and row[x + n] == ch: n += 1
            body.append(f"<rect x='{x*U}' y='{y*U}' width='{n*U}' height='{U}' fill='{PAL[ch]}'/>")
            x += n
    s = (f"<svg xmlns='http://www.w3.org/2000/svg' width='{w*U}' height='{h*U}' viewBox='0 0 {w*U} {h*U}' "
         f"shape-rendering='crispEdges'>{''.join(body)}</svg>")
    return 'url("data:image/svg+xml,' + urllib.parse.quote(s, safe="=/:' ") + '")', w * U, h * U

def outline(mask, fill, ground=False):
    """mask: '#' = 그림 안. 바깥과 맞닿은 칸을 검은 선으로. ground=True 면 아랫변은 땅에 묻혀 선을 긋지 않음."""
    h, w = len(mask), len(mask[0])
    inside = lambda x, y: 0 <= x < w and 0 <= y < h and mask[y][x] == '#'
    out = []
    for y in range(h):
        row = ''
        for x in range(w):
            if not inside(x, y): row += '.'; continue
            nb = [(x-1, y), (x+1, y), (x, y-1)] + ([] if ground and y == h - 1 else [(x, y+1)])
            row += 'K' if any(not inside(a, b) for a, b in nb) else fill
        out.append(row)
    return out

def paint(rows, spots, ch):
    rows = [list(r) for r in rows]
    for x, y in spots:
        if rows[y][x] not in '.K': rows[y][x] = ch
    return [''.join(r) for r in rows]

def puffs(w, h, circles, base_from):
    """구름 · 덤불 실루엣: 원 몇 개 + 아랫부분 직사각형."""
    m = []
    for y in range(h):
        row = ''
        for x in range(w):
            hit = y >= base_from and 1 <= x <= w - 2
            for cx, cy, r in circles:
                if (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r: hit = True
            row += '#' if hit else '.'
        m.append(row)
    return m

S = {}

# 땅 블록 (16×16칸 = 64px) — 밝은 윗변 · 왼변, 검은 아랫변 · 오른변, 안쪽에 갈라진 금 두 줄(위는 세로, 아래는 계단)
S['ground'] = [
    'lllllllllKllllll',
    'lmmmmmmmmKlmmmmK',
    'lmmmmmmmmKlmmmmK',
    'lmmmmmmmmKlmmmmK',
    'lmmmmmmmmKlmmmmK',
    'lmmmmmmmmKKlmmmK',
    'lmmmmmmmmKlmmmmK',
    'lmmmmmmmmKlmmmmK',
    'lmmmmmmmmKlmmmmK',
    'KKmmmmmmKlmmmmmK',
    'llKKKKKKlmmmmmmK',
    'lmmmmmmKlmmmmmmK',
    'lmmmmmmKlmmmmmmK',
    'lmmmmmmKlmmmmmmK',
    'lmmmmmmKlmmmmmmK',
    'KKKKKKKKKKKKKKKK',
]
# 지하 땅 블록 — 같은 모양을 지하 묶음 색으로
S['uground'] = [r.replace('l', 'u').replace('m', 'v') for r in S['ground']]

# 벽돌 (16×8칸 = 64×32 타일 — 창 윗변의 벽돌 턱 · 진열판 테에 반복) — 4칸 높이 단 두 줄, 세로 줄눈이 엇갈림
S['bricks'] = [
    'lllllllKlllllllK',
    'mmmmmmmKmmmmmmmK',
    'mmmmmmmKmmmmmmmK',
    'KKKKKKKKKKKKKKKK',
    'lllKlllllllKllll',
    'mmmKmmmmmmmKmmmm',
    'mmmKmmmmmmmKmmmm',
    'KKKKKKKKKKKKKKKK',
]
# 벽돌 블록 (16×16칸 = 64px) — 떠 있는 블록 줄
S['brick'] = S['bricks'] + S['bricks']

# 물음표 블록 (16×16칸 = 64px) — 주황 면 · 갈색 윗변 · 검은 그림자 · 네 귀 리벳 · 물음표
S['qblock'] = [
    'mmmmmmmmmmmmmmm.',
    'mooooooooooooooK',
    'moKooooooooooKoK',
    'moooommmmmoooooK',
    'mooommKKKmmooooK',
    'mooommKoommKoooK',
    'moooKKooommKoooK',
    'mooooooommKKoooK',
    'moooooommKKooooK',
    'moooooommKoooooK',
    'mooooooKKooooooK',
    'moooooommooooooK',
    'moooooommKoooooK',
    'moKooooooKKooKoK',
    'mooooooooooooooK',
    'KKKKKKKKKKKKKKKK',
]

# 동전 (6×10칸 = 24×40) · 작은 동전 (4×6칸 = 16×24, 점수판 숫자 옆) — 물음표 블록 묶음 색
S['coin'] = [
    '.KKKK.',
    'KooooK',
    'KomooK',
    'KomooK',
    'KomooK',
    'KomooK',
    'KomooK',
    'KomooK',
    'KooooK',
    '.KKKK.',
]
S['coin-s'] = ['.KK.', 'KomK', 'KomK', 'KomK', 'KomK', '.KK.']

# 초록 관 (32×32칸 = 128px) — 머리 10칸 + 몸통 22칸. 밝은 초록 면에 어두운 초록 세로 줄(왼쪽 가는 줄 · 오른쪽 굵은 그늘)
LIP_IN = 'G' + 'gg' + 'G' + 'g' * 14 + 'GG' + 'g' + 'GGG' + 'g' + 'GGG' + 'G' + 'G'   # 30칸
BODY_IN = 'G' + 'gg' + 'G' + 'g' * 12 + 'GG' + 'g' + 'GGG' + 'g' + 'GG' + 'G'          # 26칸
assert len(LIP_IN) == 30 and len(BODY_IN) == 26, (len(LIP_IN), len(BODY_IN))
S['pipe'] = (['K' * 32] + ['K' + LIP_IN + 'K'] * 8 + ['K' * 32]
             + ['..K' + BODY_IN + 'K..'] * 22)

# 언덕 (48×19칸 = 192×76) — 계단진 둥근 지붕, 검은 외곽선(아랫변은 땅에 묻힘), 검은 점
HILL_W = [12, 20, 26, 30, 34, 36, 38, 40, 42, 42, 44, 44, 46, 46, 46, 48, 48, 48, 48]
hill = outline([('#' * wd).center(48, '.') for wd in HILL_W], 'G', ground=True)
S['hill'] = paint(hill, [(20, 5), (20, 6), (20, 7), (28, 9), (28, 10), (28, 11), (14, 12), (14, 13), (14, 14),
                         (33, 14), (33, 15), (33, 16)], 'K')

# 구름 (28×12칸 = 112×48) — 흰 몸통 · 아랫단 하늘색 그늘 · 검은 외곽선
cloud = outline(puffs(28, 12, [(8, 7, 4.6), (14, 5.4, 5.6), (20.5, 7, 4.6)], 7), 'w')
S['cloud'] = paint(cloud, [(x, y) for y in (9, 10) for x in range(2, 26)] + [(9, 5), (15, 3), (21, 5)], 'c')

# 덤불 (32×14칸 = 128×56) — 구름과 같은 문법을 초록 묶음으로(밝은 초록 몸통 · 어두운 초록 무늬 · 아랫변은 땅에 묻힘)
bush = outline(puffs(32, 14, [(6.5, 9, 5), (13, 6.5, 6.2), (19.5, 6.5, 6.2), (25.5, 9, 5)], 9), 'g', ground=True)
S['bush'] = paint(bush, [(8, 7), (9, 6), (14, 4), (15, 3), (20, 4), (21, 3), (26, 7), (27, 6)], 'G')

if __name__ == '__main__':
    for name, rows in S.items():
        uri, w, h = svg(rows)
        print(f'--lv-{name}: {uri};   /* {w}×{h} */')
