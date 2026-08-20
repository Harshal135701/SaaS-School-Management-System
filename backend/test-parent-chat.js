const { io } = require("socket.io-client");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlkNTY2ODNjLTQ3MmEtNDM1Yi1iMWZhLTI3ODBjY2QyYWU1MyIsImVtYWlsIjoicmFqQGV4YW1wbGUuY29tIiwicm9sZSI6IlBBUkVOVCIsImZyYW5jaGlzZUlkIjoiNWM5NmZkY2MtZjY4NC00NTM3LWExNjUtOTI3MjAzYjkzNTBhIiwiaWF0IjoxNzg3MjE5MzAzLCJleHAiOjE3ODczMDU3MDN9.f04n9pMOKbim_pEkcprd81BbEGow1AZLNUk6xfUGdAA";
const CONVERSATION_ID = "7757bdae-a206-4a2d-9574-b863d6e2a3a7";

const socket = io("http://localhost:5000", {
  auth: {
    token: TOKEN,
  },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("PARENT CONNECTED:", socket.id);

  socket.emit("join_conversation", CONVERSATION_ID);
});

socket.on("conversation_joined", (data) => {
  console.log("PARENT JOINED:", data);

  socket.emit("send_message", {
    conversationId: CONVERSATION_ID,
    message: "Hello from Parent!",
  });
});

socket.on("new_message", (message) => {
  console.log("PARENT RECEIVED:");
  console.log(message);

  socket.disconnect();
});

socket.on("chat_error", (error) => {
  console.error("CHAT ERROR:", error);
});

socket.on("connect_error", (error) => {
  console.error("CONNECTION ERROR:", error.message);
});