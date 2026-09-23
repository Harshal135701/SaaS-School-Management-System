const { Op } = require("sequelize");
const { SchoolPeriod } = require("../models");

const createSchoolPeriod = async (req, res) => {
  try {
    const {
      periodNumber,
      name,
      startTime,
      endTime,
      isBreak = false,
    } = req.body;

    const { franchiseId } = req.user;

    if (!periodNumber || !name || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "periodNumber, name, startTime and endTime are required",
      });
    }

    if (
      !Number.isInteger(Number(periodNumber)) ||
      Number(periodNumber) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "periodNumber must be a positive integer",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be greater than start time",
      });
    }

    const existingPeriod = await SchoolPeriod.findOne({
      where: {
        franchiseId,
        periodNumber: Number(periodNumber),
      },
    });

    if (existingPeriod) {
      return res.status(409).json({
        success: false,
        message: "Period number already exists",
      });
    }

    const overlappingPeriod = await SchoolPeriod.findOne({
      where: {
        franchiseId,
        isActive: true,
        startTime: {
          [Op.lt]: endTime,
        },
        endTime: {
          [Op.gt]: startTime,
        },
      },
    });

    if (overlappingPeriod) {
      return res.status(409).json({
        success: false,
        message: `Time overlaps with existing period: ${overlappingPeriod.name}`,
      });
    }

    const period = await SchoolPeriod.create({
      franchiseId,
      periodNumber: Number(periodNumber),
      name,
      startTime,
      endTime,
      isBreak: Boolean(isBreak),
    });

    return res.status(201).json({
      success: true,
      message: "School period created successfully",
      data: period,
    });
  } catch (error) {
    console.error("Create school period error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSchoolPeriods = async (req, res) => {
  try {
    const periods = await SchoolPeriod.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      order: [["periodNumber", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: periods.length,
      data: periods,
    });
  } catch (error) {
    console.error("Get school periods error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateSchoolPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      periodNumber,
      name,
      startTime,
      endTime,
      isBreak = false,
    } = req.body;

    const { franchiseId } = req.user;

    if (!periodNumber || !name || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "periodNumber, name, startTime and endTime are required",
      });
    }

    if (
      !Number.isInteger(Number(periodNumber)) ||
      Number(periodNumber) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "periodNumber must be a positive integer",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be greater than start time",
      });
    }

    const period = await SchoolPeriod.findOne({
      where: {
        id,
        franchiseId,
        isActive: true,
      },
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        message: "School period not found",
      });
    }

    const duplicatePeriod = await SchoolPeriod.findOne({
      where: {
        franchiseId,
        periodNumber: Number(periodNumber),
        id: {
          [Op.ne]: id,
        },
      },
    });

    if (duplicatePeriod) {
      return res.status(409).json({
        success: false,
        message: "Period number already exists",
      });
    }

    const overlappingPeriod = await SchoolPeriod.findOne({
      where: {
        franchiseId,
        isActive: true,
        id: {
          [Op.ne]: id,
        },
        startTime: {
          [Op.lt]: endTime,
        },
        endTime: {
          [Op.gt]: startTime,
        },
      },
    });

    if (overlappingPeriod) {
      return res.status(409).json({
        success: false,
        message: `Time overlaps with existing period: ${overlappingPeriod.name}`,
      });
    }

    await period.update({
      periodNumber: Number(periodNumber),
      name,
      startTime,
      endTime,
      isBreak: Boolean(isBreak),
    });

    return res.status(200).json({
      success: true,
      message: "School period updated successfully",
      data: period,
    });
  } catch (error) {
    console.error("Update school period error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deactivateSchoolPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const { franchiseId } = req.user;

    const period = await SchoolPeriod.findOne({
      where: {
        id,
        franchiseId,
        isActive: true,
      },
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        message: "School period not found or already inactive",
      });
    }

    await period.update({
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message: "School period deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate school period error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const activateSchoolPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const { franchiseId } = req.user;

    const period = await SchoolPeriod.findOne({
      where: {
        id,
        franchiseId,
        isActive: false,
      },
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        message: "School period not found or already active",
      });
    }

    await period.update({
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      message: "School period activated successfully",
      data: period,
    });
  } catch (error) {
    console.error("Activate school period error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createSchoolPeriod,
  getSchoolPeriods,
  updateSchoolPeriod,
  deactivateSchoolPeriod,
  activateSchoolPeriod,
};

