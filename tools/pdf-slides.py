#!/usr/bin/env python3
"""PDF 를 '문서 보기' 슬라이드 그림으로 바꿉니다.

    pip install pymupdf
    python3 tools/pdf-slides.py assets/docs/comstock/final-presentation.pdf

PDF 옆에 slides/ 폴더를 만들고 쪽마다 두 장씩 씁니다.
    slides/01.jpg        큰 그림 (가로 1600px)
    slides/thumb/01.jpg  목록 그림 (가로 320px)
끝나면 content.js 의 docs[] 에 넣을 slides · pages 값을 알려 줍니다.
PDF 를 바꿨으면 다시 돌리면 됩니다 (예전 그림은 지우고 새로 씁니다).
"""
import os
import shutil
import sys

import pymupdf

BIG, THUMB = 1600, 320


def main(pdf):
    out = os.path.join(os.path.dirname(pdf), 'slides')
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(os.path.join(out, 'thumb'))
    doc = pymupdf.open(pdf)
    for i, page in enumerate(doc, 1):
        name = '%02d.jpg' % i
        for width, path, q in ((BIG, os.path.join(out, name), 82), (THUMB, os.path.join(out, 'thumb', name), 70)):
            z = width / page.rect.width
            page.get_pixmap(matrix=pymupdf.Matrix(z, z)).save(path, jpg_quality=q)
    total = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(out) for f in fs)
    print('%d쪽 → %s (%.1f MB)' % (doc.page_count, out, total / 1e6))
    print('content.js:  slides: "%s", pages: %d' % (out.replace(os.sep, '/'), doc.page_count))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
