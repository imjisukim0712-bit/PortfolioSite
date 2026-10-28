# 스테이지(pixel-fc-level) 13회차 픽셀 소품 — 관 · 덤불 · 동전 · 벽돌 블록 · 지하 벽돌을 사각형으로 직접 찍어 CSS data URI 로 뽑습니다.
# 사용법: python3 tools/fc-pixel/stage-props.py  → 출력된 --lv-* 줄을 assets/css/themes/pixel-fc-folio.css 의 스테이지 13회차 절에 붙여 넣기.
# 캐릭터 · 아이템 · 로고는 그리지 않습니다(지형 · 소품만).
import urllib.parse
def svg(w, h, scale, body):
    s = f"<svg xmlns='http://www.w3.org/2000/svg' width='{w*scale}' height='{h*scale}' viewBox='0 0 {w} {h}' shape-rendering='crispEdges'>{body}</svg>"
    return 'url("data:image/svg+xml,' + urllib.parse.quote(s, safe="=/:' ") + '")'
def rects(color, rs): return ''.join(f"<rect x='{x}' y='{y}' width='{w}' height='{h}' fill='{color}'/>" for x, y, w, h in rs)
def outlined(rs, fill, line='#000', d=1):
    out = rects(line, [(x-d, y-d, w+2*d, h+2*d) for x, y, w, h in rs])
    return out + rects(fill, rs)
O = {}
# 관(32×36, 2배): 머리 + 몸통, 밝은 줄 두 개 · 어두운 줄 하나
pipe = rects('#000', [(0,0,32,13),(2,13,28,23)])
pipe += rects('#00a800', [(1,1,30,11),(3,13,26,23)])
pipe += rects('#b8f818', [(3,1,3,11),(7,1,1,11),(5,13,3,23),(9,13,1,23)])
pipe += rects('#005800', [(24,1,4,11),(22,13,4,23)])
O['pipe'] = svg(32, 36, 2, pipe)
# 덤불(48×16, 2배): 혹 세 개 — 바깥 검은 선은 도형 합집합으로
bush_r = [(1,10,46,6),(5,5,12,11),(15,1,16,15),(29,5,13,11),(9,3,6,4),(33,3,6,4),(19,0,8,2)]
bush = rects('#000', [(x-1,y-1,w+2,h+2) for x,y,w,h in bush_r]) + rects('#00a800', bush_r)
bush += rects('#80d010', [(8,6,4,3),(18,3,6,3),(32,6,4,3)])
O['bush'] = svg(48, 16, 2, bush)
# 동전(8×14, 2배)
coin = rects('#000', [(2,0,4,1),(1,1,6,1),(0,2,8,10),(1,12,6,1),(2,13,4,1)])
coin += rects('#fca044', [(2,1,4,1),(1,2,6,10),(2,12,4,1)])
coin += rects('#ffdb98', [(2,3,1,7)]) + rects('#c84c0c', [(4,3,2,8)])
O['coin'] = svg(8, 14, 2, coin)
# 벽돌 블록(16×16, 3배 = 48px): 모르타르 선 + 윗줄 밝은 띠
brick = rects('#171c28', [(0,0,16,16)]) + rects('#c84c0c', [(1,1,14,14)])
brick += rects('#fca044', [(1,1,14,1)])
brick += rects('#171c28', [(1,5,14,1),(1,10,14,1),(8,1,1,4),(4,6,1,4),(12,6,1,4),(8,11,1,4)])
O['brick'] = svg(16, 16, 3, brick)
# 지하 벽돌(64×32 타일): 땅 벽돌과 같은 짜임에 파랑
ub = rects('#1b5fa0', [(0,0,64,32)]) + rects('#6cc4f4', [(0,4,64,4),(4,20,24,4),(36,20,24,4)])
ub += rects('#081428', [(0,0,64,4),(0,16,64,4),(0,28,64,4),(28,16,4,16),(60,0,4,32)])
O['ubrick'] = svg(64, 32, 1, ub)
for k, v in O.items(): print(f'--lv-{k}: {v};')
