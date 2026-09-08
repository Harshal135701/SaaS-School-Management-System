const { FeeCategory } = require("../models");

const createFeeCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Fee category name is required",
      });
    }

    const category = await FeeCategory.create({
      franchiseId: req.user.franchiseId,
      name,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Fee category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create fee category error:", error);

    res.status(500).json({
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

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get fee categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch fee categories",
    });
  }
};

module.exports = {
  createFeeCategory,
  getFeeCategories,
};