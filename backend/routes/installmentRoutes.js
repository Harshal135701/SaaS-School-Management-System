const express = require("express");
const router = express.Router();

const {
  createInstallment,
  getInstallments,
  updateInstallment,
  deleteInstallment,
} = require("../controllers/installmentController");


const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.get("/", getInstallments);

router.post("/", createInstallment);

router.put("/:id", updateInstallment);

router.delete("/:id", deleteInstallment);

module.exports = router;