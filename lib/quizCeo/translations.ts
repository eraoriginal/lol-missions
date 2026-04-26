/**
 * Catalogue de phrases à traduire pour la question Quiz CEO `translation`.
 *
 * Structure : 12 langues × 3 difficultés × 10 phrases = 360 entrées.
 *   - `text`    : phrase dans la langue source
 *   - `answer`  : traduction française canonique
 *   - `aliases` : variantes acceptées (synonymes, sans ponctuation finale…)
 *
 * Source de vérité runtime = la DB. Ce fichier sert au seed initial et aux
 * ajouts en masse. Pour corriger une traduction en prod : UPDATE direct en DB.
 */

export interface TranslationEntry {
  text: string;
  answer: string;
  aliases?: string[];
}

export interface TranslationLanguageEntries {
  easy: TranslationEntry[];
  medium: TranslationEntry[];
  hard: TranslationEntry[];
}

/**
 * Forme adjective de la langue, pour construire le prompt
 * « Traduis cette phrase <forme> en français. »
 */
export const LANGUAGE_LABEL: Record<string, string> = {
  anglais: 'anglaise',
  espagnol: 'espagnole',
  portugais: 'portugaise',
  allemand: 'allemande',
  italien: 'italienne',
  néerlandais: 'néerlandaise',
  norvégien: 'norvégienne',
  polonais: 'polonaise',
  danois: 'danoise',
  suédois: 'suédoise',
  croate: 'croate',
  roumain: 'roumaine',
};

