import type { CharId, LocId, Slot, Trait, Weather } from '../types';

export interface Activity {
  id: string;
  label: string;
  desc: string;
  slots: Slot[];
  trait?: Trait;
  gain?: number;
  fatigue?: number;
  /** extra gain under this weather */
  bonus?: Weather;
  special?: 'sleep' | 'class';
  flavor: string[];
}

export interface Investigation {
  label: string;
  desc: string;
  slots: Slot[];
  req: { trait?: Trait; level?: number; char?: CharId; rank?: number };
  noRain?: boolean;
  flavor: string;
}

export interface LocationDef {
  id: LocId;
  name: string;
  desc: string;
  x: number;
  y: number;
  /** slots open on weekdays / weekends */
  wk: Slot[];
  we: Slot[];
  outdoor?: boolean;
  activities: Activity[];
  inv: Investigation;
}

export const LOCATIONS: Record<LocId, LocationDef> = {
  motel: {
    id: 'motel', name: 'Starlite Motel', x: 655, y: 520,
    desc: 'Aunt Bea\'s motel on Route 9. Twelve rooms, a buzzing VACANCY sign, and a hallway that creaks at night.',
    wk: [0, 1, 2], we: [0, 1, 2],
    activities: [
      { id: 'help', label: 'Help Aunt Bea', desc: 'Change sheets, fix the ice machine, and listen to her talk.', slots: [0, 1], trait: 'empathy', gain: 1,
        flavor: ['Bea talks about your mother when she was your age. You listen more than you mean to.', 'You fix the ice machine with a butter knife. Bea calls you "a genius, a genius."', 'A guest in Room 4 cries through the wall all afternoon. You leave a cup of cocoa outside her door.'] },
      { id: 'sleep', label: 'Turn in early', desc: 'Clears all sleep debt. You\'re much more likely to dream.', slots: [2], special: 'sleep',
        flavor: ['The VACANCY sign hums pink through the curtains. You sleep like a stone dropped into the lake.'] },
    ],
    inv: { label: 'The Starlite register', desc: 'Bea\'s guest book and laundry logs, going back to summer.', slots: [0, 1, 2], req: { trait: 'insight', level: 1 },
      flavor: 'While Bea\'s out at the store, you page through the register and the laundry logs, line by line.' },
  },
  school: {
    id: 'school', name: 'Larkspur High', x: 300, y: 330,
    desc: 'Red brick, a trophy case, and a memorial table for Odessa that nobody walks near.',
    wk: [0, 1], we: [],
    activities: [
      { id: 'class', label: 'Go to class', desc: 'The teacher will call on you. Answer right to gain a point.', slots: [0], special: 'class', flavor: [] },
      { id: 'drama', label: 'Drama club', desc: 'Rehearsals for a play nobody\'s sure will still go on.', slots: [1], trait: 'charm', gain: 1,
        flavor: ['You get cast as "Second Lumberjack." You improvise. The director weeps (good tears).', 'You run lines until the words stop meaning anything and start meaning everything.'] },
    ],
    inv: { label: 'Odessa\'s locker', desc: 'The janitor, Mr. Oakes, has the master key and a soft spot for polite kids.', slots: [0, 1], req: { trait: 'charm', level: 1 },
      flavor: 'Mr. Oakes jingles his keys, looks both ways, and lets you have five minutes with locker 214.' },
  },
  diner: {
    id: 'diner', name: 'The Lantern Diner', x: 520, y: 425,
    desc: 'Huckleberry pie, bottomless coffee, and every rumor in town. Coffee here clears a little sleep debt (once a day).',
    wk: [0, 1, 2], we: [0, 1, 2],
    activities: [
      { id: 'regulars', label: 'Coffee with the regulars', desc: 'Talk to the loggers and the gossips at the counter.', slots: [0, 1, 2], trait: 'charm', gain: 1, bonus: 'rain',
        flavor: ['A logger named Big Ed explains the difference between a Douglas fir and "the other kind." You nod for forty minutes.', 'The two Sorensen sisters adopt you for an hour and tell you everyone\'s business but their own.', 'Rain drums on the windows. The whole counter swaps ghost stories.'] },
    ],
    inv: { label: 'The corner booth', desc: 'The old loggers in the corner booth know everything and say nothing — unless they like you.', slots: [0, 1, 2], req: { trait: 'empathy', level: 3 },
      flavor: 'You sit with the old-timers, let them grumble about the mill and the weather, and wait until they get around to what they actually know.' },
  },
  library: {
    id: 'library', name: 'Public Library', x: 405, y: 410,
    desc: 'Smells like dust and radiator heat. The microfiche reader only works if you hit it.',
    wk: [1], we: [0, 1],
    activities: [
      { id: 'study', label: 'Read and research', desc: 'Town histories, old newspapers, strange books.', slots: [0, 1], trait: 'insight', gain: 1,
        flavor: ['You read a history of Larkspur that skips 1962 and 1979 entirely.', 'You fall into a book about the Cascade volcanoes and come up for air at closing.', 'The librarian silently slides you a book about dream interpretation. You don\'t ask.'] },
    ],
    inv: { label: 'Microfiche archive', desc: 'Forty years of the Larkspur Ledger, if you know where to look.', slots: [0, 1], req: { trait: 'insight', level: 3 },
      flavor: 'You crank through reels of old Ledger pages until your eyes ache and the room smells like warm plastic.' },
  },
  station: {
    id: 'station', name: 'Sheriff\'s Station', x: 330, y: 505,
    desc: 'A corkboard full of MISSING flyers and a coffee machine that has given up.',
    wk: [0, 1], we: [0, 1],
    activities: [
      { id: 'flyers', label: 'Volunteer for the search', desc: 'Hand out flyers, answer phones, talk to her mother.', slots: [0, 1], trait: 'empathy', gain: 1,
        flavor: ['Odessa\'s mother comes in with a casserole for the deputies. She thanks you for the flyers. You can\'t speak.', 'You answer the tip line. A man says she\'s in Reno. A woman says she\'s in the trees. Both hang up.'] },
    ],
    inv: { label: 'The evidence room', desc: 'Bike, backpack, one glove. You\'ll need someone with a key.', slots: [0, 1], req: { char: 'hal', rank: 3 },
      flavor: 'Hal unlocks the evidence room, says "I\'m getting coffee for exactly ten minutes," and leaves.' },
  },
  lake: {
    id: 'lake', name: 'Silverlake Shore', x: 815, y: 330, outdoor: true,
    desc: 'Black water, a sagging dock, and Ida\'s houseboat. The far shore disappears in fog.',
    wk: [0, 1, 2], we: [0, 1, 2],
    activities: [
      { id: 'shore', label: 'Walk the shore', desc: 'Think. Watch the water. Better in fog.', slots: [0, 1, 2], trait: 'insight', gain: 1, bonus: 'fog',
        flavor: ['A loon calls across the water and something in the reeds answers it.', 'The fog makes the lake endless. You think about everything and nothing.', 'You skip a stone eleven times. On the twelfth it disappears without a splash.'] },
    ],
    inv: { label: 'Row to the far shore', desc: 'Borrow a canoe and cross Silverlake. The water is very cold.', slots: [0, 1], req: { trait: 'nerve', level: 3 },
      flavor: 'You borrow a canoe from the public dock and paddle into the gray until the town behind you is gone.' },
  },
  mill: {
    id: 'mill', name: 'Kittredge Mill', x: 610, y: 245,
    desc: 'The saws scream all day. Behind the yard, Mill No. 2 has stood burned and chained since 1979.',
    wk: [1], we: [0, 1],
    activities: [
      { id: 'yard', label: 'Odd jobs in the yard', desc: 'Stack, haul, sweat. The foreman pays in cash and respect.', slots: [0, 1], trait: 'nerve', gain: 1, fatigue: 1,
        flavor: ['You ride a log across the holding pond on a dare. The men cheer when you don\'t fall in.', 'A chain snaps and a board whips past your ear. The foreman says "Huh." You keep working.'] },
    ],
    inv: { label: 'Slip into Mill No. 2', desc: 'Through the fence, past the chain, into the burned dark.', slots: [0, 1], req: { trait: 'nerve', level: 4 },
      flavor: 'You squeeze through the chain-link and into the black skeleton of Mill No. 2. Everything smells like 1979.' },
  },
  falls: {
    id: 'falls', name: 'Whistle Falls', x: 430, y: 120, outdoor: true,
    desc: 'Two hundred feet of white water. Her bike was found at the overlook.',
    wk: [0, 1, 2], we: [0, 1, 2],
    activities: [
      { id: 'overlook', label: 'Stand at the overlook', desc: 'Lean on the rail and let the roar empty your head.', slots: [0, 1, 2], trait: 'nerve', gain: 1,
        flavor: ['You lean out over the rail as far as you dare, then a little farther.', 'The spray soaks you. The roar gets inside your ribs. You feel braver on the walk home.'] },
    ],
    inv: { label: 'The overlook trail', desc: 'Retrace her last known steps. Impossible in the rain.', slots: [0, 1], req: { trait: 'insight', level: 1 }, noRain: true,
      flavor: 'You walk the trail from the overlook inch by inch, the way she might have walked it, looking at what everyone else stepped over.' },
  },
  roadhouse: {
    id: 'roadhouse', name: 'The Pines Roadhouse', x: 140, y: 470,
    desc: 'Neon, pool tables, and a band that only plays slow songs. Royce Abernathy runs the place.',
    wk: [2], we: [2],
    activities: [
      { id: 'band', label: 'Listen to the band', desc: 'Sit in a booth, nurse a soda, people-watch.', slots: [2], trait: 'charm', gain: 1,
        flavor: ['A singer with a voice like smoke dedicates a song "to the girl who isn\'t here." The room goes still.', 'You win a game of pool against a trucker who then teaches you three card tricks.'] },
    ],
    inv: { label: 'The back office', desc: 'Get past the bartender and the door marked PRIVATE.', slots: [2], req: { trait: 'charm', level: 3 },
      flavor: 'You talk the bartender into a story long enough to slip down the hall and through the door marked PRIVATE.' },
  },
  radio: {
    id: 'radio', name: 'KLRK 98.1', x: 885, y: 105,
    desc: 'A cinderblock radio station at the edge of the trees. A red bulb burns over the door all night.',
    wk: [2], we: [2],
    activities: [
      { id: 'phones', label: 'Answer the request line', desc: 'Take calls from the people who can\'t sleep.', slots: [2], trait: 'empathy', gain: 1,
        flavor: ['A trucker calls in from a phone booth outside Bend to request a song for his daughter. He cries a little. So do you.', 'A woman calls in to say she saw lights over the lake. She sounds calm. She sounds like she\'s seen them before.'] },
    ],
    inv: { label: 'The request-card archive', desc: 'Twenty years of shoeboxes. Lou guards them like scripture.', slots: [2], req: { char: 'lou', rank: 3 },
      flavor: 'Lou pulls a shoebox down from the top shelf, blows the dust off, and leaves you alone with it.' },
  },
  woods: {
    id: 'woods', name: 'Kettle Ridge Trail', x: 175, y: 150, outdoor: true,
    desc: 'Old-growth forest climbing to the ridge and the abandoned fire lookout. Closed in the rain.',
    wk: [0, 1], we: [0, 1],
    activities: [
      { id: 'hike', label: 'Hike the ridge', desc: 'Hard climb, big trees. Tiring.', slots: [0, 1], trait: 'nerve', gain: 2, fatigue: 1, bonus: 'fog',
        flavor: ['The trees are so big that standing beside them feels like trespassing.', 'You get lost for an hour and find your way back by the sound of the falls.', 'Something follows you through the fog, parallel to the trail. It stops when you stop.'] },
    ],
    inv: { label: 'Search past the switchbacks', desc: 'Leave the trail where the search parties turned back.', slots: [0, 1], req: { trait: 'nerve', level: 3 },
      flavor: 'You leave the trail where the orange search-party ribbons end and keep going.' },
  },
};

export const LOC_IDS = Object.keys(LOCATIONS) as LocId[];
