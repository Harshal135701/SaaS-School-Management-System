const express = require("express");
const protect = require("../middleware/authMiddleware");


const {
  getDashboard,
} = require("../controllers/systemAdminController");


const {
  createFranchise,
  getFranchises,
  getFranchiseById,
  updateFranchiseStatus,
  createFranchiseAdmin,
} = require("../controllers/franchiseController");

const router = express.Router();

router.get("/dashboard", protect, getDashboard);
router.get("/franchises", protect, getFranchises);
router.get("/franchises/:id", protect, getFranchiseById);



router.post("/franchises", protect, createFranchise);
router.post("/franchises/:id/admin", protect, createFranchiseAdmin);





router.patch("/franchises/:id/status", protect, updateFranchiseStatus);





module.exports = router;