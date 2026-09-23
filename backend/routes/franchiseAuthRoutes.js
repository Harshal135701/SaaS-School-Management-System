const express = require("express");

const router = express.Router();

const { login, updateProfile, changePassword, getMe } = require("../controllers/franchiseAuthController");
const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.post("/login", login);

router.get("/me", franchiseProtect, getMe);

router.put("/profile", franchiseProtect, updateProfile);
router.put("/change-password", franchiseProtect, changePassword);

module.exports = router;