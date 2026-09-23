const express = require("express");

const router = express.Router();

const { getSettings, updateSettings } = require("../controllers/franchiseSettingsController");
const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.get("/", franchiseProtect, getSettings);
router.put("/", franchiseProtect, updateSettings);

module.exports = router;
