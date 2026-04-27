/**
 * Catalogue Zodiaque & MBTI pour le Quiz CEO type `zodiac-mbti`.
 *
 * Format unique : QCM à 4 choix où l'énoncé est une description de personnalité
 * et la réponse est soit un signe astrologique (12 signes) soit un type MBTI
 * (16 types).
 *
 * Distribution :
 *   - 12 signes du zodiaque × 9 affirmations (3 easy + 3 medium + 3 hard) = 108
 *   - 16 types MBTI       × 9 affirmations (3 easy + 3 medium + 3 hard) = 144
 *   - Total : 252 entrées en DB.
 *
 * Les 4 choix QCM (1 correct + 3 distractors) sont tirés à chaque partie au
 * runtime côté `start/route.ts`, parmi le pool correspondant au sujet (zodiac
 * vs mbti). Les distractors changent donc à chaque nouvelle partie.
 *
 * Règle d'écriture stricte : les énoncés ne doivent JAMAIS contenir d'indice
 * « objectif » identifiant directement la réponse — pas de date / mois / saison
 * de naissance, pas de planète régente, pas d'élément (feu/terre/air/eau)
 * mentionné explicitement, pas de symbole/animal officiel, pas de surnom MBTI
 * (« l'Architecte »…), pas de fonction cognitive (« Ti dominant »…), pas des
 * 4 lettres MBTI (« introverti », « jugeant »…). Uniquement traits de
 * personnalité, comportements, manies, façons de réagir.
 */

export const ZODIAC_SIGNS = [
  'belier',
  'taureau',
  'gemeaux',
  'cancer',
  'lion',
  'vierge',
  'balance',
  'scorpion',
  'sagittaire',
  'capricorne',
  'verseau',
  'poissons',
] as const;
export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const ZODIAC_LABEL: Record<ZodiacSign, string> = {
  belier: 'Bélier',
  taureau: 'Taureau',
  gemeaux: 'Gémeaux',
  cancer: 'Cancer',
  lion: 'Lion',
  vierge: 'Vierge',
  balance: 'Balance',
  scorpion: 'Scorpion',
  sagittaire: 'Sagittaire',
  capricorne: 'Capricorne',
  verseau: 'Verseau',
  poissons: 'Poissons',
};

export const ZODIAC_LABELS_LIST: string[] = ZODIAC_SIGNS.map(
  (id) => ZODIAC_LABEL[id],
);

export const MBTI_TYPES = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
] as const;
export type MbtiType = (typeof MBTI_TYPES)[number];

// Pour MBTI, le label affiché côté UI est directement le code 4-lettres.
export const MBTI_LABELS_LIST: string[] = MBTI_TYPES.slice();

export type ZodiacMbtiSubject = 'zodiac' | 'mbti';

export const ZODIAC_PROMPT =
  'À quel signe du zodiaque correspond cette description ?';
export const MBTI_PROMPT =
  'À quel type de personnalité MBTI correspond cette description ?';

export interface ZodiacEntry {
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  answer: ZodiacSign;
}

export interface MbtiEntry {
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  answer: MbtiType;
}

// ═══════════════════════════════════════════════════════════════════════════
//  ZODIAQUE — 12 signes × 9 affirmations = 108 entrées
// ═══════════════════════════════════════════════════════════════════════════

