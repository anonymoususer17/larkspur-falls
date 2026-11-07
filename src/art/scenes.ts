// Painted-silhouette location backdrops (layered, atmospheric, Firewatch-like).
import { mulberry32 } from '../rng';
import type { LocId, Slot, Weather } from '../types';

interface Pal {
  sky: [string, string, string];
  L: [string, string, string, string, string]; // far -> near
  lit: string;      // window light
  unlit: string;    // window when no light
  water: [string, string];
  haze: string;
  night: boolean;
}

function palette(slot: Slot, w: Weather): Pal {
  let p: Pal;
  if (slot === 0) {
    p = { sky: ['#9fb7c9', '#e9d3bb', '#f6e2c4'], L: ['#a9a6aa', '#7f8189', '#545866', '#33374a', '#1c1f2c'],
      lit: '#ffe2a8', unlit: '#c9d6df', water: ['#9db0bd', '#5d6f80'], haze: '#e9dccb', night: false };
  } else if (slot === 1) {
    p = { sky: ['#3c4a78', '#d9785a', '#f4b46a'], L: ['#b8706a', '#8a4c58', '#5a3048', '#351c33', '#1b0f1e'],
      lit: '#ffd08a', unlit: '#f0b080', water: ['#d58a6a', '#4a2a40'], haze: '#f0a070', night: false };
  } else {
    p = { sky: ['#05070f', '#111a35', '#24305a'], L: ['#26304f', '#1b2340', '#131a31', '#0c1124', '#060914'],
      lit: '#ffc46a', unlit: '#1c2440', water: ['#1a2442', '#05070f'], haze: '#2a3a66', night: true };
  }
  if (w === 'fog') {
    p = { ...p, sky: [mix(p.sky[0], '#b8c0c0', .6), mix(p.sky[1], '#c8cccc', .65), mix(p.sky[2], '#d0d2cf', .6)],
      L: p.L.map((c, i) => mix(c, p.night ? '#4a5260' : '#b9bdbd', [.6, .45, .3, .18, .08][i])) as Pal['L'], haze: p.night ? '#5a6272' : '#d8dcd8' };
  } else if (w === 'rain') {
    p = { ...p, sky: [mix(p.sky[0], '#2a3240', .6), mix(p.sky[1], '#4a5462', .6), mix(p.sky[2], '#5a6470', .55)],
      L: p.L.map((c) => mix(c, '#1a2230', .3)) as Pal['L'], haze: mix(p.haze, '#6a7480', .6) };
  }
  return p;
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return '#' + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0');
}

// ---------------------------------------------------------------- primitives

const W = 1600, H = 900;

function tree(x: number, base: number, h: number, c: string): string {
  const w = h * 0.36;
  const t = (y0: number, y1: number, hw: number) => `M${x} ${y0}L${x + hw} ${y1}L${x - hw} ${y1}Z`;
  return `<path d="${t(base - h, base - h * .45, w * .55)}${t(base - h * .78, base - h * .18, w * .8)}${t(base - h * .55, base, w)}" fill="${c}"/><rect x="${x - h * .025}" y="${base - 2}" width="${h * .05}" height="${h * .08}" fill="${c}"/>`;
}

function pines(seed: number, base: number, hMin: number, hMax: number, step: number, c: string, x0 = -40, x1 = W + 40, skip?: [number, number][]): string {
  const r = mulberry32(seed);
  let s = '';
  for (let x = x0; x < x1; x += step * (0.6 + r() * 0.8)) {
    if (skip?.some(([a, b]) => x > a && x < b)) continue;
    s += tree(x, base + r() * 14, hMin + r() * (hMax - hMin), c);
  }
  return s + `<rect x="0" y="${base + 8}" width="${W}" height="${H}" fill="${c}"/>`;
}

function ridge(seed: number, y: number, amp: number, c: string, peaks = 7): string {
  const r = mulberry32(seed);
  let d = `M0 ${H}L0 ${y}`;
  const n = peaks * 2;
  for (let i = 1; i <= n; i++) {
    const x = (i / n) * W;
    const yy = y - (i % 2 ? amp * (0.5 + r() * 0.5) : amp * r() * 0.3);
    d += `L${x.toFixed(0)} ${yy.toFixed(0)}`;
  }
  return `<path d="${d}L${W} ${H}Z" fill="${c}"/>`;
}

