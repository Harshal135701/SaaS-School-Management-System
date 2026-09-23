const express = require("express");

const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");


const {
  createSchoolPeriod,
  getSchoolPeriods,
  updateSchoolPeriod,
  deactivateSchoolPeriod,
  activateSchoolPeriod,
} = require("../controllers/schoolPeriodController");

router.patch(
  "/test-activate",
  (req, res) => {
    res.json({
      success: true,
      message: "Activate route is loaded",
    });
  }
);



router.post(
  "/",
  franchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  createSchoolPeriod
);


router.patch(
  "/:id/activate",
  franchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  activateSchoolPeriod
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

router.put(
  "/:id",
  franchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  updateSchoolPeriod
);

router.patch(
  "/:id/deactivate",
  franchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  deactivateSchoolPeriod
);

module.exports = router;

