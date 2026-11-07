import {
  CATEGORIES, CHAR_IDS, TRAITS, TRAIT_LABEL, TRAIT_MAX,
  type Category, type CharId, type FoundClue, type GameState, type LocId, type Slot,
} from '../types';
import {
  DAYS, activityGain, allies, answerOf, applyChoice, charsAt, clearSave, computeEnding,
  doActivity, doHangoutMaxed, doInvestigation, endSlot, invStatus, load, loadMeta, locOpen,
  newGame, resolveCrisis, save, sceneGate, todaysCrisis, weatherNow, classQuestion, answerClass, type DayStart,
} from '../engine';
import { CHARS } from '../data/characters';
import { LOCATIONS, LOC_IDS } from '../data/locations';
import { subjectFor } from '../data/classes';
import { OPTIONS, QUESTIONS, SCENARIOS } from '../data/mystery';
import { HEADLINES, INTRO, dateLabel, dayName, isWeekend } from '../data/flavor';
import { scene } from '../art/scenes';
import { BOND, glyph, wxIcon } from '../art/glyphs';
import { mulberry32, shuffle } from '../rng';
import { audioOn, setNight, sfx, startAudio, toggleAudio } from '../audio';

// ------------------------------------------------------------------ helpers

const BASE = import.meta.env.BASE_URL;
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const paras = (t: string) => t.split('\n\n').map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
const opt = (cat: Category, id: string) => OPTIONS[cat].find((o) => o.id === id)!;
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null;

type Expr = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'sly';
type Who = CharId | 'odessa';
const sprite = (id: Who, e: Expr = 'neutral', cls = '') =>
  `<img class="sprite ${cls}" src="${BASE}sprites/${id}_${e}.webp" alt="" draggable="false">`;
const face = (id: Who, e: Expr = 'neutral') =>
  `<span class="face" style="--c:${id === 'odessa' ? '#8aa' : CHARS[id].color}"><img src="${BASE}sprites/${id}_${e}.webp" alt=""></span>`;

function slotLabel(day: number, slot: Slot): string {
  if (slot === 0) return 'Morning';
  if (slot === 1) return isWeekend(day) ? 'Daytime' : 'After School';
  return 'Evening';
}

interface Choice { label: string; pick: () => Page[] }
interface Page {
  who?: Who;
  expr?: Expr;
  name?: string;
  tag?: string;
  text: string;
  choices?: Choice[];
  gains?: string[];
  clue?: FoundClue;
  style?: 'dream' | 'news' | 'narr' | 'rank';
  rank?: { char: CharId; rank: number };
}

// ------------------------------------------------------------------ state

let root: HTMLElement;
let g: GameState | null = null;
let screen: 'title' | 'town' | 'loc' | 'finale' | 'ending' = 'title';
let here: LocId | null = null;
let hover: LocId | null = null;
let overlay: 'none' | 'calendar' | 'menu' | 'howto' = 'none';
let menuTab: 'clues' | 'board' | 'bonds' = 'clues';
let lastDayStart: DayStart | null = null;
let queue: Page[] = [];
let onQueueDone: (() => void) | null = null;
let lastWho: Who | null | undefined;
let typing: { el: HTMLElement; full: string; t: number } | null = null;
let finalePicks: Partial<Record<Category, string>> = {};
let focusIdx = 0;
let bgKey = '';

export function mount(el: HTMLElement) {
  root = el;
  root.innerHTML = '<div id="bg"></div><div id="stage"></div><div id="ov"></div><div id="toasts"></div>';
  root.addEventListener('click', onClick);
  root.addEventListener('mouseover', onHover);
  document.addEventListener('keydown', onKey);
  for (const c of [...CHAR_IDS, 'odessa'] as Who[]) for (const e of ['neutral', 'happy', 'sad', 'angry', 'surprised', 'sly']) {
    const i = new Image(); i.src = `${BASE}sprites/${c}_${e}.webp`;
  }
  render();
}

// ------------------------------------------------------------------ backdrop

function setBg(loc: LocId, slot: Slot, w: GameState['weather'][number], extra = '') {
  const key = `${loc}${slot}${w}${extra}`;
  if (key === bgKey) return;
  bgKey = key;
  const bg = $('#bg')!;
  const layer = document.createElement('div');
  layer.className = `bg-layer ${extra}`;
  layer.innerHTML = scene(loc, slot, w);
  bg.appendChild(layer);
  requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add('in')));
  const old = [...bg.children].slice(0, -1);
  setTimeout(() => old.forEach((o) => o.remove()), 700);
}

// ------------------------------------------------------------------ render

function render() {
  const stage = $('#stage')!;
  const ov = $('#ov')!;
  stage.className = `stage s-${screen}`;
  if (screen === 'title') { stage.innerHTML = titleView(); setBg('falls', 2, 'fog', 'dim'); }
  else if (screen === 'town') { stage.innerHTML = hud() + townView(); }
  else if (screen === 'loc') { stage.innerHTML = hud() + locView(); }
  else if (screen === 'finale') { stage.innerHTML = finaleView(); setBg('woods', 2, 'clear', 'fire'); }
  else if (screen === 'ending') { stage.innerHTML = endingView(); }

  if (queue.length) { ov.innerHTML = dialogView(queue[0]); afterDialogRender(queue[0]); }
  else if (overlay === 'calendar') ov.innerHTML = calendarView();
  else if (overlay === 'menu') ov.innerHTML = menuView();
  else if (overlay === 'howto') ov.innerHTML = howToView();
  else ov.innerHTML = '';
  document.body.classList.toggle('busy', queue.length > 0 || overlay === 'calendar');
  if (g) setNight(g.slot === 2);
}

// ------------------------------------------------------------------ title

