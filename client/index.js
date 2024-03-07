

let roomList = [];

socket.on('updateRoomList', (rooms) => {
    roomList = rooms;

    displayRoomList(rooms);
});

function displayRoomList(rooms) {
    const roomListElement = document.getElementById('roomList');
    roomListElement.innerHTML = '<h2>Lista de Salas</h2>';
    console.log(rooms)
    rooms.forEach(room => {
        console.log(room)
        roomListElement.innerHTML += `<button onclick="joinRoom('${room.id}')">${room.id} - ${room.playersCount}/2</button>`;
    });
}

function joinRoom(roomId) {
    console.log(roomId)
    if (roomId) {
        socket.emit('joinRoom', { roomId });
    } else {
        alert('Sala não encontrada. Por favor, verifique o ID da sala.');
    }
}

function createRoom() {
    socket.emit('createRoom');
}
