const {
  Timetable,
  Teacher,
  TeacherAssignment,
  Class,
  Section,
  Subject,
  SubjectRequirement,
  SchoolPeriod,
  Student,
  ParentStudent,
} = require("../models");

const { Op } = require("sequelize");

const VALID_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const validateReferences = async ({
  franchiseId,
  teacherId,
  classId,
  sectionId,
  subjectId,
  schoolPeriodId,
}) => {
  const [teacher, classRecord, section, subject, schoolPeriod] =
    await Promise.all([
      Teacher.findOne({
        where: { id: teacherId, franchiseId },
      }),
      Class.findOne({
        where: { id: classId, franchiseId },
      }),
      Section.findOne({
        where: { id: sectionId, franchiseId, classId },
      }),
      Subject.findOne({
        where: { id: subjectId, franchiseId },
      }),
      SchoolPeriod.findOne({
        where: {
          id: schoolPeriodId,
          franchiseId,
        },
      }),
    ]);

  if (!teacher) return { error: "Teacher not found", status: 404 };
  if (teacher.status !== "ACTIVE")
    return { error: "Cannot assign an inactive teacher", status: 400 };

  if (!classRecord)
    return { error: "Class not found", status: 404 };

  if (classRecord.isActive === false)
    return { error: "Cannot use an inactive class", status: 400 };

  if (!section)
    return { error: "Section not found for this class", status: 404 };

  if (section.isActive === false)
    return { error: "Cannot use an inactive section", status: 400 };

  if (!subject)
    return { error: "Subject not found", status: 404 };

  if (subject.isActive === false)
    return { error: "Cannot use an inactive subject", status: 400 };

  if (!schoolPeriod)
    return { error: "School period not found", status: 404 };

  if (!schoolPeriod.isActive)
    return { error: "Cannot use an inactive school period", status: 400 };

  if (schoolPeriod.isBreak)
    return { error: "Cannot create timetable during a break period", status: 400 };

  return {
    teacher,
    classRecord,
    section,
    subject,
    schoolPeriod,
  };
};

const checkTeacherAssignment = async ({
  franchiseId,
  teacherId,
  classId,
  sectionId,
  subjectId,
}) => {
  return TeacherAssignment.findOne({
    where: {
      franchiseId,
      teacherId,
      classId,
      sectionId,
      subjectId,
      status: "ACTIVE",
    },
  });
};

const checkConflicts = async ({
  franchiseId,
  day,
  schoolPeriodId,
  teacherId,
  classId,
  sectionId,
  room,
  excludeId,
}) => {
  const baseWhere = {
    franchiseId,
    day,
    schoolPeriodId,
    ...(excludeId && {
      id: {
        [Op.ne]: excludeId,
      },
    }),
  };

  const teacherConflict = await Timetable.findOne({
    where: {
      ...baseWhere,
      teacherId,
    },
  });

  if (teacherConflict) {
    return "Teacher is already assigned during this period";
  }

  const classConflict = await Timetable.findOne({
    where: {
      ...baseWhere,
      classId,
      sectionId,
    },
  });

  if (classConflict) {
    return "This class and section already have a timetable entry during this period";
  }

  if (room && room.trim()) {
    const roomConflict = await Timetable.findOne({
      where: {
        ...baseWhere,
        room: room.trim(),
      },
    });

    if (roomConflict) {
      return "Room is already occupied during this period";
    }
  }

  return null;
};

const checkWeeklyRequirement = async ({
  franchiseId,
  classId,
  subjectId,
  excludeId,
}) => {
  const requirement = await SubjectRequirement.findOne({
    where: {
      franchiseId,
      classId,
      subjectId,
      isActive: true,
    },
  });

  if (!requirement) return null;

  const where = {
    franchiseId,
    classId,
    subjectId,
    ...(excludeId && {
      id: {
        [Op.ne]: excludeId,
      },
    }),
  };

  const count = await Timetable.count({ where });

  if (count >= requirement.periodsPerWeek) {
    return `Weekly requirement reached. Maximum ${requirement.periodsPerWeek} periods per week allowed.`;
  }

  return null;
};

