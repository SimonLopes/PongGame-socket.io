// GameServer.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const RoomManager = require('../models/RoomManager');
const Player = require('../models/Player');

class GameServer {
    constructor(port) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server);
        this.roomManager = new RoomManager();
        
        this.app.use(express.static(path.join(__dirname, '../client')));
        this.PORT = port || 3000;

        this.io.on('connection', this.handleConnection.bind(this));
    }

    generateRoomId() {
        return Math.random().toString(36).substr(2, 10);
    }

    createRoom() {
        const roomId = this.generateRoomId();
        this.roomManager.createRoom(roomId)
        return roomId;
    }

    handleConnection(socket) {
        console.log(`New client connected: ${socket.id}`);

        socket.emit('updateRoomList', this.roomManager.getRoomList());

        socket.on('createRoom', (player, callback) => {
            const roomId = this.createRoom();

            this.io.emit('updateRoomList', this.roomManager.getRoomList());
            this.updateRoomList();
            callback(roomId);
        });

        socket.on('joinRoom', (room, callback) => {
            const roomId = room.roomId;
            const playerId = room.playerId;
            if (!this.roomManager.getRoom(roomId) && !playerId) {
                throw new Error(`No such room ${roomId}`);
            }
            if (this.roomManager.getRoom(roomId).playersCount >= 2) {
                callback({ status: 'error', title: 'Sala cheia', msg: 'Sala selecionada esta cheia!', roomId, playerId })
            } else {
                callback({ status: 'connected', title: 'Conectado', msg: 'Conectado a sala selecionada!', roomId, playerId })
            }
        });

        socket.on('playerJoin', (data) => {
            const roomId = data.roomId;
            const playerId = data.playerId;
            const roomInstance = this.roomManager.getRoom(roomId);
            roomInstance.addPlayer(new Player(playerId, socket.id));
            const playersCount = roomInstance.playersCount;
            socket.join(roomId);
            console.log(`Client ${socket.id}, id ${playerId} join in room ${roomId}`);
            this.verifyPlayers(roomId, playersCount);
            this.updateRoomList();
        });

        socket.on('playerAction', (action) => {
            const roomId = this.roomManager.findRoomByPlayerId(action.playerId);
            
            const room = this.roomManager.getRoom(roomId);
            if (!room) return;

            if (room.playersCount < 2) return;

            if (room.gameStatus === 'started') {
                this.updatePaddle(roomId, action.playerId, action.action);
            } else {
                room.gameStatus = 'started';
                room.velocity = 1;
                room.ball = { x: 500, y: 250, dx: 2, dy: 2 };
                room.players.forEach(player => {
                    player.score = 0;
                    player.paddle = 210;
                });
                this.gameLoop(roomId);
            }
        });

        socket.on('disconnect', () => {
            const roomId = this.roomManager.findRoomBySocketId(socket.id);
            if (roomId) {
                this.roomManager.removePlayer(socket.id);
                const room = this.roomManager.getRoom(roomId);
                if (room) {
                    socket.leave(roomId);
                    const playersCount = room.playersCount;
                    this.verifyPlayers(roomId, playersCount);
                }
                this.updateRoomList();
            }
            console.log('Client disconnected');
        });
    }

    verifyPlayers(roomId, playersCount) {
        if (playersCount < 2) {
            this.io.to(roomId).emit('waitPlayer', { playersCount });
            this.gameOver(roomId);
        } else {
            this.io.to(roomId).emit('readyPlayer', { playersCount });
        }
    }

    updateRoomList() {
        this.io.emit('updateRoomList', this.roomManager.getRoomList());
    }



    updatePaddle(roomId, playerId, action) {
        const playerIndex = this.roomManager.getPlayerIndexById(playerId, roomId);
        const room = this.roomManager.getRoom(roomId);
        if (action === 'up' && room.players[playerIndex].paddle > 0) {
            room.players[playerIndex].paddle -= 25;
        } else if (action === 'down' && room.players[playerIndex].paddle + 80 < 500) {
            room.players[playerIndex].paddle += 25;
        }
    }

    gameLoop(roomId) {
        const room = this.roomManager.getRoom(roomId);
        if (room.gameStatus == "started") {
            this.updateBall(roomId);
            this.io.to(roomId).emit('gameState', room);
            setTimeout(() => this.gameLoop(roomId), 1000 / 60);
        } else if (room.gameStatus == "over") {
            //status over
        }
    }

    updateBall(roomId) {
        const room = this.roomManager.getRoom(roomId);
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
                this.addScore(roomId, players[0].id);
                this.addVelocity(roomId);
                ball.dx = -ball.dx;
                ball.dx *= (1 + velocity / 50);
                ball.x = 45;
            }
        }
        if (ball.x + 10 > 965 && ball.y > players[1].paddle && ball.y < players[1].paddle + 80) {
            if (prevX < 965) {
                this.addScore(roomId, players[1].id);
                this.addVelocity(roomId);
                ball.dx = -ball.dx;
                ball.dx *= (1 + velocity / 50);
                ball.x = 955;
            }
        }
        if (ball.x - 10 < 0 || ball.x + 10 > 1000) {
            this.gameOver(roomId);
        }
    }

   

    addScore(roomId, playerId) {
        const room = this.roomManager.getRoom(roomId);
        if (!room) {
            throw new Error(`No such room ${roomId}`);
        } else {
            room.players.forEach(player => {
                if (player.id == playerId) {
                    player.score++;
                }
            });
        }
        return room.players;
    }

    addVelocity(roomId) {
        const room = this.roomManager.getRoom(roomId);
        if (!room) {
            throw new Error(`No such room ${roomId}`);
        } else {
            room.velocity++;
        }
        return room.velocity;
    }

    gameOver(roomId) {
        const room = this.roomManager.getRoom(roomId);
        if (!room) {
            throw new Error(`No such room ${roomId}`);
        } else {
            room.gameStatus = 'over';
        }
        return room;
    }
}

module.exports = GameServer;
