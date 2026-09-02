const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  issueBook,
  returnBook,
  getBookIssues,
} = require("../controllers/bookIssueController");

const libraryAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

router.post("/", teacherOrFranchiseProtect, libraryAccess, issueBook);

router.get("/", teacherOrFranchiseProtect, libraryAccess, getBookIssues);

router.put(
  "/:id/return",
  teacherOrFranchiseProtect,
  libraryAccess,
  returnBook
);

module.exports = router;