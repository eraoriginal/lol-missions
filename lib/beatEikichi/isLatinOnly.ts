/**
 * Test si une chaîne s'écrit uniquement en alphabet latin.
 *
 * Renvoie `false` pour les chaînes contenant des **lettres** non-latines :
 * japonais (kana/kanji), chinois, cyrillique, arabe, hébreu, hangul, thaï, etc.
 *
 * Tolère la ponctuation typographique (apostrophe courbe `'` U+2019, tirets
 * longs `–` `—`, guillemets `«»` `""`, etc.), les chiffres, les symboles et
 * les espaces de toute nature — seul le script des *lettres* est testé. Ainsi
 * « Assassin's Creed » (apostrophe typographique) ou « Mario — Galaxy » restent
 * considérés comme latins.
 *
 * Chaîne vide → false (pas exploitable comme nom/alias).
 */
export function isLatinOnly(s: string): boolean {
  if (!s || !s.trim()) return false;
  // Test : y a-t-il au moins une lettre, et TOUTES les lettres sont-elles
  // latines ? `\p{L}` = toute lettre Unicode, `\p{Script=Latin}` = lettres
  // dérivées du latin (ASCII, accents européens, IPA, etc.). On ignore la
  // ponctuation, les chiffres et les espaces — un nom peut les contenir
  // librement sans être « non-latin ».
  let hasLetter = false;
  for (const ch of s) {
    if (/\p{L}/u.test(ch)) {
      hasLetter = true;
      if (!/\p{Script=Latin}/u.test(ch)) return false;
    }
  }
  return hasLetter;
}
