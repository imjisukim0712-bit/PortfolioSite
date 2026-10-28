# 스테이지(pixel-fc-level) 소품 — 픽셀을 한 칸씩 직접 찍은 격자 그림을 CSS data URI 로 뽑습니다.
# 사용법: python3 tools/fc-pixel/stage-props.py  → 출력된 --lv-* 줄을 assets/css/themes/pixel-fc-folio.css 의 스테이지 13회차 절에 붙여 넣기.
#
# 기존 스테이지 그림과 같은 규칙으로 찍습니다(섞으면 '깨져' 보임):
#   · 물건(관 · 동전 · 벽돌 블록)  = 4px 한 칸 + 남색 외곽선 #171c28   ← 물음표 블록 · 땅 벽돌과 같은 격자
#   · 배경(덤불)                    = 8px 한 칸 · 외곽선 없음 · 두 톤      ← 언덕 · 구름과 같은 격자
#   · 그림은 원래 크기(1배)로만 씁니다. 줄이거나 늘리면 칸이 고르지 않게 됩니다.
# 캐릭터 · 아이템 · 로고는 그리지 않습니다(지형 · 소품만).
import urllib.parse

PAL = {
    'X': '#171c28',                                    # 외곽선 · 모르타르
    'g': '#00a800', 'L': '#58d854', 'd': '#005624',    # 초록 (언덕과 같은 #00a800 · #005624)
    'o': '#fca044', 'h': '#ffdb98', 'r': '#c84c0c',    # 주황 · 밝은 크림 · 벽돌 (물음표 블록과 같은 색)
}

def grid_svg(rows, unit):
    w, h = len(rows[0]), len(rows)
    assert all(len(r) == w for r in rows), rows
    body = []
    for y, row in enumerate(rows):
        x = 0
        while x < w:
            c = row[x]
            if c == '.':
                x += 1; continue
            run = 1
            while x + run < w and row[x + run] == c: run += 1
            body.append(f"<rect x='{x * unit}' y='{y * unit}' width='{run * unit}' height='{unit}' fill='{PAL[c]}'/>")
            x += run
    s = f"<svg xmlns='http://www.w3.org/2000/svg' width='{w * unit}' height='{h * unit}' viewBox='0 0 {w * unit} {h * unit}' shape-rendering='crispEdges'>{''.join(body)}</svg>"
    return 'url("data:image/svg+xml,' + urllib.parse.quote(s, safe="=/:' ") + '")', w * unit, h * unit

SPRITES = {}

# 초록 관 (4px · 16×18칸 = 64×72) — 머리 6칸 + 몸통 12칸, 밝은 줄 · 어두운 줄 위치를 머리와 몸통이 맞춤
LIP = 'X' + 'gLLgLggggggdgd' + 'X'
BODY = '.X' + 'LLgLggggggdg' + 'X.'
SPRITES['pipe'] = (['X' * 16] + [LIP] * 4 + ['X' * 16] + [BODY] * 12, 4)

# 동전 (4px · 5×8칸 = 20×32) — 떠 있는 블록 위
SPRITES['coin'] = ([
    '.XXX.',
    'XoooX',
    'XhorX',
    'XhorX',
    'XhorX',
    'XhorX',
    'XoooX',
    '.XXX.',
], 4)

# 작은 동전 (4px · 4×6칸 = 16×24) — 점수판 숫자(24px) 옆
SPRITES['coin-s'] = ([
    '.XX.',
    'XhoX',
    'XhoX',
    'XhoX',
    'XhoX',
    '.XX.',
], 4)

# 벽돌 블록 (4px · 12×12칸 = 48×48) — 물음표 블록과 같은 크기 · 외곽선, 땅 벽돌과 같은 짜임(모르타르 · 밝은 띠)
SPRITES['brick'] = ([
    'XXXXXXXXXXXX',
    'XhhhhhhhhhhX',
    'XrrrrrrXrrrX',
    'XrrrrrrXrrrX',
    'XXXXXXXXXXXX',
    'XhhhXhhhhhhX',
    'XrrrXrrrrrrX',
    'XrrrXrrrrrrX',
    'XXXXXXXXXXXX',
    'XhhhhhhXhhhX',
    'XrrrrrrXrrrX',
    'XXXXXXXXXXXX',
], 4)

# 덤불 (8px · 14×6칸 = 112×48) — 구름과 같은 실루엣을 초록으로(언덕처럼 외곽선 없이, 어두운 점 셋)
SPRITES['bush'] = ([
    '....ggg.......',
    '..ggggggg.gg..',
    '.ggggggggggggg',
    'gggdggggggdggg',
    'gggggggdgggggg',
    'gggggggggggggg',
], 8)

# 지하 벽돌 타일 (4px · 16×8칸 = 64×32) — 땅 벽돌 타일과 같은 짜임에 파랑
UB = {'X': '#081428', 'b': '#1b5fa0', 'B': '#6cc4f4'}
UB_ROWS = [
    'XXXXXXXXXXXXXXXX',
    'BBBBBBBBBBBBBBBX',
    'bbbbbbbbbbbbbbbX',
    'bbbbbbbbbbbbbbbX',
    'XXXXXXXXXXXXXXXX',
    'bBBBBBBXbBBBBBBX',
    'bbbbbbbXbbbbbbbX',
    'XXXXXXXXXXXXXXXX',
]

if __name__ == '__main__':
    for name, (rows, unit) in SPRITES.items():
        uri, w, h = grid_svg(rows, unit)
        print(f'--lv-{name}: {uri};   /* {w}×{h} */')
    saved = dict(PAL); PAL.clear(); PAL.update(UB)
    uri, w, h = grid_svg(UB_ROWS, 4)
    print(f'--lv-ubrick: {uri};   /* {w}×{h} */')
    PAL.clear(); PAL.update(saved)
