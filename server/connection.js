const socketIo = require('socket.io');

var io;
function connectSocket(server) {
    io = socketIo(server);
    return io;
}

module.exports = {
    connectSocket
}