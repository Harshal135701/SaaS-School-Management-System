const { Subject, TeacherAssignment } = require("../models");
const { Op } = require("sequelize");

const createSubject = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const normalizedName = name?.trim();
    const normalizedCode = code?.trim().toUpperCase() || null;

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "Subject name is required",
      });
    }

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Subject name must be between 2 and 100 characters",
      });
    }

    if (normalizedCode) {
      const existing = await Subject.findOne({
        where: {
          franchiseId: req.user.franchiseId,
          code: normalizedCode,
        },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "A subject with this code already exists",
        });
      }
    }

    const subject = await Subject.create({
      franchiseId: req.user.franchiseId,
      name: normalizedName,
      code: normalizedCode,
      description: description?.trim() || null,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Create Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error("Get Subjects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    console.error("Get Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const { name, code, description, isActive } = req.body;

    const updateData = {};

    if (name !== undefined) {
      const normalizedName = name.trim();

      if (!normalizedName) {
        return res.status(400).json({
          success: false,
          message: "Subject name cannot be empty",
        });
      }

      updateData.name = normalizedName;
    }

    if (code !== undefined) {
      updateData.code = code.trim().toUpperCase() || null;
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false",
        });
      }

      updateData.isActive = isActive;
    }

    if (updateData.code) {
      const duplicate = await Subject.findOne({
        where: {
          franchiseId: req.user.franchiseId,
          code: updateData.code,
          id: { [Op.ne]: subject.id },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A subject with this code already exists",
        });
      }
    }

    await subject.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Update Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    if (!subject.isActive) {
      return res.status(400).json({
        success: false,
        message: "Subject is already inactive",
      });
    }

    await subject.update({
      isActive: false,
    });

    // Deactivate all active teacher assignments
    // linked to this subject.
    await TeacherAssignment.update(
      {
        status: "INACTIVE",
      },
      {
        where: {
          subjectId: subject.id,
          franchiseId: req.user.franchiseId,
          status: "ACTIVE",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Subject deactivated successfully and related teacher assignments were deactivated",
      data: subject,
    });
  } catch (error) {
    console.error("Delete Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};