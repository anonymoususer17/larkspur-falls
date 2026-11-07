import {
  CATEGORIES, CHAR_IDS, TRAITS, TRAIT_LABEL, TRAIT_MAX,
  type Category, type CharId, type ClueDef, type CrisisState, type EndingResult,
  type FoundClue, type GameState, type LocId, type Slot, type Trait, type Weather,
} from './types';
import { hash01, mulberry32, pick, shuffle } from './rng';
import { CHARS } from './data/characters';
import { LOCATIONS, LOC_IDS } from './data/locations';
import { subjectFor, type Question } from './data/classes';
import { DREAMS, ELIMS, LORE, OPTIONS, POINTERS, SCENARIOS } from './data/mystery';
import { HEADLINES, isWeekend } from './data/flavor';

export const DAYS = 14;
const SAVE_KEY = 'larkspur.save.v2';
const META_KEY = 'larkspur.meta.v1';

// ---------------------------------------------------------------- creation

export function newGame(seed = Math.floor(Math.random() * 2 ** 31)): GameState {
  const rnd = mulberry32(seed);
  const scenario = Math.floor(rnd() * SCENARIOS.length);
  const sc = SCENARIOS[scenario];

  // crises: 3 random characters on distinct days 4..11
  const crisisChars = shuffle(CHAR_IDS, rnd).slice(0, 3);
  const crisisDays = shuffle([4, 5, 6, 7, 8, 9, 10, 11], rnd).slice(0, 3);
  const crises: CrisisState[] = crisisChars.map((c, i) => ({
    char: c, day: crisisDays[i], slot: CHARS[c].crisis.slot, loc: CHARS[c].crisis.loc,
  }));

  // weather
  const weather: Weather[] = [];
  for (let d = 0; d < DAYS; d++) {
    const r = rnd();
    weather.push(r < 0.5 ? 'clear' : r < 0.75 ? 'rain' : 'fog');
  }
  weather[0] = 'clear';
  weather[DAYS - 1] = 'clear';
  for (const c of crises) {
    if (c.char === 'ida') weather[c.day] = 'fog';
    else if (weather[c.day] === 'rain' && (c.loc === 'falls' || c.loc === 'woods')) weather[c.day] = 'clear';
  }

  // clues
  const answer: Record<Category, string> = { who: sc.who, where: sc.where, why: sc.why };
  const pointers: ClueDef[] = [];
  const elims: ClueDef[] = [];
  for (const cat of CATEGORIES) {
    POINTERS[answer[cat]].forEach((text, i) =>
      pointers.push({ id: `p:${answer[cat]}:${i}`, text, kind: 'point', cat, opt: answer[cat] }));
    for (const o of OPTIONS[cat]) {
      if (o.id !== answer[cat]) elims.push({ id: `e:${o.id}`, text: ELIMS[o.id], kind: 'elim', cat, opt: o.id });
    }
  }
  const lore: ClueDef[] = LORE.map((text, i) => ({ id: `l:${i}`, text, kind: 'lore' }));

  const hard = shuffle([
    ...crises.map((c) => `crisis:${c.char}`),
    ...CHAR_IDS.map((c) => `rank4:${c}`),
  ], rnd);
  const easy = shuffle([
    ...CHAR_IDS.map((c) => `rank2:${c}`),
    ...LOC_IDS.map((l) => `inv:${l}`),
  ], rnd);

  const P = shuffle(pointers, rnd); // 12
  const E = shuffle(elims, rnd);    // 12
  const L = shuffle(lore, rnd);
  const sources: Record<string, ClueDef> = {};
  // hard sources (9): 7 pointers + 2 elims ; easy (17): 5 pointers + 10 elims + 2 lore
  hard.forEach((src, i) => { sources[src] = i < 7 ? P.shift()! : E.shift()!; });
  const easyPool = shuffle([...P, ...E, ...L.slice(0, easy.length - P.length - E.length)], rnd);
  easy.forEach((src, i) => { sources[src] = easyPool[i]; });

  const headlines = shuffle(HEADLINES.map((_, i) => i), rnd).slice(0, DAYS);

  const chars = {} as GameState['chars'];
  for (const c of CHAR_IDS) chars[c] = { rank: 0, trust: 0, lost: false, saved: false, withheld: false };

  return {
    version: 2, seed, scenario, day: 0, slot: 0,
    traits: { nerve: 0, empathy: 0, insight: 0, charm: 0 },
    fatigue: 0, coffeeDay: -1, chars, weather, sources, found: [], done: [], crises,
    dreamCats: [], marks: {}, headlines, phase: 'play',
    stats: { actions: 0, dreams: 0, overslept: 0 },
  };
}

