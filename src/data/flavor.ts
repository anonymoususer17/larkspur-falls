export const HEADLINES: string[] = [
  'LEDGER: "Search for Vale Girl Enters Third Week; Volunteers Thinning."',
  'KLRK morning report: Highway 9 closed past mile 14 for a logging truck rollover.',
  'LEDGER: "Mill Announces Record Quarter, Kittredge Pledges $5,000 to Search."',
  'Bea, over eggs: "Somebody\'s been stealing the pies off the Lantern\'s windowsill again."',
  'LEDGER: "Bonfire Committee Asks Residents to Bring Only Untreated Wood."',
  'KLRK: The weatherman says the fog this year is "personal."',
  'LEDGER: "Sheriff Pruitt: \'Every Lead Is Being Followed.\'"',
  'A note under the motel office door, unsigned: STOP LOOKING AT THE LAKE.',
  'LEDGER: "Owls Nesting in High School Bell Tower; Bell Silenced Until Spring."',
  'Bea, not looking up from the crossword: "Odessa used to deliver our paper, you know."',
  'LEDGER: "Psychic From Tacoma Leaves Town, Says Larkspur Is \'Too Loud.\'"',
  'KLRK: Lou reads the overnight requests on the morning show. One of them is just the number 312.',
  'LEDGER: "Elk Seen Walking Down Main Street at Dawn; No One Injured."',
  'Bea: "Room 9\'s acting up again. Don\'t go in there, sweetheart, the floor\'s bad."',
  'LEDGER: "Vale Family Offers Reward; Amount Undisclosed."',
  'Every radio in the diner hissed at once at 7:15. Then the music came back like nothing happened.',
];

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function dayName(day: number): string {
  return DAY_NAMES[day % 7];
}
export function dateLabel(day: number): string {
  return `October ${17 + day}`;
}
export function isWeekend(day: number): boolean {
  const d = day % 7;
  return d === 5 || d === 6;
}

export const INTRO: string[] = [
  'Larkspur Falls, Oregon.\nPopulation 4,212.\nOctober, 1990.',
  'Your mother put you on a northbound bus with one suitcase and a phone number. Aunt Bea runs the Starlite Motel out on Route 9, and she\'ll keep you for the fall, until things at home are "sorted out."',
  'Nine days before you got here, a sixteen-year-old named Odessa Vale rode her bike up to Whistle Falls and never came home.',
  'Two weeks from now the whole town will gather for the Harvest Bonfire and burn its old wood, the way it has every October for a hundred years.\n\n"After the Bonfire, people stop looking," Bea tells you. "They always do."',
  'You have fourteen days.\n\nThe people of this town know things they haven\'t told anyone. Get close to them, follow what you learn, and pay attention to your dreams.\n\nBy Bonfire night, you need to know who she was running from, where she is, and why.',
];
