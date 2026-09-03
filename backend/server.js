const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");

const { connectDB } = require("./config/database");

const socketAuth = require("./middleware/socketAuthMiddleware");
const registerChatSocket = require("./socket/chatSocket");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.use(socketAuth);

io.on("connection", (socket) => {
  console.log(
    `Chat connected: ${socket.user.role} - ${socket.user.id}`
  );

  registerChatSocket(io, socket);

  socket.on("disconnect", () => {
    console.log(
      `Chat disconnected: ${socket.user.role} - ${socket.user.id}`
    );
  });
});

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();