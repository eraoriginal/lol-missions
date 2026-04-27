# CLAUDE.md — instructions projet

## Projet
Application Next.js de mini-jeux **multi-joueurs** (ARAM Missions, Codename du CEO, Beat Eikichi, Quiz du CEO) et **solo quotidiens** (Motus, Worldle, WikiEra, Password, Cemantix).
Identité : **« La Salle de Pause »**.

- **Multi** : toute partie se joue dans une *room* avec code à 6 caractères, URL `/room/[code]`.
- **Solo** : jeux quotidiens accessibles direct via `/play/[slug]`. Un puzzle par jour, identique pour tout le monde (seed = jour UTC). Catalogues **server-only** (Motus / Worldle / WikiEra / Cemantix), validation via routes `POST /api/solo/<game>/guess` (cf. section dédiée). Persistance des essais en localStorage côté client. Pas de compte, pas de scoreboard public.

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
| `npx tsx prisma/seeds/seed_quiz_ceo.ts` | Seed Quiz du CEO (1 question par type × 14 types, idempotent) |
| `npx tsx scripts/download-lol-champions.ts` | DL splash arts LoL depuis Community Dragon (~172 JPG, ~15 MB, idempotent) |
| `npx tsx scripts/download-lol-champion-spells.ts` | DL icônes Q/W/E/R/Passif des champions LoL depuis Data Dragon (~860 PNG, ~3 MB, idempotent) |
| `npx tsx scripts/download-lol-match-assets.ts` | DL items + summoner spells + perk styles + portraits champion depuis Data Dragon (~890 PNG, ~50 MB, idempotent) |
| `npx tsx scripts/download-lol-match-history.ts` | DL historique matches via Riot Match v5 API (12 joueurs × 50 matches, ~15 min, idempotent via cache `.cache/riot/`). Requires `RIOT_API_KEY` dans `.env`. Options : `--player <riotId>`, `--limit <N>`, `--force` |
| `npx tsx scripts/test-fuzzyMatch.ts` | Tests unitaires fuzzy match (54 cas) |

QA validation : ouvrir `/test/beat-eikichi` → section **Bulk** lance `isAcceptedAnswer` sur toutes les variantes d'écriture (~9/jeu) de tout le catalogue en ~25 ms, liste les ratés ; section **Sandbox** expose `AutocompleteInput` réel + contrôles pour simuler resetKey / shake / Eikichi / overlay d'arme / timer Acide. Indispensable après toute modif de `fuzzyMatch.ts` ou de `WeaponEffectOverlay.tsx`.

`npx prisma generate` échoue (EPERM sur `.dll.node`) si le dev server tourne : tuer le serveur avant, ou utiliser directement `db push`.

