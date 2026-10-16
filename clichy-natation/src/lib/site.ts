/**
 * Informations du club — source de vérité unique.
 * Chaque donnée renvoie à sa source (voir docs/AUDIT.md).
 */

const OLD_SITE = "https://www.clichy-natation.com";

export const site = {
  name: "CS Clichy 92 Natation",
  shortName: "Clichy 92 Natation",
  legalName: "C.S Clichy 92 Natation",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? OLD_SITE,
  description:
    "Club de natation et d'activités aquatiques à Clichy (92) : école de natation, bébés nageurs, natation adultes, aquabike, handisport et compétition, à la piscine Gérard Durant.",
  email: "contact@clichy-natation.com",
  /** Numéro relevé sur un annuaire tiers — à confirmer par le club avant publication. */
  phone: { display: "01 47 15 96 92", href: "tel:+33147159692", verified: false },
  siren: "397 569 260",
  address: {
    venue: "Piscine Gérard Durant",
    street: "34 rue Valiton",
    postalCode: "92110",
    city: "Clichy",
    country: "FR",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Piscine+G%C3%A9rard+Durant+34+rue+Valiton+92110+Clichy",
  social: [
    { label: "Instagram", href: "https://www.instagram.com/csclichy92natation/" },
    { label: "Facebook", href: "https://www.facebook.com/p/Cs-Clichy-92-natation-100054333745693/" },
    { label: "X", href: "https://x.com/clichycs" },
  ],
  /**
   * Parcours opérationnels. Tant que les URLs exactes Swim Community / boutique
   * ne sont pas renseignées (.env), on renvoie vers les pages officielles actuelles.
   */
  links: {
    registration: process.env.NEXT_PUBLIC_REGISTRATION_URL || `${OLD_SITE}/inscriptions-21`,
    memberArea: process.env.NEXT_PUBLIC_MEMBER_AREA_URL || `${OLD_SITE}/inscriptions-21`,
    shop: process.env.NEXT_PUBLIC_SHOP_URL || "https://www.sports-village.com",
    results: "https://abcnatation.fr/club_manager/clubs/resultat_compets/130920274",
    ffn: "https://www.beta.ffnatation.fr/annuaire/clubs/cs-clichy-92",
    archives: "http://csclichy92.free.fr/resultat.html",
    handisport92: "https://handisport-hautsdeseine.fr/clubs92/club-sportif-clichy-92-natation/",
    cityPool: "https://www.ville-clichy.fr/133-piscine-municipale-clichy.htm",
  },
  linksConfigured: Boolean(process.env.NEXT_PUBLIC_REGISTRATION_URL),
} as const;

export type NavItem = { label: string; href: string; children?: { label: string; href: string; hint?: string }[] };

export const mainNav: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Le Club", href: "/le-club" },
  {
    label: "Activités",
    href: "/activites",
    children: [
      { label: "École de natation", href: "/activites/ecole-de-natation", hint: "Enfants dès 4 ans" },
      { label: "Jardin aquatique", href: "/activites/jardin-aquatique", hint: "Dès 4 mois" },
      { label: "Natation adultes", href: "/activites/natation-adultes", hint: "Apprentissage & perfectionnement" },
      { label: "Compétition", href: "/activites/natation-competition", hint: "Dès 8 ans" },
      { label: "Aquabike & aquaforme", href: "/activites/aquabike-aquaforme", hint: "Adultes" },
      { label: "Handisport", href: "/activites/handisport", hint: "Label 1 étoile" },
    ],
  },
  { label: "Planning & Tarifs", href: "/planning-tarifs" },
  { label: "Actualités", href: "/actualites" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = [
  {
    title: "Le club",
    items: [
      { label: "Le Club", href: "/le-club" },
      { label: "La piscine", href: "/piscine" },
      { label: "Compétition", href: "/competition" },
      { label: "Actualités", href: "/actualites" },
      { label: "Boutique", href: "/boutique" },
    ],
  },
  {
    title: "Nager",
    items: [
      { label: "Activités", href: "/activites" },
      { label: "Planning & Tarifs", href: "/planning-tarifs" },
      { label: "Inscriptions", href: "/inscriptions" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const legalNav = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "CGU/CGV", href: "/cgu-cgv" },
];
