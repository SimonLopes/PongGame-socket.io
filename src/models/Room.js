// Room.js
class Room {
    constructor(id) {
        this.id = id;
        this.ball = { x: 500, y: 250, dx: 2, dy: 2 };
        this.gameStatus = 'over';
        this.velocity = 1;
        this.playersCount = 0;
        this.players = [];
    }

    addPlayer(player) {
        this.players.push(player);
        this.playersCount++;
    }

    getPlayerById(playerId) {
        return this.players.find((p) => p.id === playerId);
    }
}

module.exports = Room;
