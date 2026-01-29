export interface Mission {
    id: string;
    text: string;
    type: string;
    category: string;
    difficulty: string;
}

export interface PlayerMission {
    mission: Mission;
    type: string;
}

export interface Player {
    id: string;
    name: string;
    token: string;
    missions: PlayerMission[];
}

export interface Room {
    id: string;
    code: string;
    gameStarted: boolean;
    gameStartTime: string | null;
    players: Player[];
}