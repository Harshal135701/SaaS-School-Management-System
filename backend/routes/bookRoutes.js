const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
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

router.post("/", teacherOrFranchiseProtect, libraryAccess, createBook);
router.get("/", teacherOrFranchiseProtect, libraryAccess, getBooks);
router.get("/:id", teacherOrFranchiseProtect, libraryAccess, getBookById);
router.put("/:id", teacherOrFranchiseProtect, libraryAccess, updateBook);
router.delete("/:id", teacherOrFranchiseProtect, libraryAccess, deleteBook);

module.exports = router;