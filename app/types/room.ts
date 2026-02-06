export interface Mission {
    id: string;
    text: string;
    type: string;
    category: string;
    difficulty: string;
}

export interface PlayerMission {
    mission: Mission;
    type: 'START' | 'MID' | 'LATE';
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
    missions: any[];
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
    appearedAt: string | null;
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
    };
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
    missionChoiceCount: number;
    maxEventsPerGame: number;
    winnerTeam?: string | null;
    victoryBonusPoints: number;
    creatorToken?: string;
    players: Player[];
    codenameGame?: CodenameGame | null;
    roomEvents?: RoomEvent[];
}