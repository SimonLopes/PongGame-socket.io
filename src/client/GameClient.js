
class GameClient {
    constructor() {
        this.socket = io();
        this.canvas = document.getElementById('gameCanvas');
        this.context = this.canvas.getContext('2d');
        this.playerId = this.getClientId();
        this.roomId = this.getRoomId();
        this.init();

        document.addEventListener('keydown', (event) => {
            if (event.key === 'w') {
                this.sendPlayerAction('up');
            } else if (event.key === 's') {
                this.sendPlayerAction('down');
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            this.socket.emit('playerJoin', {roomId: this.roomId, playerId: this.playerId});
        });
    }

    init() {
        this.socket.on('waitPlayer', (playersCount) => this.drawWait(playersCount.playersCount));
        this.socket.on('readyPlayer', () => this.drawReady());
        this.socket.on('gameState', (state) => {
            if (state.gameStatus == "started"){
                this.draw(state);
            } else if (state.gameStatus == "over"){
                this.drawOverGame(state);
            }
        });
    }

    getClientId() {
        let playerId = localStorage.getItem('playerId');
        if (!playerId) {
            const queryString = window.location.search;
            const params = new URLSearchParams(queryString);
            playerId = params.get('playerId');
            if (!playerId) {
                window.location.href = '../index.html';
            }
        }
        return playerId;
    }

    getRoomId() {
        let roomId = localStorage.getItem('roomId');
        if (!roomId) {
            const queryString = window.location.search;
            const params = new URLSearchParams(queryString);
            roomId = params.get('roomId');
            if (!roomId) {
                window.location.href = '../index.html';
            }
        }
        return roomId;
    }

    sendPlayerAction(action) {
        this.socket.emit('playerAction', { playerId: this.playerId, action });
    }

    drawWait(playersCount) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = 'pink';
        this.context.font = '30px Arial';
        this.context.textAlign = 'center';
        this.context.fillText("Aguarde todos os jogadores!", this.canvas.width / 2, this.canvas.height / 2 - 40);

        this.context.fillStyle = 'pink';
        this.context.font = '30px Arial';
        this.context.textAlign = 'center';
        this.context.fillText(`Jogadores na sala: ${playersCount}`, this.canvas.width / 2, this.canvas.height / 2);
        this.context.closePath();
    }

    drawReady() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'green';
        this.context.font = '30px Arial';
        this.context.textAlign = 'center';
        this.context.fillText("Todos os jogadores conectador!", this.canvas.width / 2, this.canvas.height / 2 - 40);
        this.context.fillStyle = 'green';
        this.context.font = '25px Arial';
        this.context.textAlign = 'center';
        this.context.fillText(`Pressione W ou S para começar.`, this.canvas.width / 2, this.canvas.height / 2);
        this.context.closePath();
    }

    draw(state) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.beginPath();
        this.context.moveTo(this.canvas.width / 2, 0);
        this.context.lineTo(this.canvas.width / 2, this.canvas.height);
        this.context.strokeStyle = 'white';
        this.context.stroke();
        this.context.closePath();
        this.context.fillStyle = 'white';
        this.context.font = '18px Arial';
        this.context.textAlign = 'center';
        this.context.fillText(state.players[0].score + " - " + state.players[1].score, this.canvas.width / 2, 20);
        this.context.fillStyle = 'white';
        this.context.font = '18px Arial';
        this.context.textAlign = 'center';
        this.context.fillText(`Velocidade: ${1 + state.players[0].score + state.players[1].score}`, this.canvas.width / 2, this.canvas.height - 20);
        this.context.beginPath();
        this.context.arc(state.ball.x, state.ball.y, 10, 0, Math.PI * 2);
        this.context.fillStyle = 'white';
        this.context.fill();
        this.context.closePath();
        this.context.fillStyle = 'yellow';
        this.context.fillRect(35, state.players[0].paddle, 5, 80);
        this.context.fillStyle = 'green';
        this.context.fillRect(965, state.players[1].paddle, 5, 80);
    }

    drawOverGame(state) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'red';
        this.context.font = '30px Arial';
        this.context.textAlign = 'center';
        this.context.fillText("Game Over!", this.canvas.width / 2, this.canvas.height / 2 - 40);
        this.context.fillStyle = 'red';
        this.context.font = '30px Arial';
        this.context.textAlign = 'center';
        this.context.fillText(state.players[0].score + " - " + state.players[1].score, this.canvas.width / 2, this.canvas.height / 2);
        this.context.fillStyle = 'red';
        this.context.font = '18px Arial';
        this.context.textAlign = 'center';
        this.context.fillText(`Velocidade: ${1 + state.players[0].score + state.players[1].score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.context.closePath();
    }
}

new GameClient();