export function answerOf(s: GameState): Record<Category, string> {
  const sc = SCENARIOS[s.scenario];
  return { who: sc.who, where: sc.where, why: sc.why };
}

// ---------------------------------------------------------------- queries

export const weatherNow = (s: GameState): Weather => s.weather[s.day];

export function crisisFor(s: GameState, c: CharId): CrisisState | undefined {
  return s.crises.find((x) => x.char === c);
}

export function todaysCrisis(s: GameState): CrisisState | undefined {
  return s.crises.find((c) => c.day === s.day && !c.outcome);
}

export function locOpen(s: GameState, loc: LocId, day = s.day, slot: Slot = s.slot): { open: boolean; reason?: string } {
  const L = LOCATIONS[loc];
  const we = isWeekend(day);
  if (!we && slot === 0 && loc !== 'school') return { open: false, reason: 'You\'re due in class.' };
  const slots = we ? L.we : L.wk;
  if (!slots.includes(slot)) {
    if (loc === 'school') return { open: false, reason: we ? 'Closed for the weekend.' : 'School\'s out.' };
    return { open: false, reason: slot === 2 ? 'Closed at night.' : 'Not open right now.' };
  }
  if (loc === 'woods' && s.weather[day] === 'rain') return { open: false, reason: 'Trail closed: mudslide warning.' };
  return { open: true };
}

export function charLocation(s: GameState, c: CharId, day = s.day, slot: Slot = s.slot): LocId | null {
  const st = s.chars[c];
  if (st.lost) return null;
  const cr = crisisFor(s, c);
  if (cr && cr.day === day) {
    if (cr.outcome) return null;
    return cr.slot === slot ? cr.loc : null;
  }
  const w = s.weather[day];
  if (c === 'ida' && w === 'fog') return 'lake';
  const def = CHARS[c];
  const opts = (isWeekend(day) ? def.sched.we : def.sched.wk)[slot];
  const idx = CHAR_IDS.indexOf(c);
  let loc = opts[Math.floor(hash01(s.seed, day, slot, idx) * opts.length)];
  if (loc && w === 'rain' && LOCATIONS[loc].outdoor) {
    loc = opts.find((o) => o && !LOCATIONS[o].outdoor) ?? null;
  }
  if (loc && !locOpen(s, loc, day, slot).open) return null;
  return loc;
}

export function charsAt(s: GameState, loc: LocId): CharId[] {
  return CHAR_IDS.filter((c) => charLocation(s, c) === loc);
}

/** Scene 3 and 4 need the first trait at 2/3; scene 5 needs the second trait at 4. */
export function gateFor(c: CharId, idx: number): [Trait, number] | undefined {
  const g = CHARS[c].gates;
  if (idx === 2) return [g[2]![0], 2];
  if (idx === 3) return [g[2]![0], 3];
  if (idx === 4) return [g[4]![0], 4];
  return undefined;
}

export function sceneGate(s: GameState, c: CharId): { ok: boolean; reason?: string; maxed: boolean } {
  const st = s.chars[c];
  if (st.rank >= 5) return { ok: true, maxed: true };
  const g = gateFor(c, st.rank);
  if (g && s.traits[g[0]] < g[1]) {
    return { ok: false, maxed: false, reason: `Needs ${TRAIT_LABEL[g[0]]} ${g[1]}` };
  }
  return { ok: true, maxed: false };
}

