/**
 * Helpers pour les jeux solo quotidiens (Motus, Worldle, WikiEra, Password, Cemantix).
 *
 * Chaque jeu utilise le même seed journalier (nombre de jours écoulés depuis
 * l'epoch UTC), ce qui garantit que tous les joueurs de la planète jouent
 * exactement le même puzzle un jour donné.
 */

export function dailyIndex(now: Date = new Date()): number {
  // Utiliser la date UTC pour éviter les décalages fuseau horaire.
  const utcMs = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return Math.floor(utcMs / (24 * 3600 * 1000));
}

/** Pick déterministe dans un tableau à partir de l'index du jour. */
export function pickByDay<T>(arr: T[], day: number = dailyIndex()): T {
  if (arr.length === 0) throw new Error('Empty array');
  // Ajoute un offset premier pour que le premier jour ne soit pas toujours item 0.
  const idx = ((day % arr.length) + arr.length) % arr.length;
  return arr[idx];
}

/**
 * Mulberry32 — PRNG déterministe. Permet de dériver plusieurs valeurs à
 * partir d'un seed (index du jour) : ex. tirer N règles de Password parmi
 * un pool, de manière reproductible jour par jour.
 */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shuffle Fisher-Yates déterministe à partir d'un seed. */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Format court jour : "2026-04-24" */
export function dailyDateKey(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
