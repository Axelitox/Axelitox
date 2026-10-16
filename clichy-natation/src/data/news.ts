import { sources } from "./sources";

export type NewsItem = {
  slug: string;
  title: string;
  category: string;
  /** Date réelle de publication (ISO) ; null si non retrouvée lors de l'audit */
  date: string | null;
  /** Contexte daté affiché à la place de la date quand celle-ci est inconnue */
  period: string;
  archive: boolean;
  excerpt: string;
  body: string[];
  source: string;
  imageKey?: "inscriptions" | "competition" | "pool";
};

/**
 * Publications récupérables du site d'origine.
 * Les dates exactes de publication n'étaient pas exposées par les index consultés :
 * on affiche la période d'origine et jamais une date inventée.
 */
export const news: NewsItem[] = [
  {
    slug: "inscriptions-2026-2027",
    title: "Inscriptions 2026/2027 : tout se fait en ligne",
    category: "Inscriptions",
    date: null,
    period: "Saison 2026/2027",
    archive: false,
    excerpt:
      "Ouverture des nouvelles inscriptions le 15 juillet à 9 h, depuis votre espace personnel. Certificat médical uniquement pour les adultes.",
    body: [
      "Les nouvelles inscriptions ouvrent le 15 juillet à 9 h et se font entièrement en ligne.",
      "Créez votre espace personnel (la personne créée devient administratrice du compte familial), choisissez le membre de la famille, puis le cours et le créneau.",
      "Pensez à cocher la case autorisant Swim Community à vous contacter : sans cela, vous ne recevrez pas les informations importantes, comme les liens de réinscription.",
      "Seules les activités adultes nécessitent le téléchargement d'un certificat médical, valable 3 ans. Il n'est plus demandé pour les mineurs.",
      "Paiement par carte (3 fois sans frais possible) ou par virement.",
    ],
    source: sources.inscriptions,
    imageKey: "inscriptions",
  },
  {
    slug: "aquabike-a-la-seance",
    title: "L'aquabike et l'aqua-yoga se réservent à la séance",
    category: "Activités",
    date: null,
    period: "Offre en ligne",
    archive: false,
    excerpt: "Aquabike à 12 € et aqua-yoga à 15 € la séance, avec réservation et paiement en ligne.",
    body: [
      "En complément des abonnements annuels, le club propose des séances à l'unité : aquabike à 12 € et aqua-yoga à 15 € la séance.",
      "La réservation et le paiement se font en ligne.",
    ],
    source: sources.aquabikeSeance,
    imageKey: "pool",
  },
  {
    slug: "interclubs-18",
    title: "Interclubs",
    category: "Compétition",
    date: null,
    period: "Archive — page « Interclubs 18 »",
    archive: true,
    excerpt: "Retour sur les Interclubs publiés sur l'ancien site du club.",
    body: [
      "Cette publication provient des archives de l'ancien site (page « Interclubs 18 »). Son contenu détaillé reste à réimporter depuis le site d'origine.",
    ],
    source: "https://www.clichy-natation.com/interclubs-18",
    imageKey: "competition",
  },
];

export const getNews = (slug: string) => news.find((n) => n.slug === slug);
