"use strict";

const express = require("express");
const router = express.Router();

const expenseCategoryController = require("../controllers/expenseCategoryController");

const franchiseAuthMiddleware = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseAuthMiddleware);

router.post("/", expenseCategoryController.createCategory);

router.get("/", expenseCategoryController.getCategories);

router.get("/:id", expenseCategoryController.getCategoryById);

router.put("/:id", expenseCategoryController.updateCategory);

router.patch(
  "/:id/toggle-status",
  expenseCategoryController.toggleCategoryStatus
);

router.delete("/:id", expenseCategoryController.deleteCategory);

module.exports = router;