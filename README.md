# Le Bureau du Mari de Poki

Application web interactive pour les joueurs de League of Legends permettant d'ajouter des missions secrètes et défis pendant les parties ARAM.

## Description fonctionnelle

### Concept

Ajoutez du piment à vos parties ARAM avec des missions aléatoires attribuées à chaque joueur. Les missions peuvent être publiques (visibles par tous) ou secrètes (floues pour les autres joueurs jusqu'à validation).

### Système de missions

Les missions sont révélées progressivement au cours de la partie :

| Type | Moment | Description |
|------|--------|-------------|
| **START** | Début de partie | Missions révélées dès le lancement |
| **MID** | ~5 minutes | Missions débloquées en milieu de partie |
| **LATE** | ~10 minutes | Missions débloquées en fin de partie |

### Niveaux de difficulté

| Difficulté | Points |
|------------|--------|
| Facile | 100 pts |
| Moyenne | 200 pts |
| Difficile | 500 pts |

### Catégories de missions

- **Combat** : Objectifs liés aux kills, assists, dégâts
- **Survie** : Rester en vie, éviter les morts
- **Items** : Builds spécifiques, achats particuliers
- **Handicap** : Contraintes de jeu (pas de flash, etc.)
- **Troll** : Missions fun et décalées
- **Communication** : Interaction avec les coéquipiers/adversaires
- **Build** : Constructions d'items atypiques

### Déroulement d'une partie

1. **Création de la room** : Un joueur crée une salle et obtient un code (ex: `ABC123`)
2. **Rejoindre** : Les autres joueurs rejoignent avec le code
3. **Équipes** : Chaque joueur choisit son équipe (Rouge/Bleu) ou Spectateur
4. **Lancement** : Le créateur lance la partie, les missions START sont distribuées
5. **Countdown** : Le créateur démarre le timer, les missions MID et LATE se débloquent automatiquement
6. **Validation** : En fin de partie, le créateur valide les missions accomplies
7. **Résultats** : Les points sont comptabilisés par équipe

### Fonctionnalités

- Système de rooms avec codes uniques
- Jusqu'à 10 joueurs par room
- Missions publiques et secrètes
- Synchronisation en temps réel
- Validation des missions par le créateur
- Calcul automatique des scores par équipe

## Description technique

### Stack

| Couche | Technologies |
|--------|--------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Base de données** | PostgreSQL |
| **Temps réel** | Pusher |
| **Validation** | Zod |

### Architecture

```
src/
├── app/                    # Pages et routes Next.js (App Router)
│   ├── api/               # API Routes
│   │   ├── missions/      # CRUD missions
│   │   ├── rooms/         # Gestion des rooms
│   │   └── players/       # Gestion des joueurs
│   └── games/             # Pages des jeux
│       └── aram-missions/ # Interface du jeu ARAM
├── components/            # Composants React réutilisables
├── lib/                   # Utilitaires et configurations
│   ├── prisma.ts         # Client Prisma
│   └── pusher.ts         # Configuration Pusher
└── generated/            # Types Prisma générés
```

### Modèle de données

```
Mission
├── id
├── text (contenu de la mission)
├── type (START | MID | LATE)
├── difficulty (EASY | MEDIUM | HARD)
├── points
├── isSecret
└── category

Room
├── id
├── code (ex: ABC123)
├── status (LOBBY | READY | IN_PROGRESS | VALIDATION | FINISHED)
├── creatorToken
└── players[]

Player
├── id
├── name
├── token
├── team (RED | BLUE | SPECTATOR)
├── roomId
└── missions[]

PlayerMission
├── playerId
├── missionId
├── validated
└── revealedAt
```

### Communication temps réel

L'application utilise Pusher pour la synchronisation en temps réel :

- Canal : `room-{code}`
- Événements : `room-updated`, `game-started`, `mission-revealed`, etc.
- Les clients s'abonnent au canal de leur room et reçoivent les mises à jour instantanément

### Authentification

- Système basé sur des tokens uniques stockés en localStorage
- Le créateur de la room possède des privilèges élevés (lancement, validation)
- Identification des joueurs par token lors des requêtes API

## Installation

### Prérequis

- Node.js 18+
- PostgreSQL
- Compte Pusher (pour le temps réel)

### Configuration

1. Cloner le repository

```bash
git clone <repo-url>
cd lol-missions
```

2. Installer les dépendances

```bash
npm install
```

3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir les variables :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lol_missions"
PUSHER_APP_ID="your_app_id"
PUSHER_KEY="your_key"
PUSHER_SECRET="your_secret"
PUSHER_CLUSTER="your_cluster"
NEXT_PUBLIC_PUSHER_KEY="your_key"
NEXT_PUBLIC_PUSHER_CLUSTER="your_cluster"
```

4. Initialiser la base de données

```bash
npx prisma migrate dev
npx prisma db seed
```

5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lancer en production |
| `npm run lint` | Vérification ESLint |
| `npx prisma studio` | Interface admin BDD |
| `npx prisma db seed` | Peupler la BDD avec les missions |

## Déploiement

L'application peut être déployée sur [Vercel](https://vercel.com) avec une base PostgreSQL (Neon, Supabase, etc.).

```bash
vercel deploy
```

## Roadmap

- [x] ARAM Missions
- [ ] Codename CEO
- [ ] Break Room Quiz
