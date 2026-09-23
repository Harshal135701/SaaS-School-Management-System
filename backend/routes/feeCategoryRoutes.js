const express = require("express");
const router = express.Router();

const {
  createFeeCategory,
  getFeeCategories,
} = require("../controllers/feeCategoryController");

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const financeAccess = allowRoles(
  "PRINCIPAL",
  "ACCOUNTANT",
  "FRANCHISE_ADMIN"
);

router.use(teacherOrFranchiseProtect);
router.use(financeAccess);

router.post("/", createFeeCategory);
router.get("/", getFeeCategories);

module.exports = router;