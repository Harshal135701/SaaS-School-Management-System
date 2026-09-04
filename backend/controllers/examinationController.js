const { Examination } = require("../models");

const createExamination = async (req, res) => {
  try {
    const {
      name,
      subject,
      examDate,
      totalMarks,
      passingMarks,
      status,
      description,
    } = req.body;

    if (
      !name ||
      !subject ||
      !examDate ||
      totalMarks === undefined ||
      passingMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "name, subject, examDate, totalMarks and passingMarks are required",
      });
    }

    if (passingMarks > totalMarks) {
      return res.status(400).json({
        success: false,
        message: "Passing marks cannot be greater than total marks",
      });
    }

    const examination = await Examination.create({
      franchiseId: req.user.franchiseId,
      name,
      subject,
      examDate,
      totalMarks,
      passingMarks,
      status: status || "UPCOMING",
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Examination created successfully",
      data: examination,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getExaminations = async (req, res) => {
  try {
    const examinations = await Examination.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      order: [["examDate", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: examinations.length,
      data: examinations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getExaminationById = async (req, res) => {
  try {
    const examination = await Examination.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: examination,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateExamination = async (req, res) => {
  try {
    const {
      name,
      subject,
      examDate,
      totalMarks,
      passingMarks,
      status,
      description,
    } = req.body;

    const examination = await Examination.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    if (
      totalMarks !== undefined &&
      passingMarks !== undefined &&
      passingMarks > totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message: "Passing marks cannot be greater than total marks",
      });
    }

    await examination.update({
      ...(name !== undefined && { name }),
      ...(subject !== undefined && { subject }),
      ...(examDate !== undefined && { examDate }),
      ...(totalMarks !== undefined && { totalMarks }),
      ...(passingMarks !== undefined && { passingMarks }),
      ...(status !== undefined && { status }),
      ...(description !== undefined && { description }),
    });

    return res.status(200).json({
      success: true,
      message: "Examination updated successfully",
      data: examination,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteExamination = async (req, res) => {
  try {
    const examination = await Examination.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    await examination.destroy();

    return res.status(200).json({
      success: true,
      message: "Examination deleted successfully",
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
  createExamination,
  getExaminations,
  getExaminationById,
  updateExamination,
  deleteExamination
};