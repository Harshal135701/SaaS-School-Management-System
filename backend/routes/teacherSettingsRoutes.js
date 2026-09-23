const express = require("express");
const router = express.Router();
const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { TeacherSettings } = require("../models");

router.get("/", teacherOrFranchiseProtect, async (req, res) => {
  try {
    let settings = await TeacherSettings.findOne({ where: { teacherId: req.user.id } });
    if (!settings) {
      settings = await TeacherSettings.create({ teacherId: req.user.id });
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching teacher settings:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/", teacherOrFranchiseProtect, async (req, res) => {
  try {
    const {
      timezone,
      currency,
      dateFormat,
      themeMode,
      reducedMotion,
      highContrast,
      screenReaderFriendly,
      twoFactorEnabled,
    } = req.body;

    let settings = await TeacherSettings.findOne({ where: { teacherId: req.user.id } });
    if (!settings) {
      settings = await TeacherSettings.create({ teacherId: req.user.id });
    }

    if (timezone) settings.timezone = timezone;
    if (currency) settings.currency = currency;
    if (dateFormat) settings.dateFormat = dateFormat;
    if (themeMode) settings.themeMode = themeMode;
    if (reducedMotion !== undefined) settings.reducedMotion = reducedMotion;
    if (highContrast !== undefined) settings.highContrast = highContrast;
    if (screenReaderFriendly !== undefined) settings.screenReaderFriendly = screenReaderFriendly;
    if (twoFactorEnabled !== undefined) settings.twoFactorEnabled = twoFactorEnabled;

    await settings.save();

    return res.status(200).json({ success: true, message: "Settings updated successfully", data: settings });
  } catch (error) {
    console.error("Error updating teacher settings:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