function titleView(): string {
  const saved = load();
  const meta = loadMeta();
  return `<div class="title">
    <div class="title-odessa">${sprite('odessa', 'neutral')}<div class="missing">MISSING<span>Odessa Vale · 16</span></div></div>
    <div class="title-main">
      <div class="title-kicker">October 1990 · Larkspur Falls, Oregon</div>
      <h1><span>Larkspur</span><span>Falls</span></h1>
      <p class="title-tag">Fourteen days until the Bonfire.</p>
      <nav class="title-menu">
        ${saved ? `<button class="tm" data-a="continue"><b>Continue</b><em>Day ${saved.day + 1}</em></button>` : ''}
        <button class="tm" data-a="new"><b>${saved ? 'New Game' : 'Begin'}</b>${saved ? '<em>abandons current run</em>' : ''}</button>
        <button class="tm" data-a="howto"><b>How to Play</b></button>
      </nav>
      ${meta.runs ? `<div class="title-meta"><span>Runs ${meta.runs}</span><span>Truths ${meta.solved.length}/${SCENARIOS.length}</span>
        <div class="truths">${SCENARIOS.map((s, i) => `<i class="${meta.solved.includes(i) ? 'on' : meta.seen.includes(i) ? 'seen' : ''}">${meta.solved.includes(i) ? esc(s.title) : '?'}</i>`).join('')}</div></div>` : ''}
    </div>
    <div class="credit">Character art by Sutemo</div>
  </div>`;
}

function howToView(): string {
  return `<div class="scrim"><div class="sheet howto">
    <div class="sheet-head"><h2>How to Play</h2></div>
    <ol>
      <li><b>Three slots a day.</b> Morning, after school and evening. Everything you do uses one, and on weekday mornings you're in class.</li>
      <li><b>Bonds.</b> Spend time with people to move their story forward. Later scenes need trait levels. Your best answer raises the rank and builds trust. An okay answer raises the rank only. A bad answer means no progress, lost trust, and you'll have to try that conversation again.</li><li><b>Class.</b> On weekday mornings the teacher gives a pop quiz. A right answer raises that subject's trait, and a wrong one earns nothing.</li>
      <li><b>Crises.</b> Some mornings you'll get a warning. If you aren't at the right place at the right time, that person is gone for the rest of the run.</li>
      <li><b>Sleep.</b> Every night out adds sleep debt, and at 3 you'll sleep through a morning. Coffee helps, and turning in early clears it. You dream more when you sleep well, and dreams always tell the truth.</li>
      <li><b>Bonfire night.</b> Name who she was running from, where she is, and why. People at bond rank 4, or anyone you helped through a crisis, will come with you. You'll want three.</li>
      <li><b>The truth changes every run.</b></li>
    </ol>
    <div class="keys"><span><kbd>↑↓</kbd> choose</span><span><kbd>Enter</kbd> confirm</span><span><kbd>Esc</kbd> back</span><span><kbd>N</kbd> notebook</span><span><kbd>B</kbd> bonds</span></div>
    <button class="btn-x primary" data-a="closeov">Got it</button>
  </div></div>`;
}

// ------------------------------------------------------------------ HUD

function hud(): string {
  const s = g!;
  const w = weatherNow(s);
  const sleep = Array.from({ length: 3 }, (_, i) => `<i class="${i < s.fatigue ? 'on' : ''}"></i>`).join('');
  const left = DAYS - 1 - s.day;
  return `<header class="hud">
    <div class="cal">
      <div class="cal-m">10<span>/</span></div><div class="cal-d">${17 + s.day}</div>
      <div class="cal-side"><div class="cal-dow">${dayName(s.day).slice(0, 3)}</div><div class="cal-wx w-${w}">${wxIcon(w)}</div></div>
      <div class="cal-slot">${slotLabel(s.day, s.slot)}</div>
    </div>
    <div class="cal-sub">${left > 0 ? `<b>${left}</b> day${left > 1 ? 's' : ''} until the Bonfire` : '<b>Bonfire tonight</b>'}</div>
    <div class="stats">
      ${TRAITS.map((t) => `<div class="stat t-${t}"><span>${TRAIT_LABEL[t]}</span><div class="lv">${Array.from({ length: TRAIT_MAX }, (_, i) => `<i class="${i < s.traits[t] ? 'on' : ''}"></i>`).join('')}</div></div>`).join('')}
      <div class="stat sleep" title="Sleep debt: at 3 you oversleep"><span>Sleep debt</span><div class="moons">${sleep}</div></div>
    </div>
    <nav class="hud-btns">
      <button data-a="menu" data-id="clues"><kbd>N</kbd>Notebook<b>${s.found.length}</b></button>
      <button data-a="menu" data-id="bonds"><kbd>B</kbd>Bonds</button>
      <button data-a="sound" class="snd" title="Music">${audioOn() ? '♪' : '—'}</button>
    </nav>
  </header>`;
}

// ------------------------------------------------------------------ town

function townLocs(): LocId[] {
  const s = g!;
  return [...LOC_IDS].sort((a, b) => Number(locOpen(s, b).open) - Number(locOpen(s, a).open));
}

