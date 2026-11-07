import type { Category } from '../types';

export interface OptionDef { id: string; label: string; short: string }

export const QUESTIONS: Record<Category, string> = {
  who: 'Who was she running from?',
  where: 'Where is she now?',
  why: 'What did she have?',
};

export const OPTIONS: Record<Category, OptionDef[]> = {
  who: [
    { id: 'gideon', short: 'Gideon Kittredge', label: 'Gideon Kittredge, owner of the mill' },
    { id: 'moreau', short: 'Dr. Moreau', label: 'Dr. Sylvie Moreau, the school counselor' },
    { id: 'royce', short: 'Royce Abernathy', label: 'Royce Abernathy, who runs the Pines' },
    { id: 'pruitt', short: 'Sheriff Pruitt', label: 'Sheriff Dale Pruitt' },
    { id: 'none', short: 'No one', label: 'No one. She went on her own.' },
  ],
  where: [
    { id: 'annex', short: 'Mill No. 2', label: 'Mill No. 2, the sealed annex' },
    { id: 'tower', short: 'The lookout', label: 'The fire lookout on Kettle Ridge' },
    { id: 'boathouse', short: 'The boathouse', label: 'The old boathouse across Silverlake' },
    { id: 'room9', short: 'Room 9', label: 'Room 9 at the Starlite Motel' },
    { id: 'glade', short: 'The Black Glade', label: 'The Black Glade, past the end of the trail' },
  ],
  why: [
    { id: 'ledger', short: 'Fire ledgers', label: 'Payroll ledgers from the 1979 mill fire' },
    { id: 'tapes', short: 'Session tapes', label: 'Recordings of her own therapy sessions' },
    { id: 'money', short: 'The money', label: 'A bag of the roadhouse\'s money' },
    { id: 'wreck', short: 'Hit-and-run', label: 'Proof of a buried hit-and-run' },
    { id: 'call', short: 'The calling', label: 'Nothing. She was answering something in her dreams.' },
  ],
};

export interface Scenario {
  who: string; where: string; why: string;
  title: string;
  truth: string;
  rescue: string;
}

export const SCENARIOS: Scenario[] = [
  {
    who: 'gideon', where: 'annex', why: 'ledger',
    title: 'The Ledger',
    truth: 'In 1979, Gideon Kittredge paid the night crew to stay home so that Mill No. 2 would burn for the insurance. Two men didn\'t get the message.\n\nOdessa found the payroll ledger with every payment written down. When she confronted Gideon, he locked her in the sealed annex. Since then he\'s been bringing her soup and lamp oil while he decides what to do with her.',
    rescue: 'The annex door gives way on the third try. Odessa is next to the old boiler, wrapped in a mill blanket, with the ledger page sewn into her coat lining. "Took you long enough," she says, and then she starts crying.\n\nBy morning the state police are in the Kittredge driveway.',
  },
  {
    who: 'moreau', where: 'tower', why: 'tapes',
    title: 'The Tapes',
    truth: 'Dr. Sylvie Moreau believed the town\'s missing children were connected, and that Odessa could remember something about them. Off the books, she hypnotized Odessa again and again and taped every session.\n\nOn the tapes, Odessa heard herself describing places she\'d never been. She stole them and hid in the old fire lookout, the one place Moreau couldn\'t follow without having to explain herself.',
    rescue: 'She\'s in the lookout\'s glass room, wearing a ranger\'s coat, with the cassettes stacked around her. She hasn\'t really slept in days because she\'s afraid of what she\'ll say in her sleep.\n\n"Don\'t listen to them," she says. Moreau loses her license before Christmas.',
  },
  {
    who: 'royce', where: 'boathouse', why: 'money',
    title: 'The Route',
    truth: 'Odessa found out that Royce Abernathy was laundering money for some men from Portland through the Pines. She took one bag, nineteen thousand dollars, meaning to run with it and keep Teo out of it. Royce needed it back before Portland noticed it was missing.\n\nShe\'s been hiding across the lake in the old Halloran boathouse, waiting on a ride that never came.',
    rescue: 'You row across at dusk. The new padlock is on the inside of the door, and she only opens it when she recognizes a voice. The bag is all there. She hasn\'t spent a dollar.\n\n"I was going to give it back," she says. "Eventually." Royce is gone before the state police arrive.',
  },
  {
    who: 'pruitt', where: 'room9', why: 'wreck',
    title: 'The Fender',
    truth: 'In August, Sheriff Dale Pruitt drove home drunk from the Elks lodge and hit a man walking on Route 9. He left him there, wrote it up as exposure, and had his cruiser repaired two counties away.\n\nOdessa photographed the dented fender. The night Pruitt came to her house "to talk," she climbed out her window and ran to the one adult she trusted. Aunt Bea has been hiding her in Room 9 this whole time, just down the hall from you.',
    rescue: 'Bea\'s hands are shaking as she unlocks Room 9. "I didn\'t know who I could trust. You included, at first."\n\nOdessa is sitting on the bed with the Polaroid. With other people backing her up, the state police finally take her seriously.',
  },
  {
    who: 'none', where: 'glade', why: 'call',
    title: 'The Song',
    truth: 'Nobody took Odessa Vale. She heard the same thing the girl in 1962 and the boy in 1979 heard: a song under the static. She walked to the Black Glade believing she could answer it and come back.\n\nShe very nearly didn\'t.',
    rescue: 'Past the end of the trail the trees form a black ring, and between two of them the air is folded. You all keep calling her name until the humming on the other side stops.\n\nOdessa walks out barefoot, with frost in her hair. She thinks she\'s been gone about an hour.',
  },
];

