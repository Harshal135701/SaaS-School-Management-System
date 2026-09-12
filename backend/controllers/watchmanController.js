const { Watchman } = require("../models");

const createWatchman = async (req, res) => {
  try {
    const {
      name,
      phone,
      joiningDate,
      paymentType,
      rate,
    } = req.body;

    if (!name || !paymentType || !rate) {
      return res.status(400).json({
        success: false,
        message: "Name, payment type and rate are required",
      });
    }

    const watchman = await Watchman.create({
      franchiseId: req.user.franchiseId,
      name,
      phone,
      joiningDate,
      paymentType,
      rate,
    });

    res.status(201).json({
      success: true,
      message: "Watchman created successfully",
      data: watchman,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create watchman",
    });
  }
};

const getWatchmen = async (req, res) => {
  try {
    const watchmen = await Watchman.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: watchmen,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch watchmen",
    });
  }
};

const updateWatchman = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      joiningDate,
      paymentType,
      rate,
      isActive,
    } = req.body;

    const watchman = await Watchman.findOne({
      where: {
        id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!watchman) {
      return res.status(404).json({
        success: false,
        message: "Watchman not found",
      });
    }

    await watchman.update({
      name,
      phone,
      joiningDate,
      paymentType,
      rate,
      isActive,
    });

    res.json({
      success: true,
      message: "Watchman updated successfully",
      data: watchman,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update watchman",
    });
  }
};

const toggleWatchmanStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const watchman = await Watchman.findOne({
      where: {
        id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!watchman) {
      return res.status(404).json({
        success: false,
        message: "Watchman not found",
      });
    }

    await watchman.update({
      isActive: !watchman.isActive,
    });

    res.json({
      success: true,
      message: `Watchman ${
        watchman.isActive ? "activated" : "deactivated"
      } successfully`,
      data: watchman,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update watchman status",
    });
  }
};

module.exports = {
  createWatchman,
  getWatchmen,
  updateWatchman,
  toggleWatchmanStatus,
};

