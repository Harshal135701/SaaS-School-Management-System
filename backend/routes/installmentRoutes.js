const express = require("express");
const router = express.Router();

const {
  createInstallment,
  getInstallments,
  updateInstallment,
  deleteInstallment,
} = require("../controllers/installmentController");


const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const financeAccess = allowRoles(
  "PRINCIPAL",
  "ACCOUNTANT",
  "FRANCHISE_ADMIN"
);

router.use(teacherOrFranchiseProtect);
router.use(financeAccess);

router.get("/", getInstallments);

router.post("/", createInstallment);

router.put("/:id", updateInstallment);

router.delete("/:id", deleteInstallment);

module.exports = router;