const createTimetable = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const {
      day,
      schoolPeriodId,
      classId,
      sectionId,
      subjectId,
      teacherId,
      room,
    } = req.body;

    if (
      !day ||
      !schoolPeriodId ||
      !classId ||
      !sectionId ||
      !subjectId ||
      !teacherId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "day, schoolPeriodId, classId, sectionId, subjectId and teacherId are required",
      });
    }

    const normalizedDay = day.toUpperCase();

    if (!VALID_DAYS.includes(normalizedDay)) {
      return res.status(400).json({
        success: false,
        message: "Invalid day. Allowed days are Monday to Saturday",
      });
    }

    const refs = await validateReferences({
      franchiseId,
      teacherId,
      classId,
      sectionId,
      subjectId,
      schoolPeriodId,
    });

    if (refs.error) {
      return res.status(refs.status).json({
        success: false,
        message: refs.error,
      });
    }

    const assignment = await checkTeacherAssignment({
      franchiseId,
      teacherId,
      classId,
      sectionId,
      subjectId,
    });

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message:
          "Teacher is not assigned to this class, section and subject",
      });
    }

    const conflict = await checkConflicts({
      franchiseId,
      day: normalizedDay,
      schoolPeriodId,
      teacherId,
      classId,
      sectionId,
      room,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: conflict,
      });
    }

    const weeklyError = await checkWeeklyRequirement({
      franchiseId,
      classId,
      subjectId,
    });

    if (weeklyError) {
      return res.status(409).json({
        success: false,
        message: weeklyError,
      });
    }

    const timetable = await Timetable.create({
      franchiseId,
      day: normalizedDay,
      schoolPeriodId,
      classId,
      sectionId,
      subjectId,
      teacherId,
      room: room?.trim() || null,
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

const getTImetableIncludes = [
  {
    model: Teacher,
    as: "teacher",
    attributes: ["id", "name"],
  },
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
  {
    model: Subject,
    as: "subject",
    attributes: ["id", "name", "code"],
  },
  {
    model: SchoolPeriod,
    as: "schoolPeriod",

    attributes: [
      "id",
      "periodNumber",
      "name",
      "startTime",
      "endTime",
      "isBreak",
      "isActive",
    ],


  },
];

const getTimetables = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const where = { franchiseId };

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
          franchiseId,
        },
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      where.classId = student.classId;
      where.sectionId = student.sectionId;
    }

    if (req.query.day) {
      const day = req.query.day.toUpperCase();

      if (!VALID_DAYS.includes(day)) {
        return res.status(400).json({
          success: false,
          message: "Invalid day",
        });
      }

      where.day = day;
    }

    if (req.query.classId) where.classId = req.query.classId;
    if (req.query.sectionId) where.sectionId = req.query.sectionId;
    if (req.query.teacherId) where.teacherId = req.query.teacherId;
    if (req.query.subjectId) where.subjectId = req.query.subjectId;

    const data = await Timetable.findAll({
      where,
      include: getTImetableIncludes,
      order: [
        ["day", "ASC"],
        [{ model: SchoolPeriod, as: "schoolPeriod" }, "periodNumber", "ASC"],
      ],
    });

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get timetables error:", error);

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
      include: getTImetableIncludes,
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get timetable error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const timetable = await Timetable.findOne({
      where: {
        id,
        franchiseId,
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
      schoolPeriodId,
      classId,
      sectionId,
      subjectId,
      teacherId,
      room,
    } = req.body;

    const finalDay = day
      ? day.toUpperCase()
      : timetable.day;

    const finalSchoolPeriodId =
      schoolPeriodId ?? timetable.schoolPeriodId;

    const finalClassId =
      classId ?? timetable.classId;

    const finalSectionId =
      sectionId ?? timetable.sectionId;

    const finalSubjectId =
      subjectId ?? timetable.subjectId;

    const finalTeacherId =
      teacherId ?? timetable.teacherId;

    const finalRoom =
      room !== undefined
        ? room?.trim() || null
        : timetable.room;

    if (!VALID_DAYS.includes(finalDay)) {
      return res.status(400).json({
        success: false,
        message: "Invalid day",
      });
    }

    const refs = await validateReferences({
      franchiseId,
      teacherId: finalTeacherId,
      classId: finalClassId,
      sectionId: finalSectionId,
      subjectId: finalSubjectId,
      schoolPeriodId: finalSchoolPeriodId,
    });

    if (refs.error) {
      return res.status(refs.status).json({
        success: false,
        message: refs.error,
      });
    }

    const assignment = await checkTeacherAssignment({
      franchiseId,
      teacherId: finalTeacherId,
      classId: finalClassId,
      sectionId: finalSectionId,
      subjectId: finalSubjectId,
    });

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message:
          "Teacher is not assigned to this class, section and subject",
      });
    }

    const conflict = await checkConflicts({
      franchiseId,
      day: finalDay,
      schoolPeriodId: finalSchoolPeriodId,
      teacherId: finalTeacherId,
      classId: finalClassId,
      sectionId: finalSectionId,
      room: finalRoom,
      excludeId: id,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: conflict,
      });
    }

    const weeklyError = await checkWeeklyRequirement({
      franchiseId,
      classId: finalClassId,
      subjectId: finalSubjectId,
      excludeId: id,
    });

    if (weeklyError) {
      return res.status(409).json({
        success: false,
        message: weeklyError,
      });
    }

    await timetable.update({
      day: finalDay,
      schoolPeriodId: finalSchoolPeriodId,
      classId: finalClassId,
      sectionId: finalSectionId,
      subjectId: finalSubjectId,
      teacherId: finalTeacherId,
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

    return res.json({
      success: true,
      message: "Timetable deleted successfully",
    });
  } catch (error) {
    console.error("Delete timetable error:", error);

    return res.status(500).json({
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