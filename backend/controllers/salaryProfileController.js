const { SalaryProfile, Teacher } = require("../models");

const createSalaryProfile = async (req, res) => {
  try {
    const {
      teacherId,
      basicSalary,
      allowances = 0,
      deductions = 0,
    } = req.body;

    if (!teacherId || basicSalary == null) {
      return res.status(400).json({
        success: false,
        message: "Teacher and basic salary are required",
      });
    }

    const basic = Number(basicSalary);
    const allow = Number(allowances);
    const deduct = Number(deductions);

    if (
      !Number.isFinite(basic) ||
      !Number.isFinite(allow) ||
      !Number.isFinite(deduct) ||
      basic <= 0 ||
      allow < 0 ||
      deduct < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid salary amounts",
      });
    }

    const teacher = await Teacher.findOne({
      where: {
        id: teacherId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    if (teacher.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Cannot create salary profile for an inactive teacher",
      });
    }

    const existingProfile = await SalaryProfile.findOne({
      where: {
        teacherId,
        franchiseId: req.user.franchiseId,
        isActive: true,
      },
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Teacher already has an active salary profile",
      });
    }

    const profile = await SalaryProfile.create({
      franchiseId: req.user.franchiseId,
      teacherId,
      basicSalary: basic,
      allowances: allow,
      deductions: deduct,
    });

    return res.status(201).json({
      success: true,
      message: "Salary profile created successfully",
      data: profile,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create salary profile",
    });
  }
};

const getSalaryProfiles = async (req, res) => {
  try {
    const profiles = await SalaryProfile.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Teacher,
          as: "teacher",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch salary profiles",
    });
  }
};

module.exports = { createSalaryProfile,
    getSalaryProfiles
 };