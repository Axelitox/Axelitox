# TableFlow 3D

Prototype de CRM pour restaurants : la salle est l'interface. Le restaurant de démonstration
**Maison Rouge** est modélisé en 3D isométrique (React Three Fiber) ; chaque table est un objet
interactif relié aux données de service, de réservation et de clientèle.

```bash
cd tableflow-3d
npm install
npm run dev        # http://localhost:5173
npm run build      # build de production dans dist/
```

Aucun backend n'est nécessaire : toutes les données sont enregistrées dans le `localStorage`
du navigateur (clé `tableflow3d-v1`). Réglages → « Réinitialiser la démonstration » recharge
les données de départ.

## Fonctionnalités

| Module | Contenu |
|---|---|
| **Overview / Plan 3D** | Salle 3D (salle, banquettes, bar, cuisine vitrée, terrasse), 12 tables cliquables, halo au sol + badge par statut, survol, onde d'animation au changement de statut, recentrage caméra, filtres par statut, vue isométrique / dessus / zoom / recentrage |
| **Panneau table** | Statut (5 états), installation de clients, arrivée d'une réservation, libération (→ nettoyage → disponible), nombre de couverts, serveur, fiche client, prochaine réservation, historique |
| **Réservations** | Création / modification, date, heure, durée, couverts, table, client existant ou nouveau, note, confirmation, annulation, no-show, arrivée ; planning par table ; détection des chevauchements ; suggestion de table |
| **Clients** | Fiches, historique, visites, préférences, allergies (saisie volontaire), VIP / régulier, notes internes visibles des responsables seulement, suppression (droit à l'effacement) |
| **Équipe** | Serveurs, affectation des tables, couverts en cours |
| **Analytics** | Occupation, couverts, durée moyenne, rotations, absences, couverts par heure, occupation par zone — tout est calculé depuis les données de l'app. Aucun chiffre d'affaires n'est affiché (pas de caisse connectée) |
| **Éditeur de salle** | Mode séparé : ajout depuis un catalogue (tables, chaises, banquettes, murs, cloisons, bar, déco, zones, portes), glisser-déposer 3D par raycasting sur le sol, grille magnétique, rotation, duplication, suppression, dimensions / capacité / numéro, détection des chevauchements, annuler / rétablir, enregistrement explicite du plan |

### Vie du restaurant (personnages animés)

Serveurs, cuisiniers et convives low-poly animés, **pilotés par l'état réel** du prototype :

- **Convives** : une table occupée affiche autant de clients assis que de couverts (dans la limite
  des places, banquette comprise). Une installation ou une arrivée de réservation les fait entrer
  par la porte, rejoindre leur table et s'asseoir ; une libération les fait se lever et sortir.
  Une réservation pas encore arrivée n'affiche personne.
- **Serveurs** : un par membre de l'équipe en service (pastille à sa couleur). Ils enchaînent des
  missions simples : accueillir une table, dresser une table réservée, apporter un plat prêt à la
  passe, débarrasser une table à nettoyer, passer voir leurs tables, aller au bar. Ils servent en
  priorité les tables qui leur sont affectées. La mission en cours s'affiche dans le panneau de la
  table, et une étiquette suit le serveur en charge de la table sélectionnée.
- **Cuisiniers** : ils alternent entre les postes de cuisine et déposent des plats à la passe, que
  les serveurs viennent chercher.
- Les trajets sont calculés sur une grille de navigation dérivée du plan (A* + lissage), donc les
  personnages contournent murs, mobilier et bar, y compris après une modification dans l'éditeur.
- Réglages → *Vie du restaurant* : activer / masquer les personnages (aussi via le bouton de la
  barre caméra), densité *Calme / Normale / Animée*. Avec *Mouvements réduits*, tout le monde reste
  immobile (convives assis, équipe à son poste).

Code : `src/scene/life/` (`nav.ts` grille et A*, `sim.ts` missions et synchronisation,
`Character.tsx` modèles et poses, `LifeLayer.tsx` intégration).

Le statut « Réservée » est calculé : une table n'apparaît réservée que dans la fenêtre précédant
la réservation (60 min par défaut, réglable) et jusqu'à la fin de son créneau.

Les données de démonstration sont générées **relativement à l'heure d'ouverture** de l'app
(clients installés il y a 38 min, réservation dans 30 min…). Le sélecteur Midi / Soir suit
l'horloge et peut être forcé.

## Navigation 3D

- Souris : glisser = déplacer, clic droit = pivoter (angle limité), molette = zoom
- Tactile : un doigt = déplacer, pincer = zoom / rotation
- Échap ferme le panneau ; dans l'éditeur : `R` pivoter, `Suppr` supprimer, `Ctrl+Z / Ctrl+Y`, `Ctrl+D` dupliquer, flèches pour ajuster

Réglages : qualité graphique (occlusion ambiante N8AO), mouvements réduits (respecte
`prefers-reduced-motion` par défaut), affichage des étiquettes, profil Responsable / Serveur.
Sans WebGL, un plan 2D de secours est affiché.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · composants au style shadcn/ui (écrits à la main
dans `src/components/ui.tsx`) · Lucide · Framer Motion · Three.js · React Three Fiber · Drei
(CameraControls, Html) · @react-three/postprocessing · Zustand (+ persist).

```
src/
  types.ts            modèle de domaine
  data/demo.ts        Maison Rouge (plan, clients, réservations, service en cours)
  store/useStore.ts   état applicatif, actions, historique de l'éditeur, persistance
  lib/                règles métier (statuts, conflits, stats, géométrie & collisions)
  scene/              scène 3D : modèles low-poly, tables interactives, caméra, éditeur
  components/ views/  interface
supabase/schema.sql   schéma cible (Postgres + RLS) pour une future version multi-postes
```

## Limites assumées du prototype

- Pas de synchronisation entre plusieurs appareils ni d'authentification (le profil
  Responsable / Serveur est un simple réglage local).
- Pas de connexion caisse : aucun montant n'est affiché.
- `supabase/schema.sql` décrit la cible ; il n'est pas branché.
