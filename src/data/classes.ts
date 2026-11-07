import type { Trait } from '../types';

export interface Question { id: string; q: string; a: [string, string, string] } // a[0] is correct
export interface Subject { name: string; trait: Trait; teacher: string; intro: string; right: string; wrong: string; qs: Question[] }

const Q = (id: string, q: string, a: [string, string, string]): Question => ({ id, q, a });

/** Index = day of week (0 = Monday). */
export const SUBJECTS: Subject[] = [
  {
    name: 'English', trait: 'empathy', teacher: 'Mrs. Hollis',
    intro: 'Mrs. Hollis taps the chalkboard with her pen and looks right at you.',
    right: 'Mrs. Hollis nods. "Good. Someone was reading."',
    wrong: 'Mrs. Hollis sighs and asks somebody else. You hear a snicker from the back row.',
    qs: [
      Q('en1', 'Who wrote "The Great Gatsby"?', ['F. Scott Fitzgerald', 'Ernest Hemingway', 'John Steinbeck']),
      Q('en2', 'Which family is Juliet from, in "Romeo and Juliet"?', ['The Capulets', 'The Montagues', 'The Tybalts']),
      Q('en3', 'What is the syllable pattern of a haiku?', ['5-7-5', '7-5-7', '4-6-4']),
      Q('en4', '"Call me Ishmael" is the first line of which novel?', ['Moby-Dick', 'Treasure Island', 'Robinson Crusoe']),
      Q('en5', 'What do you call a comparison that uses "like" or "as"?', ['A simile', 'A metaphor', 'Hyperbole']),
      Q('en6', 'Who wrote "Frankenstein"?', ['Mary Shelley', 'Bram Stoker', 'Emily Brontë']),
      Q('en7', 'Who wrote "The Raven"?', ['Edgar Allan Poe', 'Robert Frost', 'Walt Whitman']),
      Q('en8', 'A narrator who says "I" is telling the story in...', ['First person', 'Second person', 'Third person']),
    ],
  },
  {
    name: 'Chemistry', trait: 'insight', teacher: 'Mr. Pell',
    intro: 'Mr. Pell turns from the periodic table and points a piece of chalk at you.',
    right: '"Correct." Mr. Pell writes your name in the corner of the board, which apparently means something.',
    wrong: '"No." Mr. Pell writes the right answer on the board in very large letters.',
    qs: [
      Q('ch1', 'What is the chemical symbol for gold?', ['Au', 'Ag', 'Gd']),
      Q('ch2', 'What is the pH of pure water?', ['7', '0', '14']),
      Q('ch3', 'What is the most abundant gas in Earth\'s atmosphere?', ['Nitrogen', 'Oxygen', 'Carbon dioxide']),
      Q('ch4', 'Which element has the symbol Na?', ['Sodium', 'Nitrogen', 'Neon']),
      Q('ch5', 'Which particle has a negative charge?', ['The electron', 'The proton', 'The neutron']),
      Q('ch6', 'What is the atomic number of carbon?', ['6', '12', '8']),
      Q('ch7', 'An acid and a base react to make...', ['A salt and water', 'Pure hydrogen', 'Carbon monoxide']),
      Q('ch8', 'Which element has the symbol Fe?', ['Iron', 'Fluorine', 'Francium']),
    ],
  },
  {
    name: 'Civics', trait: 'charm', teacher: 'Mr. Dunbar',
    intro: 'Mr. Dunbar is running a debate drill. "New kid. Stand up. Make your case."',
    right: 'You answer like you mean it. Mr. Dunbar slaps the desk. "That\'s how you hold a room."',
    wrong: 'You say it with total confidence, and it\'s wrong. Mr. Dunbar says, "Bold. Incorrect, but bold."',
    qs: [
      Q('cv1', 'How many U.S. senators does each state get?', ['Two', 'Four', 'It depends on population']),
      Q('cv2', 'How many amendments make up the Bill of Rights?', ['Ten', 'Five', 'Thirteen']),
      Q('cv3', 'Which branch of government does the Supreme Court belong to?', ['Judicial', 'Executive', 'Legislative']),
      Q('cv4', 'How long is a U.S. president\'s term?', ['Four years', 'Six years', 'Two years']),
      Q('cv5', 'What is the capital of Oregon?', ['Salem', 'Portland', 'Eugene']),
      Q('cv6', 'What is the minimum voting age in the U.S.?', ['18', '21', '16']),
      Q('cv7', 'What does the First Amendment protect?', ['Freedom of speech', 'The right to bear arms', 'The right to a speedy trial']),
      Q('cv8', 'How many voting members sit in the House of Representatives?', ['435', '100', '538']),
    ],
  },
  {
    name: 'Biology', trait: 'insight', teacher: 'Ms. Okafor',
    intro: 'Ms. Okafor holds up a jar with something pale floating in it and calls on you.',
    right: '"Exactly right." Ms. Okafor puts the jar down, to everyone\'s relief.',
    wrong: '"Close, but no." Ms. Okafor leaves the jar on your desk for the rest of class.',
    qs: [
      Q('bi1', 'Which part of the cell produces most of its energy?', ['The mitochondria', 'The nucleus', 'The ribosome']),
      Q('bi2', 'What is the process plants use to turn light into food?', ['Photosynthesis', 'Respiration', 'Osmosis']),
      Q('bi3', 'How many chambers does the human heart have?', ['Four', 'Two', 'Three']),
      Q('bi4', 'What gas do plants take in from the air?', ['Carbon dioxide', 'Oxygen', 'Helium']),
      Q('bi5', 'Douglas firs keep their needles all winter. That makes them...', ['Evergreen', 'Deciduous', 'Dormant']),
      Q('bi6', 'What is the largest organ of the human body?', ['The skin', 'The liver', 'The brain']),
      Q('bi7', 'What shape is a DNA molecule?', ['A double helix', 'A single straight strand', 'A triple ring']),
      Q('bi8', 'Why do salmon swim back up Oregon\'s rivers?', ['To spawn', 'To hibernate', 'To molt']),
    ],
  },
  {
    name: 'Gym', trait: 'nerve', teacher: 'Coach Reyes',
    intro: 'Coach Reyes blows her whistle. "Rules quiz before dodgeball. Get it wrong and you\'re first against the wall."',
    right: '"Look at that." Coach lets you pick teams. You get through dodgeball standing.',
    wrong: 'You\'re first against the wall. You get hit in about four seconds.',
    qs: [
      Q('gy1', 'How many players does each volleyball team have on the court?', ['Six', 'Five', 'Nine']),
      Q('gy2', 'In basketball, how many points is a shot from behind the arc worth?', ['Three', 'Two', 'Four']),
      Q('gy3', 'How many innings are in a regulation baseball game?', ['Nine', 'Seven', 'Twelve']),
      Q('gy4', 'In football, how many yards do you need for a first down?', ['Ten', 'Five', 'Fifteen']),
      Q('gy5', 'In bowling, what are three strikes in a row called?', ['A turkey', 'A hat trick', 'A grand slam']),
      Q('gy6', 'About how long is a marathon?', ['26.2 miles', '13.1 miles', '31 miles']),
      Q('gy7', 'What is a score of zero called in tennis?', ['Love', 'Nil', 'Duck']),
      Q('gy8', 'How many players does a soccer team have on the field?', ['Eleven', 'Nine', 'Twelve']),
    ],
  },
];

export const subjectFor = (day: number): Subject => SUBJECTS[day % 7] ?? SUBJECTS[0];
