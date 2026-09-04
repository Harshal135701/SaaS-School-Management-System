const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

const vehicleViewAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "SUPPORT",
  "FRANCHISE_ADMIN"
);

const vehicleManageAccess = allowRoles(
  "PRINCIPAL",
  "FRANCHISE_ADMIN"
);


router.get("/", teacherOrFranchiseProtect, vehicleViewAccess, getVehicles);
router.get("/:id", teacherOrFranchiseProtect, vehicleViewAccess, getVehicleById);

router.post("/", teacherOrFranchiseProtect, vehicleManageAccess, createVehicle);
router.put("/:id", teacherOrFranchiseProtect, vehicleManageAccess, updateVehicle);
router.delete("/:id", teacherOrFranchiseProtect, vehicleManageAccess, deleteVehicle);

module.exports = router;