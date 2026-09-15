// The course, cut into four levels she can jump back into.
//
// A level is just an ordered list of steps. Nothing is locked — she can open
// any level at any time; the ticks only show her where she got to. That is
// deliberate: this is a map, not a gate.

import type { DayMode } from "./moments";

export type Step =
  | { kind: "unit"; key: string }
  | { kind: "scene"; key: string }
  | { kind: "day"; mode: DayMode }
  /** Bring back what she met days ago. Due-driven, so it is never busywork. */
  | { kind: "review" }
  /** The same talk three times, faster each go. Speed, not new language. */
  | { kind: "fluency" };

export type Level = {
  n: number;
  title: string;        // Manipuri
  titleEn: string;
  blurb: string;        // Manipuri
  blurbEn: string;
  steps: Step[];
};

export const LEVELS: Level[] = [
  // Ordered by how exposed she would feel, not by topic. Home and friends come
  // early because the stakes are lowest; the phone and the doctor come last
  // because they are the hardest — no face to read, and something at risk.
  {
    n: 1,
    title: "Houba",
    titleEn: "Getting started",
    blurb: "Keidoungeidasu chingnadanaba wahei, aduga wahei ama semba.",
    blurbEn: "The phrases that stop you ever getting stuck, and your first sentences.",
    steps: [
      { kind: "scene", key: "escape" },
      { kind: "unit", key: "core" },
    ],
  },
  {
    n: 2,
    title: "Yumda",
    titleEn: "At home",
    blurb: "Houjik thoklibagi maramda haiba, aduga yumda lakpa mi amaga wari sanaba.",
    blurbEn: "Talking about what is happening now, and about someone who visits the house.",
    steps: [
      { kind: "unit", key: "now" },
      { kind: "unit", key: "she" },
      { kind: "day", mode: "today" },
      { kind: "scene", key: "home" },
      { kind: "review" },
    ],
  },
  {
    n: 3,
    title: "Marup amasung dukan",
    titleEn: "Friends and the shop",
    blurb: "Mapham-gi wahei (in, on, at), “a” amasung “the”, aduga mapanda chatpa.",
    blurbEn: "The little words before a place, a/an/the, and getting out of the house.",
    steps: [
      { kind: "unit", key: "where" },
      { kind: "unit", key: "a" },
      { kind: "scene", key: "shop" },
      { kind: "scene", key: "friends" },
      { kind: "fluency" },
      { kind: "review" },
    ],
  },
  {
    n: 4,
    title: "Ngarang",
    titleEn: "What already happened",
    blurb: "Houkhraba matam, lakkadaba matam, aduga matam pumnamak mapham amada yengba.",
    blurbEn: "Past, future, and then every tense laid out side by side so you can see the shape.",
    steps: [
      { kind: "unit", key: "past" },
      { kind: "unit", key: "future" },
      { kind: "unit", key: "tense" },
      { kind: "day", mode: "yesterday" },
      { kind: "scene", key: "school" },
      { kind: "review" },
    ],
  },
  {
    n: 5,
    title: "Hangba",
    titleEn: "Asking and answering",
    blurb: "Hangba, wahei ani punsinba, aduga mi anouba amaga unaba.",
    blurbEn: "Questions, joining sentences, and meeting someone for the first time.",
    steps: [
      { kind: "unit", key: "ask" },
      { kind: "unit", key: "join" },
      { kind: "scene", key: "meet" },
      { kind: "fluency" },
      { kind: "review" },
    ],
  },
  {
    n: 6,
    title: "Mi kayaga",
    titleEn: "Out among people",
    blurb: "Maong takpa wahei, karamna aduga kaya kaya, aduga mi kayaga unaba.",
    blurbEn: "Describing things, saying how and how often, and the people you see every week.",
    steps: [
      { kind: "unit", key: "how" },
      { kind: "unit", key: "often" },
      { kind: "scene", key: "church" },
      { kind: "scene", key: "food" },
      { kind: "review" },
    ],
  },
  {
    n: 7,
    title: "Tangaiphadaba matamda",
    titleEn: "When it really matters",
    blurb: "Khwaidagi arubasing — bank, phone-da maithong ubada leite, aduga doctor.",
    blurbEn: "The hardest two: on the phone you cannot see a face, and at the doctor you cannot leave anything out.",
    steps: [
      { kind: "scene", key: "bank" },
      { kind: "scene", key: "phone" },
      { kind: "scene", key: "doctor" },
      { kind: "fluency" },
      { kind: "review" },
    ],
  },
  {
    n: 8,
    title: "Khongchat",
    titleEn: "A journey",
    blurb: "Yumdagi hek thokpadagi youriba phaoba — auto, airport, plane, aduga train.",
    blurbEn: "The whole journey in the order it happens: the auto, the airport, the plane, the train.",
    steps: [
      { kind: "scene", key: "ride" },
      { kind: "scene", key: "airport" },
      { kind: "scene", key: "plane" },
      { kind: "scene", key: "train" },
      { kind: "fluency" },
      { kind: "review" },
    ],
  },
];

/** Stable id for a step — this is what gets saved as done. */
export function stepId(s: Step): string {
  if (s.kind === "day") return `day:${s.mode}`;
  if (s.kind === "review") return "review";
  if (s.kind === "fluency") return "fluency";
  return `${s.kind}:${s.key}`;
}

export const ALL_STEPS: Step[] = LEVELS.flatMap(l => l.steps);

export function levelOf(id: string): Level | undefined {
  return LEVELS.find(l => l.steps.some(s => stepId(s) === id));
}
