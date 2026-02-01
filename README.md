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
app/
├── api/
│   ├── rooms/                          # API Routes communes
│   │   ├── create/                     # Créer une room
│   │   └── [code]/                     # Routes par room
│   │       ├── route.ts                # GET room
│   │       ├── join/                   # Rejoindre une room
│   │       ├── leave/                  # Quitter une room
│   │       └── team/                   # Changer d'équipe
│   └── games/
│       ├── aram-missions/              # API spécifique ARAM Missions
│       │   └── [code]/
│       │       ├── start/              # Démarrer la partie
│       │       ├── stop/               # Arrêter la partie
│       │       ├── launch/             # Lancer le countdown
│       │       ├── restart/            # Relancer une partie
│       │       ├── check-mid-missions/ # Vérifier missions MID
│       │       ├── check-late-missions/# Vérifier missions LATE
│       │       ├── validate/           # Valider les missions
│       │       └── settings/           # Paramètres du jeu
│       ├── codename-ceo/               # API Codename CEO (à venir)
│       ├── break-room-quiz/            # API Quiz (à venir)
│       └── coming-game/                # API Coming Game (à venir)
├── games/
│   ├── aram-missions/
│   │   └── components/                 # Composants spécifiques ARAM
│   │       ├── GameView.tsx
│   │       ├── MissionCard.tsx
│   │       ├── MissionDelayPicker.tsx
│   │       ├── OtherPlayersMissions.tsx
│   │       ├── ValidationScreen.tsx
│   │       └── ValidationSpectator.tsx
│   ├── codename-ceo/
│   │   └── components/                 # Composants Codename CEO
│   ├── break-room-quiz/
│   │   └── components/                 # Composants Quiz
│   └── coming-game/
│       └── components/                 # Composants Coming Game
├── components/                         # Composants partagés
│   ├── CreateRoomForm.tsx
│   ├── JoinRoomForm.tsx
│   ├── GameSelector.tsx
│   ├── RoomLobby.tsx
│   ├── GameEndScreen.tsx
│   ├── PlayerList.tsx
│   ├── Timer.tsx
│   └── ...
├── hooks/
│   └── useRoom.ts                      # Hook partagé
├── types/
│   └── room.ts                         # Types partagés
├── room/
│   └── [code]/
│       └── page.tsx                    # Page dynamique de room
├── layout.tsx
└── page.tsx                            # Page d'accueil
lib/
├── prisma.ts                           # Client Prisma
├── pusher.ts                           # Configuration Pusher
├── types.ts                            # Types générés
└── utils.ts                            # Utilitaires
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

## Jeux disponibles

| Jeu | Status | Description |
|-----|--------|-------------|
| **ARAM Missions** | Disponible | Missions secrètes pendant vos parties ARAM |
| **Codename du CEO** | En développement | Devinez qui est le CEO parmi vous |
| **Quiz de la salle de pause** | En développement | Questions amusantes entre collègues |
| **Coming Game** | En développement | Un nouveau jeu bientôt disponible |

## Roadmap

- [x] ARAM Missions - Jeu complet avec missions START/MID/LATE
- [ ] Codename du CEO - Jeu d'identité cachée
- [ ] Quiz de la salle de pause - Quiz multijoueur
- [ ] Coming Game - À définir
