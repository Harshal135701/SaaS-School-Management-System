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

// ====================
// STAFF / ADMIN ACCESS
// ====================

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

// ====================
// PARENT - VIEW ONLY
// IMPORTANT: Keep these BEFORE /:id
// ====================

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

// ====================
// STAFF / ADMIN - VIEW
// ====================

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

// ====================
// STAFF / ADMIN - MANAGE
// ====================

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