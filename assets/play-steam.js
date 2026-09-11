/* 스팀 플레이 기록 — tools/steam-sync.mjs 가 자동으로 씁니다.
   ---------------------------------------------------------------------------
   지금은 **스팀 연결 전 임시 예시 값**입니다 (sample: true 라서 화면에 '예시 데이터' 딱지가 붙습니다).
   스팀 시크릿을 등록하고 워크플로를 한 번 돌리면 이 파일이 진짜 기록으로 통째로 덮어써지고
   딱지도 함께 사라집니다.  켜는 법: docs/steam-play-log.md
   그래프를 아예 숨기려면 아래를 window.PORTFOLIO_STEAM = null; 로 바꾸세요. */
window.PORTFOLIO_STEAM = {
  "sample": true,
  "generatedAt": "",
  "totals": { "games": 38, "hours": 2140 },
  "axes": [
    { "id": "2",  "name": "Strategy",   "hours": 980, "games": 9 },
    { "id": "28", "name": "Simulation", "hours": 640, "games": 7 },
    { "id": "3",  "name": "RPG",        "hours": 320, "games": 8 },
    { "id": "1",  "name": "Action",     "hours": 210, "games": 11 },
    { "id": "25", "name": "Adventure",  "hours": 140, "games": 6 },
    { "id": "4",  "name": "Casual",     "hours": 62,  "games": 5 }
  ],
  "restHours": 90,
  "restGenres": 3,
  "top": [],
  "recent": []
};
