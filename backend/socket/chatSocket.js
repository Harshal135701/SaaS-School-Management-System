const {
  Conversation,
  Message,
} = require("../models");

const registerChatSocket = (io, socket) => {
  // Join conversation room
  socket.on("join_conversation", async (conversationId) => {
    try {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          franchiseId: socket.user.franchiseId,
        },
      });

      if (!conversation) {
        return socket.emit("chat_error", {
          message: "Conversation not found",
        });
      }

      const isParticipant =
        (socket.user.role === "PARENT" &&
          conversation.parentId === socket.user.id) ||
        (socket.user.role === "TEACHER" &&
          conversation.teacherId === socket.user.id);

      if (!isParticipant) {
        return socket.emit("chat_error", {
          message: "You are not a participant in this conversation",
        });
      }

      socket.join(`conversation:${conversationId}`);

      socket.emit("conversation_joined", {
        conversationId,
      });

      console.log(
        `${socket.user.role} joined conversation ${conversationId}`
      );
    } catch (error) {
      console.error(error);

      socket.emit("chat_error", {
        message: "Unable to join conversation",
      });
    }
  });

  // Send message
  socket.on("send_message", async (data) => {
    try {
      const {
        conversationId,
        message,
      } = data;

      if (!conversationId || !message?.trim()) {
        return socket.emit("chat_error", {
          message: "conversationId and message are required",
        });
      }

      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          franchiseId: socket.user.franchiseId,
        },
      });

      if (!conversation) {
        return socket.emit("chat_error", {
          message: "Conversation not found",
        });
      }

      const isParticipant =
        (socket.user.role === "PARENT" &&
          conversation.parentId === socket.user.id) ||
        (socket.user.role === "TEACHER" &&
          conversation.teacherId === socket.user.id);

      if (!isParticipant) {
        return socket.emit("chat_error", {
          message: "You are not a participant in this conversation",
        });
      }

      const newMessage = await Message.create({
        conversationId,
        senderType: socket.user.role,
        senderId: socket.user.id,
        message: message.trim(),
      });

      // Send to everyone in conversation
      io.to(`conversation:${conversationId}`).emit(
        "new_message",
        newMessage
      );
    } catch (error) {
      console.error(error);

      socket.emit("chat_error", {
        message: "Unable to send message",
      });
    }
  });
};

module.exports = registerChatSocket;