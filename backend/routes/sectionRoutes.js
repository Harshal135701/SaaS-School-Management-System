const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
} = require("../controllers/sectionController");

const academicAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "DATA_ENTRY",
  "FRANCHISE_ADMIN"
);

const sectionReadAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "DATA_ENTRY",
  "ACCOUNTANT",
  "FRANCHISE_ADMIN"
);

router.get(
  "/",
  teacherOrFranchiseProtect,
  sectionReadAccess,
  getSections
);

router.get(
  "/:id",
  teacherOrFranchiseProtect,
  sectionReadAccess,
  getSectionById
);

router.post(
  "/",
  teacherOrFranchiseProtect,
  academicAccess,
  createSection
);

router.put(
  "/:id",
  teacherOrFranchiseProtect,
  academicAccess,
  updateSection
);

router.delete(
  "/:id",
  teacherOrFranchiseProtect,
  academicAccess,
  deleteSection
);

module.exports = router;