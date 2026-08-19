const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

router.post("/", franchiseProtect, createBook);
router.get("/", franchiseProtect, getBooks);
router.get("/:id", franchiseProtect, getBookById);
router.put("/:id", franchiseProtect, updateBook);
router.delete("/:id", franchiseProtect, deleteBook);

module.exports = router;