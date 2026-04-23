# Weapon FX · Spec d'intégration

Document de handoff pour l'intégration technique des effets d'arme.
Source de vérité visuelle : **`Armes FX.html`** — ouvre-la pour voir chaque
animation en boucle (3s). Ce doc traduit les protos React/CSS en spec
produit / tech.

---

## 1. Contexte gameplay

- Image d'un jeu vidéo s'affiche plein cadre · les joueurs doivent deviner
  le titre dans le temps imparti de la question.
- Une arme se lance par-dessus l'image d'UN joueur ciblé · l'image reste
  visible par les autres sans effet.
- L'effet doit **gêner la lecture** sans la rendre strictement impossible
  (sauf pour Strobe où l'image reste lisible mais fatigue l'œil).
- Durée d'un effet = **jusqu'à la fin du timer de la question** (variable,
  généralement 10–20s). Les protos bouclent sur 3s pour itérer visuellement.
- Contraintes : 3 utilisations max par joueur · 1 arme par question.

---

## 2. Catalogue final — 12 armes × 2 variations

| # | Arme | Existante ? | V1 | V2 | Recommandation |
|---|---|---|---|---|---|
| 1 | **C4** | oui | Paint Blast | Ink Blast + **V3 Graffiti Raid** | **V3** (retenue) |
| 2 | **Fumigène** | oui | Paint Wash + **V2 Ink Wash ajusté** | Hatching Roller | **V2 ajusté** (retenue) |
| 3 | **Sabre** | oui | Clean Slash | Paper Tear | à trancher |
| 4 | **Gel** | oui | Ice Cracks | Frost Stencil | à trancher |
| 5 | **Zoom Parasite** | oui | Spotlight Zoom | Paint Viewfinder | à trancher |
| 6 | **Tornade** | oui | Slow Spin | Paint Whirlpool | à trancher |
| 7 | **Puzzle Break** | oui | Torn Shuffle | Tile Flip | à trancher |
| 8 | **Speed** | oui | Conveyor Blur | Reel Film | à trancher |
| 9 | **Tag** *(nouveau)* | non | Bomb Chain | Spray Cloud | à trancher |
| 10 | **Glitch** *(nouveau)* | non | Band Tear | Pixel Crunch | à trancher |
| 11 | **Acide** *(nouveau)* | non | Corrosion | Melt | à trancher |
| 12 | **Strobe** *(nouveau)* | non | Neon Strobe | Seizure Bars | à trancher · voir ⚠ a11y |

---

## 3. Description des 4 nouvelles armes (proposition)

### TAG · Aérosol
- **Ce que l'arme fait** : 4–5 "throws" de graffiti opaques (throw-up,
  scribble, big tag, burst, cross) se posent en cascade sur l'image, chacun
  laissant un drip de peinture fraîche en bas.
- **Différence avec Fumigène** : Fumigène = voile gris/transparent, on voit
  à travers. Tag = taches **opaques** posées en dur. ≈ 75–85% de l'image
  disparaît derrière les throws, mais laisse apparaître des morceaux nets.
