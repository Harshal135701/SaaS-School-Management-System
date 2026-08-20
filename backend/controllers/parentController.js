const bcrypt = require("bcryptjs");
const {
  Parent,
  Student,
  ParentStudent,
} = require("../models");

const createParent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingParent = await Parent.findOne({
      where: {
        email,
        franchiseId: req.user.franchiseId,
      },
    });

    if (existingParent) {
      return res.status(409).json({
        success: false,
        message: "Parent with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const parent = await Parent.create({
      franchiseId: req.user.franchiseId,
      name,
      email,
      phone,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Parent created successfully",
      data: {
        id: parent.id,
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        status: parent.status,
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

const assignStudent = async (req, res) => {
  try {
    const { parentId, studentId, relationship, isPrimary } = req.body;

    if (!parentId || !studentId || !relationship) {
      return res.status(400).json({
        success: false,
        message: "parentId, studentId and relationship are required",
      });
    }

    const parent = await Parent.findOne({
      where: {
        id: parentId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    const student = await Student.findOne({
      where: {
        id: studentId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const existingRelation = await ParentStudent.findOne({
      where: {
        parentId,
        studentId,
      },
    });

    if (existingRelation) {
      return res.status(409).json({
        success: false,
        message: "Parent is already assigned to this student",
      });
    }

    const relation = await ParentStudent.create({
      parentId,
      studentId,
      relationship,
      isPrimary: isPrimary || false,
    });

    return res.status(201).json({
      success: true,
      message: "Student assigned to parent successfully",
      data: relation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getParents = async (req, res) => {
  try {
    const parents = await Parent.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: Student,
          as: "students",
          attributes: ["id", "name", "email", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: parents,
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
  createParent,
  assignStudent,
  getParents,
};