function sky(p: Pal, seed: number, w: Weather, slot: Slot): string {
  const r = mulberry32(seed);
  let s = `<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".62" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient>
    <rect width="${W}" height="${H}" fill="url(#sk)"/>`;
  if (p.night && w === 'clear') {
    for (let i = 0; i < 140; i++) s += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * 520).toFixed(0)}" r="${(r() * 1.4 + .3).toFixed(1)}" fill="#fff" opacity="${(r() * .7 + .2).toFixed(2)}"/>`;
    s += `<circle cx="1260" cy="150" r="90" fill="#fff6d8" opacity=".08"/><circle cx="1260" cy="150" r="46" fill="#f4ecd2"/><circle cx="1278" cy="140" r="40" fill="${p.sky[0]}" opacity=".25"/>`;
  } else if (slot === 1 && w === 'clear') {
    s += `<circle cx="1120" cy="520" r="260" fill="#ffd28a" opacity=".22"/><circle cx="1120" cy="520" r="120" fill="#ffe0a0" opacity=".5"/><circle cx="1120" cy="520" r="70" fill="#fff0c8"/>`;
  } else if (slot === 0 && w === 'clear') {
    s += `<circle cx="380" cy="200" r="200" fill="#fff4dc" opacity=".25"/><circle cx="380" cy="200" r="54" fill="#fff8e8" opacity=".9"/>`;
  }
  if (w === 'clear' && !p.night) {
    for (let i = 0; i < 5; i++) {
      const cx = r() * W, cy = 90 + r() * 260, rw = 120 + r() * 200;
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${rw}" ry="${rw * .14}" fill="#fff" opacity="${slot === 1 ? .12 : .3}"/>`;
    }
  }
  return s;
}

function haze(p: Pal, y: number, h: number, op: number): string {
  return `<linearGradient id="hz${y}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.haze}" stop-opacity="0"/><stop offset=".6" stop-color="${p.haze}" stop-opacity="${op}"/><stop offset="1" stop-color="${p.haze}" stop-opacity="0"/></linearGradient><rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#hz${y})"/>`;
}

function windows(x: number, y: number, cols: number, rows: number, ww: number, wh: number, gx: number, gy: number, p: Pal, seed: number, litChance = .7): string {
  const r = mulberry32(seed);
  let s = '';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const on = p.night ? r() < litChance : false;
    s += `<rect x="${x + i * (ww + gx)}" y="${y + j * (wh + gy)}" width="${ww}" height="${wh}" fill="${on ? p.lit : p.unlit}" opacity="${on ? 1 : p.night ? .9 : .55}"/>`;
    if (on) s += `<rect x="${x + i * (ww + gx) - 6}" y="${y + j * (wh + gy) - 6}" width="${ww + 12}" height="${wh + 12}" fill="${p.lit}" opacity=".12"/>`;
  }
  return s;
}

function neon(text: string, x: number, y: number, size: number, color: string, p: Pal, font = 'Anton, Impact, sans-serif', anchor = 'middle'): string {
  const on = p.night || true;
  const glow = p.night ? 1 : .55;
  return `<g font-family="${font}" font-size="${size}" text-anchor="${anchor}" letter-spacing="${size * .06}">
    ${on ? `<text x="${x}" y="${y}" fill="${color}" filter="url(#glow)" opacity="${glow}">${text}</text>` : ''}
    <text x="${x}" y="${y}" fill="${p.night ? '#fff6f0' : color}" opacity="${p.night ? .95 : .9}">${text}</text></g>`;
}

