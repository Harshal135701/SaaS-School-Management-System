const { Section, Class, Student } = require("../models");

const createSection = async (req, res) => {
  try {
    const { classId, name, capacity } = req.body;


    if (!classId || !name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Class and section name are required",
      });
    }

    const classData = await Class.findOne({
      where: {
        id: classId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    if (!classData.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot create a section under an inactive class",
      });
    }

    const sectionCapacity =
      capacity === undefined || capacity === null || capacity === ""
        ? null
        : Number(capacity);

    if (
      sectionCapacity !== null &&
      (!Number.isInteger(sectionCapacity) || sectionCapacity <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive integer",
      });
    }

    const existingSection = await Section.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        classId,
        name: name.trim(),
      },
    });

    if (existingSection) {
      return res.status(409).json({
        success: false,
        message: "A section with this name already exists in this class",
      });
    }

    const section = await Section.create({
      franchiseId: req.user.franchiseId,
      classId,
      name: name.trim(),
      capacity: sectionCapacity,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: section,
    });


  } catch (error) {
    console.error("Create Section Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};

const getSections = async (req, res) => {
  try {
    const where = {
      franchiseId: req.user.franchiseId,
    };

    if (req.query.classId) {
      where.classId = req.query.classId;
    }

    const sections = await Section.findAll({
      where,
      include: [
        {
          model: Class,
          as: "class",
          attributes: ["id", "name", "numericValue", "isActive"],
        },
      ],
      order: [["name", "ASC"]],
    });

    return res.json({
      success: true,
      data: sections,
    });

  } catch (error) {
    console.error("Get Sections Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};

const getSectionById = async (req, res) => {
  try {
    const section = await Section.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Class,
          as: "class",
          attributes: ["id", "name", "numericValue", "isActive"],
        },
      ],
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    return res.json({
      success: true,
      data: section,
    });

  } catch (error) {
    console.error("Get Section Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};

const updateSection = async (req, res) => {
  try {
    const section = await Section.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const { classId, name, capacity, isActive } = req.body;

    const finalClassId = classId ?? section.classId;

    const classData = await Class.findOne({
      where: {
        id: finalClassId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    if (!classData.isActive && isActive === true) {
      return res.status(400).json({
        success: false,
        message: "Cannot activate a section under an inactive class",
      });
    }

    const finalName =
      name !== undefined ? name.trim() : section.name;

    if (!finalName) {
      return res.status(400).json({
        success: false,
        message: "Section name cannot be empty",
      });
    }

    const finalCapacity =
      capacity !== undefined
        ? capacity === null || capacity === ""
          ? null
          : Number(capacity)
        : section.capacity;

    if (
      finalCapacity !== null &&
      (!Number.isInteger(finalCapacity) || finalCapacity <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive integer",
      });
    }

    const duplicateSection = await Section.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        classId: finalClassId,
        name: finalName,
      },
    });

    if (
      duplicateSection &&
      duplicateSection.id !== section.id
    ) {
      return res.status(409).json({
        success: false,
        message: "A section with this name already exists in this class",
      });
    }

    if (finalCapacity !== null) {
      const studentCount = await Student.count({
        where: {
          sectionId: section.id,
        },
      });

      if (finalCapacity < studentCount) {
        return res.status(400).json({
          success: false,
          message: `Capacity cannot be less than the current student count (${studentCount})`,
        });
      }
    }

    await section.update({
      classId: finalClassId,
      name: finalName,
      capacity: finalCapacity,
      ...(isActive !== undefined && {
        isActive: Boolean(isActive),
      }),
    });

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: section,
    });

  } catch (error) {
    console.error("Update Section Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};

const deleteSection = async (req, res) => {
  try {
    const section = await Section.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const studentCount = await Student.count({
      where: {
        sectionId: section.id,
      },
    });

    if (studentCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This section cannot be deleted because students are assigned to it. Deactivate the section instead.",
        data: {
          studentCount,
        },
      });
    }

    await section.destroy();

    return res.json({
      success: true,
      message: "Section deleted successfully",
    });

  } catch (error) {
    console.error("Delete Section Error:", error);


    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });


  }
};

module.exports = {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
};