/** Three clues that point to each option (used only when it's the answer). */
export const POINTERS: Record<string, string[]> = {
  // WHO
  gideon: [
    'Gideon Kittredge paid cash for the search flyers, then asked the printer to leave off the description of her bike.',
    'The night she vanished, Gideon\'s truck sat idling at the edge of the mill yard at 2 a.m. with its lights off.',
    'Odessa had written "G.K. knows I know" inside a matchbook from the Kittredge Christmas party.',
    'Gideon Kittredge has quietly offered Odessa\'s mother money to "stop talking to reporters."',
  ],
  moreau: [
    'Dr. Moreau\'s appointment book has Odessa down for "extended sessions": late evenings, off school grounds.',
    'Dr. Moreau called in her own worried report about Odessa two hours before anyone else knew she was gone.',
    'Odessa told a friend: "She says I remember things I don\'t. She says she can help me remember more."',
    'Dr. Moreau has driven up the Kettle Ridge road three evenings this week, and comes back down after dark.',
  ],
  royce: [
    'Royce Abernathy keeps asking around town whether anyone has seen Odessa. He sounds like someone who lost something, not someone.',
    'Royce paid the Pines\' bartender to say he was home the night she disappeared.',
    'Odessa\'s last call from the diner payphone went to the Pines\' back office. That\'s Royce\'s private line.',
    'Two men in a car with Multnomah County plates have been parked outside the Pines every night, waiting on Royce.',
  ],
  pruitt: [
    'Sheriff Pruitt took the case file off Deputy Brandt\'s desk on day two and locked it in his own drawer.',
    'Pruitt\'s cruiser was repainted at a shop two counties over, the same week Odessa started asking questions.',
    'Odessa called the state police tip line from the library. She hung up when they asked for her name, and the sheriff\'s.',
    'Sheriff Pruitt drove out to the Vale house the night she vanished. Off duty, alone, lights off.',
  ],
  none: [
    'There was no sign of a struggle anywhere. Her bike was parked neatly at the overlook, kickstand down.',
    'Odessa left a note under her pillow that her mother never showed the police: "Don\'t come after me. I\'m going where it\'s calling from."',
    'In the weeks before, Odessa gave her things away: her records to a friend, her jacket to Teo, her diary to the lake.',
    'Every person with a reason to hurt Odessa can prove where they were that night. It\'s as if no one took her at all.',
  ],
  // WHERE
  annex: [
    'Fresh tire tracks run through the chained gate of Mill No. 2, which has been sealed since the \'79 fire.',
    'Someone has been buying canned soup and lamp oil at the general store and charging it to the mill\'s account.',
    'The night watchman says the annex\'s old boiler has been warm to the touch for a week.',
    'A child\'s voice was heard singing inside Mill No. 2 at shift change. The foreman told everyone to forget it.',
  ],
  tower: [
    'Lights have been seen at night up on Kettle Ridge, where the old fire lookout stands.',
    'Odessa checked "Fire Lookouts of the Cascades" out of the library three times. The last copy never came back.',
    'A ranger found fresh footprints, small ones, on the switchbacks below the lookout tower.',
    'Someone hauled two five-gallon water jugs up the Kettle trail. The jugs are missing from the school gym.',
  ],
  boathouse: [
    'The old Halloran boathouse across Silverlake has a brand-new padlock, even though the rest of it is rotting.',
    'A canoe went missing from the public dock the night she vanished. It turned up the next morning on the wrong side, still wet.',
    'Thin smoke rises from the far shore of Silverlake every dawn, like a small stove fire.',
    'Odessa used to swim across Silverlake every summer. She knew every inlet on the far side.',
  ],
  room9: [
    'Aunt Bea carries a second dinner tray up the back stairs every night and comes down with it empty.',
    'Room 9\'s curtains are always drawn, but its radiator has been ticking all week.',
    'The Starlite\'s laundry log shows fresh towels going to Room 9 every day. Room 9 is supposed to be out of service.',
    'Aunt Bea changed the lock on Room 9 the day after Odessa vanished. She paid the locksmith in cash.',
  ],
  glade: [
    'Odessa drew the same picture over and over in her notebook: a ring of black trees with a doorway between two of them.',
    'Search dogs followed her scent to the end of the Kettle trail, then sat down and refused to go any farther.',
    'Hunters talk about a clearing past the end of the trail where the birds go quiet and compass needles drift.',
    'Both the girl lost in 1962 and the boy lost in 1979 were last seen walking toward the end of the Kettle trail.',
  ],
  // WHY
  ledger: [
    'Odessa pulled the 1979 Mill Fire Inquiry up on the library microfiche three times in one week.',
    'A page torn from a mill payroll ledger, dated the week of the fire, was found folded inside her algebra book.',
    'Odessa asked an old millworker: "Who was paid not to be there the night of the fire?"',
    'Two names in the 1979 fire report have a pencil circle around them in Odessa\'s library copy.',
  ],
  tapes: [
    'Someone broke into the counseling office the week before she vanished. The only thing taken was a cassette box labeled "VALE, O."',
    'Odessa told someone she had heard her own voice on a tape saying things she didn\'t remember saying.',
    'A cassette label in Odessa\'s handwriting reads: "PROOF — sessions 4 through 9."',
    'Odessa bought a portable tape player and eight blank cassettes at the pharmacy the week before she vanished.',
  ],
  money: [
    'The Pines Roadhouse came up $19,000 short the week she vanished. Nobody called the police about it.',
    'Odessa asked a trucker at the diner how far nineteen thousand dollars would get a person.',
    'A zippered Pines bank bag was found snagged on a branch along the lakeshore.',
    'Odessa paid her overdue library fines in crisp new twenties. She had never had money before.',
  ],
  wreck: [
    'In August, a drifter was found dead on Route 9. The report says "exposure." The coroner\'s notes say "blunt impact."',
    'Odessa had a Polaroid of a dented police-issue fender, with a date written in the white border.',
    'Odessa asked the body shop man in Hale who had brought in a cruiser in August to be fixed "quiet."',
    'Odessa cut every article about Route 9 out of the Ledger and taped them inside her locker door.',
  ],
  call: [
    'Odessa slept less and less. Her mother found her sleepwalking toward the treeline three nights in a row.',
    'Odessa called KLRK at 3 a.m. and requested a song that doesn\'t exist. Then she hummed it on the air.',
    'Every clock in Odessa\'s room stopped at 3:12. Her mother hasn\'t restarted them.',
    'Odessa\'s last school essay ended mid-sentence: "If you hear it, you have to answer, or it keeps calling until—"',
  ],
};

