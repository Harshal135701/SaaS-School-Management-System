const express = require("express");

const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");
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
    franchiseProtect,
    allowRoles("FRANCHISE_ADMIN", "PRINCIPAL", "HOD"),
    createAssignment
);

// VIEW
router.get(
    "/",
    franchiseProtect,
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
    franchiseProtect,
    allowRoles("FRANCHISE_ADMIN", "PRINCIPAL", "HOD"),
    updateAssignment
);

// DEACTIVATE
router.delete(
    "/:id",
    franchiseProtect,
    allowRoles("FRANCHISE_ADMIN", "PRINCIPAL", "HOD"),
    deleteAssignment
);

module.exports = router;