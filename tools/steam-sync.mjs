#!/usr/bin/env node
/* ============================================================================
   steam-sync.mjs — 스팀 플레이 기록을 모아 assets/play-steam.js 를 만듭니다.
   ----------------------------------------------------------------------------
   이 사이트는 서버가 없는 정적 사이트라, 스팀 호출은 깃허브 액션(서버 쪽)에서
   미리 끝내 두고 화면은 결과 파일만 읽습니다. (브라우저에서 직접 부르면
   ① 개인 API 키가 소스에 노출되고 ② 스팀이 CORS 를 열어 주지 않아 막힙니다.)

     실행:  STEAM_API_KEY=... STEAM_ID=... node tools/steam-sync.mjs
     설정:  assets/content.js 의 play.steam  (제외 목록·최소 시간·축 개수 …)
     결과:  assets/play-steam.js       — 화면이 읽는 집계 결과 (window.PORTFOLIO_STEAM)
            tools/steam-cache.json     — appid → 장르·연령 정보 캐시(호출 수 절약)

   빼는 것 (부적절한 게임):
     · 스팀 콘텐츠 표시 1·3·4 (노출/성적 콘텐츠) 가 붙은 게임
     · 장르 71(성적 콘텐츠) · 72(노출) 인 게임
     · 연령 제한 18세 이상, 또는 상점이 정보를 주지 않는 게임(연령 게이트)
     · content.js 의 play.steam.exclude 에 적어 둔 appid·이름 (직접 고르는 자리)
     · 게임이 아닌 소프트웨어(장르 51~60·84 — 월페이퍼 엔진 같은 것)
   모두 **집계 전에** 빠지므로, 공개되는 파일에 아예 들어가지 않습니다.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'play-steam.js');
const CACHE = path.join(ROOT, 'tools', 'steam-cache.json');

const KEY = (process.env.STEAM_API_KEY || '').trim();
const ID = (process.env.STEAM_ID || '').trim();
if (!KEY || !ID) {
  console.error('STEAM_API_KEY 와 STEAM_ID 환경변수가 필요합니다. (깃허브 저장소 Secrets 에 등록)');
  process.exit(1);
}

/* ── 설정 읽기 — content.js 를 그대로 평가해 play.steam 을 가져옵니다 ──────── */
function loadConfig() {
  const src = fs.readFileSync(path.join(ROOT, 'assets', 'content.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { timeout: 5000 });
  const c = sandbox.window.PORTFOLIO_CONTENT || {};
  return (c.play && c.play.steam) || {};
}
const CFG = loadConfig();
const MIN_MINUTES = num(CFG.minMinutes, 60);          /* 이만큼 못 논 게임은 빼기 */
const AXES = Math.max(3, Math.min(8, num(CFG.axes, 6)));
const TOP_COUNT = Math.max(0, num(CFG.topCount, 8));  /* 결과 파일에 이름을 남길 게임 수 */
const SKIP_SOFTWARE = CFG.skipSoftware !== false;
const EXCLUDE = Array.isArray(CFG.exclude) ? CFG.exclude : [];
const EXCLUDE_GENRES = (Array.isArray(CFG.excludeGenres) ? CFG.excludeGenres : [23, 37, 70]).map(String);

const ADULT_DESCRIPTORS = [1, 3, 4];        /* 노출·성적 콘텐츠 표시 */
const ADULT_GENRES = ['71', '72'];          /* 성적 콘텐츠 · 노출 */
const SOFTWARE_GENRES = ['51','52','53','54','55','56','57','58','59','60','84'];

function num(v, d) { var n = Number(v); return Number.isFinite(n) ? n : d; }

/* ── 스팀 호출 ────────────────────────────────────────────────────────────── */
async function getJson(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'portfolio-steam-sync' } });
      if (res.status === 429 || res.status >= 500) { await sleep(3000 * (i + 1)); continue; }
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { await sleep(1500 * (i + 1)); }
  }
  return null;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function ownedGames() {
  const url = 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=' + encodeURIComponent(KEY) +
    '&steamid=' + encodeURIComponent(ID) + '&include_appinfo=1&include_played_free_games=1&format=json';
  const j = await getJson(url);
  const games = (j && j.response && j.response.games) || [];
  if (!games.length) {
    console.error('소유 게임이 비어 있습니다. 스팀 프로필의 "게임 상세 정보"가 공개인지 확인하세요.');
    process.exit(2);
  }
  return games;
}

