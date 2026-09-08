const express = require("express");
const router = express.Router();

const {
  createFeeCategory,
  getFeeCategories,
} = require("../controllers/feeCategoryController");

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createFeeCategory);
router.get("/", getFeeCategories);

module.exports = router;