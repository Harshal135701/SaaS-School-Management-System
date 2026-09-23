const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
    createAssignment,
    getAssignments,
    updateAssignment,
    deleteAssignment,
} = require("../controllers/teacherAssignmentController");

// CREATE
router.post(
    "/",
    teacherOrFranchiseProtect,
    allowRoles("FRANCHISE_ADMIN", "PRINCIPAL", "HOD"),
    createAssignment
);

// VIEW
router.get(
    "/",
    teacherOrFranchiseProtect,
    allowRoles(
        "FRANCHISE_ADMIN",
        "PRINCIPAL",
        "HOD",
        "TEACHER"
    ),
    getAssignments
);

// UPDATE
router.put(
    "/:id",
    teacherOrFranchiseProtect,
    allowRoles("FRANCHISE_ADMIN", "PRINCIPAL", "HOD"),
    updateAssignment
);

// DEACTIVATE
router.delete(
    "/:id",
    teacherOrFranchiseProtect,
    allowRoles("FRANCHISE_ADMIN", "PRINCIPAL", "HOD"),
    deleteAssignment
);

module.exports = router;