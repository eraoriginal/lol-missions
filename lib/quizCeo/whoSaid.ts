/**
 * Catalogue de citations pour la question Quiz CEO `who-said`.
 *
 *   - `quote`  : citation en français (VF officielle ou phrase originale FR)
 *   - `author` : auteur canonique
 *
 * **Toutes en difficulté `easy` mais surcôtées à `points: 2`** (override
 * du seed) — citations ultra-connues : Gladiator, films cultes, politiques
 * iconiques, comiques majeurs, sportifs/célébrités débiles.
 */

export interface WhoSaidEntry {
  quote: string;
  author: string;
}

export const WHO_SAID: WhoSaidEntry[] = [
  // ============ GLADIATOR (5) ============
  { quote: 'Êtes-vous donc satisfaits ? N\'est-ce pas pour cela que vous êtes venus ?', author: 'Maximus (Gladiator)' },
  { quote: 'Je m\'appelle Maximus Decimus Meridius, général des armées du Nord, fidèle serviteur du véritable empereur Marc Aurèle. Père d\'un fils assassiné, mari d\'une épouse assassinée. Et j\'aurai ma vengeance, dans cette vie ou dans l\'autre.', author: 'Maximus (Gladiator)' },
  { quote: 'Force et honneur !', author: 'Maximus (Gladiator)' },
  { quote: 'Ce que nous faisons dans la vie résonne dans l\'éternité.', author: 'Maximus (Gladiator)' },
  { quote: 'À mon signal, déchaînez l\'enfer.', author: 'Maximus (Gladiator)' },

  // ============ FILMS SUPER MÉGA CONNUS ============
  { quote: 'Je suis ton père.', author: 'Dark Vador (Star Wars)' },
  { quote: 'Que la Force soit avec toi.', author: 'Star Wars' },
  { quote: 'C\'est un piège !', author: 'Amiral Ackbar (Star Wars)' },
  { quote: 'Je suis le roi du monde !', author: 'Jack (Titanic)' },
  { quote: 'Mon précieux.', author: 'Gollum (Le Seigneur des Anneaux)' },
  { quote: 'Hakuna Matata.', author: 'Timon et Pumbaa (Le Roi Lion)' },
  { quote: 'Vers l\'infini et au-delà !', author: 'Buzz l\'Éclair (Toy Story)' },
  { quote: 'Libérée, délivrée.', author: 'Elsa (La Reine des Neiges)' },
  { quote: 'E.T. téléphone maison.', author: 'E.T.' },
  { quote: 'Cours, Forrest, cours !', author: 'Forrest Gump' },
  { quote: 'La vie, c\'est comme une boîte de chocolats.', author: 'Forrest Gump' },
  { quote: 'Je reviendrai.', author: 'Terminator' },
  { quote: 'Hasta la vista, baby.', author: 'Terminator 2' },
  { quote: 'Houston, on a un problème.', author: 'Apollo 13' },
  { quote: 'Bond. James Bond.', author: 'James Bond' },
  { quote: 'Je vais lui faire une offre qu\'il ne pourra pas refuser.', author: 'Vito Corleone (Le Parrain)' },
  { quote: 'Mais ils sont fous, ces Romains !', author: 'Obélix (Astérix)' },
  { quote: 'C\'est cela, oui.', author: 'Thérèse (Le père Noël est une ordure)' },
  { quote: 'Un cendrier ! Un cendrier !', author: 'Pierre Mortez (Le père Noël est une ordure)' },
  { quote: 'Il s\'appelle Juste Leblanc.', author: 'François Pignon (Le Dîner de cons)' },
  { quote: 'Toujours nada ? — Toujours nada.', author: 'Le Dîner de cons' },
  { quote: 'Les cons, ça ose tout, c\'est même à ça qu\'on les reconnaît.', author: 'Bernard Blier (Les Tontons flingueurs)' },
  { quote: 'Touche pas au grisbi !', author: 'Touchez pas au grisbi' },
  { quote: 'Bonjour, je m\'appelle Hubert Bonisseur de La Bath.', author: 'OSS 117' },
  { quote: 'Je casse !', author: 'Brice de Nice' },
  { quote: 'Cassé.', author: 'Brice de Nice' },
  { quote: 'Sur un malentendu, ça peut marcher.', author: 'Jean-Claude Dusse (Les Bronzés font du ski)' },
  { quote: 'Quand te reverrai-je, pays merveilleux ?', author: 'Jean-Claude Dusse (Les Bronzés font du ski)' },
  { quote: 'Mais oui, c\'est bien sûr !', author: 'Inspecteur Bourrel (Les Cinq Dernières Minutes)' },
  { quote: 'Et la marmotte, elle met le chocolat dans le papier d\'alu.', author: 'Publicité Milka' },

  // ============ POLITIQUES ICONIQUES ============
  { quote: 'Je vous ai compris !', author: 'Charles de Gaulle' },
  { quote: 'Vive le Québec libre !', author: 'Charles de Gaulle' },
  { quote: 'Vaste programme !', author: 'Charles de Gaulle' },
  { quote: 'Casse-toi pauvre con !', author: 'Nicolas Sarkozy' },
  { quote: 'Travailler plus pour gagner plus.', author: 'Nicolas Sarkozy' },
  { quote: 'Abracadabrantesque.', author: 'Jacques Chirac' },
  { quote: 'Mangez des pommes !', author: 'Jacques Chirac (par les Guignols)' },
  { quote: 'Mon ennemi, c\'est la finance.', author: 'François Hollande' },
  { quote: 'Moi président de la République.', author: 'François Hollande' },
  { quote: 'Je n\'ai qu\'à traverser la rue pour trouver un travail.', author: 'Emmanuel Macron' },
  { quote: 'Yes, we can.', author: 'Barack Obama' },
  { quote: 'Make America Great Again.', author: 'Donald Trump' },
  { quote: 'I have a dream.', author: 'Martin Luther King' },
  { quote: 'L\'État, c\'est moi.', author: 'Louis XIV' },
  { quote: 'Je pense, donc je suis.', author: 'René Descartes' },
  { quote: 'Veni, vidi, vici.', author: 'Jules César' },
  { quote: 'Du sang, du labeur, des larmes et de la sueur.', author: 'Winston Churchill' },
  { quote: 'C\'est un petit pas pour l\'homme, un grand bond pour l\'humanité.', author: 'Neil Armstrong' },

  // ============ COMIQUES TRÈS CONNUS EN FRANCE ============
  { quote: 'C\'est l\'histoire d\'un mec qui rentre dans un café.', author: 'Coluche' },
  { quote: 'Quand on est riche, on est pauvre, et quand on est pauvre, c\'est pire.', author: 'Coluche' },
  { quote: 'Je dis pas ça, je dis rien.', author: 'Coluche' },
  { quote: 'Étonnant, non ?', author: 'Pierre Desproges' },
  { quote: 'On peut rire de tout, mais pas avec n\'importe qui.', author: 'Pierre Desproges' },
  { quote: 'Étonnez-moi Benoît !', author: 'Pierre Bénichou' },
  { quote: 'C\'est pas faux !', author: 'Perceval (Kaamelott)' },
  { quote: 'C\'est pas dans le règlement.', author: 'Léodagan (Kaamelott)' },
  { quote: 'C\'est sûr, on n\'est pas à l\'abri d\'un coup de chance.', author: 'Karadoc (Kaamelott)' },
  { quote: 'Le gras, c\'est la vie.', author: 'Karadoc (Kaamelott)' },
  { quote: 'Hein papa ?', author: 'Gad Elmaleh' },
  { quote: 'Faites de beaux rêves.', author: 'Florence Foresti (Mère Fille)' },
  { quote: 'Bah ouais, mais bon.', author: 'Élie Semoun' },
  { quote: 'Bienvenue chez les Ch\'tis.', author: 'Dany Boon' },
  { quote: 'Bonjour, j\'ai pas vot\' boulot.', author: 'Franck Dubosc (Camping)' },
  { quote: 'Y a pas marqué La Poste !', author: 'Jean Yanne' },
  { quote: 'Tournez les serviettes !', author: 'Patrick Sébastien' },

  // ============ SPORTIFS / GAFFES CÉLÈBRES ============
  { quote: 'Quand les mouettes suivent un chalutier, c\'est qu\'elles pensent que des sardines vont être jetées à la mer.', author: 'Éric Cantona' },
  { quote: 'Le Brésil, c\'est le Brésil.', author: 'Raymond Domenech' },
  { quote: 'Pour gagner, il faut marquer plus de buts que l\'adversaire.', author: 'Roger Lemerre' },
  { quote: 'Le football, c\'est simple : 22 joueurs courent après un ballon, et à la fin c\'est l\'Allemagne qui gagne.', author: 'Gary Lineker' },
  { quote: 'Tout le monde a un plan jusqu\'à ce qu\'il prenne un coup dans la figure.', author: 'Mike Tyson' },
  { quote: 'Je suis comme un crocodile, je m\'agite mais je ne bouge pas.', author: 'Raymond Domenech' },
  { quote: 'Premièrement, on va gagner. Deuxièmement, on va gagner. Et troisièmement, on va gagner.', author: 'Aimé Jacquet' },
  { quote: 'Si Cristiano Ronaldo gagne le Ballon d\'Or, je quitte le foot.', author: 'Karim Benzema' },
  { quote: 'Je ne suis pas un homme, je suis Cantona.', author: 'Éric Cantona' },
  { quote: 'Je vais rester ici parce que c\'est ici que je suis bien.', author: 'Sébastien Loeb' },

  // ============ TÉLÉ-RÉALITÉ / CÉLÉBRITÉS DÉBILES ============
  { quote: 'Allô non mais allô quoi ! Tu es une fille tu n\'as pas de shampoing ! C\'est comme si je te disais tu es une fille tu n\'as pas de cheveux !', author: 'Nabilla' },
  { quote: 'C\'est qui le boss ?', author: 'Loana (Loft Story)' },
  { quote: 'Je suis bogoss.', author: 'Mickaël Vendetta' },
  { quote: 'Dur dur d\'être bébé !', author: 'Jordy' },
  { quote: 'C\'est mon choix !', author: 'Évelyne Thomas' },
  { quote: 'Baba !', author: 'Public de Cyril Hanouna (TPMP)' },
  { quote: 'On va être les boss !', author: 'Cyril Hanouna' },
  { quote: 'Quel travail !', author: 'Jean-Pierre Foucault' },
  { quote: 'Et au fond... à droite !', author: 'Patrice Laffont (Pyramide)' },
  { quote: 'C\'est ton destin.', author: 'Pierre Mortez (Le père Noël est une ordure)' },
  { quote: 'Tu vois ce que je veux dire ?', author: 'Mister You' },
  { quote: 'Je vais te casser les jambes !', author: 'Joey Starr' },

  // ============ AUTRES PHRASES MÉGA CONNUES ============
  { quote: 'Eurêka !', author: 'Archimède' },
  { quote: 'E = mc².', author: 'Albert Einstein' },
  { quote: 'L\'enfer, c\'est les autres.', author: 'Jean-Paul Sartre' },
  { quote: 'On ne voit bien qu\'avec le cœur. L\'essentiel est invisible pour les yeux.', author: 'Antoine de Saint-Exupéry' },
  { quote: 'Être ou ne pas être, telle est la question.', author: 'Hamlet (Shakespeare)' },
  { quote: 'Je suis Iron Man.', author: 'Tony Stark (Avengers)' },
  { quote: 'Je suis Groot.', author: 'Groot (Les Gardiens de la Galaxie)' },
  { quote: 'Tu es un sorcier, Harry.', author: 'Hagrid (Harry Potter)' },
  { quote: 'L\'hiver vient.', author: 'Ned Stark (Game of Thrones)' },
  { quote: 'D\'oh !', author: 'Homer Simpson' },
  { quote: 'Comment ça va ?', author: 'Joey (Friends)' },
  { quote: 'C\'est moi, Mario !', author: 'Mario (Nintendo)' },
];
