
const { Watchman } = require("../models");

const PAYMENT_TYPES = [
  "DAILY",
  "WEEKLY",
  "FORTNIGHTLY",
  "MONTHLY",
  "CUSTOM",
];

const isValidDate = (value) => {
  if (!value) return true;

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const isValidUUID = (value) => {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
};

const validateWatchmanData = ({
  name,
  joiningDate,
  paymentType,
  rate,
}) => {
  if (typeof name !== "string" || !name.trim()) {
    return "Name is required";
  }

  if (name.trim().length < 2 || name.trim().length > 100) {
    return "Name must be between 2 and 100 characters";
  }

  if (!paymentType || !PAYMENT_TYPES.includes(paymentType)) {
    return `Payment type must be one of: ${PAYMENT_TYPES.join(", ")}`;
  }

  if (
    rate === undefined ||
    rate === null ||
    rate === "" ||
    Number.isNaN(Number(rate)) ||
    Number(rate) <= 0
  ) {
    return "Rate must be a valid amount greater than 0";
  }

  if (Number(rate) > 9999999999.99) {
    return "Rate exceeds the maximum allowed amount";
  }

  if (!isValidDate(joiningDate)) {
    return "Invalid joining date";
  }

  return null;
};

// CREATE WATCHMAN
const createWatchman = async (req, res) => {
  try {
    const {
      name,
      phone,
      joiningDate,
      paymentType,
      rate,
    } = req.body;

    const franchiseId = req.user?.franchiseId;

    if (!franchiseId) {
      return res.status(403).json({
        success: false,
        message: "Franchise access is required",
      });
    }

    const validationError = validateWatchmanData({
      name,
      joiningDate,
      paymentType,
      rate,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (phone !== undefined && phone !== null && phone !== "") {
      const cleanPhone = String(phone).trim();

      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: "Phone must be a valid 10-digit Indian mobile number",
        });
      }
    }

    const watchman = await Watchman.create({
      franchiseId,
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      joiningDate: joiningDate || null,
      paymentType,
      rate: Number(rate).toFixed(2),
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Watchman created successfully",
      data: watchman,
    });
  } catch (error) {
    console.error("createWatchman:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create watchman",
    });
  }
};

// GET WATCHMEN
const getWatchmen = async (req, res) => {
  try {
    const franchiseId = req.user?.franchiseId;

    if (!franchiseId) {
      return res.status(403).json({
        success: false,
        message: "Franchise access is required",
      });
    }

    const watchmen = await Watchman.findAll({
      where: {
        franchiseId,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      data: watchmen,
    });
  } catch (error) {
    console.error("getWatchmen:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch watchmen",
    });
  }
};

// UPDATE WATCHMAN
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

    const franchiseId = req.user?.franchiseId;

    if (!franchiseId) {
      return res.status(403).json({
        success: false,
        message: "Franchise access is required",
      });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid watchman ID",
      });
    }

    const watchman = await Watchman.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!watchman) {
      return res.status(404).json({
        success: false,
        message: "Watchman not found",
      });
    }

    const validationError = validateWatchmanData({
      name,
      joiningDate,
      paymentType,
      rate,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (
      isActive !== undefined &&
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    if (phone !== undefined && phone !== null && phone !== "") {
      if (typeof phone !== "string" || phone.trim().length > 20) {
        return res.status(400).json({
          success: false,
          message: "Phone number is invalid",
        });
      }
    }

    await watchman.update({
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      joiningDate: joiningDate || null,
      paymentType,
      rate: Number(rate).toFixed(2),
      isActive:
        isActive !== undefined ? isActive : watchman.isActive,
    });

    return res.json({
      success: true,
      message: "Watchman updated successfully",
      data: watchman,
    });
  } catch (error) {
    console.error("updateWatchman:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update watchman",
    });
  }
};

// TOGGLE ACTIVE STATUS
const toggleWatchmanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user?.franchiseId;

    if (!franchiseId) {
      return res.status(403).json({
        success: false,
        message: "Franchise access is required",
      });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid watchman ID",
      });
    }

    const watchman = await Watchman.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!watchman) {
      return res.status(404).json({
        success: false,
        message: "Watchman not found",
      });
    }

    const newStatus = !watchman.isActive;

    await watchman.update({
      isActive: newStatus,
    });

    return res.json({
      success: true,
      message: `Watchman ${newStatus ? "activated" : "deactivated"
        } successfully`,
      data: watchman,
    });
  } catch (error) {
    console.error("toggleWatchmanStatus:", error);

    return res.status(500).json({
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

