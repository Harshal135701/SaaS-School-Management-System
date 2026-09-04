const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const parentProtect = require("../middleware/parentAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createExamination,
  getExaminations,
  updateExamination,
  getExaminationById,
  deleteExamination,
} = require("../controllers/examinationController");

const teachingAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

// Parent - view only
router.get(
  "/parent/list",
  parentProtect,
  getExaminations
);

// Staff - view
router.get(
  "/",
  teacherOrFranchiseProtect,
  teachingAccess,
  getExaminations
);

router.get(
  "/:id",
  teacherOrFranchiseProtect,
  teachingAccess,
  getExaminationById
);

// Staff - create/update/delete
router.post(
  "/",
  teacherOrFranchiseProtect,
  teachingAccess,
  createExamination
);

router.put(
  "/:id",
  teacherOrFranchiseProtect,
  teachingAccess,
  updateExamination
);

router.delete(
  "/:id",
  teacherOrFranchiseProtect,
  teachingAccess,
  deleteExamination
);

module.exports = router;