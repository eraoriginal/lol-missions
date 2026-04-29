export interface Mission {
    id: string;
    text: string;
    type: string;
    category: string;
    difficulty: string;
    points: number;
    isPrivate: boolean;
}

export interface PlayerMission {
    mission: Mission;
    type: 'START' | 'MID' | 'LATE';
    validated: boolean;
    decided: boolean;
    pointsEarned: number;
    resolvedText?: string;
}

export interface PendingChoice {
    id: string;
    mission: Mission;
    type: 'START' | 'MID' | 'LATE';
    resolvedText?: string | null;
}

export interface Player {
    id: string;
    name: string;
    token: string;
    avatar: string;
    team: string;
    role: string | null;
    beatEikichiWeaponId?: string | null;
    missions: PlayerMission[];
    pendingChoices?: PendingChoice[];
}

export interface CodenameCard {
    id: string;
    word: string;
    color: string;
    category?: string | null;
    revealed: boolean;
    position: number;
}

export interface CodenameGame {
    id: string;
    currentTeam: string;
    redRemaining: number;
    blueRemaining: number;
    gameOver: boolean;
    winner: string | null;
    currentClue: string | null;
    currentNumber: number | null;
    guessesLeft: number;
    cards: CodenameCard[];
}

export interface RoomEvent {
    id: string;
    scheduledAt: number;
    resolvedText: string | null;
    appearedAt: string | null;
    endedAt: string | null;
    redValidated: boolean;
    blueValidated: boolean;
    redDecided: boolean;
    blueDecided: boolean;
    pointsEarnedRed: number;
    pointsEarnedBlue: number;
    event: {
        id: string;
        text: string;
        type: string;
        category: string;
        difficulty: string;
        points: number;
        duration: number;
        music: string | null;
    };
}

export interface BetType {
    id: string;
    text: string;
    category: string;
}

export interface PlayerBet {
    id: string;
    playerId: string;
    playerName: string;
    playerTeam: string;
    betType: BetType;
    targetPlayerName: string;
    targetPlayerId: string;
    points: number;
    validated: boolean;
    decided: boolean;
}

export interface BeatEikichiQuestion {
    position: number;
    gameId: string;
    /** Name est retiré de la réponse API pendant la phase playing (anti-spoil via devtools). */
    name?: string;
    aliases?: string[];
    imageUrl: string;
    /** Indices, exposés uniquement si beatEikichiHintsEnabled est vrai. */
    hintGenre?: string | null;
    hintTerm?: string | null;
    hintPlatforms?: string | null;
}

export interface BeatEikichiPlayerAnswer {
    position: number;
    submittedText: string;
    correct: boolean;
    answeredAtMs: number | null;
}

export interface BeatEikichiPlayerState {
    id: string;
    playerId: string;
    currentTyping: string;
    answers: BeatEikichiPlayerAnswer[];
    score: number;
    weaponId: string | null;
    weaponUsesLeft: number;
    lastUsedQuestionIndex: number;
    shieldUsesLeft: number;
    /** Mode "all-vs-eikichi" UNIQUEMENT, et UNIQUEMENT pour le Eikichi.
     * Map { weaponId: usesLeft } — initialisée à 12 entrées × 3 au /start.
     * `null` ailleurs (mode standard ou non-Eikichi). */
    weaponStacks?: Record<string, number> | null;
}

export interface BeatEikichiWeaponEvent {
    id: string;
    firedByPlayerId: string;
    targetPlayerId: string;
    weaponId: string;
    /**
     * Index de la question à laquelle l'effet s'applique (différé d'une question
     * après le tir : questionIndex = currentIndex_when_fired + 1).
     */
    questionIndex: number;
    firedAt: string;
    data?: Record<string, unknown> | null;
}

export type BeatEikichiPhase = 'playing' | 'review_intro' | 'review' | 'leaderboard';

export interface BeatEikichiGame {
    id: string;
    questions: BeatEikichiQuestion[];
    phase: BeatEikichiPhase;
    currentIndex: number;
    questionStartedAt: string | null;
    eikichiPlayerId: string | null;
    timerSeconds: number;
    mode: 'standard' | 'all-vs-eikichi';
    playerStates: BeatEikichiPlayerState[];
    weaponEvents?: BeatEikichiWeaponEvent[];
}

// ------- Le Quiz du CEO -------

export type QuizCeoPhase = 'playing' | 'waiting_review' | 'review' | 'leaderboard';

export interface QuizCeoSubmittedText { kind: 'text'; value: string }
export interface QuizCeoSubmittedChoice { kind: 'choice'; index: number }
export interface QuizCeoSubmittedBoolean { kind: 'boolean'; value: boolean }
export type QuizCeoSubmitted =
    | QuizCeoSubmittedText
    | QuizCeoSubmittedChoice
    | QuizCeoSubmittedBoolean
    | null;

export interface QuizCeoPlayerAnswer {
    position: number;
    type: string;
    submitted: QuizCeoSubmitted;
    validated?: boolean;
    pointsAwarded?: number;
    submittedAtMs?: number | null;
}

export interface QuizCeoPlayerState {
    id: string;
    playerId: string;
    answers: QuizCeoPlayerAnswer[];
    score: number;
}

// Question publique envoyée aux clients — `answer` est strippé pendant "playing".
// Les payloads sont type-dépendants ; on laisse `payload` en `Record<string, unknown>`
// côté frontend, les composants narrow selon le type.
export interface QuizCeoQuestion {
    id: string;
    type: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    prompt: string;
    payload: Record<string, unknown>;
    answer?: Record<string, unknown>;
}

export interface QuizCeoGame {
    id: string;
    questions: QuizCeoQuestion[];
    phase: QuizCeoPhase;
    currentIndex: number;
    questionStartedAt: string | null;
    timerSeconds: number;
    playerStates: QuizCeoPlayerState[];
}

export interface Room {
    id: string;
    code: string;
    gameType: string;
    gameStarted: boolean;
    gameStartTime: string | null;
    gameStopped: boolean;
    midMissionDelay: number;
    lateMissionDelay: number;
    missionVisibility: 'all' | 'team' | 'hidden';
    gameMap: string;
    victoryBonus: boolean;
    betsEnabled: boolean;
    missionChoiceCount: number;
    maxEventsPerGame: number;
    eventPausedAt: string | null;
    totalPausedDuration: number;
    winnerTeam?: string | null;
    victoryBonusPoints: number;
    creatorToken?: string;
    beatEikichiEikichiId?: string | null;
    beatEikichiHintsEnabled?: boolean;
    beatEikichiTimerSeconds?: number;
    beatEikichiMode?: 'standard' | 'all-vs-eikichi';
    quizCeoTimerSeconds?: number;
    quizCeoQuestionCount?: number;
    quizCeoDisabledTypes?: string[];
    players: Player[];
    codenameGame?: CodenameGame | null;
    beatEikichiGame?: BeatEikichiGame | null;
    quizCeoGame?: QuizCeoGame | null;
    roomEvents?: RoomEvent[];
    playerBets?: PlayerBet[];
}