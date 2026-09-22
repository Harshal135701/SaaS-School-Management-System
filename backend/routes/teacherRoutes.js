const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
createTeacher,
getTeachers,
getTeacherById,
updateTeacher,
deleteTeacher,
} = require("../controllers/teacherController");

// Teachers can be viewed by teaching management staff.
const teacherViewAccess = allowRoles(
"PRINCIPAL",
"HOD",
"TEACHER",
"FRANCHISE_ADMIN"
);

// Teacher management is restricted to management roles.
const teacherManageAccess = allowRoles(
"PRINCIPAL",
"HOD",
"FRANCHISE_ADMIN"
);

// Get all teachers
router.get(
"/",
teacherOrFranchiseProtect,
teacherViewAccess,
getTeachers
);

// Get teacher by ID
router.get(
"/:id",
teacherOrFranchiseProtect,
teacherViewAccess,
getTeacherById
);

// Create teacher
router.post(
"/",
teacherOrFranchiseProtect,
teacherManageAccess,
createTeacher
);

// Update teacher
router.put(
"/:id",
teacherOrFranchiseProtect,
teacherManageAccess,
updateTeacher
);

// Deactivate teacher
router.delete(
"/:id",
teacherOrFranchiseProtect,
teacherManageAccess,
deleteTeacher
);

module.exports = router;
