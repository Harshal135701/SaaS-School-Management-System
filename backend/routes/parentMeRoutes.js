const express = require("express");

const router = express.Router();

const parentProtect = require("../middleware/parentAuthMiddleware");

const {
  getMyStudents,
} = require("../controllers/parentController");

router.get(
  "/me/students",
  parentProtect,
  getMyStudents
);

module.exports = router;