function townView(): string {
  const s = g!;
  const crisis = todaysCrisis(s);
  const locs = townLocs();
  if (focusIdx >= locs.length) focusIdx = 0;
  const cur = hover ?? locs[focusIdx];
  setBg(cur, s.slot, weatherNow(s));
  const items = locs.map((id, i) => {
    const L = LOCATIONS[id];
    const o = locOpen(s, id);
    const ppl = o.open ? charsAt(s, id) : [];
    const isCrisis = crisis && crisis.loc === id && crisis.slot === s.slot && o.open;
    const lead = o.open && invStatus(s, id).ok;
    return `<button class="tli ${o.open ? '' : 'closed'} ${id === cur ? 'focus' : ''} ${isCrisis ? 'crisis' : ''}" data-a="go" data-id="${id}" data-i="${i}" style="--i:${i}">
      <span class="tli-name">${esc(L.name)}</span>
      <span class="tli-meta">${isCrisis ? '<em class="tag crisis">Crisis</em>' : ''}${lead ? '<em class="tag lead">Lead</em>' : ''}${ppl.map((c) => face(c)).join('')}${o.open ? '' : `<em class="tag closed">${esc(o.reason ?? 'Closed')}</em>`}</span>
    </button>`;
  }).join('');
  return `<div class="town">
    <div class="town-info">${townInfo(cur)}</div>
    <nav class="town-list"><div class="tl-head"><span>${slotLabel(s.day, s.slot)}</span>Where to?</div>${items}</nav>
    ${crisis ? `<div class="crisis-strip">${face(crisis.char, 'sad')}<div><b>${esc(CHARS[crisis.char].short)} needs you</b><span>${esc(LOCATIONS[crisis.loc].name)} · ${slotLabel(crisis.day, crisis.slot)}</span></div></div>` : ''}
  </div>`;
}

function townInfo(id: LocId): string {
  const s = g!;
  const L = LOCATIONS[id];
  const o = locOpen(s, id);
  const ppl = o.open ? charsAt(s, id) : [];
  return `<div class="ti">
    <div class="ti-kicker ${o.open ? '' : 'shut'}">${o.open ? 'Open' : esc(o.reason ?? 'Closed')}</div>
    <h1 class="ti-name">${esc(L.name)}</h1>
    <p class="ti-desc">${esc(L.desc)}</p>
    ${ppl.length ? `<div class="ti-ppl">${ppl.map((c) => `<div class="ti-p">${face(c)}<div><b>${esc(CHARS[c].short)}</b><i>${'◆'.repeat(s.chars[c].rank)}${'◇'.repeat(5 - s.chars[c].rank)}</i></div></div>`).join('')}</div>` : ''}
  </div>`;
}

// ------------------------------------------------------------------ location

interface Cmd { a: string; id?: string; label: string; sub: string; ok: boolean; cls?: string }

function locCmds(id: LocId): Cmd[] {
  const s = g!;
  const L = LOCATIONS[id];
  const cmds: Cmd[] = [];
  const crisis = todaysCrisis(s);
  for (const c of charsAt(s, id)) {
    if (crisis && crisis.char === c && crisis.slot === s.slot && crisis.loc === id) {
      cmds.push({ a: 'crisis', id: c, label: `Go to ${CHARS[c].short}`, sub: 'Something is wrong', ok: true, cls: 'danger' });
      continue;
    }
    const gate = sceneGate(s, c);
    const r = s.chars[c].rank;
    cmds.push({ a: 'hang', id: c, label: gate.maxed ? `Hang out with ${CHARS[c].short}` : `Spend time with ${CHARS[c].short}`,
      sub: gate.ok ? (gate.maxed ? 'Bond complete' : `Rank ${r} → ${r + 1}`) : gate.reason!, ok: gate.ok, cls: 'bond' });
  }
  for (const a of L.activities.filter((x) => x.slots.includes(s.slot))) {
    const gn = activityGain(s, a.id, id);
    let sub = a.special === 'sleep' ? 'Clears sleep debt · more dreams' : gn.trait ? `${TRAIT_LABEL[gn.trait]} +${gn.n}` : '';
    if (a.special === 'class') { const sj = subjectFor(s.day); sub = `${sj.name} · pop quiz · ${TRAIT_LABEL[sj.trait]} +1 if you're right`; }
    if (a.fatigue) sub += ' · tiring';
    cmds.push({ a: 'act', id: a.id, label: a.label, sub, ok: true });
  }
  const inv = invStatus(s, id);
  cmds.push({ a: 'inv', label: L.inv.label, sub: inv.done ? 'Already searched' : inv.ok ? 'Investigate' : inv.reason ?? '', ok: inv.ok, cls: 'lead' });
  const forced = !isWeekend(s.day) && s.slot === 0;
  if (!forced) cmds.push({ a: 'leave', label: 'Back to town', sub: '', ok: true, cls: 'back' });
  return cmds;
}

function locView(): string {
  const s = g!;
  const id = here!;
  const L = LOCATIONS[id];
  setBg(id, s.slot, weatherNow(s));
  const crisis = todaysCrisis(s);
  const ppl = charsAt(s, id);
  const cmds = locCmds(id);
  if (focusIdx >= cmds.length) focusIdx = 0;
  const sprites = ppl.map((c, i) => {
    const isCrisis = crisis && crisis.char === c && crisis.slot === s.slot && crisis.loc === id;
    return `<button class="ls ${isCrisis ? 'crisis' : ''}" data-a="${isCrisis ? 'crisis' : 'hang'}" data-id="${c}" style="--d:${i * 0.08}s">
      ${sprite(c, isCrisis ? 'sad' : 'neutral')}<span class="ls-name">${esc(CHARS[c].short)}</span></button>`;
  }).join('');
  return `<div class="loc">
    <div class="loc-title"><span>${slotLabel(s.day, s.slot)}</span><h1>${esc(L.name)}</h1><p>${esc(L.desc)}</p></div>
    <div class="loc-sprites n${ppl.length}">${sprites}</div>
    <nav class="cmd">
      ${cmds.map((c, i) => `<button class="cmd-i ${c.cls ?? ''} ${c.ok ? '' : 'off'} ${i === focusIdx ? 'focus' : ''}" data-a="${c.ok ? c.a : 'nope'}" data-id="${c.id ?? ''}" data-i="${i}" style="--i:${i}">
        <b>${esc(c.label)}</b>${c.sub ? `<em>${esc(c.sub)}</em>` : ''}</button>`).join('')}
    </nav>
  </div>`;
}

