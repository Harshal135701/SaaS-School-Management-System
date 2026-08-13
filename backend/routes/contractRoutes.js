const express = require("express");
const router = express.Router();

const {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  renewContract,
  deleteContract,
} = require("../controllers/contractController");

const protect = require("../middleware/authMiddleware");


router.put("/:id/renew", protect, renewContract);


router.get("/", protect, getContracts);
router.get("/:id", protect, getContractById);

router.post("/", protect, createContract);


router.put("/:id", protect, updateContract);


router.delete("/:id", protect, deleteContract);

module.exports = router;