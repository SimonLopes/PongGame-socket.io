const { rooms } = require('./roomsData')

function generateRoomId() {
    return Math.random().toString(36).substr(2, 10);
}

//criar a sala
function createRoom() {
    let roomId = generateRoomId();
    //estrutura inicial da sala
    rooms[roomId] = {
        id: roomId,
        ball: { x: 500, y: 250, dx: 2, dy: 2 },
        gameStatus: 'over',
        velocity: 1,
        playersCount: 0,
        players: []
    }
    return roomId;
}

//adiciona um jogador na sala
function joinRoom(roomId, playerId, socketId) {
    if (!rooms[roomId]) {
        throw new Error(`No such room ${roomId}`);
    } else {
        //estrutura inicial do jogador
        rooms[roomId].players.push({
            socketId: socketId,
            id: playerId,
            name: 'Player' + playerId,
            score: 0,
            paddle: 210,
            ai: false
        });
        rooms[roomId].playersCount++;
    }
    return rooms[roomId];
};

//remover jogador de uma sala
function leftRoom(roomId, socketId) {
    let indexToRemove = rooms[roomId].players.findIndex((p) => p.socketId === socketId);
    if (indexToRemove !== -1) {
        rooms[roomId].playersCount--;
        return rooms[roomId].players.splice(indexToRemove, 1)[0];
    } else {
        console.log('Error in leaving the room');
    }
};

function getRoomList() {
    let roomList = []
    for (let r in rooms) {
        roomList.push({ id: rooms[r].id, playersCount: rooms[r].playersCount });
    }
    return roomList;
};

function updateRoomList(io){
    io.emit('updateRoomList', getRoomList());
  }

function findRoomBySocketId(socketId) {
    for (let roomId in rooms) {
        var players = rooms[roomId].players;
        for (const player of players) {
            if (player.socketId == socketId) {
                return roomId;
            }
        }
    }
    return null;
};
function findRoomByPlayerId(playerId) {
    for (let roomId in rooms) {
        var players = rooms[roomId].players;
        for (const player of players) {
            if (player.id === playerId) {
                return roomId;
            }
        }
    }
    return null;
};

module.exports = {
    generateRoomId,
    createRoom,
    joinRoom,
    leftRoom,
    getRoomList,
    findRoomByPlayerId,
    findRoomBySocketId,
    updateRoomList
}