// ------------------------------------------------------------------ dialog

function dialogView(p: Page): string {
  if (p.style === 'rank' && p.rank) return rankView(p.rank.char, p.rank.rank);
  const who = p.who;
  const name = p.name ?? (who ? (who === 'odessa' ? 'Odessa' : CHARS[who].short) : '');
  const enter = who !== lastWho;
  lastWho = who ?? null;
  const color = who && who !== 'odessa' ? CHARS[who].color : '#c8323e';
  const clue = p.clue ? `<div class="clue-pop k-${p.clue.kind}"><div class="cp-head">${p.clue.kind === 'dream' ? 'Dream recorded' : 'New clue'}</div><div class="cp-body">${esc(p.clue.text)}</div><div class="cp-src">${esc(p.clue.source)}</div></div>` : '';
  const choices = p.choices ? `<div class="choices">${p.choices.map((c, i) => `<button class="ch" data-a="choose" data-id="${i}" style="--i:${i}"><span>${i + 1}</span>${esc(c.label)}</button>`).join('')}</div>` : '';
  return `<div class="dlg st-${p.style ?? 'talk'} ${who ? 'has-sprite' : ''}" data-a="advance" style="--c:${color}">
    ${who ? `<div class="dlg-sprite ${enter ? 'enter' : ''}">${sprite(who, p.expr ?? 'neutral')}</div>` : ''}
    ${clue}
    <div class="dlg-box">
      ${name || p.tag ? `<div class="plate"><b>${esc(name)}</b>${p.tag ? `<em>${esc(p.tag)}</em>` : ''}</div>` : ''}
      <div class="dlg-text" id="dtext"></div>
      ${p.gains?.length ? `<div class="gain-row">${p.gains.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
      <div class="dlg-next">${p.choices ? '' : '▼'}</div>
    </div>
    ${choices}
  </div>`;
}

function afterDialogRender(p: Page) {
  if (p.style === 'rank') { sfx.rank(); return; }
  const el = $('#dtext');
  if (!el) return;
  const box = $('.dlg-box'); const chs = $('.choices');
  if (box && chs) chs.style.bottom = `calc(3.5vh + ${box.offsetHeight + 40}px)`;
  if (typing) clearInterval(typing.t);
  const plain = p.text;
  const full = paras(plain);
  let i = 0;
  const speed = plain.length > 300 ? 3 : 2;
  el.classList.add('typing');
  const t = window.setInterval(() => {
    i += speed;
    if (i >= plain.length) { finishTyping(); return; }
    el.innerHTML = paras(plain.slice(0, i));
  }, 14);
  typing = { el, full, t };
  if (p.clue) sfx.clue();
  if (p.gains?.length) {
    sfx.stat();
    p.gains.forEach((x, k) => setTimeout(() => toast(x), 200 + k * 260));
  }
}

function finishTyping(): boolean {
  if (!typing) return false;
  clearInterval(typing.t);
  typing.el.innerHTML = typing.full;
  typing.el.classList.remove('typing');
  typing = null;
  $('.dlg')?.classList.add('done');
  return true;
}

function rankView(c: CharId, rank: number): string {
  const d = CHARS[c];
  const perk = rank === 4 ? 'Will stand with you on Bonfire night' : rank === 5 ? 'Bond complete' : rank === 2 ? 'Starting to open up' : rank === 3 ? `${TRAIT_LABEL[d.trait]} +1` : 'A new bond';
  return `<div class="rankup" data-a="advance" style="--c:${d.color}">
    <div class="ru-stripes"></div>
    <div class="ru-sprite">${sprite(c, 'happy')}</div>
    <div class="ru-card">
      <div class="ru-glyph">${glyph(c)}</div>
      <div class="ru-title">${esc(BOND[c].title)}</div>
      <div class="ru-name">${esc(d.name)}</div>
    </div>
    <div class="ru-text">
      <div class="ru-kicker">${rank === 1 ? 'Bond formed' : 'Bond deepened'}</div>
      <div class="ru-rank">RANK<b>${rank}</b></div>
      <div class="ru-pips">${Array.from({ length: 5 }, (_, i) => `<i class="${i < rank ? 'on' : ''}" style="--i:${i}"></i>`).join('')}</div>
      <div class="ru-perk">${esc(perk)}</div>
    </div>
  </div>`;
}

function toast(text: string) {
  const box = $('#toasts');
  if (!box) return;
  const t = document.createElement('div');
  const m = text.match(/^(Nerve|Empathy|Insight|Charm) \+(\d)/);
  t.className = `toast ${m ? 't-' + m[1].toLowerCase() : /▼|No /.test(text) ? 't-bad' : /▲/.test(text) ? 't-good' : ''}`;
  t.innerHTML = m ? `<b>${m[1]}</b><span>▲ ${m[2]}</span>` : esc(text);
  box.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function splash(text: string, sub = '') {
  const box = $('#toasts');
  if (!box) return;
  const t = document.createElement('div');
  t.className = 'splash';
  t.innerHTML = `<div class="sp-bar"></div><div class="sp-text">${esc(text)}<span>${esc(sub)}</span></div>`;
  box.appendChild(t);
  setTimeout(() => t.remove(), 1700);
}

// ------------------------------------------------------------------ calendar

function calendarView(): string {
  const s = g!;
  const ds = lastDayStart;
  const crisis = s.crises.find((c) => c.day === s.day && !c.outcome);
  const cells = [];
  for (let d = s.day - 3; d <= s.day + 3; d++) {
    if (d < 0 || d >= DAYS) { cells.push(`<div class="cw-cell void" style="--k:${d - s.day + 3}"></div>`); continue; }
    const known = d >= s.day && d <= s.day + 2;
    cells.push(`<div class="cw-cell ${d < s.day ? 'past' : d === s.day ? 'today' : ''} ${d === DAYS - 1 ? 'bonfire' : ''} ${isWeekend(d) ? 'we' : ''}" style="--k:${d - s.day + 3}">
      <span class="cw-dow">${dayName(d).slice(0, 3)}</span><span class="cw-num">${17 + d}</span>
      <span class="cw-wx">${known ? wxIcon(s.weather[d]) : d > s.day ? '<i>?</i>' : ''}</span>
      ${d === DAYS - 1 ? '<span class="cw-fire">Bonfire</span>' : ''}</div>`);
  }
  const left = DAYS - 1 - s.day;
  return `<div class="calov" data-a="closeov">
    <div class="co-bg"></div>
    <div class="co-month">October 1990</div>
    <div class="co-week">${cells.join('')}</div>
    <div class="co-left">${left > 0 ? `<b>${left}</b> day${left > 1 ? 's' : ''} left` : '<b>Bonfire</b> tonight'}</div>
    <div class="co-news">${esc(HEADLINES[s.headlines[s.day] ?? 0])}</div>
    ${ds?.overslept ? '<div class="co-warn">You slept through the morning.</div>' : ''}
    ${crisis ? `<div class="co-crisis">${face(crisis.char, 'sad')}<div><b>${esc(CHARS[crisis.char].short)}</b><p>${esc(CHARS[crisis.char].crisis.warn)}</p><span>${esc(LOCATIONS[crisis.loc].name)} · ${slotLabel(crisis.day, crisis.slot)}</span></div></div>` : ''}
    ${s.day === 0 ? '<div class="co-tip">Pick a place to go. Each choice uses up part of the day.</div>' : ''}
    <div class="co-go">Click to continue</div>
  </div>`;
}

// ------------------------------------------------------------------ menu

function menuView(): string {
  const s = g!;
  let body = '';
  if (menuTab === 'clues') {
    body = s.found.length
      ? `<ul class="clues">${s.found.slice().reverse().map((c) => `<li class="clue k-${c.kind}"><span>${esc(c.source)} · Day ${c.day + 1}</span>${esc(c.text)}</li>`).join('')}</ul>`
      : '<p class="empty">Nothing yet. Get close to people, follow leads, and sleep.</p>';
  } else if (menuTab === 'board') {
    body = `<p class="hint">Click a name to cycle: unmarked, ruled out, suspected.</p><div class="board">${board(s)}</div>`;
  } else {
    body = `<div class="bonds">${CHAR_IDS.map((c) => bondCard(s, c)).join('')}</div>`;
  }
  const tabs: [typeof menuTab, string][] = [['clues', 'Notebook'], ['board', 'Board'], ['bonds', 'Bonds']];
  return `<div class="menu">
    <nav class="menu-tabs">${tabs.map(([k, l]) => `<button class="${menuTab === k ? 'on' : ''}" data-a="tab" data-id="${k}">${l}</button>`).join('')}
      <button class="close" data-a="closeov">Close <kbd>Esc</kbd></button></nav>
    <div class="menu-body">${body}</div>
  </div>`;
}

function board(s: GameState, pickMode = false): string {
  return CATEGORIES.map((cat) => `<div class="bq"><h4>${QUESTIONS[cat]}</h4>
    ${OPTIONS[cat].map((o) => {
      const m = s.marks[`${cat}:${o.id}`] ?? 0;
      const on = pickMode && finalePicks[cat] === o.id;
      return `<button class="bo m${m} ${on ? 'picked' : ''}" data-a="${pickMode ? 'fpick' : 'mark'}" data-id="${cat}:${o.id}">${esc(pickMode ? o.label : o.short)}</button>`;
    }).join('')}</div>`).join('');
}

function bondCard(s: GameState, c: CharId): string {
  const d = CHARS[c];
  const st = s.chars[c];
  const gate = sceneGate(s, c);
  const locs = new Set<string>();
  [...d.sched.wk, ...d.sched.we].forEach((x) => x.forEach((l) => l && locs.add(LOCATIONS[l].name)));
  const status = st.lost ? 'Gone' : st.saved ? 'You were there' : st.rank >= 4 ? 'Will stand with you' : '';
  const next = st.lost ? '' : gate.maxed ? 'Bond complete' : gate.ok ? 'Ready for the next scene' : gate.reason;
  return `<div class="bc ${st.lost ? 'lost' : ''}" style="--c:${d.color}">
    <div class="bc-art">${sprite(c, st.lost ? 'sad' : st.rank >= 3 ? 'happy' : 'neutral')}</div>
    <div class="bc-info">
      <div class="bc-arc">${glyph(c)}<span>${esc(BOND[c].title)}</span></div>
      <h3>${esc(d.name)}</h3>
      <div class="bc-role">${esc(d.role)}</div>
      <div class="bc-rank">${Array.from({ length: 5 }, (_, i) => `<i class="${i < st.rank ? 'on' : ''}"></i>`).join('')}${status ? `<b>${status}</b>` : ''}</div>
      <p>${esc(d.blurb)}</p>
      <p class="bc-where">Often at ${[...locs].join(', ')}</p>
      ${next ? `<p class="bc-next">${esc(next)}</p>` : ''}
    </div>
  </div>`;
}

// ------------------------------------------------------------------ finale / ending

function finaleView(): string {
  const s = g!;
  const al = allies(s);
  const ready = CATEGORIES.every((c) => finalePicks[c]);
  return `<div class="finale">
    <div class="fin-head"><span>October 30 · Night</span><h1>Bonfire Night</h1><p>The whole town is at the fairground watching the old wood burn. Nobody will notice if you slip away.</p></div>
    <div class="fin-grid">
      <div class="fin-board">${board(s, true)}<button class="btn-x primary big fin-go" data-a="accuse" ${ready ? '' : 'disabled'}>Go</button></div>
      <aside class="fin-side">
        <h4>Who comes with you</h4>
        <div class="fin-allies">${al.length ? al.map((c) => `<div class="fa">${face(c, 'happy')}<span>${esc(CHARS[c].short)}</span></div>`).join('') : '<p class="dim">No one. You\'ll go alone.</p>'}</div>
        <p class="dim small">Three people should be enough, or two if your Nerve is 4.</p>
        <h4>Notebook</h4>
        <ul class="clues mini">${s.found.slice().reverse().map((c) => `<li class="clue k-${c.kind}"><span>${esc(c.source)}</span>${esc(c.text)}</li>`).join('') || '<li class="dim">No clues.</li>'}</ul>
      </aside>
    </div>
  </div>`;
}

const TIER = { daybreak: 'Daybreak', unfinished: 'Found, Not Finished', almost: 'Almost', embers: 'Embers' };
const WHERE_LOC: Record<string, LocId> = { annex: 'mill', tower: 'woods', boathouse: 'lake', room9: 'motel', glade: 'woods' };

function endingView(): string {
  const s = g!;
  const e = s.ending!;
  const sc = SCENARIOS[s.scenario];
  const ans = answerOf(s);
  setBg(WHERE_LOC[e.picks.where], e.tier === 'daybreak' ? 0 : 2, e.tier === 'daybreak' ? 'clear' : 'fog', 'dim');
  const names = e.allies.map((c) => CHARS[c].short);
  const company = names.length ? `with ${names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0]}` : 'alone';
  const whereL = opt('where', e.picks.where).label;
  let story = `You leave the bonfire ${company} and head for ${whereL.charAt(0).toLowerCase() + whereL.slice(1)}.\n\n`;
  if (e.tier === 'daybreak') story += sc.rescue;
  else if (e.tier === 'unfinished') {
    const wrong = CATEGORIES.filter((c) => c !== 'where' && !e.correct[c]).map((c) => (c === 'who' ? 'who she was running from' : 'why she ran'));
    story += `${sc.rescue}\n\nBut you had ${wrong.join(' and ')} wrong. Your story falls apart under questioning, and Odessa stops talking. She's home now, but whatever she ran from never has to answer for it.`;
  } else if (e.tier === 'almost') {
    story += 'You get there after midnight with too few people. She was there an hour ago. There\'s a blanket that\'s still warm, and her green notebook is lying open. You were too slow, or there weren\'t enough of you.\n\nThe Bonfire burns down without her.';
  } else {
    story += 'There\'s nothing there but wind. You wait until dawn anyway.\n\nOn Monday, the flyers start coming down.';
  }
  const epis = CHAR_IDS.map((c) => {
    const st = s.chars[c];
    const k = st.lost ? 'lost' : st.rank >= 4 ? 'high' : st.rank >= 1 ? 'mid' : 'low';
    return `<div class="epi">${face(c, k === 'high' ? 'happy' : k === 'lost' ? 'sad' : 'neutral')}<p>${esc(CHARS[c].epi[k])}</p></div>`;
  }).join('');
  const meta = loadMeta();
  return `<div class="ending t-${e.tier}">
    ${e.tier === 'daybreak' || e.tier === 'unfinished' ? `<div class="end-odessa">${sprite('odessa', e.tier === 'daybreak' ? 'happy' : 'sad')}</div>` : ''}
    <div class="end-body">
      <div class="end-head"><span>Case ${s.scenario + 1} · ${esc(sc.title)}</span><h1>${TIER[e.tier]}</h1></div>
      <div class="end-story">${paras(story)}</div>
      <div class="verdict">${CATEGORIES.map((c) => `<div class="v ${e.correct[c] ? 'ok' : 'no'}"><span>${QUESTIONS[c]}</span><b>${esc(opt(c, e.picks[c]).short)}</b>${e.correct[c] ? '<i>✓</i>' : `<em>Truth: ${esc(opt(c, ans[c]).short)}</em>`}</div>`).join('')}</div>
      <h3>What really happened</h3>
      <div class="end-truth">${paras(sc.truth)}</div>
      <h3>Afterward</h3>
      <div class="epis">${epis}</div>
      <div class="end-stats">${s.found.length} clues · ${s.stats.dreams} dreams · ${s.stats.overslept} mornings overslept · Truths uncovered: ${meta.solved.length}/${SCENARIOS.length}</div>
      <div class="end-btns"><button class="btn-x primary" data-a="new">New run</button><button class="btn-x" data-a="title">Title</button></div>
    </div>
  </div>`;
}

