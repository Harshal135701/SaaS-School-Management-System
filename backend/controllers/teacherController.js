const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { Teacher, TeacherAssignment } = require("../models");

const VALID_STAFF_TYPES = ["TEACHING", "NON_TEACHING"];

const VALID_ROLES = [
  "TEACHER",
  "HOD",
  "PRINCIPAL",
  "ACCOUNTANT",
  "DATA_ENTRY",
  "SUPPORT",
];

const VALID_GENDERS = ["MALE", "FEMALE", "OTHER"];
const VALID_STATUSES = ["ACTIVE", "INACTIVE"];

const createTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      staffType = "TEACHING",
      role = "TEACHER",
      password,
      dateOfBirth,
      gender,
      qualification,
      joiningDate,
      address,
      panNumber,
      aadhaarNumber,
    } = req.body;


    if (!name?.trim() || !email?.trim() || !password || !panNumber?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and PAN number are required",
      });
    }

    if (!VALID_STAFF_TYPES.includes(staffType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff type",
      });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff role",
      });
    }

    if (gender && !VALID_GENDERS.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender",
      });
    }

    if (req.user.role === "HOD" && ["HOD", "PRINCIPAL"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "HOD cannot create HOD or PRINCIPAL staff",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPAN = panNumber.trim().toUpperCase();

    const existingTeacher = await Teacher.unscoped().findOne({
      where: {
        franchiseId: req.user.franchiseId,
        [Op.or]: [
          { email: normalizedEmail },
          { panNumber: normalizedPAN },
        ],
      },
    });

    if (existingTeacher) {
      return res.status(409).json({
        success: false,
        message:
          existingTeacher.email === normalizedEmail
            ? "A teacher with this email already exists"
            : "A teacher with this PAN already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const teacher = await Teacher.create({
      franchiseId: req.user.franchiseId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      password: hashedPassword,
      staffType,
      role,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      qualification: qualification?.trim() || null,
      joiningDate: joiningDate || null,
      address: address?.trim() || null,
      panNumber: normalizedPAN,
      aadhaarNumber: aadhaarNumber?.trim() || null,
      status: "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
    });

  } catch (error) {
    console.error("Create Teacher Error:", error);


    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });


  }
};

const getTeachers = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
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
        { panNumber: { [Op.iLike]: `%${search}%` } },
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
    console.error("Get Teachers Error:", error);

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
    console.error("Get Teacher Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });


  }
};

const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.unscoped().findOne({
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
      ["HOD", "PRINCIPAL"].includes(teacher.role)
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
      qualification,
      joiningDate,
      address,
      panNumber,
      aadhaarNumber,
      status,
      password,
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

    if (gender && !VALID_GENDERS.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender",
      });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    if (
      req.user.role === "HOD" &&
      role &&
      ["HOD", "PRINCIPAL"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "HOD cannot assign HOD or PRINCIPAL role",
      });
    }

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPAN = panNumber?.trim().toUpperCase();

    if (normalizedEmail || normalizedPAN) {
      const duplicateConditions = [];

      if (normalizedEmail) {
        duplicateConditions.push({ email: normalizedEmail });
      }

      if (normalizedPAN) {
        duplicateConditions.push({ panNumber: normalizedPAN });
      }

      const duplicate = await Teacher.unscoped().findOne({
        where: {
          franchiseId: req.user.franchiseId,
          id: { [Op.ne]: teacher.id },
          [Op.or]: duplicateConditions,
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            normalizedEmail && duplicate.email === normalizedEmail
              ? "A teacher with this email already exists"
              : "A teacher with this PAN already exists",
        });
      }
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = normalizedEmail;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (staffType !== undefined) updateData.staffType = staffType;
    if (role !== undefined) updateData.role = role;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth || null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (qualification !== undefined)
      updateData.qualification = qualification?.trim() || null;
    if (joiningDate !== undefined) updateData.joiningDate = joiningDate || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (panNumber !== undefined) updateData.panNumber = normalizedPAN;
    if (aadhaarNumber !== undefined)
      updateData.aadhaarNumber = aadhaarNumber?.trim() || null;
    if (status !== undefined) updateData.status = status;

    if (password !== undefined && password !== "") {
      updateData.password = await bcrypt.hash(password, 12);
    }

    await teacher.update(updateData);

    const updatedTeacher = await Teacher.findOne({
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
    console.error("Update Teacher Error:", error);


    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });


  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.unscoped().findOne({
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

    if (teacher.status === "INACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Teacher is already inactive",
      });
    }

    // Deactivate teacher
    await teacher.update({
      status: "INACTIVE",
    });

    // Deactivate all active assignments of this teacher
    await TeacherAssignment.update(
      {
        status: "INACTIVE",
      },
      {
        where: {
          teacherId: teacher.id,
          franchiseId: req.user.franchiseId,
          status: "ACTIVE",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Teacher deactivated successfully and active assignments were deactivated",
    });
  } catch (error) {
    console.error("Delete Teacher Error:", error);

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
