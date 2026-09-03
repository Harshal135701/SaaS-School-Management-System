const { Section, Class } = require("../models");

const createSection = async (req, res) => {
  try {
    const { classId, name, capacity } = req.body;

    if (!classId || !name) {
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

    const section = await Section.create({
      franchiseId: req.user.franchiseId,
      classId,
      name,
      capacity,
    });

    res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: section,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
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
          attributes: ["id", "name", "numericValue"],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
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
          attributes: ["id", "name", "numericValue"],
        },
      ],
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    res.json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
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

    if (classId) {
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
    }

    await section.update({
      classId,
      name,
      capacity,
      isActive,
    });

    res.json({
      success: true,
      message: "Section updated successfully",
      data: section,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
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

    await section.destroy();

    res.json({
      success: true,
      message: "Section deleted successfully",
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
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
};