"use strict";

const { ExpenseCategory, SchoolExpense } = require("../models");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const categoryName = name.trim();

    const existingCategory = await ExpenseCategory.findOne({
      where: {
        franchiseId,
        name: categoryName,
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Expense category already exists",
      });
    }

    const category = await ExpenseCategory.create({
      franchiseId,
      name: categoryName,
      description: description?.trim() || null,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Expense category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create expense category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create expense category",
    });
  }
};

// Get All Categories
exports.getCategories = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const categories = await ExpenseCategory.findAll({
      where: {
        franchiseId,
      },
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get expense categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expense categories",
    });
  }
};

// Get Single Category
exports.getCategoryById = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;

    const category = await ExpenseCategory.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Expense category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get expense category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expense category",
    });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await ExpenseCategory.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Expense category not found",
      });
    }

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }

      const categoryName = name.trim();

      const duplicate = await ExpenseCategory.findOne({
        where: {
          franchiseId,
          name: categoryName,
        },
      });

      if (duplicate && duplicate.id !== category.id) {
        return res.status(409).json({
          success: false,
          message: "Another expense category with this name already exists",
        });
      }

      category.name = categoryName;
    }

    if (description !== undefined) {
      category.description =
        description === null ? null : description.trim();
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be a boolean",
        });
      }

      category.isActive = isActive;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Expense category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update expense category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update expense category",
    });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;

    const category = await ExpenseCategory.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Expense category not found",
      });
    }

    const expenseCount = await SchoolExpense.count({
      where: {
        franchiseId,
        categoryId: id,
      },
    });

    if (expenseCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Category cannot be deleted because it is linked to existing expenses. Deactivate it instead.",
      });
    }

    await category.destroy();

    return res.status(200).json({
      success: true,
      message: "Expense category deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete expense category",
    });
  }
};

// Toggle Category Status
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;

    const category = await ExpenseCategory.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Expense category not found",
      });
    }

    category.isActive = !category.isActive;

    await category.save();

    return res.status(200).json({
      success: true,
      message: `Expense category ${
        category.isActive ? "activated" : "deactivated"
      } successfully`,
      data: category,
    });
  } catch (error) {
    console.error("Toggle expense category status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category status",
    });
  }
};