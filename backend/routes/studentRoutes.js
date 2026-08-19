const express = require("express");

const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createStudent,
  getStudents,
} = require("../controllers/studentController");

router.post("/", franchiseProtect, createStudent);

router.get("/", franchiseProtect, getStudents);

module.exports = router;