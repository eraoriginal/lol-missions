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

export type ChoicesPayload = {
  choices: [string, string, string, string];
};
export type QuestionTextChoicesPayload = TextPayload & ChoicesPayload;
export type ImageQuestionChoicesPayload = ImageLikePayload & ChoicesPayload;

export type BooleanQuestionPayload = TextPayload;

// ------- Answers (jamais envoyé au client en phase "playing") -------

export type StringAnswer = { text: string; aliases?: string[] };
export type ChoiceIndexAnswer = { correctIndex: number };
export type BooleanAnswer = { value: boolean };

// Zodiac & MBTI : QCM 4 choix où le `text` est une description de personnalité
// et le sujet (`subject`) indique au joueur si la cible est un signe du zodiaque
// ou un type MBTI. Les `choices` sont les 4 labels (1 correct + 3 distractors)
// tirés au runtime à `start/route.ts` parmi le pool correspondant au sujet.
export type ZodiacMbtiPayload = {
  subject: 'zodiac' | 'mbti';
  text: string;
  choices: [string, string, string, string];
};

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
    | { type: 'text-question'; payload: TextPayload; answer: StringAnswer }
    | { type: 'expression'; payload: TextPayload; answer: StringAnswer }
    | { type: 'translation'; payload: TextPayload; answer: StringAnswer }
    | {
        type: 'zodiac-mbti';
        payload: ZodiacMbtiPayload;
        answer: ChoiceIndexAnswer;
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
    | { type: 'who-said'; payload: TextPayload; answer: StringAnswer }
    | { type: 'worldle'; payload: WorldlePayload; answer: WorldleAnswer }
    | { type: 'lol-champion'; payload: LolChampionPayload; answer: StringAnswer }
    | { type: 'acronyme-sigle'; payload: TextPayload; answer: StringAnswer }
    | {
        type: 'bouffe-internationale';
        payload: ImageQuestionChoicesPayload;
        answer: ChoiceIndexAnswer;
      }
    | {
        type: 'panneau-signalisation';
        payload: ImageQuestionChoicesPayload;
        answer: ChoiceIndexAnswer;
      }
    | {
        type: 'slogan-pub';
        payload: QuestionTextChoicesPayload;
        answer: ChoiceIndexAnswer;
      }
    | {
        type: 'know-era';
        payload: QuestionTextChoicesPayload;
        answer: ChoiceIndexAnswer;
      }
  );

// ------- Question publique (sans answer) : envoyée aux clients en "playing" -------

export type PublicQuestion = Omit<FullQuestion, 'answer'>;

// ------- Submitted answers (ce que le joueur envoie) -------

export type SubmittedText = { kind: 'text'; value: string };
export type SubmittedChoice = { kind: 'choice'; index: number };
export type SubmittedBoolean = { kind: 'boolean'; value: boolean };

export type SubmittedAnswer =
  | SubmittedText
  | SubmittedChoice
  | SubmittedBoolean
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
  pointsAwarded?: number;
  submittedAtMs?: number | null;
}

export type QuizCeoPhase = 'playing' | 'waiting_review' | 'review' | 'leaderboard';