## Arborescence clé
```
app/
  page.tsx                       — Homepage (2 sections : 01 Multi-joueurs + 02 Mode Solo)
  layout.tsx                     — Fonts Google + <ArcanePaintDefs/> mount
  globals.css                    — Tokens --ac-*, classes lol-*/arcane-*/poki-*, animations ac-pulse/shake/blink/slide-in
  api/
    rooms/                       — create, [code] (GET, leave, join, team, random-teams)
    games/{aram-missions|codename|beat-eikichi|quiz-ceo}/[code]/ — routes de chaque jeu multi
  components/
    arcane/                      — ★ Design system Arcane.kit (voir section dédiée)
    CreateRoomForm.tsx, JoinRoomForm.tsx, GameSelector.tsx — Form création room (filtré MULTI_GAMES)
    gameCatalog.ts               — ★ GAMES[] avec { mode: 'multi'|'solo' }, + MULTI_GAMES / SOLO_GAMES
    ConfirmDialog.tsx, Toast.tsx, LeaveRoomButton.tsx — UI partagée (toutes rewrite Arcane.kit)
    RoomLobby.tsx, ComingSoonGame.tsx — Legacy
  games/
    aram-missions/, codename/, codename-ceo/, break-room-quiz/ — style legacy
    beat-eikichi/                — ★ Arcane.kit complet (voir section Beat Eikichi)
    quiz-ceo/                    — ★ Arcane.kit complet (voir section Quiz du CEO)
      components/                — GameView, QuizCeoLobby, PlayingView, QuestionPlayer,
                                    WaitingReviewView, ReviewView, LeaderboardView, BackToLobbyButton
    solo/                        — ★ shared solo infra
      SoloScreen.tsx             — wrapper standard (back btn + date tag + hero title)
      usePersistedState.ts       — hook useSyncExternalStore pour localStorage lint-strict
    motus/ worldle/ wikiera/ password/ cemantix/ — 5 jeux solo, chacun `components/<Name>Game.tsx`
  hooks/useRoom.ts               — Fetch + Pusher + 404 redirect (multi uniquement)
  play/[slug]/page.tsx           — Routeur des jeux solo (switch sur slug)
  room/[code]/page.tsx           — Routeur des jeux multi (gameType → GameView)
  types/room.ts                  — Types frontend multi + QuizCeo types
lib/
  prisma.ts, pusher.ts           — Singletons
  types.ts                       — Types backend
  beatEikichi/                   — config, fuzzyMatch, weapons, dailyQuestions, advanceQuestion, isLatinOnly
  quizCeo/                       — config (16 types) · types (union payload/answer)
                                   catalogues bulk : textQuestions (1500), expressions (278), translations (360),
                                   countryMottos (200), absurdLaws (300), whoSaid (~104), lolPlayerMatches (648 généré),
                                   zodiacMbti (252), acronyms (150), internationalFood (100), roadSigns (~80),
                                   frenchAds (~145), knowEra (42 — connais-tu le CEO)
                                   helpers runtime : lolChampion · lolMatchCard · brandLogos · countryShapes
  solo/dailyIndex.ts             — dailyIndex(), pickByDay, seededShuffle, mulberry32, dailyDateKey
  motus/server.ts                — MOTUS_CLEAN_WORDS (server-only via `import 'server-only'`)
  motus/normalize.ts             — normalizeMotus (helper neutre, partagé client/serveur)
  worldle/server.ts              — COUNTRIES + haversineKm + bearingDeg + findCountry (server-only)
  worldle/publicNames.ts         — WORLDLE_PUBLIC_COUNTRIES (juste id+name+aliases) + arrowForBearing
  wikiera/server.ts              — WIKIERA_ENTRIES + matchesWikiera (server-only)
  password/rules.ts              — RULES[] + buildDailyContext (client-side, pas de secret)
  cemantix/server.ts             — PUZZLES + scoreGuess + normalizeCemantix (server-only)
  cemantix/shared.ts             — tierLabel (helper neutre)
  ...                            — balancedMissionAssignment, filterPrivateMissions, eventScheduling
prisma/
  schema.prisma                  — `preferred: prisma db push` (multi uniquement ; solo = 0 table)
  seeds/                         — seed.ts, codename-words.ts, seed_beat_eikichi_*.ts, seed_quiz_ceo.ts, cleanup_beat_eikichi_non_latin.ts
maquettes/                       — Snapshots Claude Design (source de vérité visuelle, NON compilé)
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
- **Catalogue généré** : pour les gros datasets (textQuestions, lolPlayerMatches, lolChampions, etc.), un script DL génère un fichier `lib/quizCeo/<X>.ts` qui exporte un `readonly array` typé. **Header obligatoire** « Généré par `scripts/<nom>.ts` — ne pas éditer ». Source de vérité = la fonction de DL, pas le fichier.
- **Bulk insert seed** : utiliser `prisma.X.createMany({ data })` au lieu de N `create()` (~3× plus rapide). Cf. `seed_quiz_ceo.ts` pour `text-question`, `expression`, `translation`, `country-motto`, `absurd-law`, `who-said`, `lol-player-match`.
- **Cache local pour API tierces** : `.cache/<source>/` (gitignored) stocke les réponses brutes. Le script vérifie le cache **avant** de throttle. Re-DL forcé via `--force`. Cf. `scripts/download-lol-match-history.ts` (cache `.cache/riot/`).
- **Throttle API à l'égard des dev keys** : `1.4s/req` reste sous 100req/2min de Riot Dev. Pour 429 : lit `retry-after` header et retry. Cf. `throttledFetch` dans le même script.

### Patterns React — ATTENTION
- **`react-hooks/set-state-in-effect` est strict** dans ce projet. Ne JAMAIS faire `setState` directement dans un `useEffect` body pour hydrater depuis un store externe (localStorage) **ou pour purger un état dérivé**. Deux options conformes :
  1. **`usePersistedState` (jeux solo)** : wrapper autour de `useSyncExternalStore` déjà écrit dans `app/games/solo/usePersistedState.ts`. Source de vérité unique. Cf. Motus/Worldle/WikiEra/Password/Cemantix.
  2. **"derived state from previous render"** (pattern React docs) : `const [last, setLast] = useState(...)` + `if (last !== current) { setLast(current); setOther(...); }` dans le corps du composant. Cf. `PlayingView.tsx` + `ReviewView.tsx` Quiz CEO.
- **Règle d'interdiction (extension Beat Eikichi)** : le même pattern s'applique à l'implémentation des jeux solo qui hydratent localStorage.
- **Refs interdites en render body** : ne JAMAIS lire `ref.current` dans le rendu d'un composant — eslint refuse. Si besoin de la valeur en render, utiliser `useState` (mise à jour depuis event handler). Cf. `RankingInput` qui mesure la hauteur d'une row au `dragStart` et la stocke en state, pas en ref.

### Pattern « busy lié au push Pusher »
Quand un CTA déclenche une mutation serveur qui sera répercutée via Pusher, **garder `busy=true` jusqu'à confirmation du push** (= changement détecté côté client), pas dès que `fetch()` retourne :

```ts
const handleCommit = async () => {
  setBusy(true);
  const ok = await post('action', body);
  if (!ok) { setBusy(false); return; } // échec serveur → reset immédiat
  // succès : on garde busy jusqu'au changement d'état (ex currentIndex change)
  setTimeout(() => setBusy(false), 3000); // fallback si push perdu
};

