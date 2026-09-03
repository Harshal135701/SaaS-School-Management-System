const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const parentProtect = require("../middleware/parentAuthMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createHomework,
  getHomeworks,
  getHomeworkById,
  updateHomework,
  deleteHomework,
} = require("../controllers/homeworkController");

// Staff/Admin permissions
const homeworkViewAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

const homeworkManageAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

// Staff/Admin - View
router.get(
  "/",
  teacherOrFranchiseProtect,
  homeworkViewAccess,
  getHomeworks
);

router.get(
  "/:id",
  teacherOrFranchiseProtect,
  homeworkViewAccess,
  getHomeworkById
);

// Parent - View only
router.get(
  "/parent/list",
  parentProtect,
  getHomeworks
);

router.get(
  "/parent/:id",
  parentProtect,
  getHomeworkById
);

// Staff/Admin - Create/Update/Delete
router.post(
  "/",
  teacherOrFranchiseProtect,
  homeworkManageAccess,
  createHomework
);

router.put(
  "/:id",
  teacherOrFranchiseProtect,
  homeworkManageAccess,
  updateHomework
);

router.delete(
  "/:id",
  teacherOrFranchiseProtect,
  homeworkManageAccess,
  deleteHomework
);

module.exports = router;

