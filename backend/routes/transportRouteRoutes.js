const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createRoute,
  getRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} = require("../controllers/transportRouteController");

router.post("/", franchiseProtect, createRoute);
router.get("/", franchiseProtect, getRoutes);
router.get("/:id", franchiseProtect, getRouteById);
router.put("/:id", franchiseProtect, updateRoute);
router.delete("/:id", franchiseProtect, deleteRoute);

module.exports = router;