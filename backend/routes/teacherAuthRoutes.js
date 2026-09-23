const express = require("express");

const router = express.Router();

const { login, getMe, updateProfile, changePassword } = require("../controllers/teacherAuthController");
const { protect } = require("../middleware/authMiddleware");
const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");

router.post("/login", login);
router.get("/me", teacherOrFranchiseProtect, getMe);
router.put("/profile", teacherOrFranchiseProtect, updateProfile);
router.put("/change-password", teacherOrFranchiseProtect, changePassword);


module.exports = router;