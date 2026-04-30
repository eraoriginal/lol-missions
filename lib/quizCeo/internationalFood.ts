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
  { name: 'Pizza Margherita', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg/500px-Eq_it-na_pizza-margherita_sep2005_sml.jpg', country: 'Italie', choices: ['Italie', 'Grèce', 'Espagne', 'France'] },
  { name: 'Sushi', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Sashimi_of_S%C3%A3o_Paulo.jpg/500px-Sashimi_of_S%C3%A3o_Paulo.jpg', country: 'Japon', choices: ['Japon', 'Chine', 'Corée du Sud', 'Thaïlande'] },
  { name: 'Tacos', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Mexico.Tacos.01.jpg/500px-Mexico.Tacos.01.jpg', country: 'Mexique', choices: ['Mexique', 'Espagne', 'Pérou', 'Argentine'] },
  { name: 'Couscous', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/%D9%85%D8%B3%D9%81%D9%88%D9%81_%D8%AA%D9%88%D9%86%D8%B3%D9%8A_%D8%A8%D8%A7%D9%84%D8%B1%D9%85%D8%A7%D9%86_%D9%88%D8%A7%D9%84%D8%B2%D8%A8%D9%8A%D8%A8.jpg/500px-%D9%85%D8%B3%D9%81%D9%88%D9%81_%D8%AA%D9%88%D9%86%D8%B3%D9%8A_%D8%A8%D8%A7%D9%84%D8%B1%D9%85%D8%A7%D9%86_%D9%88%D8%A7%D9%84%D8%B2%D8%A8%D9%8A%D8%A8.jpg', country: 'Maroc', choices: ['Maroc', 'Algérie', 'Tunisie', 'Liban'] },
  { name: 'Paella', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Paella_de_fruit_de_mer.jpg/500px-Paella_de_fruit_de_mer.jpg', country: 'Espagne', choices: ['Espagne', 'Portugal', 'Italie', 'Mexique'] },
  { name: 'Croissant', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Croissant-Petr_Kratochvil.jpg/500px-Croissant-Petr_Kratochvil.jpg', country: 'France', choices: ['France', 'Autriche', 'Belgique', 'Italie'] },
  { name: 'Choucroute', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Choucroute_d%27Alsace_004.jpg/500px-Choucroute_d%27Alsace_004.jpg', country: 'Allemagne', choices: ['Allemagne', 'Pologne', 'Autriche', 'Russie'] },
  { name: 'Hamburger', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/NCI_Visuals_Food_Hamburger.jpg/500px-NCI_Visuals_Food_Hamburger.jpg', country: 'États-Unis', choices: ['États-Unis', 'Allemagne', 'Royaume-Uni', 'Canada'] },
  { name: 'Curry', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Chicken_curry.jpg/500px-Chicken_curry.jpg', country: 'Inde', choices: ['Inde', 'Thaïlande', 'Pakistan', 'Sri Lanka'] },
  { name: 'Pad Thai', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Phat_Thai_kung_Chang_Khien_street_stall.jpg/500px-Phat_Thai_kung_Chang_Khien_street_stall.jpg', country: 'Thaïlande', choices: ['Thaïlande', 'Vietnam', 'Cambodge', 'Indonésie'] },
  { name: 'Bortsch', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Borscht_served.jpg/500px-Borscht_served.jpg', country: 'Ukraine', choices: ['Ukraine', 'Russie', 'Pologne', 'Hongrie'] },
  { name: 'Houmous', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Smoky_Houmous_on_Toast_-_The_Shed_2025-07-26.jpg/500px-Smoky_Houmous_on_Toast_-_The_Shed_2025-07-26.jpg', country: 'Liban', choices: ['Liban', 'Israël', 'Turquie', 'Égypte'] },
  { name: 'Falafel', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Falafel_balls.jpg/500px-Falafel_balls.jpg', country: 'Liban', choices: ['Liban', 'Israël', 'Égypte', 'Turquie'] },
  { name: 'Goulash', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/020230805_125640_goulash_with_spaetzle.jpg/500px-020230805_125640_goulash_with_spaetzle.jpg', country: 'Hongrie', choices: ['Hongrie', 'Autriche', 'Pologne', 'Roumanie'] },
  { name: 'Risotto', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Risotto.jpg/500px-Risotto.jpg', country: 'Italie', choices: ['Italie', 'Espagne', 'France', 'Suisse'] },
  { name: 'Ramen', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Touched_by_His_Noodly_Appendage_HD.jpg/500px-Touched_by_His_Noodly_Appendage_HD.jpg', country: 'Japon', choices: ['Japon', 'Chine', 'Corée du Sud', 'Vietnam'] },
  { name: 'Pho', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pho-Beef-Noodles-2008.jpg/500px-Pho-Beef-Noodles-2008.jpg', country: 'Vietnam', choices: ['Vietnam', 'Thaïlande', 'Cambodge', 'Laos'] },
  { name: 'Bibimbap', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Korean_cuisine-Bibimbap-08.jpg/500px-Korean_cuisine-Bibimbap-08.jpg', country: 'Corée du Sud', choices: ['Corée du Sud', 'Japon', 'Chine', 'Taïwan'] },
  { name: 'Empanadas', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Empanadas_de_carne.jpg/500px-Empanadas_de_carne.jpg', country: 'Argentine', choices: ['Argentine', 'Chili', 'Espagne', 'Mexique'] },
  { name: 'Ceviche', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Ceviche_del_Per%C3%BA.jpg/500px-Ceviche_del_Per%C3%BA.jpg', country: 'Pérou', choices: ['Pérou', 'Mexique', 'Équateur', 'Chili'] },
  { name: 'Feijoada', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Feijoada_%C3%A0_brasileira_-02.jpg/500px-Feijoada_%C3%A0_brasileira_-02.jpg', country: 'Brésil', choices: ['Brésil', 'Portugal', 'Argentine', 'Cap-Vert'] },
  { name: 'Moussaka', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Moussaka.jpg/500px-Moussaka.jpg', country: 'Grèce', choices: ['Grèce', 'Turquie', 'Bulgarie', 'Liban'] },
  { name: 'Tajine', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Tajines_in_a_pottery_shop_in_Morocco.jpg/500px-Tajines_in_a_pottery_shop_in_Morocco.jpg', country: 'Maroc', choices: ['Maroc', 'Algérie', 'Tunisie', 'Égypte'] },
  { name: 'Kebab', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Kebab_Gerashi.jpg/500px-Kebab_Gerashi.jpg', country: 'Turquie', choices: ['Turquie', 'Liban', 'Iran', 'Grèce'] },
  { name: 'Baklava', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Baklava_-_Turkish_special%2C_80-ply.JPEG/500px-Baklava_-_Turkish_special%2C_80-ply.JPEG', country: 'Turquie', choices: ['Turquie', 'Grèce', 'Liban', 'Iran'] },
  { name: 'Pierogi', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Pierogi%2C_Gniezno%2C_Polonia3.jpg/500px-Pierogi%2C_Gniezno%2C_Polonia3.jpg', country: 'Pologne', choices: ['Pologne', 'Russie', 'Ukraine', 'Tchéquie'] },
  { name: 'Schnitzel', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Wiener-Schnitzel02.jpg/500px-Wiener-Schnitzel02.jpg', country: 'Autriche', choices: ['Autriche', 'Allemagne', 'Suisse', 'Hongrie'] },
  { name: 'Fondue', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fondue_dish.jpg/500px-Fondue_dish.jpg', country: 'Suisse', choices: ['Suisse', 'France', 'Italie', 'Autriche'] },
  { name: 'Raclette', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/2015-01-06_Wiki_Loves_Cheese_Racletteessen_bei_WMAT_7651.jpg/500px-2015-01-06_Wiki_Loves_Cheese_Racletteessen_bei_WMAT_7651.jpg', country: 'Suisse', choices: ['Suisse', 'France', 'Italie', 'Allemagne'] },
  { name: 'Poutine', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Poutine.jpg/500px-Poutine.jpg', country: 'Canada', choices: ['Canada', 'États-Unis', 'Belgique', 'France'] },
  { name: 'Dim Sum', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Dim_Sum_Breakfast.jpg/500px-Dim_Sum_Breakfast.jpg', country: 'Chine', choices: ['Chine', 'Hong Kong', 'Taïwan', 'Vietnam'] },
  { name: 'Canard laqué', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Peking_Duck_2.jpg/500px-Peking_Duck_2.jpg', country: 'Chine', choices: ['Chine', 'Vietnam', 'Corée du Sud', 'Japon'] },
  { name: 'Chow Mein', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Chicken_Chow_mein_1.jpg/500px-Chicken_Chow_mein_1.jpg', country: 'Chine', choices: ['Chine', 'Inde', 'Thaïlande', 'Vietnam'] },
  { name: 'Tikka Masala', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Chicken_tikka_masala.jpg/500px-Chicken_tikka_masala.jpg', country: 'Royaume-Uni', choices: ['Royaume-Uni', 'Inde', 'Pakistan', 'Bangladesh'] },
  { name: 'Tandoori', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Grilled_Tandoori_chicken.jpg/500px-Grilled_Tandoori_chicken.jpg', country: 'Inde', choices: ['Inde', 'Pakistan', 'Iran', 'Bangladesh'] },
  { name: 'Biryani', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Hyderabadi_Chicken_Biryani.jpg/500px-Hyderabadi_Chicken_Biryani.jpg', country: 'Inde', choices: ['Inde', 'Pakistan', 'Iran', 'Bangladesh'] },
  { name: 'Naan', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Naan_2.jpg/500px-Naan_2.jpg', country: 'Inde', choices: ['Inde', 'Pakistan', 'Iran', 'Afghanistan'] },
  { name: 'Samosa', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Samosa_4.jpg/500px-Samosa_4.jpg', country: 'Inde', choices: ['Inde', 'Pakistan', 'Bangladesh', 'Liban'] },
  { name: 'Gnocchi', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gnocchi_di_ricotta_burro_e_salvia.jpg/500px-Gnocchi_di_ricotta_burro_e_salvia.jpg', country: 'Italie', choices: ['Italie', 'France', 'Suisse', 'Autriche'] },
  { name: 'Tiramisu', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Tiramisu_-_Raffaele_Diomede.jpg/500px-Tiramisu_-_Raffaele_Diomede.jpg', country: 'Italie', choices: ['Italie', 'France', 'Autriche', 'Espagne'] },
  { name: 'Lasagnes', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Meaty_Lasagna_8of8_%288736299782%29.jpg/500px-Meaty_Lasagna_8of8_%288736299782%29.jpg', country: 'Italie', choices: ['Italie', 'France', 'Grèce', 'Espagne'] },
  { name: 'Crêpes', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Crepes_dsc07085.jpg/500px-Crepes_dsc07085.jpg', country: 'France', choices: ['France', 'Belgique', 'Pays-Bas', 'Autriche'] },
  { name: 'Quiche lorraine', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Quiche_lorraine_01.JPG/500px-Quiche_lorraine_01.JPG', country: 'France', choices: ['France', 'Allemagne', 'Belgique', 'Suisse'] },
  { name: 'Bouillabaisse', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Scorpaena_porcus_2009_G1.jpg/500px-Scorpaena_porcus_2009_G1.jpg', country: 'France', choices: ['France', 'Italie', 'Espagne', 'Portugal'] },
  { name: 'Cassoulet', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Bowl_of_cassoulet.JPG/500px-Bowl_of_cassoulet.JPG', country: 'France', choices: ['France', 'Espagne', 'Italie', 'Portugal'] },
  { name: 'Ratatouille', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Ratatouille.jpg/500px-Ratatouille.jpg', country: 'France', choices: ['France', 'Italie', 'Espagne', 'Grèce'] },
  { name: 'Coq au vin', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Coq_au_Vin_6of7_%288735164745%29.jpg/500px-Coq_au_Vin_6of7_%288735164745%29.jpg', country: 'France', choices: ['France', 'Belgique', 'Italie', 'Suisse'] },
  { name: 'Bœuf bourguignon', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/B%C5%93uf_bourguignon_06.JPG/500px-B%C5%93uf_bourguignon_06.JPG', country: 'France', choices: ['France', 'Belgique', 'Suisse', 'Italie'] },
  { name: 'Macarons', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Des_macarons_de_chez_Bouillet_%28mars_2023%29.jpg/500px-Des_macarons_de_chez_Bouillet_%28mars_2023%29.jpg', country: 'France', choices: ['France', 'Italie', 'Belgique', 'Autriche'] },
  { name: 'Tortilla espagnole', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Tortilla_de_patatas.jpg/500px-Tortilla_de_patatas.jpg', country: 'Espagne', choices: ['Espagne', 'Mexique', 'Portugal', 'Italie'] },
  { name: 'Gaspacho', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Gazpacho_andaluz.jpg/500px-Gazpacho_andaluz.jpg', country: 'Espagne', choices: ['Espagne', 'Italie', 'Portugal', 'Maroc'] },
  { name: 'Tapas', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/2017_Letreiro_do_mes%C3%B3n_O_tapas._Sarria._Galiza.jpg/500px-2017_Letreiro_do_mes%C3%B3n_O_tapas._Sarria._Galiza.jpg', country: 'Espagne', choices: ['Espagne', 'Portugal', 'Italie', 'Grèce'] },
  { name: 'Churros', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Churros_en_vasos_en_Londres_-_A_Taste_of_Spain.jpg/500px-Churros_en_vasos_en_Londres_-_A_Taste_of_Spain.jpg', country: 'Espagne', choices: ['Espagne', 'Mexique', 'Portugal', 'Argentine'] },
  { name: 'Jambon ibérique', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Jam%C3%B3n_ib%C3%A9rico%2C_Set%C3%BAbal%2C_Portugal%2C_2012-05-11%2C_DD_02.JPG/500px-Jam%C3%B3n_ib%C3%A9rico%2C_Set%C3%BAbal%2C_Portugal%2C_2012-05-11%2C_DD_02.JPG', country: 'Espagne', choices: ['Espagne', 'Portugal', 'Italie', 'France'] },
  { name: 'Bretzel', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Bretzel_03.JPG/500px-Bretzel_03.JPG', country: 'Allemagne', choices: ['Allemagne', 'Autriche', 'Suisse', 'France'] },
  { name: 'Currywurst', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Currywurst-1.jpg/500px-Currywurst-1.jpg', country: 'Allemagne', choices: ['Allemagne', 'Autriche', 'Pays-Bas', 'Pologne'] },
  { name: 'Bratwurst', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Sausage_making-H-5-edited2.jpg/500px-Sausage_making-H-5-edited2.jpg', country: 'Allemagne', choices: ['Allemagne', 'Autriche', 'Suisse', 'Pologne'] },
  { name: 'Sachertorte', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Sachertorte_DSC03027_retouched.jpg/500px-Sachertorte_DSC03027_retouched.jpg', country: 'Autriche', choices: ['Autriche', 'Allemagne', 'Hongrie', 'Suisse'] },
  { name: 'Fish and chips', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Fish_and_chips_blackpool.jpg/500px-Fish_and_chips_blackpool.jpg', country: 'Royaume-Uni', choices: ['Royaume-Uni', 'Irlande', 'Australie', 'Canada'] },
  { name: 'Shepherd\'s pie', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/ShepherdsPie.jpg', country: 'Royaume-Uni', choices: ['Royaume-Uni', 'Irlande', 'États-Unis', 'Australie'] },
  { name: 'Haggis', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Haggis%2C_neeps_and_tatties.jpg/500px-Haggis%2C_neeps_and_tatties.jpg', country: 'Royaume-Uni', choices: ['Royaume-Uni', 'Irlande', 'Norvège', 'Islande'] },
  { name: 'Irish stew', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Irish_stew.jpg/500px-Irish_stew.jpg', country: 'Irlande', choices: ['Irlande', 'Royaume-Uni', 'Écosse', 'Pays-Bas'] },
  { name: 'Stroopwafel', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Stroopwafels.jpg/500px-Stroopwafels.jpg', country: 'Pays-Bas', choices: ['Pays-Bas', 'Belgique', 'Allemagne', 'Danemark'] },
  { name: 'Moules-frites', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Moules-frites_at_Chez_Leon_in_Brussels.jpg/500px-Moules-frites_at_Chez_Leon_in_Brussels.jpg', country: 'Belgique', choices: ['Belgique', 'France', 'Pays-Bas', 'Portugal'] },
  { name: 'Gaufre', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Jielbeaumadier_gaufres_lilloises_2008.jpg/500px-Jielbeaumadier_gaufres_lilloises_2008.jpg', country: 'Belgique', choices: ['Belgique', 'Pays-Bas', 'France', 'Allemagne'] },
  { name: 'Spätzle', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/K%C3%A4sesp%C3%A4tzle.jpg/500px-K%C3%A4sesp%C3%A4tzle.jpg', country: 'Allemagne', choices: ['Allemagne', 'Autriche', 'Suisse', 'Hongrie'] },
  { name: 'Pão de queijo', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Pao_de_queijo_brasil.jpg/500px-Pao_de_queijo_brasil.jpg', country: 'Brésil', choices: ['Brésil', 'Portugal', 'Argentine', 'Mexique'] },
  { name: 'Asado', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Asado_argentino_a_la_estaca.jpg/500px-Asado_argentino_a_la_estaca.jpg', country: 'Argentine', choices: ['Argentine', 'Uruguay', 'Brésil', 'Chili'] },
  { name: 'Arepa', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Arepa_frita.jpg/500px-Arepa_frita.jpg', country: 'Venezuela', choices: ['Venezuela', 'Colombie', 'Mexique', 'Pérou'] },
  { name: 'Mole', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mole_poblano_de_guajolote.jpg/500px-Mole_poblano_de_guajolote.jpg', country: 'Mexique', choices: ['Mexique', 'Pérou', 'Guatemala', 'Espagne'] },
  { name: 'Burrito', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Burrito.JPG/500px-Burrito.JPG', country: 'Mexique', choices: ['Mexique', 'États-Unis', 'Espagne', 'Cuba'] },
  { name: 'Quesadilla', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/At_Long_Island_2023_267.jpg/500px-At_Long_Island_2023_267.jpg', country: 'Mexique', choices: ['Mexique', 'Espagne', 'Pérou', 'Argentine'] },
  { name: 'Guacamole', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Guacamole_IMGP1271.jpg/500px-Guacamole_IMGP1271.jpg', country: 'Mexique', choices: ['Mexique', 'Pérou', 'Espagne', 'Cuba'] },
  { name: 'Nachos', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Ignacio_Anaya_Inventor_of_Nachos.jpg/500px-Ignacio_Anaya_Inventor_of_Nachos.jpg', country: 'Mexique', choices: ['Mexique', 'États-Unis', 'Espagne', 'Argentine'] },
  { name: 'Banh Mi', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Special_Baguette_%28B%C3%A1nh_m%C3%AC%29_-_Banh_Mi_Ancient_Saigon_2024-12-20.jpg/500px-Special_Baguette_%28B%C3%A1nh_m%C3%AC%29_-_Banh_Mi_Ancient_Saigon_2024-12-20.jpg', country: 'Vietnam', choices: ['Vietnam', 'Thaïlande', 'Cambodge', 'France'] },
  { name: 'Rouleaux de printemps', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Rizpai_%28Lyon_6e%29_-_Rouleaux_de_printemps_%28janv_2019%29.jpg/500px-Rizpai_%28Lyon_6e%29_-_Rouleaux_de_printemps_%28janv_2019%29.jpg', country: 'Vietnam', choices: ['Vietnam', 'Chine', 'Thaïlande', 'Cambodge'] },
  { name: 'Tom Yum', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Tom_Yum_with_Clear_Soup.jpg/500px-Tom_Yum_with_Clear_Soup.jpg', country: 'Thaïlande', choices: ['Thaïlande', 'Vietnam', 'Laos', 'Cambodge'] },
  { name: 'Som Tam', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Som_Tam_green_papaya_salad%2C_Bangkok%2C_Thailand.jpg/500px-Som_Tam_green_papaya_salad%2C_Bangkok%2C_Thailand.jpg', country: 'Thaïlande', choices: ['Thaïlande', 'Laos', 'Vietnam', 'Cambodge'] },
  { name: 'Nasi Goreng', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Nasi_goreng_kambing.jpg/500px-Nasi_goreng_kambing.jpg', country: 'Indonésie', choices: ['Indonésie', 'Malaisie', 'Singapour', 'Thaïlande'] },
  { name: 'Rendang', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Lamb_rendang.jpg/500px-Lamb_rendang.jpg', country: 'Indonésie', choices: ['Indonésie', 'Malaisie', 'Singapour', 'Brunei'] },
  { name: 'Laksa', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Thai_laksa_dish_at_Yim_Thai_Yeronga%2C_Queensland.jpg/500px-Thai_laksa_dish_at_Yim_Thai_Yeronga%2C_Queensland.jpg', country: 'Malaisie', choices: ['Malaisie', 'Singapour', 'Indonésie', 'Thaïlande'] },
  { name: 'Kimchi', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Kimchi.jpg/500px-Kimchi.jpg', country: 'Corée du Sud', choices: ['Corée du Sud', 'Chine', 'Japon', 'Vietnam'] },
  { name: 'Bulgogi', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Bulgogi_3.jpg/500px-Bulgogi_3.jpg', country: 'Corée du Sud', choices: ['Corée du Sud', 'Japon', 'Chine', 'Mongolie'] },
  { name: 'Dolma', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Vorspeise_mit_Dolma_und_Tzatziki.jpg/500px-Vorspeise_mit_Dolma_und_Tzatziki.jpg', country: 'Turquie', choices: ['Turquie', 'Grèce', 'Liban', 'Iran'] },
  { name: 'Shawarma', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Shawarma_closeup.png/500px-Shawarma_closeup.png', country: 'Liban', choices: ['Liban', 'Syrie', 'Turquie', 'Israël'] },
  { name: 'Taboulé', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Tabouleh.jpg/500px-Tabouleh.jpg', country: 'Liban', choices: ['Liban', 'Syrie', 'Turquie', 'Israël'] },
  { name: 'Manakish', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Israeli_zaatar_manakeesh.jpg/500px-Israeli_zaatar_manakeesh.jpg', country: 'Liban', choices: ['Liban', 'Syrie', 'Jordanie', 'Égypte'] },
  { name: 'Kefta', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Grilled_Kefta_Skewers.jpg/500px-Grilled_Kefta_Skewers.jpg', country: 'Maroc', choices: ['Maroc', 'Liban', 'Turquie', 'Algérie'] },
  { name: 'Pastilla', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Bisteeya.jpg', country: 'Maroc', choices: ['Maroc', 'Algérie', 'Tunisie', 'Espagne'] },
  { name: 'Injera', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Injera_from_ivory_teff.jpg/500px-Injera_from_ivory_teff.jpg', country: 'Éthiopie', choices: ['Éthiopie', 'Érythrée', 'Soudan', 'Kenya'] },
  { name: 'Doro Wat', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Ethiopian_wat.jpg/500px-Ethiopian_wat.jpg', country: 'Éthiopie', choices: ['Éthiopie', 'Érythrée', 'Soudan', 'Somalie'] },
  { name: 'Bagel', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Montr%C3%A9al_bagel_with_lox.jpg/500px-Montr%C3%A9al_bagel_with_lox.jpg', country: 'Pologne', choices: ['Pologne', 'États-Unis', 'Israël', 'Allemagne'] },
  { name: 'Ceviche péruvien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/FolkloreMonde_%2816%29.jpg/500px-FolkloreMonde_%2816%29.jpg', country: 'Pérou', choices: ['Pérou', 'Équateur', 'Mexique', 'Chili'] },
  { name: 'Tacos al pastor', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Tacos_de_pastor.jpg/500px-Tacos_de_pastor.jpg', country: 'Mexique', choices: ['Mexique', 'Liban', 'Espagne', 'Cuba'] },
  { name: 'Borek', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Borek.jpg/500px-Borek.jpg', country: 'Turquie', choices: ['Turquie', 'Grèce', 'Bulgarie', 'Arménie'] },
  { name: 'Pelmenis', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Pelmeni_Russian.jpg/500px-Pelmeni_Russian.jpg', country: 'Russie', choices: ['Russie', 'Ukraine', 'Pologne', 'Finlande'] },
  { name: 'Chili con carne', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Chili_con_carne.jpg/500px-Chili_con_carne.jpg', country: 'États-Unis', choices: ['États-Unis', 'Mexique', 'Espagne', 'Argentine'] },
  { name: 'Khachapuri', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Khachapuri_in_Guangzhou.jpg/500px-Khachapuri_in_Guangzhou.jpg', country: 'Géorgie', choices: ['Géorgie', 'Arménie', 'Russie', 'Turquie'] },
  { name: 'Goulash hongrois', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/%D0%91%D0%BE%D0%B1_%D0%B3%D1%83%D0%BB%D1%8F%D1%88_2.jpg/500px-%D0%91%D0%BE%D0%B1_%D0%B3%D1%83%D0%BB%D1%8F%D1%88_2.jpg', country: 'Hongrie', choices: ['Hongrie', 'Autriche', 'Pologne', 'Roumanie'] },
  { name: 'Paneer tikka', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Panir_Tikka_Indian_cheese_grilled.jpg/500px-Panir_Tikka_Indian_cheese_grilled.jpg', country: 'Inde', choices: ['Inde', 'Pakistan', 'Bangladesh', 'Sri Lanka'] },
  { name: 'Okonomiyaki', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Okonomiyaki_001.jpg/500px-Okonomiyaki_001.jpg', country: 'Japon', choices: ['Japon', 'Corée du Sud', 'Chine', 'Taïwan'] },
  { name: 'Takoyaki', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Takoyaki.jpg/500px-Takoyaki.jpg', country: 'Japon', choices: ['Japon', 'Corée du Sud', 'Chine', 'Vietnam'] },
  { name: 'Mapo Tofu', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Billyfoodmabodofu3.jpg/500px-Billyfoodmabodofu3.jpg', country: 'Chine', choices: ['Chine', 'Japon', 'Corée du Sud', 'Vietnam'] },
];
