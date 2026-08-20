const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

router.post("/", franchiseProtect, createVehicle);
router.get("/", franchiseProtect, getVehicles);
router.get("/:id", franchiseProtect, getVehicleById);
router.put("/:id", franchiseProtect, updateVehicle);
router.delete("/:id", franchiseProtect, deleteVehicle);

module.exports = router;