// Dans le derived-state pattern :
if (lastIdx !== currentIndex) {
  setLastIdx(currentIndex);
  if (busy) setBusy(false); // déverrouille au push
}
```

Sans ça : `fetch()` retourne en ~50 ms, mais le push Pusher arrive 200-600 ms plus tard → fenêtre où l'utilisateur peut re-cliquer alors que la transition n'est pas encore visible. Cf. `ReviewView.tsx::handleNext`.

### Pattern « retry idempotent côté client »
Pour les appels `/next`-style (chaque client appelle, serveur idempotent), **éviter de bloquer un useRef à un single-shot** : si le 1er appel échoue silencieusement (skipped, push perdu, clock drift), le client reste coincé. Pattern correct :
```ts
const calledForIdxRef = useRef(-1);
const lastCalledAtRef = useRef(0);
useEffect(() => {
  if (secondsLeft > 0) return;
  const now = Date.now();
  const sameIdx = calledForIdxRef.current === currentIndex;
  if (sameIdx && now - lastCalledAtRef.current < 800) return; // throttle retry
  calledForIdxRef.current = currentIndex;
  lastCalledAtRef.current = now;
  fetch('/next', ...).finally(() => refetch?.()); // refetch systématique
}, [secondsLeft, currentIndex, ...]);
```

Cf. `PlayingView.tsx` Quiz CEO. **Le `secondsLeft` doit pouvoir aller en négatif** pour que l'effet re-fire après expiration ; clamp à 0 côté UI uniquement (`Math.max(0, …)`).

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
`lib/beatEikichi/fuzzyMatch.ts::isAcceptedAnswer(input, name)` :
- **Seul le nom canonique fait foi.** Les aliases sont **ignorés** par `isAcceptedAnswer` et `computeCloseness` (décision produit après faux positifs : un alias trop permissif validait des réponses qui n'étaient pas le bon jeu). Le param `aliases` est conservé dans la signature pour rétrocompatibilité mais ne sert plus à rien. **Conséquence côté autocomplete** : les suggestions sont aussi filtrées uniquement par `g.name` (sinon l'utilisateur pouvait cliquer un jeu apparu via alias et se voir refuser).
- Normalisation : lowercase, strip accents (NFD + combining), strip `the ` prefix, chiffres romains → arabes (i→1, ii→2, … xx→20)
- **`&` ↔ `and`** : « Mount & Blade » ≡ « Mount and Blade »
- **Lookalikes cyrilliques → latin** (23 chars) : « Observ**е**r » (U+0435) équivaut à « Observer » (U+0065)
- **Suffixes d'édition optionnels** : « Maximum Edition », « Definitive Edition », « Remastered », « HD Remaster », etc. strippés du nom canonique pour permettre « Crysis 2 » d'accepter « Crysis 2 - Maximum Edition ». Ne touche PAS aux subtitles non-édition (« Tomb Raider: Anniversary » reste distinct).
- **Pas de tolérance typo** : « Halo 2 » ≠ « Halo 3 » (Levenshtein n'est utilisé que pour `computeCloseness` → feedback chaud/tiède/froid, jamais pour la validation).
- Toute modif de `fuzzyMatch.ts` → relancer `npx tsx scripts/test-fuzzyMatch.ts` (les cas qui exercent les aliases échoueront désormais — c'est attendu).

### AutocompleteInput — bugs critiques à préserver
`app/games/beat-eikichi/components/AutocompleteInput.tsx` contient **5 correctifs** de perception UI qui ne doivent pas régresser :
1. **Blur forcé par `disabled`** : onBlur vérifie `disabled` (closure sur prop) pour ignorer le blur déclenché par le passage `disabled=true` pendant un submit. Sinon `focused=false` se bloque et la dropdown ne réapparaît jamais (répro iOS Safari + desktop slow network).
2. **Shake refocus explicite** : `useEffect[shakeKey]` annule `blurTimeoutRef`, appelle `el.focus()` ET force `setFocused(true)` (iOS Safari ne fire pas `onFocus` après async).
3. **Enter sur saisie littérale** : si `userNavigated=false` (pas d'arrow key utilisée), Enter soumet `value` tel quel, pas la 1re suggestion. Évite que « Street Fighter II » soumette « Street Fighter ».
4. **Click sur scrollbar dropdown** : `onMouseDown preventDefault` sur le `<ul>` empêche le blur quand on scroll la liste.
5. **Escape** : `dismissed=true` ferme la liste SANS blur (focus préservé, reprise à la frappe).

### Synchro timer (Beat Eikichi + Quiz CEO)
Chaque client appelle `/next` au timeout local, route idempotente côté serveur (check `questionStartedAt + TIMER_MS`).

**Quiz CEO** ([`PlayingView.tsx`](app/games/quiz-ceo/components/PlayingView.tsx)) :
- `secondsLeft` peut aller en **négatif** (clamp à 0 uniquement à l'affichage via `Math.max(0, …)`) — sans ça l'effet de retry ne re-fire pas.
- Retry agressif : re-call `/next` toutes les **800 ms** tant que `currentIndex` n'a pas avancé. Couvre les cas `skipped: 'too-early'` (clock drift) et perte de push Pusher.
- `refetch?.()` systématique post-`/next` : si push perdu, on rattrape la nouvelle phase au tick suivant.

**Beat Eikichi** : safeguard plus simple (force refetch toutes les 2s si timer dépassé +3s sans changement d'index).

### Flow « quitter la room » (créateur)
Créateur clique `<LeaveRoomButton>` → ConfirmDialog (variant `destructive`) → POST `/api/rooms/[code]/leave` → `prisma.room.delete` cascade + `pushRoomUpdate` → les autres clients reçoivent le push, fetch retourne 404, `useRoom` redirige vers `/` avec toast. **Ne jamais** implémenter un QUITTER custom qui ne fait que `localStorage.clear() + router.push('/')` → la room reste fantôme côté DB.

## Quiz du CEO (spécifique)

### Gameplay
- **16 types de questions** tirées parmi ceux que le créateur active dans le lobby :
  `text-question`, `expression`, `translation`, `lol-player-match`, `country-motto`, `brand-logo`, `absurd-law`, `who-said`, `worldle`, `lol-champion`, `zodiac-mbti`, `acronyme-sigle`, `bouffe-internationale`, `panneau-signalisation`, `slogan-pub`, `know-era`.
- Timer configurable 10–300s (défaut 30s) dans le lobby. **Nombre de questions figé à 20** (cf. `QUESTION_COUNT_DEFAULT`) — non modifiable depuis le lobby. Tirage : 1 question random par type activé (max 16) + remplissage avec `text-question` jusqu'à 20, puis shuffle final pour intercaler les fillers.
- **Joueurs illimités** (vs 12 pour Beat Eikichi).
- Chaque question a un `prompt` propre (consigne spécifique) affiché au-dessus de l'input.
- Les joueurs écrivent leur réponse **sans feedback** pendant la partie — sauvegardée automatiquement (debounce 500 ms puis à l'expiration du timer).

### Flux (4 phases)
`playing` → `waiting_review` → `review` → `leaderboard`

1. **playing** : timer tourne, chaque client appelle `POST /next` à l'expiration (idempotent serveur-side via `questionStartedAt + timerSeconds`).
2. **waiting_review** : toutes les questions passées, tous les joueurs attendent que le créateur clique « LANCER LA CORRECTION ».
3. **review** : le créateur navigue question par question, voit les réponses de tous + la solution, valide bon/faux pour chaque joueur.
4. **leaderboard** : classement final, révélation worst→best, **top 2 révélés simultanément** (suspense sur le gagnant).

### Sécurité anti-spoil
`GET /api/rooms/[code]` applique 4 filtres quand `phase ∈ {playing, waiting_review}` :
1. **Strip du champ `answer`** dans chaque question du snapshot.
2. **Masquage des réponses des autres joueurs** : chaque joueur ne voit QUE ses propres `answers` (les autres sont mises à `[]`).
3. **Asset proxy opaque** sur `/api/games/quiz-ceo/[code]/asset/[index]` pour tous les payloads dont l'URL d'asset révèle la réponse :
   - **Locaux** (`public/`) : `brand-logo`, `worldle`, `lol-champion` (splash + spells via `?slot=q|w|e|r|p`).
   - **Externes** (Wikipedia/Wikimedia, fetched server-side) : `bouffe-internationale`, `panneau-signalisation`. La whitelist de hosts est `{commons.wikimedia.org, upload.wikimedia.org, en.wikipedia.org, fr.wikipedia.org}`.
   - Toutes ces URLs deviennent opaques (`/asset/3`) côté client.

En phase `review` / `leaderboard`, la partie est terminée : on expose tout.

**Quand ajouter un type** : si la nouvelle catégorie utilise un asset path qui révèle la réponse :
- **Asset local** : ajouter le préfixe à `ALLOWED_LOCAL_PREFIXES` dans `asset/[index]/route.ts` ET à `SPOIL_PREFIXES` dans `rooms/[code]/route.ts`.
- **URL externe** : ajouter le host à `ALLOWED_EXTERNAL_HOSTS` (proxy) ET à `SPOIL_EXTERNAL_HOSTS` (rooms).
- Si payload contient plusieurs URLs d'assets distincts (cas spells), les exposer via `?slot=` query param.

### Modèle de données
- `QuizCeoQuestion` (catalog) : `type`, `difficulty`, `points`, `prompt`, `payload: Json`, `answer: Json`. Union discriminée typée dans `lib/quizCeo/types.ts` (`FullQuestion`).
- `QuizCeoGame` (état par room, `@unique roomId`) : `questions: Json` (snapshot), `phase`, `currentIndex`, `timerSeconds` (snapshoté depuis Room), `questionStartedAt`.
- `QuizCeoPlayerState` : `answers: Json` (array de `PlayerAnswerEntry` : position, type, submitted, validated, pointsAwarded), `score`.
- Settings sur Room : `quizCeoTimerSeconds`, `quizCeoQuestionCount`, `quizCeoDisabledTypes[]`.

### Catégorie `text-question` — catalogue généraliste
1500 questions ouvertes (réponse libre) ventilées **500 EASY + 500 MEDIUM + 500 HARD** dans [`lib/quizCeo/textQuestions.ts`](lib/quizCeo/textQuestions.ts). Sujets variés : géographie (capitales, monuments, pays), histoire (FR + monde), sciences, cinéma, musique (pop + classique + jazz), sport, jeux vidéo, littérature, politique, TV/séries, cuisine, mythologie, animaux, tech, culture pop, BD/manga, art. Insertion `createMany` (~3× plus rapide que des `create()` un par un). Validation manuelle par le créateur en review (comme tous les `StringAnswer`). `aliases` est purement informatif — pas de fuzzy match auto.

### Catégorie `lol-player-match` — devine le joueur (QCM 4 choix)
Mécanique : on affiche une carte de match LoL réelle (champion joué, KDA, items, summoner spells, runes, CS, durée, victoire) issue de l'historique d'un joueur connu, et **on propose 4 choix** dont 1 correct. Le joueur sélectionne le bon. Cible : amis / pros / streamers reconnaissables à leur signature de jeu.

**Choix générés à chaque partie** : `start/route.ts` lit `q.answer.text` (le `displayName` du joueur réel), puis tire 3 distractors random parmi les autres `LOL_PLAYERS.displayName` (jamais le tag `#XXX`), shuffle les 4, calcule `correctIndex`. La DB stocke toujours `payload = LolMatchCardData` + `answer = { text: playerName }` — la transformation en QCM (`payload.choices`, `answer.correctIndex`) se fait au runtime à `start`. Conséquence : les choix changent à chaque nouvelle partie pour le même match.

