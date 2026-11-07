import type { CharId, LocId, Slot, Trait } from '../types';

export interface Choice { t: string; q: 0 | 1 | 2; r: string }
export interface Scene { text: string; choices: Choice[] }
type Opts = (LocId | null)[];

export interface CharDef {
  id: CharId;
  name: string;
  short: string;
  role: string;
  blurb: string;
  color: string;
  trait: Trait;
  /** scene index -> requirement to play it */
  gates: Partial<Record<number, [Trait, number]>>;
  sched: { wk: [Opts, Opts, Opts]; we: [Opts, Opts, Opts] };
  scenes: Scene[];
  /** line used when the rank-4 secret is withheld */
  withhold: string;
  crisis: { loc: LocId; slot: Slot; warn: string; success: string; cold: string; missed: string };
  epi: { high: string; mid: string; low: string; lost: string };
}

export const CHARS: Record<CharId, CharDef> = {
  marnie: {
    id: 'marnie',
    name: 'Marnie Coyle',
    short: 'Marnie',
    role: 'Waitress, the Lantern Diner',
    blurb: 'Works doubles to pay for her mother\'s medicine. Babysat Odessa years ago.',
    color: '#ff7aa8',
    trait: 'charm',
    gates: { 2: ['charm', 2], 4: ['empathy', 3] },
    sched: {
      wk: [['diner'], ['diner', 'diner', null], ['diner', 'roadhouse']],
      we: [['diner'], ['lake', 'diner', null], ['roadhouse', 'diner']],
    },
    scenes: [
      {
        text: 'Marnie pours your coffee before you\'ve sat down. Someone has drawn a skull on her name tag in ballpoint.\n\n"Bea showed me your school picture. You had a bowl cut."',
        choices: [
          { t: 'I did. It was a choice.', q: 2, r: '"Respect." She leaves the pot on your side of the counter.' },
          { t: 'Did you know Odessa?', q: 1, r: '"Since she was four. Can I take your order first?"' },
          { t: 'I\'m going to find out what happened to her.', q: 0, r: '"Okay." She goes off to refill someone else\'s cup and is slow coming back.' },
        ],
      },
      {
        text: 'After the rush, Marnie counts her tips into stacks. "Ninety-one dollars. Mom\'s inhaler costs sixty."',
        choices: [
          { t: 'Does she have insurance?', q: 2, r: '"She has me." Marnie slides a quarter over. "Put something on the jukebox. Not the Eagles."' },
          { t: 'That\'s rough.', q: 1, r: '"It\'s a Tuesday."' },
          { t: 'You should ask for a raise.', q: 0, r: '"Huh. Never thought of that." The stacks go into her apron.' },
        ],
      },
      {
        text: 'On her smoke break, Marnie holds the pack out to you. "Odessa used to take one and never light it. She just liked holding it."\n\nShe pauses. "Those last few weeks, she\'d check the parking lot before she walked out to her bike."',
        choices: [
          { t: 'Who was she looking for?', q: 2, r: '"She never said, and I didn\'t push. I think about that a lot."' },
          { t: 'Take one and don\'t light it.', q: 1, r: 'Marnie snorts. "You look ridiculous." She doesn\'t ask for it back.' },
          { t: 'Did she have a boyfriend?', q: 0, r: '"Ask the cops. They loved that question."' },
        ],
      },
      {
        text: 'Marnie flips the sign to CLOSED and sits down across from you in the back booth.\n\n"Three days before she disappeared, she asked me to drive her to the Greyhound in Hale. That same night. I had a double in the morning, so I said no."',
        choices: [
          { t: 'Then help me now.', q: 2, r: 'She studies you for a long moment, then nods. "Okay. There\'s something I didn\'t tell the deputies."' },
          { t: 'You couldn\'t have known.', q: 1, r: '"I could have asked her why." That\'s all she says.' },
          { t: 'Did you tell the police?', q: 0, r: '"Tell them I was tired?" She gets up to wipe down a table that\'s already clean.' },
        ],
      },
      {
        text: 'Marnie puts a car key on the counter. "My Nova. The passenger door doesn\'t open. If you ever need to get somewhere fast, take it."\n\nShe tops off your coffee. "Mom and I are leaving after the Bonfire. Tucson. The dry air\'s good for her lungs."',
        choices: [
          { t: 'Send me the ugliest postcard you can find.', q: 2, r: '"Deal." She taps the key. "And on Sunday, if you need a driver, I\'ll drive."' },
          { t: 'Are you sure?', q: 1, r: '"No. That\'s why I bought the tickets before I could change my mind."' },
          { t: 'You can\'t leave while she\'s still missing.', q: 0, r: '"Watch me," she says, quietly. She doesn\'t look at you for the rest of your coffee.' },
        ],
      },
    ],
    withhold: 'Marnie starts to say something, but the bell over the door rings and she goes to seat a family. She doesn\'t come back to it.',
    crisis: {
      loc: 'diner', slot: 2,
      warn: 'Bea says the Lantern\'s phone has been ringing since noon, and Marnie sounded strange when she answered it.',
      success: 'You find Marnie on the floor behind the counter. She\'s pulled the phone cord out of the wall. "Every fifteen minutes. Somebody breathing, and then a song."\n\nAt 11:40 the payphone outside starts ringing, and you answer it together. The caller says one sentence and hangs up. After that, Marnie tells you what she\'s been too scared to say out loud.',
      cold: 'Marnie lets you in, but she keeps checking the window. Before midnight she says she\'s fine and sends you home.',
      missed: 'In the morning there\'s a sign taped to the Lantern\'s door: CLOSED UNTIL FURTHER NOTICE. Marnie\'s car is gone.',
    },
    epi: {
      high: 'In December you get a postcard from Tucson with the ugliest cactus you\'ve ever seen. On the back: "Black, no sugar. Come visit."',
      mid: 'For a while after you leave, Marnie keeps your mug behind the counter.',
      low: 'Marnie pours coffee for strangers, and you were one of them.',
      lost: 'Marnie left town the night you didn\'t show up. No one at the Lantern brings her up.',
    },
  },

  hal: {
    id: 'hal',
    name: 'Deputy Hal Brandt',
    short: 'Hal',
    role: 'Sheriff\'s deputy',
    blurb: 'A patient, stubborn birdwatcher. He suspects his own boss is slowing down the case.',
    color: '#e8b44c',
    trait: 'nerve',
    gates: { 2: ['nerve', 2], 4: ['insight', 3] },
    sched: {
      wk: [['station'], ['station', 'diner'], ['diner', null, null]],
      we: [['diner'], ['woods', 'station'], [null]],
    },
    scenes: [
      {
        text: 'A deputy is pinning flyers to a corkboard that\'s already full of them. "If you\'ve got a tip, there\'s a form," he says without turning around. "If you\'ve got a theory, there\'s a longer form."',
        choices: [
          { t: 'No theory. Want a hand?', q: 2, r: 'He passes you the box of pushpins, and you work for twenty minutes without talking. "Thanks," he says at the end. "I\'m Hal."' },
          { t: 'Where\'s the sheriff?', q: 1, r: '"Busy." He pins up another flyer. "That\'s the official answer."' },
          { t: 'People say the boyfriend did it.', q: 0, r: '"People say a lot of things." He goes back to the board.' },
        ],
      },
      {
        text: 'Hal takes you to the trailhead with a pair of binoculars. "Varied thrush," he says, pointing at nothing you can see.\n\nThen: "Day two, the sheriff took the Vale file off my desk."',
        choices: [
          { t: 'What did you do?', q: 2, r: '"...I photocopied it first." He keeps the binoculars up. "Keep that to yourself."' },
          { t: 'That\'s strange.', q: 1, r: '"It\'s procedure," he says, like he doesn\'t believe it either.' },
          { t: 'Maybe he\'s handling it himself.', q: 0, r: '"Maybe." He doesn\'t say anything else for the rest of the walk.' },
        ],
      },
      {
        text: 'Hal wants to check the old logging road after dark, off the record. "You stay in the truck."\n\nHalfway up, something big crashes through the brush, and the headlights die.',
        choices: [
          { t: 'Grab the flashlight and get out.', q: 2, r: 'It\'s an elk, gone before you get a good look. Hal lets out a shaky laugh. "I told you to stay in the truck." "Yeah." "Okay. Good."' },
          { t: 'Stay in the truck.', q: 1, r: 'Hal comes back a minute later. "Elk." He gets the headlights going again by hitting the dash.' },
          { t: 'Lean on the horn.', q: 0, r: 'The sound carries across the whole valley. Hal turns the truck around without a word.' },
        ],
      },
      {
        text: 'After hours, Hal spreads his photocopies across the desk. "If I\'m wrong about this, I lose my job. If I\'m right and I sit on it..." He doesn\'t finish.',
        choices: [
          { t: 'Show me what you have.', q: 2, r: 'He hesitates. Then he turns a page toward you and puts his finger on one line.' },
          { t: 'Go over the sheriff\'s head.', q: 1, r: '"The state police would just call him first." He leaves the papers out, though.' },
          { t: 'It\'s not worth your job.', q: 0, r: 'He squares the pages into a stack and locks them in a drawer.' },
        ],
      },
      {
        text: 'Hal sets his badge on the table. "I\'m calling the state police tomorrow. I\'ll probably get fired."\n\nHe turns the badge over. "This was my dad\'s. He\'d have made the call weeks ago."',
        choices: [
          { t: 'Then make it.', q: 2, r: 'He pins the badge back on, slightly crooked. "If you need me Sunday, call the station. I\'ll come."' },
          { t: 'Are you ready for that?', q: 1, r: '"No. I\'m doing it anyway."' },
          { t: 'Maybe wait until after the Bonfire.', q: 0, r: '"Everybody in this town waits until after the Bonfire." He puts the badge in his pocket.' },
        ],
      },
    ],
    withhold: 'Hal reaches for a page and then stops. "Not yet. I don\'t know you well enough."',
    crisis: {
      loc: 'woods', slot: 1,
      warn: 'At breakfast you hear that Deputy Brandt was suspended this morning. His truck was seen heading for the Kettle Ridge trailhead with a rifle in the rack.',
      success: 'Hal is a mile up the trail, sitting on a stump with the rifle across his knees. He doesn\'t seem sure what he came up here to do. You sit with him until it gets dark.\n\nOn the walk down, he tells you what he found in the sheriff\'s drawer.',
      cold: '"Go home, kid," Hal says. He stays on the stump.',
      missed: 'Hal turned in his badge and left town that night. His desk at the station has been cleared out.',
    },
    epi: {
      high: 'By spring, Hal is sheriff. He hangs a bird feeder outside the station.',
      mid: 'Sometimes Hal nods to you on the street.',
      low: 'Hal goes on writing parking tickets. The corkboard stays full.',
      lost: 'Nobody knows where Hal went, and the station never replaced him.',
    },
  },

  teo: {
    id: 'teo',
    name: 'Teo Abernathy',
    short: 'Teo',
    role: 'Odessa\'s boyfriend',
    blurb: 'The town\'s favorite suspect. Can\'t stand being pitied. His brother Royce runs the Pines.',
    color: '#ff7a3a',
    trait: 'empathy',
    gates: { 2: ['empathy', 2], 4: ['nerve', 3] },
    sched: {
      wk: [['school'], ['falls', 'school', null], ['roadhouse', 'roadhouse', 'falls']],
      we: [[null], ['falls', 'lake'], ['roadhouse', 'falls']],
    },
    scenes: [
      {
        text: 'Teo Abernathy sits on his motorcycle at the edge of the school lot, eating sunflower seeds. The other kids walk the long way around him.\n\n"You\'re the new one. Has anyone told you I did it yet?"',
        choices: [
          { t: 'They have. I don\'t know you, so I don\'t have an opinion.', q: 2, r: '"Huh." He holds out the bag of seeds. "That\'s new."' },
          { t: 'Did you?', q: 1, r: '"No." He spits out a shell. "You\'re the first person to actually ask me."' },
          { t: 'I\'m sorry about your girlfriend.', q: 0, r: '"Everybody\'s sorry." He kicks the bike on.' },
        ],
      },
      {
        text: 'Teo is at the falls overlook, flicking pebbles over the rail. "She said it sounds like a radio between stations."\n\nHe nods at the railing. "Her bike was right there. Kickstand down."',
        choices: [
          { t: 'What was she like?', q: 2, r: 'He thinks about it. "She ate fries one at a time. She was terrible at the clarinet and kept playing anyway." Once he starts, he keeps going for a while.' },
          { t: 'She might still come back.', q: 1, r: '"Maybe." He flicks another pebble.' },
          { t: 'Where were you that night?', q: 0, r: '"Home." He leaves without another word.' },
        ],
      },
      {
        text: 'Teo turns up at the Starlite at midnight with split knuckles. "Some guy at the Pines said she ran off with somebody from Hale."\n\nHe sits down on the curb. "Royce says I\'m bad for business."',
        choices: [
          { t: 'Get Bea\'s first-aid kit.', q: 2, r: 'He lets you clean up his hand. "You\'ve done this before." "It\'s a motel. People trip on the stairs." He laughs once, through his nose.' },
          { t: 'Did it help?', q: 1, r: '"For about four seconds."' },
          { t: 'That makes you look guilty.', q: 0, r: '"Yeah, I know how it looks." He gets back on the bike.' },
        ],
      },
      {
        text: 'Behind the Pines, Teo sits on a milk crate by the dumpster. "I wasn\'t home that night. I was here, waiting for her. She was supposed to come at ten."\n\nHe picks at the tape on his knuckles. "If I tell the cops, they start looking at Royce too."',
        choices: [
          { t: 'They need the real timeline.', q: 2, r: 'He\'s quiet for a while. Then he tells you the rest.' },
          { t: 'I won\'t say anything.', q: 1, r: '"Thanks." He doesn\'t say anything more.' },
          { t: 'So you lied to me too.', q: 0, r: '"I lied to everybody." He goes back inside.' },
        ],
      },
      {
        text: 'Teo hands you his spare helmet. You ride out Route 9 at dusk until the town lights are gone. He pulls into a turnout and cuts the engine.\n\n"Whatever you\'re doing on Sunday, I want in."',
        choices: [
          { t: 'Okay. You\'re in.', q: 2, r: 'He nods, like he was ready for you to argue. "Okay."' },
          { t: 'You don\'t have to.', q: 1, r: '"I know."' },
          { t: 'You\'re a suspect. You should stay out of it.', q: 0, r: 'He puts his helmet back on and rides you home without a word.' },
        ],
      },
    ],
    withhold: 'Teo starts to say something, then shakes his head. "Forget it."',
    crisis: {
      loc: 'falls', slot: 2,
      warn: 'Royce Abernathy called the motel at dawn. Teo took the pistol from under the bar and has been telling people he\'ll be at Whistle Falls tonight to meet whoever did it.',
      success: 'Teo is at the overlook in the dark, pistol in hand, waiting. No one else comes. After an hour he hands the gun to you, then takes it back and throws it into the falls himself.\n\nSitting on the wet rock, he tells you who he thought was coming, and why.',
      cold: 'Teo lets you wait with him, but he keeps the gun. At 2 a.m. he rides home.',
      missed: 'Teo was arrested at the overlook at dawn with an unregistered pistol. No visitors are allowed.',
    },
    epi: {
      high: 'Teo graduates in June. At the ceremony he plays the clarinet, badly, on purpose.',
      mid: 'Teo leaves town after Thanksgiving. He waves as he rides past the motel.',
      low: 'Long after it stops making sense, the town still calls Teo a suspect.',
      lost: 'Teo is in county lockup, and his bike is rusting in the Pines\' parking lot.',
    },
  },

  ida: {
    id: 'ida',
    name: 'Ida Rook',
    short: 'Ida',
    role: 'Lives on a houseboat. Listens to static.',
    blurb: 'Spends hours listening to a radio tuned between stations. Her weather forecasts are usually right.',
    color: '#5fd0b8',
    trait: 'insight',
    gates: { 2: ['insight', 2], 4: ['empathy', 3] },
    sched: {
      wk: [['lake'], ['library', 'lake'], [null]],
      we: [['lake', 'library'], ['library', 'lake'], [null]],
    },
    scenes: [
      {
        text: 'A silver-haired woman in a heavy coat sits on a bucket at the end of the dock, a transistor radio held to her ear. It\'s tuned to static. Before you can say anything, she holds up one finger.',
        choices: [
          { t: 'Sit down and wait.', q: 2, r: 'A few minutes later she lowers the radio. "Ida," she says. "You can sit there again tomorrow if you like."' },
          { t: 'What are you listening for?', q: 1, r: '"The hour," she says, and puts the radio back to her ear.' },
          { t: 'That\'s just static.', q: 0, r: '"Mostly," she says, and turns her back to you.' },
        ],
      },
      {
        text: 'Ida hands you a mug of tea that tastes like pine needles. "Have you been sleeping all right since you got here?"',
        choices: [
          { t: 'I\'ve had some strange dreams.', q: 2, r: '"Write them down as soon as you wake up, in order. People always leave out the boring parts. The boring parts matter."' },
          { t: 'Fine, mostly.', q: 1, r: '"Mm." She doesn\'t believe you.' },
          { t: 'Why do you want to know?', q: 0, r: '"I don\'t, much." She finishes her tea.' },
        ],
      },
      {
        text: 'Ida walks you along the shore in the fog. "A girl went missing in 1962, and a boy in 1979. Both times, the town decided it was an accident."\n\n"What do you make of that?"',
        choices: [
          { t: 'Either someone\'s copying a pattern, or there really is one.', q: 2, r: '"Good. Don\'t pick one yet."' },
          { t: 'That the town is cursed.', q: 1, r: '"People say that when they want to stop thinking about it."' },
          { t: 'Probably a coincidence.', q: 0, r: '"Seventeen years apart, both times." She walks on ahead of you.' },
        ],
      },
      {
        text: 'Ida\'s houseboat is full of radios, each tuned to a different patch of static. "Odessa used to come here. She heard something in it, same as I do."\n\nShe turns a dial. "I told her to keep listening. I wish I hadn\'t."',
        choices: [
          { t: 'What did she hear?', q: 2, r: 'Ida turns every radio up at once, then leans in close so you can hear her over the noise, and tells you.' },
          { t: 'You couldn\'t have known what would happen.', q: 1, r: '"No. I couldn\'t."' },
          { t: 'So it\'s partly your fault.', q: 0, r: 'She turns off every radio. "You should go."' },
        ],
      },
      {
        text: 'Ida ties a small brass bell around your wrist with red thread. "If you get turned around out there, ring it. I don\'t know if it works. My mother swore it did."',
        choices: [
          { t: 'Come with me on Sunday.', q: 2, r: 'She thinks it over. "I\'ll need a hand on the trail." Then she smiles. "All right."' },
          { t: 'Thank you, Ida.', q: 1, r: '"Ring it if you need to. That\'s all I ask."' },
          { t: 'Do you actually believe in this?', q: 0, r: '"I believe it\'s a bell." She goes back inside.' },
        ],
      },
    ],
    withhold: 'Ida turns the dial back down. "Not yet. Come back another time."',
    crisis: {
      loc: 'lake', slot: 2,
      warn: 'The fog came in before dawn and still hasn\'t lifted. At sunrise a fisherman saw Ida on her dock, radio turned all the way up, talking to the water.',
      success: 'Ida is waist-deep in the lake, holding the radio over her head and wading toward the middle. You go in after her and drag her back to shore.\n\nOn the houseboat, wrapped in blankets and still shaking, she tells you what the radio said.',
      cold: 'You get Ida out of the water, but tonight she doesn\'t seem to know who you are. She hums the same four notes until morning.',
      missed: 'Ida\'s houseboat drifted loose overnight. It was found in the reeds, empty, with every radio still on.',
    },
    epi: {
      high: 'That winter, all of Ida\'s radios go quiet at once. She says she sleeps better now.',
      mid: 'Ida still sits on the dock with her radio, and she nods when you walk by.',
      low: 'You never did find out what the woman on the dock was listening for.',
      lost: 'No one sits at the end of the dock anymore.',
    },
  },

  wes: {
    id: 'wes',
    name: 'Wes Kittredge',
    short: 'Wes',
    role: 'Heir to the Kittredge mill',
    blurb: 'Class president whose father owns the mill. Odessa tutored him in chemistry.',
    color: '#5b8cff',
    trait: 'charm',
    gates: { 2: ['charm', 2], 4: ['insight', 3] },
    sched: {
      wk: [['school'], ['mill', 'school', 'mill'], ['roadhouse', null]],
      we: [['mill', null], ['mill', 'lake'], ['roadhouse', null]],
    },
    scenes: [
      {
        text: 'Wes Kittredge, the class president, stops at your locker with a clipboard. "I\'m supposed to give you the welcome packet. It\'s a map and a coupon for the Lantern."\n\n"I assume someone\'s already told you my family owns the mill."',
        choices: [
          { t: 'And the bank, and the hardware store.', q: 2, r: '"Not the hardware store. That\'s the Lindqvists. They hate us." For the first time, he looks interested in you.' },
          { t: 'Did you know Odessa?', q: 1, r: '"She tutored me in chemistry." He glances down at the clipboard. "I\'m still bad at chemistry."' },
          { t: 'Must be nice.', q: 0, r: '"Enjoy the coupon," he says, and moves on to the next locker.' },
        ],
      },
      {
        text: 'Wes takes you out on the catwalk over the mill pond. "My dad wants me to run this place. My mom wants me at Dartmouth."\n\nHe drops a bottle cap into the water. "Odessa asked me what I wanted. Nobody had ever asked me that."',
        choices: [
          { t: 'What did you tell her?', q: 2, r: '"That I didn\'t know." He watches the cap float. "I still don\'t. Something without trees."' },
          { t: 'Were you two close?', q: 1, r: '"We were friends. People assumed more than that, and we let them."' },
          { t: 'Those are pretty nice problems to have.', q: 0, r: '"Yeah, I know." He climbs back down the ladder.' },
        ],
      },
      {
        text: 'Wes sneaks you into his family\'s fundraiser for the search at the country club. "Every adult here wants something from my dad. Help me survive this."\n\nAcross the room, Gideon Kittredge is working the crowd. Wes is on his third drink.',
        choices: [
          { t: 'Grab two plates of shrimp and steer him out to the terrace.', q: 2, r: 'Out on the terrace, Wes eats both plates and laughs until he has to sit down. "Nobody\'s ever gotten me out of one of these before."' },
          { t: 'Keep the adults busy so he can slip out.', q: 1, r: 'It works. Later he thanks you, though he seems a little thrown by how easy you made it look.' },
          { t: 'Maybe slow down.', q: 0, r: 'He puts his glass down, picks up a full one, and walks off.' },
        ],
      },
      {
        text: 'Wes meets you at the mill pond at sunset, sober. "I\'ve been going through my dad\'s study. I don\'t know what I\'ll do if I find something."',
        choices: [
          { t: 'Find it first. Decide after.', q: 2, r: 'He nods slowly and pulls a folded paper out of his jacket. "I already found something."' },
          { t: 'You\'re not him.', q: 1, r: '"People keep telling me that."' },
          { t: 'Maybe leave it alone.', q: 0, r: '"Yeah. Maybe." He puts his hands in his pockets and walks back to his car.' },
        ],
      },
      {
        text: 'Wes shows up at the motel with a duffel bag. "I told my dad no. No mill, no Dartmouth." He sounds amazed at himself.\n\n"He\'ll have my credit card canceled by Tuesday. Want pancakes?"',
        choices: [
          { t: 'Obviously.', q: 2, r: 'You stay at the Lantern until 2 a.m. "Sunday," Wes says through a mouthful of pancake. "Whatever you need, I\'m in."' },
          { t: 'Are you okay?', q: 1, r: '"No idea. It\'s great."' },
          { t: 'He\'ll take you back by Christmas.', q: 0, r: '"Probably," Wes says, and he doesn\'t bring up pancakes again.' },
        ],
      },
    ],
    withhold: 'Wes reaches into his jacket, then stops. "Sorry. Not yet."',
    crisis: {
      loc: 'mill', slot: 1,
      warn: 'This morning there was black smoke over the Kittredge mill, and not from the stacks. Someone saw Wes\'s car parked next to the old burner.',
      success: 'Wes is feeding boxes of his father\'s papers into the old burner. You pull one box back out before it catches.\n\nInside, singed at the edges, is the thing he was hoping not to find. He reads it again with you, and then he lets you keep it.',
      cold: 'Wes lets you stay, but he burns every box.',
      missed: 'Wes was put on a train east this morning. The club is calling it "a family decision."',
    },
    epi: {
      high: 'Wes moves to Seattle and, of all things, becomes a chemistry teacher.',
      mid: 'Wes goes to Dartmouth after all. His letters get shorter, and then they stop.',
      low: 'At twenty-three, Wes takes over the mill. He smiles in every photo.',
      lost: 'The Kittredges don\'t talk about their son anymore.',
    },
  },

  lou: {
    id: 'lou',
    name: 'Lou Navarro',
    short: 'Lou',
    role: 'Night DJ, KLRK 98.1',
    blurb: 'Hosts the overnight show. Keeps a card for every request anyone has ever called in.',
    color: '#b48cff',
    trait: 'empathy',
    gates: { 2: ['nerve', 2], 4: ['charm', 3] },
    sched: {
      wk: [[null], ['diner', null, null], ['radio']],
      we: [[null], ['library', 'lake', null], ['radio']],
    },
    scenes: [
      {
        text: 'KLRK is a cinderblock building with a red bulb over the door. Inside, a man with long silver hair and headphones waves you in while he\'s still on the air: "...that one was for Gary in Hale, who can\'t sleep either."\n\nOff-mic, he says, "Door was unlocked, huh. Sit if you want."',
        choices: [
          { t: 'Sit down.', q: 2, r: 'He unfolds a chair for you and goes back to the board. Around 2 a.m. he says "Lou" without looking over.' },
          { t: 'I wanted to ask about Odessa.', q: 1, r: '"Figured. Let me get through this set first."' },
          { t: 'Does anyone actually listen at this hour?', q: 0, r: '"About three hundred people and a dog." He puts his headphones back on.' },
        ],
      },
      {
        text: 'Between songs, Lou goes through a shoebox of request cards. "People call at 3 a.m. and tell me things they wouldn\'t tell anyone else."\n\nHe pulls one card out. "Odessa called a few times. She always asked for the same song."',
        choices: [
          { t: 'What do you do with everything people tell you?', q: 2, r: '"Write it on a card and play them something." He rubs his eyes. "Some weeks it gets to me."' },
          { t: 'What song?', q: 1, r: '"I\'ve never been able to find it. I don\'t think it exists."' },
          { t: 'Shouldn\'t the police have those?', q: 0, r: '"No." He puts the lid back on the box.' },
        ],
      },
      {
        text: 'At 1 a.m. the transmitter cuts out. The fuse box is in a shack a quarter mile into the trees.\n\n"Would you hold the flashlight?" Lou asks. "I hate going out there by myself."',
        choices: [
          { t: 'Take the flashlight and go first.', q: 2, r: 'In the shack, the meters are moving by themselves, and for a second four piano notes come out of the speaker. Lou\'s hands shake as he fixes the fuse. Neither of you mentions it on the walk back.' },
          { t: 'Go, but let him lead.', q: 1, r: 'You make it there and back. He buys you a coffee from the vending machine.' },
          { t: 'Can it wait until morning?', q: 0, r: '"Sure," he says, and he goes out there alone.' },
        ],
      },
      {
        text: 'Lou plays you a tape. Someone called in the night Odessa disappeared, and the board recorded it by accident: three minutes of static, then her voice.\n\n"I never gave this to the police," Lou says. "I didn\'t want to be the guy with the tape."',
        choices: [
          { t: 'It could help now.', q: 2, r: 'Lou rewinds it. "Listen to the very end."' },
          { t: 'That makes sense.', q: 1, r: '"Does it?" He doesn\'t press play again.' },
          { t: 'You should have turned it in.', q: 0, r: '"I know." He ejects the tape and puts it in his pocket.' },
        ],
      },
      {
        text: 'Lou slides the mic over to you. "You\'re guest host tonight. Say whatever you want."\n\nThe ON AIR light comes on.',
        choices: [
          { t: 'Say plainly that she\'s still missing and people are still looking.', q: 2, r: 'Every phone line lights up. Lou lets them ring for a minute. "If you need the station on Sunday," he says, "it\'s yours."' },
          { t: 'Play a song.', q: 1, r: 'You pick something quiet. Lou closes his eyes and nods along.' },
          { t: 'Freeze.', q: 0, r: 'Nine seconds of dead air go by before Lou takes the mic back.' },
        ],
      },
    ],
    withhold: 'Lou\'s finger hovers over the play button. Then he ejects the tape. "Another night."',
    crisis: {
      loc: 'radio', slot: 2,
      warn: 'KLRK has been broadcasting a single long piano note since dawn, and nobody picks up the studio line.',
      success: 'Lou is shut inside the transmitter shack, the door jammed from the outside. You pry it open with a tire iron.\n\nHe grabs your arm. He\'s been in there all day with the receiver, and something came through.',
      cold: 'You get Lou out, but he won\'t talk about it. He drives home with the radio off.',
      missed: 'KLRK went off the air and never came back. Lou\'s car was found at the county line, pointed east.',
    },
    epi: {
      high: 'Every Sunday at 3:12 a.m., Lou plays the same song "for a friend who stayed up."',
      mid: 'Some nights you find KLRK on the dial and listen to Lou for a while.',
      low: 'You never went inside KLRK. The red bulb over the door stays lit every night.',
      lost: 'Now 98.1 is just static.',
    },
  },
};
