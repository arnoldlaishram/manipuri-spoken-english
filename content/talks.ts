// Topics for the fluency drill.
//
// Fluency work has four conditions (Nation): the language must already be
// familiar, attention must be on the message not the form, there must be
// pressure to go faster, and there must be a lot of it. So these topics are
// deliberately things she already has the words for — her own life. Nothing
// new is introduced here. The prompts exist only to stop her drying up.

export type Talk = {
  key: string;
  title: string;      // Manipuri
  titleEn: string;
  prompts: { mni: string; en: string }[];
};

/** Seconds per round. The same talk, three times, with less time each go. */
export const ROUNDS = [60, 45, 30];

export const TALKS: Talk[] = [
  {
    key: "day", title: "Nanggi numit", titleEn: "Your day",
    prompts: [
      { mni: "Matam karamdada hougatkhi?", en: "What time did you get up?" },
      { mni: "Ayukta kari toukhi?", en: "What did you do in the morning?" },
      { mni: "Kari chakhi?", en: "What did you eat?" },
      { mni: "Numidangda kari toukhi?", en: "What did you do in the evening?" },
    ],
  },
  {
    key: "family", title: "Nanggi imung", titleEn: "Your family",
    prompts: [
      { mni: "Yumda kanakhoi leibage?", en: "Who lives in your house?" },
      { mni: "Makhoina kari thabak toui?", en: "What do they do?" },
      { mni: "Nakhoi punna kari touba pambage?", en: "What do you like doing together?" },
    ],
  },
  {
    key: "class", title: "Nanggi class", titleEn: "Your classroom",
    prompts: [
      { mni: "Angang kaya leibage?", en: "How many children are there?" },
      { mni: "Ayukta kari toui?", en: "What happens in the morning?" },
      { mni: "Angangsingna kari sannaba pambage?", en: "What do the children like to play?" },
      { mni: "Kari khwaidagi nungaibage?", en: "What is the best part?" },
    ],
  },
  {
    key: "place", title: "Nangna leiriba mapham", titleEn: "Where you live",
    prompts: [
      { mni: "Nanggi mapham adu karamba maphamno?", en: "What is your place like?" },
      { mni: "Manakta kari leibage?", en: "What is nearby?" },
      { mni: "Kari khwaidagi pambage?", en: "What do you like most about it?" },
    ],
  },
  {
    key: "market", title: "Keithel", titleEn: "Going to the market",
    prompts: [
      { mni: "Matam karamdada chatpage?", en: "When do you go?" },
      { mni: "Kari leibage?", en: "What do you buy?" },
      { mni: "Kanaga unabage?", en: "Who do you see there?" },
    ],
  },
];

export const talkByKey = (k: string) => TALKS.find(t => t.key === k);
