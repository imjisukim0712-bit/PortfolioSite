"""생성한 도트풍 그림(단색 배경)을 정해진 크기의 진짜 픽셀 스프라이트로 옮깁니다.

생성 그림의 '큰 픽셀'은 간격이 고르지 않아 그대로 쓸 수 없습니다. 그래서 그림을 정해진 칸 수로 나누고,
칸마다 가장 많이 차지한 색 하나를 골라 다시 찍습니다. 그 뒤 배경을 투명하게 지우고, 외곽선의 끊긴 곳을 잇고,
두세 칸으로 겹친 외곽선을 한 픽셀 굵기로 다듬고, 꺾이는 곳에 튀어나온 한 픽셀을 지우고,
외톨이 픽셀과 한 픽셀 구멍을 정리합니다.
무작위 값은 쓰지 않아 같은 입력이면 결과가 같습니다. 필요한 것: Python 3.9 이상, numpy, Pillow.

변환: python pixelize.py 원본.png 출력.png 너비 높이 [색수=24] [여백=1]
점검: python pixelize.py --check 스프라이트.png [스프라이트.png ...]
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

WEIGHT = np.array([0.3, 0.59, 0.11], np.float32)  # 밝기 계산용


def kmeans(points, count, rounds=20):
    """색 줄이기. 처음 중심을 밝기 순으로 고르게 뽑아 결과가 매번 같습니다."""
    order = np.argsort(points @ WEIGHT)
    centers = points[order[np.linspace(0, len(order) - 1, count).astype(int)]].copy()
    for _ in range(rounds):
        nearest = np.argmin(((points[:, None, :] - centers[None]) ** 2).sum(axis=2), axis=1)
        for k in range(count):
            if (nearest == k).any():
                centers[k] = points[nearest == k].mean(axis=0)
    return centers


def neighbours_of(height, width):
    def neighbours(j, i):
        return [(y, x) for y, x in ((j - 1, i), (j + 1, i), (j, i - 1), (j, i + 1)) if 0 <= y < height and 0 <= x < width]
    return neighbours


def join_outline(index, luminance):
    """외곽선 잇기: 바깥과 맞닿은 픽셀 가운데 밝은 것을 그림에서 가장 흔한 외곽선 색으로 바꿉니다. 바꾼 수를 돌려줍니다."""
    out_h, out_w = index.shape
    neighbours = neighbours_of(out_h, out_w)
    solid = index >= 0
    rim = [(j, i) for j in range(out_h) for i in range(out_w) if solid[j, i] and (len(neighbours(j, i)) < 4 or any(not solid[y, x] for y, x in neighbours(j, i)))]
    dark = [index[j, i] for j, i in rim if luminance[index[j, i]] < 70]
    changed = 0
    if dark:
        ink = max(set(dark), key=dark.count)
        for j, i in rim:
            if luminance[index[j, i]] >= 70:
                index[j, i] = ink
                changed += 1
    return changed


def outline_colors(index, luminance):
    """외곽선 색: 가장자리에 쓰인 색 가운데 아주 어두운 색, 또는 가장자리의 8% 이상을 차지하는 어두운 색."""
    out_h, out_w = index.shape
    neighbours = neighbours_of(out_h, out_w)
    rim_colors = [int(index[j, i]) for j in range(out_h) for i in range(out_w) if index[j, i] >= 0 and (len(neighbours(j, i)) < 4 or any(index[y, x] < 0 for y, x in neighbours(j, i)))]
    return {c for c in set(rim_colors) if luminance[c] < 60 or (luminance[c] < 110 and rim_colors.count(c) >= 0.08 * len(rim_colors))}


def trim_corners(index, luminance):
    """꺾이는 곳에 튀어나온 외곽선 한 픽셀을 지웁니다. 지운 수를 돌려줍니다.

    외곽선이 한 칸씩 비스듬히 오다가 두 칸을 곧게 간 뒤 바로 직각으로 꺾이면, 그 꺾이는 자리의 픽셀 하나가
    모서리에 덧붙은 것처럼 튀어나와 보입니다. 아래 그림에서 P가 그 픽셀입니다(#은 외곽선, o는 안쪽 면).

        . . # #        . . # #
        P # o o   ->   . # o o
        # o o o        # o o o

    조건: P의 네 이웃 가운데 칠해진 것은 서로 직각인 외곽선 픽셀 둘뿐이고, 그 가운데 한쪽 팔은 한 칸 만에
    바깥쪽으로 비스듬히 이어집니다. 두 팔이 모두 곧게 이어지는 진짜 모서리(상자의 귀퉁이)는 건드리지 않습니다.
    """
    out_h, out_w = index.shape
    inks = outline_colors(index, luminance)

    def ink(j, i):
        return 0 <= j < out_h and 0 <= i < out_w and index[j, i] in inks

    def solid(j, i):
        return 0 <= j < out_h and 0 <= i < out_w and index[j, i] >= 0

    removed = 0
    for j in range(out_h):
        for i in range(out_w):
            if not ink(j, i):
                continue
            for dy in (-1, 1):          # 세로 팔의 방향
                for dx in (-1, 1):      # 가로 팔의 방향
                    # P에서 가로로 한 칸(a), 세로로 한 칸(b)만 칠해져 있고 반대쪽 둘은 비어 있어야 합니다.
                    if not (ink(j, i + dx) and ink(j + dy, i) and not solid(j, i - dx) and not solid(j - dy, i) and solid(j + dy, i + dx)):
                        continue
                    # 가로 팔이 한 칸 만에 바깥쪽(세로 팔의 반대쪽)으로 비스듬히 이어지는가, 또는 세로 팔이 그런가.
                    horizontal = not solid(j, i + 2 * dx) or not ink(j, i + 2 * dx) or not _on_rim(index, j, i + 2 * dx)
                    vertical = not solid(j + 2 * dy, i) or not ink(j + 2 * dy, i) or not _on_rim(index, j + 2 * dy, i)
                    if (horizontal and ink(j - dy, i + 2 * dx)) or (vertical and ink(j + 2 * dy, i - dx)):
                        index[j, i] = -1
                        removed += 1
                        break
                else:
                    continue
                break
    return removed


def _on_rim(index, j, i):
    out_h, out_w = index.shape
    return any(not (0 <= y < out_h and 0 <= x < out_w) or index[y, x] < 0 for y, x in ((j - 1, i), (j + 1, i), (j, i - 1), (j, i + 1)))


def thin_outline(index, luminance):
    """외곽선을 한 픽셀 굵기로 다듬습니다. 바꾼 수를 돌려줍니다.

    생성 그림의 외곽선은 칸 간격보다 굵어 곳곳이 두세 칸으로 찍힙니다. 바깥에서 둘째·셋째 줄에 있으면서
    외곽선과 이어진 외곽선 색 픽셀을 안쪽 면의 색으로 바꿉니다. 안쪽 줄부터 바꿔야 세 칸짜리에서
    가운데만 지워지고 맨 안쪽 한 점이 남는 일이 없습니다. 실루엣(바깥 모양)은 그대로입니다.
    """
    out_h, out_w = index.shape
    neighbours = neighbours_of(out_h, out_w)
    depth = np.zeros((out_h, out_w), int)  # 바깥에서 몇 번째 줄인지(1이 외곽선 자리)
    layer = [(j, i) for j in range(out_h) for i in range(out_w) if index[j, i] >= 0 and (len(neighbours(j, i)) < 4 or any(index[y, x] < 0 for y, x in neighbours(j, i)))]
    for j, i in layer:
        depth[j, i] = 1
    for level in (2, 3):
        layer = [(y, x) for j, i in layer for y, x in neighbours(j, i) if index[y, x] >= 0 and not depth[y, x]]
        for j, i in layer:
            depth[j, i] = level
        layer = list(set(layer))
    inks = outline_colors(index, luminance)
    chained = np.zeros((out_h, out_w), bool)  # 외곽선에서 외곽선 색으로 끊기지 않고 이어진 픽셀
    for level in (1, 2, 3):
        for j in range(out_h):
            for i in range(out_w):
                if depth[j, i] == level and index[j, i] in inks:
                    chained[j, i] = level == 1 or any(depth[y, x] == level - 1 and chained[y, x] for y, x in neighbours(j, i))
    changed = 0
    for level in (3, 2):
        for j in range(out_h):
            for i in range(out_w):
                if depth[j, i] != level or not chained[j, i]:
                    continue
                inner = [int(index[y, x]) for y, x in neighbours(j, i) if index[y, x] >= 0 and index[y, x] not in inks and depth[y, x] != 1]
                if inner:
                    index[j, i] = max(set(inner), key=inner.count)
                    changed += 1
    return changed


def holes_in(index):
    """한 픽셀짜리 구멍: 네 이웃이 모두 칠해진 투명 칸."""
    out_h, out_w = index.shape
    neighbours = neighbours_of(out_h, out_w)
    return [(j, i) for j in range(1, out_h - 1) for i in range(1, out_w - 1) if index[j, i] < 0 and all(index[y, x] >= 0 for y, x in neighbours(j, i))]


def pixelize(src, out, width, height, colors=24, margin=1):
    img = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    h, w, _ = img.shape
    key = img[2:12, 2:12].reshape(-1, 3).mean(axis=0)  # 배경색(왼쪽 위 모서리)
    background = np.abs(img - key).sum(axis=2) < 110
    rows, cols = np.where(~background)
    top, bottom, left, right = rows.min(), rows.max() + 1, cols.min(), cols.max() + 1
    # 물체가 정해진 크기(여백 제외)에 꼭 맞게 들어가도록 원본 한 칸의 크기를 정합니다.
    pitch = max((right - left) / (width - 2 * margin), (bottom - top) / (height - 2 * margin))
    out_w, out_h = int(np.ceil((right - left) / pitch)), int(np.ceil((bottom - top) / pitch))
    # 그림 전체의 색을 먼저 정해진 수로 줄입니다(표본은 일정 간격으로 뽑음).
    sample = img[~background][:: max(1, int((~background).sum() // 40000))]
    centers = kmeans(sample, colors)
    index = np.full((out_h, out_w), -1)
    for j in range(out_h):
        for i in range(out_w):
            y0, x0 = top + j * pitch, left + i * pitch
            a, b = int(round(y0)), min(h, int(round(y0 + pitch)))
            c, d = int(round(x0)), min(w, int(round(x0 + pitch)))
            if b <= a or d <= c:
                continue
            if background[a:b, c:d].mean() > 0.5:
                continue
            # 칸 가운데 70%에서 가장 많이 차지한 색을 고릅니다. 가장자리의 번짐과 옆 칸의 색을 피합니다.
            e = pitch * 0.15
            block = img[int(round(y0 + e)):max(int(round(y0 + e)) + 1, int(round(y0 + pitch - e))), int(round(x0 + e)):max(int(round(x0 + e)) + 1, int(round(x0 + pitch - e)))]
            mask = ~background[int(round(y0 + e)):max(int(round(y0 + e)) + 1, int(round(y0 + pitch - e))), int(round(x0 + e)):max(int(round(x0 + e)) + 1, int(round(x0 + pitch - e)))]
            pixels = block[mask] if mask.any() else img[a:b, c:d][~background[a:b, c:d]]
            votes = np.bincount(np.argmin(((pixels[:, None, :] - centers[None]) ** 2).sum(axis=2), axis=1), minlength=colors)
            index[j, i] = int(votes.argmax())
    solid = index >= 0
    # 배경에 떨어진 잡티 제거: 가장 큰 덩어리 크기의 2%가 안 되는 조각은 지웁니다.
    label = np.zeros(solid.shape, int)
    sizes = {}
    current = 0
    for j in range(out_h):
        for i in range(out_w):
            if solid[j, i] and not label[j, i]:
                current += 1
                stack, count = [(j, i)], 0
                label[j, i] = current
                while stack:
                    y, x = stack.pop()
                    count += 1
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        Y, X = y + dy, x + dx
                        if 0 <= Y < out_h and 0 <= X < out_w and solid[Y, X] and not label[Y, X]:
                            label[Y, X] = current
                            stack.append((Y, X))
                sizes[current] = count
    for name, count in sizes.items():
        if count < max(sizes.values()) * 0.02:
            index[label == name] = -1
    luminance = centers @ WEIGHT
    neighbours = neighbours_of(out_h, out_w)
    join_outline(index, luminance)
    for _ in range(6):  # 한 번 다듬으면 새로 드러나는 겹침이 있어, 더 바뀌는 곳이 없을 때까지 되풀이합니다
        if not thin_outline(index, luminance):
            break
    # 외톨이 픽셀 정리: 네 이웃 어디에도 같은 색이 없고 이웃 색과 비슷하면 가장 흔한 이웃 색으로.
    for _ in range(2):
        fixed = index.copy()
        for j in range(out_h):
            for i in range(out_w):
                if index[j, i] < 0:
                    continue
                around = [index[y, x] for y, x in neighbours(j, i) if index[y, x] >= 0]
                if len(around) < 3 or index[j, i] in around:
                    continue
                common = max(set(around), key=around.count)
                if np.abs(centers[index[j, i]] - centers[common]).sum() < 60:
                    fixed[j, i] = common
        index = fixed
    # 한 픽셀짜리 구멍 메우기: 네 이웃이 모두 칠해진 투명 칸은 가장 흔한 이웃 색으로 채웁니다.
    for j, i in holes_in(index):
        around = [index[y, x] for y, x in neighbours(j, i)]
        index[j, i] = max(set(around), key=around.count)
    # 정리하면서 가장자리 색이 바뀐 곳이 있을 수 있어 외곽선을 한 번 더 잇고 다듬습니다.
    # 그다음 꺾이는 곳에 튀어나온 한 픽셀을 지우고, 더 바뀌는 곳이 없을 때까지 되풀이합니다.
    for _ in range(6):
        join_outline(index, luminance)
        changed = 0
        for _ in range(6):
            step = thin_outline(index, luminance)
            changed += step
            if not step:
                break
        changed += trim_corners(index, luminance)
        if not changed:
            break
    canvas = np.zeros((height, width, 4), np.uint8)
    x0, y0 = (width - out_w) // 2, (height - out_h) // 2
    palette = np.clip(np.round(centers), 0, 255).astype(np.uint8)
    for j in range(out_h):
        for i in range(out_w):
            if index[j, i] >= 0:
                canvas[y0 + j, x0 + i] = (*palette[index[j, i]], 255)
    Image.fromarray(canvas, 'RGBA').save(out)
    print(f'{Path(src).name}: 원본 한 칸 {pitch:.1f}px, 그림 {out_w}x{out_h}, 캔버스 {width}x{height}, 색 {len(set(index[index >= 0].tolist()))}')


def check(path):
    """변환한 스프라이트에 흠이 남았는지 셉니다. 모든 항목이 0이면 통과입니다."""
    rgba = np.asarray(Image.open(path).convert('RGBA')).astype(np.int32)
    height, width, _ = rgba.shape
    alpha = rgba[..., 3]
    palette = sorted({tuple(p[:3]) for p in rgba[alpha == 255].reshape(-1, 4).tolist()})
    lookup = {c: k for k, c in enumerate(palette)}
    index = np.full((height, width), -1)
    for j in range(height):
        for i in range(width):
            if alpha[j, i] == 255:
                index[j, i] = lookup[tuple(rgba[j, i, :3].tolist())]
    luminance = np.array(palette, np.float32) @ WEIGHT
    rgb = rgba[..., :3]
    solid = alpha == 255
    result = {
        '반투명 픽셀': int(((alpha > 0) & (alpha < 255)).sum()),
        '배경색 잔여': int((solid & ((np.abs(rgb - np.array([255, 0, 255])).sum(axis=2) < 110) | (np.abs(rgb - np.array([0, 255, 0])).sum(axis=2) < 110))).sum()),
        '한 픽셀 구멍': len(holes_in(index)),
        '밝은 가장자리': join_outline(index.copy(), luminance),
        '겹친 외곽선': thin_outline(index.copy(), luminance),
        '튀어나온 모서리': trim_corners(index.copy(), luminance),
    }
    passed = not any(result.values())
    print(f"{Path(path).name}: {width}x{height}, 색 {len(palette)}, " + ', '.join(f'{k} {v}' for k, v in result.items()) + (' · 통과' if passed else ' · 흠 있음'))
    return passed


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or args[0] in ('-h', '--help'):
        print(__doc__)
    elif args[0] == '--check':
        results = [check(p) for p in args[1:]]  # 하나가 실패해도 나머지를 모두 점검합니다
        sys.exit(0 if all(results) else 1)
    else:
        pixelize(args[0], args[1], int(args[2]), int(args[3]), int(args[4]) if len(args) > 4 else 24, int(args[5]) if len(args) > 5 else 1)