async function recentGames() {
  const url = 'https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=' + encodeURIComponent(KEY) +
    '&steamid=' + encodeURIComponent(ID) + '&count=5&format=json';
  const j = await getJson(url);
  return (j && j.response && j.response.games) || [];
}

/* 상점 정보(장르·연령·콘텐츠 표시) — 비공식 API 라 5분에 200회쯤이 한계입니다.
   캐시에 없는 것만, 사이를 띄워 가며, 한 번에 조금씩 받습니다. */
async function appDetails(appid) {
  const url = 'https://store.steampowered.com/api/appdetails?appids=' + appid +
    '&l=english&filters=basic,genres,content_descriptors,required_age';
  const j = await getJson(url, 2);
  const box = j && j[String(appid)];
  if (!box || !box.success || !box.data) return { ok: false };
  const d = box.data;
  return {
    ok: true,
    name: d.name || '',
    genres: (d.genres || []).map(g => String(g.id)),
    genreNames: Object.fromEntries((d.genres || []).map(g => [String(g.id), g.description || ''])),
    age: num(String(d.required_age || '0').replace(/\D/g, ''), 0),
    ids: ((d.content_descriptors && d.content_descriptors.ids) || []).map(Number)
  };
}

/* ── 걸러내기 ─────────────────────────────────────────────────────────────── */
function manuallyExcluded(game) {
  return EXCLUDE.some(rule => {
    if (typeof rule === 'number') return rule === game.appid;
    const s = String(rule || '').trim().toLowerCase();
    if (!s) return false;
    if (/^\d+$/.test(s)) return Number(s) === game.appid;
    return (game.name || '').toLowerCase().includes(s);
  });
}
function why(info) {
  if (!info.ok) return '상점 정보 없음(연령 게이트 등)';
  if (info.ids.some(id => ADULT_DESCRIPTORS.includes(id))) return '성인 콘텐츠 표시';
  if (info.genres.some(g => ADULT_GENRES.includes(g))) return '성인 장르';
  if (info.age >= 18) return '18세 이상';
  if (SKIP_SOFTWARE && info.genres.some(g => SOFTWARE_GENRES.includes(g))) return '게임이 아닌 소프트웨어';
  return '';
}

/* ── 실행 ─────────────────────────────────────────────────────────────────── */
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const games = await ownedGames();
const played = games
  .filter(g => num(g.playtime_forever, 0) >= MIN_MINUTES)
  .sort((a, b) => b.playtime_forever - a.playtime_forever);

console.log('소유 ' + games.length + '종 · ' + MIN_MINUTES + '분 이상 논 게임 ' + played.length + '종');

let fetched = 0;
const FETCH_LIMIT = num(CFG.fetchLimit, 140);       /* 한 번 실행에 새로 받을 최대 개수 (호출 제한 대비) */
const kept = [], dropped = [];

for (const g of played) {
  if (manuallyExcluded(g)) { dropped.push([g, '직접 제외']); continue; }
  let info = cache[g.appid];
  if (!info) {
    if (fetched >= FETCH_LIMIT) { dropped.push([g, '이번 실행에서 못 받음(다음 실행에 포함)']); continue; }
    info = await appDetails(g.appid);
    cache[g.appid] = info;
    fetched++;
    await sleep(1500);
  }
  const reason = why(info);
  if (reason) { dropped.push([g, reason]); continue; }
  kept.push({ game: g, info });
}