// ------------------------------------------------------------------ flow

function play(pages: Page[], done?: () => void) {
  if (!pages.length) { if (done) done(); else render(); return; }
  queue = pages;
  onQueueDone = done ?? null;
  lastWho = undefined;
  render();
}

function nextPage(more?: Page[]) {
  if (typing) clearInterval(typing.t);
  typing = null;
  queue.shift();
  if (more) queue.unshift(...more);
  if (!queue.length) {
    lastWho = undefined;
    const d = onQueueDone;
    onQueueDone = null;
    if (d) d(); else render();
  } else { sfx.page(); render(); }
}

function enterDay() {
  const s = g!;
  overlay = 'calendar';
  sfx.day();
  if (!isWeekend(s.day) && s.slot === 0) { screen = 'loc'; here = 'school'; } else { screen = 'town'; here = null; }
  hover = null; focusIdx = 0;
  render();
}

function startNew() {
  clearSave();
  g = newGame();
  finalePicks = {};
  save(g);
  screen = 'town';
  const pages: Page[] = INTRO.map((t, i) => ({ text: t, style: 'narr', who: i === 2 ? 'odessa' : undefined, name: i === 2 ? 'Odessa Vale' : '' }));
  $('#stage')!.innerHTML = '';
  setBg('motel', 2, 'fog', 'dim');
  queue = pages;
  onQueueDone = () => { lastDayStart = null; enterDay(); };
  lastWho = undefined;
  $('#ov')!.innerHTML = dialogView(queue[0]);
  document.body.classList.add('busy');
  afterDialogRender(queue[0]);
  // render() would draw the town under the intro; keep the stage empty until the intro ends
  screenHold = true;
}
let screenHold = false;

