# R&D 노트 — 닌텐도 · 패미컴 레트로 감성 (Claude 안 3종)

사용자 요청: 지금까지 나온 시안과 겹치지 않는 '완전히 새로운' 레트로 감성. 패미컴 거치 구도(왼쪽 큰 제목 · 오른쪽 기울어진 게임기 · 그 밑 카트리지 진열판)는 유지.
같은 요청을 Codex 도 따로 진행 중이며(조사 · 콘셉트 · 제작 전 과정 위임), 이 문서는 Claude 쪽 결과입니다.

## 조사 (출처)
- 패미컴 40주년 기념 사이트 — 박스 · 카트리지 · 타이틀 화면을 바꿔 보는 갤러리, 하드웨어 해설 ([Nintendo Life](https://ds.nintendolife.com/news/2023/07/nintendos-famicom-40th-anniversary-website-is-a-treasure-trove-of-trivia), [GoNintendo](https://www.gonintendo.com/contents/23282-nintendo-s-famicom-40th-anniversary-website-is-well-worth-a-virtual-visit))
- 슈퍼 마리오 35주년 Game & Watch — 빨강 플라스틱 테 + 금색 브러시드 메탈 전면판, 80년대 패키지 재현 ([Den of Geek](https://www.denofgeek.com/games/game-watch-super-mario-bros-review), [Tech Advisor](https://www.techadvisor.com/article/741086/nintendo-to-release-35th-anniversary-super-mario-bros-game-watch.html))
- 닌텐도 초기 산업 디자인 — 컬러 TV 게임 → Game & Watch → 패미컴으로 이어진 '금속 + 색 플라스틱' 계보, 빨강·흰색은 DX 안테나 간판에서 ([Nintendo Sega Japan](https://nintendosegajapan.com/tag/famicom/page/4/), [Game Informer](https://gameinformer.com/2024/01/01/40-years-later-nintendos-famicom-is-still-ahead-of-its-time))
- 닌텐도 뮤지엄(교토) — 절제된 사인, 공장 건물 재생, 전시 캡션 ([Tokyo Art Beat](https://tokyoartbeat.com/en/articles/-/nintendo-museum-kyoto-opening-news-en-202405), [Super Mario Wiki](https://www.mariowiki.com/Nintendo_Museum))
- 닌텐도 매장 — 흰 바탕 + 빨강 띠, 픽셀·그릴 무늬의 실내 ([kanpai-japan](https://www.kanpai-japan.com/kyoto/nintendo-takashimaya))
- 사용자가 준 25주년 스페셜 에디션 패키지 — 진홍 상자, 금박 월계관 엠블럼, 큰 금색 숫자

## 콘셉트 후보 (5)
1. **기념판** — 칠기 진홍 + 금박 + 월계관 + 상아 증서 카드 + 세리프 → 제작 (`pixel-fc-gold`)
2. **하드웨어** — 헤어라인 알루미늄 전면판 + 빨강 플라스틱 + 나사 · 인쇄 라벨 + LCD 숫자 → 제작 (`pixel-fc-metal`)
3. **전시** — 흰 벽 · 조명 받은 게임기 · 받침대 · 작품 캡션 · ROOM 번호 → 제작 (`pixel-fc-museum`)
4. 매장 사인 — 흰 바탕 + 하단 빨강 띠 + 그릴 무늬 (전시 안과 겹쳐 보류)
5. 만화 설명서 — 컷 나눔 · 말풍선 · 단면도 (기존 '설명서' 안과 겹쳐 보류)

## 구현 메모
- 세 안 모두 정돈 안을 복제해 시작, 게임기 몸통은 `assets/js/themes/fc-body.js` 의 벡터 그림(기념판 · 하드웨어 · 전시 각각).
- 상표 · 캐릭터는 그리지 않음(월계관 · 금박 · 나사 · 캡션은 일반 형식, 가운데는 사이트 고스트).
