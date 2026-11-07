// Balance simulation: a reasonably smart bot plays many runs.
import { classQuestion, answerClass, newGame, endSlot, charsAt, locOpen, sceneGate, invStatus, applyChoice, doActivity, doInvestigation, resolveCrisis, todaysCrisis, allies, doHangoutMaxed } from '../src/engine';
import { LOCATIONS, LOC_IDS } from '../src/data/locations';
import { CHARS } from '../src/data/characters';
import { CHAR_IDS } from '../src/types';

const N = 400;
let sv = 0, cold = 0; let clues = 0, allyCount = 0, lost = 0, ptrs = 0, dreams = 0, over = 0, maxed = 0;
const allyHist: Record<number, number> = {};
for (let r = 0; r < N; r++) {
  const s = newGame(r * 7919 + 1);
  const focus = [...CHAR_IDS].sort(() => Math.random() - .5).slice(0, 3);
  let guard = 0;
  while (guard++ < 200) {
    if (s.day === 13 && s.slot === 2) break;
    const open = LOC_IDS.filter((l) => locOpen(s, l).open);
    let acted = false;
    const cr = todaysCrisis(s);
    if (cr && cr.slot === s.slot && open.includes(cr.loc)) { resolveCrisis(s, cr.char); acted = true; }
    if (!acted && s.slot === 2 && s.fatigue >= 2) { doActivity(s, 'motel', 'sleep'); acted = true; }
    if (!acted) for (const l of open) {
      const c = charsAt(s, l).find((c) => focus.includes(c) && sceneGate(s, c).ok && s.chars[c].rank < 5);
      if (c) { applyChoice(s, c, (r => r < .5 ? 2 : r < .8 ? 1 : 0)(Math.random()), l); acted = true; break; }
    }
    if (!acted) for (const l of open) { if (invStatus(s, l).ok) { doInvestigation(s, l); acted = true; break; } }
    if (!acted) for (const l of open) {
      const c = charsAt(s, l).find((c) => sceneGate(s, c).ok && s.chars[c].rank < 5);
      if (c) { applyChoice(s, c, (r => r < .5 ? 2 : r < .8 ? 1 : 0)(Math.random()), l); acted = true; break; }
    }
    if (!acted) {
      // train lowest trait gate needed
      for (const l of open) {
        const a = LOCATIONS[l].activities.find((a) => a.slots.includes(s.slot) && a.special !== 'sleep');
        if (a?.special === 'class') { answerClass(s, classQuestion(s), Math.random() < .65); acted = true; break; }
        if (a) { doActivity(s, l, a.id); acted = true; break; }
      }
    }
    if (!acted) doActivity(s, 'motel', s.slot === 2 ? 'sleep' : 'help');
    endSlot(s);
  }
  clues += s.found.length;
  ptrs += s.found.filter((f) => f.kind === 'point' || f.kind === 'dream').length;
  dreams += s.stats.dreams; over += s.stats.overslept;
  const al = allies(s).length; allyCount += al; allyHist[al] = (allyHist[al] ?? 0) + 1;
  lost += CHAR_IDS.filter((c) => s.chars[c].lost).length;
  sv += s.crises.filter(c=>c.outcome==="saved").length; cold += s.crises.filter(c=>c.outcome==="cold").length;
  maxed += CHAR_IDS.filter((c) => s.chars[c].rank === 5).length;
}
console.log({ avgClues: clues / N, avgPointers: ptrs / N, avgAllies: allyCount / N, allyHist, avgLost: lost / N, avgDreams: dreams / N, avgOverslept: over / N, avgMaxed: maxed / N, saved: sv / N, cold: cold / N });
void CHARS; void doHangoutMaxed;