function lamp(x: number, base: number, h: number, p: Pal, c: string): string {
  return `<rect x="${x - 3}" y="${base - h}" width="6" height="${h}" fill="${c}"/><rect x="${x - 3}" y="${base - h}" width="34" height="5" fill="${c}"/>
    ${p.night ? `<path d="M${x + 28} ${base - h + 5}L${x + 110} ${base}L${x - 54} ${base}Z" fill="${p.lit}" opacity=".13"/><circle cx="${x + 28}" cy="${base - h + 8}" r="16" fill="${p.lit}" opacity=".35" filter="url(#glow)"/>` : ''}
    <circle cx="${x + 28}" cy="${base - h + 8}" r="6" fill="${p.night ? '#fff2c8' : c}"/>`;
}

function rainLayer(): string {
  let s = '<g class="sc-rain">';
  const r = mulberry32(77);
  for (let i = 0; i < 160; i++) {
    const x = r() * (W + 200), y = r() * H, l = 20 + r() * 30;
    s += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - l * .3).toFixed(0)}" y2="${(y + l).toFixed(0)}"/>`;
  }
  return s + '</g>';
}

function fogLayer(p: Pal): string {
  return `<g class="sc-fog" fill="${p.haze}">
    <ellipse cx="400" cy="640" rx="700" ry="110" opacity=".4"/><ellipse cx="1200" cy="560" rx="700" ry="100" opacity=".35"/>
    <ellipse cx="800" cy="780" rx="900" ry="120" opacity=".3"/></g>`;
}

// ---------------------------------------------------------------- scenes

type Painter = (p: Pal) => string;

const back = (p: Pal, seed: number, treeline = 600) =>
  ridge(seed, 470, 150, p.L[0]) + haze(p, 360, 260, .35) + pines(seed + 1, treeline, 60, 130, 26, p.L[1]) + haze(p, treeline - 100, 160, .25);

