
let roomList = [];

function openModal(title, msg) {
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";
    $("#modal-title").text(title)
    $("#modal-msg").text(msg)
}
function closeModal(){
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}
window.onclick = function (event) {
    var modal = document.getElementById("myModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
function generateClientId() {
    return Math.random().toString(36).substr(2, 15);
}

function setClientId() {
    let playerId = generateClientId()
    localStorage.setItem('playerId', playerId);
    return playerId;
}
function setRoomId(roomId) {
    localStorage.setItem('roomId', roomId);
    return roomId;
}

function redirectToRoom(roomId, playerId) {
    let params = {
        'roomId': roomId,
        'playerId': playerId
    }

    let queryString = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');
    let urlWithParams = `/room/game.html?${queryString}`;
    console.log(urlWithParams);

    window.location.href = urlWithParams;
}

function displayRoomList(rooms) {
    const roomListElement = document.getElementById('roomList');
    roomListElement.innerHTML = '';
    rooms.forEach(room => {
        let listItem = document.createElement('li');
        let roomLink = document.createElement('a');
        roomLink.classList.add('room-link');

        // Criando elementos span para o ID da sala e a quantidade de jogadores
        let roomIdSpan = document.createElement('span');
        roomIdSpan.textContent = `${room.id}`;
        roomIdSpan.classList.add('room-id');
        roomLink.appendChild(roomIdSpan);

        let playersCountSpan = document.createElement('span');
        playersCountSpan.textContent = `${room.playersCount}/2`;
        playersCountSpan.classList.add('players-count');
        roomLink.appendChild(playersCountSpan);

        // Adicionando evento de clique ao link
        roomLink.onclick = () => joinRoom(room.id);

        listItem.appendChild(roomLink);
        roomListElement.appendChild(listItem);
    });
}

function joinRoom(roomId) {
    if (roomId) {
        let playerId = setClientId();
        setRoomId(roomId);

        socket.emit('joinRoom', { roomId, playerId }, (callback) => {
            console.log(callback)
            if (!callback) return;
            if(callback.status == 'connected'){
                redirectToRoom(callback.roomId, callback.playerId)
            } else if (callback.status == 'error'){
                openModal(callback.title, callback.msg);
            }
        });
    } else {
        alert('Sala não encontrada. Por favor, verifique o ID da sala.');
    }
}

function createRoom() {
    let playerId = setClientId();
    socket.emit('createRoom', { playerId }, (roomId) => {
        joinRoom(roomId)
    });
}

socket.on('updateRoomList', (rooms) => {
    roomList = rooms;

    displayRoomList(rooms);
});