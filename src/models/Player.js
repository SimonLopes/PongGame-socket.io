// Player.js
class Player {
    constructor(id, socketId) {
        this.id = id;
        this.name = 'Player' + id;
        this.score = 0;
        this.paddle = 210;
        this.socketId = socketId;
        this.ai = false;
    }
}

module.exports = Player;
