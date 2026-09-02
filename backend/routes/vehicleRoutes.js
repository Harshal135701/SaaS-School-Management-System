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

const transportAccess = allowRoles(
  "PRINCIPAL",
  "SUPPORT",
  "FRANCHISE_ADMIN"
);

router.post("/", teacherOrFranchiseProtect, transportAccess, createVehicle);
router.get("/", teacherOrFranchiseProtect, transportAccess, getVehicles);
router.get("/:id", teacherOrFranchiseProtect, transportAccess, getVehicleById);
router.put("/:id", teacherOrFranchiseProtect, transportAccess, updateVehicle);
router.delete("/:id", teacherOrFranchiseProtect, transportAccess, deleteVehicle);

module.exports = router;