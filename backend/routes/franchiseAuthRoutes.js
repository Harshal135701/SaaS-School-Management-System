const express = require("express");

const router = express.Router();

const { login } = require("../controllers/franchiseAuthController");
const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.post("/login", login);

router.get("/me", franchiseProtect, (req, res) => {
  res.status(200).json({
    success: true,
    admin: req.user,
  });
});

module.exports = router;