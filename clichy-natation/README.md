# CS Clichy 92 Natation — site officiel (refonte 2026)

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Lucide.

## Démarrer

```bash
cd clichy-natation
npm install
cp .env.example .env.local   # renseigner les URLs d'inscription, d'espace adhérent et de boutique
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

## Où modifier quoi

| Contenu | Fichier |
|---|---|
| Coordonnées, réseaux sociaux, liens d'inscription | `src/lib/site.ts` + `.env.local` |
| Activités (fiches) | `src/data/activities.ts` |
| Horaires (planning filtrable) | `src/data/schedule.ts` |
| Tarifs | `src/data/pricing.ts` |
| Actualités | `src/data/news.ts` |
| Photos et logo | `src/data/media.ts` + `public/images/` |
| Partenaires | `src/data/partners.ts` + `public/images/partenaires/` |
| Redirections des anciennes URL | `next.config.ts` |

Chaque horaire et chaque tarif porte un statut : `officiel`, `tiers` ou `a-valider`. Les statuts autres que `officiel` s'affichent avec un badge discret (« À actualiser », « Source tierce »). Une fois une donnée confirmée par le club, passez son statut à `officiel`.

## Récupérer les photos et le logo du site d'origine

Le site d'origine n'était pas accessible depuis l'environnement de développement. Depuis un poste connecté à Internet :

```bash
npm run assets:fetch
```

Le script parcourt les pages de clichy-natation.com et télécharge les images (logo, photos, partenaires). Il les convertit en WebP dans `public/images/_inbox/` et écrit l'inventaire `inventory.json` : page d'origine, URL source, texte alternatif.

Ensuite :

1. Copiez les visuels retenus dans `public/images/` avec un nom explicite (ex. `hero-competition.webp`).
2. Renseignez `src` dans `src/data/media.ts`. Le logo et la photo s'affichent automatiquement à la place des emplacements réservés.
3. **Photos de mineurs** (`minors: true`) : ne les publiez qu'avec une autorisation parentale de diffusion (RGPD).

## Formulaire de contact

`POST /api/contact` envoie le message par email via [Resend](https://resend.com) (`RESEND_API_KEY`). Le formulaire inclut une case de consentement et un pot de miel anti-spam. Sans clé, l'API répond 503 et le formulaire affiche l'adresse email du club. Le site ne stocke aucune donnée.

## Audit et points à valider

Voir [`docs/AUDIT.md`](docs/AUDIT.md) : inventaire des contenus et de leurs sources, table des redirections, liste des points à valider avant la mise en ligne.
