# Audit du site d'origine — clichy-natation.com

Réalisé le 16/10/2026.

## Conditions de l'audit

Le domaine `clichy-natation.com` n'était **pas joignable depuis l'environnement de développement** : le proxy réseau refusait la connexion et le DNS ne résolvait pas le domaine. Les contenus ont donc été relevés à partir des **pages indexées par les moteurs de recherche** (titres, URL, extraits) et de sources tierces fiables, toutes listées ci-dessous.

**Conséquence : aucun média (logo, photos, logos partenaires) n'a pu être téléchargé.** Le site affiche des emplacements réservés, avec la mention « Photo officielle à importer ». Aucune image générique ni générée par IA ne les remplace. La procédure de récupération est décrite dans le README (`npm run assets:fetch`).

## Pages du site d'origine (routes Wix) et redirections

| Ancienne URL | Contenu | Nouvelle route (308) |
|---|---|---|
| `/` | Accueil | `/` |
| `/activites-grand-public` | Activités grand public | `/activites` |
| `/initiation-a-la-natation` | École de natation | `/activites/ecole-de-natation` |
| `/bebe-nageur` | Bébés nageurs | `/activites/jardin-aquatique` |
| `/cours-de-natation-adultes` | Cours adultes | `/activites/natation-adultes` |
| `/aquabike-nouveau` | Aquabike | `/activites/aquabike-aquaforme` |
| `/aqua-yoga` | Aqua-yoga | `/activites/aquabike-aquaforme` |
| `/handisport` | Handisport | `/activites/handisport` |
| `/equipe-competition` | Compétition | `/competition` |
| `/interclubs-18` | Interclubs (archive) | `/competition#archives` |
| `/tarifs` | Tarifs | `/planning-tarifs` |
| `/inscriptions-21` | Inscriptions 2026 | `/inscriptions` |
| `/service-page/*` | Réservations Wix Bookings (aquabike, aqua-yoga à la séance) | `/inscriptions` |
| `/cgu-cgv` | CGU/CGV | `/cgu-cgv` (inchangée) |

## Contenus relevés

| Donnée | Valeur | Source | Statut |
|---|---|---|---|
| Nom | C.S Clichy 92 Natation (association déclarée, SIREN 397 569 260) | INSEE / annuaire-entreprises | ✅ |
| Adresse | Piscine Gérard Durant, 34 rue Valiton, 92110 Clichy | INSEE, guide-piscine | ✅ |
| Email | contact@clichy-natation.com | CGU/CGV du site | ✅ |
| Téléphone | 01 47 15 96 92 | Annuaire tiers | ⚠️ à confirmer (non affiché) |
| Instagram | @csclichy92natation | instagram.com | ✅ |
| Facebook | Cs Clichy 92 natation | facebook.com | ✅ |
| X | @ClichyCs | x.com | ✅ |
| Boutique | Gérée par sports-village.com | CGU/CGV du site | ✅ (URL exacte à renseigner) |
| Inscriptions | En ligne, ouverture le 15 juillet à 9 h ; espace perso via « + » ; case Swim Community ; certificat médical adultes seulement (3 ans) ; CB 3× sans frais ou virement | `/inscriptions-21` | ✅ |
| Label | Handisport 1 étoile | `/handisport` | ✅ |

### Tarifs (`/tarifs`, page mentionnant « nouveauté 2020 » → **à actualiser**)

| Activité | Tarif |
|---|---|
| École de natation 4–5 ans (30 min, sans parent) | 260 € |
| Enfants 6–15 ans | 290 € |
| Adolescents 15–18 ans | 290 € |
| Aquabike | 370 € |
| Aqua-boxing | 370 € |
| Aqua-training (3 samedis sur 4) | 290 € |
| Aquabike à la séance | 12 € (page de réservation) |
| Aqua-yoga à la séance | 15 € (page de réservation) |
| Compétition | Selon le niveau |
| Bébés nageurs | 260 € (source tierce bebe-nageur.fr, 2025) |

### Horaires

- **Adultes** (officiel) : lun. 12h15–13h15 et 20h–21h ; mar. 7h–8h et 12h15–13h15 ; jeu. 7h–8h. Il faut savoir traverser le grand bassin sans aide.
- **École de natation** (officiel mais **ancien**, à cause des années de naissance 2008–2021) : initiation le sam. de 11h45 à 13h45 et le mer. de 16h à 17h30, par séances de 30 min ; groupe 5 le mer. de 18h15 à 19h ; ados le sam. de 11h15 à 12h. Créneaux du jeudi et du vendredi non relevés.
- **Handisport** (Comité Handisport 92) : lun. 20h–21h ; mer. 19h–19h45 ; sam. 12h45–13h15 et 13h15–14h45.
- **Bébés nageurs, aqua-training, aqua-yoga, compétition** : horaires détaillés non relevés.

### Compétition

- Groupes élite et jeunes, du niveau départemental au niveau national (`/equipe-competition`).
- Compétitions 2024–2025 (abcnatation) : Championnats de France, Interclubs Avenirs, Coupe de France des départements, meetings régionaux et départementaux.
- Archives : csclichy92.free.fr (résultats 2010–2012) et la page `/interclubs-18`.
- **Aucun nom de nageur ni aucun résultat chiffré n'est publié** tant que le club ne les a pas validés.

## Points à valider par le club avant la mise en ligne

1. Importer le **logo officiel** et les **photos** (`npm run assets:fetch`), puis vérifier les **autorisations parentales** pour les photos de mineurs.
2. Renseigner les **logos partenaires** du bandeau d'origine (`src/data/partners.ts`). Aucun partenaire n'a été inventé.
3. Confirmer les **tarifs** et les **horaires 2026/2027**, puis passer les statuts à `officiel`.
4. Renseigner les URL exactes **Swim Community** (inscription et espace adhérent) et **boutique sports-village** (`.env`).
5. Confirmer le **téléphone**, puis l'afficher (`site.phone.verified`).
6. Compléter les mentions légales : directeur de publication et hébergeur.
7. Réimporter le texte intégral des CGU/CGV et de la page « Interclubs 18 ».
8. Les réservations à la séance (Wix Bookings, `/service-page/*`) disparaissent avec Wix : décider de leur nouvel outil.
