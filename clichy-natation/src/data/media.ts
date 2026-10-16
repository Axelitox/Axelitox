/**
 * Médias du site.
 *
 * Toutes les photos doivent provenir du site officiel du club (clichy-natation.com).
 * Lors de l'audit, le domaine n'était pas joignable depuis l'environnement de build :
 * aucune image n'a pu être récupérée. Chaque emplacement reste donc un « slot »
 * réservé, affiché avec sa mention, jusqu'à ce que `src` soit renseigné.
 *
 * Procédure : `npm run assets:fetch` (voir scripts/fetch-assets.mjs) télécharge et
 * convertit en WebP les images du site d'origine dans public/images/_inbox, puis
 * on copie le fichier retenu dans public/images/ et on renseigne `src` ci-dessous.
 *
 * RGPD / mineurs : `minors: true` signale un visuel susceptible de montrer des enfants.
 * Ne renseigner `src` qu'après vérification de l'autorisation parentale de diffusion.
 */

export type MediaSlot = {
  /** Chemin local (ex. "/images/hero-competition.webp") ; null tant que non récupéré */
  src: string | null;
  alt: string;
  /** Ce que doit montrer la photo officielle à importer */
  brief: string;
  minors?: boolean;
  width?: number;
  height?: number;
};

const slot = (brief: string, alt: string, minors = false): MediaSlot => ({ src: null, brief, alt, minors });

export const media = {
  logo: slot("Logo officiel CS Clichy 92 Natation (SVG ou PNG HD)", "Logo du CS Clichy 92 Natation"),
  hero: slot("Nageur du club en action — compétition ou entraînement", "Nageur du CS Clichy 92 en pleine course"),
  clubIntro: slot("Bassin de la piscine Gérard Durant ou groupe du club", "Le bassin de la piscine Gérard Durant"),
  competition: slot("Photo de compétition du club (plots, départ, podium)", "Nageurs du club en compétition"),
  pool: slot("Vue d'ensemble de la piscine Gérard Durant", "La piscine Gérard Durant à Clichy"),
  inscriptions: slot("Visuel de la page Inscriptions du site d'origine", "Inscriptions au CS Clichy 92 Natation"),
  activities: {
    "ecole-de-natation": slot("Photo officielle — école de natation", "Cours de l'école de natation", true),
    "jardin-aquatique": slot("Photo officielle — bébés nageurs / jardin aquatique", "Séance de jardin aquatique", true),
    "natation-adultes": slot("Photo officielle — cours de natation adultes", "Cours de natation adultes"),
    "natation-competition": slot("Photo officielle — équipe compétition", "L'équipe compétition du club"),
    "aquabike-aquaforme": slot("Photo officielle — aquabike", "Séance d'aquabike"),
    handisport: slot("Photo officielle — section handisport", "Section handisport du club"),
  },
  gallery: [
    slot("Galerie piscine — grand bassin", "Grand bassin de la piscine Gérard Durant"),
    slot("Galerie piscine — petit bassin", "Petit bassin de la piscine Gérard Durant"),
    slot("Galerie piscine — vue générale", "Vue générale de la piscine"),
  ],
} satisfies Record<string, unknown>;
