const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createRoute,
  getRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} = require("../controllers/transportRouteController");

const transportAccess = allowRoles(
  "PRINCIPAL",
  "SUPPORT",
  "FRANCHISE_ADMIN"
);

router.post("/", teacherOrFranchiseProtect, transportAccess, createRoute);
router.get("/", teacherOrFranchiseProtect, transportAccess, getRoutes);
router.get("/:id", teacherOrFranchiseProtect, transportAccess, getRouteById);
router.put("/:id", teacherOrFranchiseProtect, transportAccess, updateRoute);
router.delete("/:id", teacherOrFranchiseProtect, transportAccess, deleteRoute);

module.exports = router;