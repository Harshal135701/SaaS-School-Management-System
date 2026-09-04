const { Homework, Teacher, Class, Section } = require("../models");

const createHomework = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      dueDate,
      status,
      classId,
      sectionId,
    } = req.body;

    const teacherId =
      req.user.role === "TEACHER"
        ? req.user.id
        : req.body.teacherId;

    if (!title || !subject || !dueDate || !classId || !sectionId) {
      return res.status(400).json({
        success: false,
        message:
          "teacherId, title, subject, dueDate, classId and sectionId are required",
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
        message: "Teacher not found in your franchise",
      });
    }

    const homework = await Homework.create({
      franchiseId: req.user.franchiseId,
      teacherId,
      classId,
      sectionId,
      title,
      description,
      subject,
      dueDate,
      status: status || "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      message: "Homework created successfully",
      data: homework,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getHomeworks = async (req, res) => {
  try {
    const { Op } = require("sequelize");
    const { Homework, Teacher, Class, Section, ParentStudent, Student } =
      require("../models");

    const where = {
      franchiseId: req.user.franchiseId,
    };

    // Parent can only see homework for their assigned students
    if (req.user.role === "PARENT") {
      const parentStudents = await ParentStudent.findAll({
        where: {
          parentId: req.user.id,
        },
        attributes: ["studentId"],
      });

      const studentIds = parentStudents.map((item) => item.studentId);

      if (studentIds.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      const students = await Student.findAll({
        where: {
          id: {
            [Op.in]: studentIds,
          },
          franchiseId: req.user.franchiseId,
        },
        attributes: ["classId", "sectionId"],
      });

      const classSectionPairs = students
        .filter((student) => student.classId && student.sectionId)
        .map((student) => ({
          classId: student.classId,
          sectionId: student.sectionId,
        }));

      if (classSectionPairs.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      where[Op.or] = classSectionPairs;
    }

    const homeworks = await Homework.findAll({
      where,
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name", "subject"],
        },
        {
          model: Class,
          as: "class",
          attributes: ["id", "name", "code"],
        },
        {
          model: Section,
          as: "section",
          attributes: ["id", "name", "capacity"],
        },
      ],
      order: [["dueDate", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: homeworks.length,
      data: homeworks,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getHomeworkById = async (req, res) => {
  try {
    const { Op } = require("sequelize");
    const { Homework, Teacher, Class, Section, ParentStudent, Student } =
      require("../models");

    const where = {
      id: req.params.id,
      franchiseId: req.user.franchiseId,
    };

    // Parent can only access homework assigned to their student's class/section
    if (req.user.role === "PARENT") {
      const parentStudents = await ParentStudent.findAll({
        where: {
          parentId: req.user.id,
        },
        attributes: ["studentId"],
      });

      const studentIds = parentStudents.map((item) => item.studentId);

      const students = await Student.findAll({
        where: {
          id: {
            [Op.in]: studentIds,
          },
          franchiseId: req.user.franchiseId,
        },
        attributes: ["classId", "sectionId"],
      });

      const classSectionPairs = students
        .filter((student) => student.classId && student.sectionId)
        .map((student) => ({
          classId: student.classId,
          sectionId: student.sectionId,
        }));

      if (classSectionPairs.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Homework not found",
        });
      }

      where[Op.or] = classSectionPairs;
    }

    const homework = await Homework.findOne({
      where,
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name", "subject"],
        },
        {
          model: Class,
          as: "class",
          attributes: ["id", "name", "code"],
        },
        {
          model: Section,
          as: "section",
          attributes: ["id", "name", "capacity"],
        },
      ],
    });

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: "Homework not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: homework,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const updateHomework = async (req, res) => {
  try {
    const {
      teacherId,
      title,
      description,
      subject,
      dueDate,
      status,
      classId,
      sectionId,
    } = req.body;

    const homework = await Homework.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: "Homework not found",
      });
    }

    if (teacherId) {
      const teacher = await Teacher.findOne({
        where: {
          id: teacherId,
          franchiseId: req.user.franchiseId,
        },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found in your franchise",
        });
      }
    }

    if (classId) {
      const classExists = await Class.findOne({
        where: {
          id: classId,
          franchiseId: req.user.franchiseId,
        },
      });

      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: "Class not found in your franchise",
        });
      }
    }

    if (sectionId) {
      const sectionExists = await Section.findOne({
        where: {
          id: sectionId,
          franchiseId: req.user.franchiseId,
        },
      });

      if (!sectionExists) {
        return res.status(404).json({
          success: false,
          message: "Section not found in your franchise",
        });
      }
    }

    await homework.update({
      teacherId,
      title,
      description,
      subject,
      dueDate,
      status,
      classId,
      sectionId,
    });

    return res.status(200).json({
      success: true,
      message: "Homework updated successfully",
      data: homework,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteHomework = async (req, res) => {
  try {
    const homework = await Homework.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: "Homework not found",
      });
    }

    await homework.destroy();

    return res.status(200).json({
      success: true,
      message: "Homework deleted successfully",
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
  createHomework,
  getHomeworks,
  getHomeworkById,
  updateHomework,
  deleteHomework,
};