/** One clue that eliminates each option (used only when it's wrong). */
export const ELIMS: Record<string, string> = {
  gideon: 'Gideon Kittredge was in a Portland hospital the night she vanished, having his gallbladder out. The bill is real.',
  moreau: 'Dr. Moreau was chaperoning the debate team in Eugene that whole weekend. Twelve students can vouch for her.',
  royce: 'Royce Abernathy spent that whole week in the Clatsop County lockup on a bar-fight charge.',
  pruitt: 'Sheriff Pruitt was at the state sheriffs\' conference in Salem all that week. He\'s in the minutes and in the photographs.',
  none: 'Odessa\'s bedroom window was forced from the outside. Someone came for her.',
  annex: 'The insurance inspectors gutted Mill No. 2 last month. There\'s no floor left in there to stand on.',
  tower: 'The stairs of the Kettle Ridge lookout collapsed in the spring storms. No one has climbed it since April.',
  boathouse: 'The Halloran boathouse burned down to the waterline in August. All that\'s left is pilings.',
  room9: 'Room 9 at the Starlite flooded in the September rains. The floor is torn up to the joists.',
  glade: 'The "Black Glade" is a burn scar from 1952, and the forest service surveyed every inch of it in September. No one is there.',
  ledger: 'The 1979 fire ledgers were subpoenaed and made public years ago. There is nothing secret left in them.',
  tapes: 'The counseling office doesn\'t keep recordings. The district banned them years ago, and the drawers are empty.',
  money: 'The Pines\' books balance to the dime. The state auditor went through them last week.',
  wreck: 'The only hit-and-run on Route 9 in ten years was solved within a week. That driver is in prison in Salem.',
  call: 'Odessa\'s Portland doctor says she slept eight hours a night and never remembered a single dream. She took her prescription faithfully.',
};

