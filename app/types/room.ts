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
    missions: any[];
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
}