export function invStatus(s: GameState, loc: LocId): { ok: boolean; done: boolean; reason?: string } {
  const inv = LOCATIONS[loc].inv;
  if (s.done.includes(loc)) return { ok: false, done: true };
  if (!inv.slots.includes(s.slot)) return { ok: false, done: false, reason: 'Not at this time of day.' };
  if (inv.noRain && weatherNow(s) === 'rain') return { ok: false, done: false, reason: 'Too dangerous in the rain.' };
  const r = inv.req;
  if (r.trait && s.traits[r.trait] < (r.level ?? 0)) return { ok: false, done: false, reason: `Needs ${TRAIT_LABEL[r.trait]} ${r.level}` };
  if (r.char && s.chars[r.char].rank < (r.rank ?? 0)) return { ok: false, done: false, reason: `Needs bond with ${CHARS[r.char].short} (rank ${r.rank})` };
  if (r.char && s.chars[r.char].lost) return { ok: false, done: false, reason: `${CHARS[r.char].short} is gone.` };
  return { ok: true, done: false };
}

export function activityGain(s: GameState, actId: string, loc: LocId): { trait?: Trait; n: number } {
  const a = LOCATIONS[loc].activities.find((x) => x.id === actId)!;
  if (a.special === 'class') {
    return { trait: subjectFor(s.day).trait, n: 1 };
  }
  if (!a.trait) return { n: 0 };
  return { trait: a.trait, n: (a.gain ?? 1) + (a.bonus && a.bonus === weatherNow(s) ? 1 : 0) };
}

// ---------------------------------------------------------------- mutations

function gainTrait(s: GameState, t: Trait, n: number): number {
  const before = s.traits[t];
  s.traits[t] = Math.min(TRAIT_MAX, before + n);
  return s.traits[t] - before;
}

function sourceLabel(src: string): string {
  const [kind, id] = src.split(':');
  if (kind === 'inv') return LOCATIONS[id as LocId].inv.label;
  if (kind === 'dream') return 'A dream';
  return CHARS[id as CharId].short;
}

function reveal(s: GameState, src: string): FoundClue | undefined {
  const def = s.sources[src];
  if (!def || s.found.some((f) => f.id === def.id)) return undefined;
  const fc: FoundClue = { ...def, source: sourceLabel(src), day: s.day };
  s.found.push(fc);
  return fc;
}

export interface ActionResult {
  lines: string[];
  gains: string[];
  clue?: FoundClue;
}

function coffee(s: GameState, loc: LocId, out: ActionResult) {
  if (loc === 'diner' && s.coffeeDay !== s.day && s.fatigue > 0) {
    s.coffeeDay = s.day;
    s.fatigue--;
    out.gains.push('Coffee: −1 sleep debt');
  }
}

export function doActivity(s: GameState, loc: LocId, actId: string): ActionResult {
  const a = LOCATIONS[loc].activities.find((x) => x.id === actId)!;
  const out: ActionResult = { lines: [], gains: [] };
  const rnd = mulberry32(s.seed + s.day * 31 + s.slot * 7 + s.stats.actions);
  if (a.special === 'sleep') {
    out.lines.push(pick(a.flavor, rnd));
    s.fatigue = 0;
    s.flagSleep = true;
    out.gains.push('Sleep debt cleared');
    return out;
  }
  out.lines.push(pick(a.flavor, rnd));
  const g = activityGain(s, actId, loc);
  if (g.trait) {
    const got = gainTrait(s, g.trait, g.n);
    out.gains.push(got > 0 ? `${TRAIT_LABEL[g.trait]} +${got}` : `${TRAIT_LABEL[g.trait]} is maxed`);
  }
  if (a.fatigue) { s.fatigue += a.fatigue; out.gains.push(`Sleep debt +${a.fatigue}`); }
  coffee(s, loc, out);
  return out;
}

