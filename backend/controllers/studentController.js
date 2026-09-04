const { Student, ParentStudent, Section } = require("../models");

const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      classId,
      sectionId,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Student name is required",
      });
    }

    const section = await Section.findOne({
      where: {
        id: sectionId,
        classId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!section) {
      return res.status(400).json({
        success: false,
        message: "Section does not belong to the selected class",
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
      classId,
      sectionId,
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
      ];
    }

    const { count, rows } = await Student.findAndCountAll({
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

const getStudentById = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.params.id;

    if (req.user.role === "PARENT") {
      const relationship = await ParentStudent.findOne({
        where: {
          parentId: req.user.id,
          studentId,
        },
      });

      if (!relationship) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to view this student",
        });
      }
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

    return res.status(200).json({
      success: true,
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

const updateStudent = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const {
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      status,
      classId,
      sectionId,
    } = req.body;

    const finalClassId = classId ?? student.classId;
    const finalSectionId = sectionId ?? student.sectionId;

    // Validate class + section only when assignment exists
    if (finalClassId || finalSectionId) {
      const section = await Section.findOne({
        where: {
          id: finalSectionId,
          classId: finalClassId,
          franchiseId: req.user.franchiseId,
        },
      });

      if (!section) {
        return res.status(400).json({
          success: false,
          message: "Section does not belong to the selected class",
        });
      }
    }

    await student.update({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(dateOfBirth !== undefined && { dateOfBirth }),
      ...(gender !== undefined && { gender }),
      ...(address !== undefined && { address }),
      ...(status !== undefined && { status }),
      ...(classId !== undefined && { classId: finalClassId }),
      ...(sectionId !== undefined && { sectionId: finalSectionId }),
    });

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
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

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await student.destroy();

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
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
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};

