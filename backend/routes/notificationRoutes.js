const express = require("express");
const router = express.Router();
const chatProtect = require("../middleware/chatAuthMiddleware");

const {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} = require("../controllers/notificationController");

router.get("/", chatProtect, getNotifications);
router.put("/:id/read", chatProtect, markNotificationRead);
router.delete("/:id", chatProtect, deleteNotification);

module.exports = router;