**Pipeline DL** :
1. [`lib/quizCeo/lolPlayers.ts`](lib/quizCeo/lolPlayers.ts) — liste curée des `Riot ID#Tag` + region.
2. `npx tsx scripts/download-lol-match-history.ts` :
   - Riot ID → PUUID via Account v1
   - PUUID → 70 derniers match IDs (oversampling ×1.4 pour compenser le filtre)
   - Pour chaque match : full data via Match v5, garde si `queueId ∈ {400, 420, 430, 440, 450, 490}` (Normal Draft/Blind, Ranked Solo/Flex, ARAM, Quickplay), exclut customs/URF/tutorial.
   - Cache local `.cache/riot/` pour éviter les re-fetch.
   - Throttle 1.4s/req (sécurité dev key 100req/2min).
   - **Dedup merge** : clé composée `(matchId, playerName)` — un même `matchId` peut apparaître plusieurs fois si plusieurs amis ont joué dans la même partie, chacun avec son propre champion/KDA. Sans cette précision, un `--player <X>` virait à tort tous les matches communs.
   - Options : `--player <riotId>` (DL un seul joueur, merge avec l'existant), `--limit <N>` (override le 50 par défaut), `--force` (ignore cache).
3. Génère [`lib/quizCeo/lolPlayerMatches.ts`](lib/quizCeo/lolPlayerMatches.ts) (catalogue typé).

**Assets** : items, summoner spells, perk styles, portraits champion DL via `download-lol-match-assets.ts` (Data Dragon, public, pas de clé).

**Visuel** : composant [`<LolMatchCard>`](app/games/quiz-ceo/components/LolMatchCard.tsx) style op.gg-like dans le ton Arcane.kit (bordure colorée victoire/défaite, KDA en gros, items 4×2). Partagé entre `QuestionPlayer.tsx` (pendant la partie, avec `<ChoicesInput>` en dessous), `ReviewView.tsx` (correction, sans choix — montre la solution) et `/test/lol-match-cards` (QA visuelle, sans choix).

**Statut** : catégorie active en remplacement de `media-image` (retirée). 648 entrées en DB (12 amis du créateur + Slim Natsu × ~50 matches récents). À ré-générer périodiquement pour rafraîchir l'historique.

### Catégorie `lol-champion` — splash + sorts
Type pivot : un seul `lol-champion` qui couvre 2 mécaniques tirées **aléatoirement à chaque question** (50/50) :
- **`splash`** : splash art 1280×720 JPEG (depuis Community Dragon, sous `public/lol-champions/<id>.jpg`) avec filtre CSS « Contours » (`invert(1) grayscale(1) contrast(2.2) brightness(1.1)`). Pas d'asset détouré transparent dispo publiquement → on simule la silhouette par filtres CSS.
- **`spells`** : 5 icônes Q · W · E · R · Passif (PNG 64×64 transparent depuis Data Dragon, sous `public/lol-champion-spells/<id>/{q,w,e,r,p}.png`) en disposition « Passif central » (passif au centre 72px, sorts aux 4 coins 52px).

Le payload est discriminé par `mode: 'splash' | 'spells'` (cf. `lib/quizCeo/lolChampion.ts`). Validation manuelle par le créateur en review (comme `brand-logo` / `worldle`).

Pages de QA visuelle : `/test/lol-champions` (catalogue + 8 traitements CSS) et `/test/lol-champion-spells` (catalogue + 3 layouts × 4 difficultés).

### Routes API (toutes sous `/api/games/quiz-ceo/[code]/`)
- `start` (créateur) : tirage des 20 questions en 4 étapes (cf. JSDoc du handler) :
  1. 1 question random par type activé (max 16)
  2. Fill avec `text-question` jusqu'à 20
  3. Fallback rotation si `text-question` désactivé
  4. Shuffle final pour intercaler les fillers

  Plus, **transformations runtime du payload** :
  - `worldle` : pays random parmi 195, payload réécrit
  - `brand-logo` : marque random parmi ~400 SVG existants, payload réécrit
  - `lol-champion` : champion random parmi 172 + mode random (splash/spells), payload réécrit
  - `zodiac-mbti`, `lol-player-match`, `slogan-pub`, `know-era` : QCM 4 choix avec distractors random tirés d'un pool (signes/types/joueurs/marques/réponses CEO) — `payload.choices` reconstruit à chaque partie. Pour `know-era` les distractors curés (jusqu'à 3) sont conservés et complétés depuis `KNOW_ERA_ANSWER_POOL` si l'entrée en a moins de 3.
