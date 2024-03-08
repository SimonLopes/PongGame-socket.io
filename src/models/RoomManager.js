const Room = require('./Room');

class RoomManager {
    constructor() {
        this.rooms = {};
    }

    createRoom(id) {
        this.rooms[id] = new Room(id);
    }

    removeRoom(id) {
        delete this.rooms[id];
    }

    getRoom(id) {
        return this.rooms[id];
    }

    getRoomList() {
        return Object.values(this.rooms).map(room => ({ id: room.id, playersCount: room.playersCount }));
    }

    removePlayer(socketId) {
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            const indexToRemove = room.players.findIndex((p) => p.socketId === socketId);
            if (indexToRemove !== -1) {
                room.players.splice(indexToRemove, 1);
                room.playersCount--;
                if (room.playersCount === 0) {
                    delete this.rooms[roomId];
                }
                break;
            }
        }
    }

    findRoomBySocketId(socketId) {
        for (const roomId in this.rooms) {
            const players = this.rooms[roomId].players;
            for (const player of players) {
                if (player.socketId == socketId) {
                    return roomId;
                }
            }
        }
        return null;
    }

    findRoomByPlayerId(playerId) {
        for (const roomId in this.rooms) {
            const players = this.rooms[roomId].players;
            for (const player of players) {
                if (player.id === playerId) {
                    return roomId;
                }
            }
        }
        return null;
    }

    getPlayerIndexById(playerId, roomId) {
        
        return this.rooms[roomId].players.findIndex((p) => p.id == playerId);
    }
}

module.exports = RoomManager;