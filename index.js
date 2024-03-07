const express = require('express');
const http = require('http');

const path = require('path');

const app = express();
const server = http.createServer(app);
const io = require('./server/connection').connectSocket(server);

const { addScore, addVelocity, gameOver, updateBall, updatePaddle, gameLoop, gameInit } = require('./server/game/game')
const { findPlayer, getPlayerIndexById, verifyPlayers } = require('./server/players/player')
const { generateRoomId, createRoom, joinRoom, leftRoom, getRoomList, findRoomByPlayerId, findRoomBySocketId, updateRoomList } = require('./server/rooms/room')
const { rooms } = require('./server/rooms/roomsData')

app.use(express.static(path.join(__dirname, 'client')));

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {

  console.log(`New client connected: ${socket.id}`);

  socket.emit('updateRoomList', getRoomList());

  socket.on('createRoom', (player, callback) => {
    const roomId = createRoom();
    updateRoomList(io);
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

    verifyPlayers(roomId, playersCount, io);
    updateRoomList(io);
  })

  socket.on('playerAction', (action) => {
    const roomId = findRoomByPlayerId(action.playerId);
    let playersCount = rooms[roomId].playersCount

    if (playersCount < 2) return;

    if (rooms[roomId].gameStatus == "started") {
      updatePaddle(action.playerId, action.action);
    } else {
      gameInit(roomId)
      gameLoop(roomId, io);
    }
  });

  socket.on('disconnect', () => {
    let roomId = findRoomBySocketId(socket.id);

    if (roomId) {

      leftRoom(roomId, socket.id);
      socket.leave(roomId)

      let playersCount = rooms[roomId].playersCount

      verifyPlayers(roomId, playersCount, io);
      updateRoomList(io);

    }
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
