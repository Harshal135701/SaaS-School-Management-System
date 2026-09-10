const { SalaryProfile, Teacher } = require("../models");

const createSalaryProfile = async (req, res) => {
  try {
    const { teacherId, basicSalary, allowances = 0, deductions = 0 } = req.body;

    if (!teacherId || !basicSalary) {
      return res.status(400).json({
        success: false,
        message: "Teacher and basic salary are required",
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

    const profile = await SalaryProfile.create({
      franchiseId: req.user.franchiseId,
      teacherId,
      basicSalary,
      allowances,
      deductions,
    });

    res.status(201).json({
      success: true,
      message: "Salary profile created successfully",
      data: profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
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