/* 장르별 집계 — 한 게임이 여러 장르면 시간을 나눠 담습니다 (합이 총 시간과 맞도록) */
const byGenre = new Map();   /* id → { hours, games, name } */
let totalMinutes = 0;
for (const { game, info } of kept) {
  const mins = num(game.playtime_forever, 0);
  totalMinutes += mins;
  const gs = info.genres.filter(id => !EXCLUDE_GENRES.includes(id) && !SOFTWARE_GENRES.includes(id));
  if (!gs.length) continue;
  const share = mins / gs.length;
  for (const id of gs) {
    const cur = byGenre.get(id) || { minutes: 0, games: 0, name: (info.genreNames || {})[id] || '' };
    cur.minutes += share; cur.games += 1;
    if (!cur.name && info.genreNames) cur.name = info.genreNames[id] || '';
    byGenre.set(id, cur);
  }
}

const genres = [...byGenre.entries()]
  .map(([id, v]) => ({ id, name: v.name, hours: Math.round(v.minutes / 60), games: v.games }))
  .filter(g => g.hours > 0)
  .sort((a, b) => b.hours - a.hours);

const axes = genres.slice(0, AXES);
const rest = genres.slice(AXES);

const recent = (await recentGames())
  .filter(r => kept.some(k => k.game.appid === r.appid))
  .slice(0, 3)
  .map(r => ({ name: r.name, hours2w: Math.round(num(r.playtime_2weeks, 0) / 60 * 10) / 10 }));

const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  totals: {
    games: kept.length,
    hours: Math.round(totalMinutes / 60),
    excluded: dropped.length
  },
  axes,                                   /* 방사형 그래프 축 (시간 많은 순) */
  restHours: rest.reduce((s, g) => s + g.hours, 0),
  restGenres: rest.length,
  top: kept.slice(0, TOP_COUNT).map(({ game, info }) => ({
    appid: game.appid,
    name: game.name || info.name,
    hours: Math.round(num(game.playtime_forever, 0) / 60),
    genres: info.genres.filter(id => !EXCLUDE_GENRES.includes(id) && !SOFTWARE_GENRES.includes(id))
  })),
  recent
};

/* content.js · overrides.js 처럼 '읽어서 전역에 담는' 파일로 씁니다 (fetch 없이 바로 읽히도록) */
const banner = '/* 스팀 플레이 기록 — tools/steam-sync.mjs 가 자동으로 씁니다. 직접 고치지 마세요.\n' +
  '   무엇을 넣고 뺄지는 assets/content.js 의 play.steam 에서 정합니다. */\n';
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, banner + 'window.PORTFOLIO_STEAM = ' + JSON.stringify(out, null, 2) + ';\n');
fs.writeFileSync(CACHE, JSON.stringify(cache, null, 0) + '\n');

/* ── 사람이 보는 실행 기록 — 여기서 appid 를 보고 exclude 에 적으면 됩니다 ── */
console.log('\n집계에 들어간 게임 ' + kept.length + '종 (상위 20)');
for (const { game } of kept.slice(0, 20)) {
  console.log('  ' + String(game.appid).padStart(8) + '  ' + Math.round(game.playtime_forever / 60) + 'h\t' + game.name);
}
if (dropped.length) {
  console.log('\n빠진 게임 ' + dropped.length + '종');
  for (const [g, reason] of dropped.slice(0, 30)) {
    console.log('  ' + String(g.appid).padStart(8) + '  ' + reason + '\t' + (reason === '성인 콘텐츠 표시' || reason === '성인 장르' ? '(이름 생략)' : g.name));
  }
}
console.log('\n장르 축: ' + axes.map(a => a.name + ' ' + a.hours + 'h').join(' · '));
console.log('새로 받은 상점 정보 ' + fetched + '건 · 결과: ' + path.relative(ROOT, OUT));
