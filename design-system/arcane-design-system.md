# Arcane.kit — langage visuel

Petit brief que tu peux copier-coller dans un prompt à Claude (Design ou Code) pour qu'il produise des écrans cohérents.

---

## Ambiance générale

UI punk de bas-fonds, inspirée de **Zaun / Arcane** (Netflix). Chaque écran ressemble à un **mur de Zaun** : peinture fraîche, stencils de résistance, ruban de masquage, annotations au marqueur. Rien n'est propre, tout a été **peint à la main à la bombe**, mais la hiérarchie reste claire et lisible.

Pas de flat vectoriel générique. Pas de glassmorphism. Pas de néon saturé façon cyberpunk japonais. C'est **analogique**, crade, humain.

---

## Palette

Fond principal **soot ink** (#0D0B08), texte sur **bone paper** (#F0E4C1). Les couleurs d'accent arrivent par taches.

| Rôle | Token | Hex |
|---|---|---|
| CTA primaire, highlight | `--ac-shimmer` | `#FF3D8B` |
| Succès, progression, actif | `--ac-chem` | `#12D6A8` |
| Info, tech, lien | `--ac-hex` | `#5EB8FF` |
| Récompense, premium, XP | `--ac-gold` | `#F5B912` |
| Danger, destructif | `--ac-rust` | `#C8441E` |
| Arcane, magie, rare | `--ac-violet` | `#8A3DD4` |

**Ne jamais dépasser 2 couleurs d'accent par écran.** Le reste est en bone / ink.

---

## Typographie

Deux polices seulement :
- **Display** — `Arial Black` / Impact, uppercase, `skewX(-3deg)`. Pour titres, boutons, labels d'action.
- **Mono** — `Courier New`. Pour data, meta, descriptions, labels techniques. Souvent préfixé `// ` ou `> `.

Titres hero en **très grand** (50–60px), inclinés, avec un mot en shimmer qui a un `text-shadow` décalé en chem ou en ink — effet d'impression mal calée.

**Pas** de serif, pas de cursive, pas de handwritten (on triche avec le filtre SVG pour l'effet main).

---

## Les 4 ingrédients peinture (filtres SVG)

Toujours inclure une fois les quatre filtres `<defs>` en haut du document (voir `arcane-tokens.css`). Ensuite :

1. **`#ac-goo`** — gouttes de peinture qui fusionnent. Pour les **drips** sous boutons / swatches / barres de progression. Technique : un rect plat + 3-5 cercles en dessous dans un `<g filter="url(#ac-goo)">`.

2. **`#ac-paint-spread`** — éclaboussures. Pour les **splats** en arrière-plan de cards, hero, bannières. Une grosse tache + 3-5 petites satellites.

3. **`#ac-rougher`** — bords déformés lourds. Pour les **glyphes peints** (croix, X, cercles, flèches) et les **émoticônes graffiti** (`:-)` `;-)` `>:(` etc.).

4. **`#ac-rough`** — bords légèrement irréguliers. Pour touches subtiles.

En plus de ces filtres, trois techniques CSS :
- **`clip-path: polygon(...)` irrégulier** sur boutons et swatches → bords arrachés sans distordre le texte.
- **Bordures `dashed`** en bone-2 → côté papier déchiré / note posée.
- **Textures de fond** : trame diagonale en `repeating-linear-gradient` + grain pointillé en `radial-gradient` + `mix-blend-mode: overlay`.

---

## Composants signature

### Émoticônes graffiti
Émoticônes ASCII classiques (`:-)` `;-)` `:-(` `:-D` `:-P` `>:(` `X-(` `O_o`) rendues en `<text>` SVG avec `filter="url(#ac-rougher)"`. À utiliser comme **tags d'humeur** sur les cartes de personnage, feedback d'action, écrans de fin de partie.

### Boutons déchirés
Clip-path polygon aux bords irréguliers, pas de `border-radius`. Option : un petit drip SVG positionné en `bottom: -22px` pour que le bouton dégouline.

### Swatches / blocs de couleur
Fond plat + SVG goo en dessous qui fait couler la peinture plus bas que le bloc. L'effet de dripping **est** le composant.

### Jauges peintes
`<svg>` dans le track, avec `<g filter="url(#ac-goo)">` contenant un rect (la partie remplie) et 2-3 cercles à droite → la peinture semble en train de baver vers la droite.

### Alertes à ruban
Bande verticale colorée à gauche, fond teinté à 8-12% d'opacité, petit scotch en diagonale (`rotate(-2deg)`) collé en haut à droite pour les warnings.

### Cards avec coin plié
Un triangle `border` en haut à droite simule un coin qui a pris l'humidité. Drip SVG en bas pour la peinture qui coule.

### Tampon / stamp
Encadré dashed, mono 10px, uppercase, `rotate(4deg)`. Pour status badges, version numbers, timestamps.

---

## Règles de composition

- **Hiérarchie par peinture, pas par taille.** La CTA est shimmer avec drip, pas juste plus grosse.
- **Numéros de section en mono vert** (`--ac-chem`), toujours préfixés (`01`, `02`...). Type rapport de terrain.
- **Lignes pointillées** pour séparateurs, jamais de trait plein.
- **Marges asymétriques** et éléments légèrement inclinés — la grille existe mais elle est bancale.
- **Commentaires en mono** (`// EOF`, `// v0.3`) comme si c'était une feuille de technicien annotée.
- **Splats déborderont** des cartes et du hero (`overflow: visible` ou `position: absolute` négatif).

---

## À éviter

- Ombres douces / `box-shadow` flou
- Gradients lisses (sauf un `linear-gradient` foncé sur fond de card)
- `border-radius` rond sur boutons et cards (uniquement sur le conteneur root)
- Emojis Unicode (on fait nos propres glyphes SVG)
- Plus de 2 couleurs d'accent sur le même écran
- Texte sur fond peint sans contrôle de contraste (le texte reste sur plat, les drips sont à côté)

---

## Comment m'utiliser dans un prompt

> *"Fais-moi un écran de profil joueur pour mon app ARAM Missions, dans le style défini par arcane-tokens.css et arcane-design-system.md. Utilise shimmer pour la CTA principale, chem pour la jauge de progression, et gold pour le badge de rareté. Ajoute un splat violet en arrière-plan de l'avatar, une alerte warning scotchée en haut, et deux cartes de missions avec coin plié."*

Ou, dans Claude Code :

> *"Implémente cet écran en React + Tailwind en suivant les tokens de `arcane-tokens.css`. Les filtres SVG sont à inclure une fois en haut du layout via un composant `<ArcanePaintDefs />`. Les drips sont des composants `<AcDrip color="..."/>`."*
