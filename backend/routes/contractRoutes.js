const express = require("express");
const router = express.Router();

const {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  deleteContract,
} = require("../controllers/contractController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, createContract);
router.get("/", protect, getContracts);
router.get("/:id", protect, getContractById);
router.put("/:id", protect, updateContract);
router.delete("/:id", protect, deleteContract);

module.exports = router;