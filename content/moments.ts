// Telling the story of her own day — the bridge from single sentences to talking.
// The same six moments in two tenses. Every Manipuri string has an English twin.

export type DayMode = "today" | "yesterday";

export type Moment = {
  k: string; head: string; headEn: string;
  q: string; qEn: string;
  eg: Record<DayMode, string>;
};

export const DAY_MODES: Record<DayMode, {
  label: string; labelEn: string; sub: string; subEn: string; tense: string;
}> = {
  "today": {
    "label": "Ngasi",
    "labelEn": "Today",
    "sub": "Ngasi nangna kari touribage haibiyu.",
    "subEn": "What you do today — present tense.",
    "tense": "the present simple and present continuous (I get up, I am cooking)"
  },
  "yesterday": {
    "label": "Ngarang",
    "labelEn": "Yesterday",
    "sub": "Ngarang nangna kari toukhibage haibiyu.",
    "subEn": "What you did yesterday — past tense.",
    "tense": "the simple past (I got up, I cooked)"
  }
};

export const MOMENTS: Moment[] = [
  {
    "k": "wake",
    "head": "Ayuk",
    "headEn": "Getting up",
    "q": "Nang matam karamdada hougatlibano? Aduga ahanbada kari touribano?",
    "eg": {
      "today": "I get up at six o'clock and I make tea.",
      "yesterday": "I got up at six o'clock and I made tea."
    },
    "qEn": "What time do you get up, and what do you do first?"
  },
  {
    "k": "morning",
    "head": "Ayukki matam",
    "headEn": "The morning",
    "q": "Ayukki matamda nang kari touribano?",
    "eg": {
      "today": "I clean the house and then I cook rice.",
      "yesterday": "I cleaned the house and then I cooked rice."
    },
    "qEn": "What do you do in the morning?"
  },
  {
    "k": "midday",
    "head": "Numit yungba",
    "headEn": "Midday",
    "q": "Numit yungbada kari charibano? Kanaga loinana charibano?",
    "eg": {
      "today": "At one o'clock I eat rice and fish with my family.",
      "yesterday": "At one o'clock I ate rice and fish with my family."
    },
    "qEn": "What do you eat at midday, and who with?"
  },
  {
    "k": "evening",
    "head": "Numidang",
    "headEn": "The evening",
    "q": "Numidangda nang kari touribano? Mapanda chatlibra?",
    "eg": {
      "today": "In the evening I go to the market and I meet my friend.",
      "yesterday": "In the evening I went to the market and I met my friend."
    },
    "qEn": "What do you do in the evening? Do you go out?"
  },
  {
    "k": "night",
    "head": "Numidangwairam",
    "headEn": "The night",
    "q": "Numidangwairamda kari charibano, aduga matam karamdada tumbano?",
    "eg": {
      "today": "I cook dinner and I sleep at ten o'clock.",
      "yesterday": "I cooked dinner and I slept at ten o'clock."
    },
    "qEn": "What do you eat at night, and when do you sleep?"
  },
  {
    "k": "good",
    "head": "Aphaba ama",
    "headEn": "One good thing",
    "q": "Aphaba khara kari thokkhibage? “because” sijinnaduna karigino haibiyu.",
    "eg": {
      "today": "I am happy because my daughter calls me every day.",
      "yesterday": "I was happy because my daughter called me."
    },
    "qEn": "One good thing — and say why, using <i>because</i>."
  }
];
