/* ============================================================================
   포트폴리오 내용 파일  ·  이 파일만 고치면 사이트 전체가 바뀝니다.
   ----------------------------------------------------------------------------
   · 모든 문장은 { ko: "한국어", en: "English" } 형태입니다.
   · en 을 비워 두면 영어 화면에서도 한국어가 그대로 나옵니다.
   · edit.html 편집기로 화면에서 고칠 수도 있습니다.
   · 대괄호 [ ] 안의 항목은 자유롭게 추가·삭제·순서 변경할 수 있습니다.
   ========================================================================== */

window.PORTFOLIO_CONTENT = {

  /* ── 기본 정보 ─────────────────────────────────────────────────────────── */
  meta: {
    name:       { ko: "김지수",        en: "Jisu Kim" },
    role:       { ko: "게임 기획자",   en: "Game Designer" },
    resumeUrl:  "assets/resume/jisu-kim-resume.pdf",
    email:      "imjisukim0712@gmail.com",
    github:     "https://github.com/imjisukim0712-bit"
  },

  /* ── 헤더 목차 (페이지 이름) ─────────────────────────────────────────── */
  nav: {
    home:    { ko: "홈",         en: "Home" },
    resume:  { ko: "이력서",     en: "Résumé" },
    cover:   { ko: "자기소개서", en: "About Me" },
    projects:{ ko: "프로젝트",   en: "Projects" },
    play:    { ko: "게임플레이", en: "Play Log" }
  },

  /* ── 공통 히어로 문구 (홈 · 이력서에서 공유) ─────────────────────────── */
  hero: {
    // <span class="accent">보라색</span> 을 쓸 수 있습니다.
    titleHtml: {
      ko: '문제를 <span class="accent">정면</span>으로 <br> 마주하는 기획자.',
      en: 'A designer who faces <br> the problem <span class="accent">head-on</span>.'
    }
  },

  /* ── 홈 ────────────────────────────────────────────────────────────────
     하단 카드는 개수를 자유롭게 늘리거나 줄일 수 있습니다.
     link 예시: "resume.html", "projects.html", "play.html", "cover-letter.html"
     ────────────────────────────────────────────────────────────────────── */
  home: {
    // 큰 로그라인 아래 한 줄 설명. 비워 두면 그 줄을 아예 그리지 않습니다 (지금은 안 씁니다).
    // 다시 쓰려면 ko·en 을 함께 채우세요 — 한쪽만 채우면 다른 언어 화면에서 빈 줄이 됩니다.
    sub: { ko: "", en: "" },
    ctaResume:   { ko: "이력서", en: "Résumé" },
    ctaProjects: { ko: "포트폴리오", en: "Portfolio" },
    // 하단 카드 뽑기 인터랙션 — 좌측 스택 버튼을 누르면 프로젝트가 랜덤으로 펼쳐집니다.
    draw: {
      label:   { ko: "프로젝트 뽑기", en: "Draw projects" },
      hint:    { ko: "카드를 눌러 프로젝트로", en: "Tap a card to open it" },
      count:   4   // 한 번에 펼칠 카드 수 (프로젝트가 더 적으면 있는 만큼)
    },
    // 홈 히어로 우측 프로필 사진 (사진 한 장). 비우면 고스트 자리표시.
    player: {
      photo:    "assets/img/profile.jpg",   // 프로필 사진 경로
      photoAlt: { ko: "김지수 프로필 사진", en: "Jisu Kim portrait" }
    },
    // 사진 옆 말풍선 '한마디'. '한 마디 더' 버튼을 누르면 순서대로 바뀝니다. 자유롭게 추가·삭제.
    quips: [
      { ko: "일단, 직접 해보는 편.",   en: "I like to try things myself." },
      { ko: "생각은 문서로 남겨요.",   en: "I put my thoughts into words." },
      { ko: "같은 그림을 보고 싶어요.", en: "Let's get on the same page." }
    ],
    quipMore: { ko: "한 마디 더", en: "One more" }
  },

  /* ── 이력서 페이지 ──────────────────────────────────────────────────────
     히어로 아래로 스크롤하면 숫자 요약 · 핵심역량 · 경력이 이어집니다.
     ────────────────────────────────────────────────────────────────────── */
  resume: {
    heroNote: { ko: "아래로 스크롤하면 이력서 상세가 이어집니다", en: "Scroll down for the full résumé" },

    /* ── 인적사항 ──────────────────────────────────────────────────────────
       민감한 개인정보는 x 로 가려 둔 자리입니다. 편집기에서 실제 값으로 바꾸세요.
       ────────────────────────────────────────────────────────────────────── */
    profile: {
      title: { ko: "인적사항", en: "Profile" },
      note:  { ko: "민감한 정보는 x 로 가려 두었습니다. 실제 값으로 채워 넣으세요.",
               en: "Sensitive fields are masked with x — replace them with real values." },
      items: [
        { label: { ko: "이름",     en: "Name" },           value: { ko: "김지수",          en: "Jisu Kim" } },
        { label: { ko: "생년월일", en: "Date of birth" },   value: { ko: "xxxx.xx.xx",      en: "xxxx.xx.xx" } },
        { label: { ko: "연락처",   en: "Phone" },           value: { ko: "010-xxxx-xxxx",   en: "010-xxxx-xxxx" } },
        { label: { ko: "이메일",   en: "Email" },           value: { ko: "xxxxxx@xxxx.xxx", en: "xxxxxx@xxxx.xxx" } },
        { label: { ko: "거주지",   en: "Location" },        value: { ko: "서울특별시 xxx구", en: "xxx-gu, Seoul" } },
        { label: { ko: "병역",     en: "Military service" }, value: { ko: "xxxx",            en: "xxxx" } },
        { label: { ko: "희망연봉", en: "Desired salary" },   value: { ko: "x,xxx만 원",      en: "xx,xxx" } }
      ]
    },

    stats: [
      { num: "300K", unit: { ko: "+",  en: "+" },      label: { ko: "출시작 누적 다운로드",   en: "Total downloads" } },
      { num: "7",    unit: { ko: "종", en: "titles" }, label: { ko: "스토어 · 스팀 출시작",   en: "Titles released" } },
      { num: "60K",  unit: { ko: "+",  en: "+" },      label: { ko: "운영 참여 커뮤니티 회원", en: "Community members" } },
      { num: "10",   unit: { ko: "년", en: "yrs" },    label: { ko: "게임을 만들어 온 기간",   en: "Making games since 2016" } }
    ],

    skills: {
      title: { ko: "핵심역량", en: "Core Skills" },
      lead:  { ko: "실제로 무언가를 만들거나, 문서로 남기거나, 검증하는 데 쓴 도구들입니다.",
               en: "Tools I actually used to make, document, or verify a real project." },
      cards: [
        { title: { ko: "문서 도구", en: "Document tools" },
          body:  { ko: "Figma, MS Office 활용 문서 작성. 문서 도구 자격증 보유.",
                   en: "Writing docs with Figma and MS Office. Certified in office tools." },
          tools: ["figma","office"] },
        { title: { ko: "Obsidian", en: "Obsidian" },
          body:  { ko: "문서 초안 작성과 분류, 플러그인 활용. AI를 활용한 문서 분류 자동화.",
                   en: "Drafting and organising docs with plugins; AI-assisted auto-classification." },
          tools: ["obsidian"] },
        { title: { ko: "AI 활용", en: "AI" },
          body:  { ko: "AI를 활용한 게임·영상·음악 제작. 챗봇 제작, 자료조사 자동화.",
                   en: "Making games, video and music with AI; building chatbots, automating research." },
          tools: ["ai"] },
        { title: { ko: "협업 도구", en: "Collaboration tools" },
          body:  { ko: "깃허브, 노션, 지라, 스프레드시트. 일정 관리·버전 관리 등 협업에 활용.",
                   en: "GitHub, Notion, Jira, Spreadsheets — for scheduling, versioning and teamwork." },
          tools: ["github","notion","jira","sheets"] },
        { title: { ko: "개발 도구", en: "Development tools" },
          body:  { ko: "유니티, 고도, 게임 메이커, 파이어베이스. 1인 및 팀 개발과 기획 도구로 활용.",
                   en: "Unity, Godot, GameMaker, Firebase — for solo and team development and prototyping." },
          tools: ["unity","godot","gamemaker","firebase"] }
      ]
    },

    career: {
      title: { ko: "경력 · 활동", en: "Career & Activity" },
      lead:  { ko: "교육과 커뮤니티, 사이드 작업. 쓰고, 설명하고, 출시하는 일을 연습한 자리들입니다.",
               en: "Education, communities and side work — where I practised writing, explaining and shipping." },
      items: [
        { now: true,
          date: { ko: "2026.06 – 2026.12", en: "Jun – Dec 2026" },
          role: { ko: "게임 기획자 과정 이수", en: "Game Design course" },
          org:  { ko: "디벨로켓", en: "Develocket" },
          body: { ko: "기획을 팀에 효과적으로 전달하는 프로세스를 배우고 있습니다.",
                  en: "Learning an effective process for delivering a design to a team." },
          tags: [ { ko: "기획 프로세스", en: "Design process" }, { ko: "문서 작성", en: "Documentation" }, { ko: "커뮤니케이션", en: "Communication" } ] },
        { now: false,
          date: { ko: "2026", en: "2026" },
          role: { ko: "발표 스터디 리더", en: "Study group leader" },
          org:  { ko: "기획자 모임 · 12인", en: "Designers' group · 12 members" },
          body: { ko: "12인 규모 모임에서 매주 1회 기획서를 작성하고 발표합니다.",
                  en: "Leading a 12-person group that writes and presents a design doc weekly." },
          tags: [ { ko: "주 1회 기획서", en: "Weekly docs" }, { ko: "발표", en: "Presenting" }, { ko: "리더", en: "Leading" } ] },
        { now: false,
          date: { ko: "2021 – 2023", en: "2021 – 2023" },
          role: { ko: "블로그 운영 · 게임 평론", en: "Blog & game writing" },
          org:  { ko: "하라리 랩스 · 2인", en: "Harari Labs · 2 people" },
          body: { ko: "2인 블로그에서 게임 리뷰·공략·평론을 작성했습니다. 월 3~5,000뷰.",
                  en: "Reviews, guides and criticism on a two-person blog, 3,000–5,000 views/month." },
          tags: [ { ko: "리뷰", en: "Reviews" }, { ko: "공략", en: "Guides" }, { ko: "평론", en: "Criticism" } ] },
        { now: false,
          date: { ko: "2019 – 현재", en: "2019 – present" },
          role: { ko: "스탭 활동", en: "Staff member" },
          org:  { ko: "KGMC · 회원 6만+ 인디게임 개발 카페", en: "KGMC · 60K+ indie dev community" },
          body: { ko: "회원 6만 명 이상의 인디게임 개발 커뮤니티를 관리하고, 개발·교양 강좌를 작성합니다.",
                  en: "Helping run a 60,000-member indie dev community and writing courses for it." },
          tags: [ { ko: "커뮤니티 관리", en: "Community ops" }, { ko: "강좌 작성", en: "Course writing" }, { ko: "60K+", en: "60K+" } ] },
        { now: false,
          date: { ko: "2016 – 2018", en: "2016 – 2018" },
          role: { ko: "인디게임 1인 개발", en: "Solo indie development" },
          org:  { ko: "플레이스토어 5종 출시 · 총 20만 다운로드", en: "5 titles on Google Play · 200K+ downloads" },
          body: { ko: "혼자 5종을 출시하며 파이프라인 전체를 익혔습니다.",
                  en: "Five titles shipped alone, the whole pipeline learned the hard way." },
          tags: [ { ko: "1인 개발", en: "Solo dev" }, { ko: "스토어 출시", en: "Store release" }, { ko: "200K+", en: "200K+" } ] }
      ]
    }
  },

  /* ── 자기소개서 페이지 (지금은 비워둠) ───────────────────────────────────
     blocks 에 { heading, body } 를 추가하면 문단이 채워집니다.
     ────────────────────────────────────────────────────────────────────── */
  coverLetter: {
    title: { ko: "자기소개서", en: "About Me" },
    lead:  { ko: "곧 채울 예정입니다.", en: "Coming soon." },
    // 맨 위 요약 — '함께 일하면, 이런 기획자입니다.' 강점 세 가지. 본문(blocks)의 개요 역할.
    summary: {
      title: { ko: "함께 일하면, 이런 기획자입니다.", en: "This is how I work." },
      items: [
        { tag: "01 / DOCUMENT",
          title: { ko: "생각을 정리합니다", en: "I clarify ideas" },
          body:  { ko: "의도를 명세서로 옮겨, 팀이 같은 기준으로 이야기하게 합니다.",
                   en: "I turn intent into specifications so the team has a shared reference." } },
        { tag: "02 / PROTOTYPE",
          title: { ko: "직접 확인합니다", en: "I test by making" },
          body:  { ko: "기획한 내용을 프로토타입으로 만들고, 플레이하며 확인합니다.",
                   en: "I build prototypes of my designs and check how they play." } },
        { tag: "03 / OBSERVE",
          title: { ko: "다음 판단에 남깁니다", en: "I learn for the next decision" },
          body:  { ko: "기대에 못 미친 결과를 겪은 뒤, 시장과 플레이를 먼저 살피는 습관을 들였습니다.",
                   en: "After results fell short, I learned to study the market and the play experience first." } }
      ]
    },
    // 본문 — 문단은 \n\n 으로 나눕니다.
    blocks: [
      { heading: { ko: "문제를 풀 때, 가장 몰입합니다.", en: "Solving problems is where I find my focus." },
        body: { ko: "게임에서는 플레이어에게 과제가 주어지고, 선택에는 빠르고 확실한 피드백이 돌아옵니다. 저는 그 과정에서 느껴지는 문제 해결의 재미와, 직접 상호작용하며 몰입하는 경험을 좋아합니다.\n\n학생 시절부터 인디게임을 개발했습니다. 플래시 게임부터 Play Store 앱까지, 상상한 것을 직접 플레이할 수 있는 형태로 만드는 경험을 쌓았습니다.",
              en: "Games give players challenges, and choices bring fast, tangible feedback. I enjoy the problem-solving process and the immersion that comes from direct interaction.\n\nI began developing indie games as a student. From Flash games to Play Store apps, I learned to turn ideas into something people could actually play." } },
      { heading: { ko: "좋은 아이디어에도, 공통 언어가 필요합니다.", en: "Good ideas need a shared language." },
        body: { ko: "타워디펜스 모바일 게임을 함께 만들 때, 회의마다 팀원들이 서로 다른 게임을 떠올린다는 것을 느꼈습니다. 말로 더 자세히 설명하는 것만으로는 충분하지 않았습니다.\n\n그래서 기획이라고 할 만한 명세서를 처음 작성했습니다. 아이디어를 문서로 옮기자 팀은 같은 기준으로 이야기할 수 있게 되었습니다. 출시 후 10만 다운로드라는 성과와 함께, 저는 팀의 이해를 맞추는 기획의 역할을 배웠습니다.",
              en: "While developing a mobile tower defense game, I noticed that teammates imagined different things in meetings. More detailed verbal explanations were not enough.\n\nI wrote my first real design specification. Putting ideas into a document gave the team a common reference. Alongside reaching 100K downloads after release, I learned how design can align a team's understanding." } },
      { heading: { ko: "실패의 다음에는, 관찰이 남았습니다.", en: "After a setback, I learned to observe." },
        body: { ko: "개인 개발을 하며 기대에 미치지 못한 결과도 경험했습니다. 돌아보니 시장조사가 부족했고, 플랫폼과 트렌드를 충분히 파악하지 못했습니다.\n\n그 뒤로는 시장의 게임을 먼저 살피는 습관을 들였습니다. 최근에는 AI를 활용해 매일 정해진 시간에 인기 게임 순위 변화를 측정하는 프로세스를 구축했습니다. 감상을 넘어서, 기획 판단에 쓸 수 있는 관찰을 쌓고 있습니다.",
              en: "Some of my independent games fell short of expectations. Looking back, I had not researched the market, platform, or trends well enough.\n\nI began studying games in the market first. More recently, I built an AI-assisted process to measure popular game ranking changes at a regular time each day. I am building observations that can inform design decisions." } },
      { heading: { ko: "회피하지 않고, 다음 질문으로.", en: "Face the challenge, then ask the next question." },
        body: { ko: "저에게 중요한 태도는 문제를 잘 정의하고 정면으로 마주하는 것입니다. 팀원에게 더 효율적으로 의도를 전달하고, 다른 관점을 이해하기 위해 계속 소통하는 기획자가 되고 싶습니다.\n\n장기적으로는 큰 목표를 작은 문제로 나누어 해결하는 PD로 성장하고 싶습니다. 지금은 작은 실천을 반복하고, 어제의 문제를 오늘의 배움으로 바꾸는 데 집중합니다.",
              en: "The attitude I value is defining problems clearly and facing them directly. I want to communicate intent effectively and keep talking to understand other perspectives.\n\nIn the long term, I want to grow into a producer who breaks big goals into manageable problems. For now, I focus on small, consistent actions and turning yesterday's problems into today's learning." } }
    ]
  },

  /* ── 프로젝트 ───────────────────────────────────────────────────────────
     category: "game"(게임) | "planning"(기획) — 프로젝트 페이지 탭 필터에 쓰입니다.
     id 는 상세 페이지 주소가 됩니다 (영문 소문자·하이픈 권장).
     detail 의 problem·approach·retrospective 를 비우면 "작성 예정"으로 표시됩니다.
     media: 상세 페이지 우측 큰 영역. embed 에 URL 을 넣으면 그대로 삽입, 비우면 안내 문구.
     ────────────────────────────────────────────────────────────────────── */
  projects: {
    tabs: {
      all:      { ko: "전체",  en: "All" },
      game:     { ko: "게임",  en: "Game" },
      planning: { ko: "기획",  en: "Planning" }
    },
    title: { ko: "게임 프로젝트", en: "Projects" },
    items: [
      {
        id: "league-of-defense",
        quest: { goal: { ko: "3일 차 이탈 개선", en: "Cut day-3 churn" }, result: { ko: "34% → 21%", en: "34% → 21%" }, cleared: true },
        category: "game",
        grade: "SSR",                       // 카드 등급 SSR·SR·R·A (테두리: 홀로그램·금박·은박·기본)
        tag:   { ko: "타워디펜스", en: "Tower defense" },   // 카드에 크게 보이는 대표 태그
        thumb: "",                            // 카드 그림 (비우면 자동 생성 아트)
        title: { ko: "리그 오브 디펜스", en: "League of Defense" },
        period:{ ko: "2020.01 ~ 2021.06", en: "Jan 2020 – Jun 2021" },
        sub:   { ko: "모바일 타워디펜스 · 10만 다운로드", en: "Mobile tower defense · 100K+ downloads" },
        genres:[ { ko: "타워디펜스", en: "Tower defense" }, { ko: "모바일", en: "Mobile" }, { ko: "전략", en: "Strategy" } ],
        headcount: { ko: "3인", en: "3 people" },
        myRole:    { ko: "PD · 개발", en: "PD · Development" },
        status:    { ko: "플레이스토어 출시", en: "Released on Google Play" },
        learned: [
          { ko: "말은 전달 수단이 아니라는 것 — 처음으로 명세서를 썼습니다.", en: "Talking isn't a delivery format — I wrote my first spec." },
          { ko: "팀이 함께 볼 문서가 생기자 같은 방향을 보기 시작했습니다.", en: "Once there was one shared doc, the team looked one way." },
          { ko: "누적 10만 다운로드로 이어졌습니다.", en: "It reached 100K+ downloads." }
        ],
        links: { googlePlay: "", steam: "" },
        media: { embed: "", note: { ko: "게임 영상·이미지가 들어갈 자리입니다.", en: "Space for gameplay video and images." } }
      },
      {
        id: "comstock",
        quest: { goal: { ko: "3개월 내 스팀 출시", en: "Ship to Steam in 3 months" }, result: { ko: "기간 내 출시 완료", en: "Shipped on time" }, cleared: true },
        category: "game",
        grade: "SSR",                       // 카드 등급 SSR·SR·R·A (테두리: 홀로그램·금박·은박·기본)
        tag:   { ko: "뱀서라이크", en: "Survivors-like" },   // 카드에 크게 보이는 대표 태그
        thumb: "",                            // 카드 그림 (비우면 자동 생성 아트)
        title: { ko: "컴스톡", en: "Comstock" },
        period:{ ko: "2026.07 ~ 2026.09", en: "Jul – Sep 2026" },
        sub:   { ko: "뱀서라이크 액션 · 스팀 출시 · 5인 팀", en: "Survivors-like · Steam · 5-person team" },
        genres:[ { ko: "뱀서라이크", en: "Survivors-like" }, { ko: "액션", en: "Action" }, { ko: "PC", en: "PC" } ],
        headcount: { ko: "5인", en: "5 people" },
        myRole:    { ko: "PM · 기획 · 바이브 코딩", en: "PM · Design · Vibe coding" },
        status:    { ko: "스팀 출시", en: "Released on Steam" },
        learned: [
          { ko: "PM으로 고정된 3개월 일정 안에서 스팀 출시까지 마쳤습니다.", en: "As PM, shipped to Steam within a fixed 3-month window." },
          { ko: "기획을 AI 코딩으로 직접 프로토타입해 같은 주에 검증했습니다.", en: "Prototyped my own specs with AI coding, tested the same week." }
        ],
        links: { googlePlay: "", steam: "" },
        media: { embed: "", note: { ko: "게임 영상·이미지가 들어갈 자리입니다.", en: "Space for gameplay video and images." } }
      },
      {
        id: "indie-games",
        quest: { goal: { ko: "대중성 검증", en: "Validate market appeal" }, result: { ko: "누적 20만 다운로드", en: "200K+ downloads" }, cleared: true },
        category: "game",
        grade: "SR",                       // 카드 등급 SSR·SR·R·A (테두리: 홀로그램·금박·은박·기본)
        tag:   { ko: "캐주얼", en: "Casual" },   // 카드에 크게 보이는 대표 태그
        thumb: "",                            // 카드 그림 (비우면 자동 생성 아트)
        title: { ko: "인디게임 개발 5종", en: "Five indie releases" },
        period:{ ko: "2016 ~ 2018", en: "2016 – 2018" },
        sub:   { ko: "1인 개발 · 플레이스토어 · 총 20만 다운로드", en: "Solo dev · Google Play · 200K+ total" },
        genres:[ { ko: "키우기", en: "Idle" }, { ko: "캐주얼", en: "Casual" }, { ko: "모바일", en: "Mobile" } ],
        headcount: { ko: "1인", en: "Solo" },
        myRole:    { ko: "전부 (기획·개발·아트)", en: "Everything (solo)" },
        status:    { ko: "플레이스토어 5종 출시", en: "5 titles on Google Play" },
        learned: [
          { ko: "혼자 파이프라인 전체를 익혔습니다.", en: "Learned the whole pipeline solo." },
          { ko: "가장 큰 실패는 시장조사 — 이후 시장을 먼저 읽는 습관이 생겼습니다.", en: "The biggest failure was market research — hence the read-first habit." }
        ],
        links: { googlePlay: "", steam: "" },
        media: { embed: "", note: { ko: "게임 영상·이미지가 들어갈 자리입니다.", en: "Space for gameplay video and images." } }
      },

      /* ── 기획서 (임시 샘플) — 실제 문서로 교체 예정 ─────────────────────── */
      {
        id: "sample-combat-doc",
        quest: { goal: { ko: "전투 손맛 수치화", en: "Quantify combat feel" }, result: { ko: "샘플 기획서 (작성 예정)", en: "Sample doc (draft)" }, cleared: false },
        category: "planning",
        grade: "R",                       // 카드 등급 SSR·SR·R·A (테두리: 홀로그램·금박·은박·기본)
        tag:   { ko: "전투 밸런스", en: "Combat balance" },   // 카드에 크게 보이는 대표 태그
        thumb: "",                            // 카드 그림 (비우면 자동 생성 아트)
        title: { ko: "로그라이크 전투 시스템 기획서", en: "Roguelike combat system doc" },
        period:{ ko: "샘플 문서", en: "Sample doc" },
        sub:   { ko: "전투 · 밸런스 · 성장 루프 기획 (임시)", en: "Combat · balance · growth loop (placeholder)" },
        genres:[ { ko: "시스템", en: "System" }, { ko: "전투", en: "Combat" }, { ko: "밸런스", en: "Balance" } ],
        headcount: { ko: "개인 기획", en: "Solo design" },
        myRole:    { ko: "기획 · 문서", en: "Design · Documentation" },
        status:    { ko: "샘플 기획서", en: "Sample document" },
        learned: [
          { ko: "임시로 넣어 둔 샘플 기획서입니다. 실제 문서로 교체할 자리입니다.", en: "Placeholder sample doc — to be replaced with the real one." }
        ],
        detailBlocks: {
          problem:       { ko: "(임시) 해결하려는 문제를 여기에 적습니다.", en: "(Placeholder) State the problem here." },
          approach:      { ko: "(임시) 어떤 시스템·수치로 접근했는지 적습니다.", en: "(Placeholder) Describe the system and numbers used." },
          retrospective: { ko: "(임시) 다시 한다면 무엇을 바꿀지 적습니다.", en: "(Placeholder) What you'd change next time." }
        },
        links: { googlePlay: "", steam: "" },
        media: { embed: "", note: { ko: "기획서 문서·다이어그램이 들어갈 자리입니다.", en: "Space for the design document and diagrams." } }
      },
      {
        id: "sample-economy-doc",
        quest: { goal: { ko: "재화 순환 설계", en: "Design the currency loop" }, result: { ko: "샘플 기획서 (작성 예정)", en: "Sample doc (draft)" }, cleared: false },
        category: "planning",
        grade: "R",                       // 카드 등급 SSR·SR·R·A (테두리: 홀로그램·금박·은박·기본)
        tag:   { ko: "재화 순환", en: "Currency loop" },   // 카드에 크게 보이는 대표 태그
        thumb: "",                            // 카드 그림 (비우면 자동 생성 아트)
        title: { ko: "라이브 이벤트 · BM 기획서", en: "Live-event & BM doc" },
        period:{ ko: "샘플 문서", en: "Sample doc" },
        sub:   { ko: "경제 · 재화 순환 · 상점 구조 기획 (임시)", en: "Economy · currency loop · shop structure (placeholder)" },
        genres:[ { ko: "경제", en: "Economy" }, { ko: "BM", en: "Monetization" }, { ko: "라이브", en: "Live ops" } ],
        headcount: { ko: "개인 기획", en: "Solo design" },
        myRole:    { ko: "기획 · 문서", en: "Design · Documentation" },
        status:    { ko: "샘플 기획서", en: "Sample document" },
        learned: [
          { ko: "임시로 넣어 둔 샘플 기획서입니다. 실제 문서로 교체할 자리입니다.", en: "Placeholder sample doc — to be replaced with the real one." }
        ],
        detailBlocks: {
          problem:       { ko: "(임시) 해결하려는 문제를 여기에 적습니다.", en: "(Placeholder) State the problem here." },
          approach:      { ko: "(임시) 재화 순환·상점 구조를 어떻게 설계했는지 적습니다.", en: "(Placeholder) Describe the currency loop and shop design." },
          retrospective: { ko: "(임시) 다시 한다면 무엇을 바꿀지 적습니다.", en: "(Placeholder) What you'd change next time." }
        },
        links: { googlePlay: "", steam: "" },
        media: { embed: "", note: { ko: "기획서 문서·다이어그램이 들어갈 자리입니다.", en: "Space for the design document and diagrams." } }
      }
    ]
  },

  /* ── 게임플레이 (플레이한 게임 기록) ────────────────────────────────────── */
  play: {
    title: { ko: "게임플레이 경험", en: "Play Log" },
    lead:  { ko: "재밌게 놀고, 끝나면 왜 재밌었는지 뜯어봅니다. 기획서를 바꾼 게임들입니다.",
             en: "I play hard, then take apart why it worked. These changed a doc I wrote." },
    cards: [
      { name:  { ko: "스텔라리스", en: "Stellaris" },
        hours: { ko: "1,000h", en: "1,000h" },
        genre: { ko: "우주 전략 시뮬레이션 · PC", en: "Space grand strategy · PC" },
        note:  { ko: "지연된 결과를 가진 결정의 연쇄. 하나의 수치가 아니라 시스템 전체를 보는 습관을 배웠습니다.",
                 en: "A chain of decisions with delayed consequences — I learned to read a system whole." } },
      { name:  { ko: "러스티레이크", en: "Rusty Lake" },
        hours: { ko: "시리즈 전작", en: "All titles" },
        genre: { ko: "공포 방탈출 퍼즐 · PC / 모바일", en: "Horror escape puzzle · PC / Mobile" },
        note:  { ko: "퍼즐 구조만으로 서사를 전달하는 교본. 이야기가 연출이 아니라 규칙 그 자체입니다.",
                 en: "Narrative through puzzle structure alone — the story is the mechanic." } },
      { name:  { ko: "작성 예정", en: "Coming soon" },
        hours: { ko: "TBD", en: "TBD" },
        genre: { ko: "지원 직무 · 팀 관련 게임", en: "A title related to the team" },
        note:  { ko: "지원하는 팀과 관련된 타이틀을 넣을 자리입니다.", en: "Slot for a title relevant to the team." } }
    ]
  },

  /* ── 푸터 (모든 페이지 공통) ─────────────────────────────────────────────
     연락처 버튼은 위 meta 의 resumeUrl · email · github 값으로 자동 생성됩니다.
     ────────────────────────────────────────────────────────────────────── */
  footer: {
    tagline: { ko: "문제를 정면으로 마주하는 기획자", en: "A designer who faces the problem head-on" }
  }
};
