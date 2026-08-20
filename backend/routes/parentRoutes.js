const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createParent,
  assignStudent,
  getParents,
} = require("../controllers/parentController");

router.post("/", franchiseProtect, createParent);

router.get("/", franchiseProtect, getParents);

router.post(
  "/assign-student",
  franchiseProtect,
  assignStudent
);

module.exports = router;