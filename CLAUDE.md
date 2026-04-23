# CLAUDE.md — instructions projet

## Projet
Application Next.js de mini-jeux multijoueurs (ARAM Missions, Codename du CEO, Beat Eikichi).
Identité : **« La Salle de Pause »**. Toute partie se joue dans une *room* avec code à 6 caractères.

## ⚠️ Règle d'or : pas de worktree
**Travaille toujours dans le repo principal `C:\Users\Bonjour\Workspace\lol-missions\`**, jamais dans `.claude/worktrees/…`.
Si le shell atterrit dans un worktree, bascule immédiatement sur le repo principal (`cd` vers l'absolu) avant toute édition ou commande. Les worktrees ne sont pas synchronisés avec le `main` de l'utilisateur : tout travail y est invisible côté `git status` principal.

## Tech stack
- **Framework** : Next.js 16 App Router (Turbopack en dev), React 19, TypeScript strict
- **ORM** : Prisma + PostgreSQL (Neon)
- **Real-time** : Pusher (server push → client refetch via `useRoom`)
- **CSS** : Tailwind v4 + deux systèmes de design qui coexistent :
  - **Ancien** : classes `lol-*`, `arcane-*`, `poki-*` (définies dans `app/globals.css`, utilisées par ARAM + Codename)
  - **Nouveau** : **Arcane.kit** — primitives React sous `app/components/arcane/` (utilisé par la homepage + Beat Eikichi + Join/Leave modales)
- **Validation** : Zod
- **Runtime** : Node.js + `tsx` pour les scripts

## Commandes
| | |
|---|---|
| `npm run dev` | Dev server (Turbopack, port 3000) |
| `npm run build` | `prisma generate && next build` |
| `npm run lint` | ESLint (ignore `.claude/**`, `maquettes/**`, `design-system/**`) |
| `npx prisma db push` | Appliquer le schéma à la DB (**préférer** à `migrate dev` — schema drift fréquent) |
| `npx prisma studio` | UI DB |
| `npm run prisma:seed` | Missions + events ARAM |
| `npm run seed:beat-eikichi` | Catalogue Beat Eikichi (1000 jeux RAWG, ~5 min, idempotent) |
| `npm run seed:beat-eikichi-gifs` | Enrichit le catalogue avec 5 GIFs/jeu (GIPHY, ~10 min) |
| `npx tsx prisma/seeds/cleanup_beat_eikichi_non_latin.ts` | Supprime jeux/aliases dont le nom contient des lettres non-latines (idempotent) |
| `npx tsx scripts/test-fuzzyMatch.ts` | Tests unitaires fuzzy match (54 cas) |

QA validation : ouvrir `/test/beat-eikichi` → section **Bulk** lance `isAcceptedAnswer` sur toutes les variantes d'écriture (~9/jeu) de tout le catalogue en ~25 ms, liste les ratés ; section **Sandbox** expose `AutocompleteInput` réel + contrôles pour simuler resetKey / shake / Eikichi / overlay d'arme / timer Acide. Indispensable après toute modif de `fuzzyMatch.ts` ou de `WeaponEffectOverlay.tsx`.

`npx prisma generate` échoue (EPERM sur `.dll.node`) si le dev server tourne : tuer le serveur avant, ou utiliser directement `db push`.

## Arborescence clé
```
app/
  page.tsx                       — Homepage (design Arcane.kit)
  layout.tsx                     — Fonts Google + <ArcanePaintDefs/> mount
  globals.css                    — Tokens --ac-*, classes lol-*/arcane-*/poki-*, animations ac-pulse/shake/blink/slide-in
  api/
    rooms/                       — create, [code] (GET, leave, join, team, random-teams)
    games/{aram-missions|codename|beat-eikichi}/[code]/ — routes de chaque jeu
  components/
    arcane/                      — ★ Design system Arcane.kit (voir section dédiée)
    CreateRoomForm.tsx, JoinRoomForm.tsx, GameSelector.tsx, gameCatalog.ts — Homepage forms
    ConfirmDialog.tsx, Toast.tsx, LeaveRoomButton.tsx — UI partagée (toutes rewrite Arcane.kit)
    RoomLobby.tsx, ComingSoonGame.tsx — Legacy
  games/
    aram-missions/, codename/, codename-ceo/, break-room-quiz/, coming-game/ — style legacy
    beat-eikichi/                — ★ Totalement restylé Arcane.kit
      components/                — Lobby, WeaponPickerModal, PlayingView, AutocompleteInput,
                                    PlayerAnswerInput, BeatEikichiTimer, ShieldBlock, WeaponBlock,
                                    HintsPanel, PlayerScoreList, WeaponEffectOverlay, ReviewIntroView,
                                    ReviewView, LeaderboardView, BackToLobbyButton, ZoomPanImage
      weaponVisuals.ts           — Mapping weapon.id → AcGlyph + couleur
  hooks/useRoom.ts               — Fetch + Pusher + 404 redirect
  room/[code]/page.tsx           — Entry point (join modal + error screen Arcane.kit, route vers le jeu)
  types/room.ts                  — Types frontend
