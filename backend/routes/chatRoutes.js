const express = require("express");

const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");
const chatProtect = require("../middleware/chatAuthMiddleware");

const {
  createConversation,
  getConversations,
  getMessages,
  getUnreadCount,
  markMessagesRead,
} = require("../controllers/chatController");

// Franchise Admin
router.post(
  "/",
  chatProtect,
  createConversation
);

// Parent / Teacher
router.get(
  "/unread-count",
  chatProtect,
  getUnreadCount
);

router.put(
  "/messages/read",
  chatProtect,
  markMessagesRead
);

router.get(
  "/my",
  chatProtect,
  getConversations
);

router.get(
  "/:conversationId/messages",
  chatProtect,
  getMessages
);

module.exports = router;