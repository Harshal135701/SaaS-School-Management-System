const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const parentProtect = require("../middleware/parentAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const libraryAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

// PARENT - VIEW ONLY
// Must come before /:id
router.get(
  "/parent/list",
  parentProtect,
  getBooks
);

// STAFF - VIEW
router.get(
  "/",
  teacherOrFranchiseProtect,
  libraryAccess,
  getBooks
);

router.get(
  "/:id",
  teacherOrFranchiseProtect,
  libraryAccess,
  getBookById
);

// STAFF - CREATE
router.post(
  "/",
  teacherOrFranchiseProtect,
  libraryAccess,
  createBook
);

// STAFF - UPDATE
router.put(
  "/:id",
  teacherOrFranchiseProtect,
  libraryAccess,
  updateBook
);

// STAFF - DELETE
router.delete(
  "/:id",
  teacherOrFranchiseProtect,
  libraryAccess,
  deleteBook
);

module.exports = router;