import type { ActivitySlug } from "./activities";
import { sources, type Verification } from "./sources";

export type Price = {
  activity: ActivitySlug;
  label: string;
  detail: string;
  /** null = tarif non publié */
  amount: number | null;
  unit: "an" | "séance";
  status: Verification;
  source: string;
};

/**
 * Tarifs relevés sur la page « Tarifs » du site d'origine.
 * Cette page mentionne une « nouveauté 2020 » : les montants sont marqués
 * « à actualiser » tant que le club ne les a pas confirmés pour 2026/2027.
 */
export const prices: Price[] = [
  { activity: "jardin-aquatique", label: "Jardin aquatique", detail: "Bébés nageurs, 4 mois – 4 ans", amount: 260, unit: "an", status: "tiers", source: sources.bebeNageurTiers },
  { activity: "ecole-de-natation", label: "École de natation 4–5 ans", detail: "Séances de 30 min, sans parent", amount: 260, unit: "an", status: "a-valider", source: sources.tarifs },
  { activity: "ecole-de-natation", label: "École de natation 6–15 ans", detail: "Un cours hebdomadaire", amount: 290, unit: "an", status: "a-valider", source: sources.tarifs },
  { activity: "ecole-de-natation", label: "Adolescents 15–18 ans", detail: "Un cours hebdomadaire", amount: 290, unit: "an", status: "a-valider", source: sources.tarifs },
  { activity: "natation-adultes", label: "Natation adultes", detail: "Un cours hebdomadaire d'1 h", amount: null, unit: "an", status: "a-valider", source: sources.adultes },
  { activity: "natation-competition", label: "Compétition", detail: "Selon le niveau du nageur", amount: null, unit: "an", status: "officiel", source: sources.tarifs },
  { activity: "aquabike-aquaforme", label: "Aquabike", detail: "Abonnement annuel, un cours par semaine", amount: 370, unit: "an", status: "a-valider", source: sources.tarifs },
  { activity: "aquabike-aquaforme", label: "Aqua-boxing", detail: "Activité très intense, bonne condition physique", amount: 370, unit: "an", status: "a-valider", source: sources.tarifs },
  { activity: "aquabike-aquaforme", label: "Aqua-training", detail: "3 samedis sur 4, professeur diplômé", amount: 290, unit: "an", status: "a-valider", source: sources.tarifs },
  { activity: "aquabike-aquaforme", label: "Aquabike à la séance", detail: "Réservation et paiement en ligne", amount: 12, unit: "séance", status: "officiel", source: sources.aquabikeSeance },
  { activity: "aquabike-aquaforme", label: "Aqua-yoga à la séance", detail: "Intensité modérée", amount: 15, unit: "séance", status: "officiel", source: sources.aquaYoga },
  { activity: "handisport", label: "Handisport", detail: "Nous contacter", amount: null, unit: "an", status: "officiel", source: sources.handisport },
];

export const pricingNotes = [
  "Les tarifs annuels s'entendent pour un cours hebdomadaire sur les périodes scolaires (pas de cours pendant les vacances de la zone C).",
  "Paiement par carte bancaire (possibilité de régler en 3 fois sans frais) ou par virement.",
];