- `next` (tous, idempotent) : avance `currentIndex` quand timer expiré ; dernière question → `phase=waiting_review`. Tolérance clock-drift `1500ms`.
- `submit` (joueur) : auto-save de la réponse courante (écrase la précédente si déjà posée sur cette position). Vérifie `playerToken` → `player.roomId === room.id`.
- `asset/[index]` : proxy opaque pour servir un asset dont le filename leak la réponse (cf. section sécurité).
- `review-start` (créateur) : `phase=review`, `currentIndex=0`.
- `review-validate` (créateur) : bascule `validated` (true/false) sur la réponse d'un joueur, recalcule `score` total à partir de toutes les réponses validées.
- `review-next` (créateur) : `direction: 'next' | 'prev'` ; dernière → `phase=leaderboard`.
- `back-to-lobby` (créateur) : delete QuizCeoGame, `gameStarted=false`.
- `set-timer`, `toggle-type` (créateur, réglages lobby). La route `set-question-count` a été supprimée — le nombre est figé à 20.

### Checklist : ajouter une nouvelle catégorie de question
1. **Config** [`lib/quizCeo/config.ts`](lib/quizCeo/config.ts) : entrée dans `QUESTION_TYPES` (`id`, `label`, `description`).
2. **Types** [`lib/quizCeo/types.ts`](lib/quizCeo/types.ts) : variant ajouté à l'union discriminée `FullQuestion` (avec son `payload` et `answer` typés).
3. **Tirage runtime (optionnel)** [`start/route.ts`](app/api/games/quiz-ceo/[code]/start/route.ts) : si la catégorie est *runtime-driven* (1 placeholder DB + override en mémoire, comme `lol-champion`/`worldle`/`brand-logo`), ajouter le `if (q.type === '<type>')` qui réécrit `payload` + `answer`. Sinon (catégorie *DB-stored* comme `text-question`/`lol-player-match`), juste seeder N rows.
4. **Rendu joueur** [`QuestionPlayer.tsx`](app/games/quiz-ceo/components/QuestionPlayer.tsx) : `case '<type>':` dans `TypedBody` switch. Composant d'affichage (image / texte / carte) + `<TextAnswerInput>` ou input typé.
5. **Rendu review** [`ReviewView.tsx`](app/games/quiz-ceo/components/ReviewView.tsx) : `case '<type>':` dans `QuestionDisplay`. Plus le type ajouté au groupe `CanonicalAnswer` selon la shape de l'answer (ex. `StringAnswer` → groupe avec `text-question`, `acronyme-sigle`, etc. ; `ChoiceIndexAnswer` → groupe avec `zodiac-mbti`, `slogan-pub`, etc.).
6. **Seed** [`seed_quiz_ceo.ts`](prisma/seeds/seed_quiz_ceo.ts) : 1 placeholder hand-curated OU bulk `createMany` depuis un catalogue généré (pattern `text-question`).
7. **Anti-spoil (si nécessaire)** : si la catégorie expose des URLs d'assets nommés d'après la réponse, ajouter le préfixe à `ALLOWED_LOCAL_PREFIXES` (`asset/[index]/route.ts`) et `SPOIL_PREFIXES` (`rooms/[code]/route.ts`) — ou pour des URLs externes, le host à `ALLOWED_EXTERNAL_HOSTS` et `SPOIL_EXTERNAL_HOSTS`. Cf. section « Sécurité anti-spoil ».
8. **Doc** : section dédiée dans CLAUDE.md (description + spécificités + assets) + bump du compteur « N types de questions ».
9. **Vérifs** : `npx tsc --noEmit` + `npm run lint` + `npx tsx prisma/seeds/seed_quiz_ceo.ts` + ouvrir la page `/test/<x>` si applicable.

