import 'server-only';

/**
 * Entrées « wiki-like » pour WikiEra — **server-only**.
 * Chaque entrée est un court texte descriptif anonyme — le joueur devine le
 * sujet. Le `text` est exposé au client via `GET /today`, mais `topic` +
 * `aliases` (= la solution) ne quittent jamais le serveur.
 *
 * `import 'server-only'` empêche tout bundle client.
 */

export interface WikiEraEntry {
  id: string;
  topic: string;
  aliases: string[];
  text: string;
}

export const WIKIERA_ENTRIES: WikiEraEntry[] = [
  {
    id: 'napoleon',
    topic: 'Napoléon Bonaparte',
    aliases: ['Napoléon', 'Napoleon', 'Bonaparte', 'Napoléon 1er', 'Napoleon I'],
    text: `Général corse devenu empereur des Français au début du XIXe siècle. Connu pour une série de campagnes militaires d'une ampleur sans précédent, pour la codification juridique qui porte son nom, et pour une fin de règne en exil sur une île de l'Atlantique Sud.`,
  },
  {
    id: 'eiffel',
    topic: 'La Tour Eiffel',
    aliases: ['Tour Eiffel', 'Eiffel', 'Tour d\'Eiffel'],
    text: `Édifice métallique parisien inauguré en 1889 pour une exposition universelle, haut d'environ 330 mètres. Prévue pour être démontée au bout de 20 ans, elle est devenue le monument payant le plus visité au monde.`,
  },
  {
    id: 'einstein',
    topic: 'Albert Einstein',
    aliases: ['Einstein'],
    text: `Physicien né en Allemagne à la fin du XIXe siècle, naturalisé suisse puis américain. Il a formulé la théorie de la relativité restreinte puis générale, a reçu un prix Nobel pour son travail sur l'effet photoélectrique, et est resté célèbre pour son apparence et une célèbre équation à trois symboles.`,
  },
  {
    id: 'amazonie',
    topic: 'Forêt amazonienne',
    aliases: ['Amazonie', 'Forêt d\'Amazonie', 'Amazon Rainforest'],
    text: `Immense forêt tropicale humide d'Amérique du Sud, s'étendant principalement sur un grand pays lusophone. Elle abrite une fraction majeure de la biodiversité mondiale et agit comme un puits de carbone critique.`,
  },
  {
    id: 'muraille',
    topic: 'Grande Muraille de Chine',
    aliases: ['Grande Muraille', 'Muraille de Chine', 'Great Wall'],
    text: `Ensemble de fortifications construit sur plus de deux millénaires le long de la frontière nord d'un empire asiatique. Longue de plusieurs milliers de kilomètres, visible de loin mais contrairement à une croyance tenace, pas depuis l'orbite basse à l'œil nu.`,
  },
  {
    id: 'internet',
    topic: 'Internet',
    aliases: ['internet', 'Réseau Internet', 'Web'],
    text: `Réseau mondial interconnectant des milliards d'appareils via le protocole TCP/IP. Né d'un projet militaire américain dans les années 1960, il s'est ouvert au grand public à partir des années 1990 et supporte aujourd'hui le Web, l'e-mail, le streaming et la quasi-totalité de la communication numérique.`,
  },
  {
    id: 'shakespeare',
    topic: 'William Shakespeare',
    aliases: ['Shakespeare'],
    text: `Dramaturge et poète anglais de la Renaissance, né à Stratford-upon-Avon. Auteur d'une trentaine de pièces — tragédies, comédies, pièces historiques — dont plusieurs sont considérées comme des sommets de la littérature mondiale.`,
  },
  {
    id: 'vinci',
    topic: 'Léonard de Vinci',
    aliases: ['Leonardo da Vinci', 'Vinci', 'Leonard de Vinci', 'de Vinci'],
    text: `Peintre, ingénieur et inventeur italien de la Renaissance. Auteur d'un célèbre portrait féminin au sourire énigmatique exposé au Louvre, et de carnets remplis d'études anatomiques et de machines en avance sur leur époque.`,
  },
  {
    id: 'python',
    topic: 'Python',
    aliases: ['Python (langage)', 'langage Python'],
    text: `Langage de programmation interprété créé au début des années 1990 par un néerlandais. Réputé pour sa syntaxe lisible basée sur l'indentation, il domine aujourd'hui les domaines du machine learning, de la science des données et du scripting système.`,
  },
  {
    id: 'pyramide',
    topic: 'Pyramides de Gizeh',
    aliases: ['Gizeh', 'Pyramides', 'Grande Pyramide', 'Pyramide de Khéops'],
    text: `Complexe funéraire construit il y a environ 4500 ans sur un plateau rocheux proche du Caire. Il comprend trois pyramides majeures, la plus grande ayant longtemps été la construction la plus haute du monde.`,
  },
  {
    id: 'titanic',
    topic: 'Titanic',
    aliases: ['RMS Titanic', 'Le Titanic'],
    text: `Paquebot transatlantique britannique qui a coulé en 1912 lors de son voyage inaugural après avoir heurté un iceberg dans l'Atlantique Nord. Son naufrage a fait plus de 1500 victimes et a inspiré d'innombrables livres et films.`,
  },
  {
    id: 'lune',
    topic: 'La Lune',
    aliases: ['Lune', 'Moon'],
    text: `Satellite naturel de la Terre, situé à environ 384 000 km. Sa gravité modeste provoque les marées, sa face cachée n'est jamais visible depuis notre planète, et un homme y a marché pour la première fois en juillet 1969.`,
  },
  {
    id: 'francais',
    topic: 'Le Louvre',
    aliases: ['Louvre', 'Musée du Louvre'],
    text: `Ancien palais royal parisien transformé en musée à la fin du XVIIIe siècle. Il abrite l'un des plus grands patrimoines artistiques mondiaux, de la statue grecque de la Vénus de Milo à la peinture de la Joconde, et se reconnaît à sa pyramide de verre inaugurée en 1989.`,
  },
  {
    id: 'mozart',
    topic: 'Wolfgang Amadeus Mozart',
    aliases: ['Mozart'],
    text: `Compositeur autrichien du XVIIIe siècle, enfant prodige qui a laissé plus de 600 œuvres avant sa mort à 35 ans. Auteur d'opéras, de symphonies et d'un requiem inachevé.`,
  },
  {
    id: 'everest',
    topic: 'Mont Everest',
    aliases: ['Everest', 'Mount Everest'],
    text: `Sommet le plus haut de la planète, culminant à environ 8849 mètres dans la chaîne de l'Himalaya, à la frontière entre le Népal et la Chine. Son ascension, réalisée pour la première fois en 1953, reste chaque année le théâtre d'expéditions coûteuses et parfois fatales.`,
  },
];

/** Match un input utilisateur contre l'entrée (nom + aliases, insensible
 *  à la casse et aux accents). */
export function matchesWikiera(input: string, e: WikiEraEntry): boolean {
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const target = norm(input);
  if (!target) return false;
  if (norm(e.topic) === target) return true;
  return e.aliases.some((a) => norm(a) === target);
}
