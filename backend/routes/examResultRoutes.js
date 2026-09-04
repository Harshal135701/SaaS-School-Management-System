const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const parentProtect = require("../middleware/parentAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createExamResult,
  getExamResults,
  getResultsByExamination,
  updateExamResult,
  deleteExamResult,
} = require("../controllers/examResultController");

const teachingAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

// Parent - view own child's results
router.get(
  "/parent/student/:studentId",
  parentProtect,
  getExamResults
);

// Staff - view all results
router.get(
  "/",
  teacherOrFranchiseProtect,
  teachingAccess,
  getExamResults
);

router.get(
  "/examination/:examinationId",
  teacherOrFranchiseProtect,
  teachingAccess,
  getResultsByExamination
);

// Staff - create/update/delete
router.post(
  "/",
  teacherOrFranchiseProtect,
  teachingAccess,
  createExamResult
);

router.put(
  "/:id",
  teacherOrFranchiseProtect,
  teachingAccess,
  updateExamResult
);

router.delete(
  "/:id",
  teacherOrFranchiseProtect,
  teachingAccess,
  deleteExamResult
);

module.exports = router;