export function doInvestigation(s: GameState, loc: LocId): ActionResult {
  const out: ActionResult = { lines: [LOCATIONS[loc].inv.flavor], gains: [] };
  s.done.push(loc);
  out.clue = reveal(s, `inv:${loc}`);
  coffee(s, loc, out);
  return out;
}

export function doHangoutMaxed(s: GameState, c: CharId, loc: LocId): ActionResult {
  const out: ActionResult = { lines: [], gains: [] };
  const t = CHARS[c].trait;
  const got = gainTrait(s, t, 1);
  out.gains.push(got > 0 ? `${TRAIT_LABEL[t]} +${got}` : 'A quiet, good hour');
  coffee(s, loc, out);
  return out;
}


export interface ChoiceResult {
  gains: string[];
  clue?: FoundClue;
  withheld?: boolean;
  newRank: number;
  stalled: boolean;
}

/**
 * q=2: rank up and trust +2.  q=1: rank up, trust unchanged.
 * q=0: no progress, trust -1, and the same scene comes back next time.
 */
export function applyChoice(s: GameState, c: CharId, q: number, loc: LocId): ChoiceResult {
  const st = s.chars[c];
  const res: ChoiceResult = { gains: [], newRank: st.rank, stalled: false };
  if (q === 0) {
    st.trust = Math.max(0, st.trust - 1);
    res.stalled = true;
    res.gains.push('Trust ▼', 'No progress');
  } else {
    if (q === 2) { st.trust += 2; res.gains.push('Trust ▲'); }
    st.rank = Math.min(5, st.rank + 1);
    res.newRank = st.rank;
    if (st.rank === 3) {
      const t = CHARS[c].trait;
      const got = gainTrait(s, t, 1);
      if (got) res.gains.push(`${TRAIT_LABEL[t]} +${got}`);
    }
    if (st.rank === 2) res.clue = reveal(s, `rank2:${c}`);
    if (st.rank === 4) {
      if (st.trust >= 4) res.clue = reveal(s, `rank4:${c}`);
      else { st.withheld = true; res.withheld = true; }
    }
    if (st.rank === 5 && st.withheld && st.trust >= 6) {
      st.withheld = false;
      res.clue = reveal(s, `rank4:${c}`);
    }
  }
  const out: ActionResult = { lines: [], gains: [] };
  coffee(s, loc, out);
  res.gains.push(...out.gains);
  return res;
}

/** Today's class question (stable for the day, never repeated within a run). */
export function classQuestion(s: GameState): Question {
  const sub = subjectFor(s.day);
  const used = s.usedQ ?? [];
  const pool = sub.qs.filter((q) => !used.includes(q.id));
  const list = pool.length ? pool : sub.qs;
  return list[Math.floor(hash01(s.seed, s.day, 991) * list.length)];
}

export function answerClass(s: GameState, q: Question, correct: boolean): string[] {
  s.usedQ = [...(s.usedQ ?? []), q.id];
  if (!correct) return ['No gain'];
  const t = subjectFor(s.day).trait;
  const got = gainTrait(s, t, 1);
  return [got ? `${TRAIT_LABEL[t]} +${got}` : `${TRAIT_LABEL[t]} is maxed`];
}

export function resolveCrisis(s: GameState, c: CharId): { outcome: 'saved' | 'cold'; clue?: FoundClue } {
  const cr = crisisFor(s, c)!;
  const st = s.chars[c];
  if (st.rank >= 3 || st.trust >= 5) {
    cr.outcome = 'saved';
    st.saved = true;
    st.trust += 3;
    return { outcome: 'saved', clue: reveal(s, `crisis:${c}`) };
  }
  cr.outcome = 'cold';
  return { outcome: 'cold' };
}

export interface DayStart {
  newDay: boolean;
  dream?: FoundClue;
  overslept: boolean;
  missed: CharId[];
  finale: boolean;
}

