const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const parentProtect = require("../middleware/parentAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  issueBook,
  returnBook,
  getBookIssues,
  getParentBookIssues,
} = require("../controllers/bookIssueController");

const libraryAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

// PARENT - VIEW OWN CHILD'S BOOK ISSUES ONLY
router.get(
  "/parent/student/:studentId",
  parentProtect,
  getParentBookIssues
);

// STAFF - VIEW ALL ISSUES
router.get(
  "/",
  teacherOrFranchiseProtect,
  libraryAccess,
  getBookIssues
);

// STAFF - ISSUE BOOK
router.post(
  "/",
  teacherOrFranchiseProtect,
  libraryAccess,
  issueBook
);

// STAFF - RETURN BOOK
router.put(
  "/:id/return",
  teacherOrFranchiseProtect,
  libraryAccess,
  returnBook
);




module.exports = router;