lib/
  prisma.ts, pusher.ts           — Singletons
  types.ts                       — Types backend
  beatEikichi/                   — config, fuzzyMatch, weapons, dailyQuestions, advanceQuestion, isLatinOnly
  ...                            — balancedMissionAssignment, filterPrivateMissions, eventScheduling
prisma/
  schema.prisma                  — `preferred: prisma db push`
  seeds/                         — seed.ts, codename-words.ts, seed_beat_eikichi_*.ts, cleanup_beat_eikichi_non_latin.ts
maquettes/                       — Snapshots Claude Design (source de vérité visuelle, NON compilé)
                                   - `Armes FX.html` + `screens/weapon-fx*.jsx` : catalogue FX retenus pour chaque arme
design-system/                   — arcane-design-system.md + arcane-tokens.css (brief original)
scripts/test-fuzzyMatch.ts       — 54 cas de regression fuzzy match
app/test/beat-eikichi/page.tsx   — Harnais QA validation (bulk tests + sandbox interactif)
```

## Design system Arcane.kit

### Où sont les primitives
`app/components/arcane/` — **importer toujours via `@/app/components/arcane`** (barrel export dans `index.ts`).

| Module | Composants |
|---|---|
| `tokens.ts` | `AC` (couleurs), `AC_CLIP` (bouton torn), `AC_IMAGE_FRAME_CLIP`, `AC_FONT_{DISPLAY,DISPLAY_HEAVY,BODY,MONO}` |
| `PaintDefs.tsx` | `<ArcanePaintDefs/>` — monté une fois dans `layout.tsx` ; expose les filtres SVG `#ac-rough`, `#ac-rougher`, `#ac-paint-spread`, `#ac-goo`, `#ac-paint-text`, `#ac-paint-text-heavy` |
| `primitives.tsx` | `AcDisplay`, `AcShim`, `AcHeadline`, `AcGraffitiText`, `AcDrip`, `AcSplat`, `AcEmote`, `AcGlyph` (27 kinds), `AcButton`, `AcStamp`, `AcDashed`, `AcPaintedBar`, `AcAlert`, `AcCard`, `AcSectionNum`, `AcDottedLabel`, `AcAvatar`, `AcScreen` |
| `graffiti.tsx` | `AcStar`, `AcHeart`, `AcCrown`, `AcCloudTat`, `AcSpray`, `AcCrossTag`, `AcArrowTag`, `AcBoltTag`, `AcZigzag`, `AcBurst`, `AcTriangle`, `AcHash`, `AcChevron`, `AcDiamond`, `AcScribble`, `AcGraffitiLayer` |
| `AcModalCard.tsx` | `AcModalDim` (backdrop + onClick), `AcModalCard` (torn clip + drip + tape), `AC_MODAL_CLIP` |
| `AcToast.tsx` | `AcToast` (tape + icon + title + subtitle + drip + auto-dismiss), `AcToastStack` (fixed top-right) |