- **Description joueur** : « Un crew a repeint ton écran. »
- **Couleurs** : shimmer (#FF3D8B), gold (#F5B912), rust (#C4512B), chem (#12D6A8).

### GLITCH · Interférence CRT/VHS
- **Ce que l'arme fait** : l'image se découpe en bandes horizontales qui
  glissent horizontalement, split RGB chromatic aberration, scanlines,
  message "NO SIGNAL" mono qui clignote.
- **Différence avec Puzzle** : Puzzle = grille 3×3 mélangée/flipée, feeling
  papier déchiré. Glitch = bandes électroniques qui tremblent en continu,
  feeling écran mort.
- **Description joueur** : « La cassette est morte. Bonne chance. »
- **Couleurs** : hex (#4FB3E8) principal, shimmer en split RGB, bone pour
  le texte d'erreur.

### ACIDE · Corrosion
- **Ce que l'arme fait** : 4–5 trous d'encre noirs apparaissent en cascade
  sur l'image, chacun cerclé de chem (#12D6A8), et coule vers le bas en
  rigole. Variante Melt : tout le haut se liquéfie et descend en rideau.
- **Différence avec C4** : C4 = explosion instantanée + splatter. Acide =
  dégradation **progressive**, on voit l'image se faire bouffer lentement.
- **Description joueur** : « Quelqu'un a renversé de l'acide sur ton écran. »
- **Couleurs** : chem (#12D6A8) pour le halo corrosif, ink (#0D0B08) pour
  les trous / coulures.

### STROBE · Flash haute fréquence ⚠ a11y
- **Ce que l'arme fait** : pulses de couleur plein écran à haute fréquence
  (12Hz), l'image reste visible entre les flashs mais l'œil fatigue vite.
  Variante Seizure Bars : bandes verticales colorées qui strobent.
- **Différence avec les autres** : c'est la **seule** arme où l'image reste
  lisible — la gêne vient de la fatigue oculaire, pas de l'occlusion.
- **Description joueur** : « Tu viens de te prendre un gyrophare en pleine face. »
- **Couleurs** : cycle shimmer / gold / chem / hex / violet.
- **⚠ ACCESSIBILITÉ OBLIGATOIRE** :
  - Afficher un warning épilepsie au premier lancement de partie.
  - Dans les settings joueur : option **"Réduire les flashs"** qui remplace
    Strobe par un effet dégradé équivalent côté client (ex : vignette
    colorée qui pulse lentement, <3Hz).
  - Respecter `prefers-reduced-motion: reduce` en CSS → fallback doux auto.

---

## 4. Structure des fichiers

```
/
├── Armes FX.html                 ← page de preview, catalogue complet
├── assets/
│   ├── arcane-tokens.css         ← tokens CSS (couleurs, fonts)
│   └── arcane-primitives.jsx     ← ArcanePaintDefs (filtres SVG), AC.*, glyphs
└── screens/
    ├── weapon-fx.jsx             ← MONOLITHE actuel — 12 armes + 2 C4/Fumi bonus
    ├── weapon-fx-existing.jsx    ← split partiel (Sabre → Speed) — pas utilisé par la page
    ├── weapon-fx-new.jsx         ← split partiel (Tag → Strobe) — pas utilisé par la page
    └── weapon-fx-styles.jsx      ← keyframes associés aux splits
```

**Pour Claude Code** : le monolithe `weapon-fx.jsx` contient tout
(composants + `<style>` global avec les keyframes). Les fichiers `-existing`
/ `-new` / `-styles` sont des splits préparés mais non câblés — libre à
l'intégrateur de basculer dessus ou de repartir du monolithe selon la
stack cible (React/Vue/Svelte).

---

## 5. Conventions techniques

### 5.1. Chaque FX = composant autonome
Chaque arme-variation exporte un composant qui :
- Rend un `<FxCanvas>` (wrapper 16:10, clip-path papier déchiré, fond
  mock scene).
- Empile les couches de l'effet en `position: absolute; inset: 0`.
- Ne consomme **aucune prop** dans le proto (dans le produit, le canvas
  est remplacé par la vraie image du jeu — cf §6).

### 5.2. Animations
- **100% CSS** (`@keyframes` + `animation`). Aucune lib motion, aucun JS
  timeline. Une arme = ~3–8 keyframes, toutes déclarées dans le bloc
  `<style>` en fin de fichier, namespaces courts : `c4-`, `fm-`, `gl-`,
  `ac-`, `str-`, etc.
- Durée par défaut du proto : **3s en boucle infinie**. En prod :
  - Soit on passe à `animation-duration: var(--fx-duration)` piloté par
    le timer serveur.
  - Soit on **ne boucle pas** (`animation-iteration-count: 1`,
    `animation-fill-mode: forwards`) et l'image reste dans son état final
    jusqu'à la fin du timer (recommandé pour C4, Acide, Tag — où l'état
    final recouvre l'image). Pour Fumigène, Gel, Zoom, Tornade, Speed,
    Glitch, Strobe → garder la boucle (effet continu).
- `will-change: transform, opacity` à ajouter sur les éléments animés
  haute-fréquence (Strobe, Glitch, Speed, Tornade) pour éviter le repaint.

### 5.3. Filtres SVG partagés
`ArcanePaintDefs` déclare (dans `arcane-primitives.jsx`) les filtres utilisés
partout :
- `url(#ac-rougher)` — rugosité sur les traits (cracks, outlines)
- `url(#ac-goo)` — effet "peinture liquide" sur les drips
- `url(#ac-paint-spread)` — étalement sur les taches / splatters
- `url(#ac-paint-text-heavy)` — rugosité typographique sur les tags texte

⚠ **Le composant `<ArcanePaintDefs/>` doit être monté une seule fois
au root** (cf `Armes FX.html`). Sinon les `filter: url(#…)` ne résolvent pas.

### 5.4. Tokens couleur (voir `assets/arcane-tokens.css`)
```
AC.ink     = #0D0B08   fond noir chaud
AC.bone    = #F0E4C1   blanc cassé
AC.bone2   = #8A7A5C   blanc cassé sombre
AC.rust    = #C4512B   orange brique
AC.shimmer = #FF3D8B   rose punk
AC.gold    = #F5B912   jaune
AC.chem    = #12D6A8   vert chimique
AC.hex     = #4FB3E8   bleu givre
AC.violet  = #8A3DD4   violet
```

### 5.5. Fonts
- `Bebas Neue` / `Barlow Condensed` — display (tags BOOM, C4, RAID, NO SIGNAL)
- `Inter` — UI
- `JetBrains Mono` — méta (//, timecodes, tags système)

---

## 6. Contrat d'intégration produit

### 6.1. Signature recommandée côté front-end produit
```jsx
<WeaponFxOverlay
  weapon="c4"                    // voir §6.2 pour la liste
  variant="v3"                   // optionnel, défaut = variation retenue
  duration={15000}               // ms · lifespan de l'effet
  onComplete={() => …}           // callback fin d'effet
/>
```

### 6.2. Clés d'armes (snake_case, stables pour la BDD)
```
c4, fumigene, sabre, gel, zoom_parasite, tornade,
puzzle_break, speed, tag, glitch, acide, strobe
```

### 6.3. Couche d'intégration
L'overlay se monte **par-dessus** le composant d'affichage d'image jeu :
```
<ImageQuestion>
  <GameImage src="…"/>
  {activeWeapon && (
    <WeaponFxOverlay weapon={activeWeapon} duration={timeLeft}/>
  )}
</ImageQuestion>
```
L'overlay doit être `position: absolute; inset: 0; pointer-events: none;`
et **ne pas capturer les clics** (pour que le joueur puisse continuer à
taper sa réponse).

### 6.4. Remplacement du `FxCanvas` proto par la vraie image
Dans les protos, `<FxCanvas>` inclut un mock-scene SVG. En prod, ce wrapper
est remplacé par :
```jsx
<div style={{ position: 'relative', inset: 0, overflow: 'hidden' }}>
  {/* L'image jeu est en-dessous, rendue par le parent */}
  {/* Les couches FX viennent ici, identiques au proto */}
</div>
```
→ retirer le `<svg>` mock-scene et le fond `repeating-linear-gradient`.
Tout le reste des couches FX est identique.

### 6.5. Responsive
Les protos sont en 16:10. En prod l'image peut être 16:9 ou autre.
Toutes les positions sont en **%** ou `vw/vh` relatif → pas d'ajustement
nécessaire. Seules exceptions à checker : les tags typographiques (BOOM,
C4, RAID, NO SIGNAL) dont la taille en `px` doit devenir `clamp(32px, 6vw, 84px)`.

### 6.6. Performance
- Toutes les armes doivent tenir en **60fps** sur un laptop M1 / desktop 2020+.
- Mobile : Strobe + Glitch sont les plus coûteuses (box-shadows + filter
  animés). À profiler en priorité.
- Fallback `@media (prefers-reduced-motion: reduce)` → désactiver
  `animation` et afficher uniquement l'état final (pour les armes à état
  final couvrant) ou un voile gris 50% (pour les armes continues).

---

## 7. Checklist d'intégration

- [ ] Copier `arcane-tokens.css` et `arcane-primitives.jsx` dans le projet.
- [ ] Monter `<ArcanePaintDefs/>` une fois au root de l'app.
- [ ] Extraire chaque `Weapon_Variant()` en composant standalone.
- [ ] Remplacer `<FxCanvas>` par le wrapper produit (§6.4).
- [ ] Câbler `<WeaponFxOverlay>` sur l'écran de question.
- [ ] Piloter `animation-duration` depuis le timer serveur.
- [ ] Ajouter setting "Réduire les flashs" pour Strobe + respect
      `prefers-reduced-motion`.
- [ ] Afficher un warning épilepsie au premier lancement.
- [ ] Profiler mobile sur Glitch + Strobe + Tornade.
- [ ] QA 60fps sur chaque arme.

---

## 8. Reste à trancher (décisions produit)

- Arrêter **une** variation par arme (1 à 10). V3 retenue pour C4, V2
  ajusté retenu pour Fumigène.
- Décider si Strobe est inclus au lancement ou feature-flag (a11y).
- Définir la durée par défaut d'un effet (10s ? 15s ? = durée du timer ?).
- Lister les armes à boucle infinie vs état final figé (cf §5.2).
- Définir les SFX audio associés (hors scope de ce doc).
