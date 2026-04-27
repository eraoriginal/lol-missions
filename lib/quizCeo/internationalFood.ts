/**
 * Catalogue de plats internationaux pour le Quiz CEO type
 * `bouffe-internationale`. 100 plats reconnaissables sous forme de QCM.
 *
 * Mécanique : photo du plat + 4 propositions de pays. Le joueur sélectionne
 * la bonne origine. Les `choices` sont curées par plat (4 pays plausibles)
 * pour éviter les distractors absurdes — pas de tirage runtime ici, le
 * payload DB contient déjà les 4 choix.
 *
 * Assets : URLs Wikipedia/Wikimedia Special:FilePath. Certaines peuvent
 * casser à long terme (renommages d'articles) — corriger en DB au cas par cas.
 * Le proxy `/asset/<index>` masque l'URL au client (anti-spoil) car le
 * filename révèlerait souvent la réponse (ex. "Margherita_pizza.jpg").
 */

export interface FoodEntry {
  /** Nom indicatif du plat (non affiché — sert juste à la curation). */
  name: string;
  /** URL absolue Wikipedia/Wikimedia (Special:FilePath ou upload.wikimedia.org). */
  imageUrl: string;
  /** Pays d'origine (réponse correcte, doit figurer dans `choices`). */
  country: string;
  /** Les 4 propositions affichées au joueur (1 correct + 3 distractors plausibles). */
  choices: [string, string, string, string];
}

