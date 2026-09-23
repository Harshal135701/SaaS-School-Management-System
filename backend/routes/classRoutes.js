const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
} = require("../controllers/classController");

const academicAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "DATA_ENTRY",
  "FRANCHISE_ADMIN"
);

const classReadAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "DATA_ENTRY",
  "ACCOUNTANT",
  "FRANCHISE_ADMIN"
);

router.get("/", franchiseProtect, classReadAccess, getClasses);
router.get("/:id", franchiseProtect, classReadAccess, getClassById);

router.post("/", franchiseProtect, academicAccess, createClass);
router.put("/:id", franchiseProtect, academicAccess, updateClass);
router.delete("/:id", franchiseProtect, academicAccess, deleteClass);

module.exports = router;