export const TRANSLATIONS: Record<string, TranslationLanguageEntries> = {
  // ============ ANGLAIS ============
  anglais: {
    easy: [
      { text: 'Hello, how are you?', answer: 'Bonjour, comment vas-tu ?', aliases: ['Bonjour, comment ça va ?', 'Salut, comment vas-tu ?'] },
      { text: 'I am tired.', answer: 'Je suis fatigué.', aliases: ['Je suis fatiguée.'] },
      { text: 'What time is it?', answer: 'Quelle heure est-il ?' },
      { text: 'Where is the bathroom?', answer: 'Où sont les toilettes ?', aliases: ['Où est la salle de bain ?'] },
      { text: 'I love you.', answer: 'Je t\'aime.' },
      { text: 'Thank you very much.', answer: 'Merci beaucoup.' },
      { text: 'I don\'t understand.', answer: 'Je ne comprends pas.' },
      { text: 'How much does it cost?', answer: 'Combien ça coûte ?', aliases: ['Combien cela coûte ?'] },
      { text: 'I\'m hungry.', answer: 'J\'ai faim.' },
      { text: 'See you tomorrow.', answer: 'À demain.' },
    ],
    medium: [
      { text: 'I would like a glass of water, please.', answer: 'Je voudrais un verre d\'eau, s\'il te plaît.', aliases: ['Je voudrais un verre d\'eau, s\'il vous plaît.'] },
      { text: 'She has been waiting for two hours.', answer: 'Elle attend depuis deux heures.' },
      { text: 'We should leave before it rains.', answer: 'Nous devrions partir avant qu\'il pleuve.', aliases: ['On devrait partir avant qu\'il pleuve.'] },
      { text: 'He is the tallest in the class.', answer: 'Il est le plus grand de la classe.' },
      { text: 'Do you know what time the train arrives?', answer: 'Sais-tu à quelle heure arrive le train ?' },
      { text: 'I have never been to Spain.', answer: 'Je ne suis jamais allé en Espagne.' },
      { text: 'The book that I read was interesting.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'If I had known, I would have come.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'She made me laugh.', answer: 'Elle m\'a fait rire.' },
      { text: 'Don\'t forget to call me back.', answer: 'N\'oublie pas de me rappeler.' },
    ],
    hard: [
      { text: 'It\'s raining cats and dogs.', answer: 'Il pleut des cordes.', aliases: ['Il pleut à verse.'] },
      { text: 'Don\'t put all your eggs in one basket.', answer: 'Ne mets pas tous tes œufs dans le même panier.' },
      { text: 'Better safe than sorry.', answer: 'Mieux vaut prévenir que guérir.' },
      { text: 'Once in a blue moon.', answer: 'Tous les trente-six du mois.' },
      { text: 'It\'s a piece of cake.', answer: 'C\'est du gâteau.' },
      { text: 'The early bird catches the worm.', answer: 'L\'avenir appartient à ceux qui se lèvent tôt.' },
      { text: 'Don\'t beat around the bush.', answer: 'Ne tourne pas autour du pot.' },
      { text: 'Bite off more than you can chew.', answer: 'Avoir les yeux plus gros que le ventre.' },
      { text: 'Out of the frying pan into the fire.', answer: 'Tomber de Charybde en Scylla.' },
      { text: 'Speak of the devil.', answer: 'Quand on parle du loup.' },
    ],
  },

  // ============ ESPAGNOL ============
  espagnol: {
    easy: [
      { text: 'Hola, ¿cómo estás?', answer: 'Bonjour, comment vas-tu ?', aliases: ['Salut, comment vas-tu ?'] },
      { text: 'Tengo hambre.', answer: 'J\'ai faim.' },
      { text: '¿Qué hora es?', answer: 'Quelle heure est-il ?' },
      { text: 'Te quiero.', answer: 'Je t\'aime.' },
      { text: 'Buenos días.', answer: 'Bonjour.' },
      { text: 'Hasta mañana.', answer: 'À demain.' },
      { text: 'Muchas gracias.', answer: 'Merci beaucoup.' },
      { text: 'No entiendo.', answer: 'Je ne comprends pas.' },
      { text: '¿Cuánto cuesta?', answer: 'Combien ça coûte ?' },
      { text: 'Estoy cansado.', answer: 'Je suis fatigué.' },
    ],
    medium: [
      { text: 'Me gustaría un café, por favor.', answer: 'Je voudrais un café, s\'il te plaît.' },
      { text: 'Hace dos horas que espero.', answer: 'J\'attends depuis deux heures.' },
      { text: 'Deberíamos irnos antes de que llueva.', answer: 'Nous devrions partir avant qu\'il pleuve.' },
      { text: 'Es el más alto de la clase.', answer: 'Il est le plus grand de la classe.' },
      { text: '¿Sabes a qué hora llega el tren?', answer: 'Sais-tu à quelle heure arrive le train ?' },
      { text: 'Nunca he ido a Francia.', answer: 'Je ne suis jamais allé en France.' },
      { text: 'El libro que leí era interesante.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'Si lo hubiera sabido, habría venido.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'Me hizo reír.', answer: 'Elle m\'a fait rire.', aliases: ['Il m\'a fait rire.'] },
      { text: 'No olvides llamarme.', answer: 'N\'oublie pas de m\'appeler.' },
    ],
    hard: [
      { text: 'No hay mal que por bien no venga.', answer: 'À quelque chose malheur est bon.' },
      { text: 'En boca cerrada no entran moscas.', answer: 'La parole est d\'argent, le silence est d\'or.' },
      { text: 'Más vale tarde que nunca.', answer: 'Mieux vaut tard que jamais.' },
      { text: 'Dios los cría y ellos se juntan.', answer: 'Qui se ressemble s\'assemble.' },
      { text: 'Aunque la mona se vista de seda, mona se queda.', answer: 'L\'habit ne fait pas le moine.' },
      { text: 'A caballo regalado no le mires el diente.', answer: 'À cheval donné, on ne regarde pas les dents.' },
      { text: 'Echar leña al fuego.', answer: 'Jeter de l\'huile sur le feu.' },
      { text: 'Estar en las nubes.', answer: 'Avoir la tête dans les nuages.' },
      { text: 'Tomar el pelo a alguien.', answer: 'Se moquer de quelqu\'un.', aliases: ['Faire marcher quelqu\'un.'] },
      { text: 'No todo lo que brilla es oro.', answer: 'Tout ce qui brille n\'est pas or.' },
    ],
  },

  // ============ PORTUGAIS ============
  portugais: {
    easy: [
      { text: 'Olá, como estás?', answer: 'Bonjour, comment vas-tu ?', aliases: ['Salut, comment vas-tu ?'] },
      { text: 'Tenho fome.', answer: 'J\'ai faim.' },
      { text: 'Que horas são?', answer: 'Quelle heure est-il ?' },
      { text: 'Eu te amo.', answer: 'Je t\'aime.' },
      { text: 'Bom dia.', answer: 'Bonjour.' },
      { text: 'Até amanhã.', answer: 'À demain.' },
      { text: 'Muito obrigado.', answer: 'Merci beaucoup.' },
      { text: 'Não entendo.', answer: 'Je ne comprends pas.' },
      { text: 'Quanto custa?', answer: 'Combien ça coûte ?' },
      { text: 'Estou cansado.', answer: 'Je suis fatigué.' },
    ],
    medium: [
      { text: 'Eu queria um café, por favor.', answer: 'Je voudrais un café, s\'il te plaît.' },
      { text: 'Estou esperando há duas horas.', answer: 'J\'attends depuis deux heures.' },
      { text: 'Devíamos sair antes que chova.', answer: 'Nous devrions partir avant qu\'il pleuve.' },
      { text: 'Ele é o mais alto da turma.', answer: 'Il est le plus grand de la classe.' },
      { text: 'Sabes a que horas chega o trem?', answer: 'Sais-tu à quelle heure arrive le train ?' },
      { text: 'Nunca fui à França.', answer: 'Je ne suis jamais allé en France.' },
      { text: 'O livro que li era interessante.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'Se eu soubesse, teria vindo.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'Ela me fez rir.', answer: 'Elle m\'a fait rire.' },
      { text: 'Não esqueças de me ligar.', answer: 'N\'oublie pas de m\'appeler.' },
    ],
    hard: [
      { text: 'Quem não arrisca, não petisca.', answer: 'Qui ne risque rien n\'a rien.' },
      { text: 'Em terra de cego, quem tem um olho é rei.', answer: 'Au royaume des aveugles, les borgnes sont rois.' },
      { text: 'Cão que ladra não morde.', answer: 'Chien qui aboie ne mord pas.' },
      { text: 'De grão em grão a galinha enche o papo.', answer: 'Petit à petit, l\'oiseau fait son nid.' },
      { text: 'Mais vale um pássaro na mão do que dois a voar.', answer: 'Un tiens vaut mieux que deux tu l\'auras.' },
      { text: 'Cada macaco no seu galho.', answer: 'À chacun son métier.' },
      { text: 'Quem com ferro fere, com ferro será ferido.', answer: 'Qui sème le vent récolte la tempête.' },
      { text: 'Não se faz omelete sem quebrar ovos.', answer: 'On ne fait pas d\'omelette sans casser des œufs.' },
      { text: 'Devagar se vai ao longe.', answer: 'Qui veut voyager loin ménage sa monture.' },
      { text: 'A pressa é inimiga da perfeição.', answer: 'Hâte-toi lentement.' },
    ],
  },

  // ============ ALLEMAND ============
  allemand: {
    easy: [
      { text: 'Hallo, wie geht es dir?', answer: 'Bonjour, comment vas-tu ?', aliases: ['Salut, comment vas-tu ?'] },
      { text: 'Ich habe Hunger.', answer: 'J\'ai faim.' },
      { text: 'Wie spät ist es?', answer: 'Quelle heure est-il ?' },
      { text: 'Ich liebe dich.', answer: 'Je t\'aime.' },
      { text: 'Guten Tag.', answer: 'Bonjour.' },
      { text: 'Bis morgen.', answer: 'À demain.' },
      { text: 'Vielen Dank.', answer: 'Merci beaucoup.' },
      { text: 'Ich verstehe nicht.', answer: 'Je ne comprends pas.' },
      { text: 'Wie viel kostet das?', answer: 'Combien ça coûte ?' },
      { text: 'Ich bin müde.', answer: 'Je suis fatigué.' },
    ],
    medium: [
      { text: 'Ich hätte gerne einen Kaffee, bitte.', answer: 'Je voudrais un café, s\'il te plaît.' },
      { text: 'Ich warte seit zwei Stunden.', answer: 'J\'attends depuis deux heures.' },
      { text: 'Wir sollten gehen, bevor es regnet.', answer: 'Nous devrions partir avant qu\'il pleuve.' },
      { text: 'Er ist der Größte in der Klasse.', answer: 'Il est le plus grand de la classe.' },
      { text: 'Weißt du, wann der Zug ankommt?', answer: 'Sais-tu quand le train arrive ?' },
      { text: 'Ich war noch nie in Frankreich.', answer: 'Je ne suis jamais allé en France.' },
      { text: 'Das Buch, das ich gelesen habe, war interessant.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'Wenn ich es gewusst hätte, wäre ich gekommen.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'Sie hat mich zum Lachen gebracht.', answer: 'Elle m\'a fait rire.' },
      { text: 'Vergiss nicht, mich anzurufen.', answer: 'N\'oublie pas de m\'appeler.' },
    ],
    hard: [
      { text: 'Lügen haben kurze Beine.', answer: 'Les mensonges ont les jambes courtes.' },
      { text: 'Der Apfel fällt nicht weit vom Stamm.', answer: 'Tel père, tel fils.' },
      { text: 'Morgenstund hat Gold im Mund.', answer: 'L\'avenir appartient à ceux qui se lèvent tôt.' },
      { text: 'Übung macht den Meister.', answer: 'C\'est en forgeant qu\'on devient forgeron.' },
      { text: 'Wer rastet, der rostet.', answer: 'Qui n\'avance pas recule.' },
      { text: 'Aus den Augen, aus dem Sinn.', answer: 'Loin des yeux, loin du cœur.' },
      { text: 'Wer zuletzt lacht, lacht am besten.', answer: 'Rira bien qui rira le dernier.' },
      { text: 'Es ist nicht alles Gold, was glänzt.', answer: 'Tout ce qui brille n\'est pas or.' },
      { text: 'Reden ist Silber, Schweigen ist Gold.', answer: 'La parole est d\'argent, le silence est d\'or.' },
      { text: 'Viele Köche verderben den Brei.', answer: 'Trop de cuisiniers gâtent la sauce.' },
    ],
  },

  // ============ ITALIEN ============
  italien: {
    easy: [
      { text: 'Ciao, come stai?', answer: 'Salut, comment vas-tu ?', aliases: ['Bonjour, comment vas-tu ?'] },
      { text: 'Ho fame.', answer: 'J\'ai faim.' },
      { text: 'Che ore sono?', answer: 'Quelle heure est-il ?' },
      { text: 'Ti amo.', answer: 'Je t\'aime.' },
      { text: 'Buongiorno.', answer: 'Bonjour.' },
      { text: 'A domani.', answer: 'À demain.' },
      { text: 'Grazie mille.', answer: 'Merci beaucoup.', aliases: ['Mille mercis.'] },
      { text: 'Non capisco.', answer: 'Je ne comprends pas.' },
      { text: 'Quanto costa?', answer: 'Combien ça coûte ?' },
      { text: 'Sono stanco.', answer: 'Je suis fatigué.' },
    ],
    medium: [
      { text: 'Vorrei un caffè, per favore.', answer: 'Je voudrais un café, s\'il te plaît.' },
      { text: 'Aspetto da due ore.', answer: 'J\'attends depuis deux heures.' },
      { text: 'Dovremmo andarcene prima che piova.', answer: 'Nous devrions partir avant qu\'il pleuve.' },
      { text: 'È il più alto della classe.', answer: 'Il est le plus grand de la classe.' },
      { text: 'Sai a che ora arriva il treno?', answer: 'Sais-tu à quelle heure arrive le train ?' },
      { text: 'Non sono mai stato in Francia.', answer: 'Je ne suis jamais allé en France.' },
      { text: 'Il libro che ho letto era interessante.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'Se l\'avessi saputo, sarei venuto.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'Mi ha fatto ridere.', answer: 'Elle m\'a fait rire.', aliases: ['Il m\'a fait rire.'] },
      { text: 'Non dimenticare di chiamarmi.', answer: 'N\'oublie pas de m\'appeler.' },
    ],
    hard: [
      { text: 'Chi dorme non piglia pesci.', answer: 'L\'avenir appartient à ceux qui se lèvent tôt.' },
      { text: 'Fra il dire e il fare c\'è di mezzo il mare.', answer: 'Entre le dire et le faire, il y a la mer.' },
      { text: 'Tra moglie e marito non mettere il dito.', answer: 'Entre l\'arbre et l\'écorce, il ne faut pas mettre le doigt.' },
      { text: 'Meglio tardi che mai.', answer: 'Mieux vaut tard que jamais.' },
      { text: 'Chi va piano, va sano e va lontano.', answer: 'Qui va doucement va sûrement.' },
      { text: 'L\'unione fa la forza.', answer: 'L\'union fait la force.' },
      { text: 'Tutto è bene quel che finisce bene.', answer: 'Tout est bien qui finit bien.' },
      { text: 'Non c\'è due senza tre.', answer: 'Jamais deux sans trois.' },
      { text: 'Tale padre, tale figlio.', answer: 'Tel père, tel fils.' },
      { text: 'Chi cerca trova.', answer: 'Qui cherche trouve.' },
    ],
  },

  // ============ NÉERLANDAIS ============
  néerlandais: {
    easy: [
      { text: 'Hallo, hoe gaat het?', answer: 'Bonjour, comment vas-tu ?', aliases: ['Salut, comment vas-tu ?'] },
      { text: 'Ik heb honger.', answer: 'J\'ai faim.' },
      { text: 'Hoe laat is het?', answer: 'Quelle heure est-il ?' },
      { text: 'Ik hou van je.', answer: 'Je t\'aime.' },
      { text: 'Goedendag.', answer: 'Bonjour.' },
      { text: 'Tot morgen.', answer: 'À demain.' },
      { text: 'Dank je wel.', answer: 'Merci beaucoup.', aliases: ['Merci.'] },
      { text: 'Ik begrijp het niet.', answer: 'Je ne comprends pas.' },
      { text: 'Hoeveel kost het?', answer: 'Combien ça coûte ?' },
      { text: 'Ik ben moe.', answer: 'Je suis fatigué.' },
    ],
    medium: [
      { text: 'Ik wil graag een koffie, alstublieft.', answer: 'Je voudrais un café, s\'il vous plaît.' },
      { text: 'Ik wacht al twee uur.', answer: 'J\'attends depuis deux heures.' },
      { text: 'We zouden moeten vertrekken voordat het regent.', answer: 'Nous devrions partir avant qu\'il pleuve.' },
      { text: 'Hij is de grootste in de klas.', answer: 'Il est le plus grand de la classe.' },
      { text: 'Weet je hoe laat de trein aankomt?', answer: 'Sais-tu à quelle heure arrive le train ?' },
      { text: 'Ik ben nog nooit in Frankrijk geweest.', answer: 'Je ne suis jamais allé en France.' },
      { text: 'Het boek dat ik las, was interessant.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'Als ik het had geweten, was ik gekomen.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'Ze maakte me aan het lachen.', answer: 'Elle m\'a fait rire.' },
      { text: 'Vergeet niet me te bellen.', answer: 'N\'oublie pas de m\'appeler.' },
    ],
    hard: [
      { text: 'Beter laat dan nooit.', answer: 'Mieux vaut tard que jamais.' },
      { text: 'Oost west, thuis best.', answer: 'On n\'est jamais aussi bien que chez soi.' },
      { text: 'Wie het laatst lacht, lacht het best.', answer: 'Rira bien qui rira le dernier.' },
      { text: 'Spreken is zilver, zwijgen is goud.', answer: 'La parole est d\'argent, le silence est d\'or.' },
      { text: 'Geen rook zonder vuur.', answer: 'Il n\'y a pas de fumée sans feu.' },
      { text: 'Een appel valt niet ver van de boom.', answer: 'Tel père, tel fils.' },
      { text: 'Iemand een hart onder de riem steken.', answer: 'Remonter le moral à quelqu\'un.' },
      { text: 'De kat uit de boom kijken.', answer: 'Attendre de voir avant d\'agir.' },
      { text: 'Door de bomen het bos niet meer zien.', answer: 'L\'arbre qui cache la forêt.' },
      { text: 'Zo gewonnen, zo geronnen.', answer: 'Bien mal acquis ne profite jamais.' },
    ],
  },

  // ============ NORVÉGIEN ============
  norvégien: {
    easy: [
      { text: 'Hei, hvordan har du det?', answer: 'Salut, comment vas-tu ?', aliases: ['Bonjour, comment vas-tu ?'] },
      { text: 'Jeg er sulten.', answer: 'J\'ai faim.' },
      { text: 'Hva er klokken?', answer: 'Quelle heure est-il ?' },
      { text: 'Jeg elsker deg.', answer: 'Je t\'aime.' },
      { text: 'God dag.', answer: 'Bonjour.' },
      { text: 'Vi ses i morgen.', answer: 'À demain.' },
      { text: 'Tusen takk.', answer: 'Merci beaucoup.' },
      { text: 'Jeg forstår ikke.', answer: 'Je ne comprends pas.' },
      { text: 'Hvor mye koster det?', answer: 'Combien ça coûte ?' },
      { text: 'Jeg er trøtt.', answer: 'Je suis fatigué.' },
    ],
    medium: [
      { text: 'Jeg vil gjerne ha en kaffe, takk.', answer: 'Je voudrais un café, s\'il te plaît.' },
      { text: 'Jeg har ventet i to timer.', answer: 'J\'attends depuis deux heures.' },
      { text: 'Vi burde dra før det begynner å regne.', answer: 'Nous devrions partir avant qu\'il pleuve.' },
      { text: 'Han er den høyeste i klassen.', answer: 'Il est le plus grand de la classe.' },
      { text: 'Vet du når toget kommer?', answer: 'Sais-tu quand le train arrive ?' },
      { text: 'Jeg har aldri vært i Frankrike.', answer: 'Je ne suis jamais allé en France.' },
      { text: 'Boken jeg leste var interessant.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'Hvis jeg hadde visst, ville jeg ha kommet.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'Hun fikk meg til å le.', answer: 'Elle m\'a fait rire.' },
      { text: 'Ikke glem å ringe meg.', answer: 'N\'oublie pas de m\'appeler.' },
    ],
    hard: [
      { text: 'Bedre sent enn aldri.', answer: 'Mieux vaut tard que jamais.' },
      { text: 'Den som ler sist, ler best.', answer: 'Rira bien qui rira le dernier.' },
      { text: 'Den som gaper over for mye, mister stykket.', answer: 'Qui trop embrasse mal étreint.' },
      { text: 'Tale er sølv, taushet er gull.', answer: 'La parole est d\'argent, le silence est d\'or.' },
      { text: 'Når katten er borte, danser musene på bordet.', answer: 'Quand le chat n\'est pas là, les souris dansent.' },
      { text: 'Eplet faller ikke langt fra stammen.', answer: 'Tel père, tel fils.' },
      { text: 'Ingen røyk uten ild.', answer: 'Il n\'y a pas de fumée sans feu.' },
      { text: 'Den som ingenting våger, ingenting vinner.', answer: 'Qui ne risque rien n\'a rien.' },
      { text: 'Smi mens jernet er varmt.', answer: 'Il faut battre le fer tant qu\'il est chaud.' },
      { text: 'Mange bekker små, gjør en stor å.', answer: 'Petit à petit, l\'oiseau fait son nid.' },
    ],
  },

  // ============ POLONAIS ============
  polonais: {
    easy: [
      { text: 'Cześć, jak się masz?', answer: 'Salut, comment vas-tu ?', aliases: ['Bonjour, comment vas-tu ?'] },
      { text: 'Jestem głodny.', answer: 'J\'ai faim.' },
      { text: 'Która godzina?', answer: 'Quelle heure est-il ?' },
      { text: 'Kocham cię.', answer: 'Je t\'aime.' },
      { text: 'Dzień dobry.', answer: 'Bonjour.' },
      { text: 'Do jutra.', answer: 'À demain.' },
      { text: 'Dziękuję bardzo.', answer: 'Merci beaucoup.' },
      { text: 'Nie rozumiem.', answer: 'Je ne comprends pas.' },
      { text: 'Ile to kosztuje?', answer: 'Combien ça coûte ?' },
      { text: 'Jestem zmęczony.', answer: 'Je suis fatigué.' },
    ],
    medium: [
      { text: 'Chciałbym kawę, proszę.', answer: 'Je voudrais un café, s\'il te plaît.' },
      { text: 'Czekam już od dwóch godzin.', answer: 'J\'attends depuis deux heures.' },
      { text: 'Powinniśmy wyjść, zanim zacznie padać.', answer: 'Nous devrions partir avant qu\'il pleuve.' },
      { text: 'On jest najwyższy w klasie.', answer: 'Il est le plus grand de la classe.' },
      { text: 'Wiesz, o której przyjeżdża pociąg?', answer: 'Sais-tu à quelle heure arrive le train ?' },
      { text: 'Nigdy nie byłem we Francji.', answer: 'Je ne suis jamais allé en France.' },
      { text: 'Książka, którą przeczytałem, była interesująca.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'Gdybym wiedział, przyszedłbym.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'Rozśmieszyła mnie.', answer: 'Elle m\'a fait rire.' },
      { text: 'Nie zapomnij do mnie zadzwonić.', answer: 'N\'oublie pas de m\'appeler.' },
    ],
    hard: [
      { text: 'Lepiej późno niż wcale.', answer: 'Mieux vaut tard que jamais.' },
      { text: 'Każdy kij ma dwa końce.', answer: 'Toute médaille a son revers.' },
      { text: 'Mowa jest srebrem, milczenie złotem.', answer: 'La parole est d\'argent, le silence est d\'or.' },
      { text: 'Dla chcącego nic trudnego.', answer: 'À cœur vaillant, rien d\'impossible.' },
      { text: 'Co dwie głowy, to nie jedna.', answer: 'Deux têtes valent mieux qu\'une.' },
      { text: 'Niedaleko pada jabłko od jabłoni.', answer: 'Tel père, tel fils.' },
      { text: 'Bez pracy nie ma kołaczy.', answer: 'On n\'a rien sans rien.' },
      { text: 'Kto rano wstaje, temu Pan Bóg daje.', answer: 'L\'avenir appartient à ceux qui se lèvent tôt.' },
      { text: 'Apetyt rośnie w miarę jedzenia.', answer: 'L\'appétit vient en mangeant.' },
      { text: 'Nie szata zdobi człowieka.', answer: 'L\'habit ne fait pas le moine.' },
    ],
  },

  // ============ DANOIS ============
  danois: {
    easy: [
      { text: 'Hej, hvordan har du det?', answer: 'Salut, comment vas-tu ?', aliases: ['Bonjour, comment vas-tu ?'] },
      { text: 'Jeg er sulten.', answer: 'J\'ai faim.' },
      { text: 'Hvad er klokken?', answer: 'Quelle heure est-il ?' },
      { text: 'Jeg elsker dig.', answer: 'Je t\'aime.' },
      { text: 'Goddag.', answer: 'Bonjour.' },
      { text: 'Vi ses i morgen.', answer: 'À demain.' },
      { text: 'Mange tak.', answer: 'Merci beaucoup.' },
      { text: 'Jeg forstår det ikke.', answer: 'Je ne comprends pas.' },
      { text: 'Hvor meget koster det?', answer: 'Combien ça coûte ?' },
      { text: 'Jeg er træt.', answer: 'Je suis fatigué.' },
    ],
    medium: [
      { text: 'Jeg vil gerne have en kaffe, tak.', answer: 'Je voudrais un café, s\'il te plaît.' },
      { text: 'Jeg har ventet i to timer.', answer: 'J\'attends depuis deux heures.' },
      { text: 'Vi burde gå, før det begynder at regne.', answer: 'Nous devrions partir avant qu\'il pleuve.' },
      { text: 'Han er den højeste i klassen.', answer: 'Il est le plus grand de la classe.' },
      { text: 'Ved du, hvornår toget ankommer?', answer: 'Sais-tu quand le train arrive ?' },
      { text: 'Jeg har aldrig været i Frankrig.', answer: 'Je ne suis jamais allé en France.' },
      { text: 'Bogen, jeg læste, var interessant.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'Hvis jeg havde vidst det, ville jeg være kommet.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'Hun fik mig til at grine.', answer: 'Elle m\'a fait rire.' },
      { text: 'Glem ikke at ringe til mig.', answer: 'N\'oublie pas de m\'appeler.' },
    ],
    hard: [
      { text: 'Bedre sent end aldrig.', answer: 'Mieux vaut tard que jamais.' },
      { text: 'Æblet falder ikke langt fra stammen.', answer: 'Tel père, tel fils.' },
      { text: 'Den der griner sidst, griner bedst.', answer: 'Rira bien qui rira le dernier.' },
      { text: 'Tale er sølv, tavshed er guld.', answer: 'La parole est d\'argent, le silence est d\'or.' },
      { text: 'Ingen røg uden ild.', answer: 'Il n\'y a pas de fumée sans feu.' },
      { text: 'Mange bække små gør en stor å.', answer: 'Petit à petit, l\'oiseau fait son nid.' },
      { text: 'Det er ikke alt guld, der glimrer.', answer: 'Tout ce qui brille n\'est pas or.' },
      { text: 'Som man råber i skoven, får man svar.', answer: 'On récolte ce que l\'on sème.' },
      { text: 'Nød lærer nøgen kvinde at spinde.', answer: 'Nécessité fait loi.' },
      { text: 'Smede mens jernet er varmt.', answer: 'Il faut battre le fer tant qu\'il est chaud.' },
    ],
  },

  // ============ SUÉDOIS ============
  suédois: {
    easy: [
      { text: 'Hej, hur mår du?', answer: 'Salut, comment vas-tu ?', aliases: ['Bonjour, comment vas-tu ?'] },
      { text: 'Jag är hungrig.', answer: 'J\'ai faim.' },
      { text: 'Vad är klockan?', answer: 'Quelle heure est-il ?' },
      { text: 'Jag älskar dig.', answer: 'Je t\'aime.' },
      { text: 'God dag.', answer: 'Bonjour.' },
      { text: 'Vi ses i morgon.', answer: 'À demain.' },
      { text: 'Tack så mycket.', answer: 'Merci beaucoup.' },
      { text: 'Jag förstår inte.', answer: 'Je ne comprends pas.' },
      { text: 'Hur mycket kostar det?', answer: 'Combien ça coûte ?' },
      { text: 'Jag är trött.', answer: 'Je suis fatigué.' },
    ],
    medium: [
      { text: 'Jag skulle vilja ha en kaffe, tack.', answer: 'Je voudrais un café, s\'il te plaît.' },
      { text: 'Jag har väntat i två timmar.', answer: 'J\'attends depuis deux heures.' },
      { text: 'Vi borde gå innan det börjar regna.', answer: 'Nous devrions partir avant qu\'il pleuve.' },
      { text: 'Han är den längsta i klassen.', answer: 'Il est le plus grand de la classe.' },
      { text: 'Vet du när tåget kommer?', answer: 'Sais-tu quand le train arrive ?' },
      { text: 'Jag har aldrig varit i Frankrike.', answer: 'Je ne suis jamais allé en France.' },
      { text: 'Boken jag läste var intressant.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'Om jag hade vetat, hade jag kommit.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'Hon fick mig att skratta.', answer: 'Elle m\'a fait rire.' },
      { text: 'Glöm inte att ringa mig.', answer: 'N\'oublie pas de m\'appeler.' },
    ],
    hard: [
      { text: 'Bättre sent än aldrig.', answer: 'Mieux vaut tard que jamais.' },
      { text: 'Borta bra men hemma bäst.', answer: 'On n\'est jamais aussi bien que chez soi.' },
      { text: 'Den som lever får se.', answer: 'Qui vivra verra.' },
      { text: 'Många bäckar små gör en stor å.', answer: 'Petit à petit, l\'oiseau fait son nid.' },
      { text: 'Tala är silver, tiga är guld.', answer: 'La parole est d\'argent, le silence est d\'or.' },
      { text: 'Den som väntar på något gott väntar aldrig för länge.', answer: 'Tout vient à point à qui sait attendre.' },
      { text: 'Ingen rök utan eld.', answer: 'Il n\'y a pas de fumée sans feu.' },
      { text: 'Allt är inte guld som glimmar.', answer: 'Tout ce qui brille n\'est pas or.' },
      { text: 'Bränt barn skyr elden.', answer: 'Chat échaudé craint l\'eau froide.' },
      { text: 'Smida medan järnet är varmt.', answer: 'Il faut battre le fer tant qu\'il est chaud.' },
    ],
  },

  // ============ CROATE ============
  croate: {
    easy: [
      { text: 'Bok, kako si?', answer: 'Salut, comment vas-tu ?', aliases: ['Bonjour, comment vas-tu ?'] },
      { text: 'Gladan sam.', answer: 'J\'ai faim.' },
      { text: 'Koliko je sati?', answer: 'Quelle heure est-il ?' },
      { text: 'Volim te.', answer: 'Je t\'aime.' },
      { text: 'Dobar dan.', answer: 'Bonjour.' },
      { text: 'Vidimo se sutra.', answer: 'À demain.' },
      { text: 'Hvala lijepa.', answer: 'Merci beaucoup.' },
      { text: 'Ne razumijem.', answer: 'Je ne comprends pas.' },
      { text: 'Koliko košta?', answer: 'Combien ça coûte ?' },
      { text: 'Umoran sam.', answer: 'Je suis fatigué.' },
    ],
    medium: [
      { text: 'Htio bih kavu, molim.', answer: 'Je voudrais un café, s\'il te plaît.' },
      { text: 'Čekam već dva sata.', answer: 'J\'attends depuis deux heures.' },
      { text: 'Trebali bismo otići prije nego što počne kiša.', answer: 'Nous devrions partir avant qu\'il pleuve.' },
      { text: 'On je najviši u razredu.', answer: 'Il est le plus grand de la classe.' },
      { text: 'Znaš li kada vlak stiže?', answer: 'Sais-tu quand le train arrive ?' },
      { text: 'Nikad nisam bio u Francuskoj.', answer: 'Je ne suis jamais allé en France.' },
      { text: 'Knjiga koju sam pročitao bila je zanimljiva.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'Da sam znao, došao bih.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'Nasmijala me je.', answer: 'Elle m\'a fait rire.' },
      { text: 'Ne zaboravi me nazvati.', answer: 'N\'oublie pas de m\'appeler.' },
    ],
    hard: [
      { text: 'Bolje ikad nego nikad.', answer: 'Mieux vaut tard que jamais.' },
      { text: 'Tko rano rani, dvije sreće grabi.', answer: 'L\'avenir appartient à ceux qui se lèvent tôt.' },
      { text: 'Prijatelj se u nevolji poznaje.', answer: 'C\'est dans le besoin qu\'on reconnaît ses amis.' },
      { text: 'Bez muke nema nauke.', answer: 'On n\'a rien sans rien.' },
      { text: 'Tko visoko leti, nisko pada.', answer: 'Qui s\'élève sera abaissé.' },
      { text: 'Vrana vrani oči ne vadi.', answer: 'Les loups ne se mangent pas entre eux.' },
      { text: 'Govor je srebro, šutnja je zlato.', answer: 'La parole est d\'argent, le silence est d\'or.' },
      { text: 'Ne sudi knjigu po koricama.', answer: 'L\'habit ne fait pas le moine.' },
      { text: 'Gdje je dim, tu je i vatra.', answer: 'Il n\'y a pas de fumée sans feu.' },
      { text: 'Krv nije voda.', answer: 'Le sang n\'est pas de l\'eau.' },
    ],
  },

  // ============ ROUMAIN ============
  roumain: {
    easy: [
      { text: 'Bună, ce mai faci?', answer: 'Bonjour, comment vas-tu ?', aliases: ['Salut, comment vas-tu ?'] },
      { text: 'Mi-e foame.', answer: 'J\'ai faim.' },
      { text: 'Cât e ceasul?', answer: 'Quelle heure est-il ?' },
      { text: 'Te iubesc.', answer: 'Je t\'aime.' },
      { text: 'Bună ziua.', answer: 'Bonjour.' },
      { text: 'Pe mâine.', answer: 'À demain.' },
      { text: 'Mulțumesc mult.', answer: 'Merci beaucoup.' },
      { text: 'Nu înțeleg.', answer: 'Je ne comprends pas.' },
      { text: 'Cât costă?', answer: 'Combien ça coûte ?' },
      { text: 'Sunt obosit.', answer: 'Je suis fatigué.' },
    ],
    medium: [
      { text: 'Aș dori o cafea, vă rog.', answer: 'Je voudrais un café, s\'il vous plaît.' },
      { text: 'Aștept de două ore.', answer: 'J\'attends depuis deux heures.' },
      { text: 'Ar trebui să plecăm înainte să plouă.', answer: 'Nous devrions partir avant qu\'il pleuve.' },
      { text: 'El este cel mai înalt din clasă.', answer: 'Il est le plus grand de la classe.' },
      { text: 'Știi la ce oră ajunge trenul?', answer: 'Sais-tu à quelle heure arrive le train ?' },
      { text: 'Nu am fost niciodată în Franța.', answer: 'Je ne suis jamais allé en France.' },
      { text: 'Cartea pe care am citit-o a fost interesantă.', answer: 'Le livre que j\'ai lu était intéressant.' },
      { text: 'Dacă aș fi știut, aș fi venit.', answer: 'Si j\'avais su, je serais venu.' },
      { text: 'M-a făcut să râd.', answer: 'Elle m\'a fait rire.', aliases: ['Il m\'a fait rire.'] },
      { text: 'Nu uita să mă suni.', answer: 'N\'oublie pas de m\'appeler.' },
    ],
    hard: [
      { text: 'Mai bine mai târziu decât niciodată.', answer: 'Mieux vaut tard que jamais.' },
      { text: 'Cine se scoală de dimineață, departe ajunge.', answer: 'L\'avenir appartient à ceux qui se lèvent tôt.' },
      { text: 'Vorba dulce mult aduce.', answer: 'Une parole douce fait beaucoup.' },
      { text: 'Cine seamănă vânt, culege furtună.', answer: 'Qui sème le vent récolte la tempête.' },
      { text: 'Nu da vrabia din mână pe cioara de pe gard.', answer: 'Un tiens vaut mieux que deux tu l\'auras.' },
      { text: 'Lupul își schimbă părul, dar năravul ba.', answer: 'Chassez le naturel, il revient au galop.' },
      { text: 'Câinele care latră nu mușcă.', answer: 'Chien qui aboie ne mord pas.' },
      { text: 'Tăcerea e de aur.', answer: 'La parole est d\'argent, le silence est d\'or.' },
      { text: 'Ai carte, ai parte.', answer: 'Le savoir, c\'est le pouvoir.' },
      { text: 'Ulciorul nu merge de multe ori la apă.', answer: 'Tant va la cruche à l\'eau qu\'à la fin elle se casse.' },
    ],
  },
};