const PAINT: Record<LocId, Painter> = {
  motel: (p) => back(p, 11) + `
    <rect x="0" y="660" width="${W}" height="240" fill="${p.L[3]}"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${260 + i * 150}" y="760" width="90" height="6" fill="${p.night ? '#3a4060' : '#c8c0b0'}" opacity=".5"/>`).join('')}
    <rect x="160" y="470" width="1100" height="200" fill="${p.L[2]}"/>
    <rect x="140" y="452" width="1140" height="26" fill="${p.L[3]}"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
      const x = 200 + i * 104; const on = p.night && (i * 7) % 3 !== 0;
      return `<rect x="${x}" y="540" width="38" height="130" fill="${p.L[3]}"/><rect x="${x + 48}" y="560" width="40" height="40" fill="${on ? p.lit : p.unlit}" opacity="${on ? 1 : .6}"/>
        <text x="${x + 19}" y="532" font-family="Anton,sans-serif" font-size="14" text-anchor="middle" fill="${p.night ? '#8a90b0' : p.L[4]}">${i + 1}</text>`;
    }).join('')}
    <rect x="1280" y="420" width="220" height="250" fill="${p.L[2]}"/><rect x="1270" y="404" width="240" height="22" fill="${p.L[3]}"/>
    <rect x="1310" y="490" width="160" height="110" fill="${p.night ? p.lit : p.unlit}" opacity="${p.night ? .95 : .6}"/>
    <rect x="1534" y="250" width="10" height="420" fill="${p.L[4]}"/>
    <rect x="1440" y="230" width="150" height="110" rx="6" fill="${p.L[4]}" stroke="${p.night ? '#ff7ab8' : '#c65a8a'}" stroke-width="3"/>
    ${neon('STARLITE', 1515, 280, 34, '#ff7ab8', p)}${neon('MOTEL', 1515, 322, 30, '#ffd36a', p)}
    <path d="M1515 196l9 18 20 3 -15 14 4 20 -18 -10 -18 10 4 -20 -15 -14 20 -3z" fill="#ffd36a" filter="url(#glow)"/>
    ${neon('VACANCY', 1515, 380, 26, '#ff4a7a', p)}
    ${lamp(110, 680, 230, p, p.L[4])}
    <rect x="0" y="840" width="${W}" height="60" fill="${p.L[4]}"/>`,

  school: (p) => back(p, 21) + `
    <rect x="0" y="680" width="${W}" height="220" fill="${p.L[3]}"/>
    <rect x="260" y="360" width="1080" height="330" fill="${mix(p.L[2], '#7a3a2a', p.night ? .15 : .35)}"/>
    <rect x="240" y="340" width="1120" height="26" fill="${p.L[3]}"/>
    <rect x="690" y="200" width="220" height="200" fill="${mix(p.L[2], '#7a3a2a', p.night ? .12 : .3)}"/>
    <path d="M670 205L800 120L930 205Z" fill="${p.L[3]}"/>
    <circle cx="800" cy="285" r="52" fill="${p.night ? '#f0e6c8' : '#f4ecd8'}" opacity="${p.night ? .9 : .95}"/><circle cx="800" cy="285" r="52" fill="none" stroke="${p.L[4]}" stroke-width="5"/>
    <path d="M800 285L800 250M800 285L826 296" stroke="${p.L[4]}" stroke-width="5" stroke-linecap="round"/>
    ${windows(300, 400, 6, 2, 52, 80, 14, 40, p, 3, .25)}${windows(940, 400, 6, 2, 52, 80, 14, 40, p, 4, .25)}
    <rect x="740" y="560" width="120" height="130" fill="${p.L[4]}"/>
    <rect x="700" y="680" width="200" height="14" fill="${p.L[4]}"/><rect x="680" y="694" width="240" height="14" fill="${p.L[4]}"/>
    <rect x="1440" y="300" width="6" height="390" fill="${p.L[4]}"/><path d="M1446 306h70l-10 22 10 22h-70z" fill="#a8323a"/>
    ${pines(29, 760, 160, 300, 70, p.L[4], -40, 240)}${pines(31, 760, 160, 300, 70, p.L[4], 1500, 1700)}
    <text x="800" y="384" font-family="Anton,sans-serif" font-size="26" text-anchor="middle" fill="${p.night ? '#9aa0c0' : '#f0e4cc'}" letter-spacing="8">LARKSPUR HIGH SCHOOL</text>`,

  diner: (p) => back(p, 31) + `
    <rect x="0" y="690" width="${W}" height="210" fill="${p.L[3]}"/>
    <path d="M220 700V470Q220 430 260 430H1340Q1380 430 1380 470V700Z" fill="${p.L[2]}"/>
    <rect x="220" y="440" width="1160" height="18" fill="#b8323e" opacity=".9"/>
    <rect x="250" y="490" width="1100" height="150" fill="${p.night ? p.lit : p.unlit}" opacity="${p.night ? .9 : .5}"/>
    ${p.night ? '<rect x="230" y="470" width="1140" height="190" fill="#ffc46a" opacity=".12" filter="url(#glow)"/>' : ''}
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${250 + i * 138}" y="490" width="6" height="150" fill="${p.L[3]}"/>`).join('')}
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => `<circle cx="${290 + i * 100}" cy="600" r="16" fill="${p.L[3]}" opacity=".85"/><rect x="${287 + i * 100}" y="600" width="6" height="40" fill="${p.L[3]}" opacity=".85"/>`).join('')}
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${370 + i * 220} 490v20" stroke="${p.L[3]}" stroke-width="2"/><path d="M${352 + i * 220} 510h36l-8 14h-20z" fill="${p.night ? '#fff0c0' : p.L[3]}"/>`).join('')}
    <rect x="520" y="300" width="560" height="110" rx="10" fill="${p.L[4]}" stroke="#ff5a5a" stroke-width="3"/>
    <rect x="796" y="410" width="8" height="24" fill="${p.L[4]}"/>
    ${neon('THE LANTERN', 800, 375, 64, '#ff5050', p)}
    ${neon('PIE · COFFEE · OPEN LATE', 800, 680, 22, '#ffd36a', p)}
    <path d="M60 820Q70 760 160 752L300 748Q360 750 400 790L470 800Q500 810 500 840L40 840Q40 826 60 820Z" fill="${p.L[4]}"/>
    <circle cx="140" cy="842" r="26" fill="${p.L[4]}"/><circle cx="420" cy="842" r="26" fill="${p.L[4]}"/>
    <rect x="0" y="860" width="${W}" height="40" fill="${p.L[4]}"/>`,

  library: (p) => back(p, 41) + `
    <rect x="0" y="700" width="${W}" height="200" fill="${p.L[3]}"/>
    <path d="M430 400L800 260L1170 400Z" fill="${p.L[3]}"/>
    <rect x="430" y="398" width="740" height="22" fill="${p.L[3]}"/>
    <rect x="450" y="420" width="700" height="270" fill="${p.L[2]}"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${478 + i * 124}" y="420" width="34" height="250" fill="${mix(p.L[1], '#ffffff', p.night ? .05 : .2)}"/>`).join('')}
    <rect x="752" y="540" width="96" height="150" fill="${p.night ? p.lit : p.L[4]}" opacity="${p.night ? .9 : 1}"/>
    ${windows(530, 470, 2, 2, 50, 70, 74, 30, p, 8, .8)}${windows(880, 470, 2, 2, 50, 70, 74, 30, p, 9, .8)}
    ${[0, 1, 2].map((i) => `<rect x="${410 - i * 20}" y="${690 + i * 14}" width="${780 + i * 40}" height="14" fill="${p.L[4]}"/>`).join('')}
    <text x="800" y="388" font-family="Cormorant Garamond,serif" font-size="28" font-weight="700" text-anchor="middle" fill="${p.night ? '#8a90b0' : '#efe2c8'}" letter-spacing="6">PUBLIC LIBRARY</text>
    ${lamp(330, 720, 200, p, p.L[4])}${lamp(1250, 720, 200, p, p.L[4])}
    <circle cx="140" cy="430" r="160" fill="${p.L[4]}"/><circle cx="60" cy="520" r="120" fill="${p.L[4]}"/><rect x="120" y="500" width="30" height="260" fill="${p.L[4]}"/>`,

  station: (p) => back(p, 51) + `
    <rect x="0" y="690" width="${W}" height="210" fill="${p.L[3]}"/>
    <rect x="300" y="470" width="1000" height="220" fill="${p.L[2]}"/>
    <rect x="280" y="450" width="1040" height="26" fill="${p.L[3]}"/>
    ${windows(340, 530, 4, 1, 90, 70, 30, 0, p, 12, .9)}${windows(900, 530, 3, 1, 90, 70, 30, 0, p, 13, .5)}
    <rect x="770" y="540" width="80" height="150" fill="${p.L[4]}"/>
    <text x="800" y="506" font-family="Anton,sans-serif" font-size="34" text-anchor="middle" fill="${p.night ? '#c8b070' : '#e8d49a'}" letter-spacing="10">COUNTY SHERIFF</text>
    <path d="M800 410l7 14 15 2 -11 10 3 15 -14 -7 -14 7 3 -15 -11 -10 15 -2z" fill="#c8a24a"/>
    <rect x="1380" y="280" width="6" height="410" fill="${p.L[4]}"/><path d="M1386 286h80v50h-80z" fill="${p.night ? '#3a4a7a' : '#4a5a9a'}"/>
    <path d="M980 800Q990 744 1080 738L1300 734Q1370 736 1410 778L1480 790Q1510 798 1510 830L960 830Q960 812 980 800Z" fill="${p.L[4]}"/>
    <rect x="1160" y="720" width="80" height="14" rx="3" fill="${p.L[4]}"/>
    <rect x="1162" y="720" width="38" height="12" rx="3" fill="#ff3a3a" ${p.night ? 'filter="url(#glow)" class="blink-r"' : 'opacity=".7"'}/>
    <rect x="1200" y="720" width="38" height="12" rx="3" fill="#3a6aff" ${p.night ? 'filter="url(#glow)" class="blink-b"' : 'opacity=".7"'}/>
    <circle cx="1060" cy="832" r="28" fill="${p.L[4]}"/><circle cx="1400" cy="832" r="28" fill="${p.L[4]}"/>
    <rect x="0" y="856" width="${W}" height="44" fill="${p.L[4]}"/>
    ${pines(57, 720, 200, 340, 80, p.L[4], -40, 260)}`,

  lake: (p) => {
    const shore = 470;
    const far = pines(61, shore, 40, 90, 22, p.L[1]);
    return ridge(61, 380, 140, p.L[0]) + haze(p, 290, 200, .35) + far + `
      <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.water[0]}"/><stop offset="1" stop-color="${p.water[1]}"/></linearGradient>
      <rect x="0" y="${shore + 8}" width="${W}" height="${H}" fill="url(#wt)"/>
      <g transform="translate(0 ${2 * shore + 16}) scale(1 -1)" opacity=".28">${pines(61, shore, 40, 90, 22, p.L[1])}</g>
      <rect x="0" y="${shore + 8}" width="${W}" height="${H}" fill="url(#wt)" opacity=".5"/>
      ${p.night ? `<path d="M1230 ${shore + 14}L1290 ${shore + 14}L1340 900L1180 900Z" fill="#f4ecd2" opacity=".12"/>` : ''}
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${200 + i * 190}" y="${560 + i * 40}" width="${120 + i * 30}" height="2" fill="#fff" opacity=".18"/>`).join('')}
      <g fill="${p.L[3]}"><rect x="1040" y="530" width="300" height="70" rx="6"/><rect x="1080" y="480" width="200" height="56"/><path d="M1070 484L1180 440L1290 484Z"/>
      <rect x="1110" y="500" width="40" height="26" fill="${p.night ? p.lit : p.unlit}"/><rect x="1200" y="500" width="40" height="26" fill="${p.night ? p.lit : p.unlit}"/></g>
      <g transform="translate(0 1200) scale(1 -1)" opacity=".2"><rect x="1040" y="530" width="300" height="70" fill="${p.L[3]}"/></g>
      <path d="M0 760L640 640L700 650L60 900L0 900Z" fill="${p.L[4]}"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${80 + i * 104}" y="${745 - i * 20}" width="10" height="${130}" fill="${p.L[4]}"/>`).join('')}
      <rect x="560" y="610" width="40" height="34" fill="${p.L[4]}"/>
      <path d="M1400 900Q1450 760 1470 680M1440 900Q1480 780 1520 720M1500 900Q1520 800 1580 760" stroke="${p.L[4]}" stroke-width="5" fill="none"/>`;
  },

  mill: (p) => back(p, 71) + `
    <rect x="0" y="690" width="${W}" height="210" fill="${p.L[3]}"/>
    <path d="M160 690V420L300 360V420L440 360V420L580 360V420L720 360V420L860 360V420L1000 360V690Z" fill="${p.L[2]}"/>
    ${windows(200, 470, 8, 2, 60, 40, 34, 30, p, 17, .6)}
    <rect x="1060" y="140" width="60" height="550" fill="${p.L[2]}"/><rect x="1160" y="200" width="50" height="490" fill="${p.L[2]}"/>
    <g fill="${p.night ? '#3a4260' : '#e8e0d8'}" opacity="${p.night ? .5 : .55}" class="smoke">
      <ellipse cx="1100" cy="110" rx="70" ry="34"/><ellipse cx="1150" cy="70" rx="100" ry="40"/><ellipse cx="1240" cy="40" rx="140" ry="44"/>
      <ellipse cx="1190" cy="170" rx="50" ry="26"/><ellipse cx="1230" cy="130" rx="80" ry="30"/></g>
    <path d="M1000 560L1300 420L1310 440L1010 580Z" fill="${p.L[3]}"/>
    <g stroke="${p.L[3]}" stroke-width="10" fill="none"><path d="M1300 690V470L1420 420L1540 470V690M1300 560H1540M1350 470V690M1480 450V690"/><path d="M1420 420L1440 500L1400 560"/></g>
    <rect x="0" y="740" width="${W}" height="160" fill="${p.water[1]}" opacity=".9"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${80 + i * 190 + (i % 2) * 40}" y="${770 + (i % 3) * 36}" width="170" height="22" rx="11" fill="${p.L[4]}"/>`).join('')}`,

  falls: (p) => ridge(81, 300, 100, p.L[0]) + haze(p, 200, 240, .3) + `
    <path d="M0 900V220L120 180L260 240L420 200L640 260L700 900Z" fill="${p.L[2]}"/>
    <path d="M1600 900V200L1460 170L1300 230L1100 190L900 250L860 900Z" fill="${p.L[2]}"/>
    ${pines(83, 230, 40, 110, 30, p.L[3], -40, 640)}
    ${pines(85, 230, 40, 110, 30, p.L[3], 900, 1640)}
    <linearGradient id="wf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#ffffff" stop-opacity=".55"/></linearGradient>
    <path d="M690 250H880L900 900H660Z" fill="url(#wf)" opacity="${p.night ? .55 : .85}"/>
    <g class="falls-streaks" stroke="#fff" stroke-width="3" opacity=".5">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<line x1="${700 + i * 22}" y1="250" x2="${690 + i * 25}" y2="900" stroke-dasharray="40 60"/>`).join('')}</g>
    <g fill="#fff" opacity="${p.night ? .25 : .45}"><ellipse cx="780" cy="760" rx="380" ry="90"/><ellipse cx="780" cy="700" rx="260" ry="70"/></g>
    <path d="M0 900V560L700 680L1600 600V900Z" fill="${p.L[3]}" opacity=".0"/>
    <g fill="${p.L[4]}"><rect x="0" y="780" width="${W}" height="16"/><rect x="0" y="830" width="${W}" height="10"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<rect x="${40 + i * 200}" y="770" width="16" height="130"/>`).join('')}
    <rect x="0" y="870" width="${W}" height="30"/></g>`,

  roadhouse: (p) => back(p, 91) + `
    <rect x="0" y="690" width="${W}" height="210" fill="${p.L[3]}"/>
    <path d="M380 690V450L800 300L1220 450V690Z" fill="${mix(p.L[2], '#4a2a1a', .3)}"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="380" y="${470 + i * 32}" width="840" height="2" fill="${p.L[3]}" opacity=".6"/>`).join('')}
    <rect x="740" y="560" width="120" height="130" fill="${p.night ? p.lit : p.L[4]}" opacity="${p.night ? .8 : 1}"/>
    ${windows(450, 560, 2, 1, 90, 60, 60, 0, p, 23, 1)}${windows(970, 560, 2, 1, 90, 60, 60, 0, p, 24, 1)}
    <rect x="560" y="380" width="480" height="100" rx="8" fill="${p.L[4]}" stroke="#4aff9a" stroke-width="3"/>
    ${neon('THE PINES', 830, 452, 58, '#4aff9a', p)}
    <path d="M620 470L650 400L680 470Z M635 430h30" fill="#4aff9a" stroke="#4aff9a" filter="url(#glow)"/>
    <path d="M100 340Q500 420 800 300Q1100 420 1500 340" stroke="${p.L[4]}" stroke-width="2" fill="none"/>
    ${Array.from({ length: 22 }, (_, i) => { const t = i / 21; const x = 100 + t * 1400; const y = t < .5 ? 340 + Math.sin(t * 2 * Math.PI) * 60 : 340 + Math.sin(t * 2 * Math.PI) * -60; return `<circle cx="${x}" cy="${y + 6}" r="6" fill="${['#ffd36a', '#ff6a6a', '#6ad0ff'][i % 3]}" ${p.night ? 'filter="url(#glow)"' : 'opacity=".7"'}/>`; }).join('')}
    <g fill="${p.L[4]}"><path d="M40 840V720H220L260 760H330V840Z"/><circle cx="100" cy="846" r="26"/><circle cx="280" cy="846" r="26"/>
    <path d="M1260 840V700H1450V840Z M1450 840V740H1540L1570 790V840Z"/><circle cx="1320" cy="846" r="26"/><circle cx="1510" cy="846" r="26"/></g>
    <rect x="0" y="866" width="${W}" height="34" fill="${p.L[4]}"/>`,

  radio: (p) => back(p, 101, 640) + `
    <rect x="0" y="700" width="${W}" height="200" fill="${p.L[3]}"/>
    <g stroke="${p.L[3]}" stroke-width="5" fill="none">
      <path d="M1040 700L1100 80L1160 700"/>
      ${Array.from({ length: 12 }, (_, i) => { const y = 120 + i * 50; const hw = (y - 80) / 620 * 60; return `<path d="M${1100 - hw} ${y}L${1100 + hw} ${y + 50}M${1100 + hw} ${y}L${1100 - hw} ${y + 50}"/>`; }).join('')}
      <path d="M1100 80L600 560M1100 300L1500 700M1100 300L700 700" stroke-width="1.5"/></g>
    <circle cx="1100" cy="76" r="9" fill="#ff2a2a" class="blink-r" filter="url(#glow)"/><circle cx="1100" cy="330" r="7" fill="#ff2a2a" class="blink-r2" filter="url(#glow)"/>
    <rect x="260" y="520" width="520" height="180" fill="${p.L[2]}"/>
    ${Array.from({ length: 5 }, (_, i) => `<rect x="260" y="${540 + i * 34}" width="520" height="2" fill="${p.L[3]}" opacity=".6"/>`).join('')}
    <rect x="480" y="590" width="80" height="110" fill="${p.L[4]}"/>
    <circle cx="520" cy="570" r="10" fill="#ff3030" filter="url(#glow)"/><circle cx="520" cy="570" r="40" fill="#ff3030" opacity="${p.night ? .25 : .08}"/>
    ${windows(310, 580, 2, 1, 60, 40, 30, 0, p, 33, 1)}
    <text x="660" y="570" font-family="Anton,sans-serif" font-size="40" text-anchor="middle" fill="${p.night ? '#ff8a6a' : '#e8d8c0'}" letter-spacing="4">KLRK</text>
    <text x="660" y="600" font-family="Anton,sans-serif" font-size="18" text-anchor="middle" fill="${p.night ? '#c8a080' : '#d8c8b0'}" letter-spacing="6">98.1 FM</text>
    ${pines(107, 760, 220, 380, 90, p.L[4], -40, 220)}${pines(109, 780, 260, 420, 90, p.L[4], 1380, 1700)}`,

  woods: (p) => {
    const r = mulberry32(111);
    let s = `<rect width="${W}" height="${H}" fill="${p.L[1]}"/>` + haze(p, 0, 900, .4);
    for (let layer = 0; layer < 4; layer++) {
      const c = p.L[layer + 1];
      for (let i = 0; i < 9 - layer; i++) {
        const x = r() * W, w = 30 + layer * 30 + r() * 30;
        s += `<rect x="${x}" y="0" width="${w}" height="${H}" fill="${c}"/>`;
      }
      if (layer === 1 && !p.night) s += `<g opacity=".18" fill="#fff6d0"><path d="M500 0L620 0L900 900L620 900Z"/><path d="M900 0L960 0L1160 900L1020 900Z"/></g>`;
      s += haze(p, 300, 600, .18);
    }
    s += `<path d="M560 900Q760 700 800 600Q840 700 1100 900Z" fill="${mix(p.L[3], '#8a7050', p.night ? .1 : .25)}"/>`;
    for (let i = 0; i < 14; i++) {
      const x = r() * W, y = 820 + r() * 80;
      s += `<path d="M${x} ${y}q-40 -60 -90 -70M${x} ${y}q10 -70 -10 -110M${x} ${y}q40 -60 90 -60M${x} ${y}q30 -40 70 -20" stroke="${p.L[4]}" stroke-width="7" fill="none"/>`;
    }
    return s;
  },
};

const cache = new Map<string, string>();

export function scene(loc: LocId, slot: Slot, weather: Weather): string {
  const key = `${loc}:${slot}:${weather}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = palette(slot, weather);
  const svg = `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>
    ${sky(p, 5 + slot, weather, slot)}
    ${PAINT[loc](p)}
    ${weather === 'fog' ? fogLayer(p) : ''}
    ${weather === 'rain' ? rainLayer() : ''}
  </svg>`;
  cache.set(key, svg);
  return svg;
}
