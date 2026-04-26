/**
 * Types des payloads et réponses par type de question.
 *
 * Chaque question en DB a :
 *   - type : QuestionTypeId
 *   - payload : dépend du type (voir union ci-dessous)
 *   - answer  : dépend du type — strippée côté API pendant la phase "playing"
 *
 * Les noms `payload` / `answer` sont identiques au schema Prisma (JSON).
 */

import type { QuestionTypeId, Difficulty } from './config';
import type { LolChampionPayload } from './lolChampion';
import type { LolMatchCardData } from './lolMatchCard';

// ------- Payloads (ce que le joueur voit) -------

export type ImageLikePayload = { imageUrl: string };
export type TextPayload = { text: string };
export type AudioPayload = { audioUrl: string };

export type ChoicesPayload = {
  choices: [string, string, string, string];
};
export type QuestionTextChoicesPayload = TextPayload & ChoicesPayload;

export type BooleanQuestionPayload = TextPayload;

export type RankingItem = { id: string; url: string; label: string };
export type RankingPayload = {
  // Dans le payload envoyé aux joueurs, l'ordre n'est PAS la solution : on
  // mélange côté client. L'ordre correct est côté answer.
  items: RankingItem[];
  // Ordre aléatoire initial (indices correspondant à items). Tiré au /start.
  shuffledOrder: string[];
};

// ------- Answers (jamais envoyé au client en phase "playing") -------

export type StringAnswer = { text: string; aliases?: string[] };
export type MusicAnswer = {
  artist: string;
  title: string;
  artistAliases?: string[];
  titleAliases?: string[];
};
export type ChoiceIndexAnswer = { correctIndex: number };
export type OddIndexAnswer = { oddIndex: number };
export type BooleanAnswer = { value: boolean };
export type PriceAnswer = { value: number; tolerancePct?: number };
export type RankingAnswer = { order: string[] }; // ids dans l'ordre correct

// Worldle : la silhouette est le payload, l'identité du pays est l'answer —
// strippée pendant playing. Pas de lat/lng (champs solo Worldle uniquement).
// Pas d'aliases : la validation Quiz CEO est manuelle par le créateur.
export type WorldlePayload = { imageUrl: string };
export type WorldleAnswer = {
  countryId: string;
  countryName: string;
};

// ------- Union des questions (avec answer) : côté serveur -------

export interface BaseQuestion {
  id: string;
  type: QuestionTypeId;
  difficulty: Difficulty;
  points: number;
  prompt: string;
}

export type FullQuestion = BaseQuestion &
  (
    | { type: 'image-personality'; payload: ImageLikePayload; answer: StringAnswer }
    | { type: 'text-question'; payload: TextPayload; answer: StringAnswer }
    | { type: 'expression'; payload: TextPayload; answer: StringAnswer }
    | { type: 'music'; payload: AudioPayload; answer: MusicAnswer }
    | { type: 'translation'; payload: TextPayload; answer: StringAnswer }
    | {
        type: 'multiple-choice';
        payload: QuestionTextChoicesPayload;
        answer: ChoiceIndexAnswer;
      }
    | {
        type: 'odd-one-out';
        payload: QuestionTextChoicesPayload;
        answer: OddIndexAnswer;
      }
    | {
        type: 'lol-player-match';
        payload: LolMatchCardData & {
          choices: [string, string, string, string];
        };
        answer: ChoiceIndexAnswer;
      }
    | { type: 'country-motto'; payload: TextPayload; answer: StringAnswer }
    | { type: 'brand-logo'; payload: ImageLikePayload; answer: StringAnswer }
    | {
        type: 'absurd-law';
        payload: BooleanQuestionPayload;
        answer: BooleanAnswer;
      }
    | { type: 'price'; payload: ImageLikePayload; answer: PriceAnswer }
    | { type: 'who-said'; payload: TextPayload; answer: StringAnswer }
    | { type: 'ranking'; payload: RankingPayload; answer: RankingAnswer }
    | { type: 'worldle'; payload: WorldlePayload; answer: WorldleAnswer }
    | { type: 'lol-champion'; payload: LolChampionPayload; answer: StringAnswer }
  );

// ------- Question publique (sans answer) : envoyée aux clients en "playing" -------

export type PublicQuestion = Omit<FullQuestion, 'answer'>;

// ------- Submitted answers (ce que le joueur envoie) -------

export type SubmittedText = { kind: 'text'; value: string };
export type SubmittedMusic = { kind: 'music'; value: string }; // champ unique saisi
export type SubmittedChoice = { kind: 'choice'; index: number };
export type SubmittedBoolean = { kind: 'boolean'; value: boolean };
export type SubmittedPrice = { kind: 'price'; value: number };
export type SubmittedRanking = { kind: 'ranking'; order: string[] };

export type SubmittedAnswer =
  | SubmittedText
  | SubmittedMusic
  | SubmittedChoice
  | SubmittedBoolean
  | SubmittedPrice
  | SubmittedRanking
  | null;
// Note : pour la question Worldle, le joueur soumet un `SubmittedText`
// (le nom du pays) — une seule réponse, validée par le créateur en review.

// ------- Entrée dans le PlayerState.answers[] -------

export interface PlayerAnswerEntry {
  position: number;
  type: QuestionTypeId;
  submitted: SubmittedAnswer;
  // Validation par le créateur pendant la review.
  validated?: boolean;
  validatedArtist?: boolean; // type "music" uniquement
  validatedTitle?: boolean; // type "music" uniquement
  pointsAwarded?: number;
  submittedAtMs?: number | null;
}

export type QuizCeoPhase = 'playing' | 'waiting_review' | 'review' | 'leaderboard';
