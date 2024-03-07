socket.on('gameState', (state) => {
    draw(state);
});

socket.on('over', (state) => {
    drawOverGame(state);
});

function drawOverGame(state) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'red';
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 40);

    context.fillStyle = 'red';
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.fillText(state.scoreP1 + " - " + state.scoreP2, canvas.width / 2, canvas.height / 2);

    context.fillStyle = 'red';
    context.font = '18px Arial';
    context.textAlign = 'center';
    context.fillText(`Velocidade: ${1 + state.scoreP1 + state.scoreP2}`, canvas.width / 2, canvas.height / 2 + 40);
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
    context.fillText(state.scoreP1 + " - " + state.scoreP2, canvas.width / 2, 20);

    context.fillStyle = 'white';
    context.font = '18px Arial';
    context.textAlign = 'center';
    context.fillText(`Velocidade: ${1 + state.scoreP1 + state.scoreP2}`, canvas.width / 2, canvas.height - 20);

    context.beginPath();
    context.arc(state.ball.x, state.ball.y, 10, 0, Math.PI * 2);
    context.fillStyle = 'blue';
    context.fill();
    context.closePath();

    context.fillStyle = 'yellow';
    context.fillRect(35, state.players.player1.paddle, 5, 80);

    context.fillStyle = 'green';
    context.fillRect(965, state.players.player2.paddle, 5, 80);
}

function sendPlayerAction(action) {
    socket.emit('playerAction', action);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'w') {
        sendPlayerAction({ playerId: socket.id, action: 'up' });
    } else if (event.key === 's') {
        sendPlayerAction({ playerId: socket.id, action: 'down' });
    }
});