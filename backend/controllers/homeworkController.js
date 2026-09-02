const { Homework, Teacher } = require("../models");

const createHomework = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      dueDate,
      status,
    } = req.body;

    const teacherId =
      req.user.role === "TEACHER"
        ? req.user.id
        : req.body.teacherId;

    if (!title || !subject || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "teacherId, title, subject and dueDate are required",
      });
    }

    const teacher = await Teacher.findOne({
      where: {
        id: teacherId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found in your franchise",
      });
    }

    const homework = await Homework.create({
      franchiseId: req.user.franchiseId,
      teacherId,
      title,
      description,
      subject,
      dueDate,
      status: status || "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      message: "Homework created successfully",
      data: homework,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getHomeworks = async (req, res) => {
  try {
    const { Homework, Teacher } = require("../models");

    const homeworks = await Homework.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name", "subject"],
        },
      ],
      order: [["dueDate", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: homeworks.length,
      data: homeworks,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getHomeworkById = async (req, res) => {
  try {
    const homework = await Homework.findOne({
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

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: "Homework not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: homework,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateHomework = async (req, res) => {
  try {
    const {
      teacherId,
      title,
      description,
      subject,
      dueDate,
      status,
    } = req.body;

    const homework = await Homework.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: "Homework not found",
      });
    }

    if (teacherId) {
      const teacher = await Teacher.findOne({
        where: {
          id: teacherId,
          franchiseId: req.user.franchiseId,
        },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found in your franchise",
        });
      }
    }

    await homework.update({
      teacherId,
      title,
      description,
      subject,
      dueDate,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Homework updated successfully",
      data: homework,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteHomework = async (req, res) => {
  try {
    const homework = await Homework.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: "Homework not found",
      });
    }

    await homework.destroy();

    return res.status(200).json({
      success: true,
      message: "Homework deleted successfully",
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
  createHomework, getHomeworks, getHomeworkById, updateHomework, deleteHomework
};