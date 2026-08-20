const { Teacher } = require("../models");

const createTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      dateOfBirth,
      gender,
      subject,
      qualification,
      joiningDate,
      address,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Teacher name is required",
      });
    }

    const teacher = await Teacher.create({
      franchiseId: req.user.franchiseId,
      name,
      email,
      phone,
      role: role || "TEACHER",
      dateOfBirth,
      gender,
      subject,
      qualification,
      joiningDate,
      address,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTeachers = async (req, res) => {
  try {
    const { Op } = require("sequelize");

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search?.trim();

    const where = {
      franchiseId: req.user.franchiseId,
    };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Teacher.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const {
      name,
      email,
      phone,
      role,
      dateOfBirth,
      gender,
      subject,
      qualification,
      joiningDate,
      address,
      status,
    } = req.body;
    
    await teacher.update({
      name,
      email,
      phone,
      role,
      dateOfBirth,
      gender,
      subject,
      qualification,
      joiningDate,
      address,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    await teacher.destroy();

    return res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
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
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
};