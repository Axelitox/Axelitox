# Humanizer

Application web qui reformule un texte généré par IA pour qu'il sonne plus naturel, en utilisant l'API Claude d'Anthropic.

## Installation

```bash
npm install
cp .env.example .env
# Renseigne ANTHROPIC_API_KEY dans .env
npm start
```

Ouvre ensuite `http://localhost:3000`.

## Fonctionnement

- Le frontend (`public/index.html`) envoie le texte à humaniser à `POST /api/humanize`.
- Le serveur Express (`server.js`) appelle l'API Claude côté serveur (la clé API n'est jamais exposée au navigateur) et renvoie le texte reformulé.

---

## Site CS Clichy 92 Natation

Le dossier [`clichy-natation/`](clichy-natation/) contient la refonte 2026 du site du CS Clichy 92 Natation (Next.js). Voir son [README](clichy-natation/README.md).
