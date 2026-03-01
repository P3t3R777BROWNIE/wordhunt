require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const app = require("./app");
const gameSocket = require("./sockets/gameSocket");

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

(async () => {
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));
  gameSocket(io);

  server.listen(process.env.PORT, () =>
    console.log("Server running on port", process.env.PORT)
  );
})();