export const INTERNATIONAL_FOODS: FoodEntry[] = [
  { name: 'Pizza Margherita', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Eq_it-na_pizza-margherita_sep2005_sml.jpg?width=500', country: 'Italie', choices: ['Italie', 'Grèce', 'Espagne', 'France'] },
  { name: 'Sushi', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Tuna_nigiri_zushi_(close_up).jpg?width=500', country: 'Japon', choices: ['Japon', 'Chine', 'Corée du Sud', 'Thaïlande'] },
  { name: 'Tacos', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Mexico.Tacos.01.jpg?width=500', country: 'Mexique', choices: ['Mexique', 'Espagne', 'Pérou', 'Argentine'] },
  { name: 'Couscous', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Couscous_de_la_Source.jpg?width=500', country: 'Maroc', choices: ['Maroc', 'Algérie', 'Tunisie', 'Liban'] },
  { name: 'Paella', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Paella_Valenciana_original.jpg?width=500', country: 'Espagne', choices: ['Espagne', 'Portugal', 'Italie', 'Mexique'] },
  { name: 'Croissant', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Croissant-Petr_Kratochvil.jpg?width=500', country: 'France', choices: ['France', 'Autriche', 'Belgique', 'Italie'] },
  { name: 'Choucroute', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Choucroute-1.jpg?width=500', country: 'Allemagne', choices: ['Allemagne', 'Pologne', 'Autriche', 'Russie'] },
  { name: 'Hamburger', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/NCI_Visuals_Food_Hamburger.jpg?width=500', country: 'États-Unis', choices: ['États-Unis', 'Allemagne', 'Royaume-Uni', 'Canada'] },
  { name: 'Curry', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Chicken_curry.jpg?width=500', country: 'Inde', choices: ['Inde', 'Thaïlande', 'Pakistan', 'Sri Lanka'] },
  { name: 'Pad Thai', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Phat_Thai_kung_Chang_Khien_street_stall.jpg?width=500', country: 'Thaïlande', choices: ['Thaïlande', 'Vietnam', 'Cambodge', 'Indonésie'] },
  { name: 'Bortsch', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Borscht_served.jpg?width=500', country: 'Ukraine', choices: ['Ukraine', 'Russie', 'Pologne', 'Hongrie'] },
  { name: 'Houmous', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Hummus_from_above.jpg?width=500', country: 'Liban', choices: ['Liban', 'Israël', 'Turquie', 'Égypte'] },
  { name: 'Falafel', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Falafel_balls.jpg?width=500', country: 'Liban', choices: ['Liban', 'Israël', 'Égypte', 'Turquie'] },
  { name: 'Goulash', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Beef_goulash_(38018438265).jpg?width=500', country: 'Hongrie', choices: ['Hongrie', 'Autriche', 'Pologne', 'Roumanie'] },
  { name: 'Risotto', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Risotto.jpg?width=500', country: 'Italie', choices: ['Italie', 'Espagne', 'France', 'Suisse'] },
  { name: 'Ramen', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Shoyu_ramen,_at_Kasukabe_Station_(2014.05.05).jpg?width=500', country: 'Japon', choices: ['Japon', 'Chine', 'Corée du Sud', 'Vietnam'] },
  { name: 'Pho', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Pho-Beef-Noodles-2008.jpg?width=500', country: 'Vietnam', choices: ['Vietnam', 'Thaïlande', 'Cambodge', 'Laos'] },
  { name: 'Bibimbap', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Korean_cuisine-Bibimbap-08.jpg?width=500', country: 'Corée du Sud', choices: ['Corée du Sud', 'Japon', 'Chine', 'Taïwan'] },
  { name: 'Empanadas', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Empanadas_de_carne.jpg?width=500', country: 'Argentine', choices: ['Argentine', 'Chili', 'Espagne', 'Mexique'] },
  { name: 'Ceviche', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Cebiche_de_corvina.jpg?width=500', country: 'Pérou', choices: ['Pérou', 'Mexique', 'Équateur', 'Chili'] },
  { name: 'Feijoada', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Feijoada_a_brasileira.jpg?width=500', country: 'Brésil', choices: ['Brésil', 'Portugal', 'Argentine', 'Cap-Vert'] },
  { name: 'Moussaka', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Moussaka.jpg?width=500', country: 'Grèce', choices: ['Grèce', 'Turquie', 'Bulgarie', 'Liban'] },
  { name: 'Tajine', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Tajine_with_Vegetables_(11355475204).jpg?width=500', country: 'Maroc', choices: ['Maroc', 'Algérie', 'Tunisie', 'Égypte'] },
  { name: 'Kebab', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Doner_kebab.jpg?width=500', country: 'Turquie', choices: ['Turquie', 'Liban', 'Iran', 'Grèce'] },
  { name: 'Baklava', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Baklava_-_Turkish_special,_80-ply.JPEG?width=500', country: 'Turquie', choices: ['Turquie', 'Grèce', 'Liban', 'Iran'] },
  { name: 'Pierogi', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/03_2017_Polish_pierogi-1.jpg?width=500', country: 'Pologne', choices: ['Pologne', 'Russie', 'Ukraine', 'Tchéquie'] },
  { name: 'Schnitzel', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Wiener-Schnitzel02.jpg?width=500', country: 'Autriche', choices: ['Autriche', 'Allemagne', 'Suisse', 'Hongrie'] },
  { name: 'Fondue', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Fondue_4.jpg?width=500', country: 'Suisse', choices: ['Suisse', 'France', 'Italie', 'Autriche'] },
  { name: 'Raclette', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Raclette_dish.jpg?width=500', country: 'Suisse', choices: ['Suisse', 'France', 'Italie', 'Allemagne'] },
  { name: 'Poutine', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Poutine.jpg?width=500', country: 'Canada', choices: ['Canada', 'États-Unis', 'Belgique', 'France'] },
  { name: 'Dim Sum', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Dim_Sum_breakfast_in_Hong_Kong.jpg?width=500', country: 'Chine', choices: ['Chine', 'Hong Kong', 'Taïwan', 'Vietnam'] },
  { name: 'Canard laqué', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Peking_Duck_2.jpg?width=500', country: 'Chine', choices: ['Chine', 'Vietnam', 'Corée du Sud', 'Japon'] },
  { name: 'Chow Mein', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Chowmein.JPG?width=500', country: 'Chine', choices: ['Chine', 'Inde', 'Thaïlande', 'Vietnam'] },
  { name: 'Tikka Masala', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Chicken_tikka_masala.jpg?width=500', country: 'Royaume-Uni', choices: ['Royaume-Uni', 'Inde', 'Pakistan', 'Bangladesh'] },
  { name: 'Tandoori', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Tandoori_chicken_(8067412746).jpg?width=500', country: 'Inde', choices: ['Inde', 'Pakistan', 'Iran', 'Bangladesh'] },
  { name: 'Biryani', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Hyderabadi_Chicken_Biryani.jpg?width=500', country: 'Inde', choices: ['Inde', 'Pakistan', 'Iran', 'Bangladesh'] },
  { name: 'Naan', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Naan_bread.jpg?width=500', country: 'Inde', choices: ['Inde', 'Pakistan', 'Iran', 'Afghanistan'] },
  { name: 'Samosa', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Samosa-Vegetable.jpg?width=500', country: 'Inde', choices: ['Inde', 'Pakistan', 'Bangladesh', 'Liban'] },
  { name: 'Gnocchi', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Gnocchi_di_patate_-_002.jpg?width=500', country: 'Italie', choices: ['Italie', 'France', 'Suisse', 'Autriche'] },
  { name: 'Tiramisu', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Tiramisu_-_Raffaele_Diomede.jpg?width=500', country: 'Italie', choices: ['Italie', 'France', 'Autriche', 'Espagne'] },
  { name: 'Lasagnes', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Lasagne-Bechamelsosse-Salatbeilage.jpg?width=500', country: 'Italie', choices: ['Italie', 'France', 'Grèce', 'Espagne'] },
  { name: 'Crêpes', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Crepe_au_sucre.jpg?width=500', country: 'France', choices: ['France', 'Belgique', 'Pays-Bas', 'Autriche'] },
  { name: 'Quiche lorraine', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Lothringer_Quiche.JPG?width=500', country: 'France', choices: ['France', 'Allemagne', 'Belgique', 'Suisse'] },
  { name: 'Bouillabaisse', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Bouillabaisse_(2).jpg?width=500', country: 'France', choices: ['France', 'Italie', 'Espagne', 'Portugal'] },
  { name: 'Cassoulet', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Cassoulet_de_Castelnaudary.jpg?width=500', country: 'France', choices: ['France', 'Espagne', 'Italie', 'Portugal'] },
  { name: 'Ratatouille', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Ratatouille_-_Stovetop.jpg?width=500', country: 'France', choices: ['France', 'Italie', 'Espagne', 'Grèce'] },
  { name: 'Coq au vin', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Coq_au_vin_blanc_DSC09471.jpg?width=500', country: 'France', choices: ['France', 'Belgique', 'Italie', 'Suisse'] },
  { name: 'Bœuf bourguignon', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Bœuf_Bourguignon_(31618909571).jpg?width=500', country: 'France', choices: ['France', 'Belgique', 'Suisse', 'Italie'] },
  { name: 'Macarons', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Macaron_(2729143400).jpg?width=500', country: 'France', choices: ['France', 'Italie', 'Belgique', 'Autriche'] },
  { name: 'Tortilla espagnole', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Tortilla_de_patatas.jpg?width=500', country: 'Espagne', choices: ['Espagne', 'Mexique', 'Portugal', 'Italie'] },
  { name: 'Gaspacho', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Gazpacho_andaluz.jpg?width=500', country: 'Espagne', choices: ['Espagne', 'Italie', 'Portugal', 'Maroc'] },
  { name: 'Tapas', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Tapas_a_Sevilla.jpg?width=500', country: 'Espagne', choices: ['Espagne', 'Portugal', 'Italie', 'Grèce'] },
  { name: 'Churros', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Spanish_churros.jpg?width=500', country: 'Espagne', choices: ['Espagne', 'Mexique', 'Portugal', 'Argentine'] },
  { name: 'Jambon ibérique', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Jamón_ibérico_y_copa_de_vino_tinto.jpg?width=500', country: 'Espagne', choices: ['Espagne', 'Portugal', 'Italie', 'France'] },
  { name: 'Bretzel', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/2-Laugenbrezel.jpg?width=500', country: 'Allemagne', choices: ['Allemagne', 'Autriche', 'Suisse', 'France'] },
  { name: 'Currywurst', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Currywurst-1.jpg?width=500', country: 'Allemagne', choices: ['Allemagne', 'Autriche', 'Pays-Bas', 'Pologne'] },
  { name: 'Bratwurst', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Roast_bratwurst_with_mustard.jpg?width=500', country: 'Allemagne', choices: ['Allemagne', 'Autriche', 'Suisse', 'Pologne'] },
  { name: 'Sachertorte', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Sachertorte_DSC03027_retouched.jpg?width=500', country: 'Autriche', choices: ['Autriche', 'Allemagne', 'Hongrie', 'Suisse'] },
  { name: 'Fish and chips', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Fish_and_chips_blackpool.jpg?width=500', country: 'Royaume-Uni', choices: ['Royaume-Uni', 'Irlande', 'Australie', 'Canada'] },
  { name: 'Shepherd\'s pie', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Shepherd_pie.jpg?width=500', country: 'Royaume-Uni', choices: ['Royaume-Uni', 'Irlande', 'États-Unis', 'Australie'] },
  { name: 'Haggis', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Haggis,_neeps_and_tatties.jpg?width=500', country: 'Royaume-Uni', choices: ['Royaume-Uni', 'Irlande', 'Norvège', 'Islande'] },
  { name: 'Irish stew', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Irish_stew_with_carrots.jpg?width=500', country: 'Irlande', choices: ['Irlande', 'Royaume-Uni', 'Écosse', 'Pays-Bas'] },
  { name: 'Stroopwafel', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Stroopwafels.jpg?width=500', country: 'Pays-Bas', choices: ['Pays-Bas', 'Belgique', 'Allemagne', 'Danemark'] },
  { name: 'Moules-frites', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Moules-Frites_(40269).jpg?width=500', country: 'Belgique', choices: ['Belgique', 'France', 'Pays-Bas', 'Portugal'] },
  { name: 'Gaufre', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Belgian_waffle_with_strawberries_and_powdered_sugar.jpg?width=500', country: 'Belgique', choices: ['Belgique', 'Pays-Bas', 'France', 'Allemagne'] },
  { name: 'Spätzle', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Käsespätzle.jpg?width=500', country: 'Allemagne', choices: ['Allemagne', 'Autriche', 'Suisse', 'Hongrie'] },
  { name: 'Pão de queijo', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Pão_de_queijo.JPG?width=500', country: 'Brésil', choices: ['Brésil', 'Portugal', 'Argentine', 'Mexique'] },
  { name: 'Asado', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Asado_argentino_03.jpg?width=500', country: 'Argentine', choices: ['Argentine', 'Uruguay', 'Brésil', 'Chili'] },
  { name: 'Arepa', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Arepas_de_huevo,_costeñas.jpg?width=500', country: 'Venezuela', choices: ['Venezuela', 'Colombie', 'Mexique', 'Pérou'] },
  { name: 'Mole', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Mole_poblano_de_guajolote.jpg?width=500', country: 'Mexique', choices: ['Mexique', 'Pérou', 'Guatemala', 'Espagne'] },
  { name: 'Burrito', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Burrito-2.jpg?width=500', country: 'Mexique', choices: ['Mexique', 'États-Unis', 'Espagne', 'Cuba'] },
  { name: 'Quesadilla', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Quesadilla_with_chicken_filling.jpg?width=500', country: 'Mexique', choices: ['Mexique', 'Espagne', 'Pérou', 'Argentine'] },
  { name: 'Guacamole', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Guacamole_IMGP1271.jpg?width=500', country: 'Mexique', choices: ['Mexique', 'Pérou', 'Espagne', 'Cuba'] },
  { name: 'Nachos', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/NCI_nachos.jpg?width=500', country: 'Mexique', choices: ['Mexique', 'États-Unis', 'Espagne', 'Argentine'] },
  { name: 'Banh Mi', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Banh_mi_thit_nuong.jpg?width=500', country: 'Vietnam', choices: ['Vietnam', 'Thaïlande', 'Cambodge', 'France'] },
  { name: 'Rouleaux de printemps', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Goi_cuon_-_Vietnamese_spring_roll.jpg?width=500', country: 'Vietnam', choices: ['Vietnam', 'Chine', 'Thaïlande', 'Cambodge'] },
  { name: 'Tom Yum', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Tom_Yam_Kung_Maenam.jpg?width=500', country: 'Thaïlande', choices: ['Thaïlande', 'Vietnam', 'Laos', 'Cambodge'] },
  { name: 'Som Tam', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Thai_papaya_salad_-_som_tam_thai.jpg?width=500', country: 'Thaïlande', choices: ['Thaïlande', 'Laos', 'Vietnam', 'Cambodge'] },
  { name: 'Nasi Goreng', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Nasi_goreng_kambing.jpg?width=500', country: 'Indonésie', choices: ['Indonésie', 'Malaisie', 'Singapour', 'Thaïlande'] },
  { name: 'Rendang', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Rendang_Daging.jpg?width=500', country: 'Indonésie', choices: ['Indonésie', 'Malaisie', 'Singapour', 'Brunei'] },
  { name: 'Laksa', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Laksa-singapur.jpg?width=500', country: 'Malaisie', choices: ['Malaisie', 'Singapour', 'Indonésie', 'Thaïlande'] },
  { name: 'Kimchi', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Kimchi.jpg?width=500', country: 'Corée du Sud', choices: ['Corée du Sud', 'Chine', 'Japon', 'Vietnam'] },
  { name: 'Bulgogi', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Bulgogi.jpg?width=500', country: 'Corée du Sud', choices: ['Corée du Sud', 'Japon', 'Chine', 'Mongolie'] },
  { name: 'Dolma', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Dolma_with_yogurt.jpg?width=500', country: 'Turquie', choices: ['Turquie', 'Grèce', 'Liban', 'Iran'] },
  { name: 'Shawarma', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Shawarma_in_Damascus.jpg?width=500', country: 'Liban', choices: ['Liban', 'Syrie', 'Turquie', 'Israël'] },
  { name: 'Taboulé', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Tabouleh.jpg?width=500', country: 'Liban', choices: ['Liban', 'Syrie', 'Turquie', 'Israël'] },
  { name: 'Manakish', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Manakish.jpg?width=500', country: 'Liban', choices: ['Liban', 'Syrie', 'Jordanie', 'Égypte'] },
  { name: 'Kefta', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Kafta.jpg?width=500', country: 'Maroc', choices: ['Maroc', 'Liban', 'Turquie', 'Algérie'] },
  { name: 'Pastilla', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Bisteeya.jpg?width=500', country: 'Maroc', choices: ['Maroc', 'Algérie', 'Tunisie', 'Espagne'] },
  { name: 'Injera', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Ethiopian_food_-_injera_and_other_foods_(15068880748).jpg?width=500', country: 'Éthiopie', choices: ['Éthiopie', 'Érythrée', 'Soudan', 'Kenya'] },
  { name: 'Doro Wat', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Doro_wat_at_Lalibela_Restaurant_(15030170569).jpg?width=500', country: 'Éthiopie', choices: ['Éthiopie', 'Érythrée', 'Soudan', 'Somalie'] },
  { name: 'Bagel', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Beigels.jpg?width=500', country: 'Pologne', choices: ['Pologne', 'États-Unis', 'Israël', 'Allemagne'] },
  { name: 'Ceviche péruvien', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Ceviche_mixto.JPG?width=500', country: 'Pérou', choices: ['Pérou', 'Équateur', 'Mexique', 'Chili'] },
  { name: 'Tacos al pastor', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Tacos_de_pastor.jpg?width=500', country: 'Mexique', choices: ['Mexique', 'Liban', 'Espagne', 'Cuba'] },
  { name: 'Borek', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Borek.jpg?width=500', country: 'Turquie', choices: ['Turquie', 'Grèce', 'Bulgarie', 'Arménie'] },
  { name: 'Pelmenis', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Pelmeni_with_butter.jpg?width=500', country: 'Russie', choices: ['Russie', 'Ukraine', 'Pologne', 'Finlande'] },
  { name: 'Chili con carne', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Chili_con_carne.jpg?width=500', country: 'États-Unis', choices: ['États-Unis', 'Mexique', 'Espagne', 'Argentine'] },
  { name: 'Khachapuri', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Khachapuri_Adjaruli_in_Tbilisi.jpg?width=500', country: 'Géorgie', choices: ['Géorgie', 'Arménie', 'Russie', 'Turquie'] },
  { name: 'Goulash hongrois', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Goulash_(2).jpg?width=500', country: 'Hongrie', choices: ['Hongrie', 'Autriche', 'Pologne', 'Roumanie'] },
  { name: 'Paneer tikka', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Paneer_Tikka_at_a_Restaurant.jpg?width=500', country: 'Inde', choices: ['Inde', 'Pakistan', 'Bangladesh', 'Sri Lanka'] },
  { name: 'Okonomiyaki', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Okonomiyaki_001.jpg?width=500', country: 'Japon', choices: ['Japon', 'Corée du Sud', 'Chine', 'Taïwan'] },
  { name: 'Takoyaki', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Takoyaki.jpg?width=500', country: 'Japon', choices: ['Japon', 'Corée du Sud', 'Chine', 'Vietnam'] },
  { name: 'Mapo Tofu', imageUrl: 'https://en.wikipedia.org/wiki/Special:FilePath/Mapo_Tofu_2015.jpg?width=500', country: 'Chine', choices: ['Chine', 'Japon', 'Corée du Sud', 'Vietnam'] },
];
