// Real situations. Each runs phrases -> situations -> role-play.
// `accept` lists alternative wordings that should also count as correct.
// Every Manipuri string has an English twin.

export type Phrase   = { en: string; mni: string; note?: string; noteEn?: string };
export type UseCase  = { situ: string; situEn: string; target: string; accept: string[] };
export type RolePlay = {
  role: string; roleShort: string; scene: string;
  goal: string; goalEn: string; opener: string;
};

export type Scene = {
  key: string; n: number;
  title: string; titleEn: string;
  blurb: string; blurbEn: string;
  phrases: Phrase[];
  use: UseCase[];
  rp: RolePlay;
};

export const SCENES: Scene[] = [
  {
    "key": "escape",
    "n": 0,
    "title": "Awatpa wahei",
    "titleEn": "Your escape phrases",
    "blurb": "Wahei taretsi khanglabadi, wari sanaba matamda nang keidoungeidasu chingnaroi.",
    "blurbEn": "Learn these first. With them you can never get stuck in a conversation.",
    "phrases": [
      {
        "en": "Sorry, can you repeat that?",
        "mni": "Ngaksanbiyu, amuk hanna haibiyu.",
        "note": "Wari khangdrabada masi hairo. Mi khudingmakna masi hairi — lengdabani.",
        "noteEn": "Say this whenever you lose the thread. Everyone says it — it is not a mistake."
      },
      {
        "en": "Please speak slowly.",
        "mni": "Chanbiduna tapna tapna ngangbiyu.",
        "note": "Mi amana yamna yangna ngangbada masi hairo. Ikaiba pokte.",
        "noteEn": "Say this when someone talks too fast. There is nothing to be shy about."
      },
      {
        "en": "I don't know how to say it in English.",
        "mni": "English-da kamdouna haigadage khangde.",
        "note": "Masi haibada nang tappa natte — mi adunasu mateng pangbigani.",
        "noteEn": "Saying this is not failing — people will help you."
      },
      {
        "en": "One minute, please.",
        "mni": "Minute ama pibiyu.",
        "note": "Khanjaba matam pamlabada masi hairo. Tapna khanba yai.",
        "noteEn": "Say this when you need a moment to think."
      },
      {
        "en": "I don't understand.",
        "mni": "Ei khangde.",
        "note": "Masi haibasi achumba oiba thabakni. Khangdrabada khangde haina hairo.",
        "noteEn": "The honest thing to say, and it keeps the conversation alive."
      },
      {
        "en": "Excuse me.",
        "mni": "Ngaksanbiyu / Hairibani.",
        "note": "Mi amabu koubada nattraga lambida chatnabada sijinnei.",
        "noteEn": "For getting someone's attention, or getting past them."
      }
    ],
    "use": [
      {
        "situ": "Dukandarna yamna yangna ngangli.",
        "target": "Please speak slowly.",
        "accept": [
          "please speak slowly",
          "can you speak slowly",
          "speak slowly please"
        ],
        "situEn": "The shopkeeper is talking very fast."
      },
      {
        "situ": "Mi asina hairiba adu khangde.",
        "target": "I don't understand.",
        "accept": [
          "i dont understand",
          "i do not understand",
          "sorry i dont understand"
        ],
        "situEn": "You didn't understand what this person said."
      },
      {
        "situ": "Wahei adu amuk hanna taningi.",
        "target": "Sorry, can you repeat that?",
        "accept": [
          "sorry can you repeat that",
          "can you repeat that",
          "can you repeat",
          "please repeat that",
          "sorry can you repeat"
        ],
        "situEn": "You want to hear it again."
      }
    ],
    "rp": {
      "role": "a friendly stranger at a bus stop",
      "roleShort": "Stranger",
      "scene": "She is waiting at a bus stop. A stranger starts talking to her, quite fast.",
      "goal": "Mi asina yamna yangna ngangli. Tapna ngangnaba haiyu, aduga khangdaba adu hangu.",
      "goalEn": "Ask the stranger to slow down, and ask them to repeat something.",
      "opener": "Oh hello! Are you also waiting for the number seven bus? It's been so late every single day this week, honestly I don't know what's going on with them."
    }
  },
  {
    "key": "shop",
    "n": 1,
    "title": "Dukan-da",
    "titleEn": "At the shop",
    "blurb": "Potsak leiba, mamal hangba, amasung “ei asi lougani” haiba.",
    "blurbEn": "Buying something, asking the price, and saying you'll take it.",
    "phrases": [
      {
        "en": "How much is this?",
        "mni": "Masigi mamal kaya-no?",
        "note": "Khwaidagi kanba wahei amani. “This” haibasi nangna utliba pot adu.",
        "noteEn": "The most useful phrase here. <i>This</i> means the thing you are pointing at."
      },
      {
        "en": "Do you have a bigger one?",
        "mni": "Henna achouba ama leibra?",
        "note": "“Do you have…?” haibasi hangnabagi maongni. Verb “have” mamangda “do” lakli.",
        "noteEn": "<i>Do you have…?</i> is the question shape — <b>do</b> comes before <b>have</b>."
      },
      {
        "en": "Can I see it?",
        "mni": "Ei yengba yagadra?",
        "note": "“Can I…?” haibasi ayaba nijabagi maongni — thoiduna sijinnei.",
        "noteEn": "<i>Can I…?</i> is how you ask permission. You will use it constantly."
      },
      {
        "en": "That's too expensive.",
        "mni": "Masi yamna tenkhraba mamalni.",
        "note": "“Too expensive” haibasi “yamna tenkhrabani” haibani. Mamal hanthahannaba hairiba.",
        "noteEn": "<i>Too expensive</i> means more than it should cost. It invites a lower price."
      },
      {
        "en": "I'll take it.",
        "mni": "Ei masi lougani.",
        "note": "Leigadaba matamda masi hairo. “I will take it” haibagi khaktaba maongni.",
        "noteEn": "Say this once you've decided. Short for <i>I will take it</i>."
      },
      {
        "en": "Thank you.",
        "mni": "Thagatchari.",
        "note": "Lougadaba matam khudingda hairo. Masina wari adu phajana loisilli.",
        "noteEn": "Say it every time — it closes the exchange warmly."
      }
    ],
    "use": [
      {
        "situ": "Phi asigi mamal khangningi.",
        "target": "How much is this?",
        "accept": [
          "how much is this",
          "how much is it",
          "how much does this cost",
          "what is the price"
        ],
        "situEn": "You want to know the price of this cloth."
      },
      {
        "situ": "Mamal adu yamna wangi.",
        "target": "That's too expensive.",
        "accept": [
          "thats too expensive",
          "that is too expensive",
          "its too expensive",
          "too expensive"
        ],
        "situEn": "The price is too high."
      },
      {
        "situ": "Phi adu leiba pamle.",
        "target": "I'll take it.",
        "accept": [
          "ill take it",
          "i will take it",
          "i take it",
          "i want this one"
        ],
        "situEn": "You've decided to buy it."
      }
    ],
    "rp": {
      "role": "a shopkeeper in a small clothes shop",
      "roleShort": "Shopkeeper",
      "scene": "She has walked into a small clothes shop to buy a shirt.",
      "goal": "Phi ama leiyu. Mamal hangu, aduga lougani haiyu.",
      "goalEn": "Buy a shirt: ask the price, then say you'll take it.",
      "opener": "Come in, come in! What are you looking for today?"
    }
  },
  {
    "key": "meet",
    "n": 2,
    "title": "Unaba matamda",
    "titleEn": "Meeting someone",
    "blurb": "Nasagi maramda haiba, aduga mi amagi maramda hangba.",
    "blurbEn": "Introducing yourself, and asking about the other person.",
    "phrases": [
      {
        "en": "Hello, I'm Thoibi.",
        "mni": "Khurumjari, eigi ming Thoibi-ni.",
        "note": "“I'm” haibasi “I am”-gi khaktaba maongni. Nasagi ming hapchillu.",
        "noteEn": "<i>I'm</i> is short for <i>I am</i>. Put your own name in."
      },
      {
        "en": "Nice to meet you.",
        "mni": "Nangga unaba nungaire.",
        "note": "Ahanba unaba matamda hairi. Mi khudingmakna masi hai.",
        "noteEn": "For a first meeting. Everyone says it."
      },
      {
        "en": "Where are you from?",
        "mni": "Nang kadaidagino?",
        "note": "“Where” haibasi “kadaida”-ni. Hangbagi wahei asi mamangda lakli.",
        "noteEn": "<b>Where</b> asks the place, and the question word comes first."
      },
      {
        "en": "I'm from Manipur.",
        "mni": "Ei Manipur-dagini.",
        "note": "“from” haibasi nang lakpa mapham adu takli.",
        "noteEn": "<b>from</b> marks the place you came from."
      },
      {
        "en": "What do you do?",
        "mni": "Nang kari thabak toubano?",
        "note": "Masina thabakki maramda hangi. Mi amaga unaba matamda thoiduna hangi.",
        "noteEn": "This asks about work. Very common when meeting someone."
      },
      {
        "en": "Can you say your name again?",
        "mni": "Nagi ming amuk hanna haibiyu.",
        "note": "Ming khangdrabada masi hairo — ikaiba pokte.",
        "noteEn": "Say this if you missed the name — nobody minds."
      }
    ],
    "use": [
      {
        "situ": "Mi anouba amaga unare.",
        "target": "Hello, I'm Thoibi.",
        "accept": [
          "hello im thoibi",
          "hi im thoibi",
          "hello i am thoibi",
          "hello my name is thoibi"
        ],
        "situEn": "You've just met someone new."
      },
      {
        "situ": "Mahak kadaidagino khangningi.",
        "target": "Where are you from?",
        "accept": [
          "where are you from",
          "where do you come from"
        ],
        "situEn": "You want to know where they're from."
      },
      {
        "situ": "Mahakna nangbu kadaidagino hangle.",
        "target": "I'm from Manipur.",
        "accept": [
          "im from manipur",
          "i am from manipur",
          "from manipur"
        ],
        "situEn": "They've asked where you're from."
      }
    ],
    "rp": {
      "role": "a friendly person meeting her for the first time at a wedding",
      "roleShort": "Guest",
      "scene": "She is at a wedding and someone she has never met sits down beside her.",
      "goal": "Nasagi ming haiyu, kadaidagino haiyu, aduga mahakki maramda hangu.",
      "goalEn": "Say your name and where you're from, and ask them something back.",
      "opener": "Hi! I don't think we've met before — are you from the bride's side or the groom's?"
    }
  },
  {
    "key": "school",
    "n": 3,
    "title": "Class-ta",
    "titleEn": "In the classroom",
    "blurb": "Angangsingda haiba, aduga mama-mapasingga wari sanaba.",
    "blurbEn": "Talking to your children in class, and to a parent at the gate.",
    "phrases": [
      {
        "en": "Good morning, children.",
        "mni": "Ayuk khurumjari, angangsa.",
        "note": "Numit khudinggi ahanba wahei. Angangsingnasu masi tamlagani.",
        "noteEn": "How the day starts. The children will learn it from you."
      },
      {
        "en": "Please sit down.",
        "mni": "Chanbiduna phamlu.",
        "note": "Yathang pibagi wahei asida “you” hapte — verb-na houri. Masi English-gi khwaidagi laiba maongni.",
        "noteEn": "An instruction has no <i>you</i> — the verb starts it. The simplest shape in English."
      },
      {
        "en": "Everybody, line up.",
        "mni": "Pumnamak, line semmu.",
        "note": "“Line up” haibasi mathang mathang lepnaba haibani.",
        "noteEn": "<i>Line up</i> means stand one behind the other."
      },
      {
        "en": "Open your books, please.",
        "mni": "Nakhoigi lairik hangdokpiyu.",
        "note": "“Your” haibasi “nakhoigi”-ni. “Please” hapchillabadi henna nungaiba tai.",
        "noteEn": "<b>Your</b> is for all of them. <i>Please</i> makes it warmer."
      },
      {
        "en": "Who can tell me?",
        "mni": "Kanana eingonda haiba ngambage?",
        "note": "Angangsingbu paokhum pihannaba hangbagi maong amani.",
        "noteEn": "A way of inviting the children to answer."
      },
      {
        "en": "Very good! Well done.",
        "mni": "Yamna phajei! Toubada ngamle.",
        "note": "Thagatpagi wahei. Numit khudingda sijinnabiyu — angangsingna masi taba pammi.",
        "noteEn": "Praise. Use it all day — children listen for it."
      }
    ],
    "use": [
      {
        "situ": "Angangsingna yamna khonjel houri.",
        "target": "Please be quiet.",
        "accept": [
          "please be quiet",
          "be quiet please",
          "quiet please",
          "everybody be quiet",
          "children please be quiet"
        ],
        "situEn": "The children are being very noisy."
      },
      {
        "situ": "Class loire, pot-chei thamnaba matamni.",
        "target": "It's time to clean up.",
        "accept": [
          "its time to clean up",
          "time to clean up",
          "its time to tidy up",
          "lets clean up",
          "now its time to clean up"
        ],
        "situEn": "Class is over — time to tidy everything away."
      },
      {
        "situ": "Angang amana paokhum achumba pire.",
        "target": "Very good! Well done.",
        "accept": [
          "very good well done",
          "very good",
          "well done",
          "thats very good",
          "very good well done"
        ],
        "situEn": "A child has given the right answer."
      }
    ],
    "rp": {
      "role": "the mother of a five-year-old boy called Tomba, collecting him from kindergarten",
      "roleShort": "Parent",
      "scene": "It is the end of the school day. A child's mother is at the gate and wants to know how her son was today.",
      "goal": "Angang adu ngasi karamna leikhibage haibiyu — aphaba ama, aduga khudongthiba ama.",
      "goalEn": "Tell the mother how her son was today: one good thing, and one problem. This needs the past tense.",
      "opener": "Hello ma'am! How was Tomba today? Did he eat his lunch?"
    }
  },
  {
    "key": "church",
    "n": 4,
    "title": "Church-ta",
    "titleEn": "At church",
    "blurb": "Khurumjaba, phamphamgi maramda hangba, aduga thouram loiraba matungda wari sanaba.",
    "blurbEn": "Greeting people, finding a seat, and talking to someone after the service.",
    "phrases": [
      {
        "en": "Good morning. It's nice to see you.",
        "mni": "Ayuk khurumjari. Nangbu ubada nungaire.",
        "note": "Chayol khudinggi ahanba wahei. Mi adumak amuk unagani, maram aduna masi tamlabadi kanagani.",
        "noteEn": "Your opening line every week. You will meet the same people again, so this one repays learning."
      },
      {
        "en": "How are you?",
        "mni": "Nang kamaina leiribage?",
        "note": "Masigi paokhum adu “I'm fine, thank you.” haibani — aduga nangnasu amuk hangbiyu.",
        "noteEn": "The answer is \"I'm fine, thank you.\" — and then ask it back."
      },
      {
        "en": "Is this seat free?",
        "mni": "Phamphamsi leiribra?",
        "note": "Phambada mi leiramdrabadi masi hangbiyu. Laiba hangbagi maong amani.",
        "noteEn": "Ask this before sitting down. A simple, very reusable question."
      },
      {
        "en": "That was a lovely service.",
        "mni": "Thouram adu yamna phajarammi.",
        "note": "Thouram loiraba matungda hairo. “Lovely” haibasi “yamna phajaba” haibani.",
        "noteEn": "Say this after the service. <i>Lovely</i> means warm and good, not just correct."
      },
      {
        "en": "Please pray for my family.",
        "mni": "Eigi imung manunggidamak haijabiyu.",
        "note": "Masi nijabagi maong amani — “Please …” hapchillabadi nungaiba tai.",
        "noteEn": "A request. Starting with <i>Please</i> keeps it gentle."
      },
      {
        "en": "See you next Sunday.",
        "mni": "Mathanggi Nongmaijing-da amuk unasi.",
        "note": "Chatkadaba matamda hairo. “See you …” haibasi khaktaba maongni.",
        "noteEn": "Say it as you leave. <i>See you…</i> is the short, natural goodbye."
      }
    ],
    "use": [
      {
        "situ": "Khangnaba mi amaga unare.",
        "situEn": "You've run into someone you know.",
        "target": "Good morning. It's nice to see you.",
        "accept": [
          "good morning its nice to see you",
          "good morning nice to see you",
          "hello its nice to see you"
        ]
      },
      {
        "situ": "Phamnaba pamlibadu mi leiramdai.",
        "situEn": "You want to sit down but someone may be there.",
        "target": "Is this seat free?",
        "accept": [
          "is this seat free",
          "is this seat taken",
          "can i sit here",
          "is anyone sitting here"
        ]
      },
      {
        "situ": "Thouram loire, houjik chatkadouri.",
        "situEn": "The service is over and you're leaving.",
        "target": "See you next Sunday.",
        "accept": [
          "see you next sunday",
          "see you next week",
          "see you on sunday"
        ]
      }
    ],
    "rp": {
      "role": "a warm older woman at church who sees her every Sunday",
      "roleShort": "Friend",
      "scene": "The service has just ended. A woman she sees every week comes over to talk while people are having tea.",
      "goal": "Khurumjabiyu, mahakki maramda hangbiyu, aduga mathanggi chayolda amuk unasi haibiyu.",
      "goalEn": "Greet her, ask her something about herself, and say goodbye until next week.",
      "opener": "Oh, there you are! I was hoping I'd catch you today. How have you been keeping?"
    }
  },
  {
    "key": "home",
    "title": "Imung manungda",
    "titleEn": "At home",
    "blurb": "Mi lakpa matamda, cha pibada, aduga imung manunggi mi khudingmakka.",
    "blurbEn": "When someone visits: welcoming them, offering food, and introducing your family.",
    "phrases": [
      {
        "en": "Come in, please.",
        "mni": "Changlaklo.",
        "note": "Thongda mi ama lepladuna leirabada masi hairo. Laiba adubu yamna kanba wahei amani.",
        "noteEn": "Say it the moment someone is at the door. Short, and you will use it constantly."
      },
      {
        "en": "Have you eaten?",
        "mni": "Nang chak charabra?",
        "note": "Masi chak-ki maramda hangba khaktana natte — khurumjabagi maongni. English-dasu asumna hairo.",
        "noteEn": "In Manipuri this is a greeting, not really a question about food. It works the same way in English among family."
      },
      {
        "en": "Would you like some tea?",
        "mni": "Cha thakke?",
        "note": "“Would you like …?” haibasi katchabagi laiba maong amani. Pot khudingda sijinnaba yai.",
        "noteEn": "<i>Would you like…?</i> is the polite way to offer anything — swap the last word for any food or drink."
      },
      {
        "en": "This is my husband.",
        "mni": "Masi eigi mapuroibani.",
        "note": "Imung manunggi mi ama utpada “This is …” haiyu. Wife, son, daughter, sister — pumnamakta chang-i.",
        "noteEn": "<i>This is …</i> introduces any family member — husband, wife, son, daughter, sister."
      },
      {
        "en": "Please, help yourself.",
        "mni": "Chanbiduna nasana loubiyu.",
        "note": "Chak thaklaba matungda hairo. Masina “nasagi pamba adu loubiyu” haibani.",
        "noteEn": "Say this once the food is served. It means <i>take as much as you like</i>."
      },
      {
        "en": "Please come again.",
        "mni": "Amuk hanna lakpiyu.",
        "note": "Mi adu chatkadaba matamda hairo. Masina wari adu nungaina loisilli.",
        "noteEn": "Say it as they leave — it closes the visit warmly."
      }
    ],
    "use": [
      {
        "situ": "Mi ama thongda lepli.",
        "situEn": "Someone is standing at your door.",
        "target": "Come in, please.",
        "accept": [
          "come in please",
          "please come in",
          "come in",
          "do come in"
        ]
      },
      {
        "situ": "Mi adu phamle, cha thaknaba matamni.",
        "situEn": "Your guest has sat down and it's time for tea.",
        "target": "Would you like some tea?",
        "accept": [
          "would you like some tea",
          "would you like tea",
          "do you want tea",
          "would you like a cup of tea"
        ]
      },
      {
        "situ": "Mi adu chatkadouri.",
        "situEn": "Your guest is about to leave.",
        "target": "Please come again.",
        "accept": [
          "please come again",
          "come again",
          "please visit again",
          "do come again"
        ]
      }
    ],
    "rp": {
      "role": "a friendly neighbour who has dropped in unannounced",
      "roleShort": "Neighbour",
      "scene": "A neighbour has knocked at the door in the afternoon and is standing outside.",
      "goal": "Manungda koubiyu, cha katchabiyu, aduga chatkadaba matamda amuk lakpa haibiyu.",
      "goalEn": "Invite her in, offer her tea, and ask her to come again when she leaves.",
      "opener": "Hello! Sorry to just turn up — I was passing and thought I'd say hello."
    },
    "n": 5
  },
  {
    "key": "friends",
    "title": "Marup-singga",
    "titleEn": "With friends",
    "blurb": "Kuina unadraba marup amaga, thabak semba, aduga chatchabagi wahei.",
    "blurbEn": "Catching up with a friend you haven't seen, making a plan, and saying goodbye.",
    "phrases": [
      {
        "en": "Long time no see!",
        "mni": "Kuina unadre!",
        "note": "Kuina unadraba marup unaba matamda hairo. Grammar-di achumba natte adubu mi khudingmakna hai.",
        "noteEn": "For a friend you haven't seen in a while. It is not correct grammar — and everyone says it anyway."
      },
      {
        "en": "How have you been?",
        "mni": "Nang kamaina leiramkhibage?",
        "note": "“How are you?” asidagi henna kuina leiramba matamgidamak sijinnei.",
        "noteEn": "A warmer version of <i>How are you?</i> for someone you haven't seen recently."
      },
      {
        "en": "What's new?",
        "mni": "Anouba kari lei?",
        "note": "Wari houdoknabagi laiba wahei amani. Paokhum adu kuina oiba yai.",
        "noteEn": "An easy way to open a conversation — and the answer can be as long as they like."
      },
      {
        "en": "Shall we meet on Sunday?",
        "mni": "Nongmaijing-da unasi?",
        "note": "“Shall we …?” haibasi kanaga loinana toujaba amagi maongni. Numitki ming hongba yai.",
        "noteEn": "<i>Shall we…?</i> suggests doing something together. Swap in any day."
      },
      {
        "en": "I'll call you later.",
        "mni": "Ei matungda phone tougani.",
        "note": "“I'll” haibasi “I will”-gi khaktaba maongni. Chatkadaba matamda thoina hairi.",
        "noteEn": "<i>I'll</i> is short for <i>I will</i>. Very common as you part."
      },
      {
        "en": "Take care.",
        "mni": "Cheksinna leiyu.",
        "note": "Nungaina chatchabagi wahei. “Goodbye” henna nakenglabani.",
        "noteEn": "A warm goodbye — friendlier than just <i>goodbye</i>."
      }
    ],
    "use": [
      {
        "situ": "Tha kaya unadraba marup amaga unare.",
        "situEn": "You've bumped into a friend you haven't seen for months.",
        "target": "Long time no see!",
        "accept": [
          "long time no see",
          "its been a long time",
          "long time"
        ]
      },
      {
        "situ": "Mahakka amuk unaba pamle.",
        "situEn": "You'd like to meet up with her again.",
        "target": "Shall we meet on Sunday?",
        "accept": [
          "shall we meet on sunday",
          "can we meet on sunday",
          "shall we meet sunday",
          "lets meet on sunday"
        ]
      },
      {
        "situ": "Houjik chatkadouri.",
        "situEn": "You're leaving now.",
        "target": "Take care.",
        "accept": [
          "take care",
          "take care of yourself",
          "you take care"
        ]
      }
    ],
    "rp": {
      "role": "an old friend she has run into at the market",
      "roleShort": "Friend",
      "scene": "She has run into a friend she has not seen for several months, in the middle of the market.",
      "goal": "Khurumjabiyu, mahakki maramda hangbiyu, aduga amuk unanaba matam ama leppiyu.",
      "goalEn": "Greet her, ask how she has been, and arrange to meet again.",
      "opener": "Wait — is that you? Goodness, it must be six months! How are you?"
    },
    "n": 6
  },
  {
    "key": "phone",
    "title": "Phone-da",
    "titleEn": "On the phone",
    "blurb": "Maithong ubada leitaba maramna phone-da wari sanaba khak khang-i. Masi tamjaba tangaiphadei.",
    "blurbEn": "The phone is harder than face to face, because you cannot see the person. Worth practising on purpose.",
    "phrases": [
      {
        "en": "Hello, who is this?",
        "mni": "Hello, kanano?",
        "note": "Khangdaba number amadagi phone lakpada masi hangbiyu. Laiba amasung achumbani.",
        "noteEn": "For a number you don't recognise. Direct, and perfectly polite."
      },
      {
        "en": "Can you hear me?",
        "mni": "Nangna eibu tabra?",
        "note": "Khonjel adu phadrabada masi hangbiyu. Phone-da khwaidagi tangaiphadaba wahei amani.",
        "noteEn": "When the line is unclear. One of the most useful phone phrases there is."
      },
      {
        "en": "Sorry, the line is bad.",
        "mni": "Ngaksanbiyu, line adu phade.",
        "note": "Nanggi maral natte haiba takli — masi hairabadi mi adu amuk hanna hairakkani.",
        "noteEn": "This makes clear it is the line, not you — and the other person will repeat themselves."
      },
      {
        "en": "Please hold on.",
        "mni": "Khara ngaibiyu.",
        "note": "Khanjaba matam nattraga mi ama koudokpa matamda hairo.",
        "noteEn": "Say this if you need a moment, or have to fetch someone."
      },
      {
        "en": "Can you call me back?",
        "mni": "Amuk hanna phone toubiba yagadra?",
        "note": "Houjik ngangba yadrabada masi hairo. “Can you …?” haibasi laiba nijabani.",
        "noteEn": "When now is not a good time. <i>Can you…?</i> is a gentle request."
      },
      {
        "en": "Thank you, goodbye.",
        "mni": "Thagatchari, chatchare.",
        "note": "Phone thingdokpagi mamangda hairo — masi yaodrabadi lanba tai.",
        "noteEn": "Say this before hanging up; ending without it sounds abrupt."
      }
    ],
    "use": [
      {
        "situ": "Khangdaba number amadagi phone lakle.",
        "situEn": "An unknown number is calling you.",
        "target": "Hello, who is this?",
        "accept": [
          "hello who is this",
          "who is this",
          "hello who is calling",
          "whos this"
        ]
      },
      {
        "situ": "Khonjel adu phade, karisu taba ngamde.",
        "situEn": "The line is unclear and you can't hear.",
        "target": "Sorry, the line is bad.",
        "accept": [
          "sorry the line is bad",
          "the line is bad",
          "sorry bad line",
          "sorry i cant hear you"
        ]
      },
      {
        "situ": "Houjikti ngangba yade.",
        "situEn": "You can't talk right now.",
        "target": "Can you call me back?",
        "accept": [
          "can you call me back",
          "could you call me back",
          "please call me back",
          "can you call back later"
        ]
      }
    ],
    "rp": {
      "role": "someone calling about a parcel delivery, on a slightly bad line",
      "roleShort": "Caller",
      "scene": "Her phone rings. It is a delivery driver who cannot find the house, and the line is not clear.",
      "goal": "Kanano haiba hangbiyu, taba ngamdrabadi haibiyu, aduga mateng pangbiyu.",
      "goalEn": "Find out who is calling, say when you cannot hear, and help them.",
      "opener": "Hello? Hello — am I speaking to the right house? I've got a parcel here but I can't… hello?"
    },
    "n": 7
  },
  {
    "key": "doctor",
    "title": "Doctor-gi manakta",
    "titleEn": "At the doctor",
    "blurb": "Kari thokkhibage haiba, matam kaya houkhibage, aduga hidak-ki maramda hangba.",
    "blurbEn": "Saying what is wrong, how long it has been, and asking about the medicine.",
    "phrases": [
      {
        "en": "I am not feeling well.",
        "mni": "Ei phajade.",
        "note": "Khwaidagi laiba houdokpa wahei amani. Doctor-na makha tana hanggani.",
        "noteEn": "The simplest way to open. The doctor will ask the rest."
      },
      {
        "en": "I have a headache.",
        "mni": "Eigi makok chikli.",
        "note": "“I have a …” haibasi anaba khudingda chang-i: a cough, a fever, a stomach ache.",
        "noteEn": "<i>I have a …</i> works for any complaint: a cough, a fever, a stomach ache."
      },
      {
        "en": "It started three days ago.",
        "mni": "Masi numit humnigi mamangda houkhi.",
        "note": "Doctor-na matamgi maramda hangba tai. “… ago” haibasi houkhraba matam adu takli.",
        "noteEn": "The doctor will always ask when. <i>… ago</i> counts backwards from today."
      },
      {
        "en": "It hurts here.",
        "mni": "Mapham asida chikli.",
        "note": "Khutna utladuna hairabadi yai. Wahei kharana yamna mateng pang-i.",
        "noteEn": "Point while you say it — a few words plus your hand is enough."
      },
      {
        "en": "Do I need medicine?",
        "mni": "Ei hidak louba tangaiphadabra?",
        "note": "“Do I need …?” haibasi hangbagi maongni. Verb-gi mamangda “do” lakli.",
        "noteEn": "<i>Do I need…?</i> — the question word <b>do</b> comes first."
      },
      {
        "en": "How many times a day?",
        "mni": "Numit amada kaya-ra?",
        "note": "Hidak lougadaba matamgi maramda hangbiyu. Masi hangdrabadi khangba ngamloi.",
        "noteEn": "Ask this about any medicine. If you don't ask, nobody will tell you."
      }
    ],
    "use": [
      {
        "situ": "Doctor-na kari thokkhibage hangle.",
        "situEn": "The doctor asks what is wrong.",
        "target": "I am not feeling well.",
        "accept": [
          "i am not feeling well",
          "im not feeling well",
          "i dont feel well",
          "i am not well"
        ]
      },
      {
        "situ": "Matam kaya houkhibage hangle.",
        "situEn": "The doctor asks how long it has been.",
        "target": "It started three days ago.",
        "accept": [
          "it started three days ago",
          "three days ago",
          "it started 3 days ago",
          "since three days ago"
        ]
      },
      {
        "situ": "Hidak pire, adubu kaya chagadage khangde.",
        "situEn": "You've been given medicine but not told how often.",
        "target": "How many times a day?",
        "accept": [
          "how many times a day",
          "how many times per day",
          "how often should i take it",
          "how many times"
        ]
      }
    ],
    "rp": {
      "role": "a calm, unhurried doctor at a small clinic",
      "roleShort": "Doctor",
      "scene": "She has come to a clinic with a headache that has lasted several days.",
      "goal": "Kari thokkhibage haibiyu, matam kaya houkhibage haibiyu, aduga hidak-ki maramda hangbiyu.",
      "goalEn": "Say what is wrong, how long it has been, and ask about the medicine.",
      "opener": "Come in, take a seat. Now then — what seems to be the trouble?"
    },
    "n": 8
  },
  {
    "key": "food",
    "title": "Chak chaba mapham",
    "titleEn": "Eating out",
    "blurb": "Phamphamgi maramda hangba, order touba, aduga bill nijaba.",
    "blurbEn": "Getting a table, ordering, saying what you don't eat, and asking for the bill.",
    "phrases": [
      {
        "en": "A table for two, please.",
        "mni": "Mi anigi table ama pibiyu.",
        "note": "Changba matamda hairo. Masiba adu hongba yai: for three, for four.",
        "noteEn": "Say it as you walk in. Change the number as needed: for three, for four."
      },
      {
        "en": "What do you recommend?",
        "mni": "Nangna karino haibige?",
        "note": "Menu khangdrabada masi hangbiyu — mi adunasu mateng pangba nungai.",
        "noteEn": "Perfect when the menu means nothing to you, and people enjoy being asked."
      },
      {
        "en": "I don't eat meat.",
        "mni": "Ei sa chade.",
        "note": "“I don't eat …” haibasi chaba yadaba pot khudingda chang-i.",
        "noteEn": "<i>I don't eat …</i> covers anything you avoid."
      },
      {
        "en": "Not too spicy, please.",
        "mni": "Chanbiduna yamna akanba oihandaganu.",
        "note": "Order toubagi matungda hairo. Mapham kayada masi hangba tai.",
        "noteEn": "Say it just after ordering. In many places they will ask you anyway."
      },
      {
        "en": "Can I have the bill, please?",
        "mni": "Bill adu pibiba yagadra?",
        "note": "Loiraba matamda hairo. “Can I have …?” haibasi laiba nijabagi maongni.",
        "noteEn": "When you are finished. <i>Can I have…?</i> is the polite way to ask for anything."
      },
      {
        "en": "It was delicious.",
        "mni": "Masi yamna haokhi.",
        "note": "Chatkadaba matamda hairo. Masina mi adubu nungaihalli.",
        "noteEn": "Say it as you leave — it always lands well."
      }
    ],
    "use": [
      {
        "situ": "Nakhoi ani changlakle.",
        "situEn": "The two of you have just walked in.",
        "target": "A table for two, please.",
        "accept": [
          "a table for two please",
          "table for two",
          "a table for two",
          "can we have a table for two"
        ]
      },
      {
        "situ": "Menu adu khangde.",
        "situEn": "You don't understand the menu.",
        "target": "What do you recommend?",
        "accept": [
          "what do you recommend",
          "what would you recommend",
          "what do you suggest",
          "what is good here"
        ]
      },
      {
        "situ": "Chaba loire.",
        "situEn": "You've finished eating.",
        "target": "Can I have the bill, please?",
        "accept": [
          "can i have the bill please",
          "can i have the bill",
          "the bill please",
          "could i have the bill"
        ]
      }
    ],
    "rp": {
      "role": "a busy but friendly waiter in a small restaurant",
      "roleShort": "Waiter",
      "scene": "She has come in for lunch with a friend and needs a table and some help with the menu.",
      "goal": "Table ama nijabiyu, kari phabage hangbiyu, aduga aroibada bill nijabiyu.",
      "goalEn": "Ask for a table, ask what is good, and ask for the bill at the end.",
      "opener": "Afternoon! Just the two of you? Come through, I'll find you somewhere."
    },
    "n": 9
  },
  {
    "key": "ride",
    "title": "Auto amasung taxi-da",
    "titleEn": "Getting around town",
    "blurb": "Mamal hangba, kadaida lepkadage haiba, aduga sel pibada.",
    "blurbEn": "Asking the fare, saying where to stop, and paying.",
    "phrases": [
      {
        "en": "How much to the market?",
        "mni": "Keithel phaoba kaya-no?",
        "note": "Tongdringeigi mamangda hangbiyu — tonglaba matungda hangbadi tapte.",
        "noteEn": "Ask before you get in, not after. The place name can be swapped for anywhere."
      },
      {
        "en": "Please stop here.",
        "mni": "Mapham asida lepkho.",
        "note": "“Here” haibasi nangna leiriba mapham adu. Khutna utpasu yai.",
        "noteEn": "<i>Here</i> means where you are right now. Pointing helps."
      },
      {
        "en": "Is it far?",
        "mni": "Arappa oibra?",
        "note": "Mapham khangdrabada hangbiyu. Paokhum adu laina oigani.",
        "noteEn": "Useful when you don't know the place. The answer will be short."
      },
      {
        "en": "Please wait for five minutes.",
        "mni": "Minute manga ngaibiyu.",
        "note": "Masiba adu hongba yai: two, ten. Matam khangbagi wahei.",
        "noteEn": "Swap the number: two, ten. Any waiting situation."
      },
      {
        "en": "How much do I owe you?",
        "mni": "Ei kaya pigadage?",
        "note": "Youraba matungda hangbiyu. Masina mamal adu laina khanghalli.",
        "noteEn": "Ask when you arrive — it settles the fare cleanly."
      },
      {
        "en": "Keep the change.",
        "mni": "Lemhouba adu thambiyu.",
        "note": "Lemhouba sel adu amuk lourakpa pamdrabada hairo.",
        "noteEn": "Say it when you don't want the small money back."
      }
    ],
    "use": [
      {
        "situ": "Auto ama lepli, tongdringei.",
        "situEn": "An auto has stopped and you haven't got in yet.",
        "target": "How much to the market?",
        "accept": [
          "how much to the market",
          "how much to the market please",
          "whats the fare to the market",
          "how much for the market"
        ]
      },
      {
        "situ": "Nangna chatkadaba mapham adu youre.",
        "situEn": "You've reached where you wanted to go.",
        "target": "Please stop here.",
        "accept": [
          "please stop here",
          "stop here please",
          "stop here",
          "can you stop here"
        ]
      },
      {
        "situ": "Kumthare, sel pigadouri.",
        "situEn": "You've got out and need to pay.",
        "target": "How much do I owe you?",
        "accept": [
          "how much do i owe you",
          "how much do i owe",
          "how much is it",
          "what do i owe you"
        ]
      }
    ],
    "rp": {
      "role": "an auto driver at a busy stand",
      "roleShort": "Driver",
      "scene": "She needs to get to the market and an auto driver has pulled up beside her.",
      "goal": "Mamal hangbiyu, kadaida chatkadage haibiyu, aduga youraba matamda sel pibiyu.",
      "goalEn": "Agree the fare, say where you're going, and pay at the end.",
      "opener": "Where to, sister? Come, come — where do you want to go?"
    },
    "n": 10
  },
  {
    "key": "airport",
    "title": "Airport-ta",
    "titleEn": "At the airport",
    "blurb": "Check-in, bag, gate — aduga khangdrabada hangba.",
    "blurbEn": "Check-in, your bag, finding the gate — and asking when you're lost.",
    "phrases": [
      {
        "en": "Where is the check-in desk?",
        "mni": "Check-in desk adu kadaidano?",
        "note": "“Where is …?” haibasi mapham khudinggidamak chang-i: the toilet, the gate, the exit.",
        "noteEn": "<i>Where is …?</i> works for anything: the toilet, the gate, the exit."
      },
      {
        "en": "This is my bag.",
        "mni": "Masi eigi bag-ni.",
        "note": "Bag adu thamba matamda hairo. Laiba adubu tangaiphadaba wahei.",
        "noteEn": "Say it as you put the bag down. Short, and you will need it."
      },
      {
        "en": "Which gate, please?",
        "mni": "Kari gate-no?",
        "note": "Ticket-ta iriba adu khangdrabada hangbiyu. Ikaiba pokte.",
        "noteEn": "Ask even if it is printed on your ticket — nobody minds."
      },
      {
        "en": "Is the flight on time?",
        "mni": "Flight adu matamda lakkadabra?",
        "note": "“On time” haibasi matam adumakta haibani.",
        "noteEn": "<i>On time</i> means not delayed."
      },
      {
        "en": "I need some help, please.",
        "mni": "Eingonda mateng khara pangbiyu.",
        "note": "Khangdrabada masi hairo. Mi khudingmakna mateng pangbigani.",
        "noteEn": "Say this whenever you are stuck. People will help."
      },
      {
        "en": "Thank you for your help.",
        "mni": "Mateng pangbiraba thagatchari.",
        "note": "Mateng pangkhraba matungda hairo — masina wari adu phajana loisilli.",
        "noteEn": "Say it afterwards; it closes the exchange warmly."
      }
    ],
    "use": [
      {
        "situ": "Changlakle, adubu kadaida chatkadage khangde.",
        "situEn": "You've just walked in and don't know where to go.",
        "target": "Where is the check-in desk?",
        "accept": [
          "where is the check in desk",
          "where is the checkin desk",
          "where is check in",
          "wheres the check in desk"
        ]
      },
      {
        "situ": "Ticket pire, adubu gate khangde.",
        "situEn": "You have your ticket but not the gate.",
        "target": "Which gate, please?",
        "accept": [
          "which gate please",
          "which gate",
          "what gate",
          "which gate is it"
        ]
      },
      {
        "situ": "Mi amana nangbu mateng pangbire.",
        "situEn": "Someone has just helped you.",
        "target": "Thank you for your help.",
        "accept": [
          "thank you for your help",
          "thanks for your help",
          "thank you for helping me",
          "thanks for helping"
        ]
      }
    ],
    "rp": {
      "role": "a patient airline agent at the check-in desk",
      "roleShort": "Agent",
      "scene": "She has reached the check-in desk with one bag and is flying to Delhi.",
      "goal": "Bag adu thambiyu, gate hangbiyu, aduga flight matamda lakkadabra hangbiyu.",
      "goalEn": "Check your bag in, ask which gate, and ask whether the flight is on time.",
      "opener": "Good morning! Travelling to Delhi today? Can I see your ticket, please?"
    },
    "n": 11
  },
  {
    "key": "plane",
    "title": "Plane-da",
    "titleEn": "On the plane",
    "blurb": "Phamphamgi maramda, ising nijaba, aduga phajadrabada haiba.",
    "blurbEn": "Your seat, asking for water, getting past people, and saying if you feel unwell.",
    "phrases": [
      {
        "en": "Excuse me, this is my seat.",
        "mni": "Ngaksanbiyu, masi eigi phamphamni.",
        "note": "Mi amana nanggi phamphamda phamlabada laina hairo — “Excuse me” hapchillabadi lanthokte.",
        "noteEn": "If someone is in your seat. Starting with <i>Excuse me</i> keeps it friendly."
      },
      {
        "en": "May I go past?",
        "mni": "Ei lanthokpa yagadra?",
        "note": "Mi amagi manakta lanthokpa matamda hairo. “May I …?” haibasi laibani.",
        "noteEn": "For squeezing past someone. <i>May I…?</i> is the polite form."
      },
      {
        "en": "Can I have some water, please?",
        "mni": "Ising khara pibiba yagadra?",
        "note": "“Can I have …?” haibasi pot khudingda chang-i: tea, a blanket.",
        "noteEn": "<i>Can I have…?</i> works for anything: tea, a blanket."
      },
      {
        "en": "How long is the flight?",
        "mni": "Flight asi matam kaya changgani?",
        "note": "Matamgi maramda hangbagi maong. Train, bus-tasu chang-i.",
        "noteEn": "The same question works for a train or a bus."
      },
      {
        "en": "I feel a little unwell.",
        "mni": "Ei khara phajade.",
        "note": "Phajadrabada khaktana lepkanu — hairo, makhoina mateng pangbigani.",
        "noteEn": "Don't sit in silence if you feel ill — say it, they will help."
      },
      {
        "en": "Could you help me with my bag?",
        "mni": "Eigi bag-ta mateng pangbiba yagadra?",
        "note": "Bag adu mathakta thambada nattraga louthokpada hairo.",
        "noteEn": "For lifting your bag into or out of the locker."
      }
    ],
    "use": [
      {
        "situ": "Mi amana nanggi phamphamda phamli.",
        "situEn": "Someone is sitting in your seat.",
        "target": "Excuse me, this is my seat.",
        "accept": [
          "excuse me this is my seat",
          "sorry this is my seat",
          "this is my seat",
          "excuse me i think this is my seat"
        ]
      },
      {
        "situ": "Ising thakningi.",
        "situEn": "You're thirsty.",
        "target": "Can I have some water, please?",
        "accept": [
          "can i have some water please",
          "can i have water",
          "could i have some water",
          "some water please"
        ]
      },
      {
        "situ": "Bag adu mathakta thamba ngamde.",
        "situEn": "You can't lift your bag into the locker.",
        "target": "Could you help me with my bag?",
        "accept": [
          "could you help me with my bag",
          "can you help me with my bag",
          "could you help with my bag",
          "can you help me with this bag"
        ]
      }
    ],
    "rp": {
      "role": "a kind member of the cabin crew",
      "roleShort": "Crew",
      "scene": "She has just boarded, someone is in her seat, and she cannot reach the overhead locker.",
      "goal": "Phamphamgi maramda haibiyu, bag-ta mateng nijabiyu, aduga ising nijabiyu.",
      "goalEn": "Sort out your seat, ask for help with your bag, and ask for water.",
      "opener": "Hello! Welcome aboard — can I help you find your seat?"
    },
    "n": 12
  },
  {
    "key": "train",
    "title": "Train-da",
    "titleEn": "On the train",
    "blurb": "Platform, train adu chatpra haiba, matam, aduga kadaida kumthagadage.",
    "blurbEn": "Finding the platform, checking the train goes where you want, and knowing when to get off.",
    "phrases": [
      {
        "en": "Which platform for Imphal?",
        "mni": "Imphal-gi platform kari-no?",
        "note": "Mapham-gi ming adu hongba yai. Station-da khwaidagi thoina hangba wahei.",
        "noteEn": "Swap the place name. The most-asked question in any station."
      },
      {
        "en": "Does this train go to Delhi?",
        "mni": "Train asi Delhi chatpra?",
        "note": "Tongdringeigi mamangda hangbiyu — masina lanba lambi thingi.",
        "noteEn": "Ask before you get on. It prevents the worst kind of mistake."
      },
      {
        "en": "What time does it leave?",
        "mni": "Matam karamdada chatkani?",
        "note": "“What time …?” haibasi matam khudinggidamak chang-i.",
        "noteEn": "<i>What time…?</i> works for any timetable question."
      },
      {
        "en": "Is this my seat?",
        "mni": "Masi eigi phamphamra?",
        "note": "Ticket adu utladuna hangbadi henna laii.",
        "noteEn": "Easier still if you show your ticket while you ask."
      },
      {
        "en": "Please tell me when we arrive.",
        "mni": "Eikhoi youraba matamda haibiyu.",
        "note": "Mapham khangdrabada masi hairo — mi adunasu ningsinghanbigani.",
        "noteEn": "If you don't know the route, ask someone to tell you. They will."
      },
      {
        "en": "I think this is my stop.",
        "mni": "Masi eigi station-ni haina khalli.",
        "note": "“I think …” haibasi chetna khangdrabada sijinnei — laiba maong amani.",
        "noteEn": "<i>I think…</i> is for when you are not quite sure. Very useful."
      }
    ],
    "use": [
      {
        "situ": "Station-da changle, platform khangde.",
        "situEn": "You're in the station and don't know the platform.",
        "target": "Which platform for Imphal?",
        "accept": [
          "which platform for imphal",
          "what platform for imphal",
          "which platform is for imphal",
          "which platform"
        ]
      },
      {
        "situ": "Train ama lepli, adubu chetna khangde.",
        "situEn": "A train is waiting but you're not sure it's yours.",
        "target": "Does this train go to Delhi?",
        "accept": [
          "does this train go to delhi",
          "is this train for delhi",
          "does this go to delhi",
          "is this the delhi train"
        ]
      },
      {
        "situ": "Kadaida kumthagadage khangde.",
        "situEn": "You don't know where to get off.",
        "target": "Please tell me when we arrive.",
        "accept": [
          "please tell me when we arrive",
          "tell me when we arrive",
          "can you tell me when we arrive",
          "please let me know when we arrive"
        ]
      }
    ],
    "rp": {
      "role": "a helpful fellow passenger on the same train",
      "roleShort": "Passenger",
      "scene": "She has found a seat but is not certain the train is the right one, or where to get off.",
      "goal": "Train adu achumbra hangbiyu, aduga kadaida kumthagadage haibiyu.",
      "goalEn": "Check the train is right, and ask someone to tell you when to get off.",
      "opener": "Is that seat free? Long journey today, isn't it — where are you headed?"
    },
    "n": 13
  },
  {
    "key": "bank",
    "title": "Bank-ta",
    "titleEn": "At the bank",
    "blurb": "Sel louthokpa, form mesinba, aduga khangdrabada amuk hangba.",
    "blurbEn": "Taking money out, getting through a form, and asking again when you don't follow.",
    "phrases": [
      {
        "en": "I want to withdraw money.",
        "mni": "Ei sel louthokpa pammi.",
        "note": "“I want to …” haibasi nangna pamba adu laina takli.",
        "noteEn": "<i>I want to …</i> states plainly what you came for."
      },
      {
        "en": "Can you help me with this form?",
        "mni": "Form asida mateng pangbiba yagadra?",
        "note": "Form khangdrabada masi hairo. Ikaiba pokte — mi kayana asumna hai.",
        "noteEn": "Say it whenever a form defeats you. Plenty of people ask this."
      },
      {
        "en": "Where do I sign?",
        "mni": "Kadaida sign tougadage?",
        "note": "Sign toudringeigi mamangda hangbiyu.",
        "noteEn": "Ask before you write anything."
      },
      {
        "en": "Sorry, I didn't understand.",
        "mni": "Ngaksanbiyu, ei khangkhide.",
        "note": "Bank-ki wahei khara aruba oi. Masi hairabadi amuk hanna takpigani.",
        "noteEn": "Bank words are hard. Say this and they will explain again."
      },
      {
        "en": "Could you say that again, please?",
        "mni": "Amuk hanna haibiyu.",
        "note": "Khangba ngamdaba wahei tarabada masi hairo — thoiduna sijinnei.",
        "noteEn": "For anything you missed. One of the phrases you will use most."
      },
      {
        "en": "How long will it take?",
        "mni": "Matam kaya changgani?",
        "note": "Matam khangba pamlabada hangbiyu — account, card, pot khudingda chang-i.",
        "noteEn": "Works for anything with a wait: an account, a card, a transfer."
      }
    ],
    "use": [
      {
        "situ": "Counter-da youre, kari pambage hangle.",
        "situEn": "You're at the counter and they ask what you need.",
        "target": "I want to withdraw money.",
        "accept": [
          "i want to withdraw money",
          "id like to withdraw money",
          "i want to take out money",
          "i would like to withdraw money"
        ]
      },
      {
        "situ": "Form ama pire, adubu khangde.",
        "situEn": "You've been handed a form you don't understand.",
        "target": "Can you help me with this form?",
        "accept": [
          "can you help me with this form",
          "could you help me with this form",
          "can you help me with the form",
          "help me with this form please"
        ]
      },
      {
        "situ": "Mahakna hairiba adu khangkhide.",
        "situEn": "You didn't follow what they just said.",
        "target": "Could you say that again, please?",
        "accept": [
          "could you say that again please",
          "can you say that again",
          "could you say that again",
          "please say that again"
        ]
      }
    ],
    "rp": {
      "role": "a busy but patient bank clerk",
      "roleShort": "Clerk",
      "scene": "She has come to withdraw money and has been given a form she does not understand.",
      "goal": "Kari pambage haibiyu, form-da mateng nijabiyu, aduga khangdrabada amuk hangbiyu.",
      "goalEn": "Say what you came for, ask for help with the form, and ask again when you don't follow.",
      "opener": "Next, please. Yes ma'am — how can I help you today?"
    },
    "n": 14
  }
];

export const sceneByKey = (k: string) => SCENES.find(s => s.key === k);

/** Nothing left unbuilt. Add here only if you also add it to a level. */
export const SOON: [string, string][] = [];
