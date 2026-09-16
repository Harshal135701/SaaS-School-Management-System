const { Notice } = require("../models");

const TARGET_AUDIENCES = [
  "ALL",
  "TEACHERS",
  "STUDENTS",
  "PARENTS",
];

const PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

const createNotice = async (req, res) => {
  try {
    const {
      title,
      content,
      targetAudience,
      priority,
      expiryDate,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    if (!TARGET_AUDIENCES.includes(targetAudience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target audience",
      });
    }

    if (priority && !PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }

    if (expiryDate && Number.isNaN(Date.parse(expiryDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry date",
      });
    }

    const notice = await Notice.create({
      franchiseId: req.user.franchiseId,
      title: title.trim(),
      content: content.trim(),
      targetAudience,
      priority: priority || "MEDIUM",
      expiryDate: expiryDate || null,
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully",
      data: notice,
    });
  } catch (error) {
    console.error("Create notice error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notice",
    });
  }
};

const getNotices = async (req, res) => {
  try {
    const notices = await Notice.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: notices,
    });
  } catch (error) {
    console.error("Get notices error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
    });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findOne({
      where: {
        id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    await notice.destroy();

    return res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete notice error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notice",
    });
  }
};

module.exports = {
  createNotice,
  getNotices,
  deleteNotice,
};