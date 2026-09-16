const express = require("express");

const router = express.Router();

const {
  createNotice,
  getNotices,
  deleteNotice,
} = require("../controllers/noticeController");

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createNotice);
router.get("/", getNotices);
router.delete("/:id", deleteNotice);

module.exports = router;