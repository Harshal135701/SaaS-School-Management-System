const { Class } = require("../models");

const createClass = async (req, res) => {
  try {
    const { name, code, numericValue, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Class name and code is required",
      });
    }

    const newClass = await Class.create({
      franchiseId: req.user.franchiseId,
      name,
      code,
      numericValue,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
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
      order: [["numericValue", "ASC"], ["name", "ASC"]],
    });

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
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
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
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

    const { name, numericValue, description, isActive } = req.body;

    await classData.update({
      name,
      numericValue,
      description,
      isActive,
    });

    res.json({
      success: true,
      message: "Class updated successfully",
      data: classData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
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

    await classData.destroy();

    res.json({
      success: true,
      message: "Class deleted successfully",
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
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
};