### Catégories *runtime-driven* vs *DB-stored*
- **Runtime-driven** (`lol-champion`, `worldle`, `brand-logo`) : 1 placeholder DB, le tirage est fait en mémoire à `start` parmi un pool dynamique (filesystem, catalogue lib, etc.). Idéal quand le pool est gros et change peu (172 champions, 195 silhouettes, ~400 logos).
- **DB-stored** (`text-question`, `expression`, `translation`, `country-motto`, `absurd-law`, `who-said`, `lol-player-match`, `zodiac-mbti`, `acronyme-sigle`, `bouffe-internationale`, `panneau-signalisation`, `slogan-pub`, `know-era`) : N rows en DB, le tirage est fait par la requête Prisma + le shuffling de `start`. Idéal quand chaque entrée a un `payload` + `answer` qui lui sont propres. Pour `zodiac-mbti` / `slogan-pub` / `know-era` les choix QCM (1 correct + 3 distractors) sont reconstruits à `start` parmi un pool correspondant — comme `lol-player-match`.

## Mode Solo (5 jeux quotidiens)

### Architecture commune
- **Routeur** : `app/play/[slug]/page.tsx` (server component) → switch sur slug → renvoie le composant de jeu client.
- **Seed journalier** : `lib/solo/dailyIndex.ts::dailyIndex()` = nombre de jours écoulés depuis l'epoch UTC. `pickByDay(arr)` = `arr[day % arr.length]`. `seededShuffle(arr, seed)` = Fisher-Yates déterministe via Mulberry32.
- **Wrapper visuel** : `app/games/solo/SoloScreen.tsx` — topbar avec bouton « RETOUR » + badge DAILY + date UTC, puis hero title avec accent color. Chaque jeu choisit son accent (ex : Motus = chem, Worldle = hex, Cemantix = shimmer).
- **Persistance** : `usePersistedState<T>(key, default)` dans `app/games/solo/usePersistedState.ts`. Utilise `useSyncExternalStore` (conforme lint strict). Écrit via `window.dispatchEvent(new StorageEvent(...))` pour re-trigger le hook dans le même onglet. Clé typiquement `<game>_YYYY-MM-DD`. Si la date change, on ignore la saved value et on affiche le default.

