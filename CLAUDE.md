# CLAUDE.md - Instructions pour Claude Code

## Projet
Application web de mini-jeux League of Legends (missions ARAM, Codename du CEO, quiz, etc.) jouable en salle multijoueur.

## Tech Stack
- **Framework** : Next.js 16 (App Router) + TypeScript (strict)
- **ORM** : Prisma + PostgreSQL (Neon)
- **Real-time** : Pusher (server → client push, client refetch)
- **CSS** : Tailwind CSS v4 avec classes custom LoL (lol-card, lol-text-gold, etc.)
- **Validation** : Zod
- **Runtime** : Node.js, `tsx` pour les scripts

## Commandes
- `npm run dev` — Serveur de dev (Turbopack)
- `npm run build` — Build production (prisma generate + next build)
- `npm run lint` — ESLint
- `npx prisma db push` — Appliquer le schéma à la DB (préférer à `migrate dev`)
- `npx prisma studio` — UI pour explorer la DB
- `npm run prisma:seed` — Seeder les missions/events

## Structure du projet
```
app/
  api/
    rooms/          — CRUD rooms (create, [code])
    games/
      aram-missions/[code]/  — Routes ARAM (start, stop, validate, check-mid, check-late, etc.)
      codename/[code]/       — Routes Codename
  components/       — Composants partagés (Timer, PlayerList, GameEndScreen, etc.)
  games/
    aram-missions/  — Composants spécifiques ARAM
    codename/       — Composants spécifiques Codename
    codename-ceo/   — Composants Codename CEO
    break-room-quiz/ — Quiz
    coming-game/    — Placeholder
  hooks/            — useRoom (polling + Pusher)
  types/room.ts     — Types frontend (Room, Player, PlayerMission, etc.)
  room/[code]/page.tsx — Page principale d'une room
lib/
  types.ts          — Types backend (RoomWithPlayers, etc.)
  prisma.ts         — Singleton Prisma client
  pusher.ts         — Singleton Pusher + helpers (pushRoomUpdate, pushSoundEvent, etc.)
  balancedMissionAssignment.ts — Algorithme d'attribution de missions
  filterPrivateMissions.ts     — Filtrage des données privées par joueur
  eventScheduling.ts           — Scheduling des événements aléatoires
prisma/
  schema.prisma     — Schéma DB
  seeds/            — Scripts de seed (missions, events)
```

## Règles de codage

### TypeScript
- `strict: true` — ne jamais désactiver
- Pas de `any` sauf nécessité absolue (préférer `unknown` + type guard)
- Types frontend dans `app/types/room.ts`, types backend/Prisma dans `lib/types.ts`
- Utiliser les imports `@/*` (alias configuré dans tsconfig)

### ESLint
- Config : `eslint-config-next` (core-web-vitals + typescript)
- Toujours lancer `npm run lint` après modification pour vérifier
- Ne pas désactiver les règles ESLint via `eslint-disable` sauf raison documentée

### Style / Conventions
- Langue du code : anglais (noms de variables, fonctions, composants)
- Langue des commentaires et textes UI : français
- Composants React : function components avec hooks
- API routes : utiliser NextResponse, gérer les erreurs avec try/catch
- Prisma : toujours utiliser le singleton de `lib/prisma.ts`
- Pusher : toujours appeler `pushRoomUpdate(code)` après mutation pour sync real-time

### Patterns importants
- **Settings** : Zod validation + PATCH route avec guard "au moins un champ"
- **Mission assignment** : algorithme balancé (easy=100, medium=200, hard=300, total=600pts)
- **Duel missions** : post-processing via `processDuelMissions()`
- **Données privées** : `filterPrivateMissions()` filtre missions et pendingChoices par joueur
- **Idempotence** : check-mid/check-late utilisent `@@unique` + catch sur duplicate
- **Room flow** : lobby → gameStarted → gameStartTime set (timer) → gameStopped → validation
- **Mission phases** : START (au lancement) → MID (après midMissionDelay) → LATE (après lateMissionDelay)

## Prisma
- Préférer `npx prisma db push` à `prisma migrate dev` (schema drift fréquent)
- `npx prisma generate` échoue si le dev server tourne (EPERM sur .dll.node) — stopper le serveur d'abord
- Après modification du schéma : `npx prisma db push` puis relancer le dev server

## Variables d'environnement requises
- `DATABASE_URL` — URL PostgreSQL (Neon)
- `PUSHER_APP_ID`, `PUSHER_APP_KEY`, `PUSHER_APP_SECRET`, `PUSHER_APP_CLUSTER`
- `NEXT_PUBLIC_PUSHER_APP_KEY`, `NEXT_PUBLIC_PUSHER_APP_CLUSTER`
