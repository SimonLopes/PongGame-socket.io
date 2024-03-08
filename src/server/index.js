// index.js
const GameServer = require('./GameServer');

const gameServer = new GameServer(process.env.PORT);

gameServer.server.listen(gameServer.PORT, () => {
  console.log(`Server is running on port ${gameServer.PORT}`);
});