### Anti-cheat — server-side validation (Motus / Worldle / WikiEra / Cemantix)
Les catalogues solo (mots, pays, wikis, puzzles) sont **server-only** : impossible de les lire depuis les DevTools. Pattern :
- Catalogue dans `lib/<game>/server.ts` avec `import 'server-only'` au top → empêche tout bundle client (Webpack / Turbopack lèvent une erreur si un Client Component l'importe).
- Helper neutre (sans secret) dans `lib/<game>/normalize.ts` ou `shared.ts` ou `publicNames.ts` → bundlable client (juste pour input UI / display tier / autocomplete).
- Routes API dédiées :
  - `GET /api/solo/<game>/today` → métadonnées sans spoiler (longueur de mot, texte du wiki, etc.)
  - `GET /api/solo/<game>/silhouette` (Worldle uniquement) → stream le SVG du jour, URL opaque
  - `POST /api/solo/<game>/guess` → valide un essai server-side, renvoie le feedback
- Le client garde son `usePersistedState` (localStorage) pour l'historique des essais, mais la SOURCE DE VÉRITÉ pour le feedback est le serveur. Le `target` n'est révélé que quand `won === true` OU dernier essai (`attemptIndex === MAX-1`) OU `giveUp === true` (WikiEra).

**Routes existantes** :
- `/api/solo/motus/{today,guess}` — Motus, 6 essais max
- `/api/solo/worldle/{silhouette,guess}` — Worldle, 7 essais max
- `/api/solo/wikiera/{today,guess}` — WikiEra, essais illimités, support `giveUp`
- `/api/solo/cemantix/guess` — Cemantix, essais illimités (pas de `today` car aucun hint upfront)

**Limites résiduelles (assumées)** :
- Brute force : un cheater peut tester N guesses via l'API (44 pays Worldle = 44 req max). Pas de rate-limit pour l'instant — ajouter si abus.
- Le client envoie `attemptIndex` au serveur sans preuve (cf. JSDoc `motus/guess`). Un cheater peut envoyer `attemptIndex: 5` directement pour faire révéler le mot. Coût d'attaque = 1 requête craftée — équivalent à brute-forcer 6 guesses. Le but du serveur est de protéger contre la lecture **passive** du catalogue, pas contre les requêtes craftées (cheat actif assumé).
- Password : pas de backend nécessaire (les règles sont publiques par design, pas de cible cachée). Reste 100 % client-side.

**Quand ajouter un nouveau jeu solo avec secret** : créer `lib/<nom>/server.ts` (catalogue + `import 'server-only'`), `lib/<nom>/<helper>.ts` (helpers neutres pour le client), `app/api/solo/<nom>/<route>/route.ts`. Le client n'importe JAMAIS depuis `server.ts`.

### Motus (`/play/motus`)
- Mot quotidien 5–8 lettres depuis `MOTUS_CLEAN_WORDS` (filtre regex `^[A-Z]{5,8}$`).
- **Scaffold** : la 1re lettre ET toute lettre correctement placée d'un essai précédent restent visibles sur les lignes suivantes. Les positions verrouillées sont skippées auto quand on tape.
- Feedback Wordle-style : correct (chem) / misplaced (gold) / absent (ink2). Gestion des doublons avec « consume » (pass 2 sur matched).
- Clavier AZERTY (3 rangées) + ENTRÉE + ⌫. Clavier physique supporté (`keydown` listener). Lettres normalisées via `normalizeMotus` (strip accents + upper).

### Worldle (`/play/worldle`)
- 44 pays dans `COUNTRIES[]` avec `shapeFile`, `lat`, `lng`, `aliases`. Le champ `shapeFile` (orthographic projection Wikipedia) reste pour archive mais **n'est plus utilisé**.
- Image source : **SVG locaux** sous `public/country-shapes/<iso2>.svg` — uniquement le contour du pays, sans globe ni continent (cf. section « Country shapes » ci-dessous).
- 7 essais. Par essai : **distance Haversine** en km + **flèche cardinale** (8 directions via bearing) + **% de proximité** (0=20 000 km → 100 %=0 km).
- Input avec **autocomplétion** (substring + startsWith sur nom normalisé). `findCountry(input)` résout via nom + aliases.

### Country shapes — assets partagés (Worldle + Quiz CEO `country-shape`)
- **195 SVG** sous `public/country-shapes/<iso2>.svg` (ISO 3166-1 alpha-2 minuscule), forme du pays uniquement, contour blanc sur fond transparent.
- **Sources de vérité ISO** :
  - `lib/worldle/countries.ts` : 44 pays (Worldle) avec lat/lng pour calcul distance.
  - `lib/quizCeo/allCountries.ts` : ~190 pays (toute la planète) avec nom FR + aliases — utilisé par le seed Quiz CEO.
- **Pipeline** :
  1. `npm run download:country-shapes` → fetch depuis la CDN teuteuf (`cdn-assets.teuteuf.fr/data/common/country-shapes/<iso2>.svg`). Idempotent. `ALL=1` pour télécharger les ~190 (sinon 44 Worldle seulement). `FORCE=1` pour redownload.
  2. `npm run cleanup:country-shapes` → strip les `<circle>` colorés teuteuf (vert = cible, rouge = autres pays — spoilers !), bascule `fill="black"` → `fill="white"` pour visibilité sur fond sombre. Idempotent.
- **Helper** : `lib/quizCeo/countryShapes.ts::getCountryShapePath('mt')` → `'/country-shapes/mt.svg'`. Worldle utilise `shapeUrl(country)` qui a la même implémentation.
- **Pour ajouter un pays** : ajouter une entrée dans `lib/quizCeo/allCountries.ts` (ou `lib/worldle/countries.ts` si Worldle l'utilise), relancer `ALL=1 npm run download:country-shapes && npm run cleanup:country-shapes`.

### WikiEra (`/play/wikiera`)
- 15 entrées dans `WIKIERA_ENTRIES[]` : court texte descriptif anonyme + topic + aliases.
- Essais illimités, bouton « ABANDONNER » apparaît après 2 essais ratés.
- Fuzzy match `matchesWikiera` : normalise accents + lowercase + strip non-alphanum, compare au topic + aliases.

### Password (`/play/password`)
- 25 règles dans `RULES[]`. 20 sont tirées pour le jour via `seededShuffle(RULES, dailyIndex())`.
- Toutes les règles sont **évaluées client-side** : pas de dépendance externe. Certaines utilisent `DailyContext` (dayOfMonth, monthIndex, weekdayFr).
- Progression : la règle N+1 se révèle dès que toutes les règles 1..N sont satisfaites simultanément (pattern « setState during render », PAS useEffect).
- Exemples de règles : « contient 3 voyelles », « les chiffres totalisent 25 », « contient le jour de la semaine », « longueur premier », « contient un chiffre romain », « pas deux lettres identiques collées », etc.

### Cemantix (`/play/cemantix`)
- **Version simplifiée** (pas d'embeddings français embarqués, pas d'API externe pour éviter coûts supplémentaires).
- 5 puzzles dans `PUZZLES[]`. Chaque puzzle = `target` + 4 tiers de mots voisins hand-curated (`tier1` brûlant, `tier2` chaud, `tier3` tiède, `tier4` froid). Mot hors tier → rank 9999 / glacial.
- `scoreGuess(puzzle, input)` → `{ rank: number, tier: 1..5 }` via match exact normalisé.
- UI : dernier essai mis en avant + historique trié par rank croissant, progress bar + emoji thermomètre par tier.
- **Dette technique** : passer à de vrais embeddings (modèle français embarqué ou API) pour couvrir tout le vocabulaire. Les tiers actuels couvrent ~150 mots/puzzle.

## Env vars requises
- `DATABASE_URL` — PostgreSQL Neon
- `PUSHER_APP_ID`, `PUSHER_APP_KEY`, `PUSHER_APP_SECRET`, `PUSHER_APP_CLUSTER`
- `NEXT_PUBLIC_PUSHER_APP_KEY`, `NEXT_PUBLIC_PUSHER_APP_CLUSTER`
- `RAWG_API_KEY` — uniquement pour `seed:beat-eikichi` (runtime n'en a pas besoin, URLs persistées)
- `GIPHY_API_KEY` — uniquement pour `seed:beat-eikichi-gifs`
- `RIOT_API_KEY` — uniquement pour `download-lol-match-history.ts` (Dev key Riot, gratuite). Cache local `.cache/riot/` évite les re-fetch.

## Statut visuel par jeu
| Jeu | Mode | Design | Localisation |
|---|---|---|---|
| Homepage | — | ✅ Arcane.kit (sections 01 Multi + 02 Solo) | `app/page.tsx` |
| Room entry (join modal + error) | — | ✅ Arcane.kit | `app/room/[code]/page.tsx` |
| Beat Eikichi | Multi | ✅ Arcane.kit | `app/games/beat-eikichi/` |
| Quiz du CEO | Multi | ✅ Arcane.kit | `app/games/quiz-ceo/` |
| ARAM Missions | Multi | Legacy `lol-*` | `app/games/aram-missions/` |
| Codename du CEO | Multi | Legacy `poki-*` | `app/games/codename/` |
| Codename CEO (variante) | Multi | Legacy | `app/games/codename-ceo/` |
| Break Room Quiz | Multi | Legacy | `app/games/break-room-quiz/` |
| Motus | Solo | ✅ Arcane.kit | `app/games/motus/` |
| Worldle | Solo | ✅ Arcane.kit | `app/games/worldle/` |
| WikiEra | Solo | ✅ Arcane.kit | `app/games/wikiera/` |
| Password | Solo | ✅ Arcane.kit | `app/games/password/` |
| Cemantix | Solo | ✅ Arcane.kit | `app/games/cemantix/` |

Pour refaire un jeu legacy : utiliser les primitives Arcane.kit, wrapper la page racine dans `<AcScreen>`, remplacer `<LeaveRoomButton>` / `<BackToLobbyButton>` (déjà Arcane-compatibles). Les classes `lol-*`/`arcane-*`/`poki-*` restent en coexistence dans `globals.css` pour ne pas casser les jeux non-refaits.

Pour ajouter un nouveau jeu **solo** : créer `lib/<nom>/data.ts` + `app/games/<nom>/components/<Nom>Game.tsx` (wrapper `<SoloScreen>` + `usePersistedState`), ajouter une entrée avec `mode: 'solo'` dans `gameCatalog.ts`, ajouter un case dans `app/play/[slug]/page.tsx`. Aucune route API, aucune entrée Prisma — tout en localStorage.

Pour ajouter un nouveau jeu **multi** : étendre `schema.prisma` (modèle de game + settings sur Room), créer les routes `/api/games/<nom>/[code]/`, créer `app/games/<nom>/components/GameView.tsx` (+ Lobby), ajouter une entrée avec `mode: 'multi'` dans `gameCatalog.ts`, ajouter un case dans `app/room/[code]/page.tsx`, étendre `app/api/rooms/[code]/route.ts` pour inclure le nouveau game dans le fetch + filtrer côté réponse en phase "playing" si la DB expose des champs spoilers.
