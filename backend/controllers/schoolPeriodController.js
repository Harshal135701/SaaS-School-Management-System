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

    // 1. Required fields
    if (!periodNumber || !name || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "periodNumber, name, startTime and endTime are required",
      });
    }

    // 2. Validate period number
    if (
      !Number.isInteger(Number(periodNumber)) ||
      Number(periodNumber) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "periodNumber must be a positive integer",
      });
    }

    // 3. Validate time
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be greater than start time",
      });
    }

    // 4. Check duplicate period number
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

    // 5. Check overlapping period
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

    // 6. Create period
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
        isActive: true,
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

module.exports = {
  createSchoolPeriod,
  getSchoolPeriods,
};