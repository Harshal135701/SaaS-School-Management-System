const {
  SubjectRequirement,
  Class,
  Subject,
} = require("../models");

const createSubjectRequirement = async (req, res) => {
  try {
    const {
      classId,
      subjectId,
      periodsPerWeek,
    } = req.body;

    const { franchiseId } = req.user;

    // 1. Required fields
    if (!classId || !subjectId || !periodsPerWeek) {
      return res.status(400).json({
        success: false,
        message: "classId, subjectId and periodsPerWeek are required",
      });
    }

    // 2. Validate periods
    if (
      !Number.isInteger(Number(periodsPerWeek)) ||
      Number(periodsPerWeek) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "periodsPerWeek must be a positive integer",
      });
    }

    // 3. Check class
    const classRecord = await Class.findOne({
      where: {
        id: classId,
        franchiseId,
      },
    });

    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // 4. Check subject
    const subjectRecord = await Subject.findOne({
      where: {
        id: subjectId,
        franchiseId,
        isActive: true,
      },
    });

    if (!subjectRecord) {
      return res.status(404).json({
        success: false,
        message: "Subject not found or inactive",
      });
    }

    // 5. Prevent duplicate requirement
    const existing = await SubjectRequirement.findOne({
      where: {
        franchiseId,
        classId,
        subjectId,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Subject requirement already exists for this class",
      });
    }

    // 6. Create requirement
    const requirement = await SubjectRequirement.create({
      franchiseId,
      classId,
      subjectId,
      periodsPerWeek: Number(periodsPerWeek),
    });

    return res.status(201).json({
      success: true,
      message: "Subject requirement created successfully",
      data: requirement,
    });
  } catch (error) {
    console.error("Create subject requirement error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSubjectRequirements = async (req, res) => {
  try {
    const requirements = await SubjectRequirement.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Class,
          attributes: ["id", "name", "code"],
        },
        {
          model: Subject,
          attributes: ["id", "name", "code"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: requirements.length,
      data: requirements,
    });
  } catch (error) {
    console.error("Get subject requirements error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createSubjectRequirement,
  getSubjectRequirements,
};