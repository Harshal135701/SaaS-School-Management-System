const express = require("express");
const router = express.Router();

const {
    getTeacherExpenseDashboard,
} = require("../controllers/teacherExpenseDashboardController");

const
    franchiseProtect
= require("../middleware/franchiseAuthMiddleware");

router.get("/", franchiseProtect, getTeacherExpenseDashboard);

module.exports = router;