function afterAction() {
  const s = g!;
  const ds = endSlot(s);
  save(s);
  const pages: Page[] = ds.missed.map((c) => ({ text: CHARS[c].crisis.missed, style: 'news', name: 'Later', tag: `${CHARS[c].short} is gone` }));
  if (ds.missed.length) sfx.danger();
  if (ds.finale) { play(pages, () => { screen = 'finale'; overlay = 'none'; render(); }); return; }
  if (ds.newDay) {
    if (ds.dream) pages.push({ text: ds.dream.text, style: 'dream', name: 'You dream', clue: ds.dream });
    play(pages, () => { lastDayStart = ds; enterDay(); });
  } else {
    play(pages, () => {
      const forced = !isWeekend(s.day) && s.slot === 0;
      if (!forced) { screen = 'town'; here = null; hover = null; focusIdx = 0; }
      render();
      splash(slotLabel(s.day, s.slot), `${dayName(s.day)}, ${dateLabel(s.day)}`);
    });
  }
}

function resultPage(res: { lines: string[]; gains: string[]; clue?: FoundClue }, title: string): Page[] {
  return [{ text: res.lines.join('\n\n'), gains: res.gains, clue: res.clue, name: title, style: 'narr' }];
}

function rejectExpr(c: CharId): Expr {
  return c === 'ida' || c === 'lou' ? 'sad' : 'angry';
}

