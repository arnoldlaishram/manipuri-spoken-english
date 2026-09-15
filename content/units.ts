// The seven sentence patterns, in order of how often they are actually spoken.
// Every Manipuri string has an English twin — she understands English, so the
// English is a second channel for her, not just a note for you.
// Nothing in the code depends on any wording. Edit freely.
// `why`, `whyEn` and the notes may contain <b> and <i>; nothing else may.

/** One Manipuri sentence beside its English. She reads and hears these BEFORE
 *  being asked to produce anything — worked examples first, production after. */
export type Example = { mni: string; en: string };

/** The same action across every tense, for the side-by-side table. */
export type TenseRow = { when: string; whenEn: string; mni: string; en: string };
export type TenseBlock = { action: string; actionEn: string; rows: TenseRow[] };

export type DrillItem = { en: string; mni: string; note?: string; noteEn?: string };

export type Unit = {
  key: string;
  title: string;      // Manipuri
  titleEn: string;
  gist: string;       // the pattern, very short
  gistEn: string;
  why: string;        // why this matters, Manipuri
  whyEn: string;      // ...and in English
  pat: string;        // the shape, shown never named
  examples?: Example[];   // shown first, as a readable list
  table?: TenseBlock[];   // tense comparison, when the unit needs one
  items: DrillItem[];
  free: { q: string; qEn: string; pat: string };   // make your own sentence
};

