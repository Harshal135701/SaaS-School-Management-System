const {
  ExamResult,
  Examination,
  Student,
} = require("../models");

// CREATE MARKS
const createExamResult = async (req, res) => {
  try {
    const {
      examinationId,
      studentId,
      obtainedMarks,
      remarks,
    } = req.body;

    const franchiseId = req.user.franchiseId;

    if (!examinationId || !studentId || obtainedMarks === undefined) {
      return res.status(400).json({
        success: false,
        message: "Examination, student and obtained marks are required",
      });
    }

    const examination = await Examination.findOne({
      where: {
        id: examinationId,
        franchiseId,
      },
    });

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    const student = await Student.findOne({
      where: {
        id: studentId,
        franchiseId,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (
      obtainedMarks < 0 ||
      obtainedMarks > examination.totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${examination.totalMarks}`,
      });
    }

    const existingResult = await ExamResult.findOne({
      where: {
        examinationId,
        studentId,
        franchiseId,
      },
    });

    if (existingResult) {
      return res.status(409).json({
        success: false,
        message: "Marks already entered for this student",
      });
    }

    const result = await ExamResult.create({
      franchiseId,
      examinationId,
      studentId,
      obtainedMarks,
      remarks,
    });

    return res.status(201).json({
      success: true,
      message: "Marks added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create exam result error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add marks",
      error: error.message,
    });
  }
};

// GET ALL MARKS
const getExamResults = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { ParentStudent } = require("../models");

    const where = { franchiseId };

    // Parent can only see their linked student's results
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
          message: "You do not have access to this student's results",
        });
      }

      where.studentId = req.params.studentId;
    }

    const results = await ExamResult.findAll({
      where,
      attributes: [
        "id",
        "examinationId",
        "studentId",
        "obtainedMarks",
        "remarks",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Examination,
          as: "examination",
          attributes: [
            "id",
            "name",
            "subject",
            "examDate",
            "totalMarks",
            "passingMarks",
            "status",
          ],
        },
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Get exam results error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch marks",
    });
  }
};

// GET MARKS BY EXAM
const getResultsByExamination = async (req, res) => {
  try {
    const { examinationId } = req.params;
    const franchiseId = req.user.franchiseId;

    const examination = await Examination.findOne({
      where: {
        id: examinationId,
        franchiseId,
      },
    });

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    const results = await ExamResult.findAll({
      where: {
        examinationId,
        franchiseId,
      },
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Get results by examination error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch examination marks",
      error: error.message,
    });
  }
};

// UPDATE MARKS
const updateExamResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { obtainedMarks, remarks } = req.body;

    const franchiseId = req.user.franchiseId;

    const result = await ExamResult.findOne({
      where: {
        id,
        franchiseId,
      },
      include: [
        {
          model: Examination,
          as: "examination",
        },
      ],
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Marks record not found",
      });
    }

    if (obtainedMarks !== undefined) {
      if (
        obtainedMarks < 0 ||
        obtainedMarks > result.examination.totalMarks
      ) {
        return res.status(400).json({
          success: false,
          message: `Marks must be between 0 and ${result.examination.totalMarks}`,
        });
      }

      result.obtainedMarks = obtainedMarks;
    }

    if (remarks !== undefined) {
      result.remarks = remarks;
    }

    await result.save();

    return res.status(200).json({
      success: true,
      message: "Marks updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update exam result error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update marks",
      error: error.message,
    });
  }
};

// DELETE MARKS
const deleteExamResult = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const result = await ExamResult.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Marks record not found",
      });
    }

    await result.destroy();

    return res.status(200).json({
      success: true,
      message: "Marks deleted successfully",
    });
  } catch (error) {
    console.error("Delete exam result error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete marks",
      error: error.message,
    });
  }
};

module.exports = {
  createExamResult,
  getExamResults,
  getResultsByExamination,
  updateExamResult,
  deleteExamResult,
};