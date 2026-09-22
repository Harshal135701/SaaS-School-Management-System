const { Op } = require("sequelize");
const {
  Student,
  ParentStudent,
  Section,
  Class,
} = require("../models");

const validateClassAndSection = async ({
  classId,
  sectionId,
  franchiseId,
  allowInactive = false,
}) => {
  if (!classId || !sectionId) {
    return {
      error: "Class and section are required",
    };
  }

  const classData = await Class.findOne({
    where: {
      id: classId,
      franchiseId,
    },
  });

  if (!classData) {
    return {
      error: "Class not found",
    };
  }

  if (!allowInactive && !classData.isActive) {
    return {
      error: "Cannot assign student to an inactive class",
    };
  }

  const section = await Section.findOne({
    where: {
      id: sectionId,
      classId,
      franchiseId,
    },
  });

  if (!section) {
    return {
      error: "Section does not belong to the selected class",
    };
  }

  if (!allowInactive && !section.isActive) {
    return {
      error: "Cannot assign student to an inactive section",
    };
  }

  if (section.capacity !== null) {
    const studentCount = await Student.count({
      where: {
        sectionId,
      },
    });


    if (studentCount >= section.capacity) {
      return {
        error: "Selected section has reached its capacity",
      };
    }


  }

  return {
    classData,
    section,
  };
};

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


    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Student name is required",
      });
    }

    const validation = await validateClassAndSection({
      classId,
      sectionId,
      franchiseId: req.user.franchiseId,
    });

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const student = await Student.create({
      franchiseId: req.user.franchiseId,
      name: name.trim(),
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
    console.error("Create Student Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });


  }
};

const getStudents = async (req, res) => {
  try {
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
    console.error("Get Students Error:", error);


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
      include: [
        {
          model: Class,
          as: "class",
          attributes: ["id", "name", "code", "numericValue", "isActive"],
        },
        {
          model: Section,
          as: "section",
          attributes: ["id", "name", "capacity", "isActive", "classId"],
        },
      ],
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
    console.error("Get Student Error:", error);

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

    if (
      classId !== undefined ||
      sectionId !== undefined
    ) {
      const validation = await validateClassAndSection({
        classId: finalClassId,
        sectionId: finalSectionId,
        franchiseId: req.user.franchiseId,
      });

      if (validation.error) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      // Do not count the current student against section capacity.
      if (
        validation.section.capacity !== null &&
        finalSectionId !== student.sectionId
      ) {
        const studentCount = await Student.count({
          where: {
            sectionId: finalSectionId,
          },
        });

        if (studentCount >= validation.section.capacity) {
          return res.status(400).json({
            success: false,
            message: "Selected section has reached its capacity",
          });
        }
      }
    }

    await student.update({
      ...(name !== undefined && {
        name: name.trim(),
      }),

      ...(email !== undefined && {
        email,
      }),

      ...(phone !== undefined && {
        phone,
      }),

      ...(dateOfBirth !== undefined && {
        dateOfBirth,
      }),

      ...(gender !== undefined && {
        gender,
      }),

      ...(address !== undefined && {
        address,
      }),

      ...(status !== undefined && {
        status,
      }),

      ...(classId !== undefined && {
        classId: finalClassId,
      }),

      ...(sectionId !== undefined && {
        sectionId: finalSectionId,
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });


  } catch (error) {
    console.error("Update Student Error:", error);

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
    console.error("Delete Student Error:", error);


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