export const ZODIAC_QUESTIONS: ZodiacEntry[] = [
  // ───── BÉLIER ─────
  { difficulty: 'easy', answer: 'belier', text: 'Naturellement leader, fonce avant tout le monde sans réfléchir aux conséquences.' },
  { difficulty: 'easy', answer: 'belier', text: 'Klaxonne 0,4 secondes après que le feu passe au vert.' },
  { difficulty: 'easy', answer: 'belier', text: 'Tempérament impulsif, ne tient pas en place, déteste attendre.' },
  { difficulty: 'medium', answer: 'belier', text: 'Démarre 12 projets en une semaine et n\'en finit aucun.' },
  { difficulty: 'medium', answer: 'belier', text: 'Ne supporte pas la routine, recherche en permanence un nouveau challenge.' },
  { difficulty: 'medium', answer: 'belier', text: 'Confond impulsivité et courage, mais finit souvent par avoir raison.' },
  { difficulty: 'hard', answer: 'belier', text: 'Pense vite, agit plus vite, regrette parfois — mais pas longtemps.' },
  { difficulty: 'hard', answer: 'belier', text: 'Dirige naturellement quand un groupe ne sait pas quoi faire, sans rien demander.' },
  { difficulty: 'hard', answer: 'belier', text: 'Sa colère explose et retombe dans la même journée, sans rancune apparente.' },

  // ───── TAUREAU ─────
  { difficulty: 'easy', answer: 'taureau', text: 'Apprécie la bonne nourriture, le confort et la stabilité matérielle avant tout.' },
  { difficulty: 'easy', answer: 'taureau', text: 'Refuse catégoriquement de changer de canapé même s\'il est défoncé.' },
  { difficulty: 'easy', answer: 'taureau', text: 'Têtu comme une mule mais d\'une fiabilité totale quand il s\'engage.' },
  { difficulty: 'medium', answer: 'taureau', text: 'Son langage d\'amour principal, c\'est la nourriture qu\'il prépare lui-même.' },
  { difficulty: 'medium', answer: 'taureau', text: 'Ne change rien à ses habitudes, et le rappelle à voix haute si on le force.' },
  { difficulty: 'medium', answer: 'taureau', text: 'Apparemment placide, mais une rage froide s\'installe quand on le pousse trop loin.' },
  { difficulty: 'hard', answer: 'taureau', text: 'Préfère répéter le même restaurant pendant trois ans plutôt qu\'en essayer un nouveau.' },
  { difficulty: 'hard', answer: 'taureau', text: 'Sa lenteur cache une obstination qui finit toujours par l\'emporter.' },
  { difficulty: 'hard', answer: 'taureau', text: 'S\'attache aux objets et aux odeurs autant qu\'aux personnes.' },

  // ───── GÉMEAUX ─────
  { difficulty: 'easy', answer: 'gemeaux', text: 'Curieux insatiable, capable de tenir une conversation sur n\'importe quel sujet.' },
  { difficulty: 'easy', answer: 'gemeaux', text: 'Le seul qu\'on accuse régulièrement d\'être deux personnes à la fois.' },
  { difficulty: 'easy', answer: 'gemeaux', text: 'Change d\'avis trois fois pendant la même phrase.' },
  { difficulty: 'medium', answer: 'gemeaux', text: 'Connaît tout le monde, mais peu de gens connaissent vraiment qui il est.' },
  { difficulty: 'medium', answer: 'gemeaux', text: 'Te raconte la même histoire avec deux versions différentes selon son humeur.' },
  { difficulty: 'medium', answer: 'gemeaux', text: 'S\'ennuie en 10 minutes si la conversation n\'évolue pas assez vite.' },
  { difficulty: 'hard', answer: 'gemeaux', text: 'Argumente contre lui-même pour le plaisir de tester l\'idée.' },
  { difficulty: 'hard', answer: 'gemeaux', text: 'Possède 14 carnets entamés sur 14 sujets différents.' },
  { difficulty: 'hard', answer: 'gemeaux', text: 'Capable d\'être chaleureux puis glacial dans la même soirée, sans transition visible.' },

  // ───── CANCER ─────
  { difficulty: 'easy', answer: 'cancer', text: 'Hypersensible, profondément attaché à sa famille et à son foyer.' },
  { difficulty: 'easy', answer: 'cancer', text: 'Pleure devant une pub de chien sauvé.' },
  { difficulty: 'easy', answer: 'cancer', text: 'Carapace dure dehors, ultra-tendre dedans.' },
  { difficulty: 'medium', answer: 'cancer', text: 'Réagit aux conflits en se réfugiant chez lui sans prévenir.' },
  { difficulty: 'medium', answer: 'cancer', text: 'Se souvient de toutes les dates importantes — y compris celles que tu as oubliées.' },
  { difficulty: 'medium', answer: 'cancer', text: 'A besoin de protéger quelqu\'un pour se sentir lui-même en sécurité.' },
  { difficulty: 'hard', answer: 'cancer', text: 'Te ramène un Tupperware le lendemain de la dispute pour montrer qu\'il est passé à autre chose.' },
  { difficulty: 'hard', answer: 'cancer', text: 'Se construit un foyer émotionnel autour de quelques personnes triées sur le volet.' },
  { difficulty: 'hard', answer: 'cancer', text: 'Ses sautes d\'humeur suivent un calendrier que lui seul comprend.' },

  // ───── LION ─────
  { difficulty: 'easy', answer: 'lion', text: 'Charismatique, généreux, aime être au centre de l\'attention.' },
  { difficulty: 'easy', answer: 'lion', text: 'Prend 200 selfies pour en garder un seul à publier.' },
  { difficulty: 'easy', answer: 'lion', text: 'Considère qu\'une pièce s\'illumine quand il y entre — et il n\'a pas tort.' },
  { difficulty: 'medium', answer: 'lion', text: 'Loyal, mais avec une attitude provocatrice quand il se sent ignoré.' },
  { difficulty: 'medium', answer: 'lion', text: 'Préfère mille fois être le second au sommet que le premier dans la médiocrité.' },
  { difficulty: 'medium', answer: 'lion', text: 'Encaisse mal les compliments adressés à quelqu\'un d\'autre dans la même pièce.' },
  { difficulty: 'hard', answer: 'lion', text: 'Sa fierté est plus grande que ses besoins matériels — il refusera l\'aumône d\'un proche.' },
  { difficulty: 'hard', answer: 'lion', text: 'Donne tout ou rien, et oublie souvent qu\'il existe une zone intermédiaire.' },
  { difficulty: 'hard', answer: 'lion', text: 'A besoin d\'admiration sincère ; une admiration polie le blesse plus qu\'un silence.' },

  // ───── VIERGE ─────
  { difficulty: 'easy', answer: 'vierge', text: 'Méticuleux, analytique, perfectionniste jusqu\'au moindre détail.' },
  { difficulty: 'easy', answer: 'vierge', text: 'Refait le lit après que tu l\'aies fait, parce que les plis n\'étaient pas alignés.' },
  { difficulty: 'easy', answer: 'vierge', text: 'Critique d\'abord lui-même avant les autres, mais critique tout le monde.' },
  { difficulty: 'medium', answer: 'vierge', text: 'Tient un Excel pour ses courses du dimanche, classé par allée du supermarché.' },
  { difficulty: 'medium', answer: 'vierge', text: 'Donne l\'impression de juger en silence — parce que c\'est exactement ce qu\'il fait.' },
  { difficulty: 'medium', answer: 'vierge', text: 'Refait ce que tu viens de faire en s\'excusant que « ce n\'était pas tout à fait fini ».' },
  { difficulty: 'hard', answer: 'vierge', text: 'Aime servir mais n\'admet jamais qu\'il a besoin qu\'on le serve en retour.' },
  { difficulty: 'hard', answer: 'vierge', text: 'Voit les défauts de tout système et ne peut s\'empêcher de les signaler, même non sollicité.' },
  { difficulty: 'hard', answer: 'vierge', text: 'Sa façon d\'aider passe par l\'analyse pratique, pas par la consolation émotionnelle.' },

  // ───── BALANCE ─────
  { difficulty: 'easy', answer: 'balance', text: 'Diplomate, esthète, cherche l\'harmonie dans tous ses rapports.' },
  { difficulty: 'easy', answer: 'balance', text: 'Met 45 minutes à choisir entre deux pizzas identiques.' },
  { difficulty: 'easy', answer: 'balance', text: 'Demande l\'avis de 6 personnes avant d\'acheter une paire de chaussettes.' },
  { difficulty: 'medium', answer: 'balance', text: 'Souffre quand il y a un conflit dans la pièce, même s\'il n\'est pas concerné.' },
  { difficulty: 'medium', answer: 'balance', text: 'Sait toujours quoi dire pour adoucir une situation tendue.' },
  { difficulty: 'medium', answer: 'balance', text: 'Procrastine les décisions importantes en pesant les options à l\'infini.' },
  { difficulty: 'hard', answer: 'balance', text: 'Charme tout le monde mais déteste profondément choisir entre deux options.' },
  { difficulty: 'hard', answer: 'balance', text: 'Évite les conflits frontaux mais devient passif-agressif quand on le pousse.' },
  { difficulty: 'hard', answer: 'balance', text: 'Recherche l\'esthétique dans tout — un mauvais éclairage peut lui gâcher la soirée.' },

  // ───── SCORPION ─────
  { difficulty: 'easy', answer: 'scorpion', text: 'Intense, magnétique, va toujours chercher la vérité sous la surface.' },
  { difficulty: 'easy', answer: 'scorpion', text: 'Te stalke sur LinkedIn 6 mois après votre seul date.' },
  { difficulty: 'easy', answer: 'scorpion', text: 'Rancunier d\'élite : oublie ton prénom mais pas ce que tu lui as fait en 2017.' },
  { difficulty: 'medium', answer: 'scorpion', text: 'On dit qu\'il est obsédé par le contrôle et l\'intensité émotionnelle.' },
  { difficulty: 'medium', answer: 'scorpion', text: 'Te lit comme un livre ouvert, et ferme le sien à clef.' },
  { difficulty: 'medium', answer: 'scorpion', text: 'Préfère la franchise brutale aux silences polis — quitte à blesser.' },
  { difficulty: 'hard', answer: 'scorpion', text: 'Tout chez lui est intense : le silence, le regard, la rancune, la passion.' },
  { difficulty: 'hard', answer: 'scorpion', text: 'Préfère perdre un ami qu\'avoir une conversation superficielle avec lui.' },
  { difficulty: 'hard', answer: 'scorpion', text: 'Sait parfaitement où sont tes points faibles, et choisit de ne pas s\'en servir — la plupart du temps.' },

  // ───── SAGITTAIRE ─────
  { difficulty: 'easy', answer: 'sagittaire', text: 'Optimiste invétéré, en quête permanente d\'aventure et de liberté.' },
  { difficulty: 'easy', answer: 'sagittaire', text: 'Réserve un billet pour Bali un mardi à 23h sans prévenir personne.' },
  { difficulty: 'easy', answer: 'sagittaire', text: 'Te dit ses quatre vérités, puis demande pourquoi tu fais la tête.' },
  { difficulty: 'medium', answer: 'sagittaire', text: 'Toujours en train de planifier le prochain voyage, même quand il est en voyage.' },
  { difficulty: 'medium', answer: 'sagittaire', text: 'S\'engage à fond sur trois mois, puis disparaît du paysage.' },
  { difficulty: 'medium', answer: 'sagittaire', text: 'Refuse les compromis qu\'il considère comme des trahisons à sa liberté.' },
  { difficulty: 'hard', answer: 'sagittaire', text: 'Sa franchise n\'est pas de la méchanceté, mais il ne s\'en rend pas toujours compte.' },
  { difficulty: 'hard', answer: 'sagittaire', text: 'Préfère une nouvelle expérience décevante à une ancienne expérience confortable.' },
  { difficulty: 'hard', answer: 'sagittaire', text: 'Donne des leçons philosophiques pour un dîner de famille — et y croit vraiment.' },

  // ───── CAPRICORNE ─────
  { difficulty: 'easy', answer: 'capricorne', text: 'Ambitieux, discipliné, joue toujours sur le long terme.' },
  { difficulty: 'easy', answer: 'capricorne', text: 'Prépare son plan retraite à 23 ans.' },
  { difficulty: 'easy', answer: 'capricorne', text: 'Considère les vacances comme une perte de productivité.' },
  { difficulty: 'medium', answer: 'capricorne', text: 'Voit la vie comme un Excel à long terme et coche les cases une par une.' },
  { difficulty: 'medium', answer: 'capricorne', text: 'Donne l\'impression d\'être froid alors qu\'il observe pour mieux engager.' },
  { difficulty: 'medium', answer: 'capricorne', text: 'Compte les heures de sommeil de la semaine pour optimiser sa productivité.' },
  { difficulty: 'hard', answer: 'capricorne', text: 'Met dix ans à construire ce que d\'autres improvisent en six mois — mais ça tient toujours.' },
  { difficulty: 'hard', answer: 'capricorne', text: 'Sa réserve cache un humour pince-sans-rire que peu de monde voit venir.' },
  { difficulty: 'hard', answer: 'capricorne', text: 'Considère le plaisir comme une récompense à mériter, jamais un dû.' },

  // ───── VERSEAU ─────
  { difficulty: 'easy', answer: 'verseau', text: 'Indépendant, visionnaire, attaché à ses idées plus qu\'aux conventions.' },
  { difficulty: 'easy', answer: 'verseau', text: 'Te répond « intéressant » quand il n\'est pas du tout d\'accord.' },
  { difficulty: 'easy', answer: 'verseau', text: 'Disparaît trois semaines puis réapparaît comme s\'il s\'était passé 5 minutes.' },
  { difficulty: 'medium', answer: 'verseau', text: 'Te répond avec une théorie sociologique quand tu lui demandes simplement comment il va.' },
  { difficulty: 'medium', answer: 'verseau', text: 'Refuse les étiquettes qu\'on essaye de lui coller, mais en colle volontiers aux autres.' },
  { difficulty: 'medium', answer: 'verseau', text: 'Très investi dans ses causes humanitaires, distant dans ses relations proches.' },
  { difficulty: 'hard', answer: 'verseau', text: 'Se sent à sa place dans un groupe, mais à l\'aise nulle part vraiment.' },
  { difficulty: 'hard', answer: 'verseau', text: 'Peut paraître absent émotionnellement et pourtant être totalement engagé intellectuellement.' },
  { difficulty: 'hard', answer: 'verseau', text: 'Refusera de faire comme tout le monde, même quand tout le monde a raison.' },

  // ───── POISSONS ─────
  { difficulty: 'easy', answer: 'poissons', text: 'Rêveur, intuitif, profondément empathique avec les émotions des autres.' },
  { difficulty: 'easy', answer: 'poissons', text: 'Pleure parce que la chanson « lui parle ».' },
  { difficulty: 'easy', answer: 'poissons', text: 'Se perd dans ses pensées en faisant la vaisselle pendant 40 minutes.' },
  { difficulty: 'medium', answer: 'poissons', text: 'Oublie ses propres besoins pour s\'occuper de ceux des autres.' },
  { difficulty: 'medium', answer: 'poissons', text: 'Vit dans son imaginaire 70 % du temps, et fait semblant d\'écouter le reste.' },
  { difficulty: 'medium', answer: 'poissons', text: 'Capte l\'humeur d\'une pièce dès qu\'il y entre, sans qu\'on lui dise un mot.' },
  { difficulty: 'hard', answer: 'poissons', text: 'S\'adapte à l\'humeur de ses interlocuteurs au point d\'oublier ses propres opinions.' },
  { difficulty: 'hard', answer: 'poissons', text: 'Crée un univers entier à partir d\'une chanson, d\'un film ou d\'un voyage en métro.' },
  { difficulty: 'hard', answer: 'poissons', text: 'Sa générosité est sans limite, ses limites sont presque inexistantes.' },
];

