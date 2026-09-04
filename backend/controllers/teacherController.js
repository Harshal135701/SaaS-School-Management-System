const bcrypt = require("bcryptjs");
const { Teacher } = require("../models");

const VALID_STAFF_TYPES = ["TEACHING", "NON_TEACHING"];

const VALID_ROLES = [
  "TEACHER",
  "HOD",
  "PRINCIPAL",
  "ACCOUNTANT",
  "DATA_ENTRY",
  "SUPPORT",
];

const createTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      staffType,
      role,
      password,
      dateOfBirth,
      gender,
      subject,
      qualification,
      joiningDate,
      address,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (staffType && !VALID_STAFF_TYPES.includes(staffType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff type",
      });
    }

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff role",
      });
    }

    if (
      req.user.role === "HOD" &&
      (role === "HOD" || role === "PRINCIPAL")
    ) {
      return res.status(403).json({
        success: false,
        message: "HOD cannot create HOD or PRINCIPAL staff",
      });
    }

    const existingTeacher = await Teacher.findOne({
      where: {
        email,
        franchiseId: req.user.franchiseId,
      },
    });

    if (existingTeacher) {
      return res.status(409).json({
        success: false,
        message: "A teacher with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      franchiseId: req.user.franchiseId,
      name,
      email,
      phone,
      password: hashedPassword,
      staffType: staffType || "TEACHING",
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
      data: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        staffType: teacher.staffType,
        role: teacher.role,
        dateOfBirth: teacher.dateOfBirth,
        gender: teacher.gender,
        subject: teacher.subject,
        qualification: teacher.qualification,
        joiningDate: teacher.joiningDate,
        address: teacher.address,
        status: teacher.status,
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
      attributes: { exclude: ["password"] },
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
      attributes: { exclude: ["password"] },
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

    if (
      req.user.role === "HOD" &&
      (teacher.role === "HOD" || teacher.role === "PRINCIPAL")
    ) {
      return res.status(403).json({
        success: false,
        message: "HOD cannot modify HOD or PRINCIPAL staff",
      });
    }

    const {
      name,
      email,
      phone,
      staffType,
      role,
      dateOfBirth,
      gender,
      subject,
      qualification,
      joiningDate,
      address,
      status,
    } = req.body;

    if (staffType && !VALID_STAFF_TYPES.includes(staffType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff type",
      });
    }

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff role",
      });
    }

    if (
      req.user.role === "HOD" &&
      (role === "HOD" || role === "PRINCIPAL")
    ) {
      return res.status(403).json({
        success: false,
        message: "HOD cannot assign HOD or PRINCIPAL role",
      });
    }

    if (email && email !== teacher.email) {
      const existingTeacher = await Teacher.findOne({
        where: {
          email,
          franchiseId: req.user.franchiseId,
        },
      });

      if (existingTeacher && existingTeacher.id !== teacher.id) {
        return res.status(409).json({
          success: false,
          message: "A teacher with this email already exists",
        });
      }
    }

    await teacher.update({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(staffType !== undefined && { staffType }),
      ...(role !== undefined && { role }),
      ...(dateOfBirth !== undefined && { dateOfBirth }),
      ...(gender !== undefined && { gender }),
      ...(subject !== undefined && { subject }),
      ...(qualification !== undefined && { qualification }),
      ...(joiningDate !== undefined && { joiningDate }),
      ...(address !== undefined && { address }),
      ...(status !== undefined && { status }),
    });

    const updatedTeacher = await Teacher.findOne({
      attributes: { exclude: ["password"] },
      where: {
        id: teacher.id,
        franchiseId: req.user.franchiseId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
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