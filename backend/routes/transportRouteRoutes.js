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

const routeViewAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "SUPPORT",
  "FRANCHISE_ADMIN"
);

const routeManageAccess = allowRoles(
  "PRINCIPAL",
  "FRANCHISE_ADMIN"
);

router.post("/", teacherOrFranchiseProtect, routeManageAccess, createRoute);
router.get("/", teacherOrFranchiseProtect, routeViewAccess, getRoutes);
router.get("/:id", teacherOrFranchiseProtect, routeViewAccess, getRouteById);
router.put("/:id", teacherOrFranchiseProtect, routeManageAccess, updateRoute);
router.delete("/:id", teacherOrFranchiseProtect, routeManageAccess, deleteRoute);

module.exports = router;