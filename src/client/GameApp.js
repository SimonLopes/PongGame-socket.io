// index.js
class GameApp {
    constructor() {
        this.socket = io();
        this.roomList = [];
        this.modal = document.getElementById("myModal");
    }

    openModal(title, msg) {
        this.modal.style.display = "block";
        document.getElementById("modal-title").textContent = title;
        document.getElementById("modal-msg").textContent = msg;
    }

    closeModal() {
        this.modal.style.display = "none";
    }

    redirectToRoom(roomId, playerId) {
        const params = { 'roomId': roomId, 'playerId': playerId };
        const queryString = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');
        const urlWithParams = `/room/game.html?${queryString}`;
        window.location.href = urlWithParams;
    }

    displayRoomList(rooms) {
        const roomListElement = document.getElementById('roomList');
        roomListElement.innerHTML = '';
        rooms.forEach(room => {
            const listItem = document.createElement('li');
            const roomLink = document.createElement('a');
            roomLink.classList.add('room-link');
            roomLink.textContent = `${room.id} (${room.playersCount}/2)`;
            roomLink.onclick = () => this.joinRoom(room.id);
            listItem.appendChild(roomLink);
            roomListElement.appendChild(listItem);
        });
    }

    joinRoom(roomId) {
        if (roomId) {
            const playerId = this.setClientId();
            localStorage.setItem('roomId', roomId);
            this.socket.emit('joinRoom', { roomId, playerId }, (callback) => {
                if (!callback) return;
                if (callback.status === 'connected') {
                    this.redirectToRoom(callback.roomId, callback.playerId);
                } else if (callback.status === 'error') {
                    this.openModal(callback.title, callback.msg);
                }
            });
        } else {
            alert('Sala não encontrada. Por favor, verifique o ID da sala.');
        }
    }

    createRoom() {
        const playerId = this.setClientId();
        this.socket.emit('createRoom', { playerId }, (roomId) => {
            console.log(".")
            this.joinRoom(roomId);
        });
    }

    setClientId() {
        let playerId = localStorage.getItem('playerId');
        if (!playerId) {
            playerId = Math.random().toString(36).substr(2, 15);
            localStorage.setItem('playerId', playerId);
        }
        return playerId;
    }
}

const gameApp = new GameApp();

gameApp.socket.on('updateRoomList', (rooms) => {
    gameApp.roomList = rooms;
    gameApp.displayRoomList(rooms);
});
