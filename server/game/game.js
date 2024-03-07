const { rooms } = require('../rooms/roomsData')

const { findPlayer, getPlayerIndexById } = require('../players/player')
const { generateRoomId, createRoom, joinRoom, leftRoom, getRoomList, findRoomByPlayerId, findRoomBySocketId } = require('../rooms/room')


function addScore(roomId, playerId) {
    if (!rooms[roomId]) {
        throw new Error(`No such room ${roomId}`);
    } else {

        rooms[roomId].players.forEach(player => {
            if (player.id == playerId) {
                player.score++;
            }
        });
    }
    return rooms[roomId].players;
}

function addVelocity(roomId) {
    if (!rooms[roomId]) {
        throw new Error(`No such room ${roomId}`);
    } else {
        rooms[roomId].velocity++;
    }
    return rooms[roomId].velocity;
}

function gameOver(roomId) {
    if (!rooms[roomId]) {
        throw new Error(`No such room ${roomId}`);
    } else {
        rooms[roomId].gameStatus = 'over';
    }
    return rooms[roomId];
}

function updateBall(roomId) {
    const room = rooms[roomId];
    let { players, ball, gameStatus, velocity } = room;
    let prevX = ball.x;
    let prevY = ball.y;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y - 10 < 0 || ball.y + 10 > 500) {
        ball.dy = -ball.dy;
    }

    if (ball.x - 10 < 35 && ball.y > players[0].paddle && ball.y < players[0].paddle + 80) {
        if (prevX > 35) {
            addScore(roomId, players[0].id)
            addVelocity(roomId)
            ball.dx = -ball.dx;
            ball.dx *= (1 + velocity / 50);
            ball.x = 45;
        }
    }
    if (ball.x + 10 > 965 && ball.y > players[1].paddle && ball.y < players[1].paddle + 80) {
        if (prevX < 965) {
            addScore(roomId, players[1].id)
            addVelocity(roomId)
            ball.dx = -ball.dx;
            ball.dx *= (1 + velocity / 50);
            ball.x = 955;
        }
    }

    if (ball.x - 10 < 0 || ball.x + 10 > 1000) {
        gameOver(roomId);
    }
}

function updatePaddle(playerId, action) {
    let roomId = findRoomByPlayerId(playerId);
    let playerIndex = getPlayerIndexById(playerId, roomId);

    if (action === 'up' && rooms[roomId].players[playerIndex].paddle > 0) {
        rooms[roomId].players[playerIndex].paddle -= 25;
    } else if (action === 'down' && rooms[roomId].players[playerIndex].paddle + 80 < 500) {
        rooms[roomId].players[playerIndex].paddle += 25;
    }

}

function gameLoop(roomId, io) {
    if (rooms[roomId].gameStatus == "started") {
        updateBall(roomId);
        io.to(roomId).emit('gameState', rooms[roomId]);
        setTimeout(() => gameLoop(roomId, io), 1000 / 60);
    } else if (rooms[roomId].gameStatus == "over") {

    }


};

function gameInit(roomId) {
    rooms[roomId].gameStatus = "started";
    rooms[roomId].velocity = 1;
    rooms[roomId].ball = { x: 500, y: 250, dx: 2, dy: 2 };

    rooms[roomId].players.forEach(player => {
        player.score = 0;
        player.paddle = 210
    });
}

module.exports = {
    addScore,
    addVelocity,
    gameOver,
    updateBall,
    updatePaddle,
    gameLoop,
    gameInit
}

