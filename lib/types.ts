import { Room, Player, Mission, PlayerMission } from '@prisma/client';

export type RoomWithPlayers = Room & {
    players: (Player & {
        missions: (PlayerMission & {
            mission: Mission;
        })[];
    })[];
};

export interface CreateRoomResponse {
    room: Room;
    creatorToken: string;
}

export interface JoinRoomResponse {
    player: Player;
    room: RoomWithPlayers;
}

export interface SSEEvent {
    type: 'player-joined' | 'player-left' | 'game-started' | 'mission-assigned' | 'timer-update';
    data: Record<string, unknown>;
}