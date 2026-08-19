# 🌳 Canopée

Une application personnelle de suivi gamifiée, sur le thème du jardin : habitudes du jour, projets long terme, suivi sportif détaillé et progression visualisée comme une forêt qui grandit avec toi.

Multi-utilisateur avec identifiant + mot de passe, classement entre utilisateurs, et possibilité de visiter le jardin des autres.

## Fonctionnalités

- **Aujourd'hui** — objectifs personnalisés (oui/non, échelle, compteur) avec score et météo du jour, top priorités, échéances de projets, quêtes de la semaine, énergie, journal.
- **Jardin** — chaque habitude est un arbre qui grandit avec ta régularité (graine → arbre ancien), sans punition brutale en cas de jour manqué (l'arbre flétrit, il ne meurt pas).
- **Calendrier** — heatmap façon GitHub, vues mois/trimestre/année, détail au clic.
- **Projets** — long terme (jalons, kanban + timeline), one-shot (étapes), récurrents (paliers libres). Journal de bord et notes par projet.
- **Sport** — séances détaillées, séries/répétitions/charges, détection automatique de records personnels (1RM estimé via Epley), graphiques de progression, objectifs par exercice.
- **Classement** — XP et niveaux, jardins des autres utilisateurs consultables.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + TypeScript + Tailwind CSS 4
- [Prisma](https://www.prisma.io) ORM — SQLite en local, Postgres en production
- [NextAuth (Auth.js) v5](https://authjs.dev) — authentification par identifiant/mot de passe (bcrypt), sessions JWT

## Démarrage local

```bash
npm install
cp .env.example .env
# AUTH_SECRET : génère une valeur avec
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
npx prisma migrate dev
npm run dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000). Le premier écran te propose de créer un compte (identifiant + mot de passe).

## Déploiement (Vercel + Supabase)

L'app a besoin d'une vraie base de données partagée en production (pour le classement multi-utilisateur), pas seulement du stockage local. Étapes :

1. **Supabase** (gratuit) : crée un projet sur [supabase.com](https://supabase.com), récupère la chaîne de connexion Postgres (Project Settings → Database → Connection string → `URI`, mode "Session pooler" recommandé pour Vercel).
2. Dans `prisma/schema.prisma`, change le provider :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Applique le schéma sur la base Postgres :
   ```bash
   DATABASE_URL="ta-chaine-supabase" npx prisma migrate deploy
   ```
4. **Vercel** (gratuit) : importe ce repo GitHub sur [vercel.com/new](https://vercel.com/new), ajoute les variables d'environnement `DATABASE_URL` (celle de Supabase) et `AUTH_SECRET`, puis déploie.
5. Vercel te donne une URL publique (`https://ton-projet.vercel.app`) — c'est ton lien pour accéder à l'app en ligne.

## Structure du projet

```
prisma/schema.prisma       Modèle de données (habitudes, projets, sport, gamification)
src/
  app/(auth)/              Connexion / inscription
  app/(app)/                Aujourd'hui, Jardin, Projets, Sport, Classement, Réglages
  components/                UI par domaine (today, garden, projects, sport, settings)
  lib/                       Scoring, gamification (arbres/XP), auth, actions serveur
```
