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
    name: string;
    aliases: string[];
    imageUrl: string;
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
}

export type BeatEikichiPhase = 'playing' | 'review_intro' | 'review' | 'leaderboard';

export interface BeatEikichiGame {
    id: string;
    questions: BeatEikichiQuestion[];
    phase: BeatEikichiPhase;
    currentIndex: number;
    questionStartedAt: string | null;
    eikichiPlayerId: string | null;
    playerStates: BeatEikichiPlayerState[];
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
    players: Player[];
    codenameGame?: CodenameGame | null;
    beatEikichiGame?: BeatEikichiGame | null;
    roomEvents?: RoomEvent[];
    playerBets?: PlayerBet[];
}