function doHang(c: CharId) {
  const s = g!;
  const loc = here!;
  const st = s.chars[c];
  if (!sceneGate(s, c).ok) return;
  if (st.rank >= 5) {
    const res = doHangoutMaxed(s, c, loc);
    play([{ who: c, expr: 'happy', text: `You spend an easy hour with ${CHARS[c].short}. Neither of you needs to say much.`, gains: res.gains }], afterAction);
    return;
  }
  const sc = CHARS[c].scenes[st.rank];
  const order = shuffle(sc.choices, mulberry32(s.seed + st.rank * 13 + CHAR_IDS.indexOf(c) * 101));
  const page: Page = {
    who: c, tag: BOND[c].title, text: sc.text,
    choices: order.map((ch) => ({
      label: ch.t,
      pick: () => {
        const r = applyChoice(s, c, ch.q, loc);
        const out: Page[] = [{ who: c, expr: ch.q === 2 ? 'happy' : ch.q === 1 ? 'neutral' : rejectExpr(c), text: ch.r, gains: r.gains }];
        if (r.stalled) {
          out.push({ who: c, expr: rejectExpr(c), tag: 'No progress', text: `That didn't land. ${CHARS[c].short} is cooler toward you now, and you'll have to try this conversation again another time.` });
          return out;
        }
        out.push({ text: '', style: 'rank', rank: { char: c, rank: r.newRank } });
        if (r.clue) out.push({ who: c, expr: 'neutral', text: 'You write down what they told you.', clue: r.clue });
        if (r.withheld) out.push({ who: c, expr: 'sad', text: CHARS[c].withhold, tag: 'Not ready to trust you' });
        return out;
      },
    })),
  };
  play([page], afterAction);
}

function doCrisis(c: CharId) {
  const s = g!;
  const r = resolveCrisis(s, c);
  const d = CHARS[c].crisis;
  play(r.outcome === 'saved'
    ? [{ who: c, expr: 'sad', text: d.success, clue: r.clue, tag: 'Crisis', gains: [`${CHARS[c].short} won't forget this`] }]
    : [{ who: c, expr: 'sad', text: d.cold, tag: 'You weren\'t close enough' }], afterAction);
}

function doClass() {
  const s = g!;
  const sj = subjectFor(s.day);
  const q = classQuestion(s);
  const opts = shuffle(q.a.map((t, i) => ({ t, ok: i === 0 })), mulberry32(s.seed + s.day * 7 + 3));
  play([{
    name: sj.name, tag: `${sj.teacher} · ${TRAIT_LABEL[sj.trait]} +1 if correct`, style: 'narr',
    text: `${sj.intro}\n\n${q.q}`,
    choices: opts.map((o) => ({
      label: o.t,
      pick: () => {
        const gains = answerClass(s, q, o.ok);
        if (o.ok) sfx.stat(); else sfx.back();
        return [{ name: o.ok ? 'Correct' : 'Wrong', style: 'narr', gains,
          text: o.ok ? sj.right : `${sj.wrong}\n\nThe answer was: ${q.a[0]}.` }];
      },
    })),
  }], afterAction);
}

function runCmd(a: string, id: string) {
  const s = g!;
  if (a === 'hang') { sfx.select(); doHang(id as CharId); }
  else if (a === 'crisis') { sfx.select(); doCrisis(id as CharId); }
  else if (a === 'act' && id === 'class') { sfx.select(); doClass(); }
  else if (a === 'act') {
    sfx.select();
    const act = LOCATIONS[here!].activities.find((x) => x.id === id)!;
    play(resultPage(doActivity(s, here!, id), act.label), afterAction);
  } else if (a === 'inv') {
    sfx.select();
    const res = doInvestigation(s, here!);
    if (!res.clue) res.lines.push('You turn up nothing new.');
    play(resultPage(res, LOCATIONS[here!].inv.label), afterAction);
  } else if (a === 'leave') { sfx.back(); screen = 'town'; here = null; hover = null; focusIdx = 0; render(); }
  else if (a === 'nope') sfx.back();
}

