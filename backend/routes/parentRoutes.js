const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createParent,
  assignStudent,
  getParents,
  updateParent,
  deleteParent,
} = require("../controllers/parentController");

const parentAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "DATA_ENTRY",
  "FRANCHISE_ADMIN"
);

router.post("/", teacherOrFranchiseProtect, parentAccess, createParent);

router.get("/", teacherOrFranchiseProtect, parentAccess, getParents);

router.put("/:id", teacherOrFranchiseProtect, parentAccess, updateParent);

router.delete("/:id", teacherOrFranchiseProtect, parentAccess, deleteParent);

router.post(
  "/assign-student",
  teacherOrFranchiseProtect,
  parentAccess,
  assignStudent
);

module.exports = router;