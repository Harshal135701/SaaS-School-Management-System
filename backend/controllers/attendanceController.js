const { Attendance, Student } = require("../models");

const createAttendance = async (req, res) => {
  try {
    const { studentId, date, status, remarks } = req.body;

    if (!studentId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "studentId, date and status are required",
      });
    }

    const validStatuses = ["PRESENT", "ABSENT", "LATE"];

    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status",
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
        message: "Student not found in your franchise",
      });
    }

    const attendance = await Attendance.create({
      franchiseId: req.user.franchiseId,
      studentId,
      date,
      status: status.toUpperCase(),
      remarks,
    });

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAttendance = async (req, res) => {
    try {
        const { Attendance, Student } = require("../models");

        const { date } = req.query;

        const where = {
            franchiseId: req.user.franchiseId,
        };

        if (date) {
            where.date = date;
        }

        const attendance = await Attendance.findAll({
            where,
            include: [
                {
                    model: Student,
                    as: "student",
                    attributes: ["id", "name", "email"],
                },
            ],
            order: [["date", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getStudentAttendance = async (req, res) => {
  try {
    const { Attendance, Student, ParentStudent } = require("../models");

    const student = await Student.findOne({
      where: {
        id: req.params.studentId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your franchise",
      });
    }

    // Parent security check
    if (req.user.role === "PARENT") {
      const relationship = await ParentStudent.findOne({
        where: {
          parentId: req.user.id,
          studentId: student.id,
        },
      });

      if (!relationship) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this student's attendance",
        });
      }
    }

    const attendance = await Attendance.findAll({
      where: {
        studentId: student.id,
        franchiseId: req.user.franchiseId,
      },
      order: [["date", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
      },
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { status, remarks, date } = req.body;

    const attendance = await Attendance.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    await attendance.update({
      status,
      remarks,
      date,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    await attendance.destroy();

    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
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
  createAttendance,
  getAttendance,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance,
};