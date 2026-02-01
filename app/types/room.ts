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

export interface Player {
    id: string;
    name: string;
    token: string;
    avatar: string;
    team: string;
    role: string | null;
    missions: any[];
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

export interface Room {
    id: string;
    code: string;
    gameType: string;
    gameStarted: boolean;
    gameStartTime: string | null;
    gameStopped: boolean;
    midMissionDelay: number;
    lateMissionDelay: number;
    creatorToken?: string;
    players: Player[];
    codenameGame?: CodenameGame | null;
}