// ═══════════════════════════════════════════════════════════════════════════
//  MBTI — 16 types × 9 affirmations = 144 entrées
// ═══════════════════════════════════════════════════════════════════════════

export const MBTI_QUESTIONS: MbtiEntry[] = [
  // ───── INTJ ─────
  { difficulty: 'easy', answer: 'INTJ', text: 'Planifie sa vie sur 10 ans et révise le plan tous les trimestres.' },
  { difficulty: 'easy', answer: 'INTJ', text: 'Te coupe la parole pour finir ton raisonnement à ta place — correctement.' },
  { difficulty: 'easy', answer: 'INTJ', text: 'Demande systématiquement « et l\'objectif final ? » en réunion.' },
  { difficulty: 'medium', answer: 'INTJ', text: 'En groupe : silencieux pendant une heure, puis détruit l\'idée de tout le monde en une phrase.' },
  { difficulty: 'medium', answer: 'INTJ', text: 'Trouve la plupart des conversations sociales « inefficaces ».' },
  { difficulty: 'medium', answer: 'INTJ', text: 'Écrit des essais privés pour clarifier ses propres opinions avant d\'en parler.' },
  { difficulty: 'hard', answer: 'INTJ', text: 'Stratège dans l\'âme, joue les coups quatre à l\'avance — et déteste l\'imprévu.' },
  { difficulty: 'hard', answer: 'INTJ', text: 'Considère l\'émotion comme une donnée à intégrer, pas comme un guide à suivre.' },
  { difficulty: 'hard', answer: 'INTJ', text: 'Sa loyauté est rare, sélective, et basée sur le respect intellectuel plus que sur l\'affect.' },

  // ───── INTP ─────
  { difficulty: 'easy', answer: 'INTP', text: 'Connaît la réponse, mais préfère démontrer pourquoi la question est mal posée.' },
  { difficulty: 'easy', answer: 'INTP', text: '47 onglets ouverts sur des sujets sans aucun rapport entre eux.' },
  { difficulty: 'easy', answer: 'INTP', text: 'Oublie de manger parce qu\'il « réfléchissait à un truc ».' },
  { difficulty: 'medium', answer: 'INTP', text: 'Refuse de donner son avis tant qu\'il n\'a pas exploré au moins trois angles.' },
  { difficulty: 'medium', answer: 'INTP', text: 'Démarre une analyse approfondie d\'un détail mineur dans une conversation banale.' },
  { difficulty: 'medium', answer: 'INTP', text: 'La logique est sa langue maternelle ; le reste est un dialecte qu\'il traduit avec effort.' },
  { difficulty: 'hard', answer: 'INTP', text: 'Capable de remettre en question l\'axiome de base d\'une discipline qu\'il vient de découvrir.' },
  { difficulty: 'hard', answer: 'INTP', text: 'Engage rarement un projet, mais quand il le fait, c\'est avec un niveau de précision excessif.' },
  { difficulty: 'hard', answer: 'INTP', text: 'Difficile à cerner émotionnellement — il met des années à exprimer une affection vraie.' },

  // ───── ENTJ ─────
  { difficulty: 'easy', answer: 'ENTJ', text: 'Transforme un brunch entre amis en réunion stratégique.' },
  { difficulty: 'easy', answer: 'ENTJ', text: 'Voit les obstacles comme des étapes à cocher, pas comme des problèmes.' },
  { difficulty: 'easy', answer: 'ENTJ', text: 'Demande « et concrètement, on fait quoi » toutes les 4 minutes.' },
  { difficulty: 'medium', answer: 'ENTJ', text: 'Prend les rênes d\'un groupe sans qu\'on lui demande, et personne ne s\'en plaint vraiment.' },
  { difficulty: 'medium', answer: 'ENTJ', text: 'Ne supporte pas l\'inefficacité, qu\'il identifie comme un manque de respect du temps.' },
  { difficulty: 'medium', answer: 'ENTJ', text: 'Préfère échouer avec une décision claire qu\'attendre pour avoir plus d\'informations.' },
  { difficulty: 'hard', answer: 'ENTJ', text: 'Vise systématiquement la position de pilote, en couple comme en réunion.' },
  { difficulty: 'hard', answer: 'ENTJ', text: 'Mesure son progrès en livrables concrets, pas en émotions ressenties.' },
  { difficulty: 'hard', answer: 'ENTJ', text: 'Capable d\'une chaleur surprenante, mais seulement avec un cercle qu\'il a personnellement choisi.' },

  // ───── ENTP ─────
  { difficulty: 'easy', answer: 'ENTP', text: 'Joue l\'avocat du diable même quand il est d\'accord avec toi.' },
  { difficulty: 'easy', answer: 'ENTP', text: 'Lance une nouvelle idée business par jour, en termine zéro.' },
  { difficulty: 'easy', answer: 'ENTP', text: 'Adore débattre, encore plus quand il a tort.' },
  { difficulty: 'medium', answer: 'ENTP', text: 'Fait dérailler une conversation sérieuse avec une remarque ironique au pire moment.' },
  { difficulty: 'medium', answer: 'ENTP', text: 'Capable de te convaincre d\'un avis, puis de l\'avis opposé, dans la même soirée.' },
  { difficulty: 'medium', answer: 'ENTP', text: 'Accumule les compétences en surface, jamais en profondeur — par choix assumé.' },
  { difficulty: 'hard', answer: 'ENTP', text: 'Voit dans chaque règle un défi à reformuler, pas une consigne à suivre.' },
  { difficulty: 'hard', answer: 'ENTP', text: 'S\'ennuie dès qu\'un problème devient répétitif, même s\'il est lucratif.' },
  { difficulty: 'hard', answer: 'ENTP', text: 'Sa loyauté passe par l\'audace partagée, pas par les marques d\'attention.' },

  // ───── INFJ ─────
  { difficulty: 'easy', answer: 'INFJ', text: 'Devine ton humeur avant que tu n\'aies dit un mot.' },
  { difficulty: 'easy', answer: 'INFJ', text: 'Ghoste pendant 3 semaines pour « se ressourcer ».' },
  { difficulty: 'easy', answer: 'INFJ', text: 'Prend chaque critique comme une attaque personnelle, en silence.' },
  { difficulty: 'medium', answer: 'INFJ', text: 'A une vision très précise du futur idéal, et beaucoup de mal à l\'expliquer.' },
  { difficulty: 'medium', answer: 'INFJ', text: 'Capable d\'écouter pendant des heures, mais explose quand on dépasse une limite invisible.' },
  { difficulty: 'medium', answer: 'INFJ', text: 'Cherche du sens dans tout — un job sans sens lui devient insupportable.' },
  { difficulty: 'hard', answer: 'INFJ', text: 'Peu de gens à qui il fait vraiment confiance, mais ceux-là, il les défend à mort.' },
  { difficulty: 'hard', answer: 'INFJ', text: 'Sa douceur cache une exigence morale presque inflexible.' },
  { difficulty: 'hard', answer: 'INFJ', text: 'Combine intuition fine et idéalisme rigide — paraît contradictoire à qui le connaît mal.' },

  // ───── INFP ─────
  { difficulty: 'easy', answer: 'INFP', text: 'Pleure devant un générique de Pixar.' },
  { difficulty: 'easy', answer: 'INFP', text: 'A 14 carnets entamés, aucun fini.' },
  { difficulty: 'easy', answer: 'INFP', text: 'Refuse un boulot bien payé parce que « ça ne lui ressemble pas ».' },
  { difficulty: 'medium', answer: 'INFP', text: 'Cherche à éviter le conflit, mais s\'enflamme dès qu\'on touche à une de ses valeurs.' },
  { difficulty: 'medium', answer: 'INFP', text: 'Son monde intérieur est plus vivant que sa vie sociale — et il préfère ça.' },
  { difficulty: 'medium', answer: 'INFP', text: 'Te dit « ça va » alors qu\'il a passé la nuit à analyser une remarque que tu as oubliée.' },
  { difficulty: 'hard', answer: 'INFP', text: 'Capable de poésie intense suivie de longues plages de silence.' },
  { difficulty: 'hard', answer: 'INFP', text: 'Sa bienveillance est sincère mais sélective : il refuse de la simuler par politesse.' },
  { difficulty: 'hard', answer: 'INFP', text: 'Idéalise les gens, puis souffre quand la réalité ne correspond pas à l\'image.' },

  // ───── ENFJ ─────
  { difficulty: 'easy', answer: 'ENFJ', text: 'Se souvient de l\'anniversaire de ton chien.' },
  { difficulty: 'easy', answer: 'ENFJ', text: 'Organise les soirées et fait croire à tout le monde qu\'ils ont fait quelque chose.' },
  { difficulty: 'easy', answer: 'ENFJ', text: 'Sait exactement quoi te dire pour que tu te sentes mieux — et le pense vraiment.' },
  { difficulty: 'medium', answer: 'ENFJ', text: 'Dévoue tellement de temps aux autres qu\'il en oublie ses propres priorités.' },
  { difficulty: 'medium', answer: 'ENFJ', text: 'Fédérateur naturel, ressent une vraie souffrance quand un groupe se déchire.' },
  { difficulty: 'medium', answer: 'ENFJ', text: 'Lit les non-dits dans une réunion mieux que les paroles prononcées.' },
  { difficulty: 'hard', answer: 'ENFJ', text: 'Capable de motiver une foule, mais doute de ses propres décisions en privé.' },
  { difficulty: 'hard', answer: 'ENFJ', text: 'Sa gentillesse n\'est pas naïve : il sait précisément ce qu\'il fait quand il aide.' },
  { difficulty: 'hard', answer: 'ENFJ', text: 'Souffre du regard des autres bien plus qu\'il ne le laisse paraître.' },

  // ───── ENFP ─────
  { difficulty: 'easy', answer: 'ENFP', text: 'Rentre dans une pièce et a parlé à 12 personnes en 5 minutes.' },
  { difficulty: 'easy', answer: 'ENFP', text: 'Démarre 8 projets passionnants en même temps.' },
  { difficulty: 'easy', answer: 'ENFP', text: 'Te dit « on doit absolument se voir » à 3 personnes différentes par semaine.' },
  { difficulty: 'medium', answer: 'ENFP', text: 'Grand enthousiasme suivi d\'un grand creux quand l\'idée perd son éclat initial.' },
  { difficulty: 'medium', answer: 'ENFP', text: 'Capable d\'aimer l\'idée d\'une personne plus que la personne elle-même.' },
  { difficulty: 'medium', answer: 'ENFP', text: 'Se sent étouffé par les routines, mais terrifié par la solitude prolongée.' },
  { difficulty: 'hard', answer: 'ENFP', text: 'Sa spontanéité cache une réflexion existentielle quasi permanente.' },
  { difficulty: 'hard', answer: 'ENFP', text: 'Donne l\'impression de tout réussir, alors qu\'il jongle en permanence avec ses doutes.' },
  { difficulty: 'hard', answer: 'ENFP', text: 'Capable d\'enthousiasmer un groupe et de douter intimement du sens de tout, le même jour.' },

  // ───── ISTJ ─────
  { difficulty: 'easy', answer: 'ISTJ', text: 'Arrive 12 minutes en avance, partout, toujours.' },
  { difficulty: 'easy', answer: 'ISTJ', text: 'A un dossier Drive parfaitement nommé pour chaque facture depuis 2014.' },
  { difficulty: 'easy', answer: 'ISTJ', text: 'Si c\'était la règle hier, c\'est encore la règle aujourd\'hui.' },
  { difficulty: 'medium', answer: 'ISTJ', text: 'Considère les promesses comme un contrat à honorer à la lettre.' },
  { difficulty: 'medium', answer: 'ISTJ', text: 'Se méfie des changements rapides et des gens trop enthousiastes.' },
  { difficulty: 'medium', answer: 'ISTJ', text: 'Préfère le travail bien fait au travail mémorable.' },
  { difficulty: 'hard', answer: 'ISTJ', text: 'Sa loyauté est totale et silencieuse — il ne la mentionne jamais, il l\'incarne.' },
  { difficulty: 'hard', answer: 'ISTJ', text: 'Sous une apparence rigide, possède un sens du devoir profond et personnel.' },
  { difficulty: 'hard', answer: 'ISTJ', text: 'Évalue les gens à leurs actes constants, pas à leurs déclarations.' },

  // ───── ISFJ ─────
  { difficulty: 'easy', answer: 'ISFJ', text: 'Te ramène un médicament avant que tu n\'aies dit que tu étais malade.' },
  { difficulty: 'easy', answer: 'ISFJ', text: 'N\'oublie jamais qui a dit quoi à qui en 2019.' },
  { difficulty: 'easy', answer: 'ISFJ', text: 'Dit oui à tout le monde et passe ses week-ends épuisé.' },
  { difficulty: 'medium', answer: 'ISFJ', text: 'Met les besoins des autres avant les siens, puis se vexe sans le dire.' },
  { difficulty: 'medium', answer: 'ISFJ', text: 'Conserve les souvenirs et les traditions familiales comme un trésor.' },
  { difficulty: 'medium', answer: 'ISFJ', text: 'Réagit mal au changement abrupt — surtout quand il n\'a pas été consulté.' },
  { difficulty: 'hard', answer: 'ISFJ', text: 'Sa fidélité s\'exprime dans 1000 petits gestes que tu ne remarqueras pas.' },
  { difficulty: 'hard', answer: 'ISFJ', text: 'Discret, modeste, profondément attaché aux gens qu\'il a choisis comme proches.' },
  { difficulty: 'hard', answer: 'ISFJ', text: 'Sa douceur cache un sens du devoir presque sacrificiel.' },

  // ───── ESTJ ─────
  { difficulty: 'easy', answer: 'ESTJ', text: 'Te dit « ce n\'est pas une opinion, c\'est un fait » alors que c\'est son opinion.' },
  { difficulty: 'easy', answer: 'ESTJ', text: 'Organise le frigo de la coloc selon une logique non négociable.' },
  { difficulty: 'easy', answer: 'ESTJ', text: 'Considère le retard comme une faute morale.' },
  { difficulty: 'medium', answer: 'ESTJ', text: 'Prend les commandes en réunion sans qu\'on le lui demande, et tient les délais.' },
  { difficulty: 'medium', answer: 'ESTJ', text: 'Préfère une décision rapide imparfaite à une réflexion éternelle parfaite.' },
  { difficulty: 'medium', answer: 'ESTJ', text: 'Confond parfois autorité et écoute — mais se corrige rarement.' },
  { difficulty: 'hard', answer: 'ESTJ', text: 'Pour lui, les valeurs sociales (respect, ponctualité, parole donnée) ne se négocient pas.' },
  { difficulty: 'hard', answer: 'ESTJ', text: 'Sa rigueur est un acte de loyauté envers le groupe, pas une obsession personnelle.' },
  { difficulty: 'hard', answer: 'ESTJ', text: 'Capable de chaleur authentique, mais seulement après avoir établi le cadre.' },

  // ───── ESFJ ─────
  { difficulty: 'easy', answer: 'ESFJ', text: 'Connaît le prénom du chien de tes parents.' },
  { difficulty: 'easy', answer: 'ESFJ', text: 'Vexé pendant 3 jours si tu n\'as pas remarqué qu\'il s\'est coupé les cheveux.' },
  { difficulty: 'easy', answer: 'ESFJ', text: 'Maintient un Google Calendar partagé pour les anniversaires de ses 47 amis.' },
  { difficulty: 'medium', answer: 'ESFJ', text: 'S\'investit à fond dans le groupe, et attend implicitement qu\'on le lui rende.' },
  { difficulty: 'medium', answer: 'ESFJ', text: 'Ressent profondément les humeurs collectives — en bien comme en mal.' },
  { difficulty: 'medium', answer: 'ESFJ', text: 'A une mémoire affective d\'éléphant : oublie rarement un geste, ni une vacherie.' },
  { difficulty: 'hard', answer: 'ESFJ', text: 'Tient le groupe à bout de bras et culpabilise quand quelqu\'un est exclu.' },
  { difficulty: 'hard', answer: 'ESFJ', text: 'Sa générosité est sincère mais s\'attend à une réciprocité qu\'il ne formulera jamais.' },
  { difficulty: 'hard', answer: 'ESFJ', text: 'Sa loyauté envers les traditions familiales et amicales est presque un trait identitaire.' },

  // ───── ISTP ─────
  { difficulty: 'easy', answer: 'ISTP', text: 'Démonte un appareil pour comprendre, puis ne le remonte pas.' },
  { difficulty: 'easy', answer: 'ISTP', text: 'Répond aux questions par « ça dépend » et part.' },
  { difficulty: 'easy', answer: 'ISTP', text: 'Calme à l\'extérieur, fait des sports extrêmes le week-end.' },
  { difficulty: 'medium', answer: 'ISTP', text: 'Capable de rester silencieux pendant 4 heures sans que ce soit lourd.' },
  { difficulty: 'medium', answer: 'ISTP', text: 'Préfère résoudre un problème mécanique plutôt qu\'un problème relationnel.' },
  { difficulty: 'medium', answer: 'ISTP', text: 'Apprend par expérimentation directe, jamais par cours théorique.' },
  { difficulty: 'hard', answer: 'ISTP', text: 'Indépendance non négociable : déteste qu\'on lui dicte une méthode.' },
  { difficulty: 'hard', answer: 'ISTP', text: 'Sa froideur apparente n\'est pas un masque : il pense vraiment qu\'on en fait trop.' },
  { difficulty: 'hard', answer: 'ISTP', text: 'Réagit aux émotions intenses des autres en disparaissant momentanément.' },

  // ───── ISFP ─────
  { difficulty: 'easy', answer: 'ISFP', text: 'Disparaît une après-midi pour peindre dans un parc sans prévenir personne.' },
  { difficulty: 'easy', answer: 'ISFP', text: 'Refuse de défendre son opinion en réunion mais l\'écrit dans son journal le soir.' },
  { difficulty: 'easy', answer: 'ISFP', text: 'S\'habille comme personne d\'autre et fait semblant de ne pas y avoir pensé.' },
  { difficulty: 'medium', answer: 'ISFP', text: 'Se fâche rarement, mais s\'éloigne définitivement quand on a dépassé une ligne.' },
  { difficulty: 'medium', answer: 'ISFP', text: 'Vit ses valeurs en silence — déteste qu\'on cherche à les théoriser.' },
  { difficulty: 'medium', answer: 'ISFP', text: 'Sa sensibilité esthétique imprègne tout : la déco, les vêtements, la nourriture.' },
  { difficulty: 'hard', answer: 'ISFP', text: 'Capable d\'une douceur enveloppante puis d\'un retrait soudain, sans explication.' },
  { difficulty: 'hard', answer: 'ISFP', text: 'Refuse les conventions sociales par instinct, pas par rébellion.' },
  { difficulty: 'hard', answer: 'ISFP', text: 'Ses émotions s\'expriment par le geste, le regard, la création — rarement par les mots.' },

  // ───── ESTP ─────
  { difficulty: 'easy', answer: 'ESTP', text: 'Prend la décision avant que tu n\'aies fini d\'expliquer le problème.' },
  { difficulty: 'easy', answer: 'ESTP', text: 'Refuse les plans à plus de 3 jours.' },
  { difficulty: 'easy', answer: 'ESTP', text: 'Adrénaline ou ennui, pas d\'entre-deux.' },
  { difficulty: 'medium', answer: 'ESTP', text: 'Lit la pièce en une seconde et adapte son comportement instantanément.' },
  { difficulty: 'medium', answer: 'ESTP', text: 'Réagit à l\'urgence mieux que personne, s\'ennuie dans le quotidien.' },
  { difficulty: 'medium', answer: 'ESTP', text: 'Considère les règles comme des suggestions à tester par l\'expérience.' },
  { difficulty: 'hard', answer: 'ESTP', text: 'Charme et action priment sur la réflexion abstraite, qu\'il considère comme un luxe.' },
  { difficulty: 'hard', answer: 'ESTP', text: 'Sa loyauté se manifeste dans la crise, pas dans le confort du quotidien.' },
  { difficulty: 'hard', answer: 'ESTP', text: 'Capable de lire les intentions des gens en quelques secondes — et d\'en jouer si besoin.' },

  // ───── ESFP ─────
  { difficulty: 'easy', answer: 'ESFP', text: 'Transforme une queue à la boulangerie en moment social.' },
  { difficulty: 'easy', answer: 'ESFP', text: 'Achète le truc d\'abord, regarde le prix après.' },
  { difficulty: 'easy', answer: 'ESFP', text: 'Refuse de « faire des plans », mais dit oui à tout sur le moment.' },
  { difficulty: 'medium', answer: 'ESFP', text: 'Remplit l\'espace avec son énergie ; quand il part, le silence pèse.' },
  { difficulty: 'medium', answer: 'ESFP', text: 'Vit dans le présent au point d\'oublier les conséquences à moyen terme.' },
  { difficulty: 'medium', answer: 'ESFP', text: 'Préfère mille fois être avec les gens qu\'avec ses propres pensées.' },
  { difficulty: 'hard', answer: 'ESFP', text: 'Sa joie de vivre est sincère, mais cache une gestion délicate des émotions difficiles.' },
  { difficulty: 'hard', answer: 'ESFP', text: 'Apprend en faisant, déteste théoriser, capte les émotions des autres mieux que les siennes.' },
  { difficulty: 'hard', answer: 'ESFP', text: 'Sa générosité est immédiate et concrète : il offrira plus volontiers son temps que des conseils.' },
];
