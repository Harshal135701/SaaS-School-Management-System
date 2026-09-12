const { FeeCategory } = require("../models");

const createFeeCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const franchiseId = req.user.franchiseId;

    const cleanName = String(name || "").trim();
    const cleanDescription =
      description !== undefined
        ? String(description).trim()
        : null;

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Fee category name is required",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Fee category name cannot exceed 100 characters",
      });
    }

    if (cleanDescription && cleanDescription.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 500 characters",
      });
    }

    const existingCategory = await FeeCategory.findOne({
      where: {
        franchiseId,
        name: cleanName,
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Fee category already exists",
      });
    }

    const category = await FeeCategory.create({
      franchiseId,
      name: cleanName,
      description: cleanDescription,
    });

    return res.status(201).json({
      success: true,
      message: "Fee category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create fee category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create fee category",
    });
  }
};

const getFeeCategories = async (req, res) => {
  try {
    const categories = await FeeCategory.findAll({
      where: {
        franchiseId: req.user.franchiseId,
        isActive: true,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get fee categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee categories",
    });
  }
};

module.exports = {
  createFeeCategory,
  getFeeCategories,
};

