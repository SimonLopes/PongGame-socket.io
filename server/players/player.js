const { rooms } = require('../rooms/roomsData')

function findPlayer(playerId) {
    for (const roomId in rooms) {
        const room = rooms[roomId];
        for (const playerKey in room.players) {
            const player = room.players[playerKey];
            if (player.id === playerId) {
                return player;
            }
        }
    }
    return null;
}

function getPlayerIndexById(playerId, roomId) {
    return rooms[roomId].players.findIndex((p) => p.id == playerId);
}

function verifyPlayers(roomId, playersCount, io) {
    
    if (playersCount < 2) {
        io.to(roomId).emit('waitPlayer', { playersCount });
        rooms[roomId].gameStatus = 'over';
        return rooms[roomId];
    } else {
        io.to(roomId).emit('readyPlayer', { playersCount });
    }
}

module.exports = {
    findPlayer,
    getPlayerIndexById,
    verifyPlayers,
}