export const DREAMS: Record<string, string> = {
  gideon: 'A man in a red flannel coat counts trees with a pocket watch, and each tree falls as he counts it. He doesn\'t look up. "Every board has a price," he says, "and every price has a name."',
  moreau: 'A woman sits in an armchair in the middle of the lake, holding a notepad. "Close your eyes," she says, "and tell me what you didn\'t see." The ice under you turns out to be cassette tape.',
  royce: 'A man in a bowling shirt deals cards across a bar. Every card is a twenty-dollar bill with Odessa\'s face where the president should be. "House always collects," he says, not unkindly.',
  pruitt: 'A tin star is caught in a car\'s grille, glinting and singing. The headlights blink in Morse code: SORRY SORRY SORRY.',
  none: 'Odessa walks ahead of you through the woods. No one is chasing her, and she isn\'t afraid. She turns around and puts a finger to her lips.',
  annex: 'You walk down a hallway built of stacked lumber. Somewhere behind it, a boiler breathes like a sleeping animal. Ash falls upward.',
  tower: 'A lighthouse stands in the middle of a forest, its beam sweeping the treetops for a ship. A small figure in a ranger\'s coat waits in the lamp room.',
  boathouse: 'The lake is a mirror. On the far shore, a door made of wet planks is knocking from the inside. Oars dip, one-two, one-two, with no boat under them.',
  room9: 'You\'re home at the motel. Every room key is on its hook but one. A brass number hangs from a nail upside down, a six that is really a nine.',
  glade: 'The trees stand in a ring, black as wet ink. Between two of them the air is folded like a curtain, and something on the other side is humming your name.',
  ledger: 'Pages from a ledger blow down an empty street like leaves. Each page is a column of names, and next to each name is a struck match.',
  tapes: 'A tape recorder sits on a dinner plate, playing your voice saying things you never said. You can\'t find the stop button. The plate is very cold.',
  money: 'A bank bag sits on a church pew. You open it and find it full of pine needles that smell like the inside of a car.',
  wreck: 'A deer stands on the yellow line of Route 9. Headlights come and go and come again. Then the deer is gone, and something else is lying there.',
  call: 'A song is playing from somewhere inside the ground. You know every note of it, though you\'ve never heard it before. Odessa is singing harmony, and she sounds happy.',
};

export const LORE: string[] = [
  'Odessa was a junior and first-chair clarinet. She had perfect attendance until three weeks before she vanished.',
  'Larkspur\'s oldest tradition is the Harvest Bonfire: on the last Sunday of October, the whole town burns its old wood.',
  'Odessa\'s bike was a blue Schwinn with a bell she had painted gold. It was found at the Whistle Falls overlook.',
  'Odessa used to sit in the last booth at the Lantern and write in a green notebook. The notebook is missing.',
  'Nobody in town says it out loud, but this has happened before: a girl in 1962, and a boy in 1979.',
  'Odessa\'s last English essay was titled "What the Town Keeps." Her teacher gave it an A and wrote "Be careful" in the margin.',
  'Odessa\'s mother still sets a place for her at dinner, and still leaves the porch light on.',
];
