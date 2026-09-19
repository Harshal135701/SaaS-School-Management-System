const {
  Timetable,
  Teacher,
  TeacherAssignment,
  Class,
  Section,
  Subject,
  SubjectRequirement,
  SchoolPeriod,
} = require("../models");

const { Op } = require("sequelize");

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

    // 1. Required fields
    if (
      !day ||
      !startTime ||
      !endTime ||
      !subject ||
      !teacherId ||
      !className
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // 2. Validate day
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

    // 3. Validate time
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be greater than start time",
      });
    }

    // Check configured school period
    const schoolPeriod = await SchoolPeriod.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        startTime,
        endTime,
        isActive: true,
        isBreak: false,
      },
    });

    if (!schoolPeriod) {
      return res.status(400).json({
        success: false,
        message: "Timetable time must match a configured school period",
      });
    }

    // 4. Check teacher
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

    if (teacher.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign an inactive teacher",
      });
    }

    // 5. Check class
    const classRecord = await Class.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        name: className,
      },
    });

    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // 6. Check section
    let sectionRecord = null;

    if (section) {
      sectionRecord = await Section.findOne({
        where: {
          franchiseId: req.user.franchiseId,
          classId: classRecord.id,
          name: section,
        },
      });

      if (!sectionRecord) {
        return res.status(404).json({
          success: false,
          message: "Section not found for this class",
        });
      }
    }

    // 7. Check subject
    const subjectRecord = await Subject.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        name: subject,
        isActive: true,
      },
    });

    if (!subjectRecord) {
      return res.status(404).json({
        success: false,
        message: "Subject not found or inactive",
      });
    }

    // 8. Check teacher assignment
    const assignmentWhere = {
      franchiseId: req.user.franchiseId,
      teacherId,
      classId: classRecord.id,
      subjectId: subjectRecord.id,
    };

    if (sectionRecord) {
      assignmentWhere.sectionId = sectionRecord.id;
    }

    const teacherAssignment = await TeacherAssignment.findOne({
      where: assignmentWhere,
    });

    if (!teacherAssignment) {
      return res.status(400).json({
        success: false,
        message: "Teacher is not assigned to this class, section and subject",
      });
    }

    // 9. Check teacher conflict
    const teacherConflict = await Timetable.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        day: normalizedDay,
        teacherId,
        startTime: {
          [Op.lt]: endTime,
        },
        endTime: {
          [Op.gt]: startTime,
        },
      },
    });

    if (teacherConflict) {
      return res.status(409).json({
        success: false,
        message: "Teacher is already assigned during this time",
      });
    }

    // 10. Check class + section conflict
    const classConflict = await Timetable.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        day: normalizedDay,
        className,
        section: section || null,
        startTime: {
          [Op.lt]: endTime,
        },
        endTime: {
          [Op.gt]: startTime,
        },
      },
    });

    if (classConflict) {
      return res.status(409).json({
        success: false,
        message: "This class already has a timetable entry during this time",
      });
    }

    // 11. Check room conflict
    if (room) {
      const roomConflict = await Timetable.findOne({
        where: {
          franchiseId: req.user.franchiseId,
          day: normalizedDay,
          room,
          startTime: {
            [Op.lt]: endTime,
          },
          endTime: {
            [Op.gt]: startTime,
          },
        },
      });

      if (roomConflict) {
        return res.status(409).json({
          success: false,
          message: "Room is already occupied during this time",
        });
      }
    }

    // 9. Check weekly subject requirement
    const subjectRequirement = await SubjectRequirement.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        classId: classRecord.id,
        subjectId: subjectRecord.id,
        isActive: true,
      },
    });

    if (subjectRequirement) {
      const weeklySubjectCount = await Timetable.count({
        where: {
          franchiseId: req.user.franchiseId,
          className,
          section: section || null,
          subject,
        },
      });

      if (weeklySubjectCount >= subjectRequirement.periodsPerWeek) {
        return res.status(409).json({
          success: false,
          message: `Weekly requirement reached for ${subject}. Maximum ${subjectRequirement.periodsPerWeek} periods per week allowed.`,
        });
      }
    }

    // 12. Create timetable
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
    console.error("Create timetable error:", error);

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
    const { id } = req.params;

    const timetable = await Timetable.findOne({
      where: {
        id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

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

    const finalDay =
      day !== undefined ? day.toUpperCase() : timetable.day;

    const finalStartTime =
      startTime !== undefined ? startTime : timetable.startTime;

    const finalEndTime =
      endTime !== undefined ? endTime : timetable.endTime;

    const finalSubject =
      subject !== undefined ? subject : timetable.subject;

    const finalTeacherId =
      teacherId !== undefined ? teacherId : timetable.teacherId;

    const finalClassName =
      className !== undefined ? className : timetable.className;

    const finalSection =
      section !== undefined ? section : timetable.section;

    const finalRoom =
      room !== undefined ? room : timetable.room;

    // 1. Validate day
    const validDays = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

    if (!validDays.includes(finalDay)) {
      return res.status(400).json({
        success: false,
        message: "Invalid day. Allowed days are Monday to Saturday",
      });
    }

    // 2. Validate time
    if (finalStartTime >= finalEndTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be greater than start time",
      });
    }

    // 3. Validate configured school period
    const schoolPeriod = await SchoolPeriod.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        startTime: finalStartTime,
        endTime: finalEndTime,
        isActive: true,
        isBreak: false,
      },
    });

    if (!schoolPeriod) {
      return res.status(400).json({
        success: false,
        message: "Timetable time must match a configured school period",
      });
    }

    // 4. Check teacher
    const teacher = await Teacher.findOne({
      where: {
        id: finalTeacherId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    if (teacher.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign an inactive teacher",
      });
    }

    // 5. Check class
    const classRecord = await Class.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        name: finalClassName,
      },
    });

    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // 6. Check section
    let sectionRecord = null;

    if (finalSection) {
      sectionRecord = await Section.findOne({
        where: {
          franchiseId: req.user.franchiseId,
          classId: classRecord.id,
          name: finalSection,
        },
      });

      if (!sectionRecord) {
        return res.status(404).json({
          success: false,
          message: "Section not found for this class",
        });
      }
    }

    // 7. Check subject
    const subjectRecord = await Subject.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        name: finalSubject,
        isActive: true,
      },
    });

    if (!subjectRecord) {
      return res.status(404).json({
        success: false,
        message: "Subject not found or inactive",
      });
    }

    // 8. Check teacher assignment
    const assignmentWhere = {
      franchiseId: req.user.franchiseId,
      teacherId: finalTeacherId,
      classId: classRecord.id,
      subjectId: subjectRecord.id,
    };

    if (sectionRecord) {
      assignmentWhere.sectionId = sectionRecord.id;
    }

    const teacherAssignment = await TeacherAssignment.findOne({
      where: assignmentWhere,
    });

    if (!teacherAssignment) {
      return res.status(400).json({
        success: false,
        message: "Teacher is not assigned to this class, section and subject",
      });
    }

    // 9. Check weekly subject requirement
    const subjectRequirement = await SubjectRequirement.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        classId: classRecord.id,
        subjectId: subjectRecord.id,
        isActive: true,
      },
    });

    if (subjectRequirement) {
      const weeklySubjectCount = await Timetable.count({
        where: {
          franchiseId: req.user.franchiseId,
          className: finalClassName,
          section: finalSection || null,
          subject: finalSubject,
          id: {
            [Op.ne]: id,
          },
        },
      });

      if (
        weeklySubjectCount >=
        subjectRequirement.periodsPerWeek
      ) {
        return res.status(409).json({
          success: false,
          message: `Weekly requirement reached for ${finalSubject}. Maximum ${subjectRequirement.periodsPerWeek} periods per week allowed.`,
        });
      }
    }

    // 10. Teacher conflict
    const teacherConflict = await Timetable.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        day: finalDay,
        teacherId: finalTeacherId,
        id: {
          [Op.ne]: id,
        },
        startTime: {
          [Op.lt]: finalEndTime,
        },
        endTime: {
          [Op.gt]: finalStartTime,
        },
      },
    });

    if (teacherConflict) {
      return res.status(409).json({
        success: false,
        message: "Teacher is already assigned during this time",
      });
    }

    // 11. Class + section conflict
    const classConflict = await Timetable.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        day: finalDay,
        className: finalClassName,
        section: finalSection || null,
        id: {
          [Op.ne]: id,
        },
        startTime: {
          [Op.lt]: finalEndTime,
        },
        endTime: {
          [Op.gt]: finalStartTime,
        },
      },
    });

    if (classConflict) {
      return res.status(409).json({
        success: false,
        message: "This class already has a timetable entry during this time",
      });
    }

    // 12. Room conflict
    if (finalRoom) {
      const roomConflict = await Timetable.findOne({
        where: {
          franchiseId: req.user.franchiseId,
          day: finalDay,
          room: finalRoom,
          id: {
            [Op.ne]: id,
          },
          startTime: {
            [Op.lt]: finalEndTime,
          },
          endTime: {
            [Op.gt]: finalStartTime,
          },
        },
      });

      if (roomConflict) {
        return res.status(409).json({
          success: false,
          message: "Room is already occupied during this time",
        });
      }
    }

    // 13. Update timetable
    await timetable.update({
      day: finalDay,
      startTime: finalStartTime,
      endTime: finalEndTime,
      subject: finalSubject,
      teacherId: finalTeacherId,
      className: finalClassName,
      section: finalSection,
      room: finalRoom,
    });

    return res.status(200).json({
      success: true,
      message: "Timetable updated successfully",
      data: timetable,
    });
  } catch (error) {
    console.error("Update timetable error:", error);

    return res.status(500).json({
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