// ------------------------------------------------------------------ input

function onHover(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest('.tli, .cmd-i') as HTMLElement | null;
  if (!el || queue.length || overlay !== 'none') return;
  const i = Number(el.dataset.i);
  if (screen === 'town' && el.classList.contains('tli')) {
    const id = el.dataset.id as LocId;
    if (hover === id) return;
    hover = id; focusIdx = i;
    sfx.move();
    document.querySelectorAll('.tli.focus').forEach((x) => x.classList.remove('focus'));
    el.classList.add('focus');
    $('.town-info')!.innerHTML = townInfo(id);
    setBg(id, g!.slot, weatherNow(g!));
  } else if (screen === 'loc' && el.classList.contains('cmd-i') && focusIdx !== i) {
    focusIdx = i; sfx.move();
    document.querySelectorAll('.cmd-i.focus').forEach((x) => x.classList.remove('focus'));
    el.classList.add('focus');
  }
}

function moveFocus(d: number) {
  const items = [...document.querySelectorAll(screen === 'town' ? '.tli' : '.cmd-i')] as HTMLElement[];
  if (!items.length) return;
  focusIdx = (focusIdx + d + items.length) % items.length;
  const el = items[focusIdx];
  items.forEach((x) => x.classList.remove('focus'));
  el.classList.add('focus');
  sfx.move();
  if (screen === 'town') {
    hover = el.dataset.id as LocId;
    $('.town-info')!.innerHTML = townInfo(hover);
    setBg(hover, g!.slot, weatherNow(g!));
  }
}

const forcedSchool = () => !!g && !isWeekend(g.day) && g.slot === 0;

function onKey(e: KeyboardEvent) {
  if (queue.length) {
    const p = queue[0];
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (finishTyping()) return;
      if (!p.choices) advance();
    }
    const n = parseInt(e.key, 10);
    if (p.choices && n >= 1 && n <= p.choices.length) { finishTyping(); sfx.select(); advance(p.choices[n - 1].pick()); }
    return;
  }
  if (overlay === 'calendar') { if (['Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); overlay = 'none'; render(); } return; }
  if (overlay !== 'none') {
    if (e.key === 'Escape' || (overlay === 'menu' && (e.key === 'n' || e.key === 'b'))) { sfx.back(); overlay = 'none'; render(); }
    return;
  }
  if (screen === 'town' || screen === 'loc') {
    if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); moveFocus(1); }
    else if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); moveFocus(-1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      (document.querySelector(screen === 'town' ? '.tli.focus' : '.cmd-i.focus') as HTMLElement | null)?.click();
    } else if (e.key === 'Escape' && screen === 'loc' && !forcedSchool()) runCmd('leave', '');
    else if (e.key === 'n') { menuTab = 'clues'; overlay = 'menu'; sfx.select(); render(); }
    else if (e.key === 'b') { menuTab = 'bonds'; overlay = 'menu'; sfx.select(); render(); }
  }
}

/** Advance dialog; handles the intro's held stage. */
function advance(more?: Page[]) {
  if (screenHold && queue.length <= 1 && !more) screenHold = false;
  if (screenHold) {
    if (typing) clearInterval(typing.t);
    typing = null;
    queue.shift();
    if (more) queue.unshift(...more);
    sfx.page();
    $('#ov')!.innerHTML = dialogView(queue[0]);
    afterDialogRender(queue[0]);
    return;
  }
  nextPage(more);
}

function onClick(e: MouseEvent) {
  startAudio();
  const el = (e.target as HTMLElement).closest('[data-a]') as HTMLElement | null;
  if (!el) return;
  const a = el.dataset.a!;
  const id = el.dataset.id ?? '';
  switch (a) {
    case 'advance': {
      if (finishTyping()) return;
      if (!queue[0]?.choices) advance();
      return;
    }
    case 'choose': e.stopPropagation(); finishTyping(); sfx.select(); advance(queue[0].choices![+id].pick()); return;
    case 'new': sfx.select(); startNew(); return;
    case 'continue': {
      sfx.select();
      g = load();
      if (!g) { screen = 'title'; render(); return; }
      finalePicks = {};
      if (g.day === DAYS - 1 && g.slot === 2) { screen = 'finale'; overlay = 'none'; render(); }
      else { lastDayStart = null; enterDay(); }
      return;
    }
    case 'title': sfx.back(); screen = 'title'; g = null; overlay = 'none'; render(); return;
    case 'howto': sfx.select(); overlay = 'howto'; render(); return;
    case 'closeov': sfx.back(); overlay = 'none'; render(); return;
    case 'go': {
      const loc = id as LocId;
      if (!locOpen(g!, loc).open) { sfx.back(); return; }
      sfx.select(); here = loc; screen = 'loc'; focusIdx = 0; render(); return;
    }
    case 'hang': case 'crisis': case 'act': case 'inv': case 'leave': case 'nope': runCmd(a, id); return;
    case 'menu': sfx.select(); menuTab = id as typeof menuTab; overlay = 'menu'; render(); return;
    case 'tab': sfx.move(); menuTab = id as typeof menuTab; render(); return;
    case 'sound': toggleAudio(); render(); return;
    case 'mark': {
      const s = g!;
      s.marks[id] = ((s.marks[id] ?? 0) + 1) % 3;
      save(s); sfx.move(); render(); return;
    }
    case 'fpick': {
      const [cat, o] = id.split(':') as [Category, string];
      finalePicks[cat] = o; sfx.select(); render(); return;
    }
    case 'accuse': {
      if (!CATEGORIES.every((c) => finalePicks[c])) return;
      sfx.rank();
      computeEnding(g!, finalePicks as Record<Category, string>);
      clearSave();
      screen = 'ending';
      render();
      window.scrollTo(0, 0);
      return;
    }
  }
}
