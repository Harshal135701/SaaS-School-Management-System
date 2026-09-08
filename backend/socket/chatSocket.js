const {
  Conversation,
  Message,
} = require("../models");

const DELETE_EDIT_TIME_LIMIT = 2 * 60 * 1000; // 2 minutes

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
      const { conversationId, message } = data;

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

  // Edit message
  socket.on("edit_message", async (data) => {
    try {
      const { messageId, message } = data;

      if (!messageId || !message?.trim()) {
        return socket.emit("chat_error", {
          message: "messageId and message are required",
        });
      }

      const existingMessage = await Message.findByPk(messageId);

      if (!existingMessage) {
        return socket.emit("chat_error", {
          message: "Message not found",
        });
      }

      if (
        existingMessage.senderType !== socket.user.role ||
        existingMessage.senderId !== socket.user.id
      ) {
        return socket.emit("chat_error", {
          message: "You can only edit your own messages",
        });
      }

      if (existingMessage.isDeletedForEveryone) {
        return socket.emit("chat_error", {
          message: "Deleted messages cannot be edited",
        });
      }

      if (
        Date.now() - new Date(existingMessage.createdAt).getTime() >
        DELETE_EDIT_TIME_LIMIT
      ) {
        return socket.emit("chat_error", {
          message: "Message can only be edited within 2 minutes",
        });
      }

      existingMessage.message = message.trim();
      existingMessage.isEdited = true;
      existingMessage.editedAt = new Date();

      await existingMessage.save();

      io.to(`conversation:${existingMessage.conversationId}`).emit(
        "message_edited",
        existingMessage
      );
    } catch (error) {
      console.error(error);

      socket.emit("chat_error", {
        message: "Unable to edit message",
      });
    }
  });

  // Delete for me
  socket.on("delete_message_for_me", async (data) => {
    try {
      const { messageId } = data;

      if (!messageId) {
        return socket.emit("chat_error", {
          message: "messageId is required",
        });
      }

      const existingMessage = await Message.findByPk(messageId);

      if (!existingMessage) {
        return socket.emit("chat_error", {
          message: "Message not found",
        });
      }

      const conversation = await Conversation.findOne({
        where: {
          id: existingMessage.conversationId,
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

      const deletedForMeBy = existingMessage.deletedForMeBy || [];

      if (!deletedForMeBy.includes(socket.user.id)) {
        deletedForMeBy.push(socket.user.id);
      }

      existingMessage.deletedForMeBy = deletedForMeBy;

      await existingMessage.save();

      socket.emit("message_deleted_for_me", {
        messageId: existingMessage.id,
      });
    } catch (error) {
      console.error(error);

      socket.emit("chat_error", {
        message: "Unable to delete message",
      });
    }
  });

  // Delete for everyone
  socket.on("delete_message_for_everyone", async (data) => {
    try {
      const { messageId } = data;

      if (!messageId) {
        return socket.emit("chat_error", {
          message: "messageId is required",
        });
      }

      const existingMessage = await Message.findByPk(messageId);

      if (!existingMessage) {
        return socket.emit("chat_error", {
          message: "Message not found",
        });
      }

      if (
        existingMessage.senderType !== socket.user.role ||
        existingMessage.senderId !== socket.user.id
      ) {
        return socket.emit("chat_error", {
          message: "You can only delete your own messages for everyone",
        });
      }

      if (existingMessage.isDeletedForEveryone) {
        return socket.emit("chat_error", {
          message: "Message is already deleted",
        });
      }

      if (
        Date.now() - new Date(existingMessage.createdAt).getTime() >
        DELETE_EDIT_TIME_LIMIT
      ) {
        return socket.emit("chat_error", {
          message: "Message can only be deleted for everyone within 2 minutes",
        });
      }

      existingMessage.message = "This message was deleted";
      existingMessage.isDeletedForEveryone = true;

      await existingMessage.save();

      io.to(`conversation:${existingMessage.conversationId}`).emit(
        "message_deleted_for_everyone",
        existingMessage
      );
    } catch (error) {
      console.error(error);

      socket.emit("chat_error", {
        message: "Unable to delete message",
      });
    }
  });
};

module.exports = registerChatSocket;