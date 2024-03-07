const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'client')));

const PORT = process.env.PORT || 3000;

const rooms = {};

/*
{
  id: {
    id: id,
    ball: { x: 500, y: 250, dx: 2, dy: 2 },
    gameStatus: 'started',
    velocity: 1,
    playersCount: 0,
    players: [
      {
        id: 'xxxx',
        name: 'xxx',
        score: 0,
        paddle: 210,
        ai: false
      }
    ]
  }
}
*/

//gerar ID aleatorio para a  sala
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
  console.log("mmm")
  console.log(rooms[roomId])
  if (indexToRemove !== -1) {
    rooms[roomId].playersCount--;
    return rooms[roomId].players.splice(indexToRemove, 1)[0];
  } else {
    console.log('Error in leaving the room');
  }
};

function getRoomList(socket) {
  let roomList = []
  for (let r in rooms) {
    roomList.push({ id: rooms[r].id, playersCount: rooms[r].playersCount });
  }
  return roomList;
};

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

function gameLoop(roomId) {
  if (rooms[roomId].gameStatus == "started") {
    updateBall(roomId);
    io.to(roomId).emit('gameState', rooms[roomId]);
    setTimeout(() => gameLoop(roomId), 1000 / 60);
  } else if (rooms[roomId].gameStatus == "over") {

  }


};

io.on('connection', (socket) => {

  function verifyPlayers(roomId, playersCount) {
    if (playersCount < 2) {
      io.to(roomId).emit('waitPlayer', { playersCount });
      gameOver(roomId);
    } else {
      io.to(roomId).emit('readyPlayer', { playersCount });
    }
  }

  function updateRoomList(){
    io.emit('updateRoomList', getRoomList());
  }
  console.log(`New client connected: ${socket.id}`);

  socket.emit('updateRoomList', getRoomList());

  socket.on('createRoom', (player, callback) => {
    const roomId = createRoom();

    updateRoomList();
    callback(roomId);
  });

  socket.on('joinRoom', (room) => {
    let roomId = room.roomId
    let playerId = room.playerId
    if (!rooms[roomId] && !playerId) {
      throw new Error(`No such room ${roomId}`);
    }
    if (rooms[roomId].playersCount >= 2) {
      io.to(roomId).emit('errorRoom', { msg: 'Sala esta cheia' })
    } else {


    }
  });

  socket.on('playerJoin', (data) => {
    let roomId = data.roomId;
    let playerId = data.playerId;

    joinRoom(roomId, playerId, socket.id);

    let playersCount = rooms[roomId].playersCount

    socket.join(roomId);
    console.log(`Client ${socket.id}, id ${playerId} join in room ${roomId}`)

    verifyPlayers(roomId, playersCount);
    updateRoomList();
  })

  socket.on('playerAction', (action) => {
    const roomId = findRoomByPlayerId(action.playerId);

    if (rooms[roomId].gameStatus == "started") {
      updatePaddle(action.playerId, action.action);
    } else {
      rooms[roomId].gameStatus = "started";
      rooms[roomId].velocity = 1;
      rooms[roomId].ball = { x: 500, y: 250, dx: 2, dy: 2 };

      rooms[roomId].players.forEach(player => {
        player.score = 0;
        player.paddle = 210
      });
      gameLoop(roomId);
    }
  });

  socket.on('disconnect', () => {
    let roomId = findRoomBySocketId(socket.id);

    if (roomId) {
      

      leftRoom(roomId, socket.id);
      socket.leave(roomId)

      let playersCount = rooms[roomId].playersCount

      verifyPlayers(roomId, playersCount);
      updateRoomList();
      
    }
    console.log('Client disconnected');
  });

});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  //console.log(createRoom())
});
