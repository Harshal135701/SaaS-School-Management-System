const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createSchoolPeriod,
  getSchoolPeriods,
} = require("../controllers/schoolPeriodController");

router.post(
  "/",
  franchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  createSchoolPeriod
);

router.get(
  "/",
  franchiseProtect,
  allowRoles(
    "FRANCHISE_ADMIN",
    "PRINCIPAL",
    "HOD",
    "TEACHER"
  ),
  getSchoolPeriods
);

module.exports = router;