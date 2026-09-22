const { Class, Section, Student, SubjectRequirement } = require("../models");

const createClass = async (req, res) => {
  try {
    const {
      name,
      code,
      numericValue,
      description,
    } = req.body;


    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Class name and code are required",
      });
    }

    const existingClass = await Class.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        code: code.trim(),
      },
    });

    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: "A class with this code already exists",
      });
    }

    if (
      numericValue !== undefined &&
      numericValue !== null &&
      (!Number.isInteger(Number(numericValue)) || Number(numericValue) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Numeric value must be a positive integer",
      });
    }

    const newClass = await Class.create({
      franchiseId: req.user.franchiseId,
      name: name.trim(),
      code: code.trim(),
      numericValue:
        numericValue !== undefined && numericValue !== null
          ? Number(numericValue)
          : null,
      description: description?.trim() || null,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: newClass,
    });

  } catch (error) {
    console.error("Create Class Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Section,
          as: "sections",
          attributes: [
            "id",
            "name",
            "capacity",
            "isActive",
            "classId",
          ],
          required: false,
        },
      ],
      order: [
        ["numericValue", "ASC"],
        ["name", "ASC"],
      ],
    });
    return res.json({
      success: true,
      data: classes,
    });

  } catch (error) {
    console.error("Get Classes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};

const getClassById = async (req, res) => {
  try {
    const classData = await Class.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Section,
          as: "sections",
          attributes: [
            "id",
            "name",
            "capacity",
            "isActive",
            "classId",
          ],
          required: false,
        },
      ],
    });
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    return res.json({
      success: true,
      data: classData,
    });

  } catch (error) {
    console.error("Get Class Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateClass = async (req, res) => {
  try {
    const classData = await Class.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const {
      name,
      code,
      numericValue,
      description,
      isActive,
    } = req.body;

    if (code !== undefined) {
      const normalizedCode = code.trim();

      if (!normalizedCode) {
        return res.status(400).json({
          success: false,
          message: "Class code cannot be empty",
        });
      }

      const duplicateClass = await Class.findOne({
        where: {
          franchiseId: req.user.franchiseId,
          code: normalizedCode,
        },
      });

      if (
        duplicateClass &&
        duplicateClass.id !== classData.id
      ) {
        return res.status(409).json({
          success: false,
          message: "A class with this code already exists",
        });
      }
    }

    if (
      numericValue !== undefined &&
      numericValue !== null &&
      (!Number.isInteger(Number(numericValue)) || Number(numericValue) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Numeric value must be a positive integer",
      });
    }

    await classData.update({
      ...(name !== undefined && {
        name: name.trim(),
      }),

      ...(code !== undefined && {
        code: code.trim(),
      }),

      ...(numericValue !== undefined && {
        numericValue:
          numericValue === null || numericValue === ""
            ? null
            : Number(numericValue),
      }),

      ...(description !== undefined && {
        description: description?.trim() || null,
      }),

      ...(isActive !== undefined && {
        isActive: Boolean(isActive),
      }),
    });

    return res.json({
      success: true,
      message: "Class updated successfully",
      data: classData,
    });

  } catch (error) {
    console.error("Update Class Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};

const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const [studentCount, sectionCount, subjectRequirementCount] =
      await Promise.all([
        Student.count({
          where: {
            classId: classData.id,
          },
        }),

        Section.count({
          where: {
            classId: classData.id,
          },
        }),

        SubjectRequirement.count({
          where: {
            classId: classData.id,
          },
        }),
      ]);

    if (
      studentCount > 0 ||
      sectionCount > 0 ||
      subjectRequirementCount > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This class cannot be deleted because it is already being used. Deactivate the class instead.",
        data: {
          studentCount,
          sectionCount,
          subjectRequirementCount,
        },
      });
    }

    await classData.destroy();

    return res.json({
      success: true,
      message: "Class deleted successfully",
    });

  } catch (error) {
    console.error("Delete Class Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });


  }
};

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
};
