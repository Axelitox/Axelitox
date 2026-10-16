import type { ActivitySlug } from "./activities";
import { sources, type Verification } from "./sources";

export const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const;
export type Day = (typeof days)[number];

export type Public = "Bébés" | "Enfants" | "Adolescents" | "Adultes" | "Handisport";

export type Slot = {
  id: string;
  activity: ActivitySlug;
  activityLabel: string;
  group: string;
  public: Public;
  day: Day;
  start: string;
  end: string;
  level: string;
  place: string;
  status: Verification;
  source: string;
  note?: string;
};

const POOL = "Piscine Gérard Durant";

let n = 0;
const s = (x: Omit<Slot, "id" | "place"> & { place?: string }): Slot => ({ id: `slot-${++n}`, place: POOL, ...x });

/**
 * Horaires relevés sur le site d'origine (et, pour le handisport, sur la fiche du
 * Comité Handisport 92 qui renvoie vers le site du club).
 *
 * ⚠️ Les années de naissance des groupes de l'école de natation montrent que ces
 * horaires datent d'une saison antérieure : ils sont marqués « à actualiser » et
 * doivent être confirmés par le club pour la saison 2026/2027.
 */
export const schedule: Slot[] = [
  // Natation adultes — page officielle « Cours de natation adultes »
  ...(
    [
      ["Lundi", "12:15", "13:15"],
      ["Lundi", "20:00", "21:00"],
      ["Mardi", "07:00", "08:00"],
      ["Mardi", "12:15", "13:15"],
      ["Jeudi", "07:00", "08:00"],
    ] as const
  ).map(([day, start, end]) =>
    s({
      activity: "natation-adultes",
      activityLabel: "Natation adultes",
      group: "Adultes",
      public: "Adultes",
      day,
      start,
      end,
      level: "Traverser le grand bassin sans aide",
      status: "officiel",
      source: sources.adultes,
    }),
  ),

  // École de natation — groupe initiation (nés en 2020–2021 sur la page d'origine)
  ...(
    [
      ["Samedi", "11:45", "12:15"],
      ["Samedi", "12:15", "12:45"],
      ["Samedi", "12:45", "13:15"],
      ["Samedi", "13:15", "13:45"],
      ["Mercredi", "16:00", "16:30"],
      ["Mercredi", "16:30", "17:00"],
      ["Mercredi", "17:00", "17:30"],
    ] as const
  ).map(([day, start, end]) =>
    s({
      activity: "ecole-de-natation",
      activityLabel: "École de natation",
      group: "Initiation",
      public: "Enfants",
      day,
      start,
      end,
      level: "Débutant · 4–5 ans",
      status: "a-valider",
      source: sources.ecole,
      note: "Groupe affiché « nés en 2020–2021 » sur le site d'origine",
    }),
  ),
  s({
    activity: "ecole-de-natation",
    activityLabel: "École de natation",
    group: "Groupe 5",
    public: "Enfants",
    day: "Mercredi",
    start: "18:15",
    end: "19:00",
    level: "Perfectionnement",
    status: "a-valider",
    source: sources.ecole,
    note: "Groupe affiché « nés en 2011–2013 » ; créneau du jeudi à confirmer",
  }),
  s({
    activity: "ecole-de-natation",
    activityLabel: "École de natation",
    group: "Adolescents",
    public: "Adolescents",
    day: "Samedi",
    start: "11:15",
    end: "12:00",
    level: "Perfectionnement",
    status: "a-valider",
    source: sources.ecole,
    note: "Groupe affiché « nés en 2008–2010 » ; créneau du vendredi à confirmer",
  }),

  // Handisport — fiche Comité Handisport des Hauts-de-Seine
  ...(
    [
      ["Lundi", "20:00", "21:00"],
      ["Mercredi", "19:00", "19:45"],
      ["Samedi", "12:45", "13:15"],
      ["Samedi", "13:15", "14:45"],
    ] as const
  ).map(([day, start, end]) =>
    s({
      activity: "handisport",
      activityLabel: "Handisport",
      group: "Handisport",
      public: "Handisport",
      day,
      start,
      end,
      level: "Tous niveaux",
      status: "tiers",
      source: sources.handisport92,
    }),
  ),
];

/** Activités dont le site d'origine ne publie pas d'horaires détaillés exploitables. */
export const scheduleGaps: { activity: ActivitySlug; label: string; text: string }[] = [
  { activity: "jardin-aquatique", label: "Jardin aquatique", text: "Séances de 30 min le samedi — horaires par âge à confirmer par le club." },
  { activity: "aquabike-aquaforme", label: "Aqua-training & aqua-yoga", text: "3 samedis sur 4 — horaires à confirmer par le club." },
  { activity: "natation-competition", label: "Compétition", text: "Horaires communiqués par les entraîneurs selon le groupe." },
];
