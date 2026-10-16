import { sources } from "./sources";

export type ActivitySlug =
  | "ecole-de-natation"
  | "jardin-aquatique"
  | "natation-adultes"
  | "natation-competition"
  | "aquabike-aquaforme"
  | "handisport";

export type Activity = {
  slug: ActivitySlug;
  index: string;
  name: string;
  short: string;
  audience: string;
  description: string[];
  prerequisites: string[];
  highlights: string[];
  source: string;
};

/** Contenus reformulés à partir des pages officielles (cf. `source`). */
export const activities: Activity[] = [
  {
    slug: "ecole-de-natation",
    index: "01",
    name: "École de natation",
    short: "Apprendre à nager en confiance, par groupes d'âge, avec des éducateurs diplômés.",
    audience: "Enfants dès 4 ans",
    description: [
      "L'école de natation accueille les enfants par groupes constitués en fonction de l'âge. Les cours sont encadrés par des éducateurs diplômés.",
      "Pour les plus jeunes (4–5 ans), les séances durent 30 minutes, sans la présence des parents dans l'eau. Les plus grands progressent ensuite vers la maîtrise des quatre nages.",
      "À partir de 8 ans, les enfants qui le souhaitent peuvent participer aux compétitions départementales, régionales et nationales.",
    ],
    prerequisites: ["Avoir au moins 4 ans", "Aucun certificat médical demandé pour les mineurs"],
    highlights: ["5 groupes selon l'âge", "Séances de 30 min pour les 4–5 ans", "Compétition possible dès 8 ans"],
    source: sources.ecole,
  },
  {
    slug: "jardin-aquatique",
    index: "02",
    name: "Jardin aquatique",
    short: "Bébés nageurs : éveil aquatique avec un parent dans l'eau, dans une eau chauffée.",
    audience: "4 mois – 4 ans",
    description: [
      "Les séances de bébés nageurs sont ouvertes aux enfants dès 4 mois, accompagnés d'un parent dans l'eau.",
      "Chaque séance dure 30 minutes, dans une eau chauffée à 31–32 °C, et est encadrée par un maître-nageur sauveteur.",
    ],
    prerequisites: ["Avoir au moins 4 mois", "Vaccinations obligatoires à jour", "Un parent dans l'eau avec l'enfant"],
    highlights: ["Séances de 30 min", "Eau à 31–32 °C", "Le samedi"],
    source: sources.bebes,
  },
  {
    slug: "natation-adultes",
    index: "03",
    name: "Natation adultes",
    short: "Apprentissage et perfectionnement : un cours hebdomadaire d'une heure.",
    audience: "Adultes",
    description: [
      "Des cours d'une heure par semaine pour apprendre, reprendre ou perfectionner sa nage, avec plusieurs créneaux en début de matinée, à midi ou en soirée.",
      "Le club propose aussi des parcours d'apprentissage et de perfectionnement adultes.",
    ],
    prerequisites: [
      "Savoir traverser le grand bassin sans aide",
      "Certificat médical à télécharger lors de l'inscription (valable 3 ans)",
    ],
    highlights: ["1 h par semaine", "Lundi, mardi et jeudi", "Midi, matin ou soir"],
    source: sources.adultes,
  },
  {
    slug: "natation-competition",
    index: "04",
    name: "Natation compétition",
    short: "Des bases techniques des quatre nages jusqu'à la compétition de haut niveau.",
    audience: "Dès 8 ans · sur sélection",
    description: [
      "La section compétition accompagne les nageurs depuis l'apprentissage des bases techniques des quatre nages jusqu'à la participation à des compétitions de haut niveau.",
      "Les nageurs sont répartis en groupes (dont un groupe élite et un groupe jeunes) et encadrés par les entraîneurs du club, du niveau départemental au niveau national.",
    ],
    prerequisites: ["Niveau évalué par les entraîneurs", "Tarif selon le niveau"],
    highlights: ["Départemental → national", "Groupes élite et jeunes", "Interclubs"],
    source: sources.competition,
  },
  {
    slug: "aquabike-aquaforme",
    index: "05",
    name: "Aquabike & aquaforme",
    short: "Aquabike, aqua-boxing, aqua-training, aqua-yoga : la forme dans l'eau.",
    audience: "Adultes",
    description: [
      "Aquabike : les bienfaits du vélo combinés à la résistance de l'eau.",
      "Aqua-boxing : une activité très intense, réservée aux personnes en bonne condition physique.",
      "Aqua-training et aqua-yoga : 3 samedis sur 4, encadrés par un professeur diplômé. L'aqua-yoga, d'intensité modérée, travaille l'équilibre, le renforcement et la respiration.",
      "Le club propose aussi l'aquagym et l'aquapalming.",
    ],
    prerequisites: ["Adultes", "Certificat médical à télécharger lors de l'inscription (valable 3 ans)"],
    highlights: ["Abonnement annuel", "Aquabike à la séance", "Aqua-yoga à la séance"],
    source: sources.aquabike,
  },
  {
    slug: "handisport",
    index: "06",
    name: "Handisport",
    short: "Un club labellisé handisport, avec plusieurs créneaux chaque semaine.",
    audience: "Personnes en situation de handicap",
    description: [
      "Le club est labellisé « handisport 1 étoile » et propose plusieurs créneaux d'entraînement chaque semaine.",
      "Il organise régulièrement des événements de promotion de la natation handisport.",
    ],
    prerequisites: ["Contacter le club pour un premier échange"],
    highlights: ["Label handisport 1 étoile", "Lundi, mercredi, samedi", "Événements de promotion"],
    source: sources.handisport,
  },
];

export const getActivity = (slug: string) => activities.find((a) => a.slug === slug);