### Conventions
- **Couleurs** : `AC.ink`, `AC.ink2`, `AC.bone`, `AC.bone2`, `AC.chem` (#12D6A8, succès), `AC.hex` (#5EB8FF, info), `AC.shimmer` (#FF3D8B, CTA primaire), `AC.gold` (#F5B912, warning/récompense), `AC.rust` (#C8441E, danger), `AC.violet` (#8A3DD4). **Max 2 accents/écran.**
- **Typos** : `Barlow Condensed` (titres gras uppercase), `Bebas Neue` (display), `Inter` (body), `JetBrains Mono` (labels mono préfixés `// `). Toutes chargées via `next/font/google` dans `layout.tsx`.
- **Ton mono** : toujours préfixer par `// ` (commentaire terrain) ou `> ` (input prompt).
- **Numéros de section** : `<AcSectionNum n={1}/>` → badge `01` mono chem.
- **CTA primaire** = `variant="primary"` (shimmer) + `drip` (drip gooed sous le bouton).
- **Maquettes de référence** : `maquettes/screens/{homepage,lobby,playing,review,modals}.jsx` — toute modification visuelle s'appuie sur ces fichiers. Les *primitives* `maquettes/assets/arcane-primitives.jsx` sont le brouillon duquel j'ai porté les `.tsx`.

### Gotchas Arcane.kit
1. **`clip-path` coupe les enfants absolus en dépassement.** Si un `AcStamp` positionné en `top: -8` sur un bouton clippé est rogné → wrap le bouton dans un `<div>` non-clippé qui porte `position: relative`, et rends le stamp sur le wrapper. Cf. `GameSelector.tsx` et `WeaponPickerModal.tsx`.
2. **Server component ne peut pas importer de valeurs JS d'un module `'use client'`.** Pour partager une constante entre un server component (page.tsx) et un client component (GameSelector.tsx), la mettre dans un module neutre (pas `'use client'`). Exemple : `gameCatalog.ts`.
3. **Strings JSX commençant par `//`** sont lues comme commentaires par ESLint (`react/jsx-no-comment-textnodes`). Wrapper en expression : `{'// texte'}` au lieu de `// texte` en JSX enfant.
4. **Perf SVG filters** : `feTurbulence + feDisplacementMap` coûte cher en compositing. Règles :
   - `AcGlyph` : filtre **off par défaut**, opt-in via `painted={true}` pour les gros (hero)
   - `AcEmote` : filtre appliqué uniquement si `size >= 24`
   - Pas de `AcGraffitiLayer` / `AcSplat` dans PlayingView (tick 500ms)
   - Ne pas tick < 500ms sur les composants contenant des filtres
5. **Placeholders d'inputs** : appliquer `className="ac-input"` pour obtenir le `::placeholder` à opacity 0.28 (défini dans `globals.css`).

## Règles de codage

### TypeScript
- `strict: true` — jamais désactiver
- Pas de `any` (préférer `unknown` + type guard, ou discriminated unions)
- Alias `@/*` (configuré dans `tsconfig.json`)
- Types frontend : `app/types/room.ts` ; types backend/Prisma : `lib/types.ts`

### Conventions
- Code en anglais (noms de variables, fonctions, composants)
- Commentaires + UI en français
- Function components + hooks uniquement
- API routes : `NextResponse`, try/catch + Zod validation
- Prisma : toujours `lib/prisma.ts` (singleton)
- Pusher : **toujours** `await pushRoomUpdate(code)` après mutation pour sync temps réel
- Après toute modif : `npm run lint` + `npx tsc --noEmit`

### Patterns récurrents
- **Settings** : Zod + PATCH route avec guard « au moins un champ »
- **Mission ARAM** : algorithme balancé easy=100/medium=200/hard=300 (total 600 pts)
- **Duel missions** : post-process `processDuelMissions()`
- **Filtrage privé** : `filterPrivateMissions()` par joueur token
- **Idempotence** : `@@unique` + catch Prisma `P2002` sur duplicate (check-mid, check-late, submit Beat Eikichi)
- **Room flow ARAM** : lobby → gameStarted → gameStartTime set → gameStopped → validation
- **Mission phases ARAM** : START (au lancement) → MID (après `midMissionDelay`) → LATE (après `lateMissionDelay`)
- **useRoom** : polling throttle 500ms + retry missions manquantes + redirect 404 si room supprimée

## Beat Eikichi (spécifique)

### Gameplay
- Devine le jeu vidéo à partir d'une image/GIF. 20 questions tirées au hasard par partie (rejouable).
- Timer configurable 10–300s (défaut 30s).
- **Rôle Eikichi** (optionnel) : un joueur désigné ; s'il trouve, la question passe immédiatement pour tous.
- **Armes** (1 par joueur, 3 utilisations max) — **12 armes** : smoke, c4, blade, freeze, zoomghost, tornado, puzzle, speed, tag, glitch, acid, strobe. Effet visuel à la question N+1 de la cible. Cf. `lib/beatEikichi/weapons.ts` + `WeaponEffectOverlay.tsx` + `app/games/beat-eikichi/weaponVisuals.ts` (mapping vers `AcGlyph`).
- **Bouclier** : indépendant des armes, 3 charges/partie. Annule toute attaque à la prochaine question.
- **Indices** (opt-in créateur) : genre révélé à t=0, terme à t=timer/2, plateformes à t=timer-10.
- **Mode blur** : image floutée au début, nette à timer-10.

### Armes FX — spec
Les 12 animations sont portées des maquettes `maquettes/Armes FX.html` (source de vérité visuelle). Chaque arme = variation « retenue » parmi 3 explorées :

| ID | Variation retenue | Comportement temporel | Interaction |
|---|---|---|---|
| `c4` | Graffiti Raid | 7 tags slammés en cascade (delays 0.05 → 1.1s) puis stamp BOOM central ; shake 1.8s | — |
| `smoke` | Paint Curtain | Coulures goo + wash bone qui couvre ; opacité finale 0.82 | — |
| `blade` | Multi-Slash | 3 slashs + 3 triangles ink (delays 0 / 0.25 / 0.5s) + badge ×3 | — |
| `freeze` | Shatter | 5 shards de l'image dérivent en diagonale, fond ink + voile bleuté + CRACKED tag, zoom bloqué | — |
| `zoomghost` | Spotlight | Voile bone2 **opaque** avec trou circulaire qui roam, zoom bloqué | — |
| `tornado` | Cyclone Pull | L'image tourne + scale down (270° sur 5.6s, loop), anneaux + sweep + trou noir | — |
| `puzzle` | Pop-Out interactif | 9 tuiles pop out une-par-une (stagger 0.5s, duration 1.4s) → grille de « ? » | **Clic** sur un « ? » retourne la pièce pour révéler le crop. Une seule pièce retournée à la fois ; reclic ou clic autre pièce toggle |
| `speed` | Conveyor Blur | Image scroll H blur + lignes shimmer + chevrons gold pulsants (loop) | — |
| `tag` | Spray Cloud | 4 nuages aérosol (shimmer/gold/rust/chem, sizes 700-820) + stamp TAG géant (clamp 110-240px) | — |
| `glitch` | Datamosh | RGB split + 5 bandes smear + 5 blocs corrupt (loop continu) | — |
| `acid` | Corrosion dynamique | Blob ink + halo chem qui **grandit progressivement** (smoothstep), atteint couverture totale à `timerSeconds - 5`s | — |
| `strobe` | Neon | Flashs couleur à ~12Hz cycle shimmer/chem/gold/violet/hex + pulse + RAVE stamp ; **respecte `prefers-reduced-motion`** (voile rose fixe fallback) | — |

**Namespace CSS** : toutes les classes sont sous `bek-fx-*` dans `globals.css`. L'ancien namespace `beat-eikichi-fx-*` a été **entièrement supprimé** (vidéos, snowflakes, zoomghost-lens, katana SVG, etc.) — toutes les animations sont désormais 100 % CSS keyframes, pas de vidéo ni d'asset binaire.

**Perf** : `will-change: transform, opacity` sur éléments animés haute fréquence ; `@media (prefers-reduced-motion: reduce)` neutralise tout et remplace Strobe par un voile rose statique.

**Props dynamiques** : `WeaponEffectOverlay` reçoit `questionStartedAt` + `timerSeconds` (câblés depuis `game.questionStartedAt` / `game.timerSeconds`) → nécessaires pour Acide qui calcule sa progression.

### Catalogue jeux — filtre alphabet latin
`lib/beatEikichi/isLatinOnly(s)` teste qu'une chaîne s'écrit uniquement en lettres latines (via `\p{Script=Latin}`), tolérant ponctuation/chiffres/espaces/apostrophes typographiques. Utilisé à 2 endroits :
1. **Seed catalogue** (`seed_beat_eikichi_catalog.ts`) : skip les jeux au nom non-latin + filtre les aliases non-latins avant insert.
2. **Cleanup ponctuel** (`cleanup_beat_eikichi_non_latin.ts`) : supprime les jeux/aliases non-latins déjà en DB. À lancer après tout seed antérieur au filtre.

Raison : le `tokenize()` de `fuzzyMatch.ts` split sur `[^a-z0-9]+` et stripe donc tout caractère non-latin → les aliases japonais/chinois/cyrilliques se normalisent à la chaîne vide et sont invalidables. Plutôt que supporter l'Unicode dans `tokenize` (risque de régression), on expurge le catalogue.

### Validation fuzzy — IMPORTANT
`lib/beatEikichi/fuzzyMatch.ts::isAcceptedAnswer(input, name, aliases)` :
- Normalisation : lowercase, strip accents (NFD + combining), strip `the ` prefix, chiffres romains → arabes (i→1, ii→2, … xx→20)
- **`&` ↔ `and`** : « Mount & Blade » ≡ « Mount and Blade »
- **Lookalikes cyrilliques → latin** (23 chars) : « Observ**е**r » (U+0435) équivaut à « Observer » (U+0065)
- **Suffixes d'édition optionnels** : « Maximum Edition », « Definitive Edition », « Remastered », « HD Remaster », etc. strippés du nom canonique pour permettre « Crysis 2 » d'accepter « Crysis 2 - Maximum Edition ». Ne touche PAS aux subtitles non-édition (« Tomb Raider: Anniversary » reste distinct).
- **Pas de tolérance typo** : « Halo 2 » ≠ « Halo 3 » (Levenshtein n'est utilisé que pour `computeCloseness` → feedback chaud/tiède/froid, jamais pour la validation).
- Toute modif de `fuzzyMatch.ts` → relancer `npx tsx scripts/test-fuzzyMatch.ts` (54 cas).

### AutocompleteInput — bugs critiques à préserver
`app/games/beat-eikichi/components/AutocompleteInput.tsx` contient **5 correctifs** de perception UI qui ne doivent pas régresser :
1. **Blur forcé par `disabled`** : onBlur vérifie `disabled` (closure sur prop) pour ignorer le blur déclenché par le passage `disabled=true` pendant un submit. Sinon `focused=false` se bloque et la dropdown ne réapparaît jamais (répro iOS Safari + desktop slow network).
2. **Shake refocus explicite** : `useEffect[shakeKey]` annule `blurTimeoutRef`, appelle `el.focus()` ET force `setFocused(true)` (iOS Safari ne fire pas `onFocus` après async).
3. **Enter sur saisie littérale** : si `userNavigated=false` (pas d'arrow key utilisée), Enter soumet `value` tel quel, pas la 1re suggestion. Évite que « Street Fighter II » soumette « Street Fighter ».
4. **Click sur scrollbar dropdown** : `onMouseDown preventDefault` sur le `<ul>` empêche le blur quand on scroll la liste.
5. **Escape** : `dismissed=true` ferme la liste SANS blur (focus préservé, reprise à la frappe).

### Synchro timer
Chaque client appelle `/next` au timeout local, route idempotente côté serveur (check `questionStartedAt + TIMER_MS`). Safeguard anti-désync dans `PlayingView` : force refetch toutes les 2s si timer dépassé +3s sans changement d'index.

### Flow « quitter la room » (créateur)
Créateur clique `<LeaveRoomButton>` → ConfirmDialog (variant `destructive`) → POST `/api/rooms/[code]/leave` → `prisma.room.delete` cascade + `pushRoomUpdate` → les autres clients reçoivent le push, fetch retourne 404, `useRoom` redirige vers `/` avec toast. **Ne jamais** implémenter un QUITTER custom qui ne fait que `localStorage.clear() + router.push('/')` → la room reste fantôme côté DB.

## Env vars requises
- `DATABASE_URL` — PostgreSQL Neon
- `PUSHER_APP_ID`, `PUSHER_APP_KEY`, `PUSHER_APP_SECRET`, `PUSHER_APP_CLUSTER`
- `NEXT_PUBLIC_PUSHER_APP_KEY`, `NEXT_PUBLIC_PUSHER_APP_CLUSTER`
- `RAWG_API_KEY` — uniquement pour `seed:beat-eikichi` (runtime n'en a pas besoin, URLs persistées)
- `GIPHY_API_KEY` — uniquement pour `seed:beat-eikichi-gifs`

## Statut visuel par jeu
| Jeu | Design | Localisation |
|---|---|---|
| Homepage | ✅ Arcane.kit | `app/page.tsx` |
| Room entry (join modal + error) | ✅ Arcane.kit | `app/room/[code]/page.tsx` |
| Beat Eikichi (lobby + playing + review + leaderboard) | ✅ Arcane.kit | `app/games/beat-eikichi/` |
| ARAM Missions | Legacy `lol-*` | `app/games/aram-missions/` |
| Codename du CEO | Legacy `poki-*` | `app/games/codename/` |
| Codename CEO (variante) | Legacy | `app/games/codename-ceo/` |
| Break Room Quiz | Legacy | `app/games/break-room-quiz/` |

Pour refaire un jeu legacy : utiliser les primitives Arcane.kit, wrapper la page racine dans `<AcScreen>`, remplacer `<LeaveRoomButton>` / `<BackToLobbyButton>` (déjà Arcane-compatibles). Les classes `lol-*`/`arcane-*`/`poki-*` restent en coexistence dans `globals.css` pour ne pas casser les jeux non-refaits.
