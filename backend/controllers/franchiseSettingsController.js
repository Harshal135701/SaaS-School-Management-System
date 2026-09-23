const { FranchiseSettings } = require("../models");

const getSettings = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;

    if (!franchiseId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let settings = await FranchiseSettings.findOne({
      where: { franchiseId },
    });

    if (!settings) {
      // Create defaults if they don't exist
      settings = await FranchiseSettings.create({
        franchiseId,
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get Franchise Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;

    if (!franchiseId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let settings = await FranchiseSettings.findOne({
      where: { franchiseId },
    });

    if (!settings) {
      settings = await FranchiseSettings.create({
        franchiseId,
      });
    }

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

    // Validate if necessary. Since these are optional updates, we can just update what's provided
    if (timezone !== undefined) settings.timezone = timezone;
    if (currency !== undefined) settings.currency = currency;
    if (dateFormat !== undefined) settings.dateFormat = dateFormat;
    if (themeMode !== undefined) settings.themeMode = themeMode;
    if (reducedMotion !== undefined) settings.reducedMotion = reducedMotion;
    if (highContrast !== undefined) settings.highContrast = highContrast;
    if (screenReaderFriendly !== undefined) settings.screenReaderFriendly = screenReaderFriendly;
    
    // Note: twoFactorEnabled can be saved, but as reported earlier, 
    // real 2FA isn't enforced in the auth pipeline currently unless we implement it there too. 
    // We will save it as requested.
    if (twoFactorEnabled !== undefined) settings.twoFactorEnabled = twoFactorEnabled;

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Franchise settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update Franchise Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
