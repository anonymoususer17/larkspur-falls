export type Trait = 'nerve' | 'empathy' | 'insight' | 'charm';
export const TRAITS: Trait[] = ['nerve', 'empathy', 'insight', 'charm'];
export const TRAIT_LABEL: Record<Trait, string> = {
  nerve: 'Nerve', empathy: 'Empathy', insight: 'Insight', charm: 'Charm',
};
export const TRAIT_MAX = 5;

export type Slot = 0 | 1 | 2;
export const SLOT_LABEL = ['Morning', 'Afternoon', 'Night'];
export type Weather = 'clear' | 'rain' | 'fog';

export type CharId = 'marnie' | 'hal' | 'teo' | 'ida' | 'wes' | 'lou';
export const CHAR_IDS: CharId[] = ['marnie', 'hal', 'teo', 'ida', 'wes', 'lou'];

export type LocId =
  | 'motel' | 'school' | 'diner' | 'library' | 'station' | 'lake'
  | 'mill' | 'falls' | 'roadhouse' | 'radio' | 'woods';

export type Category = 'who' | 'where' | 'why';
export const CATEGORIES: Category[] = ['who', 'where', 'why'];

export interface ClueDef {
  id: string;
  text: string;
  kind: 'point' | 'elim' | 'lore' | 'dream';
  cat?: Category;
  opt?: string;
}
export interface FoundClue extends ClueDef {
  source: string;
  day: number;
}

export interface CharState {
  rank: number;      // scenes completed, 0..5
  trust: number;     // sum of answer quality
  lost: boolean;
  saved: boolean;    // crisis resolved in time
  withheld: boolean; // rank-4 secret withheld for low trust
}

export interface CrisisState {
  char: CharId;
  day: number;
  slot: Slot;
  loc: LocId;
  outcome?: 'saved' | 'cold' | 'missed';
}

export interface EndingResult {
  picks: Record<Category, string>;
  correct: Record<Category, boolean>;
  found: boolean;
  tier: 'daybreak' | 'unfinished' | 'almost' | 'embers';
  allies: CharId[];
}

export interface GameState {
  version: 2;
  seed: number;
  scenario: number;
  day: number;
  slot: Slot;
  traits: Record<Trait, number>;
  fatigue: number;
  coffeeDay: number;
  chars: Record<CharId, CharState>;
  weather: Weather[];
  sources: Record<string, ClueDef>;
  found: FoundClue[];
  done: string[];
  crises: CrisisState[];
  dreamCats: Category[];
  marks: Record<string, number>;
  headlines: number[];
  phase: 'play' | 'ended';
  ending?: EndingResult;
  stats: { actions: number; dreams: number; overslept: number };
  flagSleep?: boolean;
  usedQ?: string[];
}
