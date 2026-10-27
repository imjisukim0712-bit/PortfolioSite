/* ============================================================================
   themes.js — 디자인 테마(스킨) 목록 + 로더
   ----------------------------------------------------------------------------
   · 기본 디자인(style.css) 위에 assets/css/themes/<테마>.css + <테마>-<시안>.css 를 덧입힙니다.
   · 시안 고르기 :  ?skin=pixel-gameboy  (주소에 붙이면 그 뒤로 모든 페이지에 유지)
                    ?skin=default        (기본 디자인으로 되돌리기)
   · 확정하기   :  아래 DEFAULT_SKIN 에 시안 id 를 적으면 방문자 모두에게 그 디자인이 보입니다.
   · 전체 시안 목록 : themes.html
   이 파일은 <head> 에서 style.css 바로 다음에 읽습니다 (깜빡임 없이 덧입히기 위해).
   ========================================================================== */
(function () {
  'use strict';

  /* ── 확정한 시안 (예: 'pixel-famicom'). 비우면 기본 디자인 ───────────────── */
  var DEFAULT_SKIN = 'pixel-famicom';

  var G = 'https://fonts.googleapis.com/css2?display=swap&family=';

  /* ── 테마 8종 · 시안 32개 ─────────────────────────────────────────────── */
  var THEMES = [
    {
      id: 'pixel',
      name: { ko: '레트로 픽셀 아케이드', en: 'Retro Pixel Arcade' },
      desc: { ko: '도트 글꼴 · 각진 테두리 · 딱딱한 그림자. 8비트 게임기 화면의 어법.',
              en: 'Pixel fonts, hard edges and blunt shadows — the language of an 8-bit screen.' },
      fonts: ['https://cdn.jsdelivr.net/npm/galmuri@latest/dist/galmuri.css',
              G + 'Press+Start+2P&family=Noto+Sans+KR:wght@400;500;700;900'],
      scripts: ['js/themes/famicom.js'],   /* 홈·이력서 상단을 휴대용 게임기로 (손잡이 버튼 + 카트리지 꽂기 연출) */
      variants: [
        { id: 'famicom', name: { ko: '패미컴', en: 'Famicom' },
          desc: { ko: '첫 화면이 휴대용 게임기 한 대. 자주색 손잡이의 SELECT ◀ ▶ 로 한마디를 넘기고 A 로 카드를 뽑습니다. 프로젝트 카드는 카트리지 — 누르면 슬롯에 꽂히고 액정에 개요가 뜹니다.',
                  en: 'The first screen is a handheld console: flip through the quips with SELECT ◀ ▶ on the burgundy grips and draw cards with A. Project cards are cartridges — press one and it slides into the slot, then its overview lights up the screen.' },
          swatch: ['#efe6d2', '#b8252b', '#2b2b2b', '#e9b64a'] },
        { id: 'fc-3d', name: { ko: '패미컴 · 제품 사진', en: 'Famicom · Product Shot' },
          desc: { ko: '디자인 안 ①. 게임기와 카트리지를 실물 같은 광택 플라스틱으로 그린 제품 소개 페이지. 넓은 여백, 부드러운 그림자, 살짝 기울어진 본체.',
                  en: 'Design draft 1: the console and cartridges rendered as glossy, real-looking plastic on a product page, with generous space, soft shadows and a slightly tilted body.' },
          scripts: ['js/themes/pixel-fc-3d.js'],
          swatch: ['#f4f1ec', '#c8202f', '#1c1c1e', '#d9b25a'] },
        { id: 'fc-clay', name: { ko: '패미컴 · 클레이', en: 'Famicom · Clay' },
          desc: { ko: '그림체 안 A. 같은 기울어진 게임기 구도를 말랑한 점토 장난감처럼. 무광 표면, 두툼하게 둥근 모서리, 부드러운 그림자.',
                  en: 'Art-style draft A: the same tilted console scene as a soft clay toy, with matte surfaces, chunky rounded edges and gentle shadows.' },
          scripts: ['js/themes/pixel-fc-clay.js'],
          swatch: ['#f6ece4', '#e0404a', '#3a2b2b', '#f2c46d'] },
        { id: 'fc-toon', name: { ko: '패미컴 · 만화', en: 'Famicom · Toon' },
          desc: { ko: '그림체 안 B. 같은 구도를 만화 일러스트로. 굵은 검정 외곽선, 두 단계 명암, 반짝이는 하이라이트 획.',
                  en: 'Art-style draft B: the same scene as a comic illustration, with bold black outlines, two-tone shading and sparkling highlight strokes.' },
          scripts: ['js/themes/pixel-fc-toon.js'],
          swatch: ['#fff8ec', '#e8323c', '#171717', '#ffc83d'] },
        { id: 'fc-airbrush', name: { ko: '패미컴 · 80년대 광고', en: 'Famicom · 80s Ad' },
          desc: { ko: '그림체 안 C. 같은 구도를 80년대 잡지 광고 일러스트로. 에어브러시 그라디언트, 크롬 반사, 망점·거친 종이 질감.',
                  en: 'Art-style draft C: the same scene as an 80s magazine ad illustration, with airbrushed gradients, chrome glints and halftone, grainy paper.' },
          scripts: ['js/themes/pixel-fc-airbrush.js'],
          swatch: ['#f3e6cf', '#c71f2c', '#1d1a2b', '#f0b54a'] },
        { id: 'fc-pixel', name: { ko: '패미컴 · 픽셀 변환', en: 'Famicom · Pixelated' },
          desc: { ko: '그림체 안 D. 제품 사진 안의 고품질 그림을 그대로 렌더한 뒤 픽셀 아트로 변환해 입혔습니다. 계단처럼 끊긴 명암, 한 칸짜리 외곽선, 각진 도트 그림자.',
                  en: 'Art-style draft D: the product-shot artwork rendered and converted into pixel art, with stepped shading, one-pixel outlines and hard pixel shadows.' },
          scripts: ['js/themes/pixel-fc-pixel.js'],
          swatch: ['#f4f1ec', '#c8202f', '#2a1a1c', '#e3b54f'] },
        { id: 'fc-classic', name: { ko: '패미컴 · 정돈', en: 'Famicom · Classic' },
          desc: { ko: '원래 패미컴 디자인을 그대로 두고 완성도만 올린 안. 도트 테두리와 그림자를 한 칸 단위로 맞추고, 덱 아래도 게임 화면처럼 정돈했습니다.',
                  en: 'The original Famicom design kept as it is, with the finish raised: pixel borders and shadows snapped to one grid, and the sections below the deck tidied like a game screen.' },
          scripts: ['js/themes/pixel-fc-classic.js', 'js/themes/fc-stage.js'],
          swatch: ['#efe6d2', '#b8252b', '#2b2b2b', '#e9b64a'] },
        { id: 'fc-px3d', name: { ko: '패미컴 · 3D 픽셀', en: 'Famicom · 3D Pixel' },
          desc: { ko: '원래 패미컴 게임기·카트리지·버튼을 도트 한 칸씩 다시 그린 스프라이트. 밝은 윗면과 어두운 옆면을 그림 안에 넣어 기울이지 않아도 입체로 보이고, 나사·전원 LED·스피커 구멍·금색 단자까지 도트로.',
                  en: 'The original Famicom console, cartridges and buttons redrawn dot by dot as sprites. Lit tops and dark sides are drawn into the art, so it reads as 3D without tilting, down to the screws, power LED, speaker grille and gold contacts.' },
          scripts: ['js/themes/pixel-fc-px3d.js', 'js/themes/fc-stage.js'],
          swatch: ['#efe6d2', '#b8252b', '#2b2b2b', '#e9b64a'] },
        { id: 'fc-voxel', name: { ko: '패미컴 · 복셀', en: 'Famicom · Voxel' },
          desc: { ko: '원래 패미컴 게임기와 카트리지를 작은 블록(복셀)으로 쌓아 올린 입체. 밝은 윗면·어두운 옆면이 보이는 블록 장난감 같은 게임 그래픽.',
                  en: 'The original Famicom console and cartridges stacked out of little blocks (voxels), showing light tops and dark sides like a block-built game.' },
          scripts: ['js/themes/pixel-fc-voxel.js', 'js/themes/fc-stage.js'],
          swatch: ['#efe6d2', '#b8252b', '#2b2b2b', '#e9b64a'] },
        { id: 'fc-icon', name: { ko: '패미컴 · 픽셀 아이콘', en: 'Famicom · Pixel Icon' },
          desc: { ko: '참고 그림 ①. 크림 바탕에 남색 굵은 외곽선·청회색 액자를 카드와 절 전체의 규칙으로 쓰고, 노을빛 빨강→주황 띠는 강조로만 쓰는 게임 아이콘 타일 화풍.',
                  en: 'Reference ①: a game-icon tile style that uses thick navy outlines and slate-blue frames as the rule for every card and section on cream, keeping sunset red-to-orange bands as accents only.' },
          scripts: ['js/themes/pixel-fc-icon.js', 'js/themes/fc-stage.js'],
          swatch: ['#f2a03d', '#d2412c', '#f3e3c3', '#3d5a73'] },
        { id: 'fc-dot', name: { ko: '패미컴 · 도트', en: 'Famicom · Dot' },
          desc: { ko: '참고 그림 ②. 크림·진홍·주황·회색·검정 다섯 색만으로, 회색 옆면이 두께가 되는 아이소 도트 부품과 진홍 띠 속 주황 사선 줄무늬를 사이트 전체에 쓰는 화풍.',
                  en: 'Reference ②: isometric dot parts in just cream, crimson, orange, grey and black, with grey side faces for depth and orange diagonal stripes on crimson bands across the site.' },
          scripts: ['js/themes/pixel-fc-dot.js', 'js/themes/fc-stage.js'],
          swatch: ['#ffffff', '#ffdca8', '#b0122e', '#f5a000'] },
        { id: 'fc-blueprint', name: { ko: '패미컴 · 설명서', en: 'Famicom · Manual' },
          desc: { ko: '참고 그림 ③. 베이지 바탕에 하늘색 가는 괘선, ‘FIG. 01’ 번호 절 머리, 부품 번호 태그와 사양표를 쓰는 제품 설명서 화풍. 지시선은 첫 화면에 몇 개만.',
                  en: 'Reference ③: a product-manual style on beige with fine cyan rules, numbered ‘FIG. 01’ section heads, part-number tags and spec tables, with only a few leader lines on the first screen.' },
          scripts: ['js/themes/pixel-fc-blueprint.js', 'js/themes/fc-stage.js'],
          swatch: ['#e9dfcb', '#c8352b', '#f08a2c', '#3fb3cf'] },
        { id: 'fc-flat', name: { ko: '패미컴 · 플랫 일러스트', en: 'Famicom · Flat Illustration' },
          desc: { ko: '참고 그림 ④. 하늘색 바탕과 크림 내용 면, 모든 상자에 갈색 굵은 선과 둥근 모서리, 흰 사선 광택이 든 빨간 띠를 서명으로 쓰는 둥근 플랫 일러스트 화풍.',
                  en: 'Reference ④: a rounded flat illustration system with a sky-blue backdrop, cream content panels, thick brown outlines and round corners on every box, and red bands with white diagonal gloss as the signature.' },
          scripts: ['js/themes/pixel-fc-flat.js', 'js/themes/fc-stage.js'],
          swatch: ['#bfe4f4', '#f4ead2', '#c8202f', '#6b3a2a'] },
        { id: 'fc-ukiyo', name: { ko: '패미컴 · 레트로 판화', en: 'Famicom · Retro Print' },
          desc: { ko: '참고 그림 ⑤. 종이결 크림 바탕에 산호 빨강·청록·남색 평면 판 색, 살짝 어긋나 찍힌 그림자, 구름·물결 무늬를 구분선과 절 머리에 작게 쓰는 레트로 판화풍.',
                  en: 'Reference ⑤: a retro woodblock-print style with flat coral, teal and navy plates on paper-grain cream, slightly misregistered shadows, and small cloud and wave patterns on dividers and section heads.' },
          scripts: ['js/themes/pixel-fc-ukiyo.js', 'js/themes/fc-stage.js'],
          swatch: ['#f1e8d6', '#e0574a', '#6ea597', '#2f4b7c'] },
        { id: 'fc-iso', name: { ko: '패미컴 · 아이소 일러스트', en: 'Famicom · Iso Illustration' },
          desc: { ko: '참고 그림 ⑥. 굵은 남색 선화에 세이지 초록·살구 베이지·벽돌 빨강·겨자색을 평면으로 칠한 아이소메트릭 만화풍.',
                  en: 'Reference 6: an isometric cartoon style with bold navy line work and flat sage green, apricot beige, brick red and mustard.' },
          scripts: ['js/themes/pixel-fc-iso.js', 'js/themes/fc-stage.js'],
          swatch: ['#f6efe2', '#b5413a', '#8fb58a', '#e9c46a'] },
        { id: 'fc-line', name: { ko: '패미컴 · 컬러 선화', en: 'Famicom · Color Line Art' },
          desc: { ko: '참고 그림 ⑦. 밝은 회색 바탕 위에 빨강·노랑·초록·파랑 굵은 선을 겹쳐 그린 패키지 그래픽풍.',
                  en: 'Reference 7: package-graphic style with bold red, yellow, green and blue outlines layered on a light grey ground.' },
          scripts: ['js/themes/pixel-fc-line.js', 'js/themes/fc-stage.js'],
          swatch: ['#e4e4e2', '#e60012', '#f5c000', '#0068b7'] },
        { id: 'fc-snes', name: { ko: '패미컴 · 고해상 도트', en: 'Famicom · Hi-Res Pixel' },
          desc: { ko: '참고 그림 ⑧. 호박색 바탕 위에 회백색 본체와 부드러운 도트 명암, 네 빛깔 버튼을 단 정교한 도트 그림풍.',
                  en: 'Reference 8: a refined pixel-art style with an off-white console, soft dithered shading and four-color buttons on an amber ground.' },
          scripts: ['js/themes/pixel-fc-snes.js', 'js/themes/fc-stage.js'],
          swatch: ['#f2a51f', '#d9d4cc', '#c8102e', '#3a5bb8'] },
        { id: 'fc-kraft', name: { ko: '패미컴 · 크라프트', en: 'Famicom · Kraft' },
          desc: { ko: '참고 그림 ⑨. 크라프트지 바탕에 크림·진홍 게임기, 굵은 검은 케이블 선이 판을 감싸는 기념 포스터풍.',
                  en: 'Reference 9: an anniversary-poster style with a cream and crimson console on kraft paper, framed by thick black cable lines.' },
          scripts: ['js/themes/pixel-fc-kraft.js', 'js/themes/fc-stage.js'],
          swatch: ['#c9a678', '#f3ead6', '#a3203a', '#1d1d1b'] },
        { id: 'fc-level', name: { ko: '패미컴 · 스테이지', en: 'Famicom · Stage' },
          desc: { ko: '참고 그림 ⑩. 하늘색 화면에 물음표 블록·벽돌·초록 언덕·땅 블록을 깐 8비트 게임 스테이지풍.',
                  en: 'Reference 10: an 8-bit game level style with a sky blue screen, question blocks, bricks, green hills and ground tiles.' },
          scripts: ['js/themes/pixel-fc-level.js', 'js/themes/fc-stage.js'],
          swatch: ['#5c94fc', '#c84c0c', '#fca044', '#00a800'] },
        { id: 'fc-8bit', name: { ko: '패미컴 · 도트 아트', en: 'Famicom · Pixel Art' },
          desc: { ko: '디자인 안 ②. 게임기부터 창 테두리·제목까지 전부 도트로 그린 8비트 화면. 계단식 모서리, 도트 그림자, 옛 게임 대화 상자.',
                  en: 'Design draft 2: an 8-bit screen where everything from the console to the window frames and headings is drawn in pixels, with stepped corners, pixel shadows and retro dialog boxes.' },
          scripts: ['js/themes/pixel-fc-8bit.js'],
          swatch: ['#000000', '#d82800', '#fcfcfc', '#fca044'] },
        { id: 'fc-boxart', name: { ko: '패미컴 · 박스아트', en: 'Famicom · Box Art' },
          desc: { ko: '디자인 안 ③. 빨간 바탕 위에 크림색 게임기를 놓은 대담한 평면 그래픽. 패키지 박스처럼 큰 글자와 금색 띠, 사선 무늬.',
                  en: 'Design draft 3: bold flat graphics with a cream console on a red field, like game box art, with huge type, gold bands and diagonal stripes.' },
          scripts: ['js/themes/pixel-fc-boxart.js'],
          swatch: ['#b8252b', '#f3e9d2', '#2b2b2b', '#e9b64a'] }
      ]
    },
    {
      id: 'brutal',
      name: { ko: '네오 브루탈리즘', en: 'Neo-Brutalism' },
      desc: { ko: '두꺼운 테두리 · 딱딱한 그림자 · 거대한 제목. 직설적인 판.',
              en: 'Thick borders, hard shadows and huge type — blunt by design.' },
      fonts: [G + 'Black+Han+Sans&family=IBM+Plex+Sans+KR:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600&family=Archivo+Black'],
      variants: [
        { id: 'cyberpunk', name: { ko: '게임 사이버펑크', en: 'Game Cyberpunk' },
          desc: { ko: '검정 + 애시드 옐로 · 색수차로 어긋난 제목 · 위험 표시 사선 · 모서리를 깎은 칩.',
                  en: 'Black and acid yellow, chromatic-split headings, hazard stripes and chipped-corner tags.' },
          swatch: ['#08080a', '#f6ff3c', '#00e5ff', '#ff2e7e'] },
        { id: 'newsprint', name: { ko: '뉴스프린트', en: 'Newsprint' },
          desc: { ko: '신문지 회백 · 1면 배너 헤드라인 · 반전 빨강 kicker · 드롭캡 · 제호 띠.',
                  en: 'Newsprint grey with a front-page banner headline, an inverted red kicker, a drop cap and a folio line.' },
          swatch: ['#ecebe4', '#1a1a1a', '#c8102e', '#5b5b5b'] }
      ]
    },
    {
      id: 'brand',
      name: { ko: '브랜드 홈페이지', en: 'Brand Homepage' },
      desc: { ko: '세계적인 회사들이 제품을 무대에 올리는 방식. 넓은 여백 · 큰 타이포 · 테두리 대신 그림자로 뜬 판 · 알약 버튼.',
              en: 'How great companies stage a product: generous space, big type, panels lifted by shadow instead of borders, pill buttons.' },
      fonts: [G + 'Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600'],
      variants: [
        { id: 'keynote', name: { ko: '키노트', en: 'Keynote' },
          desc: { ko: '무채색만. 히어로를 화면 한가운데 세우고 제목을 화면 폭까지 키웁니다 — 발표 슬라이드 첫 장.',
                  en: 'Greyscale only: the hero stands centre stage and the headline runs the width of the screen, like the opening slide of a keynote.' },
          swatch: ['#ffffff', '#f5f5f7', '#1d1d1f', '#0071e3'] },
        { id: 'bento', name: { ko: '벤토', en: 'Bento' },
          desc: { ko: '라벤더 소개, 세로 사진, 민트색 한마디. 크기가 다른 둥근 타일에 기획자의 이야기와 작업을 담은 벤토 포트폴리오.',
                  en: 'A lavender introduction, a tall portrait and a mint-colored quip. A bento portfolio that brings a designer’s story and work together in rounded tiles of different sizes.' },
          swatch: ['#f4f4f0', '#e7e2fa', '#dceee5', '#51428a'] },
      ]
    },
    {
      id: 'concept',
      name: { ko: '컨셉 무대', en: 'Concept Sets' },
      desc: { ko: '사이트 전체를 하나의 물건으로 바꿔 놓는 시안들. 게임 기획서 · 라이브 패치 노트 · 보드게임 테이블.',
              en: 'Drafts that turn the whole site into a single object: a game design document, live patch notes, a board-game table.' },
      fonts: [G + 'Noto+Sans+KR:wght@400;500;700;800;900'],
      variants: [
        { id: 'spec', name: { ko: '명세서', en: 'Spec Sheet' },
          desc: { ko: '사이트가 한 권의 게임 기획서. 종이 한 장 위에 번호 매긴 절, 개정 표, 빨간 펜 교정, 체크박스. 카드 뽑기는 부록 A.',
                  en: 'The site as a game design document: numbered sections on a sheet of paper, a revision table, red-pen marks and checkboxes. The card draw is Appendix A.' },
          fonts: [G + 'IBM+Plex+Sans+KR:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600'],
          swatch: ['#fdfcf9', '#1f2328', '#c8102e', '#fff3a3'] },
        { id: 'patch', name: { ko: '패치 노트', en: 'Patch Notes' },
          desc: { ko: '라이브 게임의 패치 노트. LIVE 표시등, 버전 칩, NEW·BUFF·FIX 태그, 경력은 변경 이력으로. 카드 뽑기는 이번 시즌 픽업 배너.',
                  en: 'Patch notes for a live game: a LIVE indicator, version chips, NEW / BUFF / FIX tags, a career written as a changelog. The card draw becomes this season\'s pick-up banner.' },
          fonts: [G + 'Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700'],
          swatch: ['#0f1115', '#5cf2a4', '#ffab40', '#171a20'] },
        { id: 'tabletop', name: { ko: '보드게임 테이블', en: 'Tabletop' },
          desc: { ko: '보드게임 밤. 남색 펠트 테이블 위에 크라프트 상자 뚜껑, 두꺼운 종이 카드, 나무 토큰. 덱을 누르면 진짜 카드처럼 펼쳐집니다.',
                  en: 'Board-game night: a kraft box lid on a navy felt table, thick cardboard cards and wooden tokens. Press the deck and the cards fan out like the real thing.' },
          fonts: [G + 'Outfit:wght@500;600;700;800'],
          swatch: ['#1e2a4a', '#d9c3a0', '#fbf3e3', '#8a5a34'] }
      ]
    },
    {
      id: 'editorial',
      name: { ko: '에디토리얼', en: 'Editorial' },
      desc: { ko: '정보의 순서를 만드는 타이포그래피. 종이, 괘선, 비대칭 그리드로 읽는 포트폴리오.',
              en: 'Typography that gives information order: a portfolio built from paper, rules and an asymmetric grid.' },
      fonts: [G + 'Inter+Tight:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;600;700;800;900'],
      variants: [
        { id: 'swiss', name: { ko: '스위스', en: 'Swiss' },
          desc: { ko: '흰 종이, 순검정, 시그널 레드. 초대형 제목과 오른쪽 아래 사진, 12단 비대칭 그리드와 큰 절 번호가 만드는 선명한 질서.',
                  en: 'White paper, pure black and signal red. An oversized headline, a portrait at the lower right, a twelve-column asymmetric grid and large section numbers create a clear reading order.' },
          swatch: ['#ffffff', '#000000', '#e32925', '#e5e5e5'] }
      ]
    },
    {
      id: 'hud',
      name: { ko: '콘솔 인터페이스', en: 'Console Interface' },
      desc: { ko: '게임을 시작하기 전의 설렘. 유리 패널과 부드러운 빛으로 구성한 콘솔 홈 화면.',
              en: 'The anticipation before pressing play: a console home screen built from glass panels and soft light.' },
      fonts: [G + 'Exo+2:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700;800'],
      scripts: ['js/themes/hud.js'],
      variants: [
        { id: 'launcher', name: { ko: '런처', en: 'Launcher' },
          desc: { ko: '남청색과 보라색 사이, 빛나는 선택 링과 가로로 펼쳐진 프로젝트 라이브러리. 대표 타이틀 배너, 시스템 시계, 컨트롤러 바가 있는 부드러운 게임 런처.',
                  en: 'Between midnight blue and violet: luminous focus rings and a horizontal project library, with a featured title banner, system clock and controller bar.' },
          swatch: ['#10172f', '#28345a', '#a3b5ff', '#a9e5f1'] }
      ]
    },
    {
      id: 'storybook',
      name: { ko: '이야기가 있는 노트', en: 'Storybook Notes' },
      desc: { ko: '아이디어와 경험을 한 장씩 모은 손작업 노트. 종이의 결, 손글씨 제목, 다정한 파스텔.',
              en: 'A handmade notebook of ideas and experiences, with paper textures, handwritten headings and gentle pastels.' },
      fonts: [G + 'Gaegu:wght@400;700&family=Gowun+Dodum'],
      variants: [
        { id: 'scrapbook', name: { ko: '기획자의 스크랩북', en: 'Designer’s Scrapbook' },
          desc: { ko: '크림색 노트 위에 테이프로 붙인 사진, 세이지·살구·하늘빛 포스트잇, 차곡차곡 모은 프로젝트 카드. 다크 모드는 조용한 밤의 책상입니다.',
                  en: 'Taped photographs, sage, apricot and sky-blue sticky notes, and a collection of project cards on a cream notebook. Dark mode becomes a quiet desk at night.' },
          swatch: ['#f5f0e5', '#dfe9d9', '#f4dcc8', '#dce9f0'] }
      ]
    },
    {
      id: 'fantasy',
      name: { ko: '모험가 길드', en: 'Adventurers’ Guild' },
      desc: { ko: '양피지와 금장, 세리프 활자로 엮은 판타지 RPG의 기록. 기획자의 여정을 한 권의 길드 장부로 펼칩니다.',
              en: 'A fantasy RPG record bound in parchment, gold and serif type. A designer’s journey unfolds as a guild ledger.' },
      fonts: [G + 'Cinzel:wght@400;500;600;700&family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@400;500;600;700'],
      variants: [
        { id: 'quest', name: { ko: '퀘스트 로그', en: 'Quest Log' },
          desc: { ko: '초상화가 담긴 모험가 등록증, 금장 의뢰 게시판, 세 장의 특성 카드와 모험 일지. 낮에는 양피지, 밤에는 촛불빛 금색의 가죽 장정.',
                  en: 'A portrait-bearing adventurer record, a gilded quest board, three trait cards and a journey journal. Parchment by day; leather and candlelit gold by night.' },
          swatch: ['#eee3c9', '#263e35', '#a27b37', '#823f36'] }
      ]
    }
  ];

  var KEY = 'portfolio:skin';
  function load() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function save(v) { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) {} }
  function find(id) {
    if (!id) return null;
    for (var i = 0; i < THEMES.length; i++) {
      var th = THEMES[i];
      for (var j = 0; j < th.variants.length; j++) {
        if (th.id + '-' + th.variants[j].id === id) return { theme: th, variant: th.variants[j], id: id };
      }
    }
    return null;
  }

  /* 이 스크립트 위치 → assets/css/themes/ 경로 (index.html 과 projects/detail.html 모두) */
  var me = document.currentScript || (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var src = (me && me.getAttribute('src')) || 'assets/js/themes.js';
  var ASSETS = src.replace(/js\/themes\.js.*$/, '');          /* 'assets/' 또는 '../assets/' */
  var ROOT = ASSETS.replace(/assets\/$/, '');                 /* '' 또는 '../' */

  var params = new URLSearchParams(location.search);
  var q = params.get('skin');
  var inFrame = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var isEditor = params.get('ve') === '1';
  var previewing = false;   /* 시안을 '둘러보는 중'인지 (스위처 표시 여부) */
  var current = '';

  if (q !== null) {
    current = (q === 'default' || q === '') ? '' : q;
    if (!inFrame) save(current);
    previewing = true;
  } else {
    var saved = load();
    if (saved) { current = saved; previewing = true; }
    else current = DEFAULT_SKIN;
  }
  var hit = find(current);
  if (current && !hit) { current = ''; if (!inFrame) save(''); }

  function hrefs(sel) {
    if (!sel) return { css: [], fonts: [], js: [] };
    var css = [ASSETS + 'css/themes/' + sel.theme.id + '.css', ASSETS + 'css/themes/' + sel.theme.id + '-' + sel.variant.id + '.css'];
    var fonts = (sel.theme.fonts || []).concat(sel.variant.fonts || []);
    var js = (sel.theme.scripts || []).concat(sel.variant.scripts || []).map(function (f) { return ASSETS + f; });   /* 홈 구성을 바꾸는 테마·시안의 스크립트 */
    return { css: css, fonts: fonts, js: js };
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  /* ── 초기 적용: 파싱 중이면 document.write 로 렌더 차단 링크(깜빡임 방지) ── */
  function writeLinks(sel) {
    var h = hrefs(sel), html = '';
    h.fonts.forEach(function (u, i) { html += '<link rel="stylesheet" href="' + esc(u) + '" data-skin-font="' + i + '">'; });
    h.css.forEach(function (u, i) { html += '<link rel="stylesheet" href="' + esc(u) + '" data-skin-css="' + i + '">'; });
    if (document.readyState === 'loading' && typeof document.write === 'function') {
      h.js.forEach(function (u, i) { html += '<script src="' + esc(u) + '" charset="utf-8" data-skin-js="' + i + '"><\/script>'; });
      document.write(html);
    } else {
      var tmp = document.createElement('div'); tmp.innerHTML = html;
      while (tmp.firstChild) document.head.appendChild(tmp.firstChild);
      /* 실행 중 교체: 스크립트는 innerHTML 로 실행되지 않으므로 직접 만들어 붙이고, 다 읽히면 화면을 다시 그립니다 */
      var pending = h.js.filter(function (u) { return !document.querySelector('script[data-skin-js][src="' + u + '"]'); });
      var left = pending.length;
      var done = function () { if (--left <= 0 && window.PortfolioApp && window.PortfolioApp.rerender) window.PortfolioApp.rerender(); };
      if (!left) { if (window.PortfolioApp && window.PortfolioApp.rerender) window.PortfolioApp.rerender(); }
      pending.forEach(function (u) { var sc = document.createElement('script'); sc.src = u; sc.charset = 'utf-8'; sc.setAttribute('data-skin-js', '1'); sc.onload = done; sc.onerror = done; document.head.appendChild(sc); });
    }
  }
  function mark(sel) {
    var root = document.documentElement;
    if (sel) { root.setAttribute('data-skin', sel.id); root.setAttribute('data-skin-theme', sel.theme.id); }
    else { root.removeAttribute('data-skin'); root.removeAttribute('data-skin-theme'); }
  }
  if (hit) { mark(hit); writeLinks(hit); }

  /* ── 실행 중 교체 (스위처·갤러리에서 사용) ───────────────────────────── */
  function apply(id, persist) {
    var sel = find(id);
    Array.prototype.forEach.call(document.querySelectorAll('link[data-skin-css],link[data-skin-font]'), function (l) { l.parentNode.removeChild(l); });
    mark(sel);
    if (sel) writeLinks(sel); else if (window.PortfolioApp && window.PortfolioApp.rerender) window.PortfolioApp.rerender();
    current = sel ? sel.id : '';
    if (persist !== false && !inFrame) save(current);
    var u = new URL(location.href); u.searchParams.set('skin', current || 'default');
    if (history.replaceState) history.replaceState(null, '', u.toString());
    updateSwitcher();
  }

  /* ── 떠 있는 시안 스위처 (둘러보는 중일 때만) ───────────────────────── */
  var sw = null;
  function lang() { try { return localStorage.getItem('portfolio:lang') === 'en' ? 'en' : 'ko'; } catch (e) { return 'ko'; } }
  function T(f) { var L = lang(); return (f && (f[L] || f.ko)) || ''; }
  function updateSwitcher() {
    if (!sw) return;
    var sel = find(current), L = lang();
    sw.querySelector('.pf-sw__cur').textContent = sel ? (T(sel.theme.name) + ' · ' + T(sel.variant.name)) : (L === 'en' ? 'Original design' : '기본 디자인');
    Array.prototype.forEach.call(sw.querySelectorAll('[data-sw-pick]'), function (b) {
      b.setAttribute('aria-pressed', String((b.getAttribute('data-sw-pick') || '') === current));
    });
  }
  function buildSwitcher() {
    if (sw || inFrame || isEditor || !previewing) return;
    var L = lang();
    var css =
      '.pf-sw{position:fixed;left:max(16px,env(safe-area-inset-left,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 16px);z-index:150;font:13px/1.35 system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;letter-spacing:0;color:#f4f4f2}' +
      '.pf-sw__btn{display:inline-flex;align-items:center;gap:8px;max-width:calc(100vw - 32px);padding:9px 14px 9px 10px;border:0;border-radius:999px;background:#17171a;color:#f4f4f2;box-shadow:0 8px 24px rgba(0,0,0,.35);cursor:pointer;font:inherit}' +
      '.pf-sw__btn:hover{background:#26262b}.pf-sw__dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#ff6fa8,#ffd93d,#5ed6c0,#a78bfa);flex:none}' +
      '.pf-sw__cur{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pf-sw__lbl{opacity:.6}' +
      '.pf-sw__panel{position:absolute;left:0;bottom:calc(100% + 10px);width:min(320px,calc(100vw - 32px));max-height:min(70vh,560px);overflow:auto;padding:10px;border-radius:14px;background:#17171a;box-shadow:0 16px 40px rgba(0,0,0,.45);display:none}' +
      '.pf-sw.is-open .pf-sw__panel{display:block}' +
      '.pf-sw__th{margin:8px 6px 4px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#9a9aa3}' +
      '.pf-sw__pick{display:flex;align-items:center;gap:9px;width:100%;padding:8px 8px;border:0;border-radius:9px;background:none;color:#f4f4f2;font:inherit;text-align:left;cursor:pointer}' +
      '.pf-sw__pick:hover{background:#26262b}.pf-sw__pick[aria-pressed="true"]{background:#3a3a44}' +
      '.pf-sw__sw{display:inline-grid;grid-template-columns:repeat(4,1fr);width:36px;height:14px;border-radius:4px;overflow:hidden;flex:none;border:1px solid rgba(255,255,255,.15)}' +
      '.pf-sw__sw i{display:block}' +
      '.pf-sw__foot{display:flex;gap:6px;margin:10px 4px 2px}.pf-sw__foot a{flex:1;padding:8px 10px;border-radius:9px;background:#26262b;color:#f4f4f2;text-align:center;text-decoration:none;font-size:12px}.pf-sw__foot a:hover{background:#34343c}' +
      '@media print{.pf-sw{display:none}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    sw = document.createElement('div'); sw.className = 'pf-sw';
    var items = '<button type="button" class="pf-sw__pick" data-sw-pick=""><span class="pf-sw__sw" style="background:#f0eee6"><i style="background:#f0eee6"></i><i style="background:#344b40"></i><i style="background:#c15f3c"></i><i style="background:#262625"></i></span><span>' + (L === 'en' ? 'Original design' : '기본 디자인 (현재)') + '</span></button>';
    THEMES.forEach(function (th) {
      items += '<div class="pf-sw__th">' + esc(T(th.name)) + '</div>';
      th.variants.forEach(function (v) {
        items += '<button type="button" class="pf-sw__pick" data-sw-pick="' + th.id + '-' + v.id + '"><span class="pf-sw__sw">' +
          v.swatch.map(function (c) { return '<i style="background:' + esc(c) + '"></i>'; }).join('') + '</span><span>' + esc(T(v.name)) + '</span></button>';
      });
    });
    sw.innerHTML =
      '<button type="button" class="pf-sw__btn" aria-expanded="false"><span class="pf-sw__dot"></span><span class="pf-sw__lbl">' + (L === 'en' ? 'Theme' : '테마 시안') + '</span><span class="pf-sw__cur"></span></button>' +
      '<div class="pf-sw__panel">' + items +
      '<div class="pf-sw__foot"><a href="' + ROOT + 'themes.html">' + (L === 'en' ? 'All themes →' : '전체 시안 갤러리 →') + '</a></div></div>';
    document.body.appendChild(sw);
    var btn = sw.querySelector('.pf-sw__btn');
    btn.addEventListener('click', function () { var open = !sw.classList.contains('is-open'); sw.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); });
    sw.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sw-pick]'); if (!b) return;
      apply(b.getAttribute('data-sw-pick') || '');
    });
    document.addEventListener('click', function (e) { if (sw.classList.contains('is-open') && !sw.contains(e.target)) { sw.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
    updateSwitcher();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildSwitcher);
  else buildSwitcher();

  window.PORTFOLIO_THEMES = THEMES;
  window.PortfolioSkin = { current: function () { return current; }, apply: apply, find: find, list: THEMES, assets: ASSETS };
})();
