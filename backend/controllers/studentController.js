const { Student } = require("../models");

const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Student name is required",
      });
    }

    const student = await Student.create({
      franchiseId: req.user.franchiseId,
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createStudent,
  getStudents
};