/** Advance one time slot after an action. */
export function endSlot(s: GameState): DayStart {
  s.stats.actions++;
  const res: DayStart = { newDay: false, overslept: false, missed: [], finale: false };
  const slept = !!s.flagSleep;
  delete s.flagSleep;
  if (s.slot === 2 && !slept) s.fatigue++;

  // missed crises
  for (const cr of s.crises) {
    if (!cr.outcome && cr.day === s.day && cr.slot === s.slot) {
      cr.outcome = 'missed';
      s.chars[cr.char].lost = true;
      res.missed.push(cr.char);
    }
  }

  if (s.slot < 2) {
    s.slot = (s.slot + 1) as Slot;
    // Last day: the afternoon is the final action; night is the Bonfire.
    if (s.day === DAYS - 1 && s.slot === 2) res.finale = true;
    return res;
  }

  // night -> dream check
  const rnd = mulberry32(s.seed ^ (s.day * 9973));
  const idaBonus = s.chars.ida.rank >= 2 && !s.chars.ida.lost ? 0.15 : 0;
  const p = slept ? 0.3 + s.traits.insight * 0.06 + idaBonus : 0.03 + s.traits.insight * 0.015 + idaBonus / 4;
  const remaining = CATEGORIES.filter((c) => !s.dreamCats.includes(c));
  if (remaining.length && rnd() < p) {
    const cat = pick(remaining, rnd);
    const ans = answerOf(s)[cat];
    s.dreamCats.push(cat);
    s.stats.dreams++;
    const fc: FoundClue = { id: `d:${cat}`, text: DREAMS[ans], kind: 'dream', cat, opt: ans, source: 'A dream', day: s.day };
    s.found.push(fc);
    res.dream = fc;
  }

  s.day++;
  s.slot = 0;
  res.newDay = true;
  if (s.fatigue >= 3) {
    res.overslept = true;
    s.stats.overslept++;
    s.fatigue = 1;
    s.slot = 1;
    // a morning crisis can't exist, so nothing else to resolve
  }
  return res;
}

// ---------------------------------------------------------------- ending

export function allies(s: GameState): CharId[] {
  return CHAR_IDS.filter((c) => !s.chars[c].lost && (s.chars[c].rank >= 4 || s.chars[c].saved));
}

export function computeEnding(s: GameState, picks: Record<Category, string>): EndingResult {
  const ans = answerOf(s);
  const correct = { who: picks.who === ans.who, where: picks.where === ans.where, why: picks.why === ans.why };
  const al = allies(s);
  const backed = al.length >= 3 || (al.length >= 2 && s.traits.nerve >= 4);
  const found = correct.where && backed;
  let tier: EndingResult['tier'];
  if (found && correct.who && correct.why) tier = 'daybreak';
  else if (found) tier = 'unfinished';
  else if (correct.where) tier = 'almost';
  else tier = 'embers';
  const r: EndingResult = { picks, correct, found, tier, allies: al };
  s.ending = r;
  s.phase = 'ended';
  recordMeta(s, r);
  return r;
}

// ---------------------------------------------------------------- persistence

export function save(s: GameState) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
export function load(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    return s.version === 2 && s.phase === 'play' ? s : null;
  } catch { return null; }
}
export function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
}

export interface Meta { runs: number; tiers: string[]; solved: number[]; seen: number[] }
export function loadMeta(): Meta {
  try {
    const m = JSON.parse(localStorage.getItem(META_KEY) || 'null');
    if (m) return { runs: m.runs ?? 0, tiers: m.tiers ?? [], solved: m.solved ?? [], seen: m.seen ?? [] };
  } catch { /* ignore */ }
  return { runs: 0, tiers: [], solved: [], seen: [] };
}
function recordMeta(s: GameState, r: EndingResult) {
  const m = loadMeta();
  m.runs++;
  if (!m.tiers.includes(r.tier)) m.tiers.push(r.tier);
  if (!m.seen.includes(s.scenario)) m.seen.push(s.scenario);
  if (r.tier === 'daybreak' && !m.solved.includes(s.scenario)) m.solved.push(s.scenario);
  try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch { /* ignore */ }
}

export { TRAITS };
