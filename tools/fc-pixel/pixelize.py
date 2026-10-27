"""패미컴 픽셀 시안 — 2단계: 따 온 그림을 픽셀 아트로 바꾸기

capture.js 가 딴 PNG(투명 배경)를 받아
  ① 모든 부품을 같은 격자(PX 화면 픽셀 = 도트 한 칸)로 줄이고
  ② 부품마다 색을 COLORS 개로 줄이고(디더링 없이 — 명암이 계단처럼 끊어짐)
  ③ 그림자처럼 반투명한 곳은 반투명 한 단계로, 나머지는 불투명/투명 둘 중 하나로 자르고
  ④ 바깥 테두리에 한 칸짜리 어두운 외곽선을 둘러
  ⑤ 다시 PX 배 키워(최근접) assets/img/themes/fc-pixel/ 에 저장합니다.
사용: python3 tools/fc-pixel/pixelize.py <capture 폴더> assets/img/themes/fc-pixel
"""
import json
import os
import sys

from PIL import Image

PX = 3            # 도트 한 칸 = 화면 3px (1440 데스크톱 기준)
COLORS = 20       # 부품마다 쓰는 색 수
SOLID = 110       # 이 알파 이상은 불투명
SHADE = 28        # SHADE~SOLID 사이는 반투명 그림자 한 단계
SHADE_A = 90      # 그 그림자의 알파
OUTLINE = 0.42    # 외곽선 = 그 자리 색 × OUTLINE


def pixelize(src, dst):
    im = Image.open(src).convert('RGBA')
    w, h = max(1, round(im.width / PX)), max(1, round(im.height / PX))
    small = im.resize((w, h), Image.BOX)
    rgb = Image.new('RGB', small.size, (0, 0, 0))
    rgb.paste(small, mask=small.split()[3])
    pal = rgb.quantize(colors=COLORS, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    a = small.split()[3].load()
    p = pal.load()
    out = Image.new('RGBA', small.size, (0, 0, 0, 0))
    o = out.load()
    for y in range(h):
        for x in range(w):
            al = a[x, y]
            if al >= SOLID:
                o[x, y] = p[x, y] + (255,)
            elif al >= SHADE:
                o[x, y] = p[x, y] + (SHADE_A,)
    # 불투명 칸 중 투명/반투명과 맞닿은 칸에 외곽선
    edge = []
    for y in range(h):
        for x in range(w):
            if o[x, y][3] != 255:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= w or ny >= h or o[nx, ny][3] != 255:
                    edge.append((x, y))
                    break
    for x, y in edge:
        r, g, b, _ = o[x, y]
        o[x, y] = (int(r * OUTLINE), int(g * OUTLINE), int(b * OUTLINE), 255)
    out = out.resize((w * PX, h * PX), Image.NEAREST)
    out.save(dst, optimize=True)
    return out.size


def main():
    raw, dest = sys.argv[1], sys.argv[2]
    os.makedirs(dest, exist_ok=True)
    meta = json.load(open(os.path.join(raw, 'meta.json')))
    for m in meta['meta']:
        size = pixelize(os.path.join(raw, m['file']), os.path.join(dest, m['file']))
        print(m['file'], size)
    json.dump(meta, open(os.path.join(dest, 'meta.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
