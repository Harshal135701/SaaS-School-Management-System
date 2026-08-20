const { io } = require("socket.io-client");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNmYzMTgzLTNlNjItNGI4Ny04YTIxLWYzMDZhOTljZDRiNCIsImVtYWlsIjoicmFodWwudGVhY2hlckBleGFtcGxlLmNvbSIsInJvbGUiOiJURUFDSEVSIiwidGVhY2hlclJvbGUiOiJIT0QiLCJmcmFuY2hpc2VJZCI6IjVjOTZmZGNjLWY2ODQtNDUzNy1hMTY1LTkyNzIwM2I5MzUwYSIsImlhdCI6MTc4NzIxNzgyMCwiZXhwIjoxNzg3MzA0MjIwfQ.75bIr9pg92-p5iEgeI9777K4ShV49KUHjDvcje-w7wI";


const CONVERSATION_ID = "7757bdae-a206-4a2d-9574-b863d6e2a3a7";

const socket = io("http://localhost:5000", {
  auth: {
    token: TOKEN,
  },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);

  socket.emit("join_conversation", CONVERSATION_ID);
});

socket.on("conversation_joined", (data) => {
  console.log("JOINED:", data);

  socket.emit("send_message", {
    conversationId: CONVERSATION_ID,
    message: "Hello from Teacher!",
  });
});

socket.on("new_message", (message) => {
  console.log("NEW MESSAGE:");
  console.log(message);

  socket.disconnect();
});

socket.on("chat_error", (error) => {
  console.error("CHAT ERROR:", error);
});

socket.on("connect_error", (error) => {
  console.error("CONNECTION ERROR:", error.message);
});