const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
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
  teacherOrFranchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  createSchoolPeriod
);


router.patch(
  "/:id/activate",
  teacherOrFranchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  activateSchoolPeriod
);


router.get(
  "/",
  teacherOrFranchiseProtect,
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
  teacherOrFranchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  updateSchoolPeriod
);

router.patch(
  "/:id/deactivate",
  teacherOrFranchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  deactivateSchoolPeriod
);

module.exports = router;

