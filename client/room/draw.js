const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');


function leftGame(){
    window.location.href='../index.html';
}

function getClientId() {
    let playerId = localStorage.getItem('playerId');
    if (!playerId) {
        let queryString = window.location.search;
        let params = new URLSearchParams(queryString);
        playerId = params.get('playerId');
        if (!playerId) {
            window.location.href = '../index.html';
        }
    }
    
    return playerId;
}

function getRoomId() {
    let roomId = localStorage.getItem('roomId');
    if (!roomId) {
        let queryString = window.location.search;
        let params = new URLSearchParams(queryString);
        roomId = params.get('roomId');
        if (!roomId) {
            window.location.href = '../index.html';
        }
    }
    
    return roomId;
}

let playerId = getClientId();
let roomId = getRoomId();


socket.on('waitPlayer', (playersCount) => {
    drawWait(playersCount);
})
socket.on('readyPlayer', (playersCount) => {
    drawReady();
})
socket.on('gameState', (state) => {
    if (state.gameStatus == "started") {
        draw(state);
    } else if (state.gameStatus == "over") {
        drawOverGame(state);
    }
});

function drawWait(state) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'pink';
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.fillText("Aguarde todos os jogadores!", canvas.width / 2, canvas.height / 2 - 40);

    context.fillStyle = 'pink';
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.fillText(`Jogadores na sala: ${state.playersCount}`, canvas.width / 2, canvas.height / 2);
    context.closePath();
}
function drawReady() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'green';
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.fillText("Todos os jogadores conectador!", canvas.width / 2, canvas.height / 2 - 40);

    context.fillStyle = 'green';
    context.font = '25px Arial';
    context.textAlign = 'center';
    context.fillText(`Pressione W ou S para começar.`, canvas.width / 2, canvas.height / 2);
    context.closePath();
}

function drawOverGame(state) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'red';
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 40);

    context.fillStyle = 'red';
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.fillText(state.players[0].score + " - " + state.players[1].score, canvas.width / 2, canvas.height / 2);

    context.fillStyle = 'red';
    context.font = '18px Arial';
    context.textAlign = 'center';
    context.fillText(`Velocidade: ${1 + state.players[0].score + state.players[1].score}`, canvas.width / 2, canvas.height / 2 + 40);
    context.closePath();
}

function draw(state) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.strokeStyle = 'white';
    context.stroke();
    context.closePath();

    context.fillStyle = 'white';
    context.font = '18px Arial';
    context.textAlign = 'center';
    context.fillText(state.players[0].score + " - " + state.players[1].score, canvas.width / 2, 20);

    context.fillStyle = 'white';
    context.font = '18px Arial';
    context.textAlign = 'center';
    context.fillText(`Velocidade: ${1 + state.players[0].score + state.players[1].score}`, canvas.width / 2, canvas.height - 20);

    context.beginPath();
    context.arc(state.ball.x, state.ball.y, 10, 0, Math.PI * 2);
    context.fillStyle = 'white';
    context.fill();
    context.closePath();

    context.fillStyle = 'yellow';
    context.fillRect(35, state.players[0].paddle, 5, 80);

    context.fillStyle = 'green';
    context.fillRect(965, state.players[1].paddle, 5, 80);
}

function sendPlayerAction(action) {
    socket.emit('playerAction', action);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'w') {
        sendPlayerAction({ playerId, action: 'up' });
    } else if (event.key === 's') {
        sendPlayerAction({ playerId, action: 'down' });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    socket.emit('playerJoin', {roomId, playerId});
})