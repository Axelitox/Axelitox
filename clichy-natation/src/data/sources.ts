/**
 * Statut de vérification des données publiées.
 * - "officiel"  : relevé sur clichy-natation.com
 * - "tiers"     : relevé sur une source tierce (annuaire, fédération, comité)
 * - "a-valider" : donnée officielle mais probablement ancienne — à faire confirmer par le club
 */
export type Verification = "officiel" | "tiers" | "a-valider";

export const verificationLabel: Record<Verification, string> = {
  officiel: "Source officielle",
  tiers: "Source tierce — à confirmer",
  "a-valider": "À actualiser",
};

export const sources = {
  tarifs: "https://www.clichy-natation.com/tarifs",
  inscriptions: "https://www.clichy-natation.com/inscriptions-21",
  adultes: "https://www.clichy-natation.com/cours-de-natation-adultes",
  ecole: "https://www.clichy-natation.com/initiation-a-la-natation",
  bebes: "https://www.clichy-natation.com/bebe-nageur",
  handisport: "https://www.clichy-natation.com/handisport",
  handisport92: "https://handisport-hautsdeseine.fr/clubs92/club-sportif-clichy-92-natation/",
  competition: "https://www.clichy-natation.com/equipe-competition",
  aquabike: "https://www.clichy-natation.com/aquabike-nouveau",
  aquabikeSeance: "https://www.clichy-natation.com/service-page/aquabike-a-la-seance",
  aquaYoga: "https://www.clichy-natation.com/service-page/aqua-yoga",
  grandPublic: "https://www.clichy-natation.com/activites-grand-public",
  bebeNageurTiers: "https://www.bebe-nageur.fr/bebe-nageur-a-clichy-horaires-tarifs-inscription-2025/",
  cgu: "https://www.clichy-natation.com/cgu-cgv",
} as const;
