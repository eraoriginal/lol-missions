import 'server-only';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  COUNTRIES,
  bearingDeg,
  findCountry,
  haversineKm,
} from '@/lib/worldle/server';
import { pickByDay } from '@/lib/solo/dailyIndex';

const MAX_ATTEMPTS = 7;

const bodySchema = z.object({
  country: z.string().min(1).max(80),
  attemptIndex: z.number().int().min(0).max(MAX_ATTEMPTS - 1),
});

/**
 * POST /api/solo/worldle/guess
 *
 * Body : `{ country: string, attemptIndex: 0..6 }`
 * Réponse :
 *   - `countryId`, `countryName` — pays résolu (canonical, pour l'affichage)
 *   - `distanceKm`, `bearing`, `proximityPct`
 *   - `correct: boolean`
 *   - `target?: { id, name }` — révélé si `correct` OU dernier essai
 *   - `error?: string` — pays inconnu, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country: rawCountry, attemptIndex } = bodySchema.parse(body);

    const guess = findCountry(rawCountry);
    if (!guess) {
      return Response.json({ error: 'Pays inconnu' }, { status: 400 });
    }

    const target = pickByDay(COUNTRIES);
    const distanceKm = Math.round(
      haversineKm(guess.lat, guess.lng, target.lat, target.lng),
    );
    const bearing = bearingDeg(guess.lat, guess.lng, target.lat, target.lng);
    const correct = guess.id === target.id;
    const proximityPct = Math.max(0, Math.min(100, (1 - distanceKm / 20000) * 100));

    const isLastAttempt = attemptIndex === MAX_ATTEMPTS - 1;
    const reveal = correct || isLastAttempt;

    return Response.json({
      countryId: guess.id,
      countryName: guess.name,
      distanceKm,
      bearing,
      proximityPct,
      correct,
      ...(reveal ? { target: { id: target.id, name: target.name } } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[worldle/guess] error', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