export const UNITS: Unit[] = [
  {
    "key": "core",
    "title": "Ei ... -i",
    "titleEn": "I + do + thing",
    "gist": "Wahei ama semba",
    "gistEn": "Word order — the one big difference",
    "why": "Manipuri-da verb adu akonbada lakli: “Ei chak <b>chai</b>.” English-da verb adu marakta lakli: “I <b>eat</b> rice.” Masi khwaidagi tangaiphadaba khennabani — masi khanglabadi wahei lisingmari semba ngamgani.",
    "pat": "I &nbsp;+&nbsp; do &nbsp;+&nbsp; thing",
    "items": [
      {
        "en": "I want tea.",
        "mni": "Ei cha thakning-i."
      },
      {
        "en": "I eat rice.",
        "mni": "Ei chak chai."
      },
      {
        "en": "I know that.",
        "mni": "Ei madu khang-i."
      },
      {
        "en": "I like this.",
        "mni": "Ei masi pam-mi."
      },
      {
        "en": "I need water.",
        "mni": "Ei ising darkar oi."
      },
      {
        "en": "I have two children.",
        "mni": "Eigi angang ani lei.",
        "note": "“Eigi ... lei” haibasi English-da “I have ...”-ni. Maong asi khennei.",
        "noteEn": "Manipuri says <i>Eigi … lei</i>. English says <i>I have …</i> — the shape is different."
      }
    ],
    "free": {
      "q": "Houjik nasagi wahei ama semmu — nangna kari pambage, nattraga kari pamjabage?",
      "pat": "I like ____ .  /  I want ____ .",
      "qEn": "Now make one of your own — what do you like, or what do you want?"
    },
    "whyEn": "Manipuri puts the verb at the end — <i>Ei chak chai</i>. English puts it in the middle — <i>I eat rice</i>. That single difference unlocks thousands of sentences.",
    "examples": [
      {
        "mni": "Ei chak chai.",
        "en": "I eat rice."
      },
      {
        "mni": "Ei ising thaki.",
        "en": "I drink water."
      },
      {
        "mni": "Mahak lairik pai.",
        "en": "She reads a book."
      },
      {
        "mni": "Eikhoi TV yeng-i.",
        "en": "We watch TV."
      },
      {
        "mni": "Ei nga pammi.",
        "en": "I like fish."
      },
      {
        "mni": "Eigi yum ama lei.",
        "en": "I have a house."
      }
    ]
  },
  {
    "key": "now",
    "title": "Houjik",
    "titleEn": "Happening right now",
    "gist": "am / is / are + -ing",
    "gistEn": "What is going on this minute",
    "why": "Houjik thoklibagi maramda haiba matamda English-na khutlai ani sijinnei: <b>am / is / are</b>, aduga verb-gi makhada <b>-ing</b>. Numit khudinggi wari sanabada masi khwaidagi thoina sijinnei.",
    "pat": "I am ____ing &nbsp;·&nbsp; She is ____ing &nbsp;·&nbsp; They are ____ing",
    "items": [
      {
        "en": "I am cooking.",
        "mni": "Ei chak thongli."
      },
      {
        "en": "I am going to the market.",
        "mni": "Ei keithel chatli."
      },
      {
        "en": "She is sleeping.",
        "mni": "Mahak tumli."
      },
      {
        "en": "We are eating.",
        "mni": "Eikhoi chari."
      },
      {
        "en": "They are playing outside.",
        "mni": "Makhoi mapanda sannari."
      },
      {
        "en": "It is raining.",
        "mni": "Nong tari.",
        "note": "Nong, numit, matam — masising asigi maramda haibada English-na “it” sijinnei.",
        "noteEn": "For weather, time and the day, English uses <b>it</b>."
      }
    ],
    "free": {
      "q": "Houjik nang kari touribano? Nasagi wahei ama haiyu.",
      "pat": "I am ____ing .",
      "qEn": "What are you doing right now? Say your own sentence."
    },
    "whyEn": "For what is happening this minute, English uses two pieces: <b>am / is / are</b>, and <b>-ing</b> on the verb. It is everywhere in ordinary speech.",
    "examples": [
      {
        "mni": "Ei chak thongli.",
        "en": "I am cooking."
      },
      {
        "mni": "Mahak lairik pari.",
        "en": "She is reading."
      },
      {
        "mni": "Angang adu tumli.",
        "en": "The child is sleeping."
      },
      {
        "mni": "Eikhoi chari.",
        "en": "We are eating."
      },
      {
        "mni": "Nong tari.",
        "en": "It is raining."
      },
      {
        "mni": "Makhoi sannari.",
        "en": "They are playing."
      }
    ]
  },
  {
    "key": "she",
    "title": "Mahak, makhoi",
    "titleEn": "He, she, it, they",
    "gist": "verb + s",
    "gistEn": "The little -s that beginners drop",
    "why": "Manipuri-da kanana toubage haibana verb adu hongde. English-da <b>he / she / it</b>-ki matungda verb-da <b>-s</b> ama hapli: “She teach<b>es</b>.” Chinggi wahei amakhaktani adubu tabana yamna khang-i.",
    "pat": "He / She / It &nbsp;+&nbsp; verb + s",
    "items": [
      {
        "en": "He works in Imphal.",
        "mni": "Mahak Imphal-da thabak toui."
      },
      {
        "en": "She teaches small children.",
        "mni": "Mahak apikpa angangsingda tambi."
      },
      {
        "en": "My son goes to school.",
        "mni": "Eigi machanupana school chatli."
      },
      {
        "en": "It takes ten minutes.",
        "mni": "Masina minute tara chang-i."
      },
      {
        "en": "They live near us.",
        "mni": "Makhoi eikhoigi manakta lei.",
        "note": "“They”-da -s hapte. “He, she, it”-ta khakta hapli.",
        "noteEn": "No -s after <b>they</b>. Only after he, she and it."
      },
      {
        "en": "My husband likes tea.",
        "mni": "Eigi mapuroibana cha pammi."
      }
    ],
    "free": {
      "q": "Nanggi imung manunggi mi amagi maramda wahei ama haiyu.",
      "pat": "He ____s .  /  She ____s .",
      "qEn": "Say a sentence about someone in your family."
    },
    "whyEn": "Manipuri verbs don't change for who is doing the action. English adds <b>-s</b> after he, she and it: <i>She teaches</i>. One letter — but people hear it.",
    "examples": [
      {
        "mni": "Mahak school chatli.",
        "en": "She goes to school."
      },
      {
        "mni": "Mahakna cha thaki.",
        "en": "He drinks tea."
      },
      {
        "mni": "Eigi machanupana thabak toui.",
        "en": "My son works."
      },
      {
        "mni": "Masina chang-i.",
        "en": "It takes time."
      },
      {
        "mni": "Makhoi Imphal-da lei.",
        "en": "They live in Imphal."
      },
      {
        "mni": "Eigi mama chak thongi.",
        "en": "My mother cooks."
      }
    ]
  },
  {
    "key": "past",
    "title": "Ngarang",
    "titleEn": "Yesterday",
    "gist": "went, ate, came",
    "gistEn": "Talking about what already happened",
    "why": "Houkhraba matamgi maramda haiba matamda verb adu hongi. Khara khaktana <b>-ed</b> hapli (cook → cooked), adubu khwaidagi thoina sijinnariba verb-singdi pumnamak honggi: go → <b>went</b>, eat → <b>ate</b>, come → <b>came</b>. Masising asi khang-u — nanggi numitki wari haibada khudingda tangaiphadei.",
    "pat": "went · ate · came · did · made · told · was",
    "items": [
      {
        "en": "I went to the market.",
        "mni": "Ei keithel chatlammi.",
        "note": "go → went. Masi khwaidagi thoina sijinnariba past verb-ni.",
        "noteEn": "go → <b>went</b>. The commonest past verb of all."
      },
      {
        "en": "I ate rice at one o'clock.",
        "mni": "Ei pung amada chak chakhi.",
        "note": "eat → ate.",
        "noteEn": "eat → <b>ate</b>."
      },
      {
        "en": "She came to my house.",
        "mni": "Mahak eigi yumda lakkhi.",
        "note": "come → came.",
        "noteEn": "come → <b>came</b>."
      },
      {
        "en": "I cooked fish.",
        "mni": "Ei nga thongkhi.",
        "note": "cook → cooked. Masidi -ed hapchaba adumakni.",
        "noteEn": "cook → <b>cooked</b> — this one just takes -ed."
      },
      {
        "en": "He told me a story.",
        "mni": "Mahakna eingonda wari ama takhi.",
        "note": "tell → told.",
        "noteEn": "tell → <b>told</b>."
      },
      {
        "en": "We watched TV together.",
        "mni": "Eikhoi punna TV yengkhi."
      },
      {
        "en": "I was very tired.",
        "mni": "Ei yamna wakhi.",
        "note": "am / is → <b>was</b>, are → <b>were</b>.",
        "noteEn": "am / is → <b>was</b>, are → <b>were</b>."
      },
      {
        "en": "I did not go out.",
        "mni": "Ei mapanda chatkhide.",
        "note": "“did not”-ki matungda verb adu hongde: “did not <b>go</b>”, “did not went” natte.",
        "noteEn": "After <b>did not</b> the verb does not change: <i>did not go</i>, never <i>did not went</i>."
      }
    ],
    "free": {
      "q": "Ngarang nang kari toukhibage? Wahei ama haiyu.",
      "pat": "Yesterday I ____ .",
      "qEn": "What did you do yesterday? Say one sentence."
    },
    "whyEn": "For things already finished, the verb changes. Some just add <b>-ed</b> (cook → cooked), but the commonest verbs change completely: go → <b>went</b>, eat → <b>ate</b>, come → <b>came</b>. Every story about your day needs these.",
    "examples": [
      {
        "mni": "Ei keithel chatlammi.",
        "en": "I went to the market."
      },
      {
        "mni": "Ei chak chakhi.",
        "en": "I ate rice."
      },
      {
        "mni": "Mahak lakkhi.",
        "en": "She came."
      },
      {
        "mni": "Eikhoi TV yengkhi.",
        "en": "We watched TV."
      },
      {
        "mni": "Ei hidak loukhi.",
        "en": "I took medicine."
      },
      {
        "mni": "Nong takhi.",
        "en": "It rained."
      }
    ]
  },
  {
    "key": "future",
    "title": "Hayeng",
    "titleEn": "Tomorrow",
    "gist": "will · going to",
    "gistEn": "Plans and promises",
    "why": "Lakkadouriba matamgi maramda haibadi laiba khakni — verb-gi mamangda <b>will</b> hapchillu, verb adu hongde. Wa wari sanabada “I am going to ...” haibasu thoina sijinnei.",
    "pat": "I will ____ .  ·  I am going to ____ .",
    "items": [
      {
        "en": "I will call you tomorrow.",
        "mni": "Ei hayeng nangonda phone tougani."
      },
      {
        "en": "I will cook in the evening.",
        "mni": "Ei numidangwairamda chak thonggani."
      },
      {
        "en": "She will come at five.",
        "mni": "Mahak pung mangada laklani.",
        "note": "“will”-gi matungda -s hapte: “she will come”, “she will comes” natte.",
        "noteEn": "No -s after <b>will</b>: <i>she will come</i>, never <i>she will comes</i>."
      },
      {
        "en": "We will go together.",
        "mni": "Eikhoi punna chatkani."
      },
      {
        "en": "I am going to rest now.",
        "mni": "Ei houjik potthagani."
      },
      {
        "en": "It will be ready soon.",
        "mni": "Masi thuna sem-sagani."
      }
    ],
    "free": {
      "q": "Hayeng nang kari tougadouribano?",
      "pat": "Tomorrow I will ____ .",
      "qEn": "What will you do tomorrow?"
    },
    "whyEn": "For what hasn't happened yet, put <b>will</b> before the verb and leave the verb alone. In conversation <i>I am going to…</i> is just as common.",
    "examples": [
      {
        "mni": "Ei hayeng chatkani.",
        "en": "I will go tomorrow."
      },
      {
        "mni": "Mahak laklani.",
        "en": "She will come."
      },
      {
        "mni": "Eikhoi chagani.",
        "en": "We will eat."
      },
      {
        "mni": "Ei phone tougani.",
        "en": "I will call."
      },
      {
        "mni": "Nong tarani.",
        "en": "It will rain."
      },
      {
        "mni": "Masi lorani.",
        "en": "It will finish."
      }
    ]
  },
  {
    "key": "tense",
    "title": "Matamsing",
    "titleEn": "All the tenses, side by side",
    "gist": "eat · eating · ate · will eat",
    "gistEn": "one action, every tense",
    "why": "Wahei amatana matam khudingda karamna hongbage haibadu yengbiyu. Manipuri-da matam ani-humgi oina maong amata sijinnaba yai — adubu English-da maong khennaba oi. Masi khanglabadi verb khudingmakta sijinnaba ngamgani.",
    "whyEn": "Watch one action change across every tense. Manipuri often uses <b>one</b> form where English needs <b>two or three</b> — that is the whole difficulty, and seeing it side by side is the fastest way through it. Once you see the shape, it works for every verb.",
    "pat": "eat &nbsp;·&nbsp; am eating &nbsp;·&nbsp; ate &nbsp;·&nbsp; will eat &nbsp;·&nbsp; have eaten",
    "table": [
      {
        "action": "Chak chaba",
        "actionEn": "eating",
        "rows": [
          {
            "when": "Numit khudingda",
            "whenEn": "every day",
            "mni": "Ei numit khudingda chak chai.",
            "en": "I eat rice every day."
          },
          {
            "when": "Houjik",
            "whenEn": "right now",
            "mni": "Ei houjik chak chari.",
            "en": "I am eating rice now."
          },
          {
            "when": "Ngarang",
            "whenEn": "yesterday",
            "mni": "Ei ngarang chak chakhi.",
            "en": "I ate rice yesterday."
          },
          {
            "when": "Hayeng",
            "whenEn": "tomorrow",
            "mni": "Ei hayeng chak chagani.",
            "en": "I will eat rice tomorrow."
          },
          {
            "when": "Houkhre",
            "whenEn": "already",
            "mni": "Ei chak charure.",
            "en": "I have already eaten."
          }
        ]
      },
      {
        "action": "Keithel chatpa",
        "actionEn": "going to the market",
        "rows": [
          {
            "when": "Numit khudingda",
            "whenEn": "every day",
            "mni": "Ei numit khudingda keithel chatli.",
            "en": "I go to the market every day."
          },
          {
            "when": "Houjik",
            "whenEn": "right now",
            "mni": "Ei houjik keithel chatli.",
            "en": "I am going to the market now."
          },
          {
            "when": "Ngarang",
            "whenEn": "yesterday",
            "mni": "Ei ngarang keithel chatlammi.",
            "en": "I went to the market yesterday."
          },
          {
            "when": "Hayeng",
            "whenEn": "tomorrow",
            "mni": "Ei hayeng keithel chatkani.",
            "en": "I will go to the market tomorrow."
          },
          {
            "when": "Houkhre",
            "whenEn": "already",
            "mni": "Ei keithel chatlure.",
            "en": "I have already gone to the market."
          }
        ]
      },
      {
        "action": "Thabak touba",
        "actionEn": "working",
        "rows": [
          {
            "when": "Numit khudingda",
            "whenEn": "every day",
            "mni": "Mahak numit khudingda thabak toui.",
            "en": "She works every day."
          },
          {
            "when": "Houjik",
            "whenEn": "right now",
            "mni": "Mahak houjik thabak touri.",
            "en": "She is working now."
          },
          {
            "when": "Ngarang",
            "whenEn": "yesterday",
            "mni": "Mahak ngarang thabak toukhi.",
            "en": "She worked yesterday."
          },
          {
            "when": "Hayeng",
            "whenEn": "tomorrow",
            "mni": "Mahak hayeng thabak tougani.",
            "en": "She will work tomorrow."
          },
          {
            "when": "Houkhre",
            "whenEn": "already",
            "mni": "Mahak thabak tourure.",
            "en": "She has already worked."
          }
        ]
      }
    ],
    "items": [
      {
        "en": "I eat rice every day.",
        "mni": "Ei numit khudingda chak chai."
      },
      {
        "en": "I am eating rice now.",
        "mni": "Ei houjik chak chari.",
        "note": "Houjik thoklibani — maram aduna “am” amasung “-ing” animak yaoi.",
        "noteEn": "Happening this minute, so it needs both <b>am</b> and <b>-ing</b>."
      },
      {
        "en": "I ate rice yesterday.",
        "mni": "Ei ngarang chak chakhi.",
        "note": "Houkhraba matam — verb adu hongi: eat → ate.",
        "noteEn": "Finished time — the verb changes: eat → ate."
      },
      {
        "en": "I will eat rice tomorrow.",
        "mni": "Ei hayeng chak chagani.",
        "note": "“will”-gi matungda verb adu hongde.",
        "noteEn": "After <b>will</b> the verb does not change."
      },
      {
        "en": "I have already eaten.",
        "mni": "Ei chak charure.",
        "note": "“have + eaten” haibasi houkhre adubu matam takte — masi perfect-ni.",
        "noteEn": "<b>have + eaten</b> means it is done, without saying exactly when. This is the perfect."
      },
      {
        "en": "She has already gone.",
        "mni": "Mahak chatkhrure.",
        "note": "“he, she, it”-ta “have” natte, “has” hapli.",
        "noteEn": "With he, she, it it becomes <b>has</b>, not <i>have</i>."
      }
    ],
    "free": {
      "q": "Nasagi thabak ama khalluduna matam mari-manga-da haiyu.",
      "qEn": "Pick one thing you do, and say it in several tenses.",
      "pat": "I ____ .  /  I am ____ing .  /  I ____ed .  /  I will ____ ."
    },
    "examples": [
      {
        "mni": "Ei numit khudingda chak chai.",
        "en": "I eat rice every day."
      },
      {
        "mni": "Ei houjik chak chari.",
        "en": "I am eating rice now."
      },
      {
        "mni": "Ei ngarang chak chakhi.",
        "en": "I ate rice yesterday."
      },
      {
        "mni": "Ei hayeng chak chagani.",
        "en": "I will eat rice tomorrow."
      },
      {
        "mni": "Ei chak charure.",
        "en": "I have already eaten."
      },
      {
        "mni": "Mahak chatkhrure.",
        "en": "She has already gone."
      }
    ]
  },
  {
    "key": "ask",
    "title": "Hangba, aduga natte haiba",
    "titleEn": "Questions and saying no",
    "gist": "do · does · did · don't",
    "gistEn": "The hardest shape in English",
    "why": "English-da hangba matamda wahei ama mamangda lakli: <b>do, does, did</b>. Manipuri-da masigumba leite, maram aduna masi tamjaba khak khangi — adubu masi khanglabadi nangna hangba ngamle, aduga hangba ngamlabadi wari sanaba ngamle.",
    "pat": "Do you ____ ?  ·  Did you ____ ?  ·  I don't ____ .",
    "items": [
      {
        "en": "Do you have change?",
        "mni": "Nangonda chillai leibra?"
      },
      {
        "en": "Did you eat?",
        "mni": "Nang chak charabra?",
        "note": "“Did”-ki matungda verb adu hongde: “Did you <b>eat</b>?”, “Did you ate?” natte.",
        "noteEn": "After <b>did</b> the verb does not change: <i>Did you eat?</i>, never <i>Did you ate?</i>"
      },
      {
        "en": "Does she speak English?",
        "mni": "Mahakna English ngangbra?",
        "note": "“Does” sijinnarabadi verb-da -s hapte.",
        "noteEn": "With <b>does</b>, the verb takes no -s."
      },
      {
        "en": "Where did you go?",
        "mni": "Nang kadaida chatkhibano?"
      },
      {
        "en": "What are you doing?",
        "mni": "Nang kari touribano?"
      },
      {
        "en": "I don't know.",
        "mni": "Ei khangde."
      },
      {
        "en": "I didn't understand.",
        "mni": "Ei khangkhide."
      },
      {
        "en": "Can you help me?",
        "mni": "Nangna eibu mateng pangbiba yagadra?",
        "note": "“Can”-ga loinarabadi “do” tangaiphadre.",
        "noteEn": "With <b>can</b> you don't need <i>do</i> at all."
      }
    ],
    "free": {
      "q": "Mi amada hangnaba wahei ama semmu.",
      "pat": "Do you ____ ?  /  Did you ____ ?",
      "qEn": "Make up a question to ask someone."
    },
    "whyEn": "English puts an extra word at the front of a question: <b>do, does, did</b>. Manipuri has nothing like it, which is why it takes practice — but questions are how a conversation keeps going.",
    "examples": [
      {
        "mni": "Nang chak charabra?",
        "en": "Did you eat?"
      },
      {
        "mni": "Nang cha thakpra?",
        "en": "Do you drink tea?"
      },
      {
        "mni": "Mahak lakpra?",
        "en": "Is she coming?"
      },
      {
        "mni": "Ei khangde.",
        "en": "I don't know."
      },
      {
        "mni": "Ei chatkhide.",
        "en": "I didn't go."
      },
      {
        "mni": "Nang kadaida chatkhibano?",
        "en": "Where did you go?"
      }
    ]
  },
  {
    "key": "join",
    "title": "Maramdi, adubu",
    "titleEn": "Joining two thoughts",
    "gist": "and · but · because · so",
    "gistEn": "Where sentences become speech",
    "why": "Wahei amakhaktana wari sanaba oide. <b>because</b> haiba wahei asina nangbu “karigi” haiba ngamhalli — masina nangbu paokhum pibagi mapanna wari sanaba ngamhalli. Masi wahei amakhaktani adubu khwaidagi kanba wahei amani.",
    "pat": "____ &nbsp;because&nbsp; ____ &nbsp;·&nbsp; ____ &nbsp;but&nbsp; ____",
    "items": [
      {
        "en": "I am tired because I worked all day.",
        "mni": "Ei wai maramdi ei numit chuppa thabak toukhi."
      },
      {
        "en": "I want to go but I am busy.",
        "mni": "Ei chatning-i adubu ei matam leite."
      },
      {
        "en": "She is late because the bus did not come.",
        "mni": "Mahak matam yaokhide maramdi bus adu lakkhide."
      },
      {
        "en": "I like it but it is too expensive.",
        "mni": "Ei masi pammi adubu masi yamna tenkhrabani."
      },
      {
        "en": "We stayed home because it was raining.",
        "mni": "Eikhoi yumda leikhi maramdi nong takhi."
      },
      {
        "en": "I cooked rice and fish.",
        "mni": "Ei chak amasung nga thongkhi."
      }
    ],
    "free": {
      "q": "“because” sijinnaduna nasagi wahei ama semmu — nangna kari pambage, aduga karigino?",
      "pat": "I ____ because ____ .",
      "qEn": "Make your own sentence with <i>because</i> — what do you like, and why?"
    },
    "whyEn": "One sentence isn't a conversation. <b>because</b> lets you say <i>why</i> — and saying why is how you answer properly instead of in one word. One small word, and the most useful one here.",
    "examples": [
      {
        "mni": "Ei wai maramdi ei thabak toukhi.",
        "en": "I am tired because I worked."
      },
      {
        "mni": "Ei chatning-i adubu matam leite.",
        "en": "I want to go but I have no time."
      },
      {
        "mni": "Ei chak amasung nga chai.",
        "en": "I eat rice and fish."
      },
      {
        "mni": "Nong tari maram aduna eikhoi chatte.",
        "en": "It is raining so we are not going."
      },
      {
        "mni": "Mahak lakkhide maramdi mahak nare.",
        "en": "She didn't come because she is ill."
      },
      {
        "mni": "Ei cha pammi adubu coffee pamde.",
        "en": "I like tea but I don't like coffee."
      }
    ]
  },
  {
    "key": "where",
    "title": "Mapham — in, on, at",
    "titleEn": "Where things are",
    "gist": "in · on · at · to · from",
    "gistEn": "the little words before a place",
    "why": "Manipuri-da mapham-gi khudam adu wahei-gi <b>matungda</b> lakli: “yum<b>-da</b>”, “keithel<b>-da</b>”. English-da masi wahei-gi <b>mamangda</b> lakli: “<b>in</b> the house”, “<b>to</b> the market”. Maong asi onna-teina leiri — masi khanglabadi asoiba yamna hanthagani.",
    "whyEn": "Manipuri puts the place marker <b>after</b> the word — <i>yum-da</i>, <i>keithel-da</i>. English puts it <b>before</b> — <i>in the house</i>, <i>to the market</i>. The order is reversed, and that one flip fixes a great many mistakes.",
    "pat": "in · on · at &nbsp;+&nbsp; the place",
    "items": [
      {
        "en": "I am at home.",
        "mni": "Ei yumda lei.",
        "note": "“at” haibasi mapham ama takli — at home, at school, at the shop.",
        "noteEn": "<b>at</b> points to a place as a spot: at home, at school, at the shop."
      },
      {
        "en": "She is in the kitchen.",
        "mni": "Mahak chaphuda lei.",
        "note": "“in” haibasi manungda haibani — in the room, in the bag.",
        "noteEn": "<b>in</b> means inside something: in the room, in the bag."
      },
      {
        "en": "The book is on the table.",
        "mni": "Lairik adu table-ki mathakta lei.",
        "note": "“on” haibasi mathakta haibani.",
        "noteEn": "<b>on</b> means resting on top of something."
      },
      {
        "en": "I came from Imphal.",
        "mni": "Ei Imphal-dagi lakle.",
        "note": "“from” haibasi houraklba mapham, “to” haibasi chatkadaba mapham.",
        "noteEn": "<b>from</b> is where you started; <b>to</b> is where you are going."
      },
      {
        "en": "We go to church on Sunday.",
        "mni": "Eikhoi Nongmaijing-da church chatli.",
        "note": "Numitki mathakta “on” sijinnei: on Sunday, on Monday.",
        "noteEn": "Days take <b>on</b>: on Sunday, on Monday."
      },
      {
        "en": "I live with my family.",
        "mni": "Ei eigi imung manungga leiminnei.",
        "note": "“with” haibasi kanaga loinana haibani.",
        "noteEn": "<b>with</b> means together with someone."
      }
    ],
    "free": {
      "q": "Nangna houjik kadaida leiribano? Wahei ama semmu.",
      "qEn": "Where are you right now? Make a sentence.",
      "pat": "I am in / at / on ____ ."
    },
    "examples": [
      {
        "mni": "Ei yumda lei.",
        "en": "I am at home."
      },
      {
        "mni": "Lairik adu table-ki mathakta lei.",
        "en": "The book is on the table."
      },
      {
        "mni": "Mahak chaphuda lei.",
        "en": "She is in the kitchen."
      },
      {
        "mni": "Ei Imphal-dagi lakle.",
        "en": "I came from Imphal."
      },
      {
        "mni": "Eikhoi church chatli.",
        "en": "We go to church."
      },
      {
        "mni": "Ei eigi imung manungga lei.",
        "en": "I live with my family."
      }
    ]
  },
  {
    "key": "a",
    "title": "a, an, the",
    "titleEn": "The little words English cannot drop",
    "gist": "a · an · the",
    "gistEn": "Manipuri has none of these",
    "why": "Manipuri-da “a”, “an”, “the” haiba leite — maram aduna masi kaothokpa laii. English-da masi thoina lakli. Kaothoklabasu mi adunadi khanggani, adubu hapchillabadi henna phajana tai. <b>a</b> haibasi amata, <b>the</b> haibasi khanglaba adu.",
    "whyEn": "Manipuri has no <i>a</i>, <i>an</i> or <i>the</i>, so these are the easiest words in English to leave out. People will still understand you without them — but putting them in makes you sound much more natural. <b>a</b> = one of many; <b>the</b> = the particular one we both know.",
    "pat": "a ____ &nbsp;·&nbsp; an ____ &nbsp;·&nbsp; the ____",
    "items": [
      {
        "en": "I have a question.",
        "mni": "Eigi wahang ama lei.",
        "note": "“a” haibasi “ama” haibani — ahanba hanna panba matamda sijinnei.",
        "noteEn": "<b>a</b> is like <i>ama</i> — use it the first time you mention something."
      },
      {
        "en": "She is a teacher.",
        "mni": "Mahak oja amani.",
        "note": "Thabak-ki mamingda English-na “a” hapli: a teacher, a doctor, a driver.",
        "noteEn": "Jobs always take <b>a</b> in English: a teacher, a doctor, a driver."
      },
      {
        "en": "I want an apple.",
        "mni": "Ei apple ama pammi.",
        "note": "a, e, i, o, u-na houba wahei-gi mamangda “a” natte, “an” hapli.",
        "noteEn": "Before a, e, i, o, u the word becomes <b>an</b>: an apple, an egg, an hour."
      },
      {
        "en": "Close the door, please.",
        "mni": "Thong adu thingbiyu.",
        "note": "“the” haibasi ani makhoi animakna khangnaba adu — “thong adu”.",
        "noteEn": "<b>the</b> is for the one you both already know about — <i>thong adu</i>."
      },
      {
        "en": "The bus is late.",
        "mni": "Bus adu matam yaokhide.",
        "note": "Ngaijariba bus adu — maram aduna “the”, “a” natte.",
        "noteEn": "The particular bus you are waiting for — so <b>the</b>, not <i>a</i>."
      },
      {
        "en": "Give me a minute.",
        "mni": "Minute ama pibiyu.",
        "note": "Masi khanjabagi wahei amani, aduga “a” yaoi.",
        "noteEn": "A set phrase for asking someone to wait — and it keeps its <b>a</b>."
      }
    ],
    "free": {
      "q": "“a” nattraga “the” sijinnaduna wahei ama semmu.",
      "qEn": "Make a sentence using <i>a</i> or <i>the</i>.",
      "pat": "I have a ____ .  /  The ____ is ____ ."
    },
    "examples": [
      {
        "mni": "Eigi wahang ama lei.",
        "en": "I have a question."
      },
      {
        "mni": "Mahak oja amani.",
        "en": "She is a teacher."
      },
      {
        "mni": "Thong adu thingbiyu.",
        "en": "Close the door."
      },
      {
        "mni": "Ei apple ama pammi.",
        "en": "I want an apple."
      },
      {
        "mni": "Bus adu matam yaokhide.",
        "en": "The bus is late."
      },
      {
        "mni": "Masi phajaba yum amani.",
        "en": "This is a nice house."
      }
    ]
  },
  {
    "key": "how",
    "title": "Karamba maongno",
    "titleEn": "Describing things",
    "gist": "big · good · very",
    "gistEn": "the describing word comes first",
    "why": "English-da pot-ki maong takpa wahei adu pot-ki <b>mamangda</b> lakli: “<b>achouba</b> yum” → “a <b>big</b> house”. Manipuri-dasu asumna lakli, maram aduna masi laii. <b>very</b> hapchillabadi henna kanhalli: “very good”.",
    "whyEn": "In English the describing word comes <b>before</b> the thing: <i>a <b>big</b> house</i>, <i>a <b>good</b> teacher</i>. Manipuri does the same, so this one is easier than it looks. Adding <b>very</b> strengthens it: <i>very good</i>.",
    "pat": "a &nbsp;+&nbsp; describing word &nbsp;+&nbsp; thing",
    "items": [
      {
        "en": "It is a big house.",
        "mni": "Masi achouba yum amani.",
        "note": "“big” haibasi “yum”-gi mamangda lakli.",
        "noteEn": "<b>big</b> comes before <b>house</b> — never after."
      },
      {
        "en": "She is a good teacher.",
        "mni": "Mahak aphaba oja amani.",
        "note": "“a” amasung maong takpa wahei animak yaoi: a good teacher.",
        "noteEn": "Both <b>a</b> and the describing word are needed: a good teacher."
      },
      {
        "en": "This is very hot.",
        "mni": "Masi yamna asabani.",
        "note": "“very” haibasi “yamna” haibani — maong takpa wahei-gi mamangda lakli.",
        "noteEn": "<b>very</b> is <i>yamna</i>, and it goes before the describing word."
      },
      {
        "en": "I have a small bag.",
        "mni": "Eigi apikpa bag ama lei.",
        "note": "small, big, new, old — pumnamak asumna sijinnei.",
        "noteEn": "small, big, new, old — all work the same way."
      },
      {
        "en": "The food is delicious.",
        "mni": "Chinjak adu yamna haoi.",
        "note": "“is” matungdasu maong takpa wahei thamba yai: The food is hot.",
        "noteEn": "It can also sit after <b>is</b>: <i>The food is hot.</i>"
      },
      {
        "en": "He is a tall man.",
        "mni": "Mahak awangba nupa amani.",
        "note": "Mi amagi maramda haibada masi thoina sijinnei.",
        "noteEn": "Very common when describing a person."
      }
    ],
    "free": {
      "q": "Nanggi yum nattraga nanggi mapham adugi maramda wahei ama semmu.",
      "qEn": "Describe your house or your town in one sentence.",
      "pat": "It is a ____ ____ .  /  My ____ is very ____ ."
    },
    "examples": [
      {
        "mni": "Masi achouba yum amani.",
        "en": "It is a big house."
      },
      {
        "mni": "Mahak aphaba oja amani.",
        "en": "She is a good teacher."
      },
      {
        "mni": "Masi yamna asabani.",
        "en": "This is very hot."
      },
      {
        "mni": "Eigi apikpa bag ama lei.",
        "en": "I have a small bag."
      },
      {
        "mni": "Chinjak adu yamna haoi.",
        "en": "The food is very tasty."
      },
      {
        "mni": "Masi anouba phi amani.",
        "en": "This is a new cloth."
      }
    ]
  },
  {
    "key": "often",
    "title": "Karamna, aduga kaya kaya",
    "titleEn": "How, and how often",
    "gist": "slowly · always · never",
    "gistEn": "saying how, and how often",
    "why": "Thabak ama <b>karamna</b> touribage haibada “slowly”, “quickly”, “well” sijinnei. <b>Kaya kaya</b> touribage haibada “always”, “never”, “sometimes” sijinnei — aduga masi verb-ki <b>mamangda</b> lakli: “I <b>always</b> drink tea.”",
    "whyEn": "To say <b>how</b> something is done, English uses <i>slowly, quickly, well</i>. To say <b>how often</b>, it uses <i>always, never, sometimes</i> — and these go <b>before</b> the verb: <i>I <b>always</b> drink tea.</i>",
    "pat": "I &nbsp;always / never / sometimes&nbsp; + verb",
    "items": [
      {
        "en": "She speaks very well.",
        "mni": "Mahak yamna phajana ngang-i.",
        "note": "“well” haibasi “phajana” haibani — verb-ki matungda lakli.",
        "noteEn": "<b>well</b> tells you how, and it comes after the verb."
      },
      {
        "en": "Please come quickly.",
        "mni": "Thuna lakpiyu.",
        "note": "“quickly” haibasi “thuna”. Yathang pibada thoina sijinnei.",
        "noteEn": "<b>quickly</b> is <i>thuna</i> — common in instructions."
      },
      {
        "en": "I always drink tea in the morning.",
        "mni": "Ei ayukta matam pumnamakta cha thaki.",
        "note": "“always” haibasi verb-ki mamangda lakli: “I always drink”, “I drink always” natte.",
        "noteEn": "<b>always</b> goes before the verb: <i>I always drink</i>, never <i>I drink always</i>."
      },
      {
        "en": "Sometimes I walk to school.",
        "mni": "Khara khara ei school-da khongna chatli.",
        "note": "“sometimes” haibadi wahei-gi ahanbadasu thamba yai.",
        "noteEn": "<b>sometimes</b> may also start the sentence."
      },
      {
        "en": "He never comes late.",
        "mni": "Mahak keidoungeidasu matam yaodana lakte.",
        "note": "“never” hapchillabadi “not” amuk hapchinba tangaiphadre.",
        "noteEn": "With <b>never</b> you do not also need <i>not</i>."
      },
      {
        "en": "I usually cook at seven.",
        "mni": "Ei thoina pung taretta chak thongi.",
        "note": "“usually” haibasi matam yamnaba adu — always amasung sometimes-ki marakta.",
        "noteEn": "<b>usually</b> sits between <i>always</i> and <i>sometimes</i>."
      }
    ],
    "free": {
      "q": "Nangna matam pumnamakta kari toubage? “always” nattraga “never” sijinnabiyu.",
      "qEn": "What do you always do — or never do? Use <i>always</i> or <i>never</i>.",
      "pat": "I always ____ .  /  I never ____ ."
    },
    "examples": [
      {
        "mni": "Ei matam pumnamakta cha thaki.",
        "en": "I always drink tea."
      },
      {
        "mni": "Mahak keidoungeidasu lakte.",
        "en": "He never comes."
      },
      {
        "mni": "Khara khara ei khongna chatli.",
        "en": "Sometimes I walk."
      },
      {
        "mni": "Thuna lakpiyu.",
        "en": "Please come quickly."
      },
      {
        "mni": "Mahak yamna phajana ngang-i.",
        "en": "She speaks very well."
      },
      {
        "mni": "Ei thoina pung taretta hougatli.",
        "en": "I usually get up at seven."
      }
    ]
  }
];

export const unitByKey = (k: string) => UNITS.find(u => u.key === k);
