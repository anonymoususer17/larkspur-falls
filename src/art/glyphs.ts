import type { CharId, Weather } from '../types';

/** Bond titles + emblems (our own "arcana"). */
export const BOND: Record<CharId, { title: string; glyph: string }> = {
  marnie: { title: 'The Lantern', glyph: '<path d="M50 14v8M38 22h24l-4 8H42zM36 30h28v40H36zM40 70h20l-4 10H44z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M50 40c6 8 6 14 0 20c-6-6-6-12 0-20z" fill="currentColor"/>' },
  hal: { title: 'The Watcher', glyph: '<path d="M14 50C26 30 74 30 86 50C74 70 26 70 14 50Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="50" r="12" fill="currentColor"/><path d="M50 14v10M50 76v10M22 22l7 7M78 22l-7 7" stroke="currentColor" stroke-width="4"/>' },
  teo: { title: 'The Ember', glyph: '<path d="M50 12C62 30 74 40 70 60C67 76 56 86 50 86C44 86 33 76 30 60C27 44 40 38 42 26C46 34 50 34 50 12Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M50 50c6 8 8 16 0 26c-8-10-6-18 0-26z" fill="currentColor"/>' },
  ida: { title: 'The Listener', glyph: '<path d="M30 50a20 20 0 0 1 40 0M20 50a30 30 0 0 1 60 0M10 50a40 40 0 0 1 80 0" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="56" r="7" fill="currentColor"/><path d="M50 63v24" stroke="currentColor" stroke-width="4"/>' },
  wes: { title: 'The Heir', glyph: '<path d="M18 70L22 32L36 50L50 24L64 50L78 32L82 70Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M18 80h64" stroke="currentColor" stroke-width="5"/><circle cx="50" cy="56" r="6" fill="currentColor"/>' },
  lou: { title: 'The Static', glyph: '<path d="M10 50h12l6-18 8 36 8-30 6 24 6-14 6 8h28" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="3" opacity=".5"/>' },
};

export function glyph(id: CharId, cls = ''): string {
  return `<svg class="glyph ${cls}" viewBox="0 0 100 100">${BOND[id].glyph}</svg>`;
}

export function wxIcon(w: Weather): string {
  const sun = '<circle cx="24" cy="24" r="9" fill="currentColor"/><g stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M10 38l4-4"/></g>';
  const cloud = '<path d="M12 34h24a8 8 0 0 0 0-16a11 11 0 0 0-21-2a9 9 0 0 0-3 18z" fill="currentColor"/>';
  const rain = cloud + '<g stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M16 40l-2 6M25 40l-2 6M34 40l-2 6"/></g>';
  const fog = '<g stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M6 16h30M12 25h30M6 34h30M14 43h22"/></g>';
  return `<svg class="wx" viewBox="0 0 48 48">${w === 'clear' ? sun : w === 'rain' ? rain : fog}</svg>`;
}
