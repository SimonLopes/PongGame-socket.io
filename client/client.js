const socket = io('http://localhost:3000');

// Function to get or generate client ID
function getClientId() {
    let clientId = localStorage.getItem('clientId');
    if (!clientId) {
        clientId = socket.id
        localStorage.setItem('clientId', clientId);
    }
    return clientId;
}

