const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  issueBook,
  returnBook,
  getBookIssues,
} = require("../controllers/bookIssueController");

router.post("/", franchiseProtect, issueBook);

router.get("/", franchiseProtect, getBookIssues);

router.put("/:id/return", franchiseProtect, returnBook);

module.exports = router;