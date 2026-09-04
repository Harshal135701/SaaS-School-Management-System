const { Timetable, Teacher } = require("../models");

const createTimetable = async (req, res) => {
  try {
    const {
      day,
      startTime,
      endTime,
      subject,
      teacherId,
      className,
      section,
      room,
    } = req.body;

    if (!day || !startTime || !endTime || !subject || !teacherId || !className) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const normalizedDay = day.toUpperCase();

    const validDays = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

    if (!validDays.includes(normalizedDay)) {
      return res.status(400).json({
        success: false,
        message: "Invalid day. Allowed days are Monday to Saturday",
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

    const timetable = await Timetable.create({
      franchiseId: req.user.franchiseId,
      day: normalizedDay,
      startTime,
      endTime,
      subject,
      teacherId,
      className,
      section,
      room,
    });

    return res.status(201).json({
      success: true,
      message: "Timetable created successfully",
      data: timetable,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTimetables = async (req, res) => {
  try {
    const {
      Timetable,
      Teacher,
      Student,
      ParentStudent,
      Class,
      Section,
    } = require("../models");

    const where = {
      franchiseId: req.user.franchiseId,
    };

    // Parent access
    if (req.user.role === "PARENT") {
      const relationship = await ParentStudent.findOne({
        where: {
          parentId: req.user.id,
          studentId: req.params.studentId,
        },
      });

      if (!relationship) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this student's timetable",
        });
      }

      const student = await Student.findOne({
        where: {
          id: req.params.studentId,
          franchiseId: req.user.franchiseId,
        },
        include: [
          {
            model: Class,
            as: "class",
            attributes: ["id", "name"],
          },
          {
            model: Section,
            as: "section",
            attributes: ["id", "name"],
          },
        ],
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      if (!student.class || !student.section) {
        return res.status(404).json({
          success: false,
          message: "Student class or section is not assigned",
        });
      }

      where.className = student.class.name;
      where.section = student.section.name;
    }

    const data = await Timetable.findAll({
      where,
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name", "subject"],
        },
      ],
      order: [
        ["day", "ASC"],
        ["startTime", "ASC"],
      ],
    });

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTimetableById = async (req, res) => {
  try {
    const data = await Timetable.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name", "subject"],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    await timetable.update(req.body);

    res.json({
      success: true,
      message: "Timetable updated successfully",
      data: timetable,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    await timetable.destroy();

    res.json({
      success: true,
      message: "Timetable deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createTimetable,
  getTimetables,
  getTimetableById,
  updateTimetable,
  deleteTimetable,
};