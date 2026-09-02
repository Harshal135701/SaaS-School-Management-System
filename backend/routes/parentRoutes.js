const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");

const {
  createParent,
  assignStudent,
  getParents,
  updateParent,
  deleteParent,
} = require("../controllers/parentController");

router.post("/", teacherOrFranchiseProtect, createParent);

router.get("/", teacherOrFranchiseProtect, getParents);

router.put("/:id", teacherOrFranchiseProtect, updateParent);

router.delete("/:id", teacherOrFranchiseProtect, deleteParent);

router.post(
  "/assign-student",
  teacherOrFranchiseProtect,
  